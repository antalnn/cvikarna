using Cvikarna.Api.Contracts;
using Cvikarna.Api.Data;
using Cvikarna.Api.Domain;
using Cvikarna.Api.Models;
using Cvikarna.Api.Search;
using Microsoft.EntityFrameworkCore;

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
                string? q,
                CancellationToken cancellationToken) =>
            {
                var rows = await db.Exercises
                    .AsNoTracking()
                    .Where(exercise => exercise.IsLibrary)
                    .OrderBy(exercise => exercise.Id)
                    .ToListAsync(cancellationToken);

                var filtered = rows
                    .Where(exercise => MatchesMuscle(exercise, muscle))
                    .Where(exercise => MatchesEquipment(exercise, equipment))
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
                    .FirstOrDefaultAsync(row => row.Id == id && row.IsLibrary, cancellationToken);

                return exercise is null
                    ? Results.Problem(
                        statusCode: StatusCodes.Status404NotFound,
                        title: "Exercise not found",
                        detail: $"No library exercise has id {id}.")
                    : Results.Ok(ExerciseDetailDto.From(exercise));
            })
            .WithName("GetLibraryExercise")
            .Produces<ExerciseDetailDto>()
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
}
