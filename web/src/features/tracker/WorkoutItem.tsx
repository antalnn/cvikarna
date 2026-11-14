import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { muscleGroupOf } from "../../api/types";
import type { WorkoutExercise } from "../../api/types";
import { addSet, removeSet, reorderSets } from "../../api/workout";
import { InfoTip } from "../../components/InfoTip";
import { pick, useLanguage } from "../../i18n/useLanguage";
import { formatNumber } from "../../lib/dates";

interface WorkoutItemProps {
  workoutId: number;
  item: WorkoutExercise;
  index: number;
  orderedIds: number[];
  onReorder: (itemId: number, targetId: number) => void;
  onDragStart: (itemId: number, clientY: number) => void;
  dragStyle?: CSSProperties | undefined;
  dragClass?: string | undefined;
  onChanged: () => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
}

export function WorkoutItem({
  workoutId,
  item,
  index,
  orderedIds,
  onReorder,
  onDragStart,
  dragStyle,
  dragClass,
  onChanged,
  onRemove,
}: WorkoutItemProps) {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("1");
  const [rpe, setRpe] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [removingSet, setRemovingSet] = useState<number | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const panelId = useId();

  const name = pick(language, item.nameCs ?? item.nameEn, item.nameEn);
  const lastSet = item.sets.length > 0 ? item.sets[item.sets.length - 1] : null;
  const meta = [
    t.muscle[muscleGroupOf(item.primaryMuscle)],
    item.equipment ? t.equipment[item.equipment] : null,
    t.setCount(item.sets.length),
  ]
    .filter(Boolean)
    .join(" · ");
  const lastLabel = lastSet
    ? `${formatNumber(lastSet.weightKg, language)} kg × ${lastSet.reps}`
    : t.noSetsShort;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) {
      return;
    }

    const weightValue = Number(weight.replace(",", "."));
    const repsValue = Number(reps);
    const rpeValue = rpe.trim() === "" ? null : Number(rpe.replace(",", "."));
    const nextErrors: Record<string, string> = {};

    if (weight.trim() === "" || !Number.isFinite(weightValue) || weightValue < 0) {
      nextErrors.weight = t.weightError;
    }
    if (!Number.isInteger(repsValue) || repsValue < 1 || repsValue > 100) {
      nextErrors.reps = t.repsError;
    }
    if (rpeValue !== null && (!Number.isFinite(rpeValue) || rpeValue < 1 || rpeValue > 10)) {
      nextErrors.rpe = t.rpeError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setFormError(null);
    setPending(true);

    try {
      await addSet(workoutId, item.id, {
        weightKg: weightValue,
        reps: repsValue,
        rpe: rpeValue,
        notes: notes.trim() === "" ? null : notes.trim(),
      });
      setWeight("");
      setReps("1");
      setRpe("");
      setNotes("");
      await onChanged();
    } catch (error) {
      if (error instanceof ApiError) {
        const serverErrors = Object.entries(error.errors).map(([, messages]) => messages[0]);
        setFormError(serverErrors[0] ?? t.saveError);
      } else {
        setFormError(t.saveError);
      }
    } finally {
      setPending(false);
    }
  };

  const remove = async (setId: number) => {
    setRemovingSet(setId);
    setFormError(null);

    try {
      await removeSet(setId);
      await onChanged();
    } catch {
      setFormError(t.saveError);
    } finally {
      setRemovingSet(null);
    }
  };

  const reorder = async (setId: number, targetId: number) => {
    if (ordering || setId === targetId) {
      return;
    }

    const ids = item.sets.map((set) => set.id);
    const from = ids.indexOf(setId);
    const to = ids.indexOf(targetId);

    if (from < 0 || to < 0) {
      return;
    }

    ids.splice(from, 1);
    ids.splice(to, 0, setId);

    setOrdering(true);
    setFormError(null);

    try {
      await reorderSets(workoutId, item.id, ids);
      await onChanged();
    } catch {
      setFormError(t.saveError);
    } finally {
      setOrdering(false);
      setDraggingId(null);
      setDropTargetId(null);
    }
  };

  const moveBy = (setId: number, offset: number) => {
    const ids = item.sets.map((set) => set.id);
    const from = ids.indexOf(setId);

    if (from < 0) {
      return;
    }

    const targetId = ids[from + offset];

    if (targetId !== undefined) {
      void reorder(setId, targetId);
    }
  };

  const moveExerciseBy = (offset: number) => {
    const from = orderedIds.indexOf(item.id);
    const targetId = orderedIds[from + offset];

    if (from >= 0 && targetId !== undefined) {
      void onReorder(item.id, targetId);
    }
  };

  return (
    <li
      className={["workout-item", open ? "is-open" : "", dragClass ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={dragStyle}
    >
      <div className="workout-item__head">
        <button
          className="drag-handle workout-item__drag"
          type="button"
          aria-label={`${t.reorderExercise}: ${name}`}
          title={t.reorderExercise}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse" && event.button !== 0) {
              return;
            }
            event.preventDefault();
            onDragStart(item.id, event.clientY);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              moveExerciseBy(-1);
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              moveExerciseBy(1);
            }
          }}
        >
          <svg viewBox="0 0 10 16" aria-hidden="true" focusable="false">
            <circle cx="3" cy="3" r="1.2" />
            <circle cx="7" cy="3" r="1.2" />
            <circle cx="3" cy="8" r="1.2" />
            <circle cx="7" cy="8" r="1.2" />
            <circle cx="3" cy="13" r="1.2" />
            <circle cx="7" cy="13" r="1.2" />
          </svg>
        </button>

        <button
          className="workout-item__toggle"
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={`${open ? t.collapse : t.expand}: ${name}`}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="workout-item__index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="workout-item__id">
            <span className="workout-item__title">{name}</span>
            <span className="workout-item__meta">{meta}</span>
          </span>
          <span className="workout-item__last">{lastLabel}</span>
          <svg
            className="workout-item__chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          className="icon-button"
          type="button"
          aria-label={`${t.removeExercise}: ${name}`}
          onClick={() => void onRemove(item.id)}
        >
          ×
        </button>
      </div>

      {open ? (
        <div className="workout-item__panel" id={panelId}>
          {item.isLibrary ? (
            <div className="workout-item__panel-head">
              <Link className="text-link" to={`/exercise/${item.exerciseId}`}>
                {t.detailLink}
              </Link>
            </div>
          ) : null}

          {item.sets.length === 0 ? (
            <p className="workout-item__empty">{t.noSets}</p>
          ) : (
            <div className="table-wrap">
              <table className="sets-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="visually-hidden">{t.reorderSet}</span>
                    </th>
                    <th scope="col">{t.setNumber}</th>
                    <th scope="col">{t.weightLabel}</th>
                    <th scope="col">{t.repsLabel}</th>
                    <th scope="col">{t.rpeLabel}</th>
                    <th scope="col">{t.notesLabel}</th>
                    <th scope="col">
                      <span className="visually-hidden">{t.removeSet}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {item.sets.map((set, setIndex) => (
                    <tr
                      key={set.id}
                      className={[
                        draggingId === set.id ? "is-dragging" : "",
                        dropTargetId === set.id && draggingId !== set.id ? "is-drop-target" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onDragOver={(event) => {
                        if (draggingId === null) {
                          return;
                        }
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        if (dropTargetId !== set.id) {
                          setDropTargetId(set.id);
                        }
                      }}
                      onDragLeave={() => {
                        if (dropTargetId === set.id) {
                          setDropTargetId(null);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (draggingId !== null) {
                          void reorder(draggingId, set.id);
                        }
                      }}
                    >
                      <td className="set-drag">
                        <button
                          className="drag-handle"
                          type="button"
                          draggable={!ordering}
                          aria-label={`${t.reorderSet} ${setIndex + 1}`}
                          title={t.reorderSet}
                          onDragStart={(event) => {
                            setDraggingId(set.id);
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData("text/plain", String(set.id));
                          }}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setDropTargetId(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "ArrowUp") {
                              event.preventDefault();
                              moveBy(set.id, -1);
                            }
                            if (event.key === "ArrowDown") {
                              event.preventDefault();
                              moveBy(set.id, 1);
                            }
                          }}
                        >
                          <svg viewBox="0 0 10 16" aria-hidden="true" focusable="false">
                            <circle cx="3" cy="3" r="1.2" />
                            <circle cx="7" cy="3" r="1.2" />
                            <circle cx="3" cy="8" r="1.2" />
                            <circle cx="7" cy="8" r="1.2" />
                            <circle cx="3" cy="13" r="1.2" />
                            <circle cx="7" cy="13" r="1.2" />
                          </svg>
                        </button>
                      </td>
                      <td className="num">{setIndex + 1}</td>
                      <td className="num">{formatNumber(set.weightKg, language)} kg</td>
                      <td className="num">{set.reps}</td>
                      <td className="num">{set.rpe ?? "—"}</td>
                      <td className="sets-table__notes">{set.notes ?? ""}</td>
                      <td>
                        <button
                          className="icon-button icon-button--small"
                          type="button"
                          aria-label={`${t.removeSet}: ${setIndex + 1}`}
                          disabled={removingSet === set.id}
                          onClick={() => void remove(set.id)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form className="set-form" onSubmit={submit} noValidate>
            <label className="set-form__field">
              <span>{t.weightLabel}</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                value={weight}
                placeholder="0"
                onChange={(event) => setWeight(event.target.value)}
                aria-invalid={errors.weight ? true : undefined}
              />
              {errors.weight ? <small className="field-error">{errors.weight}</small> : null}
            </label>

            <label className="set-form__field">
              <span>{t.repsLabel}</span>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                max="100"
                value={reps}
                onChange={(event) => setReps(event.target.value)}
                aria-invalid={errors.reps ? true : undefined}
              />
              {errors.reps ? <small className="field-error">{errors.reps}</small> : null}
            </label>

            <div className="set-form__field">
              <span className="set-form__label">
                {t.rpeLabel}
                <InfoTip label={t.rpeInfoLabel}>{t.rpeInfo}</InfoTip>
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                max="10"
                aria-label={t.rpeLabel}
                value={rpe}
                placeholder="—"
                onChange={(event) => {
                  const next = event.target.value;
                  if (next.trim() === "") {
                    setRpe("");
                    return;
                  }
                  const value = Number(next.replace(",", "."));
                  setRpe(Number.isFinite(value) && value >= 1 ? next : "");
                }}
                aria-invalid={errors.rpe ? true : undefined}
              />
              {errors.rpe ? <small className="field-error">{errors.rpe}</small> : null}
            </div>

            <label className="set-form__field set-form__notes">
              <span>{t.notesLabel}</span>
              <input
                type="text"
                maxLength={300}
                value={notes}
                placeholder={t.notesPlaceholder}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>

            <button className="button button--accent" type="submit" disabled={pending}>
              {pending ? t.saving : t.addSet}
            </button>
          </form>

          {formError ? (
            <p className="form-error" role="alert">
              {formError}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
