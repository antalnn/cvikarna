import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { SkipLink } from "./components/SkipLink";
import { NotFoundPage } from "./features/exercises/NotFoundPage";
import { ExerciseDetailPage } from "./features/exercises/ExerciseDetailPage";
import { ExerciseGridPage } from "./features/exercises/ExerciseGridPage";
import { GuidesPage } from "./features/guides/GuidesPage";
import { HistoryPage } from "./features/history/HistoryPage";
import { TrackerPage } from "./features/tracker/TrackerPage";
import { LanguageProvider } from "./i18n/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <SkipLink />
        <Header />
        <main id="main" className="shell">
          <Routes>
            <Route path="/" element={<ExerciseGridPage />} />
            <Route path="/exercise/:id" element={<ExerciseDetailPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </LanguageProvider>
  );
}
