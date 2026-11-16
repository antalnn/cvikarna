import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { useLanguage } from "../i18n/useLanguage";
import { useApp } from "../state/useApp";
import { fetchExercise } from "../api/library";
import { fetchStats } from "../api/workout";
import type { CatalogueRow, Equipment, Exercise, Level, MuscleGroup } from "../api/types";
import { muscleGroupOf } from "../api/types";
import { exerciseCount, fuzzyMatch, fmt, setsLabel } from "../lib/format";
import {
  EQUIPMENT_GROUPS,
  LEVEL_LABEL,
  MUSCLE_GROUPS,
  MUSCLE_LABEL,
  equipmentLabel,
  muscleSearchText,
  pairText,
} from "../lib/labels";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SheetHost() {
  const { sheet, closeSheet } = useApp();
  const { tx } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sheet) {
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first =
      panel?.querySelector<HTMLElement>(".pick:not([disabled])") ??
      panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // A confirm or menu opened over the sheet owns Escape; the sheet waits
        // for the surface above it to close first.
        if (document.querySelector(".confirmpop, .menu")) {
          return;
        }
        event.preventDefault();
        closeSheet();
        return;
      }
      if (event.key !== "Tab" || !panel) {
        return;
      }
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null,
      );
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (!firstNode || !lastNode) {
        return;
      }
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous && document.contains(previous)) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [closeSheet, sheet]);

  if (!sheet) {
    return null;
  }

  const meta =
    sheet.kind === "add"
      ? {
          kicker: tx("Přidat cvik", "Add exercise"),
          title: tx("Vyber cvik do tréninku", "Pick a movement for the session"),
          body: <PickerSheet />,
        }
      : sheet.kind === "copy"
        ? {
            kicker: tx("Zkopírovat trénink", "Copy workout"),
            title: tx("Vyber předchozí trénink", "Pick a previous session"),
            body: <CopySheet />,
          }
        : {
            kicker: tx("Cvik", "Movement"),
            title: tx("Detail cviku", "Movement detail"),
            body: <MovementSheet exerciseId={sheet.exerciseId} />,
          };

  return (
    <div className="sheet">
      <div className="sheet__scrim" onClick={closeSheet} />
      <div
        className="sheet__panel"
        id="sheetPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheetTitle"
        ref={panelRef}
      >
        <header className="sheet__head">
          <div className="sheet__heading">
            <span className="micro">{meta.kicker}</span>
            <h2 className="sheet__title" id="sheetTitle">
              {meta.title}
            </h2>
          </div>
          <button className="iconbtn" type="button" onClick={closeSheet} aria-label={tx("Zavřít", "Close")}>
            <Icon name="i-x" />
          </button>
        </header>
        <div className="sheet__body">{meta.body}</div>
      </div>
    </div>
  );
}

interface PickerRow {
  id: number;
  name: string;
  muscle: MuscleGroup;
  muscleLabel: string;
  muscleSearch: string;
  equipment: string;
  level: Level;
  saved: boolean;
  added: boolean;
  aliases: string[];
}

function toRow(
  row: CatalogueRow | Exercise,
  lang: "cs" | "en",
  savedIds: Set<number>,
  workoutIds: Set<number>,
): PickerRow {
  const aliases =
    "aliasesEn" in row ? [...row.aliasesEn, ...row.aliasesCs] : [];
  return {
    id: row.id,
    name: lang === "cs" ? row.nameCs ?? row.nameEn : row.nameEn,
    muscle: muscleGroupOf(row.primaryMuscle),
    muscleLabel: pairText(MUSCLE_LABEL[row.primaryMuscle], lang),
    muscleSearch: muscleSearchText(row.primaryMuscle, muscleGroupOf(row.primaryMuscle), lang),
    equipment: equipmentLabel((row.equipment as Equipment | null) ?? null, lang),
    level: row.level,
    saved: savedIds.has(row.id) || ("isLibrary" in row && row.isLibrary),
    added: workoutIds.has(row.id),
    aliases,
  };
}

function PickerSheet() {
  const { lang, tx } = useLanguage();
  const { library, catalogue, savedIds, today, addExercise } = useApp();
  const [tab, setTab] = useState<"lib" | "cat">("lib");
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [equipment, setEquipment] = useState<Equipment | "all">("all");

  const workoutIds = useMemo(
    () => new Set(today?.exercises.map((item) => item.exerciseId) ?? []),
    [today],
  );

  const rows = useMemo(() => {
    const libRows = library.map((row) => toRow(row, lang, savedIds, workoutIds));
    // The catalogue tab answers "what else can I add", so a movement already in
    // the library belongs to the other tab and never appears twice.
    const catRows = catalogue
      .map((row) => toRow(row, lang, savedIds, workoutIds))
      .filter((row) => !row.saved);

    const list = tab === "lib" ? libRows : catRows;

    return list.filter((row) => {
      if (muscle !== "all" && row.muscle !== muscle) {
        return false;
      }
      if (equipment !== "all" && row.equipment !== equipmentLabel(equipment, lang)) {
        return false;
      }
      if (!query.trim()) {
        return true;
      }
      return fuzzyMatch([row.name, ...row.aliases, row.muscleSearch, row.equipment].join(" "), query);
    });
  }, [catalogue, equipment, lang, library, muscle, query, savedIds, tab, workoutIds]);

  const total =
    tab === "lib" ? library.length : catalogue.filter((row) => !savedIds.has(row.id)).length;

  return (
    <>
      <div className="sheet__tabs" role="tablist" aria-label={tx("Zdroj cviků", "Movement source")}>
        <button
          className="shtab"
          type="button"
          role="tab"
          aria-selected={tab === "lib"}
          onClick={() => setTab("lib")}
        >
          {tx("Knihovna", "Library")}
        </button>
        <button
          className="shtab"
          type="button"
          role="tab"
          aria-selected={tab === "cat"}
          onClick={() => setTab("cat")}
        >
          {tx("Katalog", "Catalogue")}
        </button>
      </div>

      <div className="pickbar">
        <div className="field">
          <Icon name="i-search" />
          <label className="visually-hidden" htmlFor="pickSearch">
            {tx("Hledat cvik", "Search movements")}
          </label>
          <input
            id="pickSearch"
            type="search"
            autoComplete="off"
            value={query}
            placeholder={tx("Hledej cvik, sval nebo přezdívku…", "Search a movement, muscle or alias…")}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              className="field__clear"
              type="button"
              aria-label={tx("Vymazat hledání", "Clear search")}
              onClick={() => setQuery("")}
            >
              <Icon name="i-x" className="ico ico--sm" />
            </button>
          ) : null}
        </div>
        <div className="pickfilters">
          <div className="chips chips--tight" role="group" aria-label={tx("Svalová skupina", "Muscle group")}>
            {MUSCLE_GROUPS.map((group) => (
              <button
                key={group.id}
                className="chip chip--sm"
                type="button"
                aria-pressed={muscle === group.id}
                onClick={() => setMuscle(group.id)}
              >
                {pairText(group.pair, lang)}
              </button>
            ))}
          </div>
          <label className="select select--tight">
            <span className="visually-hidden">{tx("Nářadí", "Equipment")}</span>
            <select
              aria-label={tx("Nářadí", "Equipment")}
              value={equipment}
              onChange={(event) => setEquipment(event.target.value as Equipment | "all")}
            >
              {EQUIPMENT_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {pairText(group.pair, lang)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {rows.length ? (
        <div className="picklist picklist--moves">
          {rows.slice(0, 60).map((row) => (
            <div key={row.id} className={`movepick${row.added ? " is-added" : ""}`}>
              <span className="pick__name">
                <span className="pick__title">{row.name}</span>
                <span className="pick__meta">
                  <span className="tag">{row.muscleLabel}</span>
                  <span className="tag">{row.equipment}</span>
                  <span className={`tag ${LEVEL_LABEL[row.level].cls}`}>
                    {pairText(LEVEL_LABEL[row.level], lang)}
                  </span>
                  {row.saved ? <span className="tag tag--accent">{tx("V knihovně", "In the library")}</span> : null}
                </span>
              </span>
              <button
                className="pickadd"
                type="button"
                disabled={row.added}
                aria-label={
                  row.added
                    ? `${row.name}: ${tx("už v tréninku", "already in the session")}`
                    : `${row.name}: ${tx("přidat do tréninku", "add to the session")}`
                }
                onClick={() => void addExercise(row.id)}
              >
                <Icon name={row.added ? "i-check" : "i-plus"} className="ico ico--sm" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="stateview stateview--inline">
          <p className="stateview__title">{tx("Nic nenalezeno", "Nothing found")}</p>
          <p className="stateview__text">
            {tx("Zkus jiný název, nebo zruš filtry.", "Try another name, or clear the filters.")}
          </p>
        </div>
      )}

      <div className="sheet__foot">
        <p className="sheet__note">
          {tx("Nalezeno", "Found")} <strong>{rows.length}</strong> {tx("z", "of")} {total}{" "}
          {query.trim()
            ? tx("cviků v obou seznamech", "movements across both sets")
            : tab === "cat"
              ? tx("cviků v katalogu", "catalogue movements")
              : tx("cviků v knihovně", "library movements")}
        </p>
        <SheetClose />
      </div>
    </>
  );
}

function SheetClose() {
  const { closeSheet } = useApp();
  const { tx } = useLanguage();
  return (
    <button className="btn btn--quiet btn--sm" type="button" onClick={closeSheet}>
      {tx("Hotovo", "Done")}
    </button>
  );
}

function CopySheet() {
  const { lang, tx } = useLanguage();
  const { summaries, summariesPhase, today, copyFrom, closeSheet, askConfirm } = useApp();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const perPage = 10;
  const list = summaries.filter((row) => row.id !== today?.id && row.setCount > 0);
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const current = Math.min(page, pages - 1);
  const slice = list.slice(current * perPage, current * perPage + perPage);
  const hasSession = (today?.exercises.length ?? 0) > 0;

  const copy = (sourceId: number) => {
    void copyFrom(sourceId).then((ok) => {
      if (ok) {
        closeSheet();
        navigate("/tracker");
      }
    });
  };

  return (
    <>
      {summariesPhase === "loading" ? (
        <div className="picklist">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="pick" key={index} aria-hidden="true">
              <span className="pick__date">
                <span className="sk sk--line" style={{ display: "block", width: 48 }} />
              </span>
              <span className="pick__name">
                <span className="sk sk--title" style={{ display: "block" }} />
                <span className="sk sk--line" style={{ display: "block", width: "40%" }} />
              </span>
            </div>
          ))}
        </div>
      ) : summariesPhase === "error" ? (
        <div className="stateview stateview--error">
          <span className="stateview__icon">
            <Icon name="i-info" />
          </span>
          <p className="stateview__title">{tx("Předchozí tréninky se nenačetly", "Previous sessions did not load")}</p>
          <p className="stateview__text">
            {tx("Server neodpověděl. Zkus to znovu, dnešní trénink zůstal nedotčený.", "The server did not answer. Try again; today's session is untouched.")}
          </p>
        </div>
      ) : list.length ? (
        <>
          <div className="picklist">
            {slice.map((row) => (
              <button
                className="pick"
                type="button"
                key={row.id}
                onClick={(event) => {
                  const source = row.name ?? tx("Trénink", "Session");
                  if (!hasSession) {
                    copy(row.id);
                    return;
                  }
                  askConfirm(
                    {
                      title: tx("Nahradit dnešní trénink?", "Replace today's session?"),
                      text: tx(
                        `Dnešní trénink se nahradí tréninkem ${source}. Jeho zapsané série se nedají vrátit.`,
                        `Today's session is replaced by ${source}. Its logged sets cannot be recovered.`,
                      ),
                      label: tx("Nahradit", "Replace"),
                      run: () => {
                        // The sheet's job is done the moment the user commits;
                        // waiting inside it hides what the copy is doing.
                        closeSheet();
                        copy(row.id);
                      },
                    },
                    event.currentTarget,
                  );
                }}
              >
                <span className="pick__date">
                  {Number(row.performedOn.slice(8, 10))}. {Number(row.performedOn.slice(5, 7))}.
                </span>
                <span className="pick__name">
                  <span className="pick__title">{row.name ?? tx("Trénink", "Session")}</span>
                  <span className="pick__facts">
                    {exerciseCount(row.exerciseCount, lang)} · {row.setCount} {setsLabel(row.setCount, lang)}
                  </span>
                </span>
                <span className="pick__vol">{row.totalVolumeKg ? `${fmt(row.totalVolumeKg, lang)} kg` : "—"}</span>
              </button>
            ))}
          </div>
          <div className="pager">
            <button
              className="iconbtn"
              type="button"
              aria-label={tx("Novější", "Newer")}
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <Icon name="i-chevron" className="ico ico--sm" style={{ transform: "rotate(180deg)" }} />
            </button>
            <span className="pager__pos">
              {tx("Strana", "Page")} {current + 1} / {pages}
            </span>
            <button
              className="iconbtn"
              type="button"
              aria-label={tx("Starší", "Older")}
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
            >
              <Icon name="i-chevron" className="ico ico--sm" />
            </button>
          </div>
        </>
      ) : (
        <div className="stateview stateview--inline">
          <p className="stateview__text">
            {tx("Zatím nemáš žádný předchozí trénink k okopírování.", "There is no previous session to copy yet.")}
          </p>
        </div>
      )}
    </>
  );
}

function MovementSheet({ exerciseId }: { exerciseId: number }) {
  const { lang, tx } = useLanguage();
  const { today, addExercise, closeSheet } = useApp();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    void Promise.all([fetchExercise(exerciseId), fetchStats(exerciseId).catch(() => null)]).then(
      ([row, stats]) => {
        if (cancelled) {
          return;
        }
        setExercise(row);
        setBest(stats?.bestWeightKg ?? null);
        setPhase("ready");
      },
      (reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : tx("Cvik se nenačetl", "The movement did not load"));
          setPhase("error");
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [exerciseId, tx]);

  if (phase === "loading") {
    return (
      <div className="skeleton__body" aria-busy="true">
        <div className="sk sk--title" />
        <div className="sk sk--line" />
        <div className="sk sk--line" style={{ marginTop: "var(--space-3)" }} />
      </div>
    );
  }

  if (phase === "error" || !exercise) {
    return (
      <div className="stateview stateview--error">
        <span className="stateview__icon">
          <Icon name="i-info" />
        </span>
        <p className="stateview__title">{tx("Cvik se nenačetl", "The movement did not load")}</p>
        <p className="stateview__text">{error}</p>
      </div>
    );
  }

  
  const name = lang === "cs" ? exercise.nameCs : exercise.nameEn;
  const other = lang === "cs" ? exercise.nameEn : exercise.nameCs;
  const steps = lang === "cs" ? exercise.instructionsCs : exercise.instructionsEn;
  const cues = lang === "cs" ? exercise.cuesCs : exercise.cuesEn;
  const inSession = today?.exercises.some((item) => item.exerciseId === exerciseId) ?? false;

  return (
    <>
      <div className="detail__badges">
        <span className="tag tag--accent">{pairText(MUSCLE_LABEL[exercise.primaryMuscle], lang)}</span>
        <span className="tag">{equipmentLabel(exercise.equipment, lang)}</span>
        <span className={`tag ${LEVEL_LABEL[exercise.level].cls}`}>{pairText(LEVEL_LABEL[exercise.level], lang)}</span>
      </div>
      {other && other !== name ? <p className="detail__en">{other}</p> : null}
      <dl className="meta">
        <div>
          <dt>{tx("Primární sval", "Primary muscle")}</dt>
          <dd>{pairText(MUSCLE_LABEL[exercise.primaryMuscle], lang)}</dd>
        </div>
        <div>
          <dt>{tx("Nářadí", "Equipment")}</dt>
          <dd>{equipmentLabel(exercise.equipment, lang)}</dd>
        </div>
        <div>
          <dt>{tx("Náročnost", "Level")}</dt>
          <dd>{pairText(LEVEL_LABEL[exercise.level], lang)}</dd>
        </div>
        <div>
          <dt>{tx("Osobní rekord", "Personal best")}</dt>
          <dd className="num">{best ? `${fmt(best, lang)} kg` : tx("zatím žádný", "none yet")}</dd>
        </div>
      </dl>
      <h3 className="content-section__title" style={{ marginTop: "var(--space-5)" }}>
        {tx("Provedení", "How to do it")}
      </h3>
      {steps.length ? (
        <ol className="steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="ex__empty">
          {tx(
            "U tohoto cviku zatím nemáme popis provedení. Zapiš si ho do tréninku vlastními slovy.",
            "We have no step-by-step for this movement yet. Write your own in the session notes.",
          )}
        </p>
      )}
      <h3 className="content-section__title" style={{ marginTop: "var(--space-5)" }}>
        {tx("Na co si dát pozor", "What to watch for")}
      </h3>
      {cues.length ? (
        <ul className="cues">
          {cues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
      ) : (
        <p className="ex__empty">{tx("Tipy k tomuto cviku zatím nemáme.", "No cues for this movement yet.")}</p>
      )}
      <div className="sheet__foot">
        <button
          className="btn btn--quiet btn--sm"
          type="button"
          onClick={() => {
            closeSheet();
            navigate(`/exercise/${exerciseId}`);
          }}
        >
          {tx("Zobrazit celý detail", "Open the full detail")}
        </button>
        {inSession ? null : (
          <button
            className="btn btn--primary btn--sm"
            type="button"
            onClick={() => {
              void addExercise(exerciseId);
            }}
          >
            {tx("Přidat do tréninku", "Add to session")}
          </button>
        )}
      </div>
    </>
  );
}



