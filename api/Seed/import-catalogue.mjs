/**
 * Builds api/Seed/catalogue.json from the free-exercise-db dataset.
 *
 * Usage: node api/Seed/import-catalogue.mjs [path-to-exercises.json]
 *
 * Without a path it downloads the dataset from GitHub. The output is the thin
 * catalogue: four display fields per movement, plus the verified Czech name
 * where the movement is also one of the curated rows in exercises.json. Muscle and equipment names
 * are mapped onto this project's vocabulary, and an unknown value fails loudly
 * instead of quietly turning into "other".
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "../..");
const datasetUrl =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

const MUSCLES = {
  abdominals: "core",
  hamstrings: "hamstrings",
  adductors: "glutes",
  quadriceps: "quads",
  biceps: "biceps",
  shoulders: "shoulders",
  chest: "chest",
  "middle back": "back",
  calves: "calves",
  glutes: "glutes",
  "lower back": "back",
  lats: "back",
  triceps: "triceps",
  traps: "back",
  forearms: "grip",
  neck: "shoulders",
  abductors: "glutes",
};

const EQUIPMENT = {
  "body only": "body only",
  machine: "machine",
  other: "other",
  "foam roll": "other",
  kettlebells: "other",
  dumbbell: "dumbbell",
  cable: "cable",
  barbell: "barbell",
  bands: "other",
  "medicine ball": "other",
  "exercise ball": "other",
  "e-z curl bar": "e-z curl bar",
};

const LEVELS = new Set(["beginner", "intermediate", "expert"]);

function mapMuscle(value, where) {
  const mapped = MUSCLES[value];
  if (!mapped) {
    throw new Error(`${where}: unmapped primary muscle "${value}"`);
  }
  return mapped;
}

function mapEquipment(value, where) {
  if (value === null) {
    return null;
  }
  const mapped = EQUIPMENT[value];
  if (!mapped) {
    throw new Error(`${where}: unmapped equipment "${value}"`);
  }
  return mapped;
}

async function readDataset() {
  const path = process.argv[2];
  if (path) {
    return JSON.parse(await readFile(resolve(path), "utf8"));
  }

  const response = await fetch(datasetUrl);
  if (!response.ok) {
    throw new Error(`dataset download failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

const [dataset, library] = await Promise.all([
  readDataset(),
  readFile(join(here, "exercises.json"), "utf8").then(JSON.parse),
]);

if (dataset.length !== 876) {
  throw new Error(`expected 876 dataset rows, found ${dataset.length}`);
}

const czechNames = new Map(library.map((row) => [row.sourceId, row.nameCs]));
const libraryIds = new Set(library.map((row) => row.sourceId));

const rows = dataset
  .map((row) => {
    const where = `dataset[${row.id}]`;
    if (!row.id || !row.name) {
      throw new Error(`${where}: missing id or name`);
    }
    if (!LEVELS.has(row.level)) {
      throw new Error(`${where}: unknown level "${row.level}"`);
    }

    return {
      sourceId: row.id,
      nameEn: row.name,
      nameCs: czechNames.get(row.id) ?? null,
      primaryMuscle: mapMuscle(row.primaryMuscles?.[0], where),
      equipment: mapEquipment(row.equipment, where),
      level: row.level,
    };
  })
  .sort((a, b) => a.sourceId.localeCompare(b.sourceId));

const missingLibrary = [...libraryIds].filter(
  (sourceId) => !rows.some((row) => row.sourceId === sourceId),
);
if (missingLibrary.length > 0) {
  throw new Error(`library sourceIds missing from the dataset: ${missingLibrary.join(", ")}`);
}

await writeFile(join(here, "catalogue.json"), `${JSON.stringify(rows, null, 2)}\n`, "utf8");

console.log(`catalogue: wrote ${rows.length} rows to api/Seed/catalogue.json`);
console.log(`catalogue: ${libraryIds.size} rows carry a verified Czech name from the library`);
console.log(`project: ${projectRoot}`);
