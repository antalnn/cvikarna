namespace Cvikarna.Api.Models;

/// <summary>One logged set. Weight 0 means bodyweight; RPE is optional.</summary>
public class LoggedSet
{
    public int Id { get; set; }
    public int WorkoutExerciseId { get; set; }
    public WorkoutExercise WorkoutExercise { get; set; } = null!;

    /// <summary>Order inside the exercise. Gaps are allowed; ordering is Position then Id.</summary>
    public int Position { get; set; }
    public decimal WeightKg { get; set; }
    public int Reps { get; set; }
    public decimal? Rpe { get; set; }
    public string? Notes { get; set; }
}
