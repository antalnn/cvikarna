using System.Globalization;
using Cvikarna.Api.Models;

namespace Cvikarna.Api.Contracts;

public sealed record WorkoutDto(
    int Id,
    string PerformedOn,
    string? Notes,
    IReadOnlyList<WorkoutExerciseDto> Exercises)
{
    public static WorkoutDto From(Workout workout) => new(
        workout.Id,
        workout.PerformedOn.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        workout.Notes,
        workout.Exercises
            .OrderBy(item => item.Position)
            .Select(WorkoutExerciseDto.From)
            .ToList());
}

public sealed record WorkoutExerciseDto(
    int Id,
    int ExerciseId,
    int Position,
    bool IsLibrary,
    string NameEn,
    string? NameCs,
    string PrimaryMuscle,
    string? Equipment,
    string Level,
    IReadOnlyList<LoggedSetDto> Sets)
{
    public static WorkoutExerciseDto From(WorkoutExercise item) => new(
        item.Id,
        item.ExerciseId,
        item.Position,
        item.Exercise.IsLibrary,
        item.Exercise.NameEn,
        item.Exercise.NameCs,
        item.Exercise.PrimaryMuscle,
        item.Exercise.Equipment,
        item.Exercise.Level,
        item.Sets.OrderBy(set => set.Id).Select(LoggedSetDto.From).ToList());
}

public sealed record LoggedSetDto(int Id, decimal WeightKg, int Reps, decimal? Rpe, string? Notes)
{
    public static LoggedSetDto From(LoggedSet set) => new(
        set.Id,
        set.WeightKg,
        set.Reps,
        set.Rpe,
        set.Notes);
}

public sealed record RecentSetDto(
    int Id,
    int ExerciseId,
    string NameEn,
    string? NameCs,
    string PerformedOn,
    decimal WeightKg,
    int Reps,
    decimal? Rpe,
    string? Notes);

public sealed record AddExerciseRequest(int ExerciseId);

public sealed record AddSetRequest(decimal WeightKg, int Reps, decimal? Rpe, string? Notes);
