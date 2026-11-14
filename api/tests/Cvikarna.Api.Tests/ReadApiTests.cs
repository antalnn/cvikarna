using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Cvikarna.Api.Contracts;
using Cvikarna.Api.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Cvikarna.Api.Tests;

public class ReadApiTests : IClassFixture<ApiFactory>
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _client;

    public ReadApiTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Library_returns_the_120_rich_rows_in_both_languages()
    {
        var rows = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises", Json);

        Assert.NotNull(rows);
        Assert.Equal(120, rows.Count);
        Assert.All(rows, row =>
        {
            Assert.False(string.IsNullOrWhiteSpace(row.NameCs));
            Assert.False(string.IsNullOrWhiteSpace(row.Slug));
            Assert.Equal(2, row.Images.Count);
            Assert.True(row.InstructionsEn.Count >= 2);
            Assert.Equal(row.InstructionsEn.Count, row.InstructionsCs.Count);
            Assert.Equal(row.CuesEn.Count, row.CuesCs.Count);
        });

        var bench = Assert.Single(rows, row => row.Id == 1);
        Assert.Equal("barbell-bench-press", bench.Slug);
        Assert.Equal("Barbell Bench Press", bench.NameEn);
    }

    [Fact]
    public async Task Library_filters_by_muscle_group_and_equipment()
    {
        var chest = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises?muscle=chest", Json);
        Assert.NotNull(chest);
        Assert.NotEmpty(chest);
        Assert.All(chest, row => Assert.Equal("chest", MuscleGroups.Of(row.PrimaryMuscle)));

        var legs = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises?muscle=legs", Json);
        Assert.NotNull(legs);
        Assert.NotEmpty(legs);
        Assert.All(legs, row => Assert.Contains(row.PrimaryMuscle, new[] { "quads", "hamstrings", "glutes", "calves" }));

        var barbell = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises?equipment=barbell", Json);
        Assert.NotNull(barbell);
        Assert.NotEmpty(barbell);
        Assert.All(barbell, row => Assert.Equal("barbell", row.Equipment));

        var combined = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>(
            "/api/exercises?muscle=chest&equipment=barbell", Json);
        Assert.NotNull(combined);
        Assert.All(combined, row =>
        {
            Assert.Equal("chest", MuscleGroups.Of(row.PrimaryMuscle));
            Assert.Equal("barbell", row.Equipment);
        });
    }

    [Fact]
    public async Task Library_search_ignores_diacritics_and_one_typo()
    {
        var byTypo = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises?q=mrty", Json);
        Assert.NotNull(byTypo);
        Assert.Contains(byTypo, row => row.Slug == "barbell-deadlift");

        var byDiacritics = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>(
            $"/api/exercises?q={Uri.EscapeDataString("MRTVÝ")}", Json);
        Assert.NotNull(byDiacritics);
        Assert.Contains(byDiacritics, row => row.Slug == "barbell-deadlift");

        // "flies" is one changed letter from the alias "reverse flyes".
        var byAlias = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>(
            $"/api/exercises?q={Uri.EscapeDataString("reverse flies")}", Json);
        Assert.NotNull(byAlias);
        Assert.Contains(byAlias, row => row.Slug == "reverse-fly");

        var empty = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises?q=xyzzy", Json);
        Assert.NotNull(empty);
        Assert.Empty(empty);
    }

    [Fact]
    public async Task Library_detail_returns_one_row_and_a_problem_details_404()
    {
        var row = await _client.GetFromJsonAsync<ExerciseDetailDto>("/api/exercises/1", Json);
        Assert.NotNull(row);
        Assert.Equal("Bench press na vodorovné lavici", row.NameCs);

        var missing = await _client.GetAsync("/api/exercises/999999");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        Assert.Equal("application/problem+json", missing.Content.Headers.ContentType?.MediaType);

        var problem = await missing.Content.ReadFromJsonAsync<ProblemDetails>(Json);
        Assert.NotNull(problem);
        Assert.Equal(404, problem.Status);
        Assert.Contains("999999", problem.Detail);
    }

    [Fact]
    public async Task Catalogue_pages_20_rows_with_the_common_movements_first()
    {
        var page1 = await _client.GetFromJsonAsync<CataloguePageDto>("/api/catalogue", Json);
        Assert.NotNull(page1);
        Assert.Equal(876, page1.Total);
        Assert.Equal(20, page1.Items.Count);
        Assert.True(page1.Items[0].IsLibrary);
        Assert.Equal(1, page1.Items[0].Id);

        var page2 = await _client.GetFromJsonAsync<CataloguePageDto>("/api/catalogue?page=2", Json);
        Assert.NotNull(page2);
        Assert.Equal(20, page2.Items.Count);
        Assert.Empty(page1.Items.Select(row => row.Id).Intersect(page2.Items.Select(row => row.Id)));

        // Search also reads aliases, so a match may not carry the word in NameEn.
        var bench = await _client.GetFromJsonAsync<CataloguePageDto>("/api/catalogue?q=bench", Json);
        Assert.NotNull(bench);
        Assert.True(bench.Total > 0);
        Assert.Contains(bench.Items, row => row.NameEn.Contains("Bench", StringComparison.OrdinalIgnoreCase));

        var clamped = await _client.GetFromJsonAsync<CataloguePageDto>("/api/catalogue?pageSize=500", Json);
        Assert.NotNull(clamped);
        Assert.Equal(100, clamped.PageSize);
        Assert.Equal(100, clamped.Items.Count);

        var chestBarbell = await _client.GetFromJsonAsync<CataloguePageDto>(
            "/api/catalogue?muscle=chest&equipment=barbell",
            Json);
        Assert.NotNull(chestBarbell);
        Assert.True(chestBarbell.Total > 0);
        Assert.All(chestBarbell.Items, row =>
        {
            Assert.Equal("chest", MuscleGroups.Of(row.PrimaryMuscle));
            Assert.Equal("barbell", row.Equipment);
        });
    }

    [Fact]
    public async Task Library_and_catalogue_filter_by_level()
    {
        var beginner = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises?level=beginner", Json);
        Assert.NotNull(beginner);
        Assert.NotEmpty(beginner);
        Assert.All(beginner, row => Assert.Equal("beginner", row.Level));
        Assert.DoesNotContain(beginner, row => row.Level == "expert");

        var experts = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises?level=expert", Json);
        Assert.NotNull(experts);
        Assert.NotEmpty(experts);
        Assert.All(experts, row => Assert.Equal("expert", row.Level));

        var all = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>("/api/exercises?level=all", Json);
        Assert.NotNull(all);
        Assert.Equal(120, all.Count);

        var combined = await _client.GetFromJsonAsync<List<ExerciseDetailDto>>(
            "/api/exercises?level=beginner&muscle=chest&equipment=barbell", Json);
        Assert.NotNull(combined);
        Assert.All(combined, row =>
        {
            Assert.Equal("beginner", row.Level);
            Assert.Equal("chest", MuscleGroups.Of(row.PrimaryMuscle));
            Assert.Equal("barbell", row.Equipment);
        });

        var catalogue = await _client.GetFromJsonAsync<CataloguePageDto>("/api/catalogue?level=expert", Json);
        Assert.NotNull(catalogue);
        Assert.True(catalogue.Total > 0);
        Assert.All(catalogue.Items, row => Assert.Equal("expert", row.Level));
    }

    [Fact]
    public async Task Catalogue_detail_and_muscle_groups_answer_or_404()
    {
        var page = await _client.GetFromJsonAsync<CataloguePageDto>("/api/catalogue", Json);
        var first = Assert.IsType<CataloguePageDto>(page).Items[0];

        var row = await _client.GetFromJsonAsync<CatalogueRowDto>($"/api/catalogue/{first.Id}", Json);
        Assert.NotNull(row);
        Assert.Equal(first.SourceId, row.SourceId);

        var thin = await _client.GetFromJsonAsync<CataloguePageDto>(
            $"/api/catalogue?q={Uri.EscapeDataString("box squat")}",
            Json);
        Assert.NotNull(thin);
        var thinRow = thin.Items.First(row => !row.IsLibrary);
        Assert.Null(thinRow.NameCs);

        var thinDetail = await _client.GetFromJsonAsync<CatalogueRowDto>($"/api/catalogue/{thinRow.Id}", Json);
        Assert.NotNull(thinDetail);
        Assert.Null(thinDetail.NameCs);

        var missing = await _client.GetAsync("/api/catalogue/999999");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        Assert.Equal("application/problem+json", missing.Content.Headers.ContentType?.MediaType);

        var muscles = await _client.GetFromJsonAsync<List<string>>("/api/muscles", Json);
        Assert.NotNull(muscles);
        Assert.Equal(MuscleGroups.All, muscles);
    }
}
