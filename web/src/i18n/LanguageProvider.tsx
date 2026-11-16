import { useCallback, useMemo, useState, type ReactNode } from "react";
import { LanguageContext, type LanguageValue } from "./context";
import type { Language } from "./dictionary";

const LANGUAGE_KEY = "cvikarna.lang";

function storedLanguage(): Language {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "cs";
  } catch {
    return "cs";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(storedLanguage);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      // Storage blocked: the choice still holds for this page.
    }
  }, []);

  const tx = useCallback((cs: string, en: string) => (lang === "cs" ? cs : en), [lang]);
  const pick = useCallback(
    <T,>(pair: { cs: T; en: T }) => (lang === "cs" ? pair.cs : pair.en),
    [lang],
  );

  const value = useMemo<LanguageValue>(
    () => ({ lang, setLang, tx, pick }),
    [lang, setLang, tx, pick],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
