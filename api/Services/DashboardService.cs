using System.Globalization;
using Cvikarna.Api.Contracts;
using Cvikarna.Api.Data;
using Cvikarna.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Cvikarna.Api.Services;

/// <summary>
/// The dashboard reads the log in one pass. Volume is decimal math, so sums
/// happen in C# rather than SQLite, and a set counts only once it is completed.
/// </summary>
public class DashboardService(AppDbContext db)
{
    private const int WeekCount = 7;
    private const int RecordCount = 3;

    public async Task<DashboardDto> GetAsync(DateOnly today, CancellationToken cancellationToken = default)
    {
        var weekStart = StatsMath.StartOfWeek(today);
        var firstWeek = weekStart.AddDays(-7 * (WeekCount - 1));
        var nextWeek = weekStart.AddDays(7);

        var todayWorkout = await db.Workouts
            .AsNoTracking()
            .AsSplitQuery()
            .Include(workout => workout.Exercises)
            .ThenInclude(item => item.Exercise)
            .Include(workout => workout.Exercises)
            .ThenInclude(item => item.Sets)
            .FirstOrDefaultAsync(workout => workout.PerformedOn == today, cancellationToken);

        // Every workout with work in it, newest first, with only the numbers the
        // dashboard needs. The whole log is small; the strip and the spark share it.
        var workouts = await db.Workouts
            .AsNoTracking()
            .Where(workout => workout.Exercises.Any())
            .OrderBy(workout => workout.PerformedOn)
            .Select(workout => new
            {
                workout.PerformedOn,
                Sets = workout.Exercises
                    .SelectMany(item => item.Sets)
                    .Where(set => set.Completed)
                    .Select(set => new { set.WeightKg, set.Reps })
                    .ToList(),
            })
            .ToListAsync(cancellationToken);

        var volumeByDate = workouts.ToDictionary(
            row => row.PerformedOn,
            row => row.Sets.Sum(set => set.WeightKg * set.Reps));

        var week = new List<DashboardDayDto>(7);
        for (var offset = 0; offset < 7; offset++)
        {
            var date = weekStart.AddDays(offset);
            volumeByDate.TryGetValue(date, out var volume);
            week.Add(new DashboardDayDto(
                date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                volumeByDate.ContainsKey(date),
                volume));
        }

        var currentWeekVolume = week.Sum(day => day.Volume);
        var previousWeekVolume = workouts
            .Where(row => row.PerformedOn >= weekStart.AddDays(-7) && row.PerformedOn < weekStart)
            .Sum(row => row.Sets.Sum(set => set.WeightKg * set.Reps));
        var weekSessions = workouts.Count(row => row.PerformedOn >= weekStart && row.PerformedOn < nextWeek);

        var last = workouts.LastOrDefault(row => row.PerformedOn <= today);
        var lastSessionOn = last?.PerformedOn.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        var daysSinceLast = last is null ? (int?)null : today.DayNumber - last.PerformedOn.DayNumber;

        var weeklyVolume = new List<WeeklyVolumeDto>(WeekCount);
        for (var index = 0; index < WeekCount; index++)
        {
            var start = firstWeek.AddDays(index * 7);
            var end = start.AddDays(7);
            var volume = workouts
                .Where(row => row.PerformedOn >= start && row.PerformedOn < end)
                .Sum(row => row.Sets.Sum(set => set.WeightKg * set.Reps));
            var iso = ISOWeek.GetWeekOfYear(start.ToDateTime(TimeOnly.MinValue));
            weeklyVolume.Add(new WeeklyVolumeDto($"W{iso:D2}", start.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), volume));
        }

        var records = await PersonalRecordsAsync(today, cancellationToken);

        return new DashboardDto(
            todayWorkout is null ? null : WorkoutDto.From(todayWorkout),
            week,
            currentWeekVolume,
            previousWeekVolume,
            weekSessions,
            lastSessionOn,
            daysSinceLast,
            records,
            weeklyVolume);
    }

    private async Task<IReadOnlyList<PersonalRecordDto>> PersonalRecordsAsync(
        DateOnly today,
        CancellationToken cancellationToken)
    {
        var sets = await db.LoggedSets
            .AsNoTracking()
            .Where(set => set.Completed && set.WorkoutExercise.Workout.PerformedOn <= today)
            .Select(set => new
            {
                set.WorkoutExercise.ExerciseId,
                set.WorkoutExercise.Exercise.NameEn,
                set.WorkoutExercise.Exercise.NameCs,
                set.WeightKg,
                set.WorkoutExercise.Workout.PerformedOn,
            })
            .ToListAsync(cancellationToken);

        var records = new List<PersonalRecordDto>();

        foreach (var group in sets.GroupBy(set => set.ExerciseId))
        {
            var bestWeight = group.Max(set => set.WeightKg);
            if (bestWeight <= 0)
            {
                continue;
            }

            var achieved = group
                .Where(set => set.WeightKg == bestWeight)
                .Max(set => set.PerformedOn);
            var previous = group
                .Where(set => set.PerformedOn < achieved)
                .Select(set => (decimal?)set.WeightKg)
                .Max();

            var first = group.First();
            records.Add(new PersonalRecordDto(
                group.Key,
                first.NameEn,
                first.NameCs,
                bestWeight,
                previous,
                achieved.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)));
        }

        return records
            .OrderByDescending(record => record.AchievedOn, StringComparer.Ordinal)
            .ThenByDescending(record => record.BestWeightKg)
            .Take(RecordCount)
            .ToList();
    }
}
