import { getJson } from "./client";
import type { CatalogueFilters, CataloguePage, Exercise, ExerciseFilters } from "./types";

export { NotFoundError } from "./client";

function toQuery(filters: ExerciseFilters): string {
  const query = new URLSearchParams();

  if (filters.muscle !== "all") {
    query.set("muscle", filters.muscle);
  }
  if (filters.equipment !== "all") {
    query.set("equipment", filters.equipment);
  }
  if (filters.level !== "all") {
    query.set("level", filters.level);
  }
  if (filters.q.trim() !== "") {
    query.set("q", filters.q.trim());
  }

  return query.toString();
}

export async function fetchExercises(filters: ExerciseFilters): Promise<Exercise[]> {
  const query = toQuery(filters);
  return getJson<Exercise[]>(`/api/exercises${query ? `?${query}` : ""}`);
}

export async function fetchExercise(id: number): Promise<Exercise> {
  return getJson<Exercise>(`/api/exercises/${id}`);
}

export async function fetchCatalogue(filters: CatalogueFilters): Promise<CataloguePage> {
  const query = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize ?? 20),
  });

  if (filters.muscle !== "all") {
    query.set("muscle", filters.muscle);
  }
  if (filters.equipment !== "all") {
    query.set("equipment", filters.equipment);
  }
  if (filters.level !== "all") {
    query.set("level", filters.level);
  }
  if (filters.q.trim() !== "") {
    query.set("q", filters.q.trim());
  }

  return getJson<CataloguePage>(`/api/catalogue?${query.toString()}`);
}
