/** The shapes returned by the exercise, catalogue, workout, dashboard and settings endpoints. */

export type Muscle =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "grip";

/** Filter chips group the four leg muscles under one label. */
export type MuscleGroup = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "legs" | "core";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "body only"
  | "e-z curl bar"
  | "other";

export type Level = "beginner" | "intermediate" | "expert";

export interface Exercise {
  id: number;
  slug: string;
  /** Which photo a card shows first: 1 when the first frame is the setup. */
  coverIndex?: 0 | 1;
  nameEn: string;
  nameCs: string;
  aliasesEn: string[];
  aliasesCs: string[];
  primaryMuscle: Muscle;
  secondaryMuscles: Muscle[];
  equipment: Equipment | "";
  level: Level;
  instructionsEn: string[];
  instructionsCs: string[];
  cuesEn: string[];
  cuesCs: string[];
  /** The free-exercise-db pair, start then end. Never empty for a real row. */
  images: string[];
}

export interface ExerciseFilters {
  muscle: MuscleGroup | "all";
  equipment: Equipment | "all";
  level: Level | "all";
  q: string;
}

/** A catalogue row: enough to list, filter and save the movement. */
export interface CatalogueRow {
  id: number;
  sourceId: string;
  isLibrary: boolean;
  nameEn: string;
  nameCs: string | null;
  primaryMuscle: Muscle;
  equipment: Equipment | null;
  level: Level;
  images: string[];
}

export interface CataloguePage {
  items: CatalogueRow[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CatalogueFilters {
  muscle: MuscleGroup | "all";
  equipment: Equipment | "all";
  level: Level | "all";
  q: string;
  page: number;
  pageSize?: number;
}

/** One logged set. Weight 0 means bodyweight; a set counts once completed. */
export interface LoggedSet {
  id: number;
  weightKg: number;
  reps: number;
  rpe: number | null;
  notes: string | null;
  completed: boolean;
}

export interface WorkoutExercise {
  id: number;
  exerciseId: number;
  position: number;
  isLibrary: boolean;
  nameEn: string;
  nameCs: string | null;
  primaryMuscle: Muscle;
  equipment: Equipment | null;
  level: Level;
  sets: LoggedSet[];
}

export interface Workout {
  id: number;
  performedOn: string;
  name: string | null;
  notes: string | null;
  exercises: WorkoutExercise[];
}

/** One row in the history calendar and the month list. */
export interface WorkoutSummary {
  id: number;
  performedOn: string;
  name: string | null;
  exerciseCount: number;
  setCount: number;
  totalVolumeKg: number;
}

export interface RecentSet extends LoggedSet {
  exerciseId: number;
  nameEn: string;
  nameCs: string | null;
  performedOn: string;
}

export interface WeeklySets {
  muscle: MuscleGroup;
  sets: number;
}

export interface ExerciseStats {
  exerciseId: number;
  nameEn: string;
  nameCs: string | null;
  totalVolumeKg: number;
  bestEstimated1RmKg: number | null;
  bestWeightKg: number | null;
  bestSetVolumeKg: number | null;
  isoWeek: string;
  weeklySets: WeeklySets[];
}

export interface DashboardDay {
  date: string;
  hasSession: boolean;
  volume: number;
}

export interface PersonalRecord {
  exerciseId: number;
  nameEn: string;
  nameCs: string | null;
  bestWeightKg: number;
  previousBestWeightKg: number | null;
  achievedOn: string;
}

export interface WeeklyVolume {
  label: string;
  start: string;
  volume: number;
}

export interface Dashboard {
  today: Workout | null;
  week: DashboardDay[];
  currentWeekVolume: number;
  previousWeekVolume: number;
  weekSessions: number;
  lastSessionOn: string | null;
  daysSinceLast: number | null;
  personalRecords: PersonalRecord[];
  weeklyVolume: WeeklyVolume[];
}

export interface RestSettings {
  uniform: boolean;
  uniformValue: number;
  auto: boolean;
  sound: boolean;
  volume: number;
  vibrate: boolean;
  values: Record<string, number>;
}

export const MUSCLE_GROUPS: readonly MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "core",
];

export const EQUIPMENT: readonly Equipment[] = [
  "barbell",
  "dumbbell",
  "cable",
  "machine",
  "body only",
  "e-z curl bar",
  "other",
];

export const LEVELS: readonly Level[] = ["beginner", "intermediate", "expert"];

const LEG_MUSCLES: readonly Muscle[] = ["quads", "hamstrings", "glutes", "calves"];

/** Maps a fine-grained primary muscle to the coarse chip it belongs to. */
export function muscleGroupOf(muscle: Muscle): MuscleGroup {
  if (muscle === "grip") {
    return "back";
  }
  if (LEG_MUSCLES.includes(muscle)) {
    return "legs";
  }
  return muscle as MuscleGroup;
}

export const emptyFilters: ExerciseFilters = { muscle: "all", equipment: "all", level: "all", q: "" };
