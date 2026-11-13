using System.Globalization;
using Cvikarna.Api.Contracts;
using Cvikarna.Api.Data;
using Cvikarna.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cvikarna.Api.Services;

/// <summary>
/// Volume, Epley 1RM and personal bests are computed in C#, not SQL, so the
/// formulas are unit-testable. Weekly sets join each set to its exercise's
/// primary muscle and count the current ISO week, the number lifters use.
/// </summary>
public class StatsService(AppDbContext db)
{
    public async Task<ExerciseStatsDto?> GetAsync(
        int exerciseId,
        DateOnly today,
        CancellationToken cancellationToken = default)
    {
        var exercise = await db.Exercises
            .AsNoTracking()
            .FirstOrDefaultAsync(row => row.Id == exerciseId, cancellationToken);

        if (exercise is null)
        {
            return null;
        }

        var sets = await db.LoggedSets
            .AsNoTracking()
            .Where(set => set.WorkoutExercise.ExerciseId == exerciseId)
            .Select(set => new { set.WeightKg, set.Reps })
            .ToListAsync(cancellationToken);

        var totalVolume = sets.Sum(set => StatsMath.SetVolume(set.WeightKg, set.Reps));
        decimal? bestEstimated = sets.Count == 0
            ? null
            : sets.Max(set => StatsMath.EstimatedOneRepMax(set.WeightKg, set.Reps));
        decimal? bestWeight = sets.Count == 0 ? null : sets.Max(set => set.WeightKg);
        decimal? bestSetVolume = sets.Count == 0
            ? null
            : sets.Max(set => StatsMath.SetVolume(set.WeightKg, set.Reps));

        var weekStart = StatsMath.StartOfWeek(today);
        var weekEnd = weekStart.AddDays(7);

        var weekMuscles = await db.LoggedSets
            .AsNoTracking()
            .Where(set =>
                set.WorkoutExercise.Workout.PerformedOn >= weekStart &&
                set.WorkoutExercise.Workout.PerformedOn < weekEnd)
            .Select(set => set.WorkoutExercise.Exercise.PrimaryMuscle)
            .ToListAsync(cancellationToken);

        var weeklySets = weekMuscles
            .GroupBy(MuscleGroups.Of)
            .Select(group => new WeeklySetsDto(group.Key, group.Count()))
            .OrderBy(group => MuscleGroups.OrderOf(group.Muscle))
            .ToList();

        var isoWeek = $"{ISOWeek.GetYear(today.ToDateTime(TimeOnly.MinValue))}-W{ISOWeek.GetWeekOfYear(today.ToDateTime(TimeOnly.MinValue)):D2}";

        return new ExerciseStatsDto(
            exercise.Id,
            exercise.NameEn,
            exercise.NameCs,
            totalVolume,
            bestEstimated,
            bestWeight,
            bestSetVolume,
            isoWeek,
            weeklySets);
    }
}

public static class StatsMath
{
    /// <summary>Epley: weight x (1 + reps / 30).</summary>
    public static decimal EstimatedOneRepMax(decimal weightKg, int reps) =>
        weightKg * (1 + reps / 30m);

    public static decimal SetVolume(decimal weightKg, int reps) => weightKg * reps;

    /// <summary>The Monday of the week that contains the date.</summary>
    public static DateOnly StartOfWeek(DateOnly date) =>
        date.AddDays(-(((int)date.DayOfWeek + 6) % 7));
}
