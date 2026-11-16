namespace Cvikarna.Api.Models;

/// <summary>
/// One row of rest preferences. The app is single-owner, so there is no user
/// column: the row at Id 1 is the settings. Per-movement values live in JSON,
/// because nothing queries inside them.
/// </summary>
public class RestSettings
{
    public int Id { get; set; }

    /// <summary>When true, every movement rests for <see cref="UniformValue"/>.</summary>
    public bool Uniform { get; set; }

    public int UniformValue { get; set; } = 90;

    /// <summary>Start the rest automatically when a set is checked.</summary>
    public bool AutoStart { get; set; } = true;

    public bool Sound { get; set; } = true;

    /// <summary>0 to 1.</summary>
    public decimal Volume { get; set; } = 0.6m;

    public bool Vibrate { get; set; } = true;

    /// <summary>Movement id to seconds, as a JSON object.</summary>
    public string ValuesJson { get; set; } = "{}";
}
