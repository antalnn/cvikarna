using Cvikarna.Api.Contracts;
using Cvikarna.Api.Services;

namespace Cvikarna.Api.Endpoints;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/dashboard", async (
                DashboardService dashboard,
                TimeProvider time,
                CancellationToken cancellationToken) =>
            {
                var today = DateOnly.FromDateTime(time.GetLocalNow().DateTime);
                return Results.Ok(await dashboard.GetAsync(today, cancellationToken));
            })
            .WithTags("Dashboard")
            .WithName("GetDashboard")
            .Produces<DashboardDto>();

        return app;
    }
}
