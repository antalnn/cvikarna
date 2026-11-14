import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { muscleGroupOf } from "../../api/types";
import type { Workout } from "../../api/types";
import { InfoTip } from "../../components/InfoTip";
import { pick, useLanguage } from "../../i18n/useLanguage";
import { formatLongDate, formatNumber } from "../../lib/dates";

interface WorkoutPreviewProps {
  workout: Workout;
}

/** A saved workout as it was logged: no forms, no delete buttons, no set edits. */
export function WorkoutPreview({ workout }: WorkoutPreviewProps) {
  const { language, t } = useLanguage();
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set());
  const baseId = useId();

  const totalSets = workout.exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const totalVolume = workout.exercises.reduce(
    (sum, item) => sum + item.sets.reduce((volume, set) => volume + set.weightKg * set.reps, 0),
    0,
  );
  const allOpen =
    workout.exercises.length > 0 && workout.exercises.every((item) => openIds.has(item.id));

  const toggle = (itemId: number) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setOpenIds(
      allOpen ? new Set() : new Set(workout.exercises.map((item) => item.id)),
    );
  };

  return (
    <article className="history-workout">
      <header className="history-workout__head">
        <div>
          <p className="eyebrow">{t.historyPreviewEyebrow}</p>
          <h2 className="history-workout__title">{formatLongDate(workout.performedOn, language)}</h2>
          <p className="history-workout__meta">
            {t.exerciseCount(workout.exercises.length)} · {t.setCount(totalSets)} · {t.statsVolume}:{" "}
            {formatNumber(totalVolume, language)} kg
          </p>
        </div>

        {workout.exercises.length > 0 ? (
          <button className="history-toggle-all" type="button" onClick={toggleAll}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              {allOpen ? (
                <path d="M7 14l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
            {allOpen ? t.collapseAll : t.expandAll}
          </button>
        ) : null}
      </header>

      {workout.exercises.length === 0 ? (
        <p className="history-workout__empty">{t.noExercisesTitle}</p>
      ) : (
        <ol className="history-exercises">
          {workout.exercises.map((item) => {
            const name = pick(language, item.nameCs ?? item.nameEn, item.nameEn);
            const open = openIds.has(item.id);
            const panelId = `${baseId}-${item.id}`;

            return (
              <li className="history-exercise" key={item.id}>
                <div className="history-exercise__row">
                  <button
                    className="history-exercise__summary"
                    type="button"
                    aria-expanded={open}
                    aria-controls={open ? panelId : undefined}
                    onClick={() => toggle(item.id)}
                  >
                    <span className="history-exercise__title">{name}</span>
                    <span className="history-exercise__meta">
                      {t.muscle[muscleGroupOf(item.primaryMuscle)]}
                      {item.equipment ? ` · ${t.equipment[item.equipment]}` : ""}
                    </span>
                    <span className="history-exercise__count">{t.setCount(item.sets.length)}</span>
                    <svg
                      className="history-exercise__chevron"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {item.isLibrary ? (
                    <Link className="history-exercise__detail" to={`/exercise/${item.exerciseId}`}>
                      {t.detailLink}
                    </Link>
                  ) : null}
                </div>

                {open ? (
                  <div className="history-exercise__panel" id={panelId}>
                    {item.sets.length === 0 ? (
                      <p className="history-exercise__empty">{t.noSets}</p>
                    ) : (
                      <div className="history-log" role="table" aria-label={name}>
                        <div className="history-log__head" role="row">
                          <span role="columnheader">{t.setNumber}</span>
                          <span role="columnheader">{t.weightLabel}</span>
                          <span role="columnheader">{t.repsLabel}</span>
                          <span className="history-log__rpe-head" role="columnheader">
                            {t.rpeLabel}
                            <InfoTip label={t.rpeInfoLabel}>{t.rpeInfo}</InfoTip>
                          </span>
                          <span className="history-log__note-col" role="columnheader">
                            {t.notesLabel}
                          </span>
                        </div>

                        <ol className="history-sets" role="rowgroup">
                          {item.sets.map((set, index) => (
                            <li className="history-set" role="row" key={set.id}>
                              <span
                                className="history-set__index"
                                role="cell"
                                aria-label={`${t.setNumber} ${index + 1}`}
                              >
                                {index + 1}
                              </span>
                              <span className="history-set__weight" role="cell">
                                {formatNumber(set.weightKg, language)} kg
                              </span>
                              <span className="history-set__reps" role="cell">
                                {set.reps}
                              </span>
                              <span className="history-set__rpe" role="cell">
                                {set.rpe ?? "—"}
                              </span>
                              <span className="history-set__note" role="cell">
                                {set.notes ?? ""}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
