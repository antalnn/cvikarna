import type { ReactNode } from "react";
import { Icon } from "./Icon";
import type { LoggedSet } from "../api/types";
import { useLanguage } from "../i18n/useLanguage";
import { fmt, setsLabel } from "../lib/format";

export function RpeChip({ rpe }: { rpe: number | null }) {
  if (rpe === null || Number.isNaN(Number(rpe)) || Number(rpe) <= 0) {
    return null;
  }
  const value = Math.round(Number(rpe));
  const tone = value >= 9 ? " is-high" : value >= 7 ? " is-mid" : "";
  return (
    <span className={`rpe-num${tone}`} title={`RPE ${value}`}>
      {value}
    </span>
  );
}

interface ExerciseCardProps {
  index: number;
  name: string;
  subtitle: string;
  sets: LoggedSet[];
  open: boolean;
  onToggle: () => void;
  mode: "tracker" | "history";
  onSetToggle?: (set: LoggedSet) => void;
  onDeleteSet?: (set: LoggedSet) => void;
  onMenu?: (anchor: HTMLElement) => void;
  children?: ReactNode;
}

/**
 * One card for the tracker and the history log. It carries its index, name,
 * subtitle, set dots and a compact total in a single header row, and one menu
 * for its detail and its removal. The header is the only toggle.
 */
export function ExerciseCard({
  index,
  name,
  subtitle,
  sets,
  open,
  onToggle,
  mode,
  onSetToggle,
  onDeleteSet,
  onMenu,
  children,
}: ExerciseCardProps) {
  const { lang, tx } = useLanguage();
  const done = sets.filter((set) => set.completed).length;
  const total = sets.length;
  const volume = sets
    .filter((set) => set.completed)
    .reduce((sum, set) => sum + Number(set.weightKg) * Number(set.reps), 0);
  const allDone = total > 0 && done === total;

  return (
    <li className={`excard${open ? " is-open" : ""}${allDone ? " is-done" : ""}`}>
      <div className="excard__row">
        <button
          className="excard__toggle"
          type="button"
          aria-expanded={open}
          onClick={onToggle}
        >
          <span className="excard__idx">{String(index + 1).padStart(2, "0")}</span>
          <span className="excard__id">
            <span className="excard__name">{name}</span>
            <span className="excard__sub">
              {subtitle}
              {volume ? ` · ${fmt(volume, lang)} kg` : ""}
            </span>
          </span>
          <span className="excard__sum">
            <span className="excard__dots">
              {sets.map((set) => (
                <i key={set.id} className={set.completed ? "is-done" : ""} />
              ))}
            </span>
            <span className="excard__total num">
              {mode === "history"
                ? `${total} ${setsLabel(total, lang)}`
                : `${done}/${total}`}
            </span>
          </span>
          <Icon name="i-chevron" className="ico excard__chev" />
        </button>
        {onMenu ? (
          <button
            className="iconbtn excard__menu"
            type="button"
            aria-haspopup="menu"
            aria-label={tx("Možnosti cviku", "Exercise options")}
            onClick={(event) => onMenu(event.currentTarget)}
          >
            <Icon name="i-more" className="ico ico--sm" />
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="excard__body">
          {mode === "history" ? (
            <>
              <div className="setchips">
                {sets.map((set) => (
                  <span className="setchip" key={set.id}>
                    <span>
                      {fmt(set.weightKg, lang)} × {set.reps}
                    </span>
                    <RpeChip rpe={set.rpe} />
                  </span>
                ))}
              </div>
              <p className="excard__sumline">
                <span className="micro">{tx("Objem", "Volume")}</span>
                <span className="num">{fmt(volume, lang)} kg</span>
              </p>
            </>
          ) : (
            <>
              {sets.map((set, position) => (
                <div className={`setline${set.completed ? " is-done" : ""}`} key={set.id}>
                  <button
                    className="setcheck"
                    type="button"
                    aria-pressed={set.completed}
                    aria-label={`${tx("Série", "Set")} ${position + 1} ${tx("hotova", "done")}`}
                    onClick={() => onSetToggle?.(set)}
                  >
                    <Icon name="i-check" />
                  </button>
                  <span className="setline__main">
                    <span className="setline__nums">
                      <span className="setline__n">{position + 1}</span>
                      <span className="num">
                        {fmt(set.weightKg, lang)} kg × {set.reps}
                      </span>
                      <RpeChip rpe={set.rpe} />
                      {set.notes ? (
                        <span className="setline__note" title={set.notes}>
                          {set.notes}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="setline__vol num">
                    {fmt(Number(set.weightKg) * Number(set.reps), lang)} kg
                  </span>
                  <span className="setline__actions">
                    <button
                      className="iconbtn setdel"
                      type="button"
                      aria-label={`${tx("Smazat sérii", "Delete set")} ${position + 1}`}
                      onClick={() => onDeleteSet?.(set)}
                    >
                      <Icon name="i-x" className="ico ico--sm" />
                    </button>
                  </span>
                </div>
              ))}
              {children}
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}
