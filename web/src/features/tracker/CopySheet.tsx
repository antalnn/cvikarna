import { useCallback, useEffect, useState } from "react";
import type { WorkoutSummary } from "../../api/types";
import { copyWorkout, fetchRecentWorkouts } from "../../api/workout";
import { useLanguage } from "../../i18n/useLanguage";
import { formatCompactDate, formatNumber } from "../../lib/dates";
import { useAsync } from "../../lib/useAsync";

interface CopySheetProps {
  /** The workout that receives the copy. It is left out of the list. */
  workoutId: number;
  onClose: () => void;
  onCopied: () => Promise<void>;
}

/** The last ten workouts, newest first. Picking one repeats it in today's session. */
export function CopySheet({ workoutId, onClose, onCopied }: CopySheetProps) {
  const { language, t } = useLanguage();
  const [copyingId, setCopyingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => fetchRecentWorkouts(10, workoutId), [workoutId]);
  const state = useAsync(load);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && copyingId === null) {
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
  }, [copyingId, onClose]);

  const copy = async (source: WorkoutSummary) => {
    if (copyingId !== null) {
      return;
    }

    setCopyingId(source.id);
    setActionError(null);

    try {
      await copyWorkout(workoutId, source.id);
      await onCopied();
      onClose();
    } catch {
      setActionError(t.saveError);
    } finally {
      setCopyingId(null);
    }
  };

  return (
    <div
      className="sheet-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && copyingId === null) {
          onClose();
        }
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="copy-title">
        <div className="sheet__head">
          <h2 id="copy-title" className="sheet__title">
            {t.copyTitle}
          </h2>
          <button
            className="icon-button"
            type="button"
            aria-label={t.close}
            disabled={copyingId !== null}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="sheet__copy-lede">
          <p>{t.copyLede}</p>
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

          {state.status === "success" && state.data.length === 0 ? (
            <p className="sheet__status">{t.copyEmpty}</p>
          ) : null}

          {state.status === "success" && state.data.length > 0 ? (
            <ol className="copy-list" aria-label={t.copyTitle}>
              {state.data.map((summary) => {
                const date = formatCompactDate(summary.performedOn, language);
                const busy = copyingId === summary.id;

                return (
                  <li key={summary.id}>
                    <button
                      className="copy-row"
                      type="button"
                      aria-label={t.copyRowLabel(date)}
                      disabled={copyingId !== null}
                      onClick={() => void copy(summary)}
                    >
                      <span className="copy-row__main">
                        {summary.name ? <span className="copy-row__name">{summary.name}</span> : null}
                        <span className="copy-row__date">{date}</span>
                      </span>
                      <span className="copy-row__meta">
                        {t.exerciseCount(summary.exerciseCount)} · {t.setCount(summary.setCount)} ·{" "}
                        {formatNumber(summary.totalVolumeKg, language)} kg
                      </span>
                      <span className="copy-row__action">
                        {busy ? t.copying : t.copyAction}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
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
