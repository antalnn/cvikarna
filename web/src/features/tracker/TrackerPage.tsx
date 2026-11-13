import { useCallback, useEffect, useState } from "react";
import { openTodayWorkout, removeWorkoutExercise } from "../../api/workout";
import type { Workout } from "../../api/types";
import { useLanguage } from "../../i18n/useLanguage";
import { PickerSheet } from "./PickerSheet";
import { WorkoutItem } from "./WorkoutItem";

export function TrackerPage() {
  const { language, t } = useLanguage();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setWorkout(await openTodayWorkout());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(async () => {
    try {
      setWorkout(await openTodayWorkout());
      setActionError(null);
    } catch {
      setActionError(t.saveError);
    }
  }, [t.saveError]);

  const handleRemoveExercise = useCallback(
    async (itemId: number) => {
      if (!workout) {
        return;
      }

      try {
        await removeWorkoutExercise(workout.id, itemId);
        await reload();
      } catch {
        setActionError(t.saveError);
      }
    },
    [reload, t.saveError, workout],
  );

  if (status === "loading") {
    return (
      <div className="state">
        <p className="state__text" role="status">
          {t.loading}
        </p>
      </div>
    );
  }

  if (status === "error" || !workout) {
    return (
      <div className="state state--error" role="alert">
        <p className="state__title">{t.trackerErrorTitle}</p>
        <p className="state__text">{t.errorText}</p>
        <button className="button button--accent" type="button" onClick={() => void load()}>
          {t.retry}
        </button>
      </div>
    );
  }

  const dateLabel = new Intl.DateTimeFormat(language === "cs" ? "cs-CZ" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${workout.performedOn}T12:00:00`));

  return (
    <>
      <section className="tracker-head">
        <div>
          <p className="eyebrow">{t.trackerEyebrow}</p>
          <h1 className="tracker-title">{t.trackerTitle}</h1>
          <p className="tracker-date">{dateLabel}</p>
          <p className="tracker-lede">{t.trackerLede}</p>
        </div>
        <button className="button button--accent" type="button" onClick={() => setPickerOpen(true)}>
          {t.addExercise}
        </button>
      </section>

      {actionError ? (
        <p className="form-error" role="alert">
          {actionError}
        </p>
      ) : null}

      {workout.exercises.length === 0 ? (
        <div className="state">
          <p className="state__title">{t.noExercisesTitle}</p>
          <p className="state__text">{t.noExercisesText}</p>
          <button className="button" type="button" onClick={() => setPickerOpen(true)}>
            {t.addExercise}
          </button>
        </div>
      ) : (
        <ol className="workout-list">
          {workout.exercises.map((item) => (
            <WorkoutItem
              key={item.id}
              workoutId={workout.id}
              item={item}
              onChanged={reload}
              onRemove={handleRemoveExercise}
            />
          ))}
        </ol>
      )}

      {pickerOpen ? (
        <PickerSheet
          workoutId={workout.id}
          onClose={() => setPickerOpen(false)}
          onAdded={reload}
        />
      ) : null}
    </>
  );
}
