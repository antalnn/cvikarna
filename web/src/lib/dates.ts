import type { Language } from "../i18n/dictionary";

/** One place for the calendar and the history labels to agree on a locale. */
export function localeOf(language: Language): string {
  return language === "cs" ? "cs-CZ" : "en-GB";
}

/**
 * Local date key, never UTC. toISOString would shift the day for anyone east
 * or west of Greenwich once the clock passes midnight.
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function monthKey(month: Date): string {
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(month: Date, delta: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + delta, 1);
}

/** Monday-first cells with nulls at the edges, so every row is a whole week. */
export function buildMonthCells(month: Date): (string | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDateKey(new Date(year, monthIndex, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

/** Monday to Sunday, named by Intl so both languages come from the platform. */
export function weekdayLabels(language: Language): string[] {
  const formatter = new Intl.DateTimeFormat(localeOf(language), { weekday: "short" });
  // 2024-01-01 was a Monday, so the loop already reads in calendar order.
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, 1 + index)));
}

function parseDateKey(dateKey: string): Date {
  // Noon keeps the local day stable across daylight-saving changes.
  return new Date(`${dateKey}T12:00:00`);
}

export function formatLongDate(dateKey: string, language: Language): string {
  return new Intl.DateTimeFormat(localeOf(language), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateKey(dateKey));
}

export function formatShortDate(dateKey: string, language: Language): string {
  return new Intl.DateTimeFormat(localeOf(language), {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(parseDateKey(dateKey));
}

export function formatMonth(month: Date, language: Language): string {
  return new Intl.DateTimeFormat(localeOf(language), { month: "long", year: "numeric" }).format(month);
}

export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(localeOf(language), { maximumFractionDigits: 1 }).format(value);
}
