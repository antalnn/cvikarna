import type { Equipment, Level, Muscle, MuscleGroup } from "../api/types";
import type { Language } from "../i18n/dictionary";

type Pair = { cs: string; en: string };

export const MUSCLE_LABEL: Record<Muscle, Pair> = {
  chest: { cs: "Prsa", en: "Chest" },
  back: { cs: "Záda", en: "Back" },
  shoulders: { cs: "Ramena", en: "Shoulders" },
  biceps: { cs: "Biceps", en: "Biceps" },
  triceps: { cs: "Triceps", en: "Triceps" },
  quads: { cs: "Přední stehno", en: "Quads" },
  hamstrings: { cs: "Zadní stehno", en: "Hamstrings" },
  glutes: { cs: "Hýždě", en: "Glutes" },
  calves: { cs: "Lýtka", en: "Calves" },
  core: { cs: "Core", en: "Core" },
  grip: { cs: "Úchop", en: "Grip" },
};

export const MUSCLE_GROUPS: Array<{ id: MuscleGroup | "all"; pair: Pair }> = [
  { id: "all", pair: { cs: "Všechny svaly", en: "All muscles" } },
  { id: "chest", pair: { cs: "Prsa", en: "Chest" } },
  { id: "back", pair: { cs: "Záda", en: "Back" } },
  { id: "shoulders", pair: { cs: "Ramena", en: "Shoulders" } },
  { id: "biceps", pair: { cs: "Biceps", en: "Biceps" } },
  { id: "triceps", pair: { cs: "Triceps", en: "Triceps" } },
  { id: "legs", pair: { cs: "Nohy", en: "Legs" } },
  { id: "core", pair: { cs: "Core", en: "Core" } },
];

export const EQUIPMENT_LABEL: Record<Equipment, Pair> = {
  barbell: { cs: "Velká činka", en: "Barbell" },
  dumbbell: { cs: "Jednoručky", en: "Dumbbells" },
  cable: { cs: "Kladka", en: "Cable" },
  machine: { cs: "Stroj", en: "Machine" },
  "body only": { cs: "Vlastní váha", en: "Bodyweight" },
  "e-z curl bar": { cs: "EZ osa", en: "EZ bar" },
  other: { cs: "Ostatní", en: "Other" },
};

export const EQUIPMENT_GROUPS: Array<{ id: Equipment | "all"; pair: Pair }> = [
  { id: "all", pair: { cs: "Všechno nářadí", en: "All equipment" } },
  { id: "barbell", pair: EQUIPMENT_LABEL.barbell },
  { id: "dumbbell", pair: EQUIPMENT_LABEL.dumbbell },
  { id: "cable", pair: EQUIPMENT_LABEL.cable },
  { id: "machine", pair: EQUIPMENT_LABEL.machine },
  { id: "body only", pair: EQUIPMENT_LABEL["body only"] },
  { id: "e-z curl bar", pair: EQUIPMENT_LABEL["e-z curl bar"] },
  { id: "other", pair: EQUIPMENT_LABEL.other },
];

export const LEVEL_LABEL: Record<Level, Pair & { cls: string }> = {
  beginner: { cs: "Začátečník", en: "Beginner", cls: "tag--info" },
  intermediate: { cs: "Pokročilý", en: "Intermediate", cls: "tag--warn" },
  expert: { cs: "Expert", en: "Expert", cls: "tag--danger" },
};

export function pairText(pair: Pair, lang: Language): string {
  return lang === "cs" ? pair.cs : pair.en;
}

export function equipmentLabel(equipment: Equipment | "" | null, lang: Language): string {
  if (!equipment) {
    return lang === "cs" ? "Ostatní" : "Other";
  }
  return pairText(EQUIPMENT_LABEL[equipment] ?? EQUIPMENT_LABEL.other, lang);
}

/** The words a muscle search matches: the movement's own muscle and the filter group above it. */
export function muscleSearchText(muscle: Muscle, group: MuscleGroup, lang: Language): string {
  const groupPair = MUSCLE_GROUPS.find((item) => item.id === group)?.pair;
  return [pairText(MUSCLE_LABEL[muscle], lang), groupPair ? pairText(groupPair, lang) : ""].join(" ");
}

