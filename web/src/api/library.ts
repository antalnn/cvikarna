import { deleteJson, getJson, putJson } from "./client";
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

/** The saved library. Membership is stored in the API, not in localStorage. */
export async function fetchExercises(filters: ExerciseFilters): Promise<Exercise[]> {
  const query = toQuery(filters);
  return getJson<Exercise[]>(`/api/exercises${query ? `?${query}` : ""}`);
}

export async function fetchExercise(id: number): Promise<Exercise> {
  return getJson<Exercise>(`/api/exercises/${id}`);
}

export async function saveExercise(id: number): Promise<void> {
  await putJson(`/api/library/${id}`);
}

export async function removeSavedExercise(id: number): Promise<void> {
  await deleteJson(`/api/library/${id}`);
}

export async function fetchCatalogue(filters: CatalogueFilters): Promise<CataloguePage> {
  const query = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize ?? 100),
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

/** Every catalogue row, read in API-sized pages. 876 rows, nine requests. */
export async function fetchAllCatalogue(): Promise<CataloguePage["items"]> {
  const rows: CataloguePage["items"] = [];
  let page = 1;

  for (;;) {
    const result = await fetchCatalogue({
      muscle: "all",
      equipment: "all",
      level: "all",
      q: "",
      page,
      pageSize: 100,
    });
    rows.push(...result.items);

    if (rows.length >= result.total || result.items.length === 0) {
      return rows;
    }

    page += 1;
  }
}
