import type { Language } from "../../i18n/dictionary";

interface DiagramProps {
  language: Language;
}

const labels = {
  cs: {
    strength: "Síla",
    bigLifts: "Velké cviky",
    isolation: "Izolace",
    endurance: "Vytrvalost",
    reps: "opakování",
    dose: "g bílkovin na kg hmotnosti",
    benefit: "relativní přínos",
    less: "méně než 6 h",
    band: "7 až 9 h",
    more: "víc než 10 h",
    hours: "hodiny spánku",
  },
  en: {
    strength: "Strength",
    bigLifts: "Big lifts",
    isolation: "Isolation",
    endurance: "Endurance",
    reps: "reps",
    dose: "g protein per kg bodyweight",
    benefit: "relative benefit",
    less: "under 6 h",
    band: "7 to 9 h",
    more: "over 10 h",
    hours: "hours of sleep",
  },
} as const;

/** Rep-range spread: four bands on one rep axis. */
export function RepsDiagram({ language }: DiagramProps) {
  const text = labels[language];
  const x = (rep: number) => 78 + (rep - 1) * (462 / 29);
  const rows = [
    { label: text.strength, from: 1, to: 5, fill: "var(--surface-3)", ink: "var(--text-muted)" },
    { label: text.bigLifts, from: 6, to: 12, fill: "var(--accent)", ink: "var(--accent-ink)" },
    { label: text.isolation, from: 10, to: 20, fill: "var(--accent)", ink: "var(--accent-ink)", opacity: 0.42 },
    { label: text.endurance, from: 15, to: 30, fill: "var(--surface-3)", ink: "var(--text-muted)" },
  ];

  return (
    <svg
      className="guide-diagram"
      viewBox="0 0 560 214"
      role="img"
      aria-labelledby="reps-diagram-title"
    >
      <title id="reps-diagram-title">
        {language === "cs"
          ? "Rozsahy opakování pro sílu, velké cviky, izolaci a vytrvalost"
          : "Rep ranges for strength, big lifts, isolation and endurance"}
      </title>

      {rows.map((row, index) => {
        const y = 22 + index * 40;
        return (
          <g key={row.label}>
            <text x="0" y={y + 15} fill="var(--text-muted)" fontSize="12.5">
              {row.label}
            </text>
            <rect
              x={x(row.from)}
              y={y}
              width={x(row.to) - x(row.from)}
              height="22"
              rx="6"
              fill={row.fill}
              opacity={row.opacity ?? 1}
            />
            <text
              x={x(row.from) + 8}
              y={y + 15}
              fill={row.ink}
              fontSize="11.5"
              fontWeight="700"
            >
              {row.from}–{row.to}
            </text>
          </g>
        );
      })}

      <line x1="78" y1="182" x2="540" y2="182" stroke="var(--line)" strokeWidth="1" />
      {[1, 5, 10, 15, 20, 25, 30].map((rep) => (
        <g key={rep}>
          <line x1={x(rep)} y1="182" x2={x(rep)} y2="187" stroke="var(--line)" strokeWidth="1" />
          <text x={x(rep)} y="202" fill="var(--text-dim)" fontSize="11" textAnchor="middle">
            {rep}
          </text>
        </g>
      ))}
      <text x="540" y="176" fill="var(--text-dim)" fontSize="11" textAnchor="end">
        {text.reps}
      </text>
    </svg>
  );
}

/** Protein dose curve flattening at 1.6 g/kg, with the confidence band. */
export function ProteinDiagram({ language }: DiagramProps) {
  const text = labels[language];
  const x = (dose: number) => 56 + (dose / 3.2) * 484;
  const y = (gain: number) => 150 - (gain / 100) * 126;
  const points: Array<[number, number]> = [
    [0, 8],
    [0.4, 30],
    [0.8, 55],
    [1.2, 75],
    [1.6, 88],
    [2.0, 91],
    [2.6, 92],
    [3.2, 92],
  ];

  return (
    <svg
      className="guide-diagram"
      viewBox="0 0 560 196"
      role="img"
      aria-labelledby="protein-diagram-title"
    >
      <title id="protein-diagram-title">
        {language === "cs"
          ? "Křivka přínosu bílkovin se zplošťuje kolem 1,6 gramu na kilogram"
          : "The protein benefit curve flattens around 1.6 grams per kilogram"}
      </title>

      <rect
        x={x(1.6)}
        y={y(100)}
        width={x(2.2) - x(1.6)}
        height={y(0) - y(100)}
        fill="var(--accent)"
        opacity="0.12"
      />

      <polyline
        points={points.map(([dose, gain]) => `${x(dose)},${y(gain)}`).join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {[1.6, 2.2].map((dose) => (
        <line
          key={dose}
          x1={x(dose)}
          y1={y(98)}
          x2={x(dose)}
          y2={y(0)}
          stroke="var(--text-dim)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}
      <text x={x(1.6)} y={y(98) - 6} fill="var(--text-muted)" fontSize="11.5" textAnchor="middle">
        1,6
      </text>
      <text x={x(2.2)} y={y(98) - 6} fill="var(--text-dim)" fontSize="11.5" textAnchor="middle">
        2,2
      </text>

      <line x1="56" y1="150" x2="540" y2="150" stroke="var(--line)" strokeWidth="1" />
      {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((dose) => (
        <g key={dose}>
          <line x1={x(dose)} y1="150" x2={x(dose)} y2="155" stroke="var(--line)" strokeWidth="1" />
          <text x={x(dose)} y="170" fill="var(--text-dim)" fontSize="11" textAnchor="middle">
            {String(dose).replace(".", language === "cs" ? "," : ".")}
          </text>
        </g>
      ))}
      <text x="56" y="188" fill="var(--text-dim)" fontSize="11">
        {text.dose}
      </text>
      <text x="56" y="14" fill="var(--text-dim)" fontSize="11">
        {text.benefit}
      </text>
    </svg>
  );
}

/** Sleep band: the recommended 7-9 hours inside a 4-11 hour axis. */
export function SleepDiagram({ language }: DiagramProps) {
  const text = labels[language];
  const x = (hour: number) => 56 + ((hour - 4) / 7) * 484;
  const segments = [
    { from: 4, to: 6, fill: "var(--surface-3)" },
    { from: 6, to: 7, fill: "var(--surface-2)" },
    { from: 7, to: 9, fill: "var(--accent)" },
    { from: 9, to: 10, fill: "var(--surface-2)" },
    { from: 10, to: 11, fill: "var(--surface-3)" },
  ];

  return (
    <svg
      className="guide-diagram"
      viewBox="0 0 560 150"
      role="img"
      aria-labelledby="sleep-diagram-title"
    >
      <title id="sleep-diagram-title">
        {language === "cs"
          ? "Doporučené pásmo spánku 7 až 9 hodin pro dospělé"
          : "The recommended 7 to 9 hour sleep band for adults"}
      </title>

      {segments.map((segment) => (
        <rect
          key={segment.from}
          x={x(segment.from)}
          y="44"
          width={x(segment.to) - x(segment.from)}
          height="30"
          fill={segment.fill}
        />
      ))}

      <text x={x(8)} y="36" fill="var(--text)" fontSize="12.5" fontWeight="700" textAnchor="middle">
        {text.band}
      </text>
      <text x={x(4)} y="94" fill="var(--text-dim)" fontSize="11">
        {text.less}
      </text>
      <text x={x(11)} y="94" fill="var(--text-dim)" fontSize="11" textAnchor="end">
        {text.more}
      </text>

      <line x1="56" y1="82" x2="540" y2="82" stroke="var(--line)" strokeWidth="1" />
      {[4, 5, 6, 7, 8, 9, 10, 11].map((hour) => (
        <g key={hour}>
          <line x1={x(hour)} y1="82" x2={x(hour)} y2="87" stroke="var(--line)" strokeWidth="1" />
          <text x={x(hour)} y="102" fill="var(--text-dim)" fontSize="11" textAnchor="middle">
            {hour}
          </text>
        </g>
      ))}
      <text x="540" y="124" fill="var(--text-dim)" fontSize="11" textAnchor="end">
        {text.hours}
      </text>
    </svg>
  );
}
