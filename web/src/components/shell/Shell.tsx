import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "../Icon";
import { BrandMark } from "../Icon";
import { useLanguage } from "../../i18n/useLanguage";
import { useApp } from "../../state/useApp";
import { formatClock } from "../../lib/format";
import { useClockElapsed } from "../../lib/useClockElapsed";
import { ROUTES, type RouteMeta } from "./routes";

function activeRoute(pathname: string): RouteMeta {
  if (pathname.startsWith("/exercise")) {
    return ROUTES[1] ?? ROUTES[0]!;
  }
  return ROUTES.find((route) => route.path === pathname) ?? ROUTES[0]!;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, tx, pick } = useLanguage();
  const { clock, restTimer, openPalette } = useApp();
  const clockElapsed = useClockElapsed(clock.startedAt);
  const location = useLocation();
  const active = activeRoute(location.pathname);
  const running = Boolean(clock.startedAt);
  const clockText = formatClock(clockElapsed);
  const where =
    location.pathname.startsWith("/exercise")
      ? tx("Detail cviku", "Movement detail")
      : pick(active);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openPalette]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="app" id="app">
      <aside className="rail" aria-label={tx("Hlavní navigace", "Main navigation")}>
        <Link className="rail__brand" to="/" aria-label={tx("Cvikárna, přehled", "Cvikárna, overview")}>
          <BrandMark />
          <span className="rail__brand-text">
            <span className="rail__word">Cvikárna</span>
            <span className="rail__sub">{tx("Technika a trénink", "Technique and training")}</span>
          </span>
        </Link>

        <nav className="rail__nav" aria-label={tx("Sekce", "Sections")}>
          {ROUTES.map((route) => {
            const current = route.id === active.id;
            const training = route.id === "trenink";
            return (
              <Link
                key={route.id}
                className="navlink"
                to={route.path}
                aria-current={current ? "page" : undefined}
              >
                <Icon name={route.icon} className="ico navlink__ico" />
                <span className="navlink__label">{pick(route)}</span>
                {training && running ? (
                  <span className="navlink__live" role="img" aria-label={tx("Trénink běží", "Session running")}>
                    <span className="dot dot--live" aria-hidden="true" />
                  </span>
                ) : null}
                {training && running ? <span className="navlink__clock num">{clockText}</span> : null}
                {training ? (
                  <span
                    className="navlink__flag"
                    hidden={!restTimer.done}
                    role="img"
                    aria-label={tx("Pauza skončila", "Rest over")}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="shell">
        <header className="topbar">
          <div className="topbar__inner">
            <Link className="topbar__brand" to="/" aria-label={tx("Cvikárna, přehled", "Cvikárna, overview")}>
              <BrandMark />
              <span className="topbar__brand-word">Cvikárna</span>
            </Link>

            <div className="topbar__ctx">
              <span className="micro">{pick({ cs: active.ctxCs, en: active.ctxEn })}</span>
              <span className="ctx-sep" aria-hidden="true">
                /
              </span>
              <span className="topbar__where">{where}</span>
            </div>

            <div className="topbar__tools">
              <button className="search-trigger" type="button" onClick={openPalette}>
                <Icon name="i-search" />
                <span className="search-trigger__label">
                  {tx("Hledej cvik, sval nebo přezdívku", "Search a movement, muscle or alias")}
                </span>
                <kbd className="kbd">Ctrl K</kbd>
              </button>

              <div className="lang" role="group" aria-label={tx("Jazyk", "Language")}>
                <button
                  type="button"
                  className="lang__btn"
                  data-lang="cs"
                  aria-pressed={lang === "cs"}
                  onClick={() => setLang("cs")}
                >
                  CZ
                </button>
                <button
                  type="button"
                  className="lang__btn"
                  data-lang="en"
                  aria-pressed={lang === "en"}
                  onClick={() => setLang("en")}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="view is-enter" id="view" tabIndex={-1}>
          {children}
        </main>

        <footer className="site-footer">
          <p className="site-footer__note">
            {tx(
              "Data cviků: free-exercise-db, licence Unlicense. Návrh rozhraní Iron Ledger.",
              "Exercise data: free-exercise-db, Unlicense. Iron Ledger interface design.",
            )}
          </p>
        </footer>
      </div>

      <nav className="tabbar" aria-label={tx("Sekce", "Sections")}>
        {ROUTES.map((route) => {
          const current = route.id === active.id;
          return (
            <Link
              key={route.id}
              className="tablink"
              to={route.path}
              aria-current={current ? "page" : undefined}
            >
              <Icon name={route.icon} />
              <span>{pick(route)}</span>
              {route.id === "trenink" && running ? (
                <span className="tablink__clock num">{clockText}</span>
              ) : null}
              {route.id === "trenink" ? (
                <span
                  className="tablink__flag"
                  hidden={!restTimer.done}
                  role="img"
                  aria-label={tx("Pauza skončila", "Rest over")}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}


