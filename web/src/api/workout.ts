import { deleteJson, getJson, patchJson, postJson, putJson } from "./client";
import type {
  ExerciseStats,
  LoggedSet,
  RecentSet,
  Workout,
  WorkoutExercise,
  WorkoutSummary,
} from "./types";

export function openTodayWorkout(): Promise<Workout> {
  return postJson<Workout>("/api/workouts");
}

/** Month is yyyy-MM. Without it the API returns every workout, newest first. */
export function fetchWorkoutSummaries(month?: string): Promise<WorkoutSummary[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return getJson<WorkoutSummary[]>(`/api/workouts${query}`);
}

/** The newest workouts for the copy sheet, without the one being filled in. */
export function fetchRecentWorkouts(take = 10, excludeId?: number): Promise<WorkoutSummary[]> {
  const params = new URLSearchParams({ take: String(take) });

  if (excludeId !== undefined) {
    params.set("excludeId", String(excludeId));
  }

  return getJson<WorkoutSummary[]>(`/api/workouts?${params.toString()}`);
}

/** Sets or clears the name. Null or an empty string clears it on the server. */
export function renameWorkout(id: number, name: string | null): Promise<Workout> {
  return patchJson<Workout>(`/api/workouts/${id}`, { name });
}

/** Copies every exercise and set of the source into the target workout. */
export function copyWorkout(targetId: number, sourceWorkoutId: number): Promise<Workout> {
  return postJson<Workout>(`/api/workouts/${targetId}/copy`, { sourceWorkoutId });
}

export function fetchWorkout(id: number): Promise<Workout> {
  return getJson<Workout>(`/api/workouts/${id}`);
}

/** Removes the session and its sets through the cascade. */
export function removeWorkout(id: number): Promise<void> {
  return deleteJson(`/api/workouts/${id}`);
}

/** Throws NotFoundError when no workout was logged on that day. */
export function fetchWorkoutByDate(date: string): Promise<Workout> {
  return getJson<Workout>(`/api/workouts/by-date/${encodeURIComponent(date)}`);
}

export function addWorkoutExercise(workoutId: number, exerciseId: number): Promise<WorkoutExercise> {
  return postJson<WorkoutExercise>(`/api/workouts/${workoutId}/exercises`, { exerciseId });
}

export function removeWorkoutExercise(workoutId: number, itemId: number): Promise<void> {
  return deleteJson(`/api/workouts/${workoutId}/exercises/${itemId}`);
}

/** Rewrites the exercise order inside one workout. Ids must be every item, exactly once. */
export function reorderWorkoutExercises(workoutId: number, itemIds: number[]): Promise<void> {
  return putJson(`/api/workouts/${workoutId}/exercises/order`, { itemIds });
}

export interface NewSet {
  weightKg: number;
  reps: number;
  rpe: number | null;
  notes: string | null;
  /** The tracker logs an unticked row; the tick completes it. */
  completed?: boolean;
}

export function addSet(workoutId: number, itemId: number, input: NewSet): Promise<LoggedSet> {
  return postJson<LoggedSet>(`/api/workouts/${workoutId}/exercises/${itemId}/sets`, input);
}

export function setCompleted(id: number, completed: boolean): Promise<LoggedSet> {
  return patchJson<LoggedSet>(`/api/sets/${id}`, { completed });
}

export function removeSet(id: number): Promise<void> {
  return deleteJson(`/api/sets/${id}`);
}

/** Rewrites the set order inside one exercise. Ids must be every set, exactly once. */
export function reorderSets(workoutId: number, itemId: number, setIds: number[]): Promise<void> {
  return putJson(`/api/workouts/${workoutId}/exercises/${itemId}/sets/order`, { setIds });
}

export function fetchRecentSets(exerciseId: number, take = 5): Promise<RecentSet[]> {
  return getJson<RecentSet[]>(`/api/sets?exerciseId=${exerciseId}&take=${take}`);
}

export function fetchStats(exerciseId: number): Promise<ExerciseStats> {
  return getJson<ExerciseStats>(`/api/stats?exerciseId=${exerciseId}`);
}
