# Cvikárna standards

What this app must satisfy. Prescriptive, short, stable. This is the rubric a reviewer reads
before looking at a screenshot, and the file the author reads before writing a component.

`ARCHITECTURE.md` says how the app is built. This file says what it must look like and what must
never regress. Do not describe implementation here.

Every rule names the check that protects it, or is marked `review only`. A rule with no check is
a preference, and preferences do not survive a busy session.

## Tokens and scales

Colour comes from `:root` in `web/src/styles/global.css`. Tokens: `--bg`, `--surface`,
`--surface-2`, `--surface-3`, `--line`, `--line-soft`, `--text`, `--text-muted`, `--text-dim`,
`--accent`, `--accent-ink`, `--accent-soft`, `--accent-line`, `--danger`, `--danger-soft`.
Dark theme only. No hex outside `:root`. Check: `npm run lint:ui`.

Spacing is a 4px grid: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`, and nothing else. The
`--space-1` to `--space-7` tokens are the same scale. Check: `npm run lint:ui`.

Type scale, in rem: `0.68` micro label, `0.8` small, `0.9` data and secondary, `1` body,
`1.15` lead, `1.4` h3, `1.75` h2, `2.2` h1. Display headings may use `clamp()` on that scale.
Reading text never below `0.875rem` (14px); only tags, pills and micro labels may go smaller.
The history log uses `0.9rem` or larger with tabular figures. Check: `review only` until a lint
case covers font sizes.

Radii: `12` cards and panels, `8` controls, `6` chips. Shadows: `--shadow-pop` only.
Check: `review only`.

## Layout shell

- Content is capped at `--max` (1180px) with the section padding used by `.section`.
- Breakpoints in use: 1440, 1280, 960, 860, 640, 375. Verify the two ends, 1440 and 375.
- Every screen is single column under 800px.
- Never place variable-length content beside other content. Stack it instead.
- Every exercise detail uses one order: header, demonstration image beside the numbered steps,
  then cues and facts. Long instructions may change row height, never the order or the column.
- The approved reference screen for a page pattern is the one Anthony last accepted; new screens
  match its skeleton before they get a style of their own. Check: `review only`, screenshots at
  1440 and 375 in both languages.

## Component inventory

A class or component that is not listed here does not exist yet. Add the row before the markup.
Full class list and the gate: `web/scripts/ui-inventory.json` and `npm run lint:ui`.

| Component | Variants | States | Used on |
|---|---|---|---|
| `Header` | nav links, language toggle | current route, focus | all |
| `Footer` | none | none | all |
| `SkipLink` | none | focus only | all |
| `Button` | `.button`, `--accent`, `--small` | hover, focus-visible, disabled, busy | all |
| `Chip` | filter chip | selected via `aria-pressed`, hover, focus | library, picker, history |
| `Tag` | `.tag`, `--accent` | static | cards, detail |
| `LevelTag` | `.level-tag--beginner`, `--intermediate`, `--expert` | static | cards, detail, picker, history |
| `Pill` | `.pill` | static | history, tracker |
| `Card` | `.card` | hover, focus-within | library |
| `ExerciseCard` | one or two photo, tags, name | hover, focus | library |
| `PhotoStage` | single and paired photo | arrows on hover and focus-visible, busy | detail, card |
| `Section` | title plus children | none | detail, guide |
| `InfoTip` | popover, question mark trigger | closed, open on hover and keyboard, 375 placement | tracker, history |
| `StateViews` | loading, empty, error | the three states | every async area |
| `Sheet` | `.sheet`, `.sheet-backdrop` | open, busy, error | picker, copy |
| `WorkoutItem` | collapsed, expanded, dragging, settling | all four, plus keyboard reorder | tracker |
| `WorkoutNameEditor` | inline input | idle, editing, saving, error | tracker, history |
| `MonthCalendar` | month grid | today, workout dot, focus | history |
| `WorkoutPreview` | accordion group, expanded log | collapsed, expanded, expand-all | history |
| `BackToTop` | floating button | hidden, visible, focus | long pages |
| `GuideSection` | collapsible, key points box | open, closed, hover, focus | guide |

## States matrix

Every screen carries every state, not only the happy path.

| Screen | Loading | Empty | Error | Long content | 375 |
|---|---|---|---|---|---|
| Library | count row keeps its height, cards as skeletons | "nothing matches", filters stay | error panel, count row keeps its height | 20 per batch, show more | 2 columns, filters wrap |
| Detail | photo and text placeholders | not applicable, id is required | ProblemDetails message, no dead controls | steps wrap, facts stay on their row | single column |
| Tracker | rows as skeletons | empty state with add and copy | error above the list, rows stay | sets scroll inside the exercise | one exercise per row |
| History | calendar and list placeholders | "no workouts this month" | error panel, month stays | month list scrolls with a cue | calendar above, list below |
| Guide | section skeletons | not applicable | section-level message | sections collapse, never truncate | one section per screen |

## Motion

- `140ms ease` for colour, background and opacity on controls.
- `180ms ease` for layout shifts, reorder slides and the drag settle.
- `500ms` for the photo crossfade only.
- Nothing else animates. No animation on load except the photo crossfade and the sheet.
- Every animation honours `prefers-reduced-motion`. Check: `review only`.
- Known debt: 130, 150 and 160 ms values exist and are not linted yet.

## Interaction rules

- Navigating is a link. Changing state is a button. Opening a panel is a toggle. A toggle header
  never navigates, and a link never sits inside the toggle. Check: `review only`.
- Destructive actions name what they replace. Copy says it replaces today's session.
  Check: `review only`, and the copy wording test in the API suite.
- Every pointer-only interaction has a keyboard path: reorder responds to ArrowUp and ArrowDown
  on the focused handle. Check: `Sets_can_be_reordered_and_the_order_survives_a_reload`,
  `Workout_exercises_can_be_reordered_and_the_order_survives_a_reload`.
- `:focus-visible` for focus rings, never `:focus`. A mouse click does not pin a control open.
  Check: `review only`.
- Error text never moves the control it belongs to. The slot is reserved. Check: `review only`.
- A floating control never covers text or a column. Check: `review only`.

## Copy and language

- One exercise name per view, in the active language. The other language stays in the data and
  the API. Check: `review only`.
- Sentence case for headings, labels and buttons. No trailing period on a title or a heading.
- Czech is the default; English is the second. Both dictionaries live in
  `web/src/i18n/dictionary.ts` and must gain a key together.
- Dates and numbers are formatted on the client from `DateOnly`, never pre-formatted by the API.
- Errors name the field and the fix. Check: `A_set_with_bad_fields_names_each_field`.

## Forbidden

- Recent Sets and Stats cards on the exercise detail page. Removed, and they duplicate history.
- A stats page per exercise. Removed with the cards.
- A second name line in any view, in either language.
- A filled panel, card or left border around "what to watch for". It is a plain list.
- Appending a copied workout to the target. Copy replaces.
- Numbered pagination in the library. Show more keeps scanning on one screen.
- A new front-end dependency without Anthony's word.
- `!important`, except inside the reduced-motion block.
- A new class in `global.css` without an inventory row. Check: `npm run lint:ui`.
