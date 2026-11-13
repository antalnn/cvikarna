using System.Text.Json;
using Cvikarna.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Cvikarna.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutExercise> WorkoutExercises => Set<WorkoutExercise>();
    public DbSet<LoggedSet> LoggedSets => Set<LoggedSet>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasIndex(e => e.SourceId).IsUnique();
            entity.Property(e => e.SourceId).HasMaxLength(200);
            entity.Property(e => e.Slug).HasMaxLength(200);
            entity.Property(e => e.NameEn).HasMaxLength(200);
            entity.Property(e => e.NameCs).HasMaxLength(200);
            entity.Property(e => e.PrimaryMuscle).HasMaxLength(40);
            entity.Property(e => e.Equipment).HasMaxLength(40);
            entity.Property(e => e.Level).HasMaxLength(40);

            // Nothing queries inside these arrays, so child tables would be cost
            // without benefit. JSON columns keep one row per movement.
            ConfigureStringList(entity.Property(e => e.AliasesEn));
            ConfigureStringList(entity.Property(e => e.AliasesCs));
            ConfigureStringList(entity.Property(e => e.SecondaryMuscles));
            ConfigureStringList(entity.Property(e => e.InstructionsEn));
            ConfigureStringList(entity.Property(e => e.InstructionsCs));
            ConfigureStringList(entity.Property(e => e.CuesEn));
            ConfigureStringList(entity.Property(e => e.CuesCs));
            ConfigureStringList(entity.Property(e => e.Images));
        });

        modelBuilder.Entity<Workout>(entity =>
        {
            // One open workout per date; opening the tracker twice returns the same row.
            entity.HasIndex(w => w.PerformedOn).IsUnique();
        });

        modelBuilder.Entity<WorkoutExercise>(entity =>
        {
            entity.HasIndex(e => new { e.WorkoutId, e.Position });

            entity
                .HasOne(e => e.Workout)
                .WithMany(w => w.Exercises)
                .HasForeignKey(e => e.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(e => e.Exercise)
                .WithMany(x => x.WorkoutExercises)
                .HasForeignKey(e => e.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<LoggedSet>(entity =>
        {
            entity
                .HasOne(s => s.WorkoutExercise)
                .WithMany(e => e.Sets)
                .HasForeignKey(s => s.WorkoutExerciseId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureStringList(PropertyBuilder<List<string>> property)
    {
        var converter = new ValueConverter<List<string>, string>(
            value => JsonSerializer.Serialize(value, (JsonSerializerOptions?)null),
            value => JsonSerializer.Deserialize<List<string>>(value, (JsonSerializerOptions?)null) ?? new List<string>());

        var comparer = new ValueComparer<List<string>>(
            (left, right) => left != null && right != null && left.SequenceEqual(right),
            value => value.Aggregate(0, (hash, item) => HashCode.Combine(hash, item)),
            value => value.ToList());

        property.HasConversion(converter, comparer);
    }
}
