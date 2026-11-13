import { useCallback } from "react";
import { fetchRecentSets, fetchStats } from "../../api/workout";
import { muscleGroupOf } from "../../api/types";
import type { Muscle } from "../../api/types";
import { useLanguage } from "../../i18n/useLanguage";
import { useAsync } from "../../lib/useAsync";

interface ExerciseHistoryProps {
  exerciseId: number;
  primaryMuscle: Muscle;
}

export function ExerciseHistory({ exerciseId, primaryMuscle }: ExerciseHistoryProps) {
  const { language, t } = useLanguage();

  const load = useCallback(async () => {
    const [stats, sets] = await Promise.all([
      fetchStats(exerciseId),
      fetchRecentSets(exerciseId, 5),
    ]);
    return { stats, sets };
  }, [exerciseId]);
  const state = useAsync(load);

  if (state.status === "loading") {
    return (
      <p className="history-status" role="status">
        {t.loading}
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p className="history-status history-status--error" role="alert">
        {t.errorText}
      </p>
    );
  }

  const { stats, sets } = state.data;
  const numberFormat = new Intl.NumberFormat(language === "cs" ? "cs-CZ" : "en-GB", {
    maximumFractionDigits: 1,
  });
  const dateFormat = new Intl.DateTimeFormat(language === "cs" ? "cs-CZ" : "en-GB", {
    day: "numeric",
    month: "numeric",
  });
  const weekly = stats.weeklySets.find((group) => group.muscle === muscleGroupOf(primaryMuscle))?.sets ?? 0;

  return (
    <section className="detail__history" aria-label={t.statsTitle}>
      <div className="history-card">
        <h2 className="section__title">{t.recentSetsTitle}</h2>
        {sets.length === 0 ? (
          <p className="history-empty">{t.recentSetsEmpty}</p>
        ) : (
          <table className="sets-table">
            <thead>
              <tr>
                <th scope="col">{t.dateLabel}</th>
                <th scope="col">{t.weightLabel}</th>
                <th scope="col">{t.repsLabel}</th>
                <th scope="col">{t.rpeLabel}</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <tr key={set.id}>
                  <td>{dateFormat.format(new Date(`${set.performedOn}T12:00:00`))}</td>
                  <td className="num">{set.weightKg} kg</td>
                  <td className="num">{set.reps}</td>
                  <td className="num">{set.rpe ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="history-card">
        <h2 className="section__title">{t.statsTitle}</h2>
        <div className="stats-grid">
          <div className="stats-cell">
            <span className="stats-label">{t.statsVolume}</span>
            <strong className="stats-value">{numberFormat.format(stats.totalVolumeKg)} kg</strong>
          </div>
          <div className="stats-cell">
            <span className="stats-label">{t.statsBestE1rm}</span>
            <strong className="stats-value">
              {stats.bestEstimated1RmKg === null ? "—" : `${numberFormat.format(stats.bestEstimated1RmKg)} kg`}
            </strong>
          </div>
          <div className="stats-cell">
            <span className="stats-label">{t.statsBestWeight}</span>
            <strong className="stats-value">
              {stats.bestWeightKg === null ? "—" : `${numberFormat.format(stats.bestWeightKg)} kg`}
            </strong>
          </div>
          <div className="stats-cell">
            <span className="stats-label">{t.statsBestSet}</span>
            <strong className="stats-value">
              {stats.bestSetVolumeKg === null ? "—" : `${numberFormat.format(stats.bestSetVolumeKg)} kg`}
            </strong>
          </div>
        </div>
        <p className="stats-week">
          {t.statsWeekly}: <strong>{weekly}</strong> <span className="stats-week__label">{stats.isoWeek}</span>
        </p>
      </div>
    </section>
  );
}
