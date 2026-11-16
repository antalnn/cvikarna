import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchAllCatalogue, fetchExercise, fetchExercises, removeSavedExercise, saveExercise } from "../api/library";
import { fetchDashboard, fetchRestSettings, saveRestSettings } from "../api/dashboard";
import {
  addSet,
  addWorkoutExercise,
  copyWorkout,
  fetchWorkoutSummaries,
  openTodayWorkout,
  removeSet,
  removeWorkout,
  removeWorkoutExercise,
  renameWorkout,
  setCompleted,
  type NewSet,
} from "../api/workout";
import type {
  CatalogueRow,
  Dashboard,
  Exercise,
  LoggedSet,
  RestSettings,
  Workout,
  WorkoutSummary,
} from "../api/types";
import { AppContext } from "./context";
import { useLanguage } from "../i18n/useLanguage";

export type LoadPhase = "loading" | "ready" | "error";
export type DemoState = "populated" | "loading" | "empty" | "error" | "edge";
export type ToastTone = "default" | "danger";

export interface ToastMessage {
  message: string;
  tone: ToastTone;
}

export interface RestTimerState {
  left: number;
  total: number;
  running: boolean;
  done: boolean;
  visible: boolean;
  exId: number | null;
}

export type SheetState =
  | { kind: "add" }
  | { kind: "copy" }
  | { kind: "ex"; exerciseId: number }
  | null;

export interface ConfirmRequest {
  title: string;
  text: string;
  label: string;
  run: () => void;
  anchor: HTMLElement | null;
}

export interface MenuItem {
  label: string;
  run: () => void;
}

export interface MenuRequest {
  items: MenuItem[];
  anchor: HTMLElement;
}

export interface TipRequest {
  text: string;
  anchor: HTMLElement;
}

export interface ClockState {
  startedAt: number | null;
  paused: boolean;
}

export interface AppValue {
  demoState: DemoState;

  today: Workout | null;
  todayPhase: LoadPhase;
  todayError: string | null;
  refreshToday: () => Promise<void>;

  library: Exercise[];
  libraryPhase: LoadPhase;
  libraryError: string | null;
  refreshLibrary: () => Promise<void>;
  savedIds: Set<number>;
  toggleSaved: (exerciseId: number) => Promise<boolean>;

  catalogue: CatalogueRow[];
  cataloguePhase: LoadPhase;
  catalogueError: string | null;
  refreshCatalogue: () => Promise<void>;

  dashboard: Dashboard | null;
  dashboardPhase: LoadPhase;
  dashboardError: string | null;
  refreshDashboard: () => Promise<void>;

  summaries: WorkoutSummary[];
  summariesPhase: LoadPhase;
  summariesError: string | null;
  refreshSummaries: () => Promise<void>;

  rest: RestSettings;
  restValue: (exerciseId: number | null) => number;
  setRestValue: (exerciseId: number | null, seconds: number) => void;
  updateRest: (patch: Partial<RestSettings>) => void;

  addExercise: (exerciseId: number) => Promise<boolean>;
  removeExercise: (itemId: number) => Promise<void>;
  logSet: (itemId: number, input: NewSet) => Promise<LoggedSet | null>;
  toggleSet: (setId: number, completed: boolean) => Promise<boolean>;
  deleteSet: (setId: number) => Promise<void>;
  renameSession: (name: string) => Promise<void>;
  copyFrom: (sourceWorkoutId: number) => Promise<boolean>;
  copying: boolean;
  deleteWorkout: (workoutId: number) => Promise<boolean>;
  finishSession: () => void;

  clock: ClockState;
  startClock: () => void;
  resetClock: () => void;
  ensureClock: () => void;

  restTimer: RestTimerState;
  startRest: (seconds: number, exerciseId: number | null) => void;
  pauseRest: () => void;
  resumeRest: () => void;
  addRest: (seconds: number) => void;
  stopRest: () => void;
  hideRest: () => void;
  playChime: (force?: boolean) => void;
  buzz: (force?: boolean) => void;

  toast: (message: string, tone?: ToastTone, ms?: number) => void;
  toastMessage: ToastMessage | null;
  announce: (message: string) => void;
  liveMessage: string;

  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;

  sheet: SheetState;
  openSheet: (sheet: NonNullable<SheetState>) => void;
  closeSheet: () => void;

  confirm: ConfirmRequest | null;
  askConfirm: (request: Omit<ConfirmRequest, "anchor">, anchor: HTMLElement | null) => void;
  closeConfirm: () => void;
  runConfirm: () => void;

  menu: MenuRequest | null;
  openMenu: (anchor: HTMLElement, items: MenuItem[]) => void;
  closeMenu: () => void;

  tip: TipRequest | null;
  openTip: (anchor: HTMLElement, text: string) => void;
  closeTip: () => void;
}

const CLOCK_KEY = "cvikarna.clock";
const DEFAULT_REST: RestSettings = {
  uniform: false,
  uniformValue: 90,
  auto: true,
  sound: true,
  volume: 0.6,
  vibrate: true,
  values: {},
};

function loadClock(): ClockState {
  try {
    const raw = JSON.parse(localStorage.getItem(CLOCK_KEY) ?? "null") as
      | { startedAt?: number; paused?: boolean }
      | null;
    return {
      startedAt: Number(raw?.startedAt) > 0 ? Number(raw?.startedAt) : null,
      paused: raw?.paused === true,
    };
  } catch {
    return { startedAt: null, paused: false };
  }
}

function saveClock(clock: ClockState) {
  try {
    localStorage.setItem(CLOCK_KEY, JSON.stringify(clock));
  } catch {
    // Storage blocked: the clock still runs for this page.
  }
}

function readDemoState(): DemoState {
  const value = new URLSearchParams(location.search).get("state");
  return value === "loading" || value === "empty" || value === "error" || value === "edge"
    ? value
    : "populated";
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "The API did not answer.";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { tx } = useLanguage();
  const [demoState] = useState<DemoState>(readDemoState);

  const [today, setToday] = useState<Workout | null>(null);
  const [todayPhase, setTodayPhase] = useState<LoadPhase>("loading");
  const [todayError, setTodayError] = useState<string | null>(null);

  const [library, setLibrary] = useState<Exercise[]>([]);
  const [libraryPhase, setLibraryPhase] = useState<LoadPhase>("loading");
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const [catalogue, setCatalogue] = useState<CatalogueRow[]>([]);
  const [cataloguePhase, setCataloguePhase] = useState<LoadPhase>("loading");
  const [catalogueError, setCatalogueError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [dashboardPhase, setDashboardPhase] = useState<LoadPhase>("loading");
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [summaries, setSummaries] = useState<WorkoutSummary[]>([]);
  const [summariesPhase, setSummariesPhase] = useState<LoadPhase>("loading");
  const [summariesError, setSummariesError] = useState<string | null>(null);

  const [rest, setRest] = useState<RestSettings>(DEFAULT_REST);
  const restRef = useRef(rest);
  restRef.current = rest;

  const [clock, setClock] = useState<ClockState>(loadClock);

  const [restTimer, setRestTimer] = useState<RestTimerState>({
    left: 0,
    total: 0,
    running: false,
    done: false,
    visible: false,
    exId: null,
  });

  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const liveTimer = useRef<number | null>(null);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [menu, setMenu] = useState<MenuRequest | null>(null);
  const [tip, setTip] = useState<TipRequest | null>(null);

  const audioRef = useRef<AudioContext | null>(null);
  const restHideTimer = useRef<number | null>(null);

  const toast = useCallback((message: string, tone: ToastTone = "default", ms = 3200) => {
    if (toastTimer.current !== null) {
      window.clearTimeout(toastTimer.current);
    }
    setToastMessage({ message, tone });
    toastTimer.current = window.setTimeout(() => setToastMessage(null), ms);
  }, []);

  const announce = useCallback((message: string) => {
    if (liveTimer.current !== null) {
      window.clearTimeout(liveTimer.current);
    }
    setLiveMessage("");
    liveTimer.current = window.setTimeout(() => setLiveMessage(message), 40);
  }, []);

  const refreshToday = useCallback(async () => {
    setTodayPhase("loading");
    setDashboardPhase("loading");
    try {
      const data = await fetchDashboard();
      setDashboard(data);
      setToday(data.today);
      setTodayError(null);
      setTodayPhase("ready");
      setDashboardError(null);
      setDashboardPhase("ready");
    } catch (error) {
      setTodayError(errorText(error));
      setTodayPhase("error");
      setDashboardError(errorText(error));
      setDashboardPhase("error");
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await fetchDashboard();
      setDashboard(data);
      setDashboardError(null);
      setDashboardPhase("ready");
    } catch (error) {
      setDashboardError(errorText(error));
      setDashboardPhase("error");
    }
  }, []);

  const refreshLibrary = useCallback(async () => {
    setLibraryPhase("loading");
    try {
      const rows = await fetchExercises({ muscle: "all", equipment: "all", level: "all", q: "" });
      setLibrary(rows);
      setLibraryError(null);
      setLibraryPhase("ready");
    } catch (error) {
      setLibraryError(errorText(error));
      setLibraryPhase("error");
    }
  }, []);

  const refreshCatalogue = useCallback(async () => {
    setCataloguePhase("loading");
    try {
      const rows = await fetchAllCatalogue();
      setCatalogue(rows);
      setCatalogueError(null);
      setCataloguePhase("ready");
    } catch (error) {
      setCatalogueError(errorText(error));
      setCataloguePhase("error");
    }
  }, []);

  const refreshSummaries = useCallback(async () => {
    setSummariesPhase("loading");
    try {
      const rows = await fetchWorkoutSummaries();
      setSummaries(rows);
      setSummariesError(null);
      setSummariesPhase("ready");
    } catch (error) {
      setSummariesError(errorText(error));
      setSummariesPhase("error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const results = await Promise.allSettled([
        fetchDashboard(),
        fetchExercises({ muscle: "all", equipment: "all", level: "all", q: "" }),
        fetchAllCatalogue(),
        fetchWorkoutSummaries(),
        fetchRestSettings(),
      ] as const);

      if (cancelled) {
        return;
      }

      const [dashboardResult, libraryResult, catalogueResult, summariesResult, restResult] = results;

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value);
        setToday(dashboardResult.value.today);
        setTodayPhase("ready");
        setDashboardPhase("ready");
      } else {
        setTodayError(errorText(dashboardResult.reason));
        setTodayPhase("error");
        setDashboardError(errorText(dashboardResult.reason));
        setDashboardPhase("error");
      }

      if (libraryResult.status === "fulfilled") {
        setLibrary(libraryResult.value);
        setLibraryPhase("ready");
      } else {
        setLibraryError(errorText(libraryResult.reason));
        setLibraryPhase("error");
      }

      if (catalogueResult.status === "fulfilled") {
        setCatalogue(catalogueResult.value);
        setCataloguePhase("ready");
      } else {
        setCatalogueError(errorText(catalogueResult.reason));
        setCataloguePhase("error");
      }

      if (summariesResult.status === "fulfilled") {
        setSummaries(summariesResult.value);
        setSummariesPhase("ready");
      } else {
        setSummariesError(errorText(summariesResult.reason));
        setSummariesPhase("error");
      }

      if (restResult.status === "fulfilled") {
        setRest(restResult.value);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) {
        window.clearTimeout(toastTimer.current);
      }
      if (liveTimer.current !== null) {
        window.clearTimeout(liveTimer.current);
      }
      if (restHideTimer.current !== null) {
        window.clearTimeout(restHideTimer.current);
      }
    },
    [],
  );

  const savedIds = useMemo(() => new Set(library.map((row) => row.id)), [library]);

  const toggleSaved = useCallback(
    async (exerciseId: number) => {
      const wasSaved = savedIds.has(exerciseId);

      try {
        if (wasSaved) {
          await removeSavedExercise(exerciseId);
        } else {
          await saveExercise(exerciseId);
        }

        setCatalogue((rows) =>
          rows.map((row) => (row.id === exerciseId ? { ...row, isLibrary: !wasSaved } : row)),
        );

        if (wasSaved) {
          setLibrary((rows) => rows.filter((row) => row.id !== exerciseId));
        } else {
          // The library endpoint carries the full detail, so a newly saved
          // catalogue row gains its images and aliases without a skeleton.
          const savedRow = await fetchExercise(exerciseId);
          setLibrary((rows) => (rows.some((row) => row.id === exerciseId) ? rows : [...rows, savedRow]));
        }

        toast(
          wasSaved
            ? tx("Odebráno z knihovny", "Removed from the library")
            : tx("Uloženo do knihovny", "Saved to the library"),
        );
        return !wasSaved;
      } catch (error) {
        toast(errorText(error), "danger");
        return wasSaved;
      }
    },
    [savedIds, toast, tx],
  );

  const updateRest = useCallback(
    (patch: Partial<RestSettings>) => {
      const next = { ...restRef.current, ...patch };
      restRef.current = next;
      setRest(next);
      void saveRestSettings(next)
        .then((saved) => {
          restRef.current = saved;
          setRest(saved);
        })
        .catch((error: unknown) => toast(errorText(error), "danger"));
    },
    [toast],
  );

  const setRestValue = useCallback(
    (exerciseId: number | null, seconds: number) => {
      const value = Math.max(5, Math.min(900, Math.round(Number(seconds) || 90)));
      const current = restRef.current;

      if (current.uniform || !exerciseId) {
        updateRest({ uniformValue: value });
        return;
      }

      updateRest({ values: { ...current.values, [String(exerciseId)]: value } });
    },
    [updateRest],
  );

  const restValue = useCallback(
    (exerciseId: number | null) => {
      if (restRef.current.uniform) {
        return restRef.current.uniformValue;
      }
      const own = exerciseId ? restRef.current.values[String(exerciseId)] : 0;
      return own && own > 0 ? own : 90;
    },
    [],
  );

  const addExercise = useCallback(
    async (exerciseId: number) => {
      try {
        let workout = today;
        if (!workout) {
          workout = await openTodayWorkout();
          setToday(workout);
          setTodayPhase("ready");
        }

        if (workout.exercises.some((item) => item.exerciseId === exerciseId)) {
          toast(tx("Cvik už v tréninku je", "That movement is already in the session"), "danger");
          return false;
        }

        const item = await addWorkoutExercise(workout.id, exerciseId);
        setToday((current) =>
          current && current.id === workout?.id
            ? { ...current, exercises: [...current.exercises, item] }
            : current,
        );
        toast(tx("Přidáno do tréninku", "Added to the session"));
        void refreshDashboard();
        return true;
      } catch (error) {
        toast(errorText(error), "danger");
        return false;
      }
    },
    [refreshDashboard, today, toast, tx],
  );

  const removeExercise = useCallback(
    async (itemId: number) => {
      if (!today) {
        return;
      }
      try {
        await removeWorkoutExercise(today.id, itemId);
        setToday({ ...today, exercises: today.exercises.filter((item) => item.id !== itemId) });
        toast(tx("Cvik odebrán", "Exercise removed"));
        void refreshDashboard();
      } catch (error) {
        toast(errorText(error), "danger");
      }
    },
    [refreshDashboard, today, toast, tx],
  );

  const logSet = useCallback(
    async (itemId: number, input: NewSet) => {
      if (!today) {
        return null;
      }
      try {
        const created = await addSet(today.id, itemId, input);
        setToday({
          ...today,
          exercises: today.exercises.map((item) =>
            item.id === itemId ? { ...item, sets: [...item.sets, created] } : item,
          ),
        });
        toast(tx("Série zapsaná", "Set logged"));
        void refreshDashboard();
        return created;
      } catch (error) {
        toast(errorText(error), "danger");
        return null;
      }
    },
    [refreshDashboard, today, toast, tx],
  );

  const toggleSet = useCallback(
    async (setId: number, completed: boolean) => {
      try {
        const updated = await setCompleted(setId, completed);
        setToday((current) =>
          current
            ? {
                ...current,
                exercises: current.exercises.map((item) => ({
                  ...item,
                  sets: item.sets.map((set) => (set.id === setId ? updated : set)),
                })),
              }
            : current,
        );
        void refreshDashboard();
        return true;
      } catch (error) {
        toast(errorText(error), "danger");
        return false;
      }
    },
    [refreshDashboard, toast, tx],
  );

  const deleteSet = useCallback(
    async (setId: number) => {
      try {
        await removeSet(setId);
        setToday((current) =>
          current
            ? {
                ...current,
                exercises: current.exercises.map((item) => ({
                  ...item,
                  sets: item.sets.filter((set) => set.id !== setId),
                })),
              }
            : current,
        );
        toast(tx("Série smazána", "Set deleted"));
        void refreshDashboard();
      } catch (error) {
        toast(errorText(error), "danger");
      }
    },
    [refreshDashboard, toast, tx],
  );

  const renameSession = useCallback(
    async (name: string) => {
      if (!today) {
        return;
      }
      try {
        const updated = await renameWorkout(today.id, name);
        setToday(updated);
        toast(tx("Trénink přejmenován", "Session renamed"));
        void refreshSummaries();
      } catch (error) {
        toast(errorText(error), "danger");
      }
    },
    [refreshSummaries, today, toast, tx],
  );

  const copyFrom = useCallback(
    async (sourceWorkoutId: number) => {
      if (!today) {
        return false;
      }
      setCopying(true);
      try {
        const copied = await copyWorkout(today.id, sourceWorkoutId);
        setToday(copied);
        toast(tx("Trénink zkopírován", "Workout copied"));
        void refreshDashboard();
        return true;
      } catch (error) {
        toast(errorText(error), "danger");
        return false;
      } finally {
        setCopying(false);
      }
    },
    [refreshDashboard, today, toast, tx],
  );

  const deleteWorkout = useCallback(
    async (workoutId: number) => {
      try {
        await removeWorkout(workoutId);
        if (today?.id === workoutId) {
          setToday(null);
        }
        toast(tx("Trénink smazán", "Session deleted"));
        void refreshSummaries();
        void refreshDashboard();
        return true;
      } catch (error) {
        toast(errorText(error), "danger");
        return false;
      }
    },
    [refreshDashboard, refreshSummaries, today, toast, tx],
  );

  const startClock = useCallback(() => {
    const next: ClockState = { startedAt: Date.now(), paused: false };
    setClock(next);
    saveClock(next);
  }, []);

  const resetClock = useCallback(() => {
    const next: ClockState = { startedAt: null, paused: true };
    setClock(next);
    saveClock(next);
  }, []);

  const ensureClock = useCallback(() => {
    if (clock.startedAt || clock.paused) {
      return;
    }
    startClock();
  }, [clock.paused, clock.startedAt, startClock]);

  const finishSession = useCallback(() => {
    resetClock();
    setRestTimer((current) => ({ ...current, running: false, visible: false, done: false }));
  }, [resetClock]);

  const soundContext = useCallback(() => {
    if (!window.AudioContext) {
      return null;
    }
    if (!audioRef.current) {
      audioRef.current = new AudioContext();
    }
    if (audioRef.current.state === "suspended") {
      void audioRef.current.resume();
    }
    return audioRef.current;
  }, []);

  const playChime = useCallback(
    (force = false) => {
      const current = restRef.current;
      if (!current.sound && !force) {
        return;
      }
      const ctx = soundContext();
      if (!ctx) {
        return;
      }
      const level = Math.max(0, Math.min(1, Number(current.volume))) * 0.25;
      if (level <= 0) {
        return;
      }
      const now = ctx.currentTime;
      [0, 0.24].forEach((offset, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = index ? 880 : 660;
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(level, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.26);
      });
    },
    [soundContext],
  );

  const buzz = useCallback((force = false) => {
    const current = restRef.current;
    if (!current.vibrate && !force) {
      return;
    }
    if (typeof navigator.vibrate !== "function") {
      return;
    }
    navigator.vibrate([120, 80, 120]);
  }, []);

  const hideRest = useCallback(() => {
    if (restHideTimer.current !== null) {
      window.clearTimeout(restHideTimer.current);
      restHideTimer.current = null;
    }
    setRestTimer((current) => ({
      ...current,
      visible: false,
      done: false,
      running: false,
      left: 0,
    }));
  }, []);

  const startRest = useCallback(
    (seconds: number, exerciseId: number | null) => {
      if (restHideTimer.current !== null) {
        window.clearTimeout(restHideTimer.current);
        restHideTimer.current = null;
      }
      void soundContext();
      const total = Math.max(5, Math.round(Number(seconds) || restValue(exerciseId)));
      setRestTimer({
        left: total,
        total,
        running: true,
        done: false,
        visible: true,
        exId: exerciseId,
      });
    },
    [restValue, soundContext],
  );

  const pauseRest = useCallback(() => {
    setRestTimer((current) => ({ ...current, running: false }));
  }, []);

  const resumeRest = useCallback(() => {
    setRestTimer((current) =>
      current.left > 0 && current.visible ? { ...current, running: true, done: false } : current,
    );
  }, []);

  const addRest = useCallback((seconds: number) => {
    setRestTimer((current) => {
      const left = Math.max(1, current.left + seconds);
      return { ...current, left, total: Math.max(current.total, left) };
    });
  }, []);

  const stopRest = useCallback(() => {
    setRestTimer((current) => ({
      ...current,
      running: false,
      done: false,
      visible: false,
      left: 0,
    }));
  }, []);

  useEffect(() => {
    if (!restTimer.running) {
      return;
    }
    const timer = window.setInterval(() => {
      setRestTimer((current) =>
        current.left > 0 ? { ...current, left: current.left - 1 } : current,
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restTimer.running]);

  useEffect(() => {
    if (!restTimer.running || restTimer.left > 0) {
      return;
    }
    setRestTimer((current) => ({ ...current, running: false, done: true }));
    playChime();
    buzz();
    toast(tx("Pauza skončila, jdeme na další sérii", "Rest over, start the next set"), "default", 6000);
    if (restHideTimer.current !== null) {
      window.clearTimeout(restHideTimer.current);
    }
    restHideTimer.current = window.setTimeout(hideRest, 6000);
  }, [buzz, hideRest, playChime, restTimer.left, restTimer.running, toast, tx]);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openSheet = useCallback((next: NonNullable<SheetState>) => setSheet(next), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const askConfirm = useCallback(
    (request: Omit<ConfirmRequest, "anchor">, anchor: HTMLElement | null) =>
      setConfirm({ ...request, anchor }),
    [],
  );
  const closeConfirm = useCallback(() => setConfirm(null), []);
  const runConfirm = useCallback(() => {
    const request = confirm;
    setConfirm(null);
    request?.run();
  }, [confirm]);

  const openMenu = useCallback(
    (anchor: HTMLElement, items: MenuItem[]) =>
      setMenu((current) => (current?.anchor === anchor ? null : { anchor, items })),
    [],
  );
  const closeMenu = useCallback(() => setMenu(null), []);

  const openTip = useCallback(
    (anchor: HTMLElement, text: string) => setTip({ anchor, text }),
    [],
  );
  const closeTip = useCallback(() => setTip(null), []);

  const value: AppValue = {
    demoState,
    today,
    todayPhase,
    todayError,
    refreshToday,
    library,
    libraryPhase,
    libraryError,
    refreshLibrary,
    savedIds,
    toggleSaved,
    catalogue,
    cataloguePhase,
    catalogueError,
    refreshCatalogue,
    dashboard,
    dashboardPhase,
    dashboardError,
    refreshDashboard,
    summaries,
    summariesPhase,
    summariesError,
    refreshSummaries,
    rest,
    restValue,
    setRestValue,
    updateRest,
    addExercise,
    removeExercise,
    logSet,
    toggleSet,
    deleteSet,
    renameSession,
    copyFrom,
    copying,
    deleteWorkout,
    finishSession,
    clock,
    startClock,
    resetClock,
    ensureClock,
    restTimer,
    startRest,
    pauseRest,
    resumeRest,
    addRest,
    stopRest,
    hideRest,
    playChime,
    buzz,
    toast,
    toastMessage,
    announce,
    liveMessage,
    paletteOpen,
    openPalette,
    closePalette,
    sheet,
    openSheet,
    closeSheet,
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
    menu,
    openMenu,
    closeMenu,
    tip,
    openTip,
    closeTip,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}


