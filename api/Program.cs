using Cvikarna.Api.Data;
using Cvikarna.Api.Endpoints;
using Cvikarna.Api.Seed;
using Cvikarna.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=cvikarna.db"));
builder.Services.AddProblemDetails();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<StatsService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseStaticFiles();

app.MapGet("/health", () => Results.Ok(new { status = "ok" })).WithTags("Health");
app.MapExerciseEndpoints();
app.MapCatalogueEndpoints();
app.MapWorkoutEndpoints();
app.MapStatsEndpoints();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DatabaseInitializer.InitializeAsync(db, app.Environment.ContentRootPath, app.Logger);
}

app.Run();

public partial class Program { }
