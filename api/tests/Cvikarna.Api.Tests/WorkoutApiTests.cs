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
    public async Task A_workout_with_no_exercises_is_not_listed_or_served_by_date()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var empty = await OpenWorkoutAsync(client);

        var all = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts", Json);
        Assert.NotNull(all);
        Assert.Empty(all);

        var month = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>(
            $"/api/workouts?month={DateTime.Now.ToString("yyyy-MM", CultureInfo.InvariantCulture)}",
            Json);
        Assert.NotNull(month);
        Assert.Empty(month);

        var byDate = await client.GetAsync($"/api/workouts/by-date/{empty.PerformedOn}");
        Assert.Equal(HttpStatusCode.NotFound, byDate.StatusCode);

        // Adding one movement makes the same row count again.
        await AddExerciseAsync(client, empty.Id, 1);
        var after = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts", Json);
        Assert.NotNull(after);
        var listed = Assert.Single(after);
        Assert.Equal(empty.PerformedOn, listed.PerformedOn);
        Assert.Equal(1, listed.ExerciseCount);
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

    [Fact]
    public async Task Sets_can_be_reordered_and_the_order_survives_a_reload()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var item = await AddExerciseAsync(client, workout.Id, 1);

        var first = await AddSetAsync(client, workout.Id, item.Id, 80m, 5, 8m);
        var second = await AddSetAsync(client, workout.Id, item.Id, 82.5m, 5, 9m);

        var response = await client.PutAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/{item.Id}/sets/order",
            new { setIds = new[] { second.Id, first.Id } });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var detail = await client.GetFromJsonAsync<WorkoutDto>($"/api/workouts/{workout.Id}", Json);
        Assert.NotNull(detail);
        var sets = detail.Exercises.Single().Sets;
        Assert.Equal([second.Id, first.Id], sets.Select(set => set.Id).ToArray());
        Assert.Equal(82.5m, sets[0].WeightKg);
    }

    [Fact]
    public async Task Reordering_every_set_rewrites_positions_to_one_to_n()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var item = await AddExerciseAsync(client, workout.Id, 1);

        var first = await AddSetAsync(client, workout.Id, item.Id, 70m, 8, null);
        var second = await AddSetAsync(client, workout.Id, item.Id, 75m, 6, null);
        var third = await AddSetAsync(client, workout.Id, item.Id, 80m, 4, null);

        var response = await client.PutAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/{item.Id}/sets/order",
            new { setIds = new[] { third.Id, first.Id, second.Id } });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var positions = await db.LoggedSets
            .Where(set => set.WorkoutExerciseId == item.Id)
            .OrderBy(set => set.Position)
            .Select(set => new { set.Id, set.Position })
            .ToListAsync();

        Assert.Equal([1, 2, 3], positions.Select(row => row.Position).ToArray());
        Assert.Equal([third.Id, first.Id, second.Id], positions.Select(row => row.Id).ToArray());

        var detail = await client.GetFromJsonAsync<WorkoutDto>($"/api/workouts/{workout.Id}", Json);
        Assert.NotNull(detail);
        Assert.Equal(
            [third.Id, first.Id, second.Id],
            detail.Exercises.Single().Sets.Select(set => set.Id).ToArray());
    }

    [Fact]
    public async Task Reorder_rejects_a_foreign_set_id()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var bench = await AddExerciseAsync(client, workout.Id, 1);
        var row = await AddExerciseAsync(client, workout.Id, 11);

        var benchFirst = await AddSetAsync(client, workout.Id, bench.Id, 80m, 5, null);
        var benchSecond = await AddSetAsync(client, workout.Id, bench.Id, 82.5m, 5, null);
        var foreign = await AddSetAsync(client, workout.Id, row.Id, 30m, 10, null);

        var response = await client.PutAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/{bench.Id}/sets/order",
            new { setIds = new[] { benchSecond.Id, foreign.Id } });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
        Assert.NotNull(problem);
        Assert.True(problem.Errors.ContainsKey("setIds"));

        // The rejected call changed nothing.
        var detail = await client.GetFromJsonAsync<WorkoutDto>($"/api/workouts/{workout.Id}", Json);
        Assert.NotNull(detail);
        Assert.Equal(
            [benchFirst.Id, benchSecond.Id],
            detail.Exercises[0].Sets.Select(set => set.Id).ToArray());
    }

    [Fact]
    public async Task Reorder_rejects_a_partial_list()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var item = await AddExerciseAsync(client, workout.Id, 1);

        var first = await AddSetAsync(client, workout.Id, item.Id, 80m, 5, null);
        await AddSetAsync(client, workout.Id, item.Id, 82.5m, 5, null);

        var response = await client.PutAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/{item.Id}/sets/order",
            new { setIds = new[] { first.Id } });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Reorder_answers_404_for_a_wrong_item_or_workout()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var item = await AddExerciseAsync(client, workout.Id, 1);
        await AddSetAsync(client, workout.Id, item.Id, 80m, 5, null);

        var wrongWorkout = await client.PutAsJsonAsync(
            $"/api/workouts/999999/exercises/{item.Id}/sets/order",
            new { setIds = Array.Empty<int>() });
        Assert.Equal(HttpStatusCode.NotFound, wrongWorkout.StatusCode);

        var wrongItem = await client.PutAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/999999/sets/order",
            new { setIds = Array.Empty<int>() });
        Assert.Equal(HttpStatusCode.NotFound, wrongItem.StatusCode);
        Assert.Equal("application/problem+json", wrongItem.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Workout_exercises_can_be_reordered_and_the_order_survives_a_reload()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var bench = await AddExerciseAsync(client, workout.Id, 1);
        var fly = await AddExerciseAsync(client, workout.Id, 6);
        var row = await AddExerciseAsync(client, workout.Id, 11);

        var response = await client.PutAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/order",
            new { itemIds = new[] { row.Id, bench.Id, fly.Id } });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var detail = await client.GetFromJsonAsync<WorkoutDto>($"/api/workouts/{workout.Id}", Json);
        Assert.NotNull(detail);
        Assert.Equal(
            ["Seated Cable Row", "Barbell Bench Press", "Dumbbell Fly"],
            detail.Exercises.Select(item => item.NameEn).ToArray());
        Assert.Equal([1, 2, 3], detail.Exercises.Select(item => item.Position).ToArray());

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var positions = await db.WorkoutExercises
            .Where(item => item.WorkoutId == workout.Id)
            .OrderBy(item => item.Position)
            .Select(item => item.Position)
            .ToListAsync();
        Assert.Equal([1, 2, 3], positions);
    }

    [Fact]
    public async Task Exercise_reorder_rejects_a_partial_or_foreign_list()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var bench = await AddExerciseAsync(client, workout.Id, 1);
        var fly = await AddExerciseAsync(client, workout.Id, 6);

        var partial = await client.PutAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/order",
            new { itemIds = new[] { bench.Id } });
        Assert.Equal(HttpStatusCode.BadRequest, partial.StatusCode);
        var partialProblem = await partial.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
        Assert.NotNull(partialProblem);
        Assert.True(partialProblem.Errors.ContainsKey("itemIds"));

        var foreign = await client.PutAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/order",
            new { itemIds = new[] { bench.Id, 999999 } });
        Assert.Equal(HttpStatusCode.BadRequest, foreign.StatusCode);

        var missingWorkout = await client.PutAsJsonAsync(
            "/api/workouts/999999/exercises/order",
            new { itemIds = new[] { bench.Id, fly.Id } });
        Assert.Equal(HttpStatusCode.NotFound, missingWorkout.StatusCode);
        Assert.Equal("application/problem+json", missingWorkout.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Workout_name_is_set_renamed_and_cleared()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var item = await AddExerciseAsync(client, workout.Id, 1);
        await AddSetAsync(client, workout.Id, item.Id, 80m, 5, 8m);

        Assert.Null(workout.Name);

        var set = await client.PatchAsJsonAsync(
            $"/api/workouts/{workout.Id}",
            new { name = "  Push day  " });
        Assert.Equal(HttpStatusCode.OK, set.StatusCode);
        var named = await set.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(named);
        Assert.Equal("Push day", named.Name);

        var renamed = await client.PatchAsJsonAsync(
            $"/api/workouts/{workout.Id}",
            new { name = "Pull day" });
        Assert.Equal(HttpStatusCode.OK, renamed.StatusCode);
        var afterRename = await renamed.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(afterRename);
        Assert.Equal("Pull day", afterRename.Name);

        // The full workout and the calendar summary read the same name.
        var byDate = await client.GetFromJsonAsync<WorkoutDto>($"/api/workouts/by-date/{workout.PerformedOn}", Json);
        Assert.NotNull(byDate);
        Assert.Equal("Pull day", byDate.Name);

        var summaries = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts", Json);
        Assert.NotNull(summaries);
        Assert.Equal("Pull day", Assert.Single(summaries).Name);

        var tooLong = await client.PatchAsJsonAsync(
            $"/api/workouts/{workout.Id}",
            new { name = new string('x', 81) });
        Assert.Equal(HttpStatusCode.BadRequest, tooLong.StatusCode);
        var problem = await tooLong.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
        Assert.NotNull(problem);
        Assert.True(problem.Errors.ContainsKey("name"));

        var cleared = await client.PatchAsJsonAsync(
            $"/api/workouts/{workout.Id}",
            new { name = "   " });
        Assert.Equal(HttpStatusCode.OK, cleared.StatusCode);
        var afterClear = await cleared.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(afterClear);
        Assert.Null(afterClear.Name);

        var missing = await client.PatchAsJsonAsync(
            "/api/workouts/999999",
            new { name = "Nowhere" });
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        Assert.Equal("application/problem+json", missing.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Copying_a_workout_copies_exercises_sets_and_order()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var sourceId = await SeedCopySourceAsync(factory);
        var target = await OpenWorkoutAsync(client);

        var response = await client.PostAsJsonAsync(
            $"/api/workouts/{target.Id}/copy",
            new { sourceWorkoutId = sourceId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var copied = await response.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(copied);
        Assert.Equal("Leg day", copied.Name);
        Assert.Equal([1, 2], copied.Exercises.Select(item => item.Position).ToArray());
        Assert.Equal([1, 11], copied.Exercises.Select(item => item.ExerciseId).ToArray());

        var squat = copied.Exercises[0];
        Assert.Equal(2, squat.Sets.Count);
        Assert.Equal([100m, 110m], squat.Sets.Select(set => set.WeightKg).ToArray());
        Assert.Equal([5, 3], squat.Sets.Select(set => set.Reps).ToArray());
        Assert.Equal([8m, 9m], squat.Sets.Select(set => set.Rpe).ToArray());
        Assert.Equal("belt on", squat.Sets[0].Notes);
        Assert.Null(squat.Sets[1].Notes);

        var press = copied.Exercises[1];
        Assert.Single(press.Sets);
        Assert.Equal(60m, press.Sets[0].WeightKg);
    }

    [Fact]
    public async Task A_second_copy_appends_and_never_overwrites_the_target_name()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var sourceId = await SeedCopySourceAsync(factory);
        var target = await OpenWorkoutAsync(client);

        await client.PatchAsJsonAsync($"/api/workouts/{target.Id}", new { name = "Morning" });

        var first = await client.PostAsJsonAsync(
            $"/api/workouts/{target.Id}/copy",
            new { sourceWorkoutId = sourceId });
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        var once = await first.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(once);
        Assert.Equal("Morning", once.Name);

        var second = await client.PostAsJsonAsync(
            $"/api/workouts/{target.Id}/copy",
            new { sourceWorkoutId = sourceId });
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        var twice = await second.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(twice);
        Assert.Equal("Morning", twice.Name);
        Assert.Equal(4, twice.Exercises.Count);
        Assert.Equal([1, 2, 3, 4], twice.Exercises.Select(item => item.Position).ToArray());
        Assert.Equal([1, 11, 1, 11], twice.Exercises.Select(item => item.ExerciseId).ToArray());
        Assert.Equal(6, twice.Exercises.Sum(item => item.Sets.Count));
    }

    [Fact]
    public async Task Copy_rejects_self_an_empty_or_missing_source_and_a_missing_target()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var target = await OpenWorkoutAsync(client);
        var emptySourceId = await SeedEmptyWorkoutAsync(factory, new DateOnly(2026, 3, 1));

        var self = await client.PostAsJsonAsync(
            $"/api/workouts/{target.Id}/copy",
            new { sourceWorkoutId = target.Id });
        Assert.Equal(HttpStatusCode.BadRequest, self.StatusCode);
        var selfProblem = await self.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
        Assert.NotNull(selfProblem);
        Assert.True(selfProblem.Errors.ContainsKey("sourceWorkoutId"));

        var empty = await client.PostAsJsonAsync(
            $"/api/workouts/{target.Id}/copy",
            new { sourceWorkoutId = emptySourceId });
        Assert.Equal(HttpStatusCode.BadRequest, empty.StatusCode);
        var emptyProblem = await empty.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
        Assert.NotNull(emptyProblem);
        Assert.True(emptyProblem.Errors.ContainsKey("sourceWorkoutId"));

        var missingSource = await client.PostAsJsonAsync(
            $"/api/workouts/{target.Id}/copy",
            new { sourceWorkoutId = 999999 });
        Assert.Equal(HttpStatusCode.NotFound, missingSource.StatusCode);

        var missingTarget = await client.PostAsJsonAsync(
            "/api/workouts/999999/copy",
            new { sourceWorkoutId = emptySourceId });
        Assert.Equal(HttpStatusCode.NotFound, missingTarget.StatusCode);
        Assert.Equal("application/problem+json", missingTarget.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Workout_list_take_and_exclude_filter_the_newest_rows()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        await SeedHistoryAsync(factory);

        int juneId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            juneId = await db.Workouts
                .Where(workout => workout.PerformedOn == new DateOnly(2026, 6, 2))
                .Select(workout => workout.Id)
                .SingleAsync();
        }

        var newestTwo = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts?take=2", Json);
        Assert.NotNull(newestTwo);
        Assert.Equal(["2026-06-02", "2026-05-20"], newestTwo.Select(row => row.PerformedOn).ToArray());

        // Today's empty row is excluded, and the newest row drops out too.
        var skipped = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>(
            $"/api/workouts?take=2&excludeId={juneId}",
            Json);
        Assert.NotNull(skipped);
        Assert.Equal(["2026-05-20", "2026-05-12"], skipped.Select(row => row.PerformedOn).ToArray());

        // An oversized take is clamped instead of failing.
        var clamped = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts?take=999", Json);
        Assert.NotNull(clamped);
        Assert.Equal(5, clamped.Count);
    }

    private static async Task<int> SeedCopySourceAsync(ApiFactory factory)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var source = new Workout
        {
            PerformedOn = new DateOnly(2026, 3, 2),
            Name = "Leg day",
        };

        var squat = new WorkoutExercise { ExerciseId = 1, Position = 1 };
        squat.Sets.Add(new LoggedSet
        {
            Position = 1,
            WeightKg = 100m,
            Reps = 5,
            Rpe = 8m,
            Notes = "belt on",
        });
        squat.Sets.Add(new LoggedSet
        {
            Position = 2,
            WeightKg = 110m,
            Reps = 3,
            Rpe = 9m,
        });

        var press = new WorkoutExercise { ExerciseId = 11, Position = 2 };
        press.Sets.Add(new LoggedSet
        {
            Position = 1,
            WeightKg = 60m,
            Reps = 10,
            Rpe = 7m,
        });

        source.Exercises.Add(squat);
        source.Exercises.Add(press);
        db.Workouts.Add(source);
        await db.SaveChangesAsync();
        return source.Id;
    }

    private static async Task<int> SeedEmptyWorkoutAsync(ApiFactory factory, DateOnly performedOn)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var workout = new Workout { PerformedOn = performedOn };
        db.Workouts.Add(workout);
        await db.SaveChangesAsync();
        return workout.Id;
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
        db.WorkoutExercises.AddRange(
            new WorkoutExercise { WorkoutId = april.Id, ExerciseId = 1, Position = 1 },
            new WorkoutExercise { WorkoutId = may20.Id, ExerciseId = 1, Position = 1 },
            new WorkoutExercise { WorkoutId = june.Id, ExerciseId = 1, Position = 1 });

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
