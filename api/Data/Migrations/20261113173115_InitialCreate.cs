using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cvikarna.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Exercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SourceId = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    IsLibrary = table.Column<bool>(type: "INTEGER", nullable: false),
                    CoverIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    NameEn = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    NameCs = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    AliasesEn = table.Column<string>(type: "TEXT", nullable: false),
                    AliasesCs = table.Column<string>(type: "TEXT", nullable: false),
                    PrimaryMuscle = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    SecondaryMuscles = table.Column<string>(type: "TEXT", nullable: false),
                    Equipment = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true),
                    Level = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    InstructionsEn = table.Column<string>(type: "TEXT", nullable: false),
                    InstructionsCs = table.Column<string>(type: "TEXT", nullable: false),
                    CuesEn = table.Column<string>(type: "TEXT", nullable: false),
                    CuesCs = table.Column<string>(type: "TEXT", nullable: false),
                    Images = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exercises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Workouts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PerformedOn = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workouts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkoutExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WorkoutId = table.Column<int>(type: "INTEGER", nullable: false),
                    ExerciseId = table.Column<int>(type: "INTEGER", nullable: false),
                    Position = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutExercises_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkoutExercises_Workouts_WorkoutId",
                        column: x => x.WorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoggedSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WorkoutExerciseId = table.Column<int>(type: "INTEGER", nullable: false),
                    WeightKg = table.Column<decimal>(type: "TEXT", nullable: false),
                    Reps = table.Column<int>(type: "INTEGER", nullable: false),
                    Rpe = table.Column<decimal>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoggedSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoggedSets_WorkoutExercises_WorkoutExerciseId",
                        column: x => x.WorkoutExerciseId,
                        principalTable: "WorkoutExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_SourceId",
                table: "Exercises",
                column: "SourceId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoggedSets_WorkoutExerciseId",
                table: "LoggedSets",
                column: "WorkoutExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutExercises_ExerciseId",
                table: "WorkoutExercises",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutExercises_WorkoutId_Position",
                table: "WorkoutExercises",
                columns: new[] { "WorkoutId", "Position" });

            migrationBuilder.CreateIndex(
                name: "IX_Workouts_PerformedOn",
                table: "Workouts",
                column: "PerformedOn",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LoggedSets");

            migrationBuilder.DropTable(
                name: "WorkoutExercises");

            migrationBuilder.DropTable(
                name: "Exercises");

            migrationBuilder.DropTable(
                name: "Workouts");
        }
    }
}
