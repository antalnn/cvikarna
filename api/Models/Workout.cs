namespace Cvikarna.Api.Models;

/// <summary>A training session on one date. A gym log needs the day, not a timestamp.</summary>
public class Workout
{
    public int Id { get; set; }
    public DateOnly PerformedOn { get; set; }
    public string? Notes { get; set; }

    public ICollection<WorkoutExercise> Exercises { get; set; } = [];
}
