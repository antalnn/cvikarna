import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ExerciseCard } from "../../components/ExerciseCard";
import { Icon } from "../../components/Icon";
import { useLanguage } from "../../i18n/useLanguage";
import { useApp } from "../../state/useApp";
import { fetchWorkout } from "../../api/workout";
import type { Workout } from "../../api/types";
import {
  CZ_MONTHS,
  CZ_MONTHS_NOM,
  EN_MONTHS,
  exerciseCount,
  fmt,
  isoDate,
  longDate,
  parseIso,
  setsLabel,
} from "../../lib/format";
import { MUSCLE_LABEL, equipmentLabel, pairText } from "../../lib/labels";

export function HistoryPage() {
  const { lang, tx } = useLanguage();
  const {
    summaries,
    summariesPhase,
    summariesError,
    refreshSummaries,
    demoState,
    askConfirm,
    deleteWorkout,
  } = useApp();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const today = new Date();
  const initial = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? parseIso(dateParam) : today;
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [selectedIso, setSelectedIso] = useState<string | null>(
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : null,
  );
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutPhase, setWorkoutPhase] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const [monthScroll, setMonthScroll] = useState({ visible: false, overflowing: false });

  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  // A session reaches the log once a set in it is ticked: a draft with nothing
  // lifted is not a past session, and it must not mark the calendar either.
  const filed = summaries.filter((row) => row.setCount > 0);
  const monthSessions = filed
    .filter((row) => row.performedOn.startsWith(prefix))
    .sort((left, right) => (sort === "desc" ? right.performedOn.localeCompare(left.performedOn) : left.performedOn.localeCompare(right.performedOn)));
  const todayIso = isoDate(today);
  const fallback = monthSessions[0]?.performedOn ?? null;
  const activeIso =
    selectedIso && (filed.some((row) => row.performedOn === selectedIso) || selectedIso === todayIso)
      ? selectedIso
      : fallback;

  useEffect(() => {
    if (!selectedIso && fallback) {
      setSelectedIso(fallback);
    }
  }, [fallback, selectedIso]);

  useEffect(() => {
    if (!activeIso) {
      setWorkout(null);
      setWorkoutPhase("idle");
      return;
    }
    let cancelled = false;
    setWorkoutPhase("loading");
    const summary = filed.find((row) => row.performedOn === activeIso);
    if (!summary) {
      setWorkout(null);
      setWorkoutPhase("idle");
      return;
    }
    void fetchWorkout(summary.id).then(
      (row) => {
        if (!cancelled) {
          setWorkout(row);
          setWorkoutPhase("ready");
        }
      },
      () => {
        if (!cancelled) {
          setWorkout(null);
          setWorkoutPhase("error");
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [activeIso, summaries]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }
    const sync = () => {
      const overflow = node.scrollHeight - node.clientHeight;
      setMonthScroll({
        visible: overflow - node.scrollTop > 4,
        overflowing: overflow > 4,
      });
    };
    sync();
    node.addEventListener("scroll", sync);
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => {
      node.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [monthSessions.length, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const withWork = new Set(monthSessions.map((row) => Number(row.performedOn.slice(8, 10))));
  const selectedDay = activeIso ? Number(activeIso.slice(8, 10)) : 0;
  const activeSummary = filed.find((row) => row.performedOn === activeIso);
  const allOpen =
    workout !== null &&
    workout.exercises.length > 0 &&
    workout.exercises.every((item) => openGroups[item.exerciseId] === true);

  const goMonth = (direction: number) => {
    const next = new Date(year, month + direction, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedIso(null);
  };

  const pickDate = (iso: string) => {
    setSelectedIso(iso);
    const picked = parseIso(iso);
    setYear(picked.getFullYear());
    setMonth(picked.getMonth());
  };

  if (demoState === "loading" || summariesPhase === "loading") {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">{tx("Deník", "Logbook")}</p>
            <h1 className="display display--md">{tx("Historie tréninků", "Training history")}</h1>
          </div>
        </header>
        <div className="history">
          <section className="panel" aria-busy="true">
            <div className="skeleton__body">
              <div className="sk sk--line" />
              <div className="sk" style={{ height: 260 }} />
            </div>
          </section>
          <section className="panel" aria-busy="true">
            <div className="skeleton__body">
              <div className="sk sk--line" />
              <div className="sk sk--title" />
              <div className="sk sk--line" />
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (demoState === "error" || summariesPhase === "error") {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">{tx("Deník", "Logbook")}</p>
            <h1 className="display display--md">{tx("Historie se nenačetla", "History did not load")}</h1>
          </div>
        </header>
        <div className="stateview stateview--error">
          <span className="stateview__icon">
            <Icon name="i-info" />
          </span>
          <p className="stateview__title">{tx("Deník neodpověděl", "The logbook did not answer")}</p>
          <p className="stateview__text">
            {summariesError ?? tx("Tréninky jsou v pořádku, jen se nepodařilo načíst měsíc. Zkus to znovu.", "The sessions are fine, the month just failed to load. Try again.")}
          </p>
          <div className="stateview__actions">
            <button className="btn btn--primary" type="button" onClick={() => void refreshSummaries()}>
              {tx("Zkusit znovu", "Try again")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (demoState === "empty" || (!filed.length && monthSessions.length === 0)) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">{tx("Deník", "Logbook")}</p>
            <h1 className="display display--md">{tx("Historie je prázdná", "The logbook is empty")}</h1>
          </div>
        </header>
        <div className="stateview">
          <span className="stateview__icon">
            <Icon name="i-cal" />
          </span>
          <p className="stateview__title">{tx("Žádný uložený trénink", "No saved session")}</p>
          <p className="stateview__text">
            {tx(
              "Dokončený trénink se sem uloží sám. Kalendář pak označí den, kdy jsi zvedal.",
              "A finished session lands here on its own. The calendar then marks the day you lifted.",
            )}
          </p>
          <div className="stateview__actions">
            <Link className="btn btn--primary" to="/tracker">
              {tx("Otevřít trénink", "Open the session")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const monthNames = lang === "cs" ? CZ_MONTHS_NOM : EN_MONTHS;
  const monthGenitive = lang === "cs" ? CZ_MONTHS : EN_MONTHS;
  const weekdays = lang === "cs" ? ["PO", "ÚT", "ST", "ČT", "PÁ", "SO", "NE"] : ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{tx("Deník", "Logbook")}</p>
          <h1 className="display display--md">{tx("Historie tréninků", "Training history")}</h1>
          <p className="lede">
            {tx(
              "Prohlédni si, co jsi zvedl v každém týdnu. Minulé tréninky jsou jen ke čtení.",
              "Look back at what you lifted each week. Past sessions are read-only.",
            )}
          </p>
        </div>
        <div className="page-head__actions" />
      </header>

      <div className="history">
        <section className="panel" aria-label={tx("Kalendář", "Calendar")}>
          <div className="calendar__head">
            <button className="iconbtn" type="button" onClick={() => goMonth(-1)} aria-label={tx("Předchozí měsíc", "Previous month")}>
              <Icon name="i-arrow" className="ico ico--sm" style={{ transform: "rotate(180deg)" }} />
            </button>
            <span className="calendar__title">
              {monthNames[month]} {year}
            </span>
            <button
              className="calendar__today"
              type="button"
              onClick={() => {
                setYear(today.getFullYear());
                setMonth(today.getMonth());
                setSelectedIso(todayIso);
              }}
            >
              {tx("Dnes", "Today")}
            </button>
            <button className="iconbtn" type="button" onClick={() => goMonth(1)} aria-label={tx("Další měsíc", "Next month")}>
              <Icon name="i-arrow" className="ico ico--sm" />
            </button>
          </div>
          <div className="calendar__grid">
            {weekdays.map((day) => (
              <span className="calendar__wk" key={day}>
                {day}
              </span>
            ))}
            {Array.from({ length: firstDow }).map((_, index) => (
              <span className="calendar__day is-blank" key={`blank-${index}`} aria-hidden="true" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const has = withWork.has(day);
              const isToday = iso === todayIso;
              const summary = monthSessions.find((row) => row.performedOn === iso);
              return (
                <button
                  className={`calendar__day${has ? " has-workout" : ""}${isToday ? " is-today" : ""}`}
                  type="button"
                  key={iso}
                  disabled={!has}
                  aria-pressed={selectedDay === day && activeIso?.startsWith(prefix)}
                  aria-label={`${day}. ${monthGenitive[month]}${has && summary ? `, ${exerciseCount(summary.exerciseCount, lang)}` : ""}`}
                  onClick={() => pickDate(iso)}
                >
                  {day}
                  {has ? <span className="calendar__dot" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel monthpanel" aria-label={tx("Tréninky v měsíci", "Sessions this month")}>
          <div className="panel__head">
            <span className="micro">{tx("Tréninky v měsíci", "Sessions this month")}</span>
            <button
              className="sortbtn"
              type="button"
              aria-label={sort === "desc" ? tx("Nejnovější první", "Newest first") : tx("Nejstarší první", "Oldest first")}
              title={sort === "desc" ? tx("Nejnovější první", "Newest first") : tx("Nejstarší první", "Oldest first")}
              onClick={() => setSort((current) => (current === "desc" ? "asc" : "desc"))}
            >
              <Icon name="i-chevron" className={`ico sortbtn__ico${sort === "asc" ? " is-asc" : ""}`} />
            </button>
          </div>
          <div className="monthlist" ref={listRef} tabIndex={0} role="group" aria-label={tx("Seznam tréninků v měsíci", "Sessions in this month")}>
            {monthSessions.length ? (
              monthSessions.map((row) => (
                <button
                  className="mrow"
                  type="button"
                  key={row.id}
                  aria-pressed={row.performedOn === activeIso}
                  onClick={() => pickDate(row.performedOn)}
                >
                  <span>
                    <span className="mrow__title">{row.name ?? tx("Trénink", "Session")}</span>
                    <span className="mrow__meta">
                      {Number(row.performedOn.slice(8, 10))}. {Number(row.performedOn.slice(5, 7))}. ·{" "}
                      {exerciseCount(row.exerciseCount, lang)} · {row.setCount} {setsLabel(row.setCount, lang)}
                    </span>
                  </span>
                  <span className="mrow__vol">{row.totalVolumeKg ? `${fmt(row.totalVolumeKg, lang)} kg` : "—"}</span>
                </button>
              ))
            ) : (
              <div className="stateview stateview--inline">
                <p className="stateview__text">
                  {tx("V tomto měsíci nejsou žádné tréninky. Přepni měsíc nebo začni dnešní trénink.", "No sessions in this month. Switch months or start today's session.")}
                </p>
              </div>
            )}
          </div>
          {monthScroll.overflowing ? (
            <div className="monthcue-slot">
              {monthScroll.visible ? (
                <button
                  className="monthcue"
                  type="button"
                  aria-label={tx("Zobrazit starší tréninky", "Show older sessions")}
                  onClick={() =>
                    listRef.current?.scrollBy({
                      top: Math.round(listRef.current.clientHeight * 0.82),
                      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                    })
                  }
                >
                  <Icon name="i-chevron" className="ico ico--sm" />
                </button>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      <section className="panel" style={{ marginTop: "var(--space-4)" }} aria-labelledby="logTitle">
        {workoutPhase === "loading" ? (
          <div className="skeleton__body" aria-busy="true">
            <div className="sk sk--title" />
            <div className="sk sk--line" />
            <div className="sk sk--line" style={{ width: "50%" }} />
          </div>
        ) : workout && activeSummary ? (
          <>
            <div className="log__head">
              <div>
                <span className="micro">{tx("Vybraný trénink", "Selected session")}</span>
                <h2 className="log__title" id="logTitle">
                  {workout.name ?? tx("Trénink", "Session")}
                </h2>
                <div className="statmini">
                  <span>
                    <span className="micro">{tx("Datum", "Date")}</span>
                    <span className="statmini__v">{longDate(parseIso(workout.performedOn), lang)}</span>
                  </span>
                  <span>
                    <span className="micro">{tx("Série", "Sets")}</span>
                    <span className="statmini__v">{activeSummary.setCount}</span>
                  </span>
                  <span>
                    <span className="micro">{tx("Objem", "Volume")}</span>
                    <span className="statmini__v">{fmt(activeSummary.totalVolumeKg, lang)} kg</span>
                  </span>
                </div>
              </div>
              <div className="log__tools">
                <button
                  className="btn btn--quiet btn--sm"
                  type="button"
                  onClick={() =>
                    setOpenGroups(
                      Object.fromEntries(workout.exercises.map((item) => [item.exerciseId, !allOpen])),
                    )
                  }
                >
                  {allOpen ? tx("Sbalit vše", "Collapse all") : tx("Rozbalit vše", "Expand all")}
                </button>
                <button
                  className="iconbtn delsession"
                  type="button"
                  aria-label={tx("Smazat trénink", "Delete session")}
                  title={tx("Smazat trénink", "Delete session")}
                  onClick={(event) => {
                    askConfirm(
                      {
                        title: tx("Smazat trénink?", "Delete this session?"),
                        text: tx(
                          "Trénink zmizí z kalendáře i z historie. Zapsané série se nedají vrátit.",
                          "The session disappears from the calendar and the log. Logged sets cannot be recovered.",
                        ),
                        label: tx("Smazat", "Delete"),
                        run: () => {
                          void deleteWorkout(workout.id).then((ok) => {
                            if (ok) {
                              setSelectedIso(null);
                              setWorkout(null);
                              setWorkoutPhase("idle");
                              void refreshSummaries();
                            }
                          });
                        },
                      },
                      event.currentTarget,
                    );
                  }}
                >
                  <Icon name="i-trash" className="ico" />
                </button>
              </div>
            </div>
            <ul className="excgrid log__groups">
              {workout.exercises.filter((item) => item.sets.some((set) => set.completed)).map((item, index) => {
                const name = lang === "cs" ? item.nameCs ?? item.nameEn : item.nameEn;
                return (
                  <ExerciseCard
                    key={item.id}
                    index={index}
                    name={name}
                    subtitle={`${pairText(MUSCLE_LABEL[item.primaryMuscle], lang)} · ${equipmentLabel(item.equipment, lang)}`}
                    sets={item.sets}
                    open={openGroups[item.exerciseId] === true}
                    mode="history"
                    onToggle={() =>
                      setOpenGroups((current) => ({
                        ...current,
                        [item.exerciseId]: current[item.exerciseId] !== true,
                      }))
                    }
                  />
                );
              })}
            </ul>
          </>
        ) : (
          <>
            <div className="log__head">
              <div>
                <span className="micro">{tx("Vybraný trénink", "Selected session")}</span>
                <h2 className="log__title" id="logTitle">
                  {workoutPhase === "error" ? tx("Trénink se nenačetl", "The session did not load") : tx("Žádný trénink", "No session")}
                </h2>
              </div>
            </div>
            <div className="stateview stateview--inline">
              <p className="stateview__text">
                {workoutPhase === "error"
                  ? tx("Zkus vybrat den znovu, nebo načti historii znovu.", "Pick the day again, or reload the history.")
                  : activeIso === todayIso
                    ? tx("Dnešní trénink ještě není uložený. Ukonči ho a objeví se tady i v kalendáři.", "Today's session is not filed yet. Finish it and it appears here and in the calendar.")
                    : tx("Tento den nemá uložený trénink. Vyber den s tečkou v kalendáři, nebo dokonči dnešní trénink.", "This day has no saved session. Pick a day with a dot in the calendar, or finish today's session.")}
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}


