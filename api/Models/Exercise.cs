namespace Cvikarna.Api.Models;

/// <summary>
/// One row in the exercise table. A library row is rich (photos, instructions,
/// cues, Czech name). A catalogue row is thin: display fields only, and
/// NameCs may be null rather than a machine translation.
/// </summary>
public class Exercise
{
    public int Id { get; set; }

    /// <summary>The free-exercise-db id, the stable natural key used by seeding.</summary>
    public string SourceId { get; set; } = "";

    /// <summary>Library rows carry a slug because their photos live under it.</summary>
    public string? Slug { get; set; }

    public bool IsLibrary { get; set; }

    /// <summary>Which photo a card shows: 1 when the first frame is the setup.</summary>
    public int CoverIndex { get; set; }

    public string NameEn { get; set; } = "";
    public string? NameCs { get; set; }

    public List<string> AliasesEn { get; set; } = [];
    public List<string> AliasesCs { get; set; } = [];

    public string PrimaryMuscle { get; set; } = "";
    public List<string> SecondaryMuscles { get; set; } = [];

    public string? Equipment { get; set; }
    public string Level { get; set; } = "";

    public List<string> InstructionsEn { get; set; } = [];
    public List<string> InstructionsCs { get; set; } = [];
    public List<string> CuesEn { get; set; } = [];
    public List<string> CuesCs { get; set; } = [];
    public List<string> Images { get; set; } = [];

    public ICollection<WorkoutExercise> WorkoutExercises { get; set; } = [];
}
