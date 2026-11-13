using System.Globalization;
using System.Text;

namespace Cvikarna.Api.Search;

/// <summary>
/// The same rule as the frontend: case- and diacritic-insensitive tokens, a
/// substring hit for short queries, and one inserted, deleted or changed letter
/// for tokens of four characters or more. "mrty" finds "mrtvý tah" and
/// "reverse flies" finds "reverse flyes" through the aliases.
/// </summary>
public static class ExerciseSearch
{
    private static readonly Dictionary<char, char> Diacritics = new()
    {
        ['á'] = 'a',
        ['ä'] = 'a',
        ['č'] = 'c',
        ['ď'] = 'd',
        ['é'] = 'e',
        ['ě'] = 'e',
        ['í'] = 'i',
        ['ň'] = 'n',
        ['ó'] = 'o',
        ['ô'] = 'o',
        ['ř'] = 'r',
        ['š'] = 's',
        ['ť'] = 't',
        ['ú'] = 'u',
        ['ů'] = 'u',
        ['ý'] = 'y',
        ['ž'] = 'z',
        ['ł'] = 'l',
    };

    public static string Normalize(string value)
    {
        var lowered = value.ToLowerInvariant();
        var decomposed = lowered.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);

        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            builder.Append(Diacritics.TryGetValue(character, out var plain) ? plain : character);
        }

        return builder.ToString();
    }

    public static bool Matches(string? text, string? query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return true;
        }

        var haystack = Tokenize(text);
        var wanted = Tokenize(query);

        foreach (var token in wanted)
        {
            var found = haystack.Any(candidate => candidate.Contains(token, StringComparison.Ordinal));

            if (!found && token.Length >= 4)
            {
                found = haystack.Any(candidate => WithinOneEdit(token, candidate));
            }

            if (!found)
            {
                return false;
            }
        }

        return true;
    }

    public static bool Matches(string nameEn, string? nameCs, IEnumerable<string> aliasesEn, IEnumerable<string> aliasesCs, string? query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return true;
        }

        var text = string.Join(' ', new[] { nameEn, nameCs }.Concat(aliasesEn).Concat(aliasesCs));
        return Matches(text, query);
    }

    public static bool WithinOneEdit(string a, string b)
    {
        if (Math.Abs(a.Length - b.Length) > 1)
        {
            return false;
        }

        var i = 0;
        var j = 0;
        var edits = 0;

        while (i < a.Length && j < b.Length)
        {
            if (a[i] == b[j])
            {
                i++;
                j++;
                continue;
            }

            if (++edits > 1)
            {
                return false;
            }

            if (a.Length > b.Length)
            {
                i++;
            }
            else if (b.Length > a.Length)
            {
                j++;
            }
            else
            {
                i++;
                j++;
            }
        }

        if (i < a.Length || j < b.Length)
        {
            edits++;
        }

        return edits <= 1;
    }

    private static string[] Tokenize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return [];
        }

        return Normalize(value)
            .Split([' ', '-', '_', '/', ',', '.', '(', ')', '\''], StringSplitOptions.RemoveEmptyEntries);
    }
}
