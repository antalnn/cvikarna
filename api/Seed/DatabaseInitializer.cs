using System.Text;
using System.Text.Json;
using Cvikarna.Api.Data;
using Cvikarna.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Cvikarna.Api.Seed;

/// <summary>
/// Applies migrations and loads the two seed files. Idempotent: rows are keyed
/// by SourceId, so a restart updates the same rows instead of duplicating them.
/// </summary>
public static class DatabaseInitializer
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static async Task InitializeAsync(
        AppDbContext db,
        string contentRoot,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        await db.Database.MigrateAsync(cancellationToken);

        var seedDirectory = ResolveSeedDirectory(contentRoot);
        var library = await ReadAsync<List<LibrarySeedRow>>(Path.Combine(seedDirectory, "exercises.json"), cancellationToken);
        var catalogue = await ReadAsync<List<CatalogueSeedRow>>(Path.Combine(seedDirectory, "catalogue.json"), cancellationToken);

        var existing = await db.Exercises.ToListAsync(cancellationToken);
        var bySourceId = existing.ToDictionary(entity => entity.SourceId, StringComparer.Ordinal);
        var usedIds = existing.Select(entity => entity.Id).ToHashSet();

        foreach (var row in library)
        {
            if (!bySourceId.TryGetValue(row.SourceId, out var entity))
            {
                entity = new Exercise { Id = row.Id, SourceId = row.SourceId };
                db.Exercises.Add(entity);
                bySourceId[row.SourceId] = entity;
                usedIds.Add(entity.Id);
            }

            ApplyLibraryRow(row, entity);
        }

        await db.SaveChangesAsync(cancellationToken);

        // The curated rows are already in the table and keep their rich data;
        // the catalogue only adds the movements the library does not curate.
        foreach (var row in catalogue.OrderBy(row => row.SourceId, StringComparer.Ordinal))
        {
            if (bySourceId.ContainsKey(row.SourceId))
            {
                continue;
            }

            var entity = new Exercise
            {
                Id = StableCatalogueId(row.SourceId, usedIds),
                SourceId = row.SourceId,
                IsLibrary = false,
                NameEn = row.NameEn,
                NameCs = row.NameCs,
                PrimaryMuscle = row.PrimaryMuscle,
                Equipment = row.Equipment,
                Level = row.Level,
            };

            db.Exercises.Add(entity);
            bySourceId[row.SourceId] = entity;
        }

        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Seed ready: {Library} library rows and {Catalogue} catalogue rows",
            library.Count,
            catalogue.Count);
    }

    /// <summary>
    /// Catalogue ids derive from SourceId, never from array order: adding or
    /// reordering a row cannot repoint a logged set at another movement.
    /// </summary>
    public static int StableCatalogueId(string sourceId, HashSet<int> usedIds)
    {
        var hash = 2166136261u;
        foreach (var value in Encoding.UTF8.GetBytes($"catalogue:{sourceId}"))
        {
            hash ^= value;
            hash *= 16777619u;
        }

        var candidate = 1000 + (int)(hash % 2_000_000_000u);

        while (!usedIds.Add(candidate))
        {
            candidate = candidate >= 2_000_000_999 ? 1000 : candidate + 1;
        }

        return candidate;
    }

    private static void ApplyLibraryRow(LibrarySeedRow row, Exercise entity)
    {
        entity.Slug = row.Slug;
        entity.IsLibrary = true;
        entity.CoverIndex = row.CoverIndex;
        entity.NameEn = row.NameEn;
        entity.NameCs = row.NameCs;
        entity.AliasesEn = row.AliasesEn;
        entity.AliasesCs = row.AliasesCs;
        entity.PrimaryMuscle = row.PrimaryMuscle;
        entity.SecondaryMuscles = row.SecondaryMuscles;
        entity.Equipment = row.Equipment;
        entity.Level = row.Level;
        entity.InstructionsEn = row.InstructionsEn;
        entity.InstructionsCs = row.InstructionsCs;
        entity.CuesEn = row.CuesEn;
        entity.CuesCs = row.CuesCs;
        entity.Images = row.Images;
    }

    private static async Task<T> ReadAsync<T>(string path, CancellationToken cancellationToken)
    {
        if (!File.Exists(path))
        {
            throw new FileNotFoundException($"Seed file missing: {path}", path);
        }

        await using var stream = File.OpenRead(path);
        var value = await JsonSerializer.DeserializeAsync<T>(stream, JsonOptions, cancellationToken);
        return value ?? throw new InvalidOperationException($"Seed file is empty: {path}");
    }

    private static string ResolveSeedDirectory(string contentRoot)
    {
        var candidates = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Seed"),
            Path.Combine(contentRoot, "Seed"),
        };

        foreach (var candidate in candidates)
        {
            if (File.Exists(Path.Combine(candidate, "exercises.json")))
            {
                return candidate;
            }
        }

        throw new DirectoryNotFoundException(
            $"Seed directory not found. Looked in: {string.Join(", ", candidates)}");
    }
}
