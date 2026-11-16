using System.Text.Json;
using Cvikarna.Api.Contracts;
using Cvikarna.Api.Data;
using Cvikarna.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Cvikarna.Api.Endpoints;

public static class SettingsEndpoints
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/settings").WithTags("Settings");

        group.MapGet("/rest", async (AppDbContext db, CancellationToken cancellationToken) =>
            {
                var row = await db.RestSettings.AsNoTracking().OrderBy(row => row.Id).FirstOrDefaultAsync(cancellationToken);
                return Results.Ok(ToDto(row));
            })
            .WithName("GetRestSettings")
            .Produces<RestSettingsDto>();

        group.MapPut("/rest", async (
                UpdateRestSettingsRequest request,
                AppDbContext db,
                CancellationToken cancellationToken) =>
            {
                var errors = new Dictionary<string, string[]>();

                if (request.UniformValue is < 5 or > 900)
                {
                    errors["uniformValue"] = ["A rest is between 5 and 900 seconds."];
                }

                if (request.Volume is < 0 or > 1)
                {
                    errors["volume"] = ["Volume is between 0 and 1."];
                }

                var values = new Dictionary<string, int>(StringComparer.Ordinal);
                foreach (var (key, seconds) in request.Values ?? new Dictionary<string, int>())
                {
                    if (!int.TryParse(key, out _))
                    {
                        errors["values"] = ["Movement keys must be numeric ids."];
                        break;
                    }

                    if (seconds is < 5 or > 900)
                    {
                        errors["values"] = ["Every movement rest is between 5 and 900 seconds."];
                        break;
                    }

                    values[key] = seconds;
                }

                if (errors.Count > 0)
                {
                    return Results.ValidationProblem(errors);
                }

                var row = await db.RestSettings.OrderBy(row => row.Id).FirstOrDefaultAsync(cancellationToken);
                if (row is null)
                {
                    row = new RestSettings { Id = 1 };
                    db.RestSettings.Add(row);
                }

                row.Uniform = request.Uniform;
                row.UniformValue = request.UniformValue;
                row.AutoStart = request.Auto;
                row.Sound = request.Sound;
                row.Volume = request.Volume;
                row.Vibrate = request.Vibrate;
                row.ValuesJson = JsonSerializer.Serialize(values, Json);

                await db.SaveChangesAsync(cancellationToken);
                return Results.Ok(ToDto(row));
            })
            .WithName("SaveRestSettings")
            .Produces<RestSettingsDto>()
            .ProducesValidationProblem();

        return app;
    }

    private static RestSettingsDto ToDto(RestSettings? row)
    {
        if (row is null)
        {
            return new RestSettingsDto(false, 90, true, true, 0.6m, true, new Dictionary<string, int>());
        }

        var values = new Dictionary<string, int>();
        try
        {
            values = JsonSerializer.Deserialize<Dictionary<string, int>>(row.ValuesJson, Json) ?? [];
        }
        catch (JsonException)
        {
            // A corrupt settings blob falls back to no per-movement values.
        }

        return new RestSettingsDto(
            row.Uniform,
            row.UniformValue,
            row.AutoStart,
            row.Sound,
            row.Volume,
            row.Vibrate,
            values);
    }
}

