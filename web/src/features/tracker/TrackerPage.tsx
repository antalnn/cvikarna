import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExerciseCard } from "../../components/ExerciseCard";
import { Icon } from "../../components/Icon";
import { RestPopover } from "../../components/overlays/Overlays";
import { useLanguage } from "../../i18n/useLanguage";
import { useApp } from "../../state/useApp";
import type { LoggedSet, WorkoutExercise } from "../../api/types";
import { MUSCLE_LABEL, equipmentLabel, pairText } from "../../lib/labels";
import { fmt, formatClock, longDate, parseIso } from "../../lib/format";
import { useClockElapsed } from "../../lib/useClockElapsed";

interface SetInput {
  weightKg: number;
  reps: number;
  rpe: number | null;
  notes: string | null;
}

function SetForm({ item, onLog }: { item: WorkoutExercise; onLog: (input: SetInput) => Promise<boolean> }) {
  const { lang, tx } = useLanguage();
  const { openTip, closeTip } = useApp();
  const rpeText = tx(
    "RPE říká, jak těžká série byla. 1 je velmi lehká, 10 znamená, že už bys nedal další opakování. Většina pracovních sérií je 7 až 9.",
    "RPE says how hard a set was. 1 is very easy, 10 means no more reps were possible. Most working sets land at 7 to 9.",
  );
  const last = item.sets[item.sets.length - 1];
  const [noteOpen, setNoteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form || busy) {
      return;
    }
    const data = new FormData(form);
    const rawWeight = String(data.get("kg") ?? "").trim();
    const weight = rawWeight === "" ? 0 : Number(rawWeight.replace(",", "."));
    const reps = Number.parseInt(String(data.get("reps") ?? ""), 10);
    const rawRpe = String(data.get("rpe") ?? "").trim();
    const rpe = rawRpe === "" ? null : Number.parseInt(rawRpe, 10);
    const notes = String(data.get("note") ?? "").trim();

    const bad: string[] = [];
    if (!Number.isFinite(weight) || weight < 0 || weight > 600) {
      bad.push("kg");
    }
    if (!Number.isFinite(reps) || reps < 1 || reps > 100) {
      bad.push("reps");
    }
    if (rawRpe !== "" && (!Number.isFinite(rpe) || (rpe ?? 0) < 1 || (rpe ?? 0) > 10)) {
      bad.push("rpe");
    }

    if (bad.length) {
      bad.forEach((field) => {
        const input = form.querySelector<HTMLInputElement>(`[name="${field}"]`);
        if (input) {
          input.setAttribute("aria-invalid", "true");
          input.addEventListener("input", () => input.removeAttribute("aria-invalid"), { once: true });
        }
      });
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setBusy(true);
    const ok = await onLog({
      weightKg: weight,
      reps,
      rpe,
      notes: notes === "" ? null : notes,
    });
    setBusy(false);
    if (ok) {
      form.reset();
      setNoteOpen(false);
    }
  };

  return (
    <form className="setline setline--input" ref={formRef} onSubmit={(event) => void submit(event)}>
      <span className="setline__n">{item.sets.length + 1}</span>
      <span className="setline__form">
        <label className="setline__field">
          {tx("Kg", "Kg")}
          <input
            name="kg"
            inputMode="decimal"
            maxLength={6}
            defaultValue={last ? String(last.weightKg).replace(".", lang === "cs" ? "," : ".") : ""}
            placeholder="20"
            aria-label={tx("Váha v kilogramech", "Weight in kilograms")}
          />
        </label>
        <label className="setline__field">
          {tx("Opak.", "Reps")}
          <input
            name="reps"
            inputMode="numeric"
            maxLength={3}
            defaultValue={last ? String(last.reps) : ""}
            placeholder="8"
            aria-label={tx("Počet opakování", "Reps")}
          />
        </label>
        <span className="setline__field">
          <span className="setline__label">
            RPE{" "}
            <button
              className="infotip"
              type="button"
              aria-label={tx("Co je RPE?", "What is RPE?")}
              aria-describedby="rpeTipText"
              onMouseEnter={(event) => openTip(event.currentTarget, rpeText)}
              onMouseLeave={closeTip}
              onFocus={(event) => openTip(event.currentTarget, rpeText)}
              onBlur={closeTip}
            >
              ?
            </button>
          </span>
          <input
            name="rpe"
            inputMode="numeric"
            maxLength={2}
            defaultValue={last?.rpe !== null && last?.rpe !== undefined ? String(last.rpe) : ""}
            placeholder="8"
            aria-label={`RPE 1 ${tx("až", "to")} 10`}
          />
        </span>
        <label className="setline__field setline__note-field" hidden={!noteOpen}>
          {tx("Poznámka", "Note")}
          <input name="note" placeholder={tx("nepovinné", "optional")} aria-label={tx("Poznámka k sérii", "Set note")} />
        </label>
        <button className="btn btn--primary btn--sm" type="submit" disabled={busy}>
          {tx("Zapsat sérii", "Log set")}
        </button>
        <button
          className="iconbtn setline__notebtn"
          type="button"
          aria-label={tx("Poznámka k sérii", "Set note")}
          aria-expanded={noteOpen}
          onClick={() => setNoteOpen((current) => !current)}
        >
          <Icon name="i-pencil" className="ico ico--sm" />
        </button>
      </span>
    </form>
  );
}

export function TrackerPage() {
  const { lang, tx } = useLanguage();
  const {
    today,
    todayPhase,
    todayError,
    demoState,
    refreshToday,
    refreshSummaries,
    openSheet,
    openMenu,
    askConfirm,
    toast,
    logSet,
    toggleSet,
    deleteSet,
    removeExercise,
    renameSession,
    finishSession,
    copying,
    clock,
    startClock,
    resetClock,
    ensureClock,
    rest,
    restValue,
    startRest,
    restTimer,
    pauseRest,
    resumeRest,
  } = useApp();
  const navigate = useNavigate();
  const clockElapsed = useClockElapsed(clock.startedAt);
  const [openEx, setOpenEx] = useState<number | null | undefined>(undefined);
  const [renaming, setRenaming] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [restAnchor, setRestAnchor] = useState<HTMLElement | null>(null);
  const [restOpen, setRestOpen] = useState(false);

  const exercises = today?.exercises ?? [];
  const items = demoState === "edge" ? exercises.slice(0, 1) : exercises;
  const totals = items.reduce(
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
    { volume: 0, done: 0, total: 0 },
  );
  const pct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;
  const activeExercise = items[0];
  const openExerciseId =
    openEx === undefined ? activeExercise?.exerciseId : openEx;
  const date = today ? parseIso(today.performedOn) : new Date();

  const finish = async () => {
    if (!totals.done) {
      toast(tx("Nejdřív zapiš alespoň jednu sérii.", "Log at least one set first."), "danger");
      return;
    }
    // A movement with no completed set is not work that happened; the filed
    // session keeps only what was actually lifted.
    const empty = items.filter((item) => !item.sets.some((set) => set.completed));
    if (empty.length) {
      await Promise.all(empty.map((item) => removeExercise(item.id)));
      await refreshToday();
    }
    await refreshSummaries();
    finishSession();
    toast(tx("Trénink uložen do historie. Dobrá práce.", "Session filed in history. Good work."));
    navigate(`/history?date=${today?.performedOn ?? ""}`);
  };

  const removeItem = (item: WorkoutExercise, anchor: HTMLElement | null) => {
    const name = lang === "cs" ? item.nameCs ?? item.nameEn : item.nameEn;
    const setWord = item.sets.length === 1 ? "sérii" : item.sets.length < 5 ? "série" : "sérií";
    askConfirm(
      {
        title: tx("Odebrat cvik?", "Remove this exercise?"),
        text: tx(
          `Odebere ${name} · ${item.sets.length} ${setWord} z dnešního tréninku.`,
          `Removes ${name} · ${item.sets.length} sets from today's session.`,
        ),
        label: tx("Odebrat", "Remove"),
        run: () => void removeExercise(item.id),
      },
      anchor,
    );
  };

  if (demoState === "loading" || todayPhase === "loading") {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">{longDate(date, lang)}</p>
            <h1 className="display display--md">{today?.name ?? tx("Dnešní trénink", "Today's session")}</h1>
          </div>
        </header>
        <div className="excgrid" aria-busy="true" aria-label={tx("Načítání tréninku", "Loading the session")}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="excard" key={index}>
              <div className="skeleton__body">
                <div className="sk sk--title" />
                <div className="sk sk--line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (demoState === "error" || todayPhase === "error") {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">{longDate(date, lang)}</p>
            <h1 className="display display--md">{tx("Trénink se nenačetl", "The session did not load")}</h1>
          </div>
        </header>
        <div className="stateview stateview--error">
          <span className="stateview__icon">
            <Icon name="i-info" />
          </span>
          <p className="stateview__title">{tx("Série se neuložily", "The sets were not saved")}</p>
          <p className="stateview__text">
            {todayError ?? tx("Server neodpověděl. Zkus to znovu, nic se neztratilo.", "The server did not answer. Try again, nothing was lost.")}
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

  if (demoState === "empty" || !today || !items.length) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="eyebrow">{longDate(date, lang)}</p>
            <h1 className="display display--md">{tx("Trénink je prázdný", "The session is empty")}</h1>
          </div>
        </header>
        <div className="stateview">
          <span className="stateview__icon">
            <Icon name="i-bar" />
          </span>
          <p className="stateview__title">{tx("Zatím žádný cvik", "No movement yet")}</p>
          <p className="stateview__text">
            {tx(
              "Přidej první cvik a zapiš sérii. Objem, počet sérií a čas se začnou počítat samy.",
              "Add the first movement and log a set. Volume, set count and time start counting on their own.",
            )}
          </p>
          <div className="stateview__actions">
            <button className="btn btn--primary" type="button" onClick={() => openSheet({ kind: "add" })}>
              {tx("Přidat cvik", "Add exercise")}
            </button>
            <button
              className="btn btn--quiet"
              type="button"
              onClick={() => openSheet({ kind: "copy" })}
              disabled={copying}
              aria-busy={copying}
            >
              {copying ? tx("Kopíruje se…", "Copying…") : tx("Zkopírovat trénink", "Copy workout")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">{longDate(date, lang)}</p>
          {renaming ? (
            <form
              className="nameform"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const value = String(data.get("name") ?? "").trim();
                const input = event.currentTarget.querySelector("input");
                if (!value) {
                  setNameError(true);
                  input?.focus();
                  return;
                }
                setNameError(false);
                setRenaming(false);
                void renameSession(value);
              }}
            >
              <label className="visually-hidden" htmlFor="wname">
                {tx("Název tréninku", "Session name")}
              </label>
              <input
                id="wname"
                name="name"
                defaultValue={today.name ?? ""}
                maxLength={80}
                autoComplete="off"
                aria-invalid={nameError}
                autoFocus
              />
              <button className="btn btn--primary btn--sm" type="submit">
                {tx("Uložit", "Save")}
              </button>
              <button
                className="btn btn--quiet btn--sm"
                type="button"
                onClick={() => {
                  setNameError(false);
                  setRenaming(false);
                }}
              >
                {tx("Zrušit", "Cancel")}
              </button>
            </form>
          ) : (
            <div className="title-edit">
              <h1 className="display display--md">{today.name ?? tx("Dnešní trénink", "Today's session")}</h1>
              <button
                className="iconbtn"
                type="button"
                aria-label={tx("Přejmenovat trénink", "Rename session")}
                onClick={() => setRenaming(true)}
              >
                <Icon name="i-pencil" className="ico ico--sm" />
              </button>
            </div>
          )}
        </div>
        <div className="page-head__actions">
          <button
            className="btn btn--quiet"
            type="button"
            onClick={() => openSheet({ kind: "copy" })}
            disabled={copying}
            aria-busy={copying}
          >
            <Icon name="i-copy" className="ico ico--sm" />
            {copying ? tx("Kopíruje se…", "Copying…") : tx("Zkopírovat trénink", "Copy workout")}
          </button>
          <button className="btn btn--primary" type="button" onClick={() => openSheet({ kind: "add" })}>
            <Icon name="i-plus" className="ico ico--sm" />
            {tx("Přidat cvik", "Add exercise")}
          </button>
        </div>
      </header>

      <div className="sessionbar">
        <div className="sessionbar__stats">
          <div className="sessionbar__stat">
            <span className="micro">{tx("Objem", "Volume")}</span>
            <span className="sessionbar__value num">
              {fmt(totals.volume, lang)} <small>kg</small>
            </span>
          </div>
          <div className="sessionbar__stat">
            <span className="micro">{tx("Série", "Sets")}</span>
            <span className="sessionbar__value num">
              {totals.done}/{totals.total}
            </span>
          </div>
          <div className="sessionbar__stat">
            <span className="micro">{tx("Čas", "Time")}</span>
            <span className="sessionbar__value num">
              {formatClock(clockElapsed)}
            </span>
          </div>
        </div>
        <div className="sessionbar__actions">
          {clock.startedAt ? (
            <button className="btn sessionbar__finish" type="button" onClick={finish}>
              {tx("Ukončit trénink", "Finish session")}
            </button>
          ) : (
            <button
              className="clockstart"
              type="button"
              onClick={() => {
                if (!items.length) {
                  toast(tx("Nejdřív přidej alespoň jeden cvik.", "Add at least one exercise first."), "danger");
                  return;
                }
                startClock();
              }}
            >
              {tx("Spustit", "Start")}
            </button>
          )}
          <button
            className="iconbtn clockreset"
            type="button"
            aria-label={tx("Vynulovat čas", "Reset the clock")}
            disabled={!clock.startedAt}
            onClick={(event) =>
              askConfirm(
                {
                  title: tx("Vynulovat čas?", "Reset the clock?"),
                  text: tx(
                    "Čas se vynuluje a zastaví. Spustíš ho znovu tlačítkem Spustit, zapsané série zůstanou nedotčené.",
                    "The clock resets to zero and stops. Start it again with the start control; logged sets stay untouched.",
                  ),
                  label: tx("Vynulovat", "Reset"),
                  run: () => {
                    resetClock();
                    toast(tx("Čas vynulován a zastaven", "Clock reset and stopped"));
                  },
                },
                event.currentTarget,
              )
            }
          >
            <Icon name="i-reset" className="ico ico--sm" />
          </button>
          <div className={`restctl${restTimer.running ? " is-running" : restTimer.done || !restTimer.visible ? "" : " is-paused"}`}>
            <button
              className="restctl__start"
              type="button"
              aria-label={
                restTimer.running
                  ? tx("Pozastavit pauzu", "Pause the rest")
                  : restTimer.visible && !restTimer.done
                    ? tx("Pokračovat v pauze", "Resume the rest")
                    : tx("Spustit pauzu pro otevřený cvik", "Start a rest for the open movement")
              }
              onClick={() => {
                if (restTimer.running) {
                  pauseRest();
                  return;
                }
                if (restTimer.visible && !restTimer.done) {
                  resumeRest();
                  return;
                }
                const target = items.find((item) => item.exerciseId === openExerciseId) ?? activeExercise;
                if (target) {
                  startRest(restValue(target.exerciseId), target.exerciseId);
                }
              }}
            >
              <Icon name={restTimer.running ? "i-pause" : "i-play"} className="ico ico--sm" />
            </button>
            <button
              className="restctl__value"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={restOpen}
              onClick={(event) => {
                setRestAnchor(event.currentTarget);
                setRestOpen((open) => !open);
              }}
            >
              <span className="restctl__state">
                {restTimer.running
                  ? tx("Pauza běží", "Rest running")
                  : restTimer.visible && !restTimer.done
                    ? tx("Pauza pozastavena", "Rest paused")
                    : tx("Pauza", "Rest")}
              </span>
              <span className="num restctl__clock">
                {restTimer.visible && !restTimer.done
                  ? `${Math.floor(restTimer.left / 60)}:${String(restTimer.left % 60).padStart(2, "0")}`
                  : `${restValue(openExerciseId ?? activeExercise?.exerciseId ?? null)} s`}
              </span>
            </button>
          </div>
        </div>
        <div className="sessionbar__meter">
          <span className="micro">{tx("Průběh tréninku", "Session progress")}</span>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${tx("Průběh tréninku", "Session progress")}: ${totals.done} ${tx("z", "of")} ${totals.total} ${tx("sérií hotovo", "sets done")}, ${pct} %`}
          >
            <span className="progress__fill" style={{ "--p": pct } as CSSProperties} />
          </div>
          <span className="sessionbar__pct num">{pct} %</span>
        </div>
      </div>

      <span className="visually-hidden" id="rpeTipText">
        {tx(
          "RPE říká, jak těžká série byla. 1 je velmi lehká, 10 znamená, že už bys nedal další opakování. Většina pracovních sérií je 7 až 9.",
          "RPE says how hard a set was. 1 is very easy, 10 means no more reps were possible. Most working sets land at 7 to 9.",
        )}
      </span>

      <ul className="excgrid">
        {items.map((item, index) => {
          const open =
            openEx === undefined ? index === 0 : openExerciseId === item.exerciseId;
          const name = lang === "cs" ? item.nameCs ?? item.nameEn : item.nameEn;
          return (
            <ExerciseCard
              key={item.id}
              index={index}
              name={name}
              subtitle={`${pairText(MUSCLE_LABEL[item.primaryMuscle], lang)} · ${equipmentLabel(item.equipment, lang)}`}
              sets={item.sets}
              open={open}
              mode="tracker"
              onToggle={() => setOpenEx(open ? null : item.exerciseId)}
              onSetToggle={(set: LoggedSet) => {
                const nextDone = !set.completed;
                void toggleSet(set.id, nextDone).then((ok) => {
                  if (ok && nextDone) {
                    ensureClock();
                    if (rest.auto) {
                      startRest(restValue(item.exerciseId), item.exerciseId);
                    }
                  }
                });
              }}
              onDeleteSet={(set: LoggedSet) => void deleteSet(set.id)}
              onMenu={(anchor) =>
                openMenu(anchor, [
                  {
                    label: tx("Detail cviku", "Exercise detail"),
                    run: () => openSheet({ kind: "ex", exerciseId: item.exerciseId }),
                  },
                  {
                    label: tx("Odebrat cvik", "Remove exercise"),
                    run: () => removeItem(item, anchor),
                  },
                ])
              }
            >
              <SetForm
                key={`${item.id}-${item.sets.length}`}
                item={item}
                onLog={async (input) => {
                  const created = await logSet(item.id, { ...input, completed: false });
                  if (created) {
                    ensureClock();
                    return true;
                  }
                  return false;
                }}
              />
            </ExerciseCard>
          );
        })}
      </ul>

      <RestPopover
        anchor={restAnchor}
        open={restOpen}
        onClose={() => setRestOpen(false)}
        exerciseId={openExerciseId ?? activeExercise?.exerciseId ?? null}
      />


      <p className="visually-hidden" aria-live="polite">
        {today?.name ?? ""}
      </p>

      {exercises.length > 0 ? (
        <div className="more">
          <Link className="linkbtn" to="/library">
            {tx("Přidat další cvik z knihovny", "Add another movement from the library")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}




