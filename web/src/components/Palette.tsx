import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { useLanguage } from "../i18n/useLanguage";
import { useApp } from "../state/useApp";
import { fuzzyMatch } from "../lib/format";
import { ROUTES } from "./shell/routes";

interface PaletteItem {
  kind: "page" | "move";
  id: string;
  label: string;
  icon: string;
  meta: string;
}

export function Palette() {
  const { lang, tx } = useLanguage();
  const { paletteOpen, closePalette, catalogue } = useApp();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  const items = useMemo<PaletteItem[]>(() => {
    const pages: PaletteItem[] = ROUTES.map((route) => ({
      kind: "page",
      id: route.path,
      label: lang === "cs" ? route.cs : route.en,
      icon: route.icon,
      meta: "",
    }));
    const moves: PaletteItem[] = catalogue.map((row) => ({
      kind: "move",
      id: String(row.id),
      label: (lang === "cs" ? row.nameCs ?? row.nameEn : row.nameEn) ?? row.nameEn,
      icon: "i-bar",
      meta: row.nameEn,
    }));
    return [...pages, ...moves];
  }, [catalogue, lang]);

  const results = useMemo(() => {
    const q = query.trim();
    return items
      .filter((item) => !q || fuzzyMatch(`${item.label} ${item.meta}`, q))
      .slice(0, 9);
  }, [items, query]);

  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      setIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [paletteOpen]);

  useEffect(() => {
    if (!paletteOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setIndex((current) => (results.length ? (current + 1) % results.length : 0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setIndex((current) =>
          results.length ? (current - 1 + results.length) % results.length : 0,
        );
      } else if (event.key === "Enter") {
        const pick = results[index];
        if (pick) {
          event.preventDefault();
          closePalette();
          navigate(pick.kind === "move" ? `/exercise/${pick.id}` : pick.id);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closePalette, index, navigate, paletteOpen, results]);

  if (!paletteOpen) {
    return null;
  }

  return (
    <div className="palette">
      <div className="palette__scrim" onClick={closePalette} />
      <div className="palette__panel" role="dialog" aria-modal="true" aria-labelledby="paletteTitle">
        <h2 className="visually-hidden" id="paletteTitle">
          {tx("Rychlé hledání", "Quick search")}
        </h2>
        <div className="palette__field">
          <Icon name="i-search" />
          <input
            ref={inputRef}
            id="paletteInput"
            type="text"
            autoComplete="off"
            placeholder={tx("Cvik, sval, obrazovka…", "Movement, muscle, screen…")}
            aria-label={tx("Hledat", "Search")}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
          />
          <kbd className="kbd">Esc</kbd>
        </div>
        <div className="palette__list" role="listbox" aria-label={tx("Výsledky", "Results")}>
          {results.length ? (
            results.map((item, position) => (
              <button
                key={`${item.kind}-${item.id}`}
                className={`palette__opt${position === index ? " is-active" : ""}`}
                type="button"
                role="option"
                aria-selected={position === index}
                onMouseEnter={() => setIndex(position)}
                onClick={() => {
                  closePalette();
                  navigate(item.kind === "move" ? `/exercise/${item.id}` : item.id);
                }}
              >
                <Icon name={item.icon} />
                <span className="palette__opt-title">{item.label}</span>
                <span className="palette__opt-kind">
                  {item.kind === "page" ? tx("sekce", "page") : item.meta}
                </span>
              </button>
            ))
          ) : (
            <p className="palette__empty">{tx("Nic nenalezeno. Zkus jiný název.", "Nothing found. Try another name.")}</p>
          )}
        </div>
        <div className="palette__foot">
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> {tx("pohyb", "move")}
          </span>
          <span>
            <kbd className="kbd">↵</kbd> {tx("otevřít", "open")}
          </span>
        </div>
      </div>
    </div>
  );
}
