using Cvikarna.Api.Contracts;
using Cvikarna.Api.Services;

namespace Cvikarna.Api.Endpoints;

public static class StatsEndpoints
{
    public static IEndpointRouteBuilder MapStatsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/stats", async (
                int exerciseId,
                StatsService stats,
                TimeProvider time,
                CancellationToken cancellationToken) =>
            {
                var today = DateOnly.FromDateTime(time.GetLocalNow().DateTime);
                var result = await stats.GetAsync(exerciseId, today, cancellationToken);

                return result is null
                    ? Results.Problem(
                        statusCode: StatusCodes.Status404NotFound,
                        title: "Exercise not found",
                        detail: $"No exercise has id {exerciseId}.")
                    : Results.Ok(result);
            })
            .WithTags("Stats")
            .WithName("GetExerciseStats")
            .Produces<ExerciseStatsDto>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }
}
