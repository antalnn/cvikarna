namespace Cvikarna.Api.Models;

/// <summary>An exercise inside a workout, ordered by Position. Sets hang off this row.</summary>
public class WorkoutExercise
{
    public int Id { get; set; }
    public int WorkoutId { get; set; }
    public Workout Workout { get; set; } = null!;
    public int ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;
    public int Position { get; set; }

    public ICollection<LoggedSet> Sets { get; set; } = [];
}
