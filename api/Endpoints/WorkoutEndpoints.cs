using System.Globalization;
using Cvikarna.Api.Contracts;
using Cvikarna.Api.Data;
using Cvikarna.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Cvikarna.Api.Endpoints;

public static class WorkoutEndpoints
{
    public static IEndpointRouteBuilder MapWorkoutEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api").WithTags("Workouts");

        group.MapPost("/workouts", async (
                AppDbContext db,
                TimeProvider time,
                CancellationToken cancellationToken) =>
            {
                var today = DateOnly.FromDateTime(time.GetLocalNow().DateTime);
                var existing = await LoadWorkout(db, today, cancellationToken);

                if (existing is not null)
                {
                    return Results.Ok(WorkoutDto.From(existing));
                }

                // INSERT OR IGNORE keeps the unique date index as the authority.
                // Two tabs opening the tracker at once cannot fail on a race;
                // the loser reads the row the winner inserted.
                var inserted = await db.Database.ExecuteSqlInterpolatedAsync(
                    $"INSERT OR IGNORE INTO \"Workouts\" (\"PerformedOn\") VALUES ({today})",
                    cancellationToken);

                var workout = await LoadWorkout(db, today, cancellationToken)
                    ?? throw new InvalidOperationException("The workout row disappeared after it was inserted.");

                return inserted == 1
                    ? Results.Created($"/api/workouts/{workout.Id}", WorkoutDto.From(workout))
                    : Results.Ok(WorkoutDto.From(workout));
            })
            .WithName("OpenTodayWorkout")
            .Produces<WorkoutDto>(StatusCodes.Status200OK)
            .Produces<WorkoutDto>(StatusCodes.Status201Created);

        group.MapGet("/workouts/{id:int}", async (int id, AppDbContext db, CancellationToken cancellationToken) =>
            {
                var workout = await LoadWorkout(db, id, cancellationToken);
                return workout is null
                    ? NotFound("Workout not found", $"No workout has id {id}.")
                    : Results.Ok(WorkoutDto.From(workout));
            })
            .WithName("GetWorkout")
            .Produces<WorkoutDto>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("/workouts/{id:int}/exercises", async (
                int id,
                AddExerciseRequest request,
                AppDbContext db,
                CancellationToken cancellationToken) =>
            {
                var workoutExists = await db.Workouts.AnyAsync(row => row.Id == id, cancellationToken);
                if (!workoutExists)
                {
                    return NotFound("Workout not found", $"No workout has id {id}.");
                }

                var exercise = await db.Exercises
                    .AsNoTracking()
                    .FirstOrDefaultAsync(row => row.Id == request.ExerciseId, cancellationToken);

                if (exercise is null)
                {
                    return Results.ValidationProblem(new Dictionary<string, string[]>
                    {
                        ["exerciseId"] = [$"No exercise has id {request.ExerciseId}."],
                    });
                }

                var lastPosition = await db.WorkoutExercises
                    .Where(item => item.WorkoutId == id)
                    .Select(item => (int?)item.Position)
                    .MaxAsync(cancellationToken) ?? 0;

                var item = new WorkoutExercise
                {
                    WorkoutId = id,
                    ExerciseId = exercise.Id,
                    Position = lastPosition + 1,
                };

                db.WorkoutExercises.Add(item);
                await db.SaveChangesAsync(cancellationToken);

                item.Exercise = exercise;

                return Results.Created(
                    $"/api/workouts/{id}",
                    WorkoutExerciseDto.From(item));
            })
            .WithName("AddWorkoutExercise")
            .Produces<WorkoutExerciseDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapDelete("/workouts/{id:int}/exercises/{itemId:int}", async (
                int id,
                int itemId,
                AppDbContext db,
                CancellationToken cancellationToken) =>
            {
                var item = await db.WorkoutExercises
                    .FirstOrDefaultAsync(row => row.Id == itemId && row.WorkoutId == id, cancellationToken);

                if (item is null)
                {
                    return NotFound("Workout exercise not found", $"No item {itemId} belongs to workout {id}.");
                }

                db.WorkoutExercises.Remove(item);
                await db.SaveChangesAsync(cancellationToken);
                return Results.NoContent();
            })
            .WithName("DeleteWorkoutExercise")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("/workouts/{id:int}/exercises/{itemId:int}/sets", async (
                int id,
                int itemId,
                AddSetRequest request,
                AppDbContext db,
                CancellationToken cancellationToken) =>
            {
                var item = await db.WorkoutExercises
                    .FirstOrDefaultAsync(row => row.Id == itemId && row.WorkoutId == id, cancellationToken);

                if (item is null)
                {
                    return NotFound("Workout exercise not found", $"No item {itemId} belongs to workout {id}.");
                }

                var errors = ValidateSet(request);
                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(errors);
                }

                var set = new LoggedSet
                {
                    WorkoutExerciseId = item.Id,
                    WeightKg = request.WeightKg,
                    Reps = request.Reps,
                    Rpe = request.Rpe,
                    Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                };

                db.LoggedSets.Add(set);
                await db.SaveChangesAsync(cancellationToken);

                return Results.Created($"/api/sets/{set.Id}", LoggedSetDto.From(set));
            })
            .WithName("AddSet")
            .Produces<LoggedSetDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapGet("/sets", async (
                AppDbContext db,
                int? exerciseId,
                int? take,
                CancellationToken cancellationToken) =>
            {
                var limit = Math.Clamp(take ?? 5, 1, 50);

                var query = db.LoggedSets
                    .AsNoTracking()
                    .Select(set => new
                    {
                        Set = set,
                        Exercise = set.WorkoutExercise.Exercise,
                        Workout = set.WorkoutExercise.Workout,
                    });

                if (exerciseId is not null)
                {
                    query = query.Where(row => row.Exercise.Id == exerciseId);
                }

                var rows = await query
                    .OrderByDescending(row => row.Workout.PerformedOn)
                    .ThenByDescending(row => row.Set.Id)
                    .Take(limit)
                    .ToListAsync(cancellationToken);

                var sets = rows
                    .Select(row => new RecentSetDto(
                        row.Set.Id,
                        row.Exercise.Id,
                        row.Exercise.NameEn,
                        row.Exercise.NameCs,
                        row.Workout.PerformedOn.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                        row.Set.WeightKg,
                        row.Set.Reps,
                        row.Set.Rpe,
                        row.Set.Notes))
                    .ToList();

                return Results.Ok(sets);
            })
            .WithName("ListRecentSets")
            .Produces<IReadOnlyList<RecentSetDto>>();

        group.MapDelete("/sets/{id:int}", async (int id, AppDbContext db, CancellationToken cancellationToken) =>
            {
                var set = await db.LoggedSets.FirstOrDefaultAsync(row => row.Id == id, cancellationToken);
                if (set is null)
                {
                    return NotFound("Set not found", $"No set has id {id}.");
                }

                db.LoggedSets.Remove(set);
                await db.SaveChangesAsync(cancellationToken);
                return Results.NoContent();
            })
            .WithName("DeleteSet")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }

    private static Dictionary<string, string[]> ValidateSet(AddSetRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (request.WeightKg < 0)
        {
            errors["weightKg"] = ["Weight must be 0 or more. Use 0 for bodyweight."];
        }

        if (request.Reps is < 1 or > 100)
        {
            errors["reps"] = ["Reps must be between 1 and 100."];
        }

        if (request.Rpe is < 1 or > 10)
        {
            errors["rpe"] = ["RPE must be between 1 and 10, or empty."];
        }

        if (request.Notes is { Length: > 300 })
        {
            errors["notes"] = ["Notes can be at most 300 characters."];
        }

        return errors;
    }

    private static IResult NotFound(string title, string detail) =>
        Results.Problem(statusCode: StatusCodes.Status404NotFound, title: title, detail: detail);

    private static Task<Workout?> LoadWorkout(AppDbContext db, int id, CancellationToken cancellationToken) =>
        db.Workouts
            .AsNoTracking()
            .AsSplitQuery()
            .Include(workout => workout.Exercises)
            .ThenInclude(item => item.Exercise)
            .Include(workout => workout.Exercises)
            .ThenInclude(item => item.Sets)
            .FirstOrDefaultAsync(workout => workout.Id == id, cancellationToken);

    private static Task<Workout?> LoadWorkout(AppDbContext db, DateOnly date, CancellationToken cancellationToken) =>
        db.Workouts
            .AsNoTracking()
            .AsSplitQuery()
            .Include(workout => workout.Exercises)
            .ThenInclude(item => item.Exercise)
            .Include(workout => workout.Exercises)
            .ThenInclude(item => item.Sets)
            .FirstOrDefaultAsync(workout => workout.PerformedOn == date, cancellationToken);
}
