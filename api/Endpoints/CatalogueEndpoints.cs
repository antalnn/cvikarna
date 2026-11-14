using Cvikarna.Api.Contracts;
using Cvikarna.Api.Data;
using Cvikarna.Api.Domain;
using Cvikarna.Api.Models;
using Cvikarna.Api.Search;
using Microsoft.EntityFrameworkCore;

namespace Cvikarna.Api.Endpoints;

public static class CatalogueEndpoints
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    public static IEndpointRouteBuilder MapCatalogueEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/catalogue").WithTags("Catalogue");

        group.MapGet("", async (
                AppDbContext db,
                string? muscle,
                string? equipment,
                string? level,
                string? q,
                int? page,
                int? pageSize,
                CancellationToken cancellationToken) =>
            {
                // 876 thin rows fit in memory, and the search rule (diacritics,
                // one typo per word) cannot run in SQLite. Load, filter, then page.
                var rows = await db.Exercises
                    .AsNoTracking()
                    .OrderByDescending(exercise => exercise.IsLibrary)
                    .ThenBy(exercise => exercise.IsLibrary ? exercise.Id : int.MaxValue)
                    .ThenBy(exercise => exercise.NameEn)
                    .ToListAsync(cancellationToken);

                var filtered = rows
                    .Where(exercise => MatchesMuscle(exercise, muscle))
                    .Where(exercise => MatchesEquipment(exercise, equipment))
                    .Where(exercise => MatchesLevel(exercise, level))
                    .Where(exercise => ExerciseSearch.Matches(
                        exercise.NameEn,
                        exercise.NameCs,
                        exercise.AliasesEn,
                        exercise.AliasesCs,
                        q))
                    .ToList();

                var currentPage = Math.Max(1, page ?? 1);
                var currentPageSize = Math.Clamp(pageSize ?? DefaultPageSize, 1, MaxPageSize);
                var items = filtered
                    .Skip((currentPage - 1) * currentPageSize)
                    .Take(currentPageSize)
                    .Select(CatalogueRowDto.From)
                    .ToList();

                return Results.Ok(new CataloguePageDto(items, currentPage, currentPageSize, filtered.Count));
            })
            .WithName("ListCatalogue")
            .Produces<CataloguePageDto>();

        group.MapGet("/{id:int}", async (int id, AppDbContext db, CancellationToken cancellationToken) =>
            {
                var exercise = await db.Exercises
                    .AsNoTracking()
                    .FirstOrDefaultAsync(row => row.Id == id, cancellationToken);

                return exercise is null
                    ? Results.Problem(
                        statusCode: StatusCodes.Status404NotFound,
                        title: "Catalogue row not found",
                        detail: $"No exercise has id {id}.")
                    : Results.Ok(CatalogueRowDto.From(exercise));
            })
            .WithName("GetCatalogueRow")
            .Produces<CatalogueRowDto>()
            .ProducesProblem(StatusCodes.Status404NotFound);

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
