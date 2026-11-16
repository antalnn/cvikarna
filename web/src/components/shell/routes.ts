export interface RouteMeta {
  path: string;
  id: string;
  icon: string;
  cs: string;
  en: string;
  ctxCs: string;
  ctxEn: string;
}

export const ROUTES: RouteMeta[] = [
  { path: "/", id: "dnes", icon: "i-pulse", cs: "Dnes", en: "Today", ctxCs: "Přehled", ctxEn: "Overview" },
  { path: "/library", id: "knihovna", icon: "i-book", cs: "Knihovna", en: "Library", ctxCs: "Technika", ctxEn: "Technique" },
  { path: "/tracker", id: "trenink", icon: "i-bar", cs: "Trénink", en: "Training", ctxCs: "Dnes", ctxEn: "Today" },
  { path: "/history", id: "historie", icon: "i-cal", cs: "Historie", en: "History", ctxCs: "Deník", ctxEn: "Logbook" },
  { path: "/guide", id: "pruvodce", icon: "i-compass", cs: "Průvodce", en: "Guide", ctxCs: "Věda", ctxEn: "Evidence" },
];
