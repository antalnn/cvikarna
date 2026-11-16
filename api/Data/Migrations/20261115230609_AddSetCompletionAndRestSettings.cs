using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cvikarna.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSetCompletionAndRestSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Completed",
                table: "LoggedSets",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "RestSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Uniform = table.Column<bool>(type: "INTEGER", nullable: false),
                    UniformValue = table.Column<int>(type: "INTEGER", nullable: false),
                    AutoStart = table.Column<bool>(type: "INTEGER", nullable: false),
                    Sound = table.Column<bool>(type: "INTEGER", nullable: false),
                    Volume = table.Column<decimal>(type: "TEXT", precision: 3, scale: 2, nullable: false),
                    Vibrate = table.Column<bool>(type: "INTEGER", nullable: false),
                    ValuesJson = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RestSettings");

            migrationBuilder.DropColumn(
                name: "Completed",
                table: "LoggedSets");
        }
    }
}
