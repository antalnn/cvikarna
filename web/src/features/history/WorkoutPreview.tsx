import { Link } from "react-router-dom";
import { muscleGroupOf } from "../../api/types";
import type { Workout } from "../../api/types";
import { pick, useLanguage } from "../../i18n/useLanguage";
import { formatLongDate, formatNumber } from "../../lib/dates";

interface WorkoutPreviewProps {
  workout: Workout;
}

/** A saved workout as it was logged: no forms, no delete buttons, no edits. */
export function WorkoutPreview({ workout }: WorkoutPreviewProps) {
  const { language, t } = useLanguage();

  const totalSets = workout.exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const totalVolume = workout.exercises.reduce(
    (sum, item) => sum + item.sets.reduce((volume, set) => volume + set.weightKg * set.reps, 0),
    0,
  );

  return (
    <article className="history-workout">
      <header className="history-workout__head">
        <div>
          <p className="eyebrow">{t.historyPreviewEyebrow}</p>
          <h2 className="history-workout__title">{formatLongDate(workout.performedOn, language)}</h2>
        </div>
        <p className="history-workout__meta">
          {t.exerciseCount(workout.exercises.length)} · {t.setCount(totalSets)} · {t.statsVolume}:{" "}
          {formatNumber(totalVolume, language)} kg
        </p>
      </header>

      {workout.exercises.length === 0 ? (
        <p className="history-workout__empty">{t.noExercisesTitle}</p>
      ) : (
        <ol className="history-exercises">
          {workout.exercises.map((item) => {
            const name = pick(language, item.nameCs ?? item.nameEn, item.nameEn);

            return (
              <li className="history-exercise" key={item.id}>
                <div className="workout-item__tags">
                  <span className="badge badge--accent">{t.muscle[muscleGroupOf(item.primaryMuscle)]}</span>
                  {item.equipment ? <span className="badge badge--muted">{t.equipment[item.equipment]}</span> : null}
                </div>
                <h3 className="history-exercise__title">
                  {item.isLibrary ? <Link to={`/exercise/${item.exerciseId}`}>{name}</Link> : name}
                </h3>
                {item.nameCs ? (
                  <p className="workout-item__alt" lang="en">
                    {item.nameEn}
                  </p>
                ) : null}

                {item.sets.length === 0 ? (
                  <p className="workout-item__empty">{t.noSets}</p>
                ) : (
                  <table className="sets-table">
                    <thead>
                      <tr>
                        <th scope="col">{t.setNumber}</th>
                        <th scope="col">{t.weightLabel}</th>
                        <th scope="col">{t.repsLabel}</th>
                        <th scope="col">{t.rpeLabel}</th>
                        <th scope="col">{t.notesLabel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.sets.map((set, index) => (
                        <tr key={set.id}>
                          <td className="num">{index + 1}</td>
                          <td className="num">{formatNumber(set.weightKg, language)} kg</td>
                          <td className="num">{set.reps}</td>
                          <td className="num">{set.rpe ?? "—"}</td>
                          <td className="sets-table__notes">{set.notes ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
