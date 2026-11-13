using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Cvikarna.Api.Contracts;
using Cvikarna.Api.Data;
using Cvikarna.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Cvikarna.Api.Tests;

public class WorkoutApiTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    [Fact]
    public async Task Post_workouts_opens_today_once()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var first = await client.PostAsync("/api/workouts", null);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var opened = await first.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(opened);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Now).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), opened.PerformedOn);

        var second = await client.PostAsync("/api/workouts", null);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        var again = await second.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(again);
        Assert.Equal(opened.Id, again.Id);
    }

    [Fact]
    public async Task Workout_detail_carries_exercises_and_sets_in_order()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);

        var bench = await AddExerciseAsync(client, workout.Id, 1);
        var fly = await AddExerciseAsync(client, workout.Id, 6);
        Assert.Equal(1, bench.Position);
        Assert.Equal(2, fly.Position);
        Assert.True(bench.IsLibrary);

        var catalogue = await client.GetFromJsonAsync<CataloguePageDto>(
            $"/api/catalogue?q={Uri.EscapeDataString("box squat")}",
            Json);
        Assert.NotNull(catalogue);
        var thin = catalogue.Items.First(row => !row.IsLibrary);
        var thinItem = await AddExerciseAsync(client, workout.Id, thin.Id);
        Assert.False(thinItem.IsLibrary);

        await AddSetAsync(client, workout.Id, bench.Id, 80m, 5, 8m);
        await AddSetAsync(client, workout.Id, bench.Id, 82.5m, 5, 9m);

        var detail = await client.GetFromJsonAsync<WorkoutDto>($"/api/workouts/{workout.Id}", Json);
        Assert.NotNull(detail);
        Assert.Equal(3, detail.Exercises.Count);
        Assert.Equal("Barbell Bench Press", detail.Exercises[0].NameEn);
        Assert.Equal(2, detail.Exercises[0].Sets.Count);
        Assert.Equal(80m, detail.Exercises[0].Sets[0].WeightKg);
        Assert.Equal(82.5m, detail.Exercises[0].Sets[1].WeightKg);
        Assert.Empty(detail.Exercises[1].Sets);
        Assert.False(detail.Exercises[2].IsLibrary);
    }

    [Fact]
    public async Task Concurrent_workout_opens_create_one_row()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var responses = await Task.WhenAll(
            client.PostAsync("/api/workouts", null),
            client.PostAsync("/api/workouts", null));

        Assert.All(responses, response =>
            Assert.True(response.StatusCode is HttpStatusCode.OK or HttpStatusCode.Created));

        var ids = new List<int>();
        foreach (var response in responses)
        {
            var workout = await response.Content.ReadFromJsonAsync<WorkoutDto>(Json);
            Assert.NotNull(workout);
            ids.Add(workout.Id);
        }

        Assert.Single(ids.Distinct());

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(1, await db.Workouts.CountAsync());
    }

    [Fact]
    public async Task Adding_an_unknown_exercise_is_a_field_error()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);

        var response = await client.PostAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises",
            new { exerciseId = 999999 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
        Assert.NotNull(problem);
        Assert.True(problem.Errors.ContainsKey("exerciseId"));

        var missingWorkout = await client.PostAsJsonAsync(
            "/api/workouts/999999/exercises",
            new { exerciseId = 1 });
        Assert.Equal(HttpStatusCode.NotFound, missingWorkout.StatusCode);
    }

    [Fact]
    public async Task A_set_with_bad_fields_names_each_field()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var item = await AddExerciseAsync(client, workout.Id, 1);

        var cases = new[]
        {
            (Body: new { weightKg = -5, reps = 5, rpe = 8, notes = (string?)null }, Field: "weightKg"),
            (Body: new { weightKg = 80, reps = 0, rpe = 8, notes = (string?)null }, Field: "reps"),
            (Body: new { weightKg = 80, reps = 101, rpe = 8, notes = (string?)null }, Field: "reps"),
            (Body: new { weightKg = 80, reps = 5, rpe = 11, notes = (string?)null }, Field: "rpe"),
            (Body: new { weightKg = 80, reps = 5, rpe = 8, notes = (string?)new string('x', 301) }, Field: "notes"),
        };

        foreach (var testCase in cases)
        {
            var response = await client.PostAsJsonAsync(
                $"/api/workouts/{workout.Id}/exercises/{item.Id}/sets",
                testCase.Body);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
            Assert.NotNull(problem);
            Assert.True(problem.Errors.ContainsKey(testCase.Field), $"missing error for {testCase.Field}");
        }

        var valid = await AddSetAsync(client, workout.Id, item.Id, 0m, 12, null);
        Assert.Equal(0m, valid.WeightKg);
    }

    [Fact]
    public async Task A_set_cannot_be_written_through_another_workout()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var today = await OpenWorkoutAsync(client);

        int foreignItemId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var other = new Workout { PerformedOn = DateOnly.FromDateTime(DateTime.Now).AddDays(-1) };
            db.Workouts.Add(other);
            await db.SaveChangesAsync();

            var item = new WorkoutExercise { WorkoutId = other.Id, ExerciseId = 1, Position = 1 };
            db.WorkoutExercises.Add(item);
            await db.SaveChangesAsync();
            foreignItemId = item.Id;
        }

        var response = await client.PostAsJsonAsync(
            $"/api/workouts/{today.Id}/exercises/{foreignItemId}/sets",
            new { weightKg = 60, reps = 5, rpe = 7 });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Deleting_an_exercise_deletes_its_sets()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var item = await AddExerciseAsync(client, workout.Id, 1);
        await AddSetAsync(client, workout.Id, item.Id, 80m, 5, 8m);

        var delete = await client.DeleteAsync($"/api/workouts/{workout.Id}/exercises/{item.Id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var deleteAgain = await client.DeleteAsync($"/api/workouts/{workout.Id}/exercises/{item.Id}");
        Assert.Equal(HttpStatusCode.NotFound, deleteAgain.StatusCode);

        var detail = await client.GetFromJsonAsync<WorkoutDto>($"/api/workouts/{workout.Id}", Json);
        Assert.NotNull(detail);
        Assert.Empty(detail.Exercises);

        var recent = await client.GetFromJsonAsync<List<RecentSetDto>>("/api/sets?exerciseId=1", Json);
        Assert.NotNull(recent);
        Assert.Empty(recent);
    }

    [Fact]
    public async Task Recent_sets_are_newest_first_and_limited()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var bench = await AddExerciseAsync(client, workout.Id, 1);
        var row = await AddExerciseAsync(client, workout.Id, 11);

        await AddSetAsync(client, workout.Id, bench.Id, 80m, 5, 8m);
        var lastBench = await AddSetAsync(client, workout.Id, bench.Id, 82.5m, 5, 9m);
        await AddSetAsync(client, workout.Id, row.Id, 30m, 10, 7m);

        var newestBench = await client.GetFromJsonAsync<List<RecentSetDto>>("/api/sets?exerciseId=1&take=1", Json);
        Assert.NotNull(newestBench);
        var newest = Assert.Single(newestBench);
        Assert.Equal(lastBench.Id, newest.Id);
        Assert.Equal("Barbell Bench Press", newest.NameEn);

        var all = await client.GetFromJsonAsync<List<RecentSetDto>>("/api/sets?take=10", Json);
        Assert.NotNull(all);
        Assert.Equal(3, all.Count);
        Assert.True(all[0].Id > all[1].Id);
        Assert.True(all[1].Id > all[2].Id);
    }

    [Fact]
    public async Task Deleting_a_set_answers_204_then_404()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var item = await AddExerciseAsync(client, workout.Id, 1);
        var set = await AddSetAsync(client, workout.Id, item.Id, 80m, 5, 8m);

        var delete = await client.DeleteAsync($"/api/sets/{set.Id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var again = await client.DeleteAsync($"/api/sets/{set.Id}");
        Assert.Equal(HttpStatusCode.NotFound, again.StatusCode);
        Assert.Equal("application/problem+json", again.Content.Headers.ContentType?.MediaType);

        var missingWorkout = await client.GetAsync("/api/workouts/999999");
        Assert.Equal(HttpStatusCode.NotFound, missingWorkout.StatusCode);
    }

    [Fact]
    public async Task Month_list_returns_only_that_month_in_date_order()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        await SeedHistoryAsync(factory);

        var summaries = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts?month=2026-05", Json);

        Assert.NotNull(summaries);
        Assert.Equal(
            ["2026-05-04", "2026-05-12", "2026-05-20"],
            summaries.Select(row => row.PerformedOn).ToArray());
    }

    [Fact]
    public async Task All_workouts_list_is_newest_first()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        await SeedHistoryAsync(factory);

        var summaries = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts", Json);

        Assert.NotNull(summaries);
        Assert.Equal(
            ["2026-06-02", "2026-05-20", "2026-05-12", "2026-05-04", "2026-04-30"],
            summaries.Select(row => row.PerformedOn).ToArray());
    }

    [Fact]
    public async Task A_summary_counts_exercises_sets_and_volume()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        await SeedHistoryAsync(factory);

        var summaries = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts?month=2026-05", Json);
        Assert.NotNull(summaries);

        var may4 = Assert.Single(summaries, row => row.PerformedOn == "2026-05-04");
        Assert.Equal(2, may4.ExerciseCount);
        Assert.Equal(3, may4.SetCount);
        Assert.Equal(812.5m, may4.TotalVolumeKg);

        var may12 = Assert.Single(summaries, row => row.PerformedOn == "2026-05-12");
        Assert.Equal(1, may12.ExerciseCount);
        Assert.Equal(0, may12.SetCount);
        Assert.Equal(0m, may12.TotalVolumeKg);
    }

    [Fact]
    public async Task By_date_returns_the_full_workout()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        await SeedHistoryAsync(factory);

        var workout = await client.GetFromJsonAsync<WorkoutDto>("/api/workouts/by-date/2026-05-04", Json);

        Assert.NotNull(workout);
        Assert.Equal("2026-05-04", workout.PerformedOn);
        Assert.Equal(2, workout.Exercises.Count);
        Assert.Equal("Barbell Bench Press", workout.Exercises[0].NameEn);
        Assert.Equal(2, workout.Exercises[0].Sets.Count);
        Assert.Equal(80m, workout.Exercises[0].Sets[0].WeightKg);
        Assert.Equal(0m, workout.Exercises[1].Sets[0].WeightKg);
    }

    [Fact]
    public async Task By_date_answers_404_for_a_day_without_a_workout()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        await SeedHistoryAsync(factory);

        var response = await client.GetAsync("/api/workouts/by-date/2026-05-05");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task A_bad_month_and_a_bad_date_name_the_field()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var badMonth = await client.GetAsync("/api/workouts?month=2026-5");
        Assert.Equal(HttpStatusCode.BadRequest, badMonth.StatusCode);
        var monthProblem = await badMonth.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
        Assert.NotNull(monthProblem);
        Assert.True(monthProblem.Errors.ContainsKey("month"));

        var badDate = await client.GetAsync("/api/workouts/by-date/2026-13-01");
        Assert.Equal(HttpStatusCode.BadRequest, badDate.StatusCode);
        var dateProblem = await badDate.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
        Assert.NotNull(dateProblem);
        Assert.True(dateProblem.Errors.ContainsKey("date"));
    }

    private static async Task SeedHistoryAsync(ApiFactory factory)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var april = new Workout { PerformedOn = new DateOnly(2026, 4, 30) };
        var may4 = new Workout { PerformedOn = new DateOnly(2026, 5, 4) };
        var may12 = new Workout { PerformedOn = new DateOnly(2026, 5, 12) };
        var may20 = new Workout { PerformedOn = new DateOnly(2026, 5, 20) };
        var june = new Workout { PerformedOn = new DateOnly(2026, 6, 2) };
        db.Workouts.AddRange(april, may4, may12, may20, june);
        await db.SaveChangesAsync();

        var bench = new WorkoutExercise { WorkoutId = may4.Id, ExerciseId = 1, Position = 1 };
        bench.Sets.Add(new LoggedSet { WeightKg = 80m, Reps = 5 });
        bench.Sets.Add(new LoggedSet { WeightKg = 82.5m, Reps = 5 });
        var fly = new WorkoutExercise { WorkoutId = may4.Id, ExerciseId = 6, Position = 2 };
        fly.Sets.Add(new LoggedSet { WeightKg = 0m, Reps = 12 });
        db.WorkoutExercises.AddRange(bench, fly);
        db.WorkoutExercises.Add(new WorkoutExercise { WorkoutId = may12.Id, ExerciseId = 1, Position = 1 });

        await db.SaveChangesAsync();
    }

    private static async Task<WorkoutDto> OpenWorkoutAsync(HttpClient client)
    {
        var response = await client.PostAsync("/api/workouts", null);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<WorkoutDto>(Json))!;
    }

    private static async Task<WorkoutExerciseDto> AddExerciseAsync(HttpClient client, int workoutId, int exerciseId)
    {
        var response = await client.PostAsJsonAsync(
            $"/api/workouts/{workoutId}/exercises",
            new { exerciseId });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<WorkoutExerciseDto>(Json))!;
    }

    private static async Task<LoggedSetDto> AddSetAsync(
        HttpClient client,
        int workoutId,
        int itemId,
        decimal weightKg,
        int reps,
        decimal? rpe)
    {
        var response = await client.PostAsJsonAsync(
            $"/api/workouts/{workoutId}/exercises/{itemId}/sets",
            new { weightKg, reps, rpe });
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<LoggedSetDto>(Json))!;
    }
}
