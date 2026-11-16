import type { Language } from "../i18n/dictionary";

export function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Parses yyyy-MM-dd as a local date, never UTC midnight. */
export function parseIso(iso: string): Date {
  return new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** Monday of the week holding the date. */
export function startOfWeek(date: Date): Date {
  const dow = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - dow);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export function fmt(value: number, lang: Language): string {
  const rounded = Math.round(value * 10) / 10;
  const [int = "0", dec] = String(rounded).split(".");
  const sep = lang === "en" ? "," : " ";
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, sep);

  if (!dec) {
    return grouped;
  }

  return lang === "en" ? `${grouped}.${dec}` : `${grouped},${dec}`;
}

/** A number already carrying a unit: only the decimal mark follows the language. */
export function unit(text: string, lang: Language): string {
  return lang === "cs" ? text : text.replace(/(\d),(\d)/g, "$1.$2");
}

export function formatClock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export function clockStartLabel(startedAt: number | null, lang: Language): string {
  if (!startedAt) {
    return "";
  }

  const date = new Date(startedAt);
  return `${lang === "cs" ? "od" : "since"} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function setsLabel(count: number, lang: Language): string {
  if (lang !== "cs") {
    return count === 1 ? "set" : "sets";
  }
  return count >= 5 ? "sérií" : "série";
}

export function daysLabel(count: number, lang: Language): string {
  if (lang !== "cs") {
    return count === 1 ? "day" : "days";
  }
  if (count === 1) {
    return "den";
  }
  return count >= 2 && count <= 4 ? "dny" : "dní";
}

export function agoLabel(days: number, lang: Language): string {
  if (days === 0) {
    return lang === "cs" ? "dnes" : "today";
  }
  if (days === 1) {
    return lang === "cs" ? "včera" : "yesterday";
  }
  return lang === "cs" ? `před ${days} dny` : `${days} days ago`;
}

const CZ_MONTHS = [
  "ledna",
  "února",
  "března",
  "dubna",
  "května",
  "června",
  "července",
  "srpna",
  "září",
  "října",
  "listopadu",
  "prosince",
];

const CZ_MONTHS_NOM = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CZ_DAYS = ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"];
const EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export { CZ_MONTHS, CZ_MONTHS_NOM, EN_MONTHS };

export function longDate(date: Date, lang: Language): string {
  if (lang === "cs") {
    return `${CZ_DAYS[date.getDay()]} ${date.getDate()}. ${CZ_MONTHS[date.getMonth()]}`;
  }
  return `${EN_DAYS[date.getDay()]}, ${EN_MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function monthName(month: number, lang: Language): string {
  return lang === "cs" ? CZ_MONTHS_NOM[month] ?? "" : EN_MONTHS[month] ?? "";
}

/** Diacritics folded, lowercased: the basis of both searches. */
export function norm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function withinOne(a: string, b: string): boolean {
  if (a === b) {
    return true;
  }
  if (Math.abs(a.length - b.length) > 1) {
    return false;
  }

  let i = 0;
  let j = 0;
  let edits = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) {
      return false;
    }

    if (a.length > b.length) {
      i += 1;
    } else if (a.length < b.length) {
      j += 1;
    } else {
      i += 1;
      j += 1;
    }
  }

  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Search forgives one wrong letter in a word of four letters or more. */
export function fuzzyMatch(haystack: string, query: string): boolean {
  const q = norm(query);
  if (!q) {
    return true;
  }

  const h = norm(haystack);
  if (h.includes(q)) {
    return true;
  }

  const words = h.split(/[\s\-/.,()]+/).filter(Boolean);
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((part) => {
      if (h.includes(part)) {
        return true;
      }
      if (part.length < 4) {
        return false;
      }
      return words.some((word) => word.length >= 3 && withinOne(word, part));
    });
}

/** Czech plural for a count of movements, sets or sessions. */
export function exerciseCount(count: number, lang: Language): string {
  if (lang === "en") {
    return `${count} ${count === 1 ? "exercise" : "exercises"}`;
  }
  return `${count} ${count === 1 ? "cvik" : count < 5 ? "cviky" : "cviků"}`;
}

export function sessionCount(count: number, lang: Language): string {
  if (lang === "en") {
    return `${count} ${count === 1 ? "session" : "sessions"}`;
  }
  return `${count} ${count === 1 ? "trénink" : count < 5 ? "tréninky" : "tréninků"}`;
}
