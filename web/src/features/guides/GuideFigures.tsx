import { useLanguage } from "../../i18n/useLanguage";
import type { GuideDiagram } from "./guideContent";

export function GuideFigure({ kind }: { kind: GuideDiagram }) {
  const { tx } = useLanguage();

  if (kind === "reps") {
    const x = (rep: number) => 112 + (rep - 1) * (428 / 29);
    const rows = [
      { label: tx("Síla", "Strength"), from: 1, to: 5, hot: false, dim: false },
      { label: tx("Velké cviky", "Big lifts"), from: 6, to: 12, hot: true, dim: false },
      { label: tx("Izolace", "Isolation"), from: 10, to: 20, hot: true, dim: true },
      { label: tx("Vytrvalost", "Endurance"), from: 15, to: 30, hot: false, dim: false },
    ];
    return (
      <div className="figure">
        <p className="figure__title">{tx("Pásma opakování", "Rep ranges")}</p>
        <svg
          viewBox="0 0 560 214"
          role="img"
          aria-label={tx(
            "Rozsahy opakování pro sílu, velké cviky, izolaci a vytrvalost",
            "Rep ranges for strength, big lifts, isolation and endurance",
          )}
        >
          {rows.map((row, index) => {
            const y = 22 + index * 40;
            return (
              <g key={row.label}>
                <text className="fig-label" x={0} y={y + 15}>
                  {row.label}
                </text>
                <rect
                  className={row.hot ? "fig-band fig-band--solid" : "fig-band"}
                  x={x(row.from).toFixed(1)}
                  y={y}
                  width={(x(row.to) - x(row.from)).toFixed(1)}
                  height={22}
                  rx={6}
                  opacity={row.dim ? 0.42 : 1}
                />
                <text
                  className={row.hot ? "fig-num fig-text--ink" : "fig-num"}
                  x={(x(row.from) + 8).toFixed(1)}
                  y={y + 15}
                >
                  {row.from}–{row.to}
                </text>
              </g>
            );
          })}
          <line className="fig-axis" x1={112} y1={182} x2={540} y2={182} />
          {[1, 5, 10, 15, 20, 25, 30].map((rep) => (
            <g key={rep}>
              <line className="fig-axis" x1={x(rep).toFixed(1)} y1={182} x2={x(rep).toFixed(1)} y2={187} />
              <text className="fig-num" x={x(rep).toFixed(1)} y={202} textAnchor="middle">
                {rep}
              </text>
            </g>
          ))}
          <text className="fig-num" x={540} y={176} textAnchor="end">
            {tx("opakování", "reps")}
          </text>
        </svg>
      </div>
    );
  }

  if (kind === "protein") {
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
      <div className="figure">
        <p className="figure__title">{tx("Dávka bílkovin a odpověď", "Protein dose and response")}</p>
        <svg
          viewBox="0 0 560 196"
          role="img"
          aria-label={tx(
            "Křivka přínosu bílkovin se zplošťuje kolem 1,6 gramu na kilogram",
            "The protein benefit curve flattens around 1.6 grams per kilogram",
          )}
        >
          <rect
            x={x(1.6).toFixed(1)}
            y={y(100)}
            width={(x(2.2) - x(1.6)).toFixed(1)}
            height={y(0) - y(100)}
            fill="var(--accent)"
            opacity={0.12}
          />
          <polyline
            className="fig-line"
            strokeWidth={3}
            points={points.map(([dose, gain]) => `${x(dose).toFixed(1)},${y(gain).toFixed(1)}`).join(" ")}
          />
          {[1.6, 2.2].map((dose) => (
            <line
              className="fig-guide"
              key={dose}
              x1={x(dose).toFixed(1)}
              y1={y(98)}
              x2={x(dose).toFixed(1)}
              y2={y(0)}
            />
          ))}
          <text className="fig-num" x={x(1.6).toFixed(1)} y={y(98) - 6} textAnchor="middle">
            {tx("1,6", "1.6")}
          </text>
          <text className="fig-num" x={x(2.2).toFixed(1)} y={y(98) - 6} textAnchor="middle">
            {tx("2,2", "2.2")}
          </text>
          <line className="fig-axis" x1={56} y1={150} x2={540} y2={150} />
          {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((dose) => (
            <g key={dose}>
              <line className="fig-axis" x1={x(dose).toFixed(1)} y1={150} x2={x(dose).toFixed(1)} y2={155} />
              <text className="fig-num" x={x(dose).toFixed(1)} y={170} textAnchor="middle">
                {String(dose).replace(".", tx(",", "."))}
              </text>
            </g>
          ))}
          <text className="fig-num" x={56} y={188}>
            {tx("g bílkovin na kg hmotnosti", "g protein per kg bodyweight")}
          </text>
          <text className="fig-num" x={56} y={14}>
            {tx("relativní přínos", "relative benefit")}
          </text>
        </svg>
      </div>
    );
  }

  const sx = (hour: number) => 56 + ((hour - 4) / 7) * 484;
  const segments: Array<[number, number, string]> = [
    [4, 6, "fig-band"],
    [6, 7, "fig-band"],
    [7, 9, "fig-band fig-band--solid"],
    [9, 10, "fig-band"],
    [10, 11, "fig-band"],
  ];
  return (
    <div className="figure">
      <p className="figure__title">{tx("Pásmo spánku", "Sleep band")}</p>
      <svg
        viewBox="0 0 560 150"
        role="img"
        aria-label={tx(
          "Doporučené pásmo spánku 7 až 9 hodin pro dospělé",
          "The recommended 7 to 9 hour sleep band for adults",
        )}
      >
        {segments.map(([from, to, className]) => (
          <rect
            className={className}
            key={`${from}-${to}`}
            x={sx(from).toFixed(1)}
            y={44}
            width={(sx(to) - sx(from)).toFixed(1)}
            height={30}
          />
        ))}
        <text className="fig-label" x={sx(8).toFixed(1)} y={36} textAnchor="middle">
          {tx("7 až 9 h", "7 to 9 h")}
        </text>
        <text className="fig-num" x={sx(4).toFixed(1)} y={94}>
          {tx("méně než 6 h", "under 6 h")}
        </text>
        <text className="fig-num" x={sx(11).toFixed(1)} y={94} textAnchor="end">
          {tx("víc než 10 h", "over 10 h")}
        </text>
        <line className="fig-axis" x1={56} y1={82} x2={540} y2={82} />
        {[4, 5, 6, 7, 8, 9, 10, 11].map((hour) => (
          <g key={hour}>
            <line className="fig-axis" x1={sx(hour).toFixed(1)} y1={82} x2={sx(hour).toFixed(1)} y2={87} />
            <text className="fig-num" x={sx(hour).toFixed(1)} y={102} textAnchor="middle">
              {hour}
            </text>
          </g>
        ))}
        <text className="fig-num" x={540} y={124} textAnchor="end">
          {tx("hodiny spánku", "hours of sleep")}
        </text>
      </svg>
    </div>
  );
}
