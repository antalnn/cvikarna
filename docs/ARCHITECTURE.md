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
| App state | `web/src/state/AppProvider.tsx`: dashboard, workout, library, catalogue, rest, clock, overlays |
| Shell | `web/src/components/shell/Shell.tsx` (rail, topbar, tab bar), `Boot.tsx`, `Palette.tsx`, `Sheet.tsx` |
| Shared card | `web/src/components/ExerciseCard.tsx`, one card for the tracker and the history log |
| Images | `web/src/components/ArtBlock.tsx`: two free-exercise-db frames, auto cross-fade, in-frame controls |
| Server entry | `api/Program.cs` → `api/Endpoints/*.cs` → `api/Data/AppDbContext.cs` |
| Run | `dotnet run --project api --launch-profile http` on 5073, `cd web && npm run dev` on 5173 |
| Proxy | Vite forwards `/api` to 5073, so the client never hard-codes a host |
| Build and test | `dotnet build -warnaserror`, `dotnet format --verify-no-changes`, `dotnet test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run lint:ui`, `npm run measure:ui` |
| Test count | 56 server tests, no front-end unit tests; `npm run measure:ui` measures 12 DOM pairs per run |
| Static photos | `api/wwwroot/exercises/<slug>/0.jpg` and `1.jpg` for curated rows; catalogue rows use the free-exercise-db URL pair |
| Knowledge home | this file, `STANDARDS.md`, `docs/sources.md`, `docs/name-sources.md` |

Folder map, one line each:

- `api/Contracts` — request and response records: exercise, catalogue, workout, dashboard, rest settings.
- `api/Domain` — muscle group table, lookup helpers, `ExerciseImages` (local pair or free-exercise-db pair).
- `api/Endpoints` — exercises and library membership, catalogue, workouts and sets, stats, dashboard, settings, `/api/health`.
- `api/Models` — `Workout`, `WorkoutExercise`, `LoggedSet` (with `Completed`), `Exercise`, `RestSettings`.
- `api/Search` — diacritic folding and one-typo matching for the library and catalogue queries.
- `api/Seed` — `exercises.json` (120 curated), `catalogue.json` (876), idempotent initializer, `validate.mjs`.
- `api/Services` — volume and best-set math, and the dashboard aggregate.
- `api/tests` — workout, read, stats, search, catalogue id, redesign endpoint and health tests.
- `web/src/api` — typed fetch wrappers, one file per endpoint group.
- `web/src/components` — shell, palette, sheet, overlays, shared exercise card, art block, back-to-top, icons.
- `web/src/features/dashboard` — Dnes: session card, log stats, week strip, records, volume spark.
- `web/src/features/library` — Knihovna and Katalog tabs, hide-saved filter, detail page, similar track, save controls.
- `web/src/features/tracker` — Trénink: session bar, next-set row, menus, clock, rest control.
- `web/src/features/history` — calendar, month list, selected session with chips, delete confirm.
- `web/src/features/guides` — guide copy, three SVG figures, sources under the figure.
- `web/src/i18n` — language context and the inline `tx(cs, en)` helper.
- `web/src/lib` — format, plural, date and search helpers; muscle, equipment and level labels.
- `web/src/state` — the one app provider and its hook, which every page reads.
- `web/src/styles/global.css` — Iron Ledger tokens and every component style, one file by design.
- `web/scripts/lint-ui.mjs` — spacing, token colour, class inventory, focus, motion, shadow and breakpoint gate.
- `web/scripts/measure-ui.mjs` — runtime geometry check: launches Chromium, reads the boxes named in `measurements.json`, exits 1 on a breach, 2 when the app is down.
- `web/scripts/measurements.json` — the check registry: id, the sentence a check protects, route, state, widths, selectors, relation and tolerance.

## How it is built

1. `main.tsx` mounts `App.tsx` into `#root`. `LanguageProvider` wraps `AppProvider`, which wraps the router.
2. `AppProvider` loads the dashboard, the saved library, the whole catalogue, the workout summaries and the rest settings in one `Promise.allSettled`. A failed group keeps its own error state.
3. Pages read the provider with `useApp()`. A mutation calls its API wrapper, updates the provider state and refreshes the aggregate it affects.
4. `Shell` renders the rail, topbar, tab bar and footer; `Routed` remounts the route on a path change so the entrance animation plays once.
5. Overlays live once at the root: palette, sheet, confirm, menu, tip, rest chip and one toast.
6. On the server, `Program.cs` registers `AppDbContext`, ProblemDetails, static files, the seed on start, then maps the endpoint groups.
7. An endpoint binds the route and body, validates, queries through EF Core, builds a DTO, and returns the status code.
8. Errors leave as RFC 7807 ProblemDetails. Field errors list each field name.

## Data

- `Workout` has one row per date, `DateOnly PerformedOn`, optional `Name` up to 80 characters.
- `WorkoutExercise` and `LoggedSet` carry `Position`; reads order by `Position` then `Id`. Reorder endpoints rewrite 1..n in one transaction.
- `LoggedSet.Completed` gates volume and the session meter. A set logged from the tracker is uncompleted until ticked; a copied set starts uncompleted.
- `Exercise` is one table with `IsLibrary` acting as saved membership. The 120 curated rows start saved; any catalogue row can be saved or removed through `PUT/DELETE /api/library/{id}`, and the initializer never forces a removed row back in.
- Library order is fine muscle group, then Czech name. A promoted catalogue row keeps its hash-derived id because its `SourceId` is reused.
- `RestSettings` is one row: a uniform value, per-movement seconds in JSON, auto-start, sound, volume and vibration.
- `ExerciseImages` returns the local pair for a curated row and `free-exercise-db/exercises/<SourceId>/0.jpg` plus `1.jpg` for every other row.
- `DatabaseInitializer.cs` seeds idempotently on start: it inserts only what is missing, so a second start adds nothing.
- `dotnet test` builds its own `WebApplicationFactory` database, so tests never touch `cvikarna.db`.
- `node api/Seed/validate.mjs` checks both seed files: counts, duplicate `SourceId`, required fields, photo pairs.
- Deleting a workout deletes its exercises and sets through the cascade; deleting a library membership never deletes the row.
- Public repo hygiene: `docs/product-notes.md`, `docs/qa-log.md`, `docs/test-plan.md` and `docs/demo-script.md` are local and gitignored. `docs/name-sources.md`, `docs/sources.md`, `docs/images/` and this pair of files are public.

## Decisions and why

- The design's tokens are the app's tokens: `global.css` opens with the Iron Ledger `:root` and no other file declares a colour.
- Bilingual copy is inline `tx("česky", "English")` beside the markup. The design's copy is long and per screen; a single dictionary would separate a sentence from its context and add a key for every label.
- The catalogue is all 876 rows and the saved library is a subset of it. Katalog keeps every row visible and marks the saved ones, so one movement never has two detail pages.
- Search runs on the client over both lists with diacritics folded and one typo allowed, because a round trip per keystroke would lag a 876-row filter. The haystack is the movement's names, aliases, muscle (both its own label and the filter group above it) and equipment, so a search for `nohy` or `jednorucky` lands.
- The add-exercise sheet drops saved rows from its catalogue tab while the library page keeps them behind its toggle: a picker answers "what else can I add", a catalogue answers "what exists".
- Copying a session is a replace, so it asks in the confirm popover whenever today already holds exercises; an empty day copies straight through.
- The workout clock stores a start timestamp in `localStorage`, never an elapsed number, so a reload continues from the same place.
- Rest values live in the API, because they must survive a reload and belong to the same store as the session.
- One shared card serves the tracker and history: header, set dots, compact total, one menu; the body changes from rows to chips.
- The card's link is an overlay, not a wrapper. The frame and save controls sit above it, so a tap on a control never opens the movement.
- A catalogue row has no curated instructions, so its detail page shows the empty state instead of an empty list.
- UI geometry is measured, not eyeballed: `web/scripts/measurements.json` carries the sentence each check protects and the boxes it read, and `npm run measure:ui` fails on a breach. On 2026-11-16 at 1440 the statrow label anchor sat 11.1 to 21.0px off the value's block centre and the row box up to 6.5px off, so a 1px check on the wrong anchor passes while the words stay unmet.

## Rejected and why

- The first-release header, footer, photo stage and card CSS. Replaced whole by the design; no old screen remains.
- Demo objects (`HISTORY`, `MOVES`, `SEED_DATES`, a client library list). Deleted; every number now comes from the API.
- A second name line under the primary name. The detail page shows the other language only when it differs; lists print one name.
- A numbered pagination in the library. A show-more button keeps filters and scanning on one screen.
- A palette that adds movements. The picker owns adding; the palette only navigates.
- Culture-based number and date formatting in the API. The client formats dates from `DateOnly`.

## Checks by name

| Rule it protects | Check |
|---|---|
| Library membership saves and removes | `A_catalogue_row_can_join_the_library_and_leave_it_again` |
| A saved row survives a second seed run | `A_saved_exercise_survives_a_second_seed_run` |
| Completed gates the volume | `A_completed_flag_gates_the_volume` |
| Rest settings round trip and validate | `Rest_settings_start_at_defaults_and_round_trip` |
| Dashboard week, spark and records | `The_dashboard_carries_today_the_week_the_weeks_and_the_records` |
| A workout deletes with its sets | `A_workout_can_be_deleted_with_its_sets` |
| Copy replaces and carries the name | `A_copy_replaces_a_non_empty_target_and_takes_the_source_name` |
| Set and exercise order survive a reload | `Sets_can_be_reordered_and_the_order_survives_a_reload`, `Workout_exercises_can_be_reordered_and_the_order_survives_a_reload` |
| Reorder lists must be exact | `Reorder_rejects_a_partial_list`, `Exercise_reorder_rejects_a_partial_or_foreign_list` |
| Search folds diacritics and one typo | `Library_search_ignores_diacritics_and_one_typo` |
| The catalogue holds 876 rows | `Catalogue_pages_20_rows_with_the_common_movements_first` |
| Spacing, colours and class inventory | `npm run lint:ui` |
| The statrow value centre, horizontal scroll and the Dnes card height | `npm run measure:ui`, registry in `web/scripts/measurements.json` |
| Every other UI rule | review only, no check covers it |

## Open risks

- No front-end unit tests. `npm run measure:ui` reads live geometry for the boxes in
  `web/scripts/measurements.json`; every JSX rule outside that registry is protected by review alone.
- The registry covers three checks on the Czech Dnes page in its populated state. A regression in English, in a loading or error state, or in a box no entry names still passes unseen.
- The catalogue's photos are remote free-exercise-db URLs, so an offline browser shows the framed block without a photo.
- 63 baselined `lint-ui` violations are recorded debt. The gate stops it growing; it does not shrink it.
- `Program.cs` has no `MapFallbackToFile("index.html")`, so a deep link into a deployed preview would 404 even though Vite handles it in development.
- SQLite is ephemeral on App Service, so a preview would re-seed on every restart. The preview is not deployed.
- 756 catalogue rows are thin compared with the 120 curated ones. That is deliberate, and the movement sheet says so.
- The local `cvikarna.db` carries a workout dated in the future. The dashboard ignores dates after today; the copy sheet still lists them.
