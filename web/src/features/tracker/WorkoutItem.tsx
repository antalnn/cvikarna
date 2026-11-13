import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { muscleGroupOf } from "../../api/types";
import type { WorkoutExercise } from "../../api/types";
import { addSet, removeSet } from "../../api/workout";
import { pick, useLanguage } from "../../i18n/useLanguage";

interface WorkoutItemProps {
  workoutId: number;
  item: WorkoutExercise;
  onChanged: () => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
}

export function WorkoutItem({ workoutId, item, onChanged, onRemove }: WorkoutItemProps) {
  const { language, t } = useLanguage();
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [removingSet, setRemovingSet] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const name = pick(language, item.nameCs ?? item.nameEn, item.nameEn);

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
      setReps("");
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

  return (
    <li className="workout-item">
      <div className="workout-item__head">
        <div>
          <div className="workout-item__tags">
            <span className="badge badge--accent">{t.muscle[muscleGroupOf(item.primaryMuscle)]}</span>
            {item.equipment ? <span className="badge badge--muted">{t.equipment[item.equipment]}</span> : null}
          </div>
          <h2 className="workout-item__title">
            {item.isLibrary ? (
              <Link to={`/exercise/${item.exerciseId}`}>{name}</Link>
            ) : (
              <span>{name}</span>
            )}
          </h2>
          {item.nameCs ? (
            <p className="workout-item__alt" lang="en">
              {item.nameEn}
            </p>
          ) : null}
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label={`${t.removeExercise}: ${name}`}
          onClick={() => void onRemove(item.id)}
        >
          ×
        </button>
      </div>

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
              <th scope="col">
                <span className="visually-hidden">{t.removeSet}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {item.sets.map((set, index) => (
              <tr key={set.id}>
                <td className="num">{index + 1}</td>
                <td className="num">{set.weightKg} kg</td>
                <td className="num">{set.reps}</td>
                <td className="num">{set.rpe ?? "—"}</td>
                <td className="sets-table__notes">{set.notes ?? ""}</td>
                <td>
                  <button
                    className="icon-button icon-button--small"
                    type="button"
                    aria-label={`${t.removeSet}: ${index + 1}`}
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

        <label className="set-form__field">
          <span>{t.rpeLabel}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="1"
            max="10"
            value={rpe}
            placeholder="—"
            onChange={(event) => setRpe(event.target.value)}
            aria-invalid={errors.rpe ? true : undefined}
          />
          {errors.rpe ? <small className="field-error">{errors.rpe}</small> : null}
        </label>

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
    </li>
  );
}
