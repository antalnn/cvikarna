using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cvikarna.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSetPosition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LoggedSets_WorkoutExerciseId",
                table: "LoggedSets");

            migrationBuilder.AddColumn<int>(
                name: "Position",
                table: "LoggedSets",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            // Backfill from Id so every existing exercise keeps the order it was logged in.
            migrationBuilder.Sql("UPDATE \"LoggedSets\" SET \"Position\" = \"Id\";");

            migrationBuilder.CreateIndex(
                name: "IX_LoggedSets_WorkoutExerciseId_Position",
                table: "LoggedSets",
                columns: new[] { "WorkoutExerciseId", "Position" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LoggedSets_WorkoutExerciseId_Position",
                table: "LoggedSets");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "LoggedSets");

            migrationBuilder.CreateIndex(
                name: "IX_LoggedSets_WorkoutExerciseId",
                table: "LoggedSets",
                column: "WorkoutExerciseId");
        }
    }
}
