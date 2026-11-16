namespace Cvikarna.Api.Contracts;

/// <summary>The dashboard in one response: today's session plus the log's trends.</summary>
public sealed record DashboardDto(
    WorkoutDto? Today,
    IReadOnlyList<DashboardDayDto> Week,
    decimal CurrentWeekVolume,
    decimal PreviousWeekVolume,
    int WeekSessions,
    string? LastSessionOn,
    int? DaysSinceLast,
    IReadOnlyList<PersonalRecordDto> PersonalRecords,
    IReadOnlyList<WeeklyVolumeDto> WeeklyVolume);

/// <summary>One day of the current week's strip.</summary>
public sealed record DashboardDayDto(
    string Date,
    bool HasSession,
    decimal Volume);

/// <summary>The heaviest completed set of a movement, and the best before it.</summary>
public sealed record PersonalRecordDto(
    int ExerciseId,
    string NameEn,
    string? NameCs,
    decimal BestWeightKg,
    decimal? PreviousBestWeightKg,
    string AchievedOn);

/// <summary>One bar of the seven-week volume chart.</summary>
public sealed record WeeklyVolumeDto(
    string Label,
    string Start,
    decimal Volume);

/// <summary>Rest values are user settings: one default plus optional per-movement values.</summary>
public sealed record RestSettingsDto(
    bool Uniform,
    int UniformValue,
    bool Auto,
    bool Sound,
    decimal Volume,
    bool Vibrate,
    IReadOnlyDictionary<string, int> Values);

public sealed record UpdateRestSettingsRequest(
    bool Uniform,
    int UniformValue,
    bool Auto,
    bool Sound,
    decimal Volume,
    bool Vibrate,
    IReadOnlyDictionary<string, int>? Values);
