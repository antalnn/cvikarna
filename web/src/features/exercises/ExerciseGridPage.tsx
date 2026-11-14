import { useCallback, useState } from "react";
import { fetchExercises, TOTAL_EXERCISES } from "../../api/library";
import { EQUIPMENT, MUSCLE_GROUPS } from "../../api/types";
import type { Equipment, MuscleGroup } from "../../api/types";
import { ExerciseCard } from "../../components/ExerciseCard";
import { EmptyState, ErrorState, SkeletonGrid } from "../../components/StateViews";
import { useLanguage } from "../../i18n/useLanguage";
import { useAsync } from "../../lib/useAsync";
import { useDebouncedValue } from "../../lib/useDebouncedValue";

export function ExerciseGridPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [equipment, setEquipment] = useState<Equipment | "all">("all");

  const debouncedQuery = useDebouncedValue(query);
  const load = useCallback(
    () => fetchExercises({ muscle, equipment, q: debouncedQuery }),
    [muscle, equipment, debouncedQuery],
  );
  const state = useAsync(load);

  const clearFilters = useCallback(() => {
    setQuery("");
    setMuscle("all");
    setEquipment("all");
  }, []);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">{t.heroEyebrow}</p>
        <h1 className="hero__title">{t.heroTitle}</h1>
        <p className="hero__lede">{t.heroLede}</p>
      </section>

      <section className="toolbar" aria-label={t.muscleFilterLabel}>
        <div className="toolbar__top">
          <div className="search">
            <svg
              className="search__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.6-3.6" />
            </svg>
            <input
              type="search"
              value={query}
              aria-label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query ? (
              <button
                className="search__clear"
                type="button"
                aria-label={t.searchClear}
                onClick={() => setQuery("")}
              >
                ×
              </button>
            ) : null}
          </div>

          <label className="select">
            <span>{t.equipmentLabel}</span>
            <select
              value={equipment}
              onChange={(event) => setEquipment(event.target.value as Equipment | "all")}
            >
              <option value="all">{t.equipmentAll}</option>
              {EQUIPMENT.map((item) => (
                <option key={item} value={item}>
                  {t.equipment[item]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filters" role="group" aria-label={t.muscleFilterLabel}>
          <button
            className="chip"
            type="button"
            aria-pressed={muscle === "all"}
            onClick={() => setMuscle("all")}
          >
            {t.muscleAll}
          </button>
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              className="chip"
              type="button"
              aria-pressed={muscle === group}
              onClick={() => setMuscle(group)}
            >
              {t.muscle[group]}
            </button>
          ))}
        </div>
      </section>

      <p className="results-meta" aria-live="polite">
        {state.status === "success" ? <span>{t.results(state.data.length, TOTAL_EXERCISES)}</span> : null}
      </p>

      {state.status === "loading" ? <SkeletonGrid /> : null}

      {state.status === "error" ? <ErrorState onRetry={state.retry} /> : null}

      {state.status === "success" ? (
        state.data.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <ul className="grid">
            {state.data.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </ul>
        )
      ) : null}
    </>
  );
}
