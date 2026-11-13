using Cvikarna.Api.Seed;

namespace Cvikarna.Api.Tests;

public class CatalogueIdTests
{
    [Fact]
    public void The_same_source_id_always_gets_the_same_numeric_id()
    {
        var first = DatabaseInitializer.StableCatalogueId("Reverse_Flyes", []);
        var second = DatabaseInitializer.StableCatalogueId("Reverse_Flyes", []);

        Assert.Equal(first, second);
        Assert.True(first >= 1000);
    }

    [Fact]
    public void Different_source_ids_get_different_ids()
    {
        var used = new HashSet<int>();
        var rows = Enumerable.Range(0, 876)
            .Select(index => DatabaseInitializer.StableCatalogueId($"catalogue_{index}", used))
            .ToList();

        Assert.Equal(876, rows.Distinct().Count());
        Assert.Equal(876, used.Count);
    }

    [Fact]
    public void A_collision_probes_to_the_next_free_id()
    {
        var sourceId = "Reverse_Flyes";
        var first = DatabaseInitializer.StableCatalogueId(sourceId, []);
        var used = new HashSet<int> { first };

        var second = DatabaseInitializer.StableCatalogueId(sourceId, used);

        Assert.Equal(first + 1, second);
        Assert.Contains(first, used);
        Assert.Contains(second, used);
    }
}
