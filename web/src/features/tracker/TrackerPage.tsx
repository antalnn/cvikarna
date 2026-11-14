import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  openTodayWorkout,
  removeWorkoutExercise,
  renameWorkout,
  reorderWorkoutExercises,
} from "../../api/workout";
import type { Workout, WorkoutExercise } from "../../api/types";
import { WorkoutNameEditor } from "../../components/WorkoutNameEditor";
import { useLanguage } from "../../i18n/useLanguage";
import { formatNumber } from "../../lib/dates";
import { CopySheet } from "./CopySheet";
import { PickerSheet } from "./PickerSheet";
import { WorkoutItem } from "./WorkoutItem";

interface DragState {
  itemId: number;
  fromIndex: number;
  toIndex: number;
  startY: number;
  offsetY: number;
  listTop: number;
  heights: number[];
  starts: number[];
}

export function TrackerPage() {
  const { language, t } = useLanguage();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
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

  const commitOrder = useCallback(
    async (ids: number[]) => {
      if (!workout) {
        return;
      }

      const byId = new Map(workout.exercises.map((item) => [item.id, item]));
      const next = ids
        .map((id) => byId.get(id))
        .filter((item): item is WorkoutExercise => Boolean(item));

      if (next.length !== workout.exercises.length) {
        return;
      }

      setWorkout({ ...workout, exercises: next });
      setOrdering(true);
      setActionError(null);

      try {
        await reorderWorkoutExercises(workout.id, ids);
        await reload();
      } catch {
        setActionError(t.saveError);
        await reload();
      } finally {
        setOrdering(false);
      }
    },
    [workout, reload, t.saveError],
  );

  const handleReorder = useCallback(
    (itemId: number, targetId: number) => {
      if (!workout || ordering || itemId === targetId) {
        return;
      }

      const ids = workout.exercises.map((item) => item.id);
      const from = ids.indexOf(itemId);
      const to = ids.indexOf(targetId);

      if (from < 0 || to < 0) {
        return;
      }

      ids.splice(from, 1);
      ids.splice(to, 0, itemId);
      void commitOrder(ids);
    },
    [workout, ordering, commitOrder],
  );

  const beginDrag = useCallback(
    (itemId: number, clientY: number) => {
      if (!workout || ordering) {
        return;
      }

      const list = listRef.current;
      const fromIndex = workout.exercises.findIndex((item) => item.id === itemId);

      if (!list || fromIndex < 0) {
        return;
      }

      const rows = Array.from(list.querySelectorAll<HTMLElement>(".workout-item"));

      if (rows.length !== workout.exercises.length) {
        return;
      }

      const listTop = list.getBoundingClientRect().top;
      const starts = rows.map((row) => row.getBoundingClientRect().top - listTop);
      const heights = rows.map((row) => row.getBoundingClientRect().height);
      const state: DragState = {
        itemId,
        fromIndex,
        toIndex: fromIndex,
        startY: clientY,
        offsetY: 0,
        listTop,
        heights,
        starts,
      };

      dragRef.current = state;
      setDrag(state);
    },
    [workout, ordering],
  );

  const dragging = drag !== null;

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const move = (event: PointerEvent) => {
      const current = dragRef.current;
      if (!current) {
        return;
      }

      const offsetY = event.clientY - current.startY;
      const pointerY = event.clientY - current.listTop;
      let toIndex = current.fromIndex;
      let best = Number.POSITIVE_INFINITY;

      current.starts.forEach((start, index) => {
        const height = current.heights[index];

        if (height === undefined) {
          return;
        }

        const distance = Math.abs(pointerY - (start + height / 2));
        if (distance < best) {
          best = distance;
          toIndex = index;
        }
      });

      const next = { ...current, offsetY, toIndex };
      dragRef.current = next;
      setDrag(next);
    };

    const drop = () => {
      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);

      if (!current || !workout || current.fromIndex === current.toIndex) {
        return;
      }

      const ids = workout.exercises.map((item) => item.id);
      const [moved] = ids.splice(current.fromIndex, 1);

      if (moved === undefined) {
        return;
      }

      ids.splice(current.toIndex, 0, moved);
      void commitOrder(ids);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", drop);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", drop);
      window.removeEventListener("pointercancel", drop);
    };
  }, [dragging, workout, commitOrder]);

  const dragVisual = (index: number): { style?: CSSProperties; className: string } => {
    if (!drag) {
      return { className: "" };
    }

    const height = drag.heights[drag.fromIndex];

    if (height === undefined) {
      return { className: "" };
    }

    if (index === drag.fromIndex) {
      return {
        style: { transform: `translateY(${drag.offsetY}px)`, zIndex: 5 },
        className: "is-dragging",
      };
    }

    if (drag.fromIndex < drag.toIndex && index > drag.fromIndex && index <= drag.toIndex) {
      return {
        style: { transform: `translateY(${-height}px)` },
        className: "is-shifted",
      };
    }

    if (drag.toIndex < drag.fromIndex && index >= drag.toIndex && index < drag.fromIndex) {
      return {
        style: { transform: `translateY(${height}px)` },
        className: "is-shifted",
      };
    }

    return { className: "" };
  };

  const previewIndex = (index: number) => {
    if (!drag) {
      return index;
    }

    if (index === drag.fromIndex) {
      return drag.toIndex;
    }

    if (drag.fromIndex < drag.toIndex && index > drag.fromIndex && index <= drag.toIndex) {
      return index - 1;
    }

    if (drag.toIndex < drag.fromIndex && index >= drag.toIndex && index < drag.fromIndex) {
      return index + 1;
    }

    return index;
  };

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

  const totalSets = workout.exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const totalVolume = workout.exercises.reduce(
    (sum, item) => sum + item.sets.reduce((volume, set) => volume + set.weightKg * set.reps, 0),
    0,
  );

  return (
    <>
      <section className="tracker-head">
        <div>
          <p className="eyebrow">{t.trackerEyebrow}</p>
          <WorkoutNameEditor
            key={workout.id}
            name={workout.name}
            fallback={t.trackerTitle}
            level={1}
            titleClassName="tracker-title"
            onSave={(name) => renameWorkout(workout.id, name)}
            onSaved={setWorkout}
          />
          <p className="tracker-meta">
            <span className="tracker-date">{dateLabel}</span>
            <span>{t.exerciseCount(workout.exercises.length)}</span>
            <span>{t.setCount(totalSets)}</span>
            <span>
              {formatNumber(totalVolume, language)} kg
            </span>
          </p>
          <p className="tracker-lede">{t.trackerLede}</p>
        </div>
        <div className="tracker-actions">
          <button className="button" type="button" onClick={() => setCopyOpen(true)}>
            {t.copyWorkout}
          </button>
          <button className="button button--accent" type="button" onClick={() => setPickerOpen(true)}>
            {t.addExercise}
          </button>
        </div>
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
          <div className="state__actions">
            <button className="button" type="button" onClick={() => setCopyOpen(true)}>
              {t.copyWorkout}
            </button>
            <button className="button button--accent" type="button" onClick={() => setPickerOpen(true)}>
              {t.addExercise}
            </button>
          </div>
        </div>
      ) : (
        <ol className="workout-list" ref={listRef}>
          {workout.exercises.map((item, index) => {
            const visual = dragVisual(index);

            return (
              <WorkoutItem
                key={item.id}
                workoutId={workout.id}
                item={item}
                index={previewIndex(index)}
                orderedIds={workout.exercises.map((row) => row.id)}
                onReorder={handleReorder}
                onDragStart={beginDrag}
                dragStyle={visual.style}
                dragClass={visual.className}
                onChanged={reload}
                onRemove={handleRemoveExercise}
              />
            );
          })}
        </ol>
      )}

      {pickerOpen ? (
        <PickerSheet
          workoutId={workout.id}
          onClose={() => setPickerOpen(false)}
          onAdded={reload}
        />
      ) : null}

      {copyOpen ? (
        <CopySheet
          workoutId={workout.id}
          onClose={() => setCopyOpen(false)}
          onCopied={reload}
        />
      ) : null}
    </>
  );
}
