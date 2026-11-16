import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArtBlock } from "../../components/ArtBlock";
import { BackToTop } from "../../components/BackToTop";
import { Icon } from "../../components/Icon";
import { useLanguage } from "../../i18n/useLanguage";
import { useApp } from "../../state/useApp";
import type { CatalogueRow, Equipment, Exercise, Level, MuscleGroup } from "../../api/types";
import { muscleGroupOf } from "../../api/types";
import { fuzzyMatch } from "../../lib/format";
import {
  EQUIPMENT_GROUPS,
  LEVEL_LABEL,
  MUSCLE_GROUPS,
  MUSCLE_LABEL,
  equipmentLabel,
  muscleSearchText,
  pairText,
} from "../../lib/labels";

type Tab = "lib" | "cat";

interface RowView {
  id: number;
  name: string;
  nameCs: string | null;
  nameEn: string;
  images: string[];
  muscle: MuscleGroup;
  muscleName: string;
  muscleSearch: string;
  equipment: string;
  level: Level;
  saved: boolean;
  aliases: string[];
}

function toView(row: Exercise | CatalogueRow, lang: "cs" | "en", savedIds: Set<number>): RowView {
  const aliases = "aliasesEn" in row ? [...row.aliasesEn, ...row.aliasesCs] : [];
  return {
    id: row.id,
    name: lang === "cs" ? row.nameCs ?? row.nameEn : row.nameEn,
    nameCs: row.nameCs ?? null,
    nameEn: row.nameEn,
    images: row.images,
    muscle: muscleGroupOf(row.primaryMuscle),
    muscleName: pairText(MUSCLE_LABEL[row.primaryMuscle], lang),
    muscleSearch: muscleSearchText(row.primaryMuscle, muscleGroupOf(row.primaryMuscle), lang),
    equipment: equipmentLabel((row.equipment as Equipment | null) ?? null, lang),
    level: row.level,
    saved: savedIds.has(row.id) || ("isLibrary" in row && row.isLibrary),
    aliases,
  };
}

function MovementCard({ row, index }: { row: RowView; index: number }) {
  const { lang, tx } = useLanguage();
  const { toggleSaved } = useApp();
  const [saving, setSaving] = useState(false);

  return (
    <li className="mcard" style={{ "--i": Math.min(index, 8) } as CSSProperties}>
      <div className="mcard__link">
        <Link
          className="mcard__cover"
          to={`/exercise/${row.id}`}
          state={{ from: "knihovna" }}
          aria-label={row.name}
        />
        <span className="mcard__body">
          <span className="mcard__head">
            <span className="mcard__title">{row.name}</span>
          </span>
          <span className="mcard__meta">
            <span className="tag">{row.muscleName}</span>
            <span className="tag">{row.equipment}</span>
            <span className={`tag ${LEVEL_LABEL[row.level].cls}`}>{pairText(LEVEL_LABEL[row.level], lang)}</span>
          </span>
        </span>
        <ArtBlock
          images={row.images}
          alt={row.name}
          index={index + 1}
          tag={row.muscleName}
        />
      </div>
      <button
        className="mcard__save"
        type="button"
        aria-pressed={row.saved}
        aria-label={
          row.saved
            ? `${row.name}: ${tx("odebrat z knihovny", "remove from the library")}`
            : `${row.name}: ${tx("uložit do knihovny", "save to the library")}`
        }
        disabled={saving}
        onClick={() => {
          setSaving(true);
          void toggleSaved(row.id).finally(() => setSaving(false));
        }}
      >
        <Icon name="i-x" className="ico ico--sm" />
      </button>
    </li>
  );
}

export function LibraryPage() {
  const { lang, tx } = useLanguage();
  const {
    library,
    libraryPhase,
    libraryError,
    catalogue,
    cataloguePhase,
    catalogueError,
    savedIds,
    toggleSaved,
    refreshLibrary,
    refreshCatalogue,
    demoState,
  } = useApp();
  const [tab, setTab] = useState<Tab>("lib");
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [equipment, setEquipment] = useState<Equipment | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [shown, setShown] = useState(12);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [hideSaved, setHideSaved] = useState(false);

  const savedRows = useMemo(
    () => library.map((row) => toView(row, lang, savedIds)),
    [lang, library, savedIds],
  );
  const catalogueRows = useMemo(
    () => catalogue.map((row) => toView(row, lang, savedIds)),
    [catalogue, lang, savedIds],
  );

  const baseRows =
    tab === "cat" && hideSaved
      ? catalogueRows.filter((row) => !row.saved)
      : tab === "lib"
        ? savedRows
        : catalogueRows;
  const filtered = useMemo(() => {
    const q = query.trim();
    return baseRows.filter((row) => {
      if (muscle !== "all" && row.muscle !== muscle) {
        return false;
      }
      if (equipment !== "all" && row.equipment !== equipmentLabel(equipment, lang)) {
        return false;
      }
      if (level !== "all" && row.level !== level) {
        return false;
      }
      if (!q) {
        return true;
      }
      return fuzzyMatch(
        [row.name, row.nameCs ?? "", row.nameEn, ...row.aliases, row.muscleSearch, row.equipment].join(" "),
        q,
      );
    });
  }, [baseRows, equipment, lang, level, muscle, query]);

  const edge = demoState === "edge";
  const displayRows = edge && filtered[0]
    ? [
        {
          ...filtered[0],
          name:
            lang === "cs"
              ? "Tlaky s jednoručkami na vodorovné lavici neutrálním úchopem se zadržením na hrudi"
              : "Dumbbell Bench Press with Neutral Grip and a Pause at the Chest",
        },
        ...filtered.slice(1),
      ]
    : filtered;

  const phase = tab === "lib" ? libraryPhase : cataloguePhase;
  const error = tab === "lib" ? libraryError : catalogueError;
  const isBlank = tab === "lib" && savedRows.length === 0;
  const filteredActive =
    Boolean(query.trim()) ||
    muscle !== "all" ||
    equipment !== "all" ||
    level !== "all" ||
    (tab === "cat" && hideSaved);

  const clearFilters = () => {
    setQuery("");
    setMuscle("all");
    setEquipment("all");
    setLevel("all");
    setHideSaved(false);
    setShown(12);
  };

  return (
    <div className="page">
      <header className="page-head library-head">
        <div>
          <p className="eyebrow">{tx("Od prvního tréninku dál", "From the first session onward")}</p>
          <h1 className="display display--xl">
            {tx(
              "Všechny cviky, které ti pomůžou nabrat svaly a sílu",
              "Every movement that helps you build muscle and strength",
            )}
          </h1>
          <p className="lede">
            {tx(
              "Od prvního cviku po hotový plán. Zjisti, co a proč dělat, a poskládej si trénink podle vybavení, které máš.",
              "From your first movement to a finished plan. Learn what to do and why, then build the session around the equipment you actually have.",
            )}
          </p>
        </div>
      </header>

      <div className="sheet__tabs libtabs" role="tablist" aria-label={tx("Zdroj cviků", "Movement source")}>
        <button
          className="shtab"
          type="button"
          role="tab"
          aria-selected={tab === "lib"}
          onClick={() => {
            setTab("lib");
            setShown(12);
          }}
        >
          {tx("Knihovna", "Library")} <span className="num">{savedRows.length}</span>
        </button>
        <button
          className="shtab"
          type="button"
          role="tab"
          aria-selected={tab === "cat"}
          onClick={() => {
            setTab("cat");
            setShown(12);
          }}
        >
          {tx("Katalog", "Catalogue")} <span className="num">{catalogueRows.length}</span>
        </button>
      </div>

      <div className="toolbar">
        <div className="field">
          <Icon name="i-search" />
          <label className="visually-hidden" htmlFor="libSearch">
            {tx("Hledat cvik", "Search movements")}
          </label>
          <input
            id="libSearch"
            type="search"
            placeholder={tx("Hledej cvik, sval nebo přezdívku…", "Search a movement, muscle or alias…")}
            value={query}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setShown(12);
            }}
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
        <label className="select">
          <span>{tx("Nářadí", "Equipment")}</span>
          <select
            value={equipment}
            onChange={(event) => {
              setEquipment(event.target.value as Equipment | "all");
              setShown(12);
            }}
          >
            {EQUIPMENT_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {pairText(group.pair, lang)}
              </option>
            ))}
          </select>
        </label>
        {tab === "cat" ? (
          <button
            className="chip library-exclude"
            type="button"
            aria-pressed={hideSaved}
            title={tx("Skrýt cviky, které už máš v knihovně", "Hide the movements already in your library")}
            onClick={() => {
              setHideSaved((current) => !current);
              setShown(12);
            }}
          >
            {tx("Skrýt v knihovně", "Hide saved")}
            <span className="num">{savedRows.length}</span>
          </button>
        ) : null}
      </div>

      <div className="chips" role="group" aria-label={tx("Svalová skupina", "Muscle group")}>
        {MUSCLE_GROUPS.map((group) => (
          <button
            key={group.id}
            className="chip"
            type="button"
            aria-pressed={muscle === group.id}
            onClick={() => {
              setMuscle(group.id);
              setShown(12);
            }}
          >
            {pairText(group.pair, lang)}
          </button>
        ))}
      </div>

      <div className="chips chips--levels" role="group" aria-label={tx("Náročnost", "Level")}>
        {(Object.keys(LEVEL_LABEL) as Level[]).map((id) => (
          <button
            key={id}
            className={`chip chip--ghost level--${id}`}
            type="button"
            aria-pressed={level === id}
            onClick={() => {
              setLevel((current) => (current === id ? "all" : id));
              setShown(12);
            }}
          >
            {pairText(LEVEL_LABEL[id], lang)}
          </button>
        ))}
      </div>

      <div className="results">
        {demoState === "empty" ? null : (
          <span>
            <strong>{displayRows.length}</strong> {tx("z", "of")} {baseRows.length} {tx("cviků", "movements")}
          </span>
        )}
        {filteredActive && displayRows.length ? (
          <button className="linkbtn" type="button" onClick={clearFilters}>
            {tx("Zrušit filtry", "Clear filters")}
          </button>
        ) : null}
      </div>

      {phase === "loading" || demoState === "loading" ? (
        <ul className="grid" aria-busy="true" aria-label={tx("Načítání", "Loading")}>
          {Array.from({ length: 8 }).map((_, index) => (
            <li className="skeleton" key={index}>
              <div className="skeleton__media sk" />
              <div className="skeleton__body">
                <div className="sk sk--title" />
                <div className="sk sk--line" />
              </div>
            </li>
          ))}
        </ul>
      ) : phase === "error" || demoState === "error" ? (
        <div className="stateview stateview--error">
          <span className="stateview__icon">
            <Icon name="i-info" />
          </span>
          <p className="stateview__title">
            {tab === "lib"
              ? tx("Knihovna se nenačetla", "The library did not load")
              : tx("Katalog se nenačetl", "The catalogue did not load")}
          </p>
          <p className="stateview__text">{error ?? tx("Server neodpověděl. Zkus to znovu.", "The server did not answer. Try again.")}</p>
          <div className="stateview__actions">
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => void (tab === "lib" ? refreshLibrary() : refreshCatalogue())}
            >
              {tx("Zkusit znovu", "Try again")}
            </button>
          </div>
        </div>
      ) : demoState === "empty" || isBlank || !displayRows.length ? (
        <div className="stateview">
          <span className="stateview__icon">
            <Icon name={isBlank ? "i-book" : "i-search"} />
          </span>
          <p className="stateview__title">
            {isBlank ? tx("Knihovna je prázdná", "The library is empty") : tx("Nic tu není", "Nothing here")}
          </p>
          <p className="stateview__text">
            {isBlank
              ? tx(
                  "Do knihovny patří cviky, které skutečně cvičíš. Ulož si je z katalogu nebo z detailu cviku a objeví se tady.",
                  "The library holds the movements you actually train. Save them from the catalogue or a movement page and they appear here.",
                )
              : tx(
                  "Žádný cvik neodpovídá hledání a filtrům. Zkus jiný název svalu, nebo filtry zruš.",
                  "No movement matches the search and filters. Try another muscle, or clear the filters.",
                )}
          </p>
          <div className="stateview__actions">
            {isBlank || demoState === "empty" ? (
              <button className="btn btn--primary" type="button" onClick={() => setTab("cat")}>
                {tx("Otevřít katalog", "Open the catalogue")}
              </button>
            ) : (
              <button className="btn" type="button" onClick={clearFilters}>
                {tx("Zrušit filtry", "Clear filters")}
              </button>
            )}
          </div>
        </div>
      ) : tab === "lib" ? (
        <>
          <ul className="grid">
            {displayRows.slice(0, shown).map((row, index) => (
              <MovementCard key={row.id} row={row} index={index} />
            ))}
          </ul>
          {displayRows.length > shown ? (
            <div className="more">
              <button className="btn" type="button" onClick={() => setShown((current) => current + 8)}>
                {tx(
                  `Načíst dalších ${Math.min(8, displayRows.length - shown)}`,
                  `Load ${Math.min(8, displayRows.length - shown)} more`,
                )}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="catalogue-list">
          {displayRows.map((row) => (
            <div className="catalogue-row" key={row.id}>
              <ArtBlock images={row.images} alt={row.name} variant="row" />
              <span className="catalogue-row__name">
                <Link className="catalogue-row__title" to={`/exercise/${row.id}`} state={{ from: "knihovna" }}>
                  {row.name}
                </Link>
                <span className="catalogue-row__meta">
                  <span className="tag">{row.muscleName}</span>
                  <span className="tag">{row.equipment}</span>
                  <span className={`tag ${LEVEL_LABEL[row.level].cls}`}>{pairText(LEVEL_LABEL[row.level], lang)}</span>
                </span>
              </span>
              <button
                className="pickadd"
                type="button"
                aria-pressed={row.saved}
                disabled={savingId === row.id}
                aria-label={
                  row.saved
                    ? `${row.name}: ${tx("odebrat z knihovny", "remove from the library")}`
                    : `${row.name}: ${tx("uložit do knihovny", "save to the library")}`
                }
                onClick={() => {
                  setSavingId(row.id);
                  void toggleSaved(row.id).finally(() => setSavingId(null));
                }}
              >
                <Icon name={row.saved ? "i-x" : "i-plus"} className="ico ico--sm" />
              </button>
            </div>
          ))}
        </div>
      )}
      <BackToTop />
    </div>
  );
}

