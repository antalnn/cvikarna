import type { WorkoutSummary } from "../../api/types";
import { useLanguage } from "../../i18n/useLanguage";
import { buildMonthCells, formatLongDate, formatMonth, weekdayLabels } from "../../lib/dates";

interface MonthCalendarProps {
  month: Date;
  summariesByDate: Map<string, WorkoutSummary>;
  selected: string | null;
  todayKey: string;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (dateKey: string) => void;
}

/**
 * A month grid, Monday first. Every day is a button, so the keyboard reaches
 * it without extra key handling; days with a workout carry a dot and say so
 * in their accessible name.
 */
export function MonthCalendar({
  month,
  summariesByDate,
  selected,
  todayKey,
  onPrev,
  onNext,
  onSelect,
}: MonthCalendarProps) {
  const { language, t } = useLanguage();
  const cells = buildMonthCells(month);
  const weekdays = weekdayLabels(language);

  return (
    <section className="calendar" aria-label={t.calendarLabel}>
      <div className="calendar__head">
        <button className="calendar__nav" type="button" aria-label={t.prevMonth} onClick={onPrev}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 className="calendar__title" aria-live="polite">
          {formatMonth(month, language)}
        </h2>
        <button className="calendar__nav" type="button" aria-label={t.nextMonth} onClick={onNext}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="calendar__weekdays" aria-hidden="true">
        {weekdays.map((label) => (
          <span key={label} className="calendar__weekday">
            {label}
          </span>
        ))}
      </div>

      <div className="calendar__grid">
        {cells.map((dateKey, index) => {
          if (!dateKey) {
            return <span key={`blank-${index}`} className="calendar__day calendar__day--blank" aria-hidden="true" />;
          }

          const summary = summariesByDate.get(dateKey);
          const isToday = dateKey === todayKey;
          const classes = ["calendar__day", isToday ? "calendar__day--today" : ""]
            .filter(Boolean)
            .join(" ");

          const label = `${formatLongDate(dateKey, language)}${summary ? `, ${t.calendarWorkoutMark}` : ""}`;

          return (
            <button
              key={dateKey}
              className={classes}
              type="button"
              aria-pressed={selected === dateKey}
              aria-label={label}
              onClick={() => onSelect(dateKey)}
            >
              <span aria-hidden="true">{Number(dateKey.slice(8))}</span>
              {summary ? <span className="calendar__dot" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
