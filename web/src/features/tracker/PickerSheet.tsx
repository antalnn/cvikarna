import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCatalogue } from "../../api/library";
import { muscleGroupOf, EQUIPMENT, MUSCLE_GROUPS } from "../../api/types";
import type { Equipment, MuscleGroup } from "../../api/types";
import { addWorkoutExercise } from "../../api/workout";
import { pick, useLanguage } from "../../i18n/useLanguage";
import { useAsync } from "../../lib/useAsync";
import { useDebouncedValue } from "../../lib/useDebouncedValue";

interface PickerSheetProps {
  workoutId: number;
  onClose: () => void;
  onAdded: () => Promise<void>;
}

export function PickerSheet({ workoutId, onClose, onAdded }: PickerSheetProps) {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [equipment, setEquipment] = useState<Equipment | "all">("all");
  const [page, setPage] = useState(1);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedValue(query);

  const load = useCallback(
    () => fetchCatalogue({ muscle, equipment, q: debouncedQuery, page }),
    [muscle, equipment, debouncedQuery, page],
  );
  const state = useAsync(load);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const add = async (exerciseId: number) => {
    setAddingId(exerciseId);
    setActionError(null);

    try {
      await addWorkoutExercise(workoutId, exerciseId);
      await onAdded();
      onClose();
    } catch {
      setActionError(t.saveError);
    } finally {
      setAddingId(null);
    }
  };

  const totalPages = state.status === "success" ? Math.max(1, Math.ceil(state.data.total / state.data.pageSize)) : 1;

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="picker-title">
        <div className="sheet__head">
          <h2 id="picker-title" className="sheet__title">
            {t.pickerTitle}
          </h2>
          <button className="icon-button" type="button" aria-label={t.close} onClick={onClose}>
            ×
          </button>
        </div>

        <div className="sheet__filters">
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
              ref={searchRef}
              type="search"
              value={query}
              aria-label={t.pickerSearchLabel}
              placeholder={t.pickerSearchPlaceholder}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
            {query ? (
              <button
                className="search__clear"
                type="button"
                aria-label={t.searchClear}
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
              >
                ×
              </button>
            ) : null}
          </div>

          <div className="filters" role="group" aria-label={t.muscleFilterLabel}>
            <button
              className="chip"
              type="button"
              aria-pressed={muscle === "all"}
              onClick={() => {
                setMuscle("all");
                setPage(1);
              }}
            >
              {t.muscleAll}
            </button>
            {MUSCLE_GROUPS.map((group) => (
              <button
                key={group}
                className="chip"
                type="button"
                aria-pressed={muscle === group}
                onClick={() => {
                  setMuscle(group);
                  setPage(1);
                }}
              >
                {t.muscle[group]}
              </button>
            ))}
          </div>

          <div className="filters" role="group" aria-label={t.equipmentLabel}>
            <button
              className="chip"
              type="button"
              aria-pressed={equipment === "all"}
              onClick={() => {
                setEquipment("all");
                setPage(1);
              }}
            >
              {t.equipmentAll}
            </button>
            {EQUIPMENT.map((option) => (
              <button
                key={option}
                className="chip"
                type="button"
                aria-pressed={equipment === option}
                onClick={() => {
                  setEquipment(option);
                  setPage(1);
                }}
              >
                {t.equipment[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="sheet__body">
          {state.status === "loading" ? (
            <p className="sheet__status" role="status">
              {t.loading}
            </p>
          ) : null}

          {state.status === "error" ? (
            <div className="state state--error" role="alert">
              <p className="state__title">{t.errorTitle}</p>
              <p className="state__text">{t.errorText}</p>
              <button className="button button--accent" type="button" onClick={state.retry}>
                {t.retry}
              </button>
            </div>
          ) : null}

          {state.status === "success" ? (
            <>
              <p className="sheet__meta">{t.pickerResults(state.data.items.length, state.data.total)}</p>

              {state.data.items.length === 0 ? (
                <p className="sheet__status">{t.pickerEmpty}</p>
              ) : (
                <ul className="picker-list">
                  {state.data.items.map((row) => (
                    <li className="picker-row" key={row.id}>
                      <div className="picker-row__main">
                        <p className="picker-row__title">
                          {pick(language, row.nameCs ?? row.nameEn, row.nameEn)}
                        </p>
                        {row.nameCs ? (
                          <p className="picker-row__alt" lang="en">
                            {row.nameEn}
                          </p>
                        ) : null}
                        <div className="picker-row__tags">
                          <span className="tag">{t.muscle[muscleGroupOf(row.primaryMuscle)]}</span>
                          {row.equipment ? <span className="tag">{t.equipment[row.equipment]}</span> : null}
                          <span className="tag">{t.level[row.level]}</span>
                          {row.isLibrary ? <span className="tag tag--accent">{t.navLibrary}</span> : null}
                        </div>
                      </div>

                      <div className="picker-row__actions">
                        {row.isLibrary ? (
                          <Link className="text-link" to={`/exercise/${row.id}`} onClick={onClose}>
                            {t.detailLink}
                          </Link>
                        ) : null}
                        <button
                          className="button button--accent button--small"
                          type="button"
                          disabled={addingId === row.id}
                          onClick={() => void add(row.id)}
                        >
                          {addingId === row.id ? t.saving : t.add}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {state.data.total > state.data.pageSize ? (
                <div className="pager">
                  <button
                    className="button button--small"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    {t.prevPage}
                  </button>
                  <span className="pager__label">{t.pickerPage(state.data.page, totalPages)}</span>
                  <button
                    className="button button--small"
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    {t.nextPage}
                  </button>
                </div>
              ) : null}
            </>
          ) : null}

          {actionError ? (
            <p className="form-error" role="alert">
              {actionError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
