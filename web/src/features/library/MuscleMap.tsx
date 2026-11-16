import { useLanguage } from "../../i18n/useLanguage";
import type { Level, MuscleGroup } from "../../api/types";
import { LEVEL_LABEL, MUSCLE_GROUPS, pairText } from "../../lib/labels";

/**
 * The muscle map beside the grid. The chosen muscle chip lights its group on a
 * flat anatomy figure; with no chip chosen the whole body lights. The level
 * filter colours the lit muscle: blue, orange or red, lime with no level.
 */
export function MuscleMap({ muscle, level }: { muscle: MuscleGroup | "all"; level: Level | "all" }) {
  const { lang, tx } = useLanguage();
  const group = MUSCLE_GROUPS.find((row) => row.id === muscle);
  const label =
    muscle === "all" ? tx("Celé tělo", "Whole body") : group ? pairText(group.pair, lang) : "";
  const levelLabel = level === "all" ? null : pairText(LEVEL_LABEL[level], lang);

  return (
    <aside className="musclemap" data-muscle={muscle} data-level={level}>
      <p className="micro">{tx("Svalová mapa", "Muscle map")}</p>
      <svg
        className="musclemap__fig"
        viewBox="0 0 280 360"
        role="img"
        aria-label={tx(`Svalová mapa: ${label}`, `Muscle map: ${label}`)}
      >
        <g>
          <ellipse className="musclemap__sil" cx="65" cy="26" rx="15" ry="18" />
          <path className="musclemap__sil" d="M57 42h16v12H57z" />
          <path className="musclemap__sil" d="M46 52c-10 6-12 32-8 54l4 44h46l4-44c4-22 2-48-8-54z" />
          <ellipse className="musclemap__sil" cx="34" cy="70" rx="12" ry="10" />
          <ellipse className="musclemap__sil" cx="96" cy="70" rx="12" ry="10" />
          <path className="musclemap__sil" d="M28 76c-6 14-7 30-4 44l12-2c-2-14-2-28 2-40z" />
          <path className="musclemap__sil" d="M102 76c6 14 7 30 4 44l-12-2c2-14 2-28-2-40z" />
          <path className="musclemap__sil" d="M24 122c-3 14-2 30 2 40l10-2c-2-12-2-26 0-38z" />
          <path className="musclemap__sil" d="M106 122c3 14 2 30-2 40l-10-2c2-12 2-26 0-38z" />
          <ellipse className="musclemap__sil" cx="30" cy="170" rx="6" ry="8" />
          <ellipse className="musclemap__sil" cx="100" cy="170" rx="6" ry="8" />
          <path className="musclemap__sil" d="M46 150l38 0-4 18H50z" />
          <path className="musclemap__sil" d="M48 168c-4 26-3 54 2 78h14c-2-26-2-54 0-78z" />
          <path className="musclemap__sil" d="M82 168c4 26 3 54-2 78H66c2-26 2-54 0-78z" />
          <ellipse className="musclemap__sil" cx="56" cy="252" rx="8" ry="7" />
          <ellipse className="musclemap__sil" cx="74" cy="252" rx="8" ry="7" />
          <path className="musclemap__sil" d="M50 258c-2 20-1 40 2 56h10c-2-18-2-38 0-56z" />
          <path className="musclemap__sil" d="M80 258c2 20 1 40-2 56H68c2-18 2-38 0-56z" />
          <path className="musclemap__sil" d="M50 316h14v8c0 4-4 6-10 6h-6z" />
          <path className="musclemap__sil" d="M80 316H66v8c0 4 4 6 10 6h6z" />
          <path data-g="chest" d="M48 60c-4 10-2 22 6 28l8-2V62z" />
          <path data-g="chest" d="M82 60c4 10 2 22-6 28l-8-2V62z" />
          <ellipse data-g="shoulders" cx="34" cy="70" rx="10" ry="8" />
          <ellipse data-g="shoulders" cx="96" cy="70" rx="10" ry="8" />
          <path data-g="biceps" d="M28 79c-4 11-4 24 0 35l9-2c-3-10-3-21 0-31z" />
          <path data-g="biceps" d="M102 79c4 11 4 24 0 35l-9-2c3-10 3-21 0-31z" />
          <rect data-g="core" x="52" y="94" width="26" height="44" rx="6" />
          <path data-g="legs" d="M50 170c-3 24-2 50 2 72h10c-2-24-2-50 0-72z" />
          <path data-g="legs" d="M80 170c3 24 2 50-2 72H68c2-24 2-50 0-72z" />
          <path data-g="legs" d="M51 258c-1 18 0 36 2 50h8c-1-16-1-34 0-50z" />
          <path data-g="legs" d="M79 258c1 18 0 36-2 50h-8c1-16 1-34 0-50z" />
        </g>
        <g transform="translate(150 0)">
          <ellipse className="musclemap__sil" cx="65" cy="26" rx="15" ry="18" />
          <path className="musclemap__sil" d="M57 42h16v12H57z" />
          <path className="musclemap__sil" d="M46 52c-10 6-12 32-8 54l4 44h46l4-44c4-22 2-48-8-54z" />
          <ellipse className="musclemap__sil" cx="34" cy="70" rx="12" ry="10" />
          <ellipse className="musclemap__sil" cx="96" cy="70" rx="12" ry="10" />
          <path className="musclemap__sil" d="M28 76c-6 14-7 30-4 44l12-2c-2-14-2-28 2-40z" />
          <path className="musclemap__sil" d="M102 76c6 14 7 30 4 44l-12-2c2-14 2-28-2-40z" />
          <path className="musclemap__sil" d="M24 122c-3 14-2 30 2 40l10-2c-2-12-2-26 0-38z" />
          <path className="musclemap__sil" d="M106 122c3 14 2 30-2 40l-10-2c2-12 2-26 0-38z" />
          <ellipse className="musclemap__sil" cx="30" cy="170" rx="6" ry="8" />
          <ellipse className="musclemap__sil" cx="100" cy="170" rx="6" ry="8" />
          <path className="musclemap__sil" d="M46 150l38 0-4 18H50z" />
          <path className="musclemap__sil" d="M48 168c-4 26-3 54 2 78h14c-2-26-2-54 0-78z" />
          <path className="musclemap__sil" d="M82 168c4 26 3 54-2 78H66c2-26 2-54 0-78z" />
          <ellipse className="musclemap__sil" cx="56" cy="252" rx="8" ry="7" />
          <ellipse className="musclemap__sil" cx="74" cy="252" rx="8" ry="7" />
          <path className="musclemap__sil" d="M50 258c-2 20-1 40 2 56h10c-2-18-2-38 0-56z" />
          <path className="musclemap__sil" d="M80 258c2 20 1 40-2 56H68c2-18 2-38 0-56z" />
          <path className="musclemap__sil" d="M50 316h14v8c0 4-4 6-10 6h-6z" />
          <path className="musclemap__sil" d="M80 316H66v8c0 4 4 6 10 6h6z" />
          <path data-g="back" d="M56 50l9-4 9 4 4 24-13 10-13-10z" />
          <path data-g="back" d="M49 80c-6 14-4 34 4 46l9-6V88z" />
          <path data-g="back" d="M81 80c6 14 4 34-4 46l-9-6V88z" />
          <ellipse data-g="shoulders" cx="34" cy="70" rx="10" ry="8" />
          <ellipse data-g="shoulders" cx="96" cy="70" rx="10" ry="8" />
          <path data-g="triceps" d="M28 79c-4 11-4 24 0 35l9-2c-3-10-3-21 0-31z" />
          <path data-g="triceps" d="M102 79c4 11 4 24 0 35l-9-2c3-10 3-21 0-31z" />
          <path data-g="legs" d="M50 170c-3 24-2 50 2 72h10c-2-24-2-50 0-72z" />
          <path data-g="legs" d="M80 170c3 24 2 50-2 72H68c2-24 2-50 0-72z" />
          <path data-g="legs" d="M51 258c-1 18 0 36 2 50h8c-1-16-1-34 0-50z" />
          <path data-g="legs" d="M79 258c1 18 0 36-2 50h-8c1-16 1-34 0-50z" />
        </g>
      </svg>
      <p className="musclemap__caption">
        <span className="musclemap__title">
          <strong>{label}</strong>
          {levelLabel ? <em className="musclemap__level">{" "}({levelLabel})</em> : null}
        </span>
        <span>
          {muscle === "all"
            ? tx("všechny svalové skupiny", "every muscle group")
            : tx("zbytek těla zůstává tlumený", "the rest stays muted")}
        </span>
      </p>
    </aside>
  );
}
