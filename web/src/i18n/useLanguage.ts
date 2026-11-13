import { useContext } from "react";
import { LanguageContext } from "./context";
import type { Language } from "./dictionary";

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return value;
}

/** Picks the field for the active language, so components never branch on "cs" vs "en". */
export function pick<T>(language: Language, czech: T, english: T): T {
  return language === "cs" ? czech : english;
}
