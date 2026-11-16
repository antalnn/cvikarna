import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { useLanguage } from "../../i18n/useLanguage";
import { useApp } from "../../state/useApp";
import { MUSCLE_LABEL, equipmentLabel, pairText } from "../../lib/labels";
import { daysLabel, fmt, isoDate, longDate, parseIso, sessionCount } from "../../lib/format";

function useScrollCue<T extends HTMLElement>(dependency: unknown) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const sync = () => setVisible(node.scrollHeight - node.scrollTop - node.clientHeight > 4);
    sync();
    node.addEventListener("scroll", sync);
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    window.addEventListener("resize", sync);
    return () => {
      node.removeEventListener("scroll", sync);
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [dependency]);

  return { ref, visible };
}

export function DashboardPage() {
  const { lang, tx } = useLanguage();
  const { dashboard, dashboardPhase, dashboardError, today, todayPhase, demoState, openSheet, refreshToday } =
    useApp();
  const { ref: sessionRef, visible: sessionCue } = useScrollCue<HTMLUListElement>(today);

  const exercises = useMemo(() => {
    const list = today?.exercises ?? [];
    if (demoState === "edge" && list[0]) {
      return [
        {
          ...list[0],
          nameCs: "Tlaky s jednoručkami na vodorovné lavici neutrálním úchopem se zadržením na hrudi",
          nameEn: "Dumbbell Bench Press with Neutral Grip and a Pause at the Chest",
        },
        ...list.slice(1),
      ];
    }
    return list;
  }, [demoState, today]);

  const totals = exercises.reduce(
    (acc, item) => {
      item.sets.forEach((set) => {
        acc.total += 1;
        if (set.completed) {
          acc.done += 1;
          acc.volume += Number(set.weightKg) * Number(set.reps);
        }
      });
      return acc;
    },
    { done: 0, total: 0, volume: 0 },
  );
  const pct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;

  const week = dashboard?.week ?? [];
  const maxWeek = Math.max(...week.map((day) => day.volume), 1);
  const weeks = dashboard?.weeklyVolume ?? [];
  const maxVolume = Math.max(...weeks.map((row) => row.volume), 1);
  const lastWeek = weeks[weeks.length - 1];
  const previousAverage =
    weeks.length > 1
      ? weeks.slice(0, -1).reduce((sum, row) => sum + row.volume, 0) / (weeks.length - 1)
      : 0;
  const volumeDelta =
    previousAverage > 0 && lastWeek ? ((lastWeek.volume - previousAverage) / previousAverage) * 100 : null;
  const delta =
    dashboard && dashboard.previousWeekVolume > 0
      ? ((dashboard.currentWeekVolume - dashboard.previousWeekVolume) / dashboard.previousWeekVolume) * 100
      : null;
  const todayDate = new Date();
  const isTodayEmpty = !exercises.length;

  if (demoState === "loading" || todayPhase === "loading" || dashboardPhase === "loading") {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">{longDate(todayDate, lang)}</p>
            <h1 className="display">{today?.name ?? tx("Dnešní trénink", "Today's session")}</h1>
          </div>
        </header>
        <div className="dash">
          {[0, 1, 2, 3, 4].map((index) => (
            <section className={`panel${index === 0 ? " dash__session" : index === 1 ? " dash__stats" : ""}`} key={index} aria-busy="true">
              <div className="skeleton__body">
                <div className="sk sk--title" />
                <div className="sk sk--line" />
                <div className="sk sk--line" style={{ width: "60%" }} />
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (demoState === "error" || todayPhase === "error" || dashboardPhase === "error") {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">{longDate(todayDate, lang)}</p>
            <h1 className="display">{tx("Přehled se nenačetl", "The overview did not load")}</h1>
          </div>
        </header>
        <div className="stateview stateview--error">
          <span className="stateview__icon">
            <Icon name="i-info" />
          </span>
          <p className="stateview__title">{tx("Spojení s API spadlo", "The API connection dropped")}</p>
          <p className="stateview__text">
            {dashboardError ??
              tx(
                "Dnešní trénink zůstal uložený. Zkus to znovu, až bude server dostupný.",
                "Today's session stayed saved. Try again once the server is reachable.",
              )}
          </p>
          <div className="stateview__actions">
            <button className="btn btn--primary" type="button" onClick={() => void refreshToday()}>
              {tx("Zkusit znovu", "Try again")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (demoState === "empty" || isTodayEmpty) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">{longDate(todayDate, lang)}</p>
            <h1 className="display display--md">{tx("Dnes nic neběží", "Nothing running today")}</h1>
          </div>
        </header>
        <div className="stateview">
          <span className="stateview__icon">
            <Icon name="i-pulse" />
          </span>
          <p className="stateview__title">{tx("Žádný trénink", "No session")}</p>
          <p className="stateview__text">
            {tx(
              "Dnes ještě není co shrnout. Vyber cviky v knihovně a začni první sérii, přehled se naplní sám.",
              "There is nothing to sum up yet. Pick movements in the library and log the first set; this overview fills itself.",
            )}
          </p>
          <div className="stateview__actions">
            <Link className="btn btn--primary" to="/library">
              {tx("Otevřít knihovnu", "Open the library")}
            </Link>
            <button className="btn btn--quiet" type="button" onClick={() => openSheet({ kind: "add" })}>
              {tx("Přidat cvik", "Add exercise")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recordWindow =
    dashboard?.personalRecords[0]?.achievedOn &&
    todayDate.getTime() - parseIso(dashboard.personalRecords[0].achievedOn).getTime() <= 30 * 86400000;

  return (
    <div className="page page--dash">
      <header className="page-head">
        <div>
          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            {tx("Dnes", "Today")} · {longDate(todayDate, lang)}
          </p>
          <h1 className="display">{today?.name ?? tx("Dnešní trénink", "Today's session")}</h1>
        </div>
        <div className="page-head__actions">
          <button className="btn btn--quiet" type="button" onClick={() => openSheet({ kind: "copy" })}>
            <Icon name="i-copy" className="ico ico--sm" />
            {tx("Zkopírovat trénink", "Copy workout")}
          </button>
          <button className="btn btn--primary" type="button" onClick={() => openSheet({ kind: "add" })}>
            <Icon name="i-plus" className="ico ico--sm" />
            {tx("Přidat cvik", "Add exercise")}
          </button>
        </div>
      </header>

      <div className="dash">
        <section className="panel dash__session" style={{ "--i": 0 } as CSSProperties} aria-labelledby="sessTitle">
          <div className="panel__head">
            <div>
              <h2 className="micro" id="sessTitle">
                {tx("Rozpracovaný trénink", "Session in progress")}
              </h2>
            </div>
            <span className="tag">
              <Icon name="i-clock" />
              <span>
                {tx("dnes", "today")} · {fmt(totals.volume, lang)} kg
              </span>
            </span>
          </div>
          <div className="session__scroll">
            <ul className="session" ref={sessionRef}>
              {exercises.map((item, index) => {
                const name = lang === "cs" ? item.nameCs ?? item.nameEn : item.nameEn;
                const best = item.sets
                  .filter((set) => set.completed)
                  .sort((left, right) => Number(right.weightKg) - Number(left.weightKg))[0];
                return (
                  <li className="session__row" key={item.id}>
                    <span className="session__idx">{String(index + 1).padStart(2, "0")}</span>
                    <span className="session__id">
                      <span className="session__name">{name}</span>
                      <span className="session__meta">
                        {pairText(MUSCLE_LABEL[item.primaryMuscle], lang)} ·{" "}
                        {equipmentLabel(item.equipment, lang)}
                      </span>
                    </span>
                    <span className="session__sets" title={`${item.sets.filter((set) => set.completed).length}/${item.sets.length}`}>
                      {item.sets.map((set) => (
                        <i key={set.id} className={set.completed ? "is-done" : ""} />
                      ))}
                    </span>
                    <span className="session__load">
                      {best ? `${fmt(best.weightKg, lang)} kg × ${best.reps}` : "—"}
                    </span>
                    <Link
                      className="iconbtn"
                      to={`/exercise/${item.exerciseId}`}
                      state={{ from: "dnes" }}
                      aria-label={`${tx("Otevřít", "Open")} ${name}`}
                    >
                      <Icon name="i-arrow" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              className="monthcue"
              type="button"
              aria-label={tx("Zobrazit další cviky", "Show more exercises")}
              hidden={!sessionCue}
              onClick={() =>
                sessionRef.current?.scrollBy({
                  top: Math.round(sessionRef.current.clientHeight * 0.82),
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                })
              }
            >
              <Icon name="i-chevron" className="ico ico--sm" />
            </button>
          </div>
          <div className="dash__foot">
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={tx("Dokončené série", "Completed sets")}
            >
              <span className="progress__fill" style={{ "--p": pct } as CSSProperties} />
            </div>
            <span className="micro">
              {totals.done}/{totals.total}
            </span>
            <Link className="btn btn--primary" to="/tracker">
              {totals.total > 0 && totals.done >= totals.total
                ? tx("Upravit", "Edit")
                : tx("Pokračovat", "Continue")}
            </Link>
          </div>
        </section>

        <section className="panel dash__stats" style={{ "--i": 1 } as CSSProperties}>
          <div className="panel__head">
            <span className="micro">{tx("Podle deníku", "From the log")}</span>
            <span className="panel__note">{tx("tento týden", "this week")}</span>
          </div>
          <ul className="statrow">
            <li>
              <span className="statrow__label">{tx("Tréninky", "Sessions")}</span>
              <span className="statrow__value num">{dashboard?.weekSessions ?? 0}</span>
              <span className="statrow__note">
                {week[0] ? `${tx("od", "since")} ${longDate(parseIso(week[0].date), lang)}` : ""}
              </span>
            </li>
            <li>
              <span className="statrow__label">{tx("Objem proti minulému týdnu", "Volume vs. last week")}</span>
              <span className={`statrow__value num ${delta !== null && delta >= 0 ? "is-up" : "is-down"}`}>
                {delta === null ? "—" : `${delta >= 0 ? "+" : "−"}${fmt(Math.abs(delta), lang)} %`}
              </span>
              <span className="statrow__note">
                <span className="cmp">
                  <span className="cmp__row">
                    <span className="cmp__label">{tx("tento", "this")}</span>
                    <span className="cmp__track">
                      <span
                        className="cmp__fill"
                        style={{
                          "--w": Math.round(
                            ((dashboard?.currentWeekVolume ?? 0) /
                              Math.max(dashboard?.currentWeekVolume ?? 0, dashboard?.previousWeekVolume ?? 0, 1)) *
                              100,
                          ),
                        } as CSSProperties}
                      />
                    </span>
                    <span className="cmp__val num">{fmt(dashboard?.currentWeekVolume ?? 0, lang)} kg</span>
                  </span>
                  <span className="cmp__row">
                    <span className="cmp__label">{tx("minulý", "last")}</span>
                    <span className="cmp__track">
                      <span
                        className="cmp__fill cmp__fill--dim"
                        style={{
                          "--w": Math.round(
                            ((dashboard?.previousWeekVolume ?? 0) /
                              Math.max(dashboard?.currentWeekVolume ?? 0, dashboard?.previousWeekVolume ?? 0, 1)) *
                              100,
                          ),
                        } as CSSProperties}
                      />
                    </span>
                    <span className="cmp__val num">{fmt(dashboard?.previousWeekVolume ?? 0, lang)} kg</span>
                  </span>
                </span>
              </span>
            </li>
            <li>
              <span className="statrow__label">{tx("Dny od posledního tréninku", "Days since the last session")}</span>
              <span className="statrow__value num">{dashboard?.daysSinceLast ?? "—"}</span>
              <span className="statrow__note">
                {dashboard?.lastSessionOn
                  ? `${longDate(parseIso(dashboard.lastSessionOn), lang)} · ${dashboard.daysSinceLast ?? 0} ${daysLabel(dashboard.daysSinceLast ?? 0, lang)}`
                  : tx("žádný záznam", "no record")}
              </span>
            </li>
          </ul>
        </section>

        <section className="panel" style={{ "--i": 2 } as CSSProperties}>
          <div className="panel__head">
            <span className="micro">{tx("Týden", "This week")}</span>
            <span className="panel__note">
              {sessionCount(dashboard?.weekSessions ?? 0, lang)}
            </span>
          </div>
          <ol className="week">
            {week.map((day, index) => {
              const date = parseIso(day.date);
              const labels =
                lang === "cs"
                  ? ["PO", "ÚT", "ST", "ČT", "PÁ", "SO", "NE"]
                  : ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
              const isToday = day.date === isoDate(new Date());
              return (
                <li className={`week__day${day.hasSession ? " is-done" : ""}${isToday ? " is-today" : ""}`} key={day.date}>
                  <span className="week__label">{labels[index]}</span>
                  <span className="week__track">
                    <span className="week__bar" style={{ "--h": Math.round((day.volume / maxWeek) * 100) } as CSSProperties} />
                  </span>
                  <span className="week__num">{date.getDate()}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="panel" style={{ "--i": 3 } as CSSProperties}>
          <div className="panel__head">
            <span className="micro">{tx("Osobní rekordy", "Personal records")}</span>
            <span className="panel__note">{recordWindow ? tx("30 dní", "30 days") : tx("z deníku", "from the log")}</span>
          </div>
          {dashboard?.personalRecords.length ? (
            <ul className="ledger">
              {dashboard.personalRecords.map((record) => {
                const name = lang === "cs" ? record.nameCs ?? record.nameEn : record.nameEn;
                const gain =
                  record.previousBestWeightKg !== null
                    ? record.bestWeightKg - record.previousBestWeightKg
                    : null;
                return (
                  <li key={record.exerciseId}>
                    <span className="ledger__name">{name}</span>
                    <span className="ledger__val num">{fmt(record.bestWeightKg, lang)} kg</span>
                    <span className="ledger__delta">
                      {gain !== null && gain > 0 ? `+${fmt(gain, lang)}` : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="stateview__text">
              {tx("Zatím žádný rekord. Zapiš první sérii a objeví se tady.", "No record yet. Log a set and it appears here.")}
            </p>
          )}
        </section>

        <section className="panel" style={{ "--i": 4 } as CSSProperties}>
          <div className="panel__head">
            <span className="micro">{tx("Objem po týdnech", "Volume by week")}</span>
            <span className="panel__note num">{fmt(lastWeek?.volume ?? 0, lang)} kg</span>
          </div>
          <div className="spark" role="img" aria-label={tx("Objem za posledních sedm týdnů", "Volume over the last seven weeks")}>
            {weeks.map((row) => (
              <span className="spark__col" key={row.start}>
                <span className="spark__plot">
                  <span className="spark__bar" style={{ "--h": Math.round((row.volume / maxVolume) * 100) } as CSSProperties} />
                </span>
                <span className="spark__label">{row.label}</span>
              </span>
            ))}
          </div>
          <p className="dash__volume-note" style={{ marginTop: "var(--space-3)" }}>
            {tx("Posledních 7 týdnů", "Last 7 weeks")} ·{" "}
            <span className="num" style={{ color: "var(--accent)" }}>
              {volumeDelta === null ? "—" : `${volumeDelta >= 0 ? "+" : "−"}${fmt(Math.abs(volumeDelta), lang)} %`}
            </span>{" "}
            {tx("proti průměru", "vs. average")}
          </p>
        </section>
      </div>
    </div>
  );
}


