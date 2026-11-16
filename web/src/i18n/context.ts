import { createContext } from "react";
import type { Language } from "./dictionary";

export interface LanguageValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** One string per language, beside the component that renders it. */
  tx: (cs: string, en: string) => string;
  /** The Czech or English half of a pair kept in data. */
  pick: <T>(pair: { cs: T; en: T }) => T;
}

export const LanguageContext = createContext<LanguageValue | null>(null);
