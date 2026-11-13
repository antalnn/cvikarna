/**
 * Validates the curated seed, and the catalogue once it exists.
 *
 * Run from anywhere: node api/Seed/validate.mjs
 * Exit code 0 means the data is usable. Anything else prints what is wrong.
 */
import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "../..");
const problems = [];

const MUSCLES = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
  "grip",
];
const EQUIPMENT = ["barbell", "dumbbell", "cable", "machine", "body only", "e-z curl bar", "other"];
const LEVELS = ["beginner", "intermediate", "expert"];

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    problems.push(`${path}: ${error.message}`);
    return null;
  }
}

function checkText(where, value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    problems.push(`${where}: ${field} is empty`);
  }
}

function checkList(where, value, field, minimum) {
  if (!Array.isArray(value) || value.length < minimum) {
    problems.push(`${where}: ${field} needs at least ${minimum} entries`);
    return;
  }
  for (const item of value) {
    checkText(where, item, field);
  }
}

function checkMuscles(where, value, field) {
  if (!MUSCLES.includes(value)) {
    problems.push(`${where}: ${field} is "${value}", not a known muscle`);
  }
}

async function validateLibrary() {
  const path = join(here, "exercises.json");
  const rows = await readJson(path);
  if (!rows) {
    return 0;
  }

  if (rows.length !== 40) {
    problems.push(`library: expected 40 rows, found ${rows.length}`);
  }

  const ids = new Set();
  const slugs = new Set();
  let photos = 0;

  for (const row of rows) {
    const where = `library[${row.id ?? "?"}]`;
    if (ids.has(row.id)) {
      problems.push(`${where}: duplicate id`);
    }
    if (slugs.has(row.slug)) {
      problems.push(`${where}: duplicate slug ${row.slug}`);
    }
    ids.add(row.id);
    slugs.add(row.slug);

    checkText(where, row.slug, "slug");
    checkText(where, row.nameEn, "nameEn");
    checkText(where, row.nameCs, "nameCs");
    checkMuscles(where, row.primaryMuscle, "primaryMuscle");

    for (const muscle of row.secondaryMuscles ?? []) {
      checkMuscles(where, muscle, "secondaryMuscles");
    }

    if (!EQUIPMENT.includes(row.equipment)) {
      problems.push(`${where}: equipment is "${row.equipment}"`);
    }
    if (!LEVELS.includes(row.level)) {
      problems.push(`${where}: level is "${row.level}"`);
    }
    if (row.coverIndex !== undefined && row.coverIndex !== 0 && row.coverIndex !== 1) {
      problems.push(`${where}: coverIndex is "${row.coverIndex}", expected 0 or 1`);
    }

    for (const field of ["aliasesEn", "aliasesCs"]) {
      checkList(where, row[field], field, 1);
      if (Array.isArray(row[field]) && row[field].length > 3) {
        problems.push(`${where}: ${field} has ${row[field].length} entries, the cap is 3`);
      }
    }

    for (const field of ["instructionsEn", "instructionsCs", "cuesEn", "cuesCs"]) {
      checkList(where, row[field], field, 2);
    }

    if (row.instructionsEn?.length !== row.instructionsCs?.length) {
      problems.push(`${where}: instruction count differs between English and Czech`);
    }
    if (row.cuesEn?.length !== row.cuesCs?.length) {
      problems.push(`${where}: cue count differs between English and Czech`);
    }

    if (!Array.isArray(row.images) || row.images.length !== 2) {
      problems.push(`${where}: needs two photos`);
      continue;
    }

    for (const image of row.images) {
      try {
        await access(join(projectRoot, "api/wwwroot", image.replace(/^\//, "")));
        photos += 1;
      } catch {
        problems.push(`${where}: missing photo ${image}`);
      }
    }
  }

  return { rows: rows.length, photos };
}

async function validateCatalogue(librarySourceIds) {
  const path = join(here, "catalogue.json");
  try {
    await access(path);
  } catch {
    return null;
  }

  const rows = await readJson(path);
  if (!rows) {
    return null;
  }

  if (rows.length !== 876) {
    problems.push(`catalogue: expected 876 rows, found ${rows.length}`);
  }

  const sourceIds = new Set();
  for (const row of rows) {
    const where = `catalogue[${row.sourceId ?? "?"}]`;
    checkText(where, row.sourceId, "sourceId");
    checkText(where, row.nameEn, "nameEn");
    checkMuscles(where, row.primaryMuscle, "primaryMuscle");
    if (sourceIds.has(row.sourceId)) {
      problems.push(`${where}: duplicate sourceId`);
    }
    sourceIds.add(row.sourceId);

    if (row.equipment !== null && !EQUIPMENT.includes(row.equipment)) {
      problems.push(`${where}: equipment is "${row.equipment}"`);
    }
    if (!LEVELS.includes(row.level)) {
      problems.push(`${where}: level is "${row.level}"`);
    }
    if (row.nameCs === "") {
      problems.push(`${where}: nameCs is an empty string, use null when there is no Czech name`);
    }
    if (row.nameCs !== null && !librarySourceIds.has(row.sourceId)) {
      problems.push(`${where}: nameCs is set on a row outside the curated library`);
    }
  }

  for (const sourceId of librarySourceIds) {
    if (!sourceIds.has(sourceId)) {
      problems.push(`catalogue: library sourceId ${sourceId} is missing`);
    }
  }

  return rows.length;
}

const library = await validateLibrary();
const librarySourceIds = new Set();
try {
  const rows = JSON.parse(await readFile(join(here, "exercises.json"), "utf8"));
  for (const row of rows) {
    librarySourceIds.add(row.sourceId);
  }
} catch {
  // validateLibrary already reported the unreadable file.
}
const catalogue = await validateCatalogue(librarySourceIds);

if (problems.length > 0) {
  console.error(`Seed validation failed with ${problems.length} problem(s):`);
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(`library: ${library.rows} rows, ${library.photos} photos, all present`);
console.log(
  catalogue === null
    ? "catalogue: not imported yet"
    : `catalogue: ${catalogue} rows, ids unique`,
);
