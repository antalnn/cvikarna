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

    /// <summary>
    /// A set counts toward volume and the session meter only once it is checked
    /// off. A set logged from the tracker starts completed; a copied set starts
    /// uncompleted, so the copy adds no volume until it is worked through.
    /// </summary>
    public bool Completed { get; set; } = true;
}
