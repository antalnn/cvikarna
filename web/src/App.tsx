import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { Boot } from "./components/Boot";
import { Sprite } from "./components/Icon";
import { Palette } from "./components/Palette";
import { SheetHost } from "./components/Sheet";
import {
  ConfirmPopover,
  MenuPopover,
  RestChip,
  TipPopover,
  Toasts,
} from "./components/overlays/Overlays";
import { Shell } from "./components/shell/Shell";
import { Icon } from "./components/Icon";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ExerciseDetailPage } from "./features/library/ExerciseDetailPage";
import { LibraryPage } from "./features/library/LibraryPage";
import { GuidePage } from "./features/guides/GuidePage";
import { HistoryPage } from "./features/history/HistoryPage";
import { TrackerPage } from "./features/tracker/TrackerPage";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { useLanguage } from "./i18n/useLanguage";
import { AppProvider } from "./state/AppProvider";
import { useApp } from "./state/useApp";

function NotFound() {
  const { tx } = useLanguage();
  return (
    <div className="page">
      <div className="stateview">
        <span className="stateview__icon">
          <Icon name="i-compass" />
        </span>
        <p className="stateview__title">{tx("Tady nic není", "Nothing here")}</p>
        <p className="stateview__text">
          {tx("Tahle adresa nepatří žádné obrazovce. Zkus přehled.", "This address belongs to no screen. Try the overview.")}
        </p>
        <div className="stateview__actions">
          <Link className="btn btn--primary" to="/">
            {tx("Zpět na Dnes", "Back to Today")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function LiveRegion() {
  const { liveMessage } = useApp();
  return (
    <p className="visually-hidden" role="status" aria-live="polite">
      {liveMessage}
    </p>
  );
}

function Routed() {
  const location = useLocation();
  return (
    <>
      <Shell>
        <div key={location.pathname}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/exercise/:id" element={<ExerciseDetailPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Shell>
      <Palette />
      <SheetHost />
      <ConfirmPopover />
      <MenuPopover />
      <TipPopover />
      <RestChip />
      <Toasts />
      <LiveRegion />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <BrowserRouter>
          <a className="skip-link" href="#view">
            Přeskočit na obsah
          </a>
          <Sprite />
          <Boot />
          <Routed />
        </BrowserRouter>
      </AppProvider>
    </LanguageProvider>
  );
}
