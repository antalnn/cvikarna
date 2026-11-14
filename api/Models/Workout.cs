namespace Cvikarna.Api.Models;

/// <summary>A training session on one date. A gym log needs the day, not a timestamp.</summary>
public class Workout
{
    public int Id { get; set; }
    public DateOnly PerformedOn { get; set; }

    /// <summary>Optional session name, 80 characters at most. Null means the day's generic title.</summary>
    public string? Name { get; set; }

    public string? Notes { get; set; }

    public ICollection<WorkoutExercise> Exercises { get; set; } = [];
}
