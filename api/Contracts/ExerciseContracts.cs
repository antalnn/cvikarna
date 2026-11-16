using Cvikarna.Api.Models;

namespace Cvikarna.Api.Contracts;

/// <summary>The full library shape. Both languages, photos and coaching content.</summary>
public sealed record ExerciseDetailDto(
    int Id,
    string Slug,
    int CoverIndex,
    string NameEn,
    string NameCs,
    IReadOnlyList<string> AliasesEn,
    IReadOnlyList<string> AliasesCs,
    string PrimaryMuscle,
    IReadOnlyList<string> SecondaryMuscles,
    string Equipment,
    string Level,
    IReadOnlyList<string> InstructionsEn,
    IReadOnlyList<string> InstructionsCs,
    IReadOnlyList<string> CuesEn,
    IReadOnlyList<string> CuesCs,
    IReadOnlyList<string> Images)
{
    public static ExerciseDetailDto From(Exercise exercise) => new(
        exercise.Id,
        exercise.Slug ?? "",
        exercise.CoverIndex,
        exercise.NameEn,
        exercise.NameCs ?? exercise.NameEn,
        exercise.AliasesEn,
        exercise.AliasesCs,
        exercise.PrimaryMuscle,
        exercise.SecondaryMuscles,
        exercise.Equipment ?? "",
        exercise.Level,
        exercise.InstructionsEn,
        exercise.InstructionsCs,
        exercise.CuesEn,
        exercise.CuesCs,
        Domain.ExerciseImages.For(exercise));
}

/// <summary>A thin catalogue row: enough to pick an exercise, nothing more.</summary>
public sealed record CatalogueRowDto(
    int Id,
    string SourceId,
    bool IsLibrary,
    string NameEn,
    string? NameCs,
    string PrimaryMuscle,
    string? Equipment,
    string Level,
    IReadOnlyList<string> Images)
{
    public static CatalogueRowDto From(Exercise exercise) => new(
        exercise.Id,
        exercise.SourceId,
        exercise.IsLibrary,
        exercise.NameEn,
        exercise.NameCs,
        exercise.PrimaryMuscle,
        exercise.Equipment,
        exercise.Level,
        Domain.ExerciseImages.For(exercise));
}

public sealed record CataloguePageDto(
    IReadOnlyList<CatalogueRowDto> Items,
    int Page,
    int PageSize,
    int Total);
