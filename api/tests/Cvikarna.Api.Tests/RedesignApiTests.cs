using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Cvikarna.Api.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace Cvikarna.Api.Tests;

/// <summary>The endpoints the redesigned client relies on beyond the first release.</summary>
public class RedesignApiTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    [Fact]
    public async Task A_catalogue_row_can_join_the_library_and_leave_it_again()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var catalogue = await client.GetFromJsonAsync<CataloguePageDto>(
            $"/api/catalogue?q={Uri.EscapeDataString("box squat")}",
            Json);
        Assert.NotNull(catalogue);
        var thin = catalogue.Items.First(row => !row.IsLibrary && row.Id >= 1000);
        Assert.Equal(2, thin.Images.Count);
        Assert.EndsWith("/0.jpg", thin.Images[0]);

        var saved = await client.PutAsync($"/api/library/{thin.Id}", null);
        Assert.Equal(HttpStatusCode.NoContent, saved.StatusCode);

        var library = await client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises", Json);
        Assert.NotNull(library);
        Assert.Single(library);
        var promoted = Assert.Single(library, row => row.Id == thin.Id);
        Assert.Equal(2, promoted.Images.Count);
        Assert.Empty(promoted.InstructionsEn);

        var removed = await client.DeleteAsync($"/api/library/{thin.Id}");
        Assert.Equal(HttpStatusCode.NoContent, removed.StatusCode);

        var after = await client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises", Json);
        Assert.NotNull(after);
        Assert.Empty(after);
        Assert.DoesNotContain(after, row => row.Id == thin.Id);

        var missing = await client.PutAsync("/api/library/999999", null);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Fact]
    public async Task A_completed_flag_gates_the_volume()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workoutResponse = await client.PostAsync("/api/workouts", null);
        var workout = await workoutResponse.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(workout);

        var item = await client.PostAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises",
            new { exerciseId = 1 });
        var itemDto = await item.Content.ReadFromJsonAsync<WorkoutExerciseDto>(Json);
        Assert.NotNull(itemDto);

        var created = await client.PostAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/{itemDto.Id}/sets",
            new { weightKg = 100m, reps = 5, completed = false });
        var set = await created.Content.ReadFromJsonAsync<LoggedSetDto>(Json);
        Assert.NotNull(set);
        Assert.False(set.Completed);

        var before = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts", Json);
        Assert.NotNull(before);
        Assert.Equal(0m, Assert.Single(before).TotalVolumeKg);

        var patched = await client.PatchAsJsonAsync($"/api/sets/{set.Id}", new { completed = true });
        Assert.Equal(HttpStatusCode.OK, patched.StatusCode);
        var checkedSet = await patched.Content.ReadFromJsonAsync<LoggedSetDto>(Json);
        Assert.NotNull(checkedSet);
        Assert.True(checkedSet.Completed);

        var after = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts", Json);
        Assert.NotNull(after);
        Assert.Equal(500m, Assert.Single(after).TotalVolumeKg);
    }

    [Fact]
    public async Task Rest_settings_start_at_defaults_and_round_trip()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var defaults = await client.GetFromJsonAsync<RestSettingsDto>("/api/settings/rest", Json);
        Assert.NotNull(defaults);
        Assert.Equal(90, defaults.UniformValue);
        Assert.True(defaults.Auto);
        Assert.True(defaults.Sound);
        Assert.Empty(defaults.Values);

        var saved = await client.PutAsJsonAsync("/api/settings/rest", new
        {
            uniform = false,
            uniformValue = 120,
            auto = false,
            sound = false,
            volume = 0.35m,
            vibrate = false,
            values = new Dictionary<string, int> { ["1"] = 150, ["2"] = 75 },
        });
        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);

        var reloaded = await client.GetFromJsonAsync<RestSettingsDto>("/api/settings/rest", Json);
        Assert.NotNull(reloaded);
        Assert.Equal(120, reloaded.UniformValue);
        Assert.False(reloaded.Uniform);
        Assert.False(reloaded.Auto);
        Assert.Equal(150, reloaded.Values["1"]);
        Assert.Equal(75, reloaded.Values["2"]);

        var bad = await client.PutAsJsonAsync("/api/settings/rest", new
        {
            uniform = false,
            uniformValue = 2,
            auto = true,
            sound = true,
            volume = 2m,
            vibrate = true,
            values = new Dictionary<string, int>(),
        });
        Assert.Equal(HttpStatusCode.BadRequest, bad.StatusCode);
        var problem = await bad.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(Json);
        Assert.NotNull(problem);
        Assert.True(problem.Errors.ContainsKey("uniformValue"));
        Assert.True(problem.Errors.ContainsKey("volume"));
    }

    [Fact]
    public async Task A_workout_can_be_deleted_with_its_sets()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await client.PostAsync("/api/workouts", null);
        var opened = await workout.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(opened);

        var item = await client.PostAsJsonAsync(
            $"/api/workouts/{opened.Id}/exercises",
            new { exerciseId = 1 });
        var itemDto = await item.Content.ReadFromJsonAsync<WorkoutExerciseDto>(Json);
        Assert.NotNull(itemDto);
        await client.PostAsJsonAsync(
            $"/api/workouts/{opened.Id}/exercises/{itemDto.Id}/sets",
            new { weightKg = 80m, reps = 5 });

        var deleted = await client.DeleteAsync($"/api/workouts/{opened.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);

        var summaries = await client.GetFromJsonAsync<List<WorkoutSummaryDto>>("/api/workouts", Json);
        Assert.NotNull(summaries);
        Assert.Empty(summaries);

        var missing = await client.GetAsync($"/api/workouts/{opened.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Fact]
    public async Task The_dashboard_carries_today_the_week_the_weeks_and_the_records()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var workoutResponse = await client.PostAsync("/api/workouts", null);
        var workout = await workoutResponse.Content.ReadFromJsonAsync<WorkoutDto>(Json);
        Assert.NotNull(workout);

        var item = await client.PostAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises",
            new { exerciseId = 1 });
        var itemDto = await item.Content.ReadFromJsonAsync<WorkoutExerciseDto>(Json);
        Assert.NotNull(itemDto);

        await client.PostAsJsonAsync(
            $"/api/workouts/{workout.Id}/exercises/{itemDto.Id}/sets",
            new { weightKg = 100m, reps = 5, rpe = 8 });

        var dashboard = await client.GetFromJsonAsync<DashboardDto>("/api/dashboard", Json);
        Assert.NotNull(dashboard);
        Assert.NotNull(dashboard.Today);
        Assert.Equal(workout.Id, dashboard.Today.Id);

        Assert.Equal(7, dashboard.Week.Count);
        Assert.Equal(500m, dashboard.CurrentWeekVolume);
        Assert.Equal(1, dashboard.WeekSessions);
        Assert.Equal(0, dashboard.DaysSinceLast);
        Assert.Equal(7, dashboard.WeeklyVolume.Count);

        var record = Assert.Single(dashboard.PersonalRecords);
        Assert.Equal(1, record.ExerciseId);
        Assert.Equal(100m, record.BestWeightKg);
        Assert.Null(record.PreviousBestWeightKg);
    }

    [Fact]
    public async Task A_saved_exercise_survives_a_second_seed_run()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var catalogue = await client.GetFromJsonAsync<CataloguePageDto>(
            $"/api/catalogue?q={Uri.EscapeDataString("box squat")}",
            Json);
        Assert.NotNull(catalogue);
        var thin = catalogue.Items.First(row => !row.IsLibrary && row.Id >= 1000);
        await client.PutAsync($"/api/library/{thin.Id}", null);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<Cvikarna.Api.Data.AppDbContext>();
        await Cvikarna.Api.Seed.DatabaseInitializer.InitializeAsync(
            db,
            factory.Services.GetRequiredService<Microsoft.Extensions.Hosting.IHostEnvironment>().ContentRootPath,
            Microsoft.Extensions.Logging.Abstractions.NullLogger.Instance);

        var library = await client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises", Json);
        Assert.NotNull(library);
        Assert.Contains(library, row => row.Id == thin.Id);
    }
}
