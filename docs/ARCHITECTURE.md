# Cvikárna architecture

How this app is built. Descriptive only. What it must satisfy lives in `STANDARDS.md`.

Read the map first, always. Then open only the section the current step needs.

Budget: this map at most 60 lines, every other section at most 30. When a section grows past
that, move the detail into its own file and leave one pointer line here.

Rule for every entry: if a single `rg` or one file read answers it in ten seconds, it does not
belong here. Record what the code cannot tell a newcomer: wiring, decisions, reasons.

## Map

| What | Where |
|---|---|
| Stack | React 19, Vite 7, TypeScript 5.9, no UI framework. ASP.NET Core 10 minimal API, EF Core 10, SQLite |
| Client entry | `web/src/main.tsx` → `web/src/App.tsx` → routes → `web/src/features/*` |
| Server entry | `api/Program.cs` → `api/Endpoints/*.cs` → `api/Data/AppDbContext.cs` |
| Run | `dotnet run --project api --launch-profile http` on 5073, `cd web && npm run dev` on 5173 |
| Proxy | Vite forwards `/api` to 5073, so the client never hard-codes a host |
| Build and test | `dotnet build -warnaserror`, `dotnet test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run lint:ui` |
| Test count | 50 server tests, 0 front-end tests |
| Static photos | `api/wwwroot/exercises/<slug>/0.jpg` and `1.jpg`, served by `app.UseStaticFiles()` |
| Knowledge home | this file, `STANDARDS.md`, `docs/sources.md`, `docs/name-sources.md` |

Folder map, one line each:

- `api/Contracts` — request and response records, `WorkoutDto`, `ExerciseDto`, `ProblemDetails` shapes.
- `api/Domain` — muscle group table and lookup helpers.
- `api/Endpoints` — four groups: exercises, catalogue, workouts, stats, plus `/api/health`.
- `api/Models` — `Workout`, `WorkoutExercise`, `LoggedSet`, `Exercise`. The library and the catalogue are the same table, split by `IsLibrary`.
- `api/Search` — diacritic folding and one-typo matching for the library query.
- `api/Seed` — `exercises.json` (120 curated), `catalogue.json` (876 thin), idempotent initializer, `validate.mjs`.
- `api/Services` — volume and best-set calculations.
- `api/tests/Cvikarna.Api.Tests` — `WorkoutApiTests`, `ReadApiTests`, `StatsTests`, `SearchTests`, `CatalogueIdTests`, `HealthTests`.
- `web/src/api` — typed fetch wrappers, one file per endpoint group.
- `web/src/components` — `Header`, `Footer`, `ExerciseCard`, `PhotoStage`, `Section`, `InfoTip`, `StateViews`, `WorkoutNameEditor`, `BackToTop`, `SkipLink`.
- `web/src/features/exercises` — grid, detail page, filters.
- `web/src/features/tracker` — today's session, `WorkoutItem`, `PickerSheet`, `CopySheet`.
- `web/src/features/history` — month calendar, month list, selected workout log.
- `web/src/features/guides` — beginner guide sections and inline SVG diagrams.
- `web/src/i18n` — hand-rolled dictionary, `useLanguage`, `localStorage`.
- `web/src/lib` — `useAsync`, `useDebouncedValue`, `dates`.
- `web/src/styles/global.css` — tokens and every component style, one file by design.
- `web/scripts/lint-ui.mjs` — spacing grid, token colour, class inventory, focus ring, motion duration, shadow token and breakpoint gate.

## How it is built

1. `main.tsx` mounts `App.tsx` into `#root`. No server rendering.
2. `App.tsx` declares the routes and the language provider, and renders `Header`, the route, `Footer`, `BackToTop`.
3. A page calls `useAsync` with a function from `web/src/api/*`, which fetches `/api/...` and returns typed JSON.
4. `StateViews` renders the loading, empty and error branches from the same async state.
5. On the server, `Program.cs` registers `AppDbContext`, ProblemDetails, static files, the seed on start, then maps the endpoint groups.
6. An endpoint binds the route and body, validates, queries through EF Core, builds a DTO, and returns the status code.
7. Errors leave as RFC 7807 ProblemDetails. Field errors list each field name.

## Data

- `Workout` has one row per date, `DateOnly PerformedOn`, optional `Name` up to 80 characters.
- `WorkoutExercise` and `LoggedSet` carry `Position`; reads order by `Position` then `Id`. Reorder endpoints rewrite 1..n in one transaction.
- `Exercise` is one table with `IsLibrary` splitting it: the 120 curated rows and the 876 thin catalogue rows. A row is keyed by `SourceId`, never by array order. A curated row promoted from an existing catalogue row keeps its hash-derived id, so the library endpoint orders by fine muscle then Czech name instead of id.
- Library order is fine muscle group, then Czech name. A promoted catalogue row keeps its hash-derived id because its `SourceId` is reused.
- `DatabaseInitializer.cs` seeds idempotently on start: it inserts only what is missing, so a second start adds nothing.
- `dotnet test` builds its own `WebApplicationFactory` database, so tests never touch `cvikarna.db`.
- `node api/Seed/validate.mjs` checks both seed files: counts, duplicate `SourceId`, required fields, photo pairs.
- Deleting a workout exercise deletes its sets through the cascade; a set cannot be written through a different workout's exercise.
- Public repo hygiene: `docs/product-notes.md`, `docs/qa-log.md`, `docs/test-plan.md` and `docs/demo-script.md` are local and gitignored. `docs/name-sources.md`, `docs/sources.md`, `docs/images/` and this pair of files are public.

## Decisions and why

- Copy replaces the target session instead of appending: a copied workout should look exactly like the one copied, so the transaction clears the target first and carries the source name.
- Reorder takes the whole ordered id list and rejects anything else: a partial list is ambiguous, and a foreign id is a client bug that must not write.
- Language is a hand-rolled dictionary rather than an i18n library: two languages, no pluralisation, no runtime loading, and it keeps the bundle free of a dependency.
- One exercise name renders at a time; the other language stays in the data and the API.
- The back-to-top control lifts by the footer's overlap instead of hiding when the footer appears: it stays reachable at the page bottom and never covers footer text. The lift is written straight to the node, rises instantly and eases when it falls, so scrolling to the footer never clips it and appending a batch does not snap it.
- Workouts are date-only and one per day: the app logs today, not a timestamped event stream.
- No authentication and no per-user data: it is a demo with a single owner.
- `global.css` is one file with tokens at the top: the app has five screens, and this keeps the cascade obvious at the cost of a long file.
- `lint-ui.mjs` enforces the 4px grid, token colours and a class inventory, because spacing drift was the largest source of rework. It grew focus rings, motion durations, shadow tokens and breakpoints once each drifted with nothing to catch it; the type scale stays review only because the small end is a band of fourteen sizes and freezing it would lock the mess in place.

## Rejected and why

- Recent Sets and Stats cards on the exercise detail page. Removed: the numbers exist in history, and they cluttered the exercise itself.
- A stats page per exercise. Removed with the cards; do not rebuild it.
- A second name line under the primary name, in any language, in any view. It read as duplication.
- A filled panel, card or left border around "what to watch for". It is a plain list with one small accent marker per row.
- Appending a copied workout to the target. Replaced by the replace rule above.
- Numbered pagination in the library. A show-more button keeps filters and scanning on one screen.
- Culture-based number and date formatting in the API. The client formats dates from `DateOnly`.

## Checks by name

| Rule it protects | Check |
|---|---|
| Copy replaces and carries the name | `A_copy_replaces_a_non_empty_target_and_takes_the_source_name` |
| Copy rejects self, empty or missing source | `Copy_rejects_self_an_empty_or_missing_source_and_a_missing_target` |
| Set order survives a reload | `Sets_can_be_reordered_and_the_order_survives_a_reload` |
| Exercise order survives a reload | `Workout_exercises_can_be_reordered_and_the_order_survives_a_reload` |
| A reorder list must be exact | `Reorder_rejects_a_partial_list`, `Exercise_reorder_rejects_a_partial_or_foreign_list` |
| Names set, rename and clear | `Workout_name_is_set_renamed_and_cleared` |
| Level filter on library and catalogue | `Library_and_catalogue_filter_by_level` |
| The library holds 120 rows | `Library_returns_the_120_rich_rows_in_both_languages` |
| An empty workout is hidden and 404s | `A_workout_with_no_exercises_is_not_listed_or_served_by_date` |
| Search folds diacritics and one typo | `Library_search_ignores_diacritics_and_one_typo` |
| Stats match a hand-calculated fixture | `Stats_match_a_hand_calculated_fixture` |
| Spacing, colours and class inventory | `npm run lint:ui` |
| Every other UI rule | review only, no front-end tests exist |

## Open risks

- No front-end tests. Every JSX rule above the lint gate is protected by review alone. The gate now covers the four rules that had drifted (focus rings, motion durations, shadow tokens, breakpoints), but layout, the states matrix and the type scale still have no check.
- The 375px pass shows the back-to-top control over body text on the guide page. A full-width mobile column and a floating control cannot both satisfy "never covers text". Not fixed; the rule needs a 375 case or the control needs a mobile behaviour.
- 148 baselined `lint-ui` violations are recorded debt. The gate stops it growing; it does not shrink it.
- `Program.cs` has no `MapFallbackToFile("index.html")`, so a deep link into a deployed preview would 404 even though Vite handles it in development.
- SQLite is ephemeral on App Service, so a preview would re-seed on every restart. The preview is not deployed.
- The 876 catalogue rows are thin compared with the 120 curated ones. That is deliberate, and the picker says so.
