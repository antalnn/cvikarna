import type { Equipment, Level, Muscle, MuscleGroup } from "../api/types";

export type Language = "cs" | "en";

export interface Dictionary {
  skipToContent: string;
  brandName: string;
  brandSub: string;
  navLabel: string;
  navLibrary: string;
  navTracker: string;
  navHistory: string;
  navGuides: string;
  languageLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLede: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchClear: string;
  muscleFilterLabel: string;
  muscleAll: string;
  equipmentLabel: string;
  equipmentAll: string;
  results: (shown: number, total: number) => string;
  loading: string;
  errorTitle: string;
  errorText: string;
  retry: string;
  emptyTitle: string;
  emptyText: string;
  clearFilters: string;
  notFoundTitle: string;
  notFoundText: string;
  backToLibrary: string;
  play: string;
  pause: string;
  prevPhoto: string;
  nextPhoto: string;
  photoStart: string;
  photoEnd: string;
  sectionInstructions: string;
  sectionCues: string;
  sectionSimilar: string;
  aliasesLabel: string;
  levelLabel: string;
  secondaryLabel: string;
  footerDataset: string;
  footerNote: string;
  trackerEyebrow: string;
  trackerTitle: string;
  trackerLede: string;
  trackerErrorTitle: string;
  workoutNamePlaceholder: string;
  renameWorkout: string;
  saveName: string;
  cancelEdit: string;
  nameError: string;
  copyWorkout: string;
  copyTitle: string;
  copyLede: string;
  copyEmpty: string;
  copyRowLabel: (date: string) => string;
  copyAction: string;
  copying: string;
  addExercise: string;
  noExercisesTitle: string;
  noExercisesText: string;
  removeExercise: string;
  setNumber: string;
  weightLabel: string;
  repsLabel: string;
  rpeLabel: string;
  rpeInfo: string;
  rpeInfoLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  addSet: string;
  saving: string;
  weightError: string;
  repsError: string;
  rpeError: string;
  saveError: string;
  removeSet: string;
  reorderSet: string;
  reorderExercise: string;
  noSets: string;
  noSetsShort: string;
  expand: string;
  collapse: string;
  expandAll: string;
  collapseAll: string;
  pickerTitle: string;
  pickerSearchLabel: string;
  pickerSearchPlaceholder: string;
  pickerResults: (shown: number, total: number) => string;
  pickerPage: (page: number, totalPages: number) => string;
  prevPage: string;
  nextPage: string;
  pickerEmpty: string;
  close: string;
  add: string;
  detailLink: string;
  recentSetsTitle: string;
  recentSetsEmpty: string;
  dateLabel: string;
  statsTitle: string;
  statsVolume: string;
  statsBestE1rm: string;
  statsBestWeight: string;
  statsBestSet: string;
  statsWeekly: string;
  noStats: string;
  historyEyebrow: string;
  historyTitle: string;
  historyLede: string;
  historyLoading: string;
  historyErrorTitle: string;
  historyPreviewEyebrow: string;
  today: string;
  prevMonth: string;
  nextMonth: string;
  calendarLabel: string;
  calendarWorkoutMark: string;
  monthWorkoutsTitle: string;
  sortNewest: string;
  sortOldest: string;
  sortOrderLabel: string;
  monthEmptyTitle: string;
  monthEmptyText: string;
  noWorkoutOnDay: string;
  openToday: string;
  pickDay: string;
  exerciseCount: (count: number) => string;
  setCount: (count: number) => string;
  muscle: Record<MuscleGroup, string>;
  muscleFine: Record<Muscle, string>;
  equipment: Record<Equipment, string>;
  level: Record<Level, string>;
}

const cs: Dictionary = {
  skipToContent: "Přejít na obsah",
  brandName: "Cvikárna",
  brandSub: "Technika a trénink",
  navLabel: "Hlavní navigace",
  navLibrary: "Knihovna",
  navTracker: "Trénink",
  navHistory: "Historie",
  navGuides: "Průvodce",
  languageLabel: "Jazyk",
  heroEyebrow: "Od prvního tréninku dál",
  heroTitle: "Všechny cviky, které ti pomůžou nabrat svaly a sílu",
  heroLede:
    "Od prvního cviku po hotový plán. Zjisti, co a proč dělat, a poskládej si trénink podle vybavení, které máš.",
  searchLabel: "Hledat cvik",
  searchPlaceholder: "Hledej cvik, sval nebo přezdívku…",
  searchClear: "Vymazat hledání",
  muscleFilterLabel: "Svalová skupina",
  muscleAll: "Všechny svaly",
  equipmentLabel: "Nářadí",
  equipmentAll: "Všechno nářadí",
  results: (shown, total) => `${shown} z ${total} cviků`,
  loading: "Načítám knihovnu…",
  errorTitle: "Knihovna se nenačetla",
  errorText: "Zkuste to znovu. Když to nepomůže, obnovte stránku.",
  retry: "Zkusit znovu",
  emptyTitle: "Nic nenalezeno",
  emptyText: "Zkuste jiný výraz nebo zrušte filtry.",
  clearFilters: "Zrušit filtry",
  notFoundTitle: "Cvik nenalezen",
  notFoundText: "Tenhle cvik v knihovně není. Odkaz může být špatný.",
  backToLibrary: "Zpět do knihovny",
  play: "Přehrát",
  pause: "Pauza",
  prevPhoto: "Předchozí fotka",
  nextPhoto: "Další fotka",
  photoStart: "Výchozí poloha",
  photoEnd: "Koncová poloha",
  sectionInstructions: "Provedení",
  sectionCues: "Na co si dát pozor",
  sectionSimilar: "Podobné cviky",
  aliasesLabel: "Také známo jako",
  levelLabel: "Náročnost",
  secondaryLabel: "Zapojuje také",
  footerDataset: "Fotografie a výchozí popisy: free-exercise-db, licence Unlicense.",
  footerNote: "Cvikárna. Technika a trénink.",
  trackerEyebrow: "Dnes",
  trackerTitle: "Dnešní trénink",
  trackerLede: "Přidej cviky a zapisuj série. Váha 0 znamená vlastní váhu.",
  trackerErrorTitle: "Trénink se nenačetl",
  workoutNamePlaceholder: "Název tréninku",
  renameWorkout: "Přejmenovat trénink",
  saveName: "Uložit název",
  cancelEdit: "Zrušit úpravu",
  nameError: "Název může mít nejvýš 80 znaků.",
  copyWorkout: "Zkopírovat trénink",
  copyTitle: "Zkopírovat minulý trénink",
  copyLede: "Vyber trénink, který chceš zopakovat. Cviky a série se přidají do dnešního tréninku.",
  copyEmpty: "Zatím žádný minulý trénink. Až nějaký zapíšeš, objeví se tady.",
  copyRowLabel: (date) => `Zkopírovat trénink z ${date}`,
  copyAction: "Zkopírovat",
  copying: "Kopíruji…",
  addExercise: "Přidat cvik",
  noExercisesTitle: "Zatím žádný trénink",
  noExercisesText: "Přidej první cvik a začni zapisovat série.",
  removeExercise: "Odebrat cvik",
  setNumber: "#",
  weightLabel: "Váha (kg)",
  repsLabel: "Opakování",
  rpeLabel: "RPE",
  rpeInfo:
    "RPE říká, jak těžká série byla. 1 je velmi lehká, 10 znamená, že už bys nedal další opakování. Většina pracovních sérií je 7 až 9.",
  rpeInfoLabel: "Co je RPE?",
  notesLabel: "Poznámka",
  notesPlaceholder: "Nepovinné",
  addSet: "Zapsat sérii",
  saving: "Ukládám…",
  weightError: "Váha musí být 0 nebo víc.",
  repsError: "Opakování musí být 1 až 100.",
  rpeError: "RPE musí být 1 až 10.",
  saveError: "Nepodařilo se uložit. Zkuste to znovu.",
  removeSet: "Odebrat sérii",
  reorderSet: "Přesunout sérii. Táhni myší, nebo stiskni šipku nahoru a dolů.",
  reorderExercise: "Přesunout cvik. Táhni myší, nebo stiskni šipku nahoru a dolů.",
  noSets: "Zatím žádné série.",
  noSetsShort: "Bez sérií",
  expand: "Rozbalit",
  collapse: "Sbalit",
  expandAll: "Rozbalit vše",
  collapseAll: "Sbalit vše",
  pickerTitle: "Přidat cvik",
  pickerSearchLabel: "Hledat cvik",
  pickerSearchPlaceholder: "Hledej cvik nebo sval…",
  pickerResults: (shown, total) => `${shown} z ${total} cviků`,
  pickerPage: (page, totalPages) => `Strana ${page} z ${totalPages}`,
  prevPage: "Předchozí",
  nextPage: "Další",
  pickerEmpty: "Nic nenalezeno",
  close: "Zavřít",
  add: "Přidat",
  detailLink: "Detail",
  recentSetsTitle: "Poslední série",
  recentSetsEmpty: "Zatím žádná data.",
  dateLabel: "Datum",
  statsTitle: "Statistiky",
  statsVolume: "Objem",
  statsBestE1rm: "Odhad 1RM",
  statsBestWeight: "Nejvyšší váha",
  statsBestSet: "Nejlepší série",
  statsWeekly: "Série tento týden",
  noStats: "Zatím žádná data.",
  historyEyebrow: "Deník",
  historyTitle: "Historie tréninků",
  historyLede: "Prohlédni si, co jsi zvedl v každém týdnu. Minulé tréninky jsou jen ke čtení.",
  historyLoading: "Načítám historii…",
  historyErrorTitle: "Historie se nenačetla",
  historyPreviewEyebrow: "Vybraný trénink",
  today: "Dnes",
  prevMonth: "Předchozí měsíc",
  nextMonth: "Další měsíc",
  calendarLabel: "Kalendář tréninků",
  calendarWorkoutMark: "trénink",
  monthWorkoutsTitle: "Tréninky v měsíci",
  sortNewest: "Nejnovější první",
  sortOldest: "Nejstarší první",
  sortOrderLabel: "Změnit pořadí tréninků",
  monthEmptyTitle: "Žádné tréninky",
  monthEmptyText: "V tomto měsíci zatím žádný trénink není.",
  noWorkoutOnDay: "V tento den žádný trénink.",
  openToday: "Otevřít dnešní trénink",
  pickDay: "Vyber den v kalendáři.",
  exerciseCount: (count) =>
    `${count} ${count === 1 ? "cvik" : count >= 2 && count <= 4 ? "cviky" : "cviků"}`,
  setCount: (count) => `${count} ${count >= 1 && count <= 4 ? "série" : "sérií"}`,
  muscle: {
    chest: "Prsa",
    back: "Záda",
    shoulders: "Ramena",
    biceps: "Biceps",
    triceps: "Triceps",
    legs: "Nohy",
    core: "Core",
  },
  muscleFine: {
    chest: "prsa",
    back: "záda",
    shoulders: "ramena",
    biceps: "biceps",
    triceps: "triceps",
    quads: "kvadricepsy",
    hamstrings: "hamstringy",
    glutes: "hýždě",
    calves: "lýtka",
    core: "core",
    grip: "úchop",
  },
  equipment: {
    barbell: "Velká činka",
    dumbbell: "Jednoručky",
    cable: "Kladka",
    machine: "Stroj",
    "body only": "Vlastní váha",
    "e-z curl bar": "EZ tyč",
    other: "Pomůcka",
  },
  level: {
    beginner: "Začátečník",
    intermediate: "Pokročilý",
    expert: "Expert",
  },
};

const en: Dictionary = {
  skipToContent: "Skip to content",
  brandName: "Cvikárna",
  brandSub: "Technique & training",
  navLabel: "Main navigation",
  navLibrary: "Library",
  navTracker: "Train",
  navHistory: "History",
  navGuides: "Guides",
  languageLabel: "Language",
  heroEyebrow: "From your first session on",
  heroTitle: "Every movement you need to build muscle and get strong",
  heroLede:
    "From your first movement to a finished plan. Learn what to do and why, and build a workout around the equipment you have.",
  searchLabel: "Search movements",
  searchPlaceholder: "Search a movement, muscle or nickname…",
  searchClear: "Clear search",
  muscleFilterLabel: "Muscle group",
  muscleAll: "All muscles",
  equipmentLabel: "Equipment",
  equipmentAll: "All equipment",
  results: (shown, total) => `${shown} of ${total} movements`,
  loading: "Loading the library…",
  errorTitle: "The library did not load",
  errorText: "Try again. If that does not help, reload the page.",
  retry: "Try again",
  emptyTitle: "Nothing found",
  emptyText: "Try another term or clear the filters.",
  clearFilters: "Clear filters",
  notFoundTitle: "Movement not found",
  notFoundText: "That movement is not in the library. The link may be wrong.",
  backToLibrary: "Back to the library",
  play: "Play",
  pause: "Pause",
  prevPhoto: "Previous photo",
  nextPhoto: "Next photo",
  photoStart: "Start position",
  photoEnd: "End position",
  sectionInstructions: "How to do it",
  sectionCues: "What to watch for",
  sectionSimilar: "Similar exercises",
  aliasesLabel: "Also known as",
  levelLabel: "Level",
  secondaryLabel: "Also works",
  footerDataset: "Photos and base descriptions: free-exercise-db, Unlicense.",
  footerNote: "Cvikárna. Technique & training.",
  trackerEyebrow: "Today",
  trackerTitle: "Today's workout",
  trackerLede: "Add movements and log your sets. Weight 0 means bodyweight.",
  trackerErrorTitle: "The workout did not load",
  workoutNamePlaceholder: "Workout name",
  renameWorkout: "Rename workout",
  saveName: "Save name",
  cancelEdit: "Cancel editing",
  nameError: "A name can be at most 80 characters.",
  copyWorkout: "Copy a workout",
  copyTitle: "Copy a past workout",
  copyLede: "Pick a workout to repeat. Its exercises and sets are added to today's session.",
  copyEmpty: "No past workouts yet. They show up here once you log one.",
  copyRowLabel: (date) => `Copy the workout from ${date}`,
  copyAction: "Copy",
  copying: "Copying…",
  addExercise: "Add movement",
  noExercisesTitle: "No workout yet",
  noExercisesText: "Add the first movement and start logging sets.",
  removeExercise: "Remove movement",
  setNumber: "#",
  weightLabel: "Weight (kg)",
  repsLabel: "Reps",
  rpeLabel: "RPE",
  rpeInfo:
    "RPE says how hard a set was. 1 is very easy, 10 means no more reps were possible. Most working sets land at 7 to 9.",
  rpeInfoLabel: "What is RPE?",
  notesLabel: "Note",
  notesPlaceholder: "Optional",
  addSet: "Log set",
  saving: "Saving…",
  weightError: "Weight must be 0 or more.",
  repsError: "Reps must be 1 to 100.",
  rpeError: "RPE must be 1 to 10.",
  saveError: "Could not save. Try again.",
  removeSet: "Remove set",
  reorderSet: "Reorder set. Drag it, or press Arrow Up or Arrow Down.",
  reorderExercise: "Reorder exercise. Drag it, or press Arrow Up or Arrow Down.",
  noSets: "No sets yet.",
  noSetsShort: "No sets",
  expand: "Expand",
  collapse: "Collapse",
  expandAll: "Expand all",
  collapseAll: "Collapse all",
  pickerTitle: "Add movement",
  pickerSearchLabel: "Search movements",
  pickerSearchPlaceholder: "Search a movement or muscle…",
  pickerResults: (shown, total) => `${shown} of ${total} movements`,
  pickerPage: (page, totalPages) => `Page ${page} of ${totalPages}`,
  prevPage: "Previous",
  nextPage: "Next",
  pickerEmpty: "Nothing found",
  close: "Close",
  add: "Add",
  detailLink: "Details",
  recentSetsTitle: "Recent sets",
  recentSetsEmpty: "No data yet.",
  dateLabel: "Date",
  statsTitle: "Stats",
  statsVolume: "Volume",
  statsBestE1rm: "Estimated 1RM",
  statsBestWeight: "Best weight",
  statsBestSet: "Best set",
  statsWeekly: "Sets this week",
  noStats: "No data yet.",
  historyEyebrow: "Log",
  historyTitle: "Workout history",
  historyLede: "See what you lifted each week. Past workouts are read-only.",
  historyLoading: "Loading the history…",
  historyErrorTitle: "The history did not load",
  historyPreviewEyebrow: "Selected workout",
  today: "Today",
  prevMonth: "Previous month",
  nextMonth: "Next month",
  calendarLabel: "Workout calendar",
  calendarWorkoutMark: "workout",
  monthWorkoutsTitle: "Workouts this month",
  sortNewest: "Newest first",
  sortOldest: "Oldest first",
  sortOrderLabel: "Change workout order",
  monthEmptyTitle: "No workouts",
  monthEmptyText: "No workouts in this month yet.",
  noWorkoutOnDay: "No workout on this day.",
  openToday: "Open today's workout",
  pickDay: "Pick a day in the calendar.",
  exerciseCount: (count) => `${count} ${count === 1 ? "exercise" : "exercises"}`,
  setCount: (count) => `${count} ${count === 1 ? "set" : "sets"}`,
  muscle: {
    chest: "Chest",
    back: "Back",
    shoulders: "Shoulders",
    biceps: "Biceps",
    triceps: "Triceps",
    legs: "Legs",
    core: "Core",
  },
  muscleFine: {
    chest: "chest",
    back: "back",
    shoulders: "shoulders",
    biceps: "biceps",
    triceps: "triceps",
    quads: "quads",
    hamstrings: "hamstrings",
    glutes: "glutes",
    calves: "calves",
    core: "core",
    grip: "grip",
  },
  equipment: {
    barbell: "Barbell",
    dumbbell: "Dumbbells",
    cable: "Cable",
    machine: "Machine",
    "body only": "Bodyweight",
    "e-z curl bar": "EZ bar",
    other: "Accessory",
  },
  level: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
  },
};

export const dictionaries: Record<Language, Dictionary> = { cs, en };
