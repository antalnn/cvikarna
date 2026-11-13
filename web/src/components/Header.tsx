import { Link, NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/useLanguage";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const libraryActive = location.pathname === "/" || location.pathname.startsWith("/exercise/");

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" to="/">
          <span className="brand__mark" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 9v6M7 6.5v11M17 6.5v11M20 9v6M7 12h10" />
            </svg>
          </span>
          <span>{t.brandName}</span>
          <span className="brand__sub">{t.brandSub}</span>
        </Link>

        <nav className="site-nav" aria-label={t.navLabel}>
          <Link to="/" aria-current={libraryActive ? "page" : undefined}>
            {t.navLibrary}
          </Link>
          <NavLink to="/tracker">{t.navTracker}</NavLink>
          <NavLink to="/guides">{t.navGuides}</NavLink>
        </nav>

        <div className="lang-toggle" role="group" aria-label={t.languageLabel}>
          <button type="button" aria-pressed={language === "cs"} onClick={() => setLanguage("cs")}>
            CZ
          </button>
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
