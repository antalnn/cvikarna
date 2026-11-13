using System.Text.Json.Serialization;

namespace Cvikarna.Api.Seed;

/// <summary>One row of api/Seed/exercises.json: the curated, bilingual library.</summary>
internal sealed class LibrarySeedRow
{
    [JsonPropertyName("id")] public int Id { get; init; }
    [JsonPropertyName("slug")] public string Slug { get; init; } = "";
    [JsonPropertyName("sourceId")] public string SourceId { get; init; } = "";
    [JsonPropertyName("coverIndex")] public int CoverIndex { get; init; }
    [JsonPropertyName("nameEn")] public string NameEn { get; init; } = "";
    [JsonPropertyName("nameCs")] public string NameCs { get; init; } = "";
    [JsonPropertyName("aliasesEn")] public List<string> AliasesEn { get; init; } = [];
    [JsonPropertyName("aliasesCs")] public List<string> AliasesCs { get; init; } = [];
    [JsonPropertyName("primaryMuscle")] public string PrimaryMuscle { get; init; } = "";
    [JsonPropertyName("secondaryMuscles")] public List<string> SecondaryMuscles { get; init; } = [];
    [JsonPropertyName("equipment")] public string Equipment { get; init; } = "";
    [JsonPropertyName("level")] public string Level { get; init; } = "";
    [JsonPropertyName("instructionsEn")] public List<string> InstructionsEn { get; init; } = [];
    [JsonPropertyName("instructionsCs")] public List<string> InstructionsCs { get; init; } = [];
    [JsonPropertyName("cuesEn")] public List<string> CuesEn { get; init; } = [];
    [JsonPropertyName("cuesCs")] public List<string> CuesCs { get; init; } = [];
    [JsonPropertyName("images")] public List<string> Images { get; init; } = [];
}

/// <summary>One row of api/Seed/catalogue.json: display fields only.</summary>
internal sealed class CatalogueSeedRow
{
    [JsonPropertyName("sourceId")] public string SourceId { get; init; } = "";
    [JsonPropertyName("nameEn")] public string NameEn { get; init; } = "";
    [JsonPropertyName("nameCs")] public string? NameCs { get; init; }
    [JsonPropertyName("primaryMuscle")] public string PrimaryMuscle { get; init; } = "";
    [JsonPropertyName("equipment")] public string? Equipment { get; init; }
    [JsonPropertyName("level")] public string Level { get; init; } = "";
}
