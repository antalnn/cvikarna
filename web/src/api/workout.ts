import { deleteJson, getJson, postJson } from "./client";
import type { ExerciseStats, LoggedSet, RecentSet, Workout, WorkoutExercise, WorkoutSummary } from "./types";

export function openTodayWorkout(): Promise<Workout> {
  return postJson<Workout>("/api/workouts");
}

/** Month is yyyy-MM. Without it the API returns every workout, newest first. */
export function fetchWorkoutSummaries(month?: string): Promise<WorkoutSummary[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return getJson<WorkoutSummary[]>(`/api/workouts${query}`);
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

export interface NewSet {
  weightKg: number;
  reps: number;
  rpe: number | null;
  notes: string | null;
}

export function addSet(workoutId: number, itemId: number, input: NewSet): Promise<LoggedSet> {
  return postJson<LoggedSet>(`/api/workouts/${workoutId}/exercises/${itemId}/sets`, input);
}

export function removeSet(id: number): Promise<void> {
  return deleteJson(`/api/sets/${id}`);
}

export function fetchRecentSets(exerciseId: number, take = 5): Promise<RecentSet[]> {
  return getJson<RecentSet[]>(`/api/sets?exerciseId=${exerciseId}&take=${take}`);
}

export function fetchStats(exerciseId: number): Promise<ExerciseStats> {
  return getJson<ExerciseStats>(`/api/stats?exerciseId=${exerciseId}`);
}
