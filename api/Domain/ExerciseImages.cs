using Cvikarna.Api.Models;

namespace Cvikarna.Api.Domain;

/// <summary>
/// The two demonstration frames for a movement. Curated rows ship local photos
/// under <c>wwwroot/exercises/&lt;slug&gt;/</c>; every other row points at the same
/// free-exercise-db pair by its stable SourceId, so the card can cross-fade the
/// start and end frames for all 876 movements without shipping the catalogue's
/// photos. The pair is always start then end, never mirrored.
/// </summary>
public static class ExerciseImages
{
    public const string FreeExerciseDbBase =
        "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

    public static IReadOnlyList<string> For(Exercise exercise)
    {
        if (exercise.Images.Count > 0)
        {
            return exercise.Images;
        }

        if (string.IsNullOrWhiteSpace(exercise.SourceId))
        {
            return [];
        }

        var folder = Uri.EscapeDataString(exercise.SourceId);
        return
        [
            $"{FreeExerciseDbBase}/{folder}/0.jpg",
            $"{FreeExerciseDbBase}/{folder}/1.jpg",
        ];
    }
}
