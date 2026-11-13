namespace Cvikarna.Api.Contracts;

public sealed record ExerciseStatsDto(
    int ExerciseId,
    string NameEn,
    string? NameCs,
    decimal TotalVolumeKg,
    decimal? BestEstimated1RmKg,
    decimal? BestWeightKg,
    decimal? BestSetVolumeKg,
    string IsoWeek,
    IReadOnlyList<WeeklySetsDto> WeeklySets);

public sealed record WeeklySetsDto(string Muscle, int Sets);
