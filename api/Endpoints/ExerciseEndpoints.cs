using Cvikarna.Api.Contracts;
using Cvikarna.Api.Data;
using Cvikarna.Api.Domain;
using Cvikarna.Api.Models;
using Cvikarna.Api.Search;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace Cvikarna.Api.Endpoints;

public static class ExerciseEndpoints
{
    public static IEndpointRouteBuilder MapExerciseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api").WithTags("Exercises");

        group.MapGet("/exercises", async (
                AppDbContext db,
                string? muscle,
                string? equipment,
                string? level,
                string? q,
                CancellationToken cancellationToken) =>
            {
                var rows = await db.Exercises
                    .AsNoTracking()
                    .Where(exercise => exercise.IsLibrary)
                    .ToListAsync(cancellationToken);

                // Curated rows are grouped by muscle, then by the Czech name the app
                // shows by default. The order does not depend on catalogue hash ids.
                var czech = StringComparer.Create(CultureInfo.GetCultureInfo("cs-CZ"), true);
                var ordered = rows
                    .OrderBy(exercise => MuscleGroups.FineOrderOf(exercise.PrimaryMuscle))
                    .ThenBy(exercise => exercise.NameCs ?? exercise.NameEn, czech);

                var filtered = ordered
                    .Where(exercise => MatchesMuscle(exercise, muscle))
                    .Where(exercise => MatchesEquipment(exercise, equipment))
                    .Where(exercise => MatchesLevel(exercise, level))
                    .Where(exercise => ExerciseSearch.Matches(
                        exercise.NameEn,
                        exercise.NameCs,
                        exercise.AliasesEn,
                        exercise.AliasesCs,
                        q))
                    .Select(ExerciseDetailDto.From)
                    .ToList();

                return Results.Ok(filtered);
            })
            .WithName("ListLibraryExercises")
            .Produces<IReadOnlyList<ExerciseDetailDto>>();

        group.MapGet("/exercises/{id:int}", async (int id, AppDbContext db, CancellationToken cancellationToken) =>
            {
                var exercise = await db.Exercises
                    .AsNoTracking()
                    .FirstOrDefaultAsync(row => row.Id == id, cancellationToken);

                return exercise is null
                    ? Results.Problem(
                        statusCode: StatusCodes.Status404NotFound,
                        title: "Exercise not found",
                        detail: $"No exercise has id {id}.")
                    : Results.Ok(ExerciseDetailDto.From(exercise));
            })
            .WithName("GetLibraryExercise")
            .Produces<ExerciseDetailDto>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        // Membership is the user's own list. The 120 curated rows start saved;
        // any catalogue row can join, and any saved row can leave. The row stays
        // in the table either way, so a logged set never loses its movement.
        group.MapPut("/library/{id:int}", async (int id, AppDbContext db, CancellationToken cancellationToken) =>
            {
                var exercise = await db.Exercises.FirstOrDefaultAsync(row => row.Id == id, cancellationToken);
                if (exercise is null)
                {
                    return Results.Problem(
                        statusCode: StatusCodes.Status404NotFound,
                        title: "Exercise not found",
                        detail: $"No exercise has id {id}.");
                }

                exercise.IsLibrary = true;
                await db.SaveChangesAsync(cancellationToken);
                return Results.NoContent();
            })
            .WithName("SaveLibraryExercise")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapDelete("/library/{id:int}", async (int id, AppDbContext db, CancellationToken cancellationToken) =>
            {
                var exercise = await db.Exercises.FirstOrDefaultAsync(row => row.Id == id, cancellationToken);
                if (exercise is null)
                {
                    return Results.Problem(
                        statusCode: StatusCodes.Status404NotFound,
                        title: "Exercise not found",
                        detail: $"No exercise has id {id}.");
                }

                exercise.IsLibrary = false;
                await db.SaveChangesAsync(cancellationToken);
                return Results.NoContent();
            })
            .WithName("RemoveLibraryExercise")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapGet("/muscles", async (AppDbContext db, CancellationToken cancellationToken) =>
            {
                var muscles = await db.Exercises
                    .AsNoTracking()
                    .Where(exercise => exercise.IsLibrary)
                    .Select(exercise => exercise.PrimaryMuscle)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                var groups = muscles
                    .Select(MuscleGroups.Of)
                    .Distinct()
                    .OrderBy(MuscleGroups.OrderOf)
                    .ToList();

                return Results.Ok(groups);
            })
            .WithName("ListMuscleGroups")
            .Produces<IReadOnlyList<string>>();

        return app;
    }

    private static bool MatchesMuscle(Exercise exercise, string? muscle)
    {
        if (string.IsNullOrWhiteSpace(muscle) || muscle == "all")
        {
            return true;
        }

        return string.Equals(MuscleGroups.Of(exercise.PrimaryMuscle), muscle, StringComparison.OrdinalIgnoreCase);
    }

    private static bool MatchesEquipment(Exercise exercise, string? equipment)
    {
        if (string.IsNullOrWhiteSpace(equipment) || equipment == "all")
        {
            return true;
        }

        return string.Equals(exercise.Equipment, equipment, StringComparison.OrdinalIgnoreCase);
    }

    private static bool MatchesLevel(Exercise exercise, string? level)
    {
        if (string.IsNullOrWhiteSpace(level) || level == "all")
        {
            return true;
        }

        return string.Equals(exercise.Level, level, StringComparison.OrdinalIgnoreCase);
    }
}
