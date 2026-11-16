# Cvikárna standards

What this app must satisfy. Prescriptive, short, stable. This is the rubric a reviewer reads
before looking at a screenshot, and the file the author reads before writing a component.

`ARCHITECTURE.md` says how the app is built. This file says what it must look like and what must
never regress. Do not describe implementation here.

Every rule names the check that protects it, or is marked `review only`. A rule with no check is
a preference, and preferences do not survive a busy session.

## Tokens and scales

Colour comes from `:root` in `web/src/styles/global.css`: the Iron Ledger ramp. Surfaces
`--bg-deep`, `--bg`, `--surface-1` to `--surface-4`; lines `--line-soft`, `--line`,
`--line-strong`; ink `--fg`, `--fg-muted`, `--fg-dim`, `--fg-faint`; the lime signal `--accent`,
`--accent-bright`, `--accent-deep`, `--accent-ink`, `--accent-soft`, `--accent-line`, `--accent-glow`;
the state trio `--info`, `--warn`, `--danger` with their soft and line pairs; overlays `--glass`,
`--scrim`, `--grid-line`, `--highlight`; `--focus`. Dark theme only. No hex outside `:root`. Check:
`npm run lint:ui`.

Spacing is the 4-based `--space-1` to `--space-9` scale: 4, 8, 12, 16, 24, 32, 48, 64, 96. A new
value comes from that scale, not from a magic number. Check: `npm run lint:ui`.

Type is one 1.25 scale, `--step--2` to `--step-6`, with `--font-display`, `--font-sans` and
`--font-mono`. Any aligned figure uses the mono face with tabular numerals. Check: `review only`.

Radii are `--radius-xs`, `--radius-sm`, `--radius`, `--radius-lg`, `--radius-pill`. Shadows come
from `--shadow-card`, `--shadow-pop` and `--shadow-accent`; a `box-shadow` never carries a raw
colour. Check: `npm run lint:ui`.

## Layout shell

- The rail is 236px, 84px under 1200, hidden under 1024 where the tab bar takes over.
- Content is capped at `--max` (1280px) and centred; the topbar hairline spans the whole main column while its contents stay inside the cap.
- No horizontal scroll at 390, 820 or 1440 on any view. Check: Playwright `documentElement.scrollWidth === clientWidth` at all three widths.
- A list that scrolls inside a card shows the down-arrow cue while rows remain, and never scrolls sideways.
- Every interactive element has a visible `:focus-visible` treatment and a 44px target on touch.

## Component inventory

A class or component that is not listed here does not exist yet. Add the row before the markup.
The full class list and the gate live in `web/scripts/ui-inventory.json` and `npm run lint:ui`.

| Component | Variants | States | Used on |
|---|---|---|---|
| `Shell` | rail, topbar, tab bar, footer | current route | all |
| `Boot` | wordmark, fill, wipe | playing, done, skipped | every load |
| `Palette` | pages and movements | open, empty, active row | all |
| `Sheet` | add, copy, movement | open, loading, error, empty | Dnes, Trénink |
| `Picker` | library, catalogue tabs | added, saved, filtered, empty | sheet |
| `ExerciseCard` | tracker, history | open, closed, done, note | Trénink, Historie |
| `ArtBlock` | card, stage, row | frame 1, frame 2, auto, held | Knihovna, detail |
| `Button` | `.btn`, `--primary`, `--quiet`, `--sm` | hover, focus-visible, disabled, busy | all |
| `Chip` | filter chip, `--sm` | pressed | Knihovna, sheet |
| `Tag` | plain, accent, info, warn, danger | static | cards, detail, rows |
| `Field` | search | focus, clear | Knihovna, sheet, palette |
| `RestChip` | ring timer, session-bar control | running, paused, done, hidden | all |
| `RestPopover` | time, sound tabs | open, saved | Trénink |
| `ConfirmPopover` | small anchored | open, cancelled, run | Trénink, Historie, sheet |
| `MenuPopover` | panel rows | open, closed by its trigger | Trénink |
| `TipPopover` | one-line panel above its control | open, hover, focus | Trénink |
| `Toast` | one bar | default, danger | all |
| `StateViews` | loading, empty, error | the three states | every async area |
| `MonthCalendar` | month grid | today, workout dot, selected | Historie |
| `BackToTop` | floating 44px button | hidden, visible, lifted by the footer | Knihovna |
| `HideSaved` | filter chip | on, off | Katalog |
| `GuideSection` | accordion, figure, sources | open, closed | Průvodce |

## States matrix

Every screen carries every state, not only the happy path. Reach a state on a cold load with
`?state=loading|empty|error|edge`. The guide always renders.

| Screen | Loading | Empty | Error | Long content | Narrow |
|---|---|---|---|---|---|
| Dnes | skeletons in five panels | "nothing running" with library and add | error panel with retry | session rows truncate | one column |
| Knihovna | skeleton cards | "library is empty" or "nothing matches", filters stay | error panel with retry | card title clamps to two lines | two small cards at 390 |
| Katalog | loading rows | "nothing matches", filters stay | error panel | 876 rows, name truncates | one row per line |
| Detail | stage and text placeholders | no Czech steps or cues shows its empty line | ProblemDetails message, no dead controls | steps wrap, facts stay on their row | single column |
| Trénink | card skeletons | empty state with add and copy | error above the list | names truncate, next set stays inside the card | form stacks inside the tinted row |
| Historie | calendar and list placeholders | "no sessions this month" | error panel, month stays | month list scrolls with a cue | calendar above, list below |
| Průvodce | not applicable, typed content | not applicable | not applicable | sources wrap under the figure | one section per screen |

Check: `review only`, every cell asserted by hand at 1440 and 390 in both languages.

## Motion

- Interface transitions use `--dur-1` to `--dur-4`, ease-out, no bounce. The named ambient loops
  are the boot choreography, the live dot, the skeleton shimmer, the month cue and the rest ring.
- The rest timer animates while it runs: the ring breathes, the state dot pulses and the ring's
  progress moves each second. A paused timer is visibly different: the ring loses its colour and
  motion, and the pause/play button switches fill, colour and icon, never only a label.
- The page entrance plays once per route change. In-view updates never replay it.
- The clock and rest chip patch their own text; they never re-render a page.
- `prefers-reduced-motion` removes all of it, the boot included. Check: `review only`; the lint gate
  checks declared durations.

## Interaction rules

- A thing that navigates is a link; a thing that changes state is a button; a thing that opens a
  panel carries `aria-expanded` or `aria-haspopup`. Check: `review only`.
- Every exercise card expands and collapses from its header, by pointer, Enter and Space. The
  toggle targets the card itself and re-renders it; no card is a dead control.
- Set rows keep an even 40px rhythm. A note sits inline on one line with its full text in `title`;
  it never becomes a second line. No horizontal rules between set rows.
- The next-set row sits inside the card's body padding and respects the card radius. Its accent
  tint is inset, its fields wrap without crowding the lower edge, and its index is vertically
  centred on the row at every width.
- The exercise chevron is 18px in muted ink, and turns over when the card opens.
- RPE is one small numeral chip, tinted neutral below 7, soft lime at 7 and 8, full lime at 9 and
  10. It is never a dot scale and never a repeated text label, and its centre rides the centre of
  the numerals beside it rather than their baseline.
- The dashboard's `Podle deníku` values sit under their own label below 768px, and above it each
  number is vertically centred on the label that names it; a number is never alone at the far
  right edge away from the text that describes it.
- Saving is one control per card or row, and its shape states the click. A saved card is a small
  red cross in a circle; a saved catalogue row is a red cross, an unsaved one a lime plus.
- The add-exercise sheet's Katalog tab hides what the library already holds, so it only answers
  "what else can I add"; the library page's own Katalog keeps its `Skrýt v knihovně` toggle, and
  the sheet searches inside the tab it is on.
- The exercise menu opens as rows in a bordered panel, never as bare buttons, and a second press on
  the trigger closes it.
- A question-mark tip opens above its control in a bordered panel with its own padding; it never
  lies over the fields beside it.
- The session bar's rest control mirrors the timer: a play glyph when nothing runs, a filled pause
  glyph and the running state while it does, and a press starts, pauses or resumes the same timer
  the popover controls.
- A movement photograph carries no grid, wireframe or corner marks across it; the caption and the
  frame controls sit on a soft bottom gradient.
- History keeps `Dnes` inside the calendar header, and its delete control is a 36px trash in the
  danger colour.
- Copying a past session replaces today's without a question only when today is empty; otherwise it
  asks in the confirm popover, and Escape closes the question before the sheet.
- Dnes names the session's action by what is left to do: `Pokračovat` while sets remain, `Upravit`
  once every set is complete.
- In the guide, the figure opens the right column and the sources close it, aligned with the end of
  the copy in the other column.
- A detail page's similar movements fill one horizontal track with every saved movement in the
  same muscle group; the previous and next buttons scroll the track, never the page.
- A floating control appears only after a screenful, stays inside the viewport, sits clear of the
  tab bar, and lifts above the footer instead of covering its text.
- A dialog traps Tab, closes on Escape and on the scrim, and returns focus to what opened it. The
  rest popover is non-modal and stays open while a setting is edited.
- Destructive actions name what they replace and ask in the small anchored popover, never in the
  side sheet.
- A set counts once it is completed. Zero kilograms is valid bodyweight work; a copied set starts
  uncompleted and adds no volume until it is ticked.
- A new message replaces the floating bar instead of stacking.
- A term the interface abbreviates carries a question mark that explains it on hover and on focus.

## Copy and language

- Czech is the default and English is one click away. App copy goes through `tx(cs, en)` beside the
  component; the html language attribute follows the choice.
- Czech is the primary language. A movement prints its Czech name when a sourced one exists and
  the English name when it does not. English locale prints the English name. The detail page may
  show the other language as a secondary line; a list or card never prints both.
- A Czech name is used only when a real source names the movement in Czech. Machine translation,
  invented Czech and a literal translation of an English name are out; the follow-up session in
  the Iron Ledger plan validates every catalogue name against `docs/name-sources.md`.
- Search matches both names and the aliases in both languages, with diacritics folded and one typo
  allowed in a word of four letters or more.
- Sentence case for headings, labels and buttons. No trailing period on a title or a heading.
- Dates and numbers are formatted on the client from `DateOnly`, never pre-formatted by the API.
  Czech uses a space as the thousands separator and a comma as the decimal mark.
- Errors name the field and the fix.

## Forbidden

- A hex colour outside `:root`, because the palette must stay one ramp.
- A new colour, type step, spacing value, radius or shadow outside the tokens.
- Demo history, demo movement objects, or a hardcoded demo date in the client.
- A second name line in a list or card, in either language.
- An invented Czech exercise name.
- A dot scale for RPE.
- A horizontal rule between set rows.
- A fixed height on the next-set row that lets its fields overflow the card.
- A paused and a running rest that look the same.
- A client-side library list that shadows the API.
- The footer state tester; `?state=` replaced it.
- A new front-end dependency without Anthony's word.
- `!important`, except inside the reduced-motion block.
- A new class in `global.css` without an inventory row. Check: `npm run lint:ui`.

Everything else in this list is `review only`: a reviewer reads it before approving a change.
