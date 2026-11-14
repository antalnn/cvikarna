namespace Cvikarna.Api.Domain;

/// <summary>
/// The filter chips group the fine muscles into seven labels. The same mapping
/// exists in the frontend; the API repeats it so a filter means the same thing
/// on both sides.
/// </summary>
public static class MuscleGroups
{
    public static readonly string[] All =
        ["chest", "back", "shoulders", "biceps", "triceps", "legs", "core"];

    private static readonly HashSet<string> Legs = ["quads", "hamstrings", "glutes", "calves"];

    public static int OrderOf(string group) => Array.IndexOf(All, group);

    private static readonly string[] Fine =
        ["chest", "back", "shoulders", "biceps", "triceps", "quads", "hamstrings", "glutes", "calves", "core", "grip"];

    /// <summary>The order the library grid uses: coarse groups, with legs in their four parts.</summary>
    public static int FineOrderOf(string muscle) => Array.IndexOf(Fine, muscle);

    public static string Of(string muscle)
    {
        if (muscle == "grip")
        {
            return "back";
        }

        if (Legs.Contains(muscle))
        {
            return "legs";
        }

        return muscle;
    }
}
