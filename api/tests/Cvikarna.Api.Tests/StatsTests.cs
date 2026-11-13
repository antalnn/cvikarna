using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Cvikarna.Api.Contracts;
using Cvikarna.Api.Services;

namespace Cvikarna.Api.Tests;

public class StatsTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    [Fact]
    public void Volume_and_epley_match_a_hand_calculation()
    {
        Assert.Equal(500m, StatsMath.SetVolume(100m, 5));
        Assert.Equal(800m, StatsMath.SetVolume(80m, 10));
        Assert.Equal(0m, StatsMath.SetVolume(0m, 12));

        Assert.Equal(116.67m, Math.Round(StatsMath.EstimatedOneRepMax(100m, 5), 2));
        Assert.Equal(106.67m, Math.Round(StatsMath.EstimatedOneRepMax(80m, 10), 2));
        Assert.Equal(0m, StatsMath.EstimatedOneRepMax(0m, 10));
    }

    [Fact]
    public void The_week_starts_on_monday()
    {
        Assert.Equal(new DateOnly(2026, 11, 9), StatsMath.StartOfWeek(new DateOnly(2026, 11, 13)));
        Assert.Equal(new DateOnly(2026, 11, 9), StatsMath.StartOfWeek(new DateOnly(2026, 11, 9)));
        Assert.Equal(new DateOnly(2026, 11, 9), StatsMath.StartOfWeek(new DateOnly(2026, 11, 15)));
    }

    [Fact]
    public async Task Stats_match_a_hand_calculated_fixture()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var bench = await AddExerciseAsync(client, workout.Id, 1);

        await AddSetAsync(client, workout.Id, bench.Id, 100m, 5, 8m);
        await AddSetAsync(client, workout.Id, bench.Id, 80m, 10, 9m);
        await AddSetAsync(client, workout.Id, bench.Id, 0m, 12, null);

        var stats = await client.GetFromJsonAsync<ExerciseStatsDto>("/api/stats?exerciseId=1", Json);

        Assert.NotNull(stats);
        Assert.Equal(1300m, stats.TotalVolumeKg);
        Assert.Equal(116.67m, Math.Round(stats.BestEstimated1RmKg!.Value, 2));
        Assert.Equal(100m, stats.BestWeightKg);
        Assert.Equal(800m, stats.BestSetVolumeKg);
        Assert.Matches(@"^\d{4}-W\d{2}$", stats.IsoWeek);
        Assert.Contains(stats.WeeklySets, group => group.Muscle == "chest" && group.Sets == 3);
    }

    [Fact]
    public async Task An_exercise_without_sets_has_zero_volume_and_no_bests()
    {
        await using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var workout = await OpenWorkoutAsync(client);
        var bench = await AddExerciseAsync(client, workout.Id, 1);
        await AddSetAsync(client, workout.Id, bench.Id, 100m, 5, 8m);

        var stats = await client.GetFromJsonAsync<ExerciseStatsDto>("/api/stats?exerciseId=2", Json);

        Assert.NotNull(stats);
        Assert.Equal(0m, stats.TotalVolumeKg);
        Assert.Null(stats.BestEstimated1RmKg);
        Assert.Null(stats.BestWeightKg);
        Assert.Null(stats.BestSetVolumeKg);

        // Weekly sets count every exercise that trains the muscle.
        Assert.Contains(stats.WeeklySets, group => group.Muscle == "chest" && group.Sets == 1);

        var missing = await client.GetAsync("/api/stats?exerciseId=999999");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
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
        response.EnsureSuccessStatusCode();
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
