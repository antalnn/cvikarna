using Cvikarna.Api.Search;

namespace Cvikarna.Api.Tests;

public class SearchTests
{
    [Fact]
    public void Normalize_strips_case_and_czech_diacritics()
    {
        Assert.Equal("mrtvy tah", ExerciseSearch.Normalize("Mrtvý tah"));
        Assert.Equal("drep s cinkou", ExerciseSearch.Normalize("Dřep s činkou"));
        Assert.Equal("priplatek", ExerciseSearch.Normalize("PŘÍPLATEK"));
    }

    [Fact]
    public void Search_finds_the_czech_name_without_diacritics()
    {
        Assert.True(ExerciseSearch.Matches("Mrtvý tah", "mrty"));
        Assert.True(ExerciseSearch.Matches("Mrtvý tah", "MRTVÝ"));
        Assert.True(ExerciseSearch.Matches("Dřep s činkou", "drep"));
    }

    [Fact]
    public void Search_allows_one_typo_in_a_word_of_four_or_more_letters()
    {
        Assert.True(ExerciseSearch.Matches("Reverse Flyes", "reverse flies"));
        Assert.True(ExerciseSearch.WithinOneEdit("flies", "flyes"));
        Assert.True(ExerciseSearch.WithinOneEdit("mrty", "mrtvy"));
        Assert.True(ExerciseSearch.WithinOneEdit("bench", "bnch"));
    }

    [Fact]
    public void Short_tokens_use_plain_substring_matching_only()
    {
        Assert.True(ExerciseSearch.Matches("lat pulldown", "lat"));
        Assert.False(ExerciseSearch.Matches("lat pulldown", "atl"));
        Assert.False(ExerciseSearch.WithinOneEdit("fly", "flies"));
    }

    [Fact]
    public void Every_query_token_has_to_match_some_candidate_token()
    {
        Assert.True(ExerciseSearch.Matches("Barbell Bench Press", "barbell press"));
        Assert.False(ExerciseSearch.Matches("Barbell Bench Press", "barbell squat"));
        Assert.True(ExerciseSearch.Matches("Barbell Bench Press", "  "));
    }

    [Fact]
    public void Alias_and_czech_fields_are_searched_together()
    {
        Assert.True(ExerciseSearch.Matches(
            "Reverse Fly",
            "Upažování s jednoručkami v předklonu",
            ["reverse pec deck", "rear delt fly", "reverse flyes"],
            ["reverse fly", "zadní ramena"],
            "reverse flies"));

        Assert.True(ExerciseSearch.Matches(
            "Reverse Fly",
            "Upažování s jednoručkami v předklonu",
            ["reverse pec deck"],
            ["zadní ramena"],
            "zadni"));
    }
}
