import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NotFoundError } from "../../api/client";
import type { Workout, WorkoutSummary } from "../../api/types";
import { fetchWorkoutByDate, fetchWorkoutSummaries } from "../../api/workout";
import { useLanguage } from "../../i18n/useLanguage";
import { formatNumber, formatShortDate, monthKey, monthStart, shiftMonth, toDateKey } from "../../lib/dates";
import { useAsync } from "../../lib/useAsync";
import { MonthCalendar } from "./MonthCalendar";
import { WorkoutPreview } from "./WorkoutPreview";

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error" }
  | { status: "ready"; workout: Workout };

/**
 * The history view: a month calendar with markers, the month's workouts as a
 * list, and the clicked day as a read-only workout. Editing stays in the
 * tracker, which is the today view.
 */
export function HistoryPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const currentMonth = useMemo(() => monthStart(today), [today]);

  const [month, setMonth] = useState(currentMonth);
  const [selected, setSelected] = useState<string | null>(todayKey);
  const [newestFirst, setNewestFirst] = useState(true);
  const [preview, setPreview] = useState<PreviewState>({ status: "loading" });
  const [previewAttempt, setPreviewAttempt] = useState(0);
  const [canScrollMonths, setCanScrollMonths] = useState(false);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  // The Today button is the one action that opens the tracker when the day is
  // empty; clicking an empty calendar day only shows the empty state.
  const todayRequested = useRef(false);

  const loadMonth = useCallback(() => fetchWorkoutSummaries(monthKey(month)), [month]);
  const monthState = useAsync(loadMonth);

  const summariesByDate = useMemo(() => {
    const map = new Map<string, WorkoutSummary>();
    if (monthState.status === "success") {
      for (const summary of monthState.data) {
        map.set(summary.performedOn, summary);
      }
    }
    return map;
  }, [monthState]);

  const monthRows = monthState.status === "success" ? monthState.data : null;

  const monthSummaries = useMemo(() => {
    if (monthRows === null) {
      return [];
    }

    return [...monthRows].sort((left, right) =>
      newestFirst
        ? right.performedOn.localeCompare(left.performedOn)
        : left.performedOn.localeCompare(right.performedOn),
    );
  }, [monthRows, newestFirst]);

  const updateScrollCue = useCallback(() => {
    const panel = monthScrollRef.current;

    // Eight pixels of tolerance keeps sub-pixel rounding from showing the cue
    // when the list is already at the bottom.
    setCanScrollMonths(panel ? panel.scrollHeight - panel.scrollTop - panel.clientHeight > 8 : false);
  }, []);

  useEffect(() => {
    const panel = monthScrollRef.current;

    if (!panel) {
      return;
    }

    const observer = new ResizeObserver(updateScrollCue);
    observer.observe(panel);
    panel.addEventListener("scroll", updateScrollCue, { passive: true });
    const frame = requestAnimationFrame(updateScrollCue);

    return () => {
      observer.disconnect();
      panel.removeEventListener("scroll", updateScrollCue);
      cancelAnimationFrame(frame);
    };
  }, [updateScrollCue, monthSummaries]);

  useEffect(() => {
    if (!selected) {
      setPreview({ status: "idle" });
      return;
    }

    let live = true;
    setPreview({ status: "loading" });

    fetchWorkoutByDate(selected).then(
      (workout) => {
        if (!live) {
          return;
        }
        todayRequested.current = false;
        setPreview({ status: "ready", workout });
      },
      (error: unknown) => {
        if (!live) {
          return;
        }
        if (error instanceof NotFoundError) {
          if (todayRequested.current) {
            todayRequested.current = false;
            navigate("/tracker");
            return;
          }
          setPreview({ status: "empty" });
          return;
        }
        setPreview({ status: "error" });
      },
    );

    return () => {
      live = false;
    };
  }, [selected, previewAttempt, navigate]);

  const selectDay = useCallback((dateKey: string) => {
    todayRequested.current = false;
    setSelected(dateKey);
  }, []);

  const goToMonth = useCallback((next: Date) => {
    todayRequested.current = false;
    setMonth(next);
    setSelected(null);
  }, []);

  const goToday = useCallback(() => {
    const now = new Date();
    todayRequested.current = true;
    setMonth(monthStart(now));
    setSelected(toDateKey(now));
    setPreviewAttempt((value) => value + 1);
  }, []);

  return (
    <>
      <section className="history-head">
        <div>
          <p className="eyebrow">{t.historyEyebrow}</p>
          <h1 className="history-title">{t.historyTitle}</h1>
          <p className="history-lede">{t.historyLede}</p>
        </div>
        <button className="button" type="button" onClick={goToday}>
          {t.today}
        </button>
      </section>

      <div className="history-layout">
        <MonthCalendar
          month={month}
          summariesByDate={summariesByDate}
          selected={selected}
          todayKey={todayKey}
          onPrev={() => goToMonth(shiftMonth(month, -1))}
          onNext={() => goToMonth(shiftMonth(month, 1))}
          onSelect={selectDay}
        />

        <div className="month-panel-slot">
          <section className="month-panel" aria-labelledby="month-workouts-title">
            <div className="month-panel__head">
              <h2 className="panel-heading" id="month-workouts-title">
                {t.monthWorkoutsTitle}
              </h2>

              {monthSummaries.length > 1 ? (
                <button
                  className="month-sort"
                  type="button"
                  aria-label={t.sortOrderLabel}
                  onClick={() => setNewestFirst((value) => !value)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    {newestFirst ? (
                      <path d="M12 5v14m0 0 5-5m-5 5-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <path d="M12 19V5m0 0 5 5m-5-5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                  {newestFirst ? t.sortNewest : t.sortOldest}
                </button>
              ) : null}
            </div>

            <div className="month-panel__scroll" ref={monthScrollRef}>
              {monthState.status === "loading" ? (
                <p className="month-panel__state" role="status">
                  {t.historyLoading}
                </p>
              ) : null}

              {monthState.status === "error" ? (
                <div className="month-panel__state" role="alert">
                  <p>{t.historyErrorTitle}</p>
                  <button className="button button--small" type="button" onClick={monthState.retry}>
                    {t.retry}
                  </button>
                </div>
              ) : null}

              {monthState.status === "success" && monthSummaries.length === 0 ? (
                <div className="month-empty">
                  <p className="month-empty__title">{t.monthEmptyTitle}</p>
                  <p>{t.monthEmptyText}</p>
                </div>
              ) : null}

              {monthState.status === "success" && monthSummaries.length > 0 ? (
                <ol className="month-list">
                  {monthSummaries.map((summary) => (
                    <li key={summary.id}>
                      <button
                        className="month-row"
                        type="button"
                        aria-pressed={selected === summary.performedOn}
                        onClick={() => selectDay(summary.performedOn)}
                      >
                        {summary.name ? <span className="month-row__name">{summary.name}</span> : null}
                        <span className="month-row__date">{formatShortDate(summary.performedOn, language)}</span>
                        <span className="month-row__meta">
                          {t.exerciseCount(summary.exerciseCount)} · {t.setCount(summary.setCount)}
                        </span>
                        <span className="month-row__volume">
                          {formatNumber(summary.totalVolumeKg, language)} kg
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>

            {canScrollMonths ? (
              <button
                className="month-scroll-cue"
                type="button"
                aria-label={t.monthScrollCue}
                title={t.monthScrollCue}
                onClick={() => {
                  const panel = monthScrollRef.current;

                  if (!panel) {
                    return;
                  }

                  panel.scrollBy(0, Math.max(120, panel.clientHeight * 0.75));
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
          </section>
        </div>
      </div>

      <section className="history-preview">
        {preview.status === "loading" ? (
          <p className="history-note" role="status">
            {t.historyLoading}
          </p>
        ) : null}

        {preview.status === "idle" ? <p className="history-note">{t.pickDay}</p> : null}

        {preview.status === "empty" ? (
          <div className="history-note">
            <p>{t.noWorkoutOnDay}</p>
            <Link className="button button--small" to="/tracker">
              {t.openToday}
            </Link>
          </div>
        ) : null}

        {preview.status === "error" ? (
          <div className="history-note history-note--error" role="alert">
            <p>{t.errorText}</p>
            <button
              className="button button--small"
              type="button"
              onClick={() => setPreviewAttempt((value) => value + 1)}
            >
              {t.retry}
            </button>
          </div>
        ) : null}

        {preview.status === "ready" ? (
          <WorkoutPreview
            workout={preview.workout}
            onRenamed={(workout) => {
              setPreview({ status: "ready", workout });
              monthState.retry();
            }}
          />
        ) : null}
      </section>
    </>
  );
}
