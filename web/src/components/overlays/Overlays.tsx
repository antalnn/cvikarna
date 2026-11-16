import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Icon } from "../Icon";
import { createPortal } from "react-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { useApp } from "../../state/useApp";
import { formatClock } from "../../lib/format";

type Align = "start" | "end" | "center";

interface PopoverProps {
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  className: string;
  children: ReactNode;
  role?: string;
  label?: string;
  align?: Align;
  gap?: number;
  side?: "below" | "above";
  restoreFocus?: boolean;
  closeOnScroll?: boolean;
}

/**
 * One anchored surface for the confirm, menu, tip and rest popovers. It opens
 * under the control that asked, flips above when it would leave the viewport,
 * closes on Escape, an outside click, a scroll or a resize, and returns focus.
 */
export function Popover({
  anchor,
  open,
  onClose,
  className,
  children,
  role,
  label,
  align = "start",
  gap = 8,
  side = "below",
  restoreFocus = true,
  closeOnScroll = true,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const anchorRef = useRef<HTMLElement | null>(anchor);
  anchorRef.current = anchor;

  useLayoutEffect(() => {
    if (!open || !anchor || !panelRef.current) {
      setPosition(null);
      return;
    }

    const place = () => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      const rect = anchor.getBoundingClientRect();
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      let left =
        align === "end"
          ? rect.right - width
          : align === "center"
            ? rect.left + rect.width / 2 - width / 2
            : rect.left;
      left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
      const above = rect.top - height - gap;
      const below = rect.bottom + gap;
      let top = side === "above" ? above : below;
      if (top < 12) {
        top = below;
      }
      if (top + height > window.innerHeight - 12) {
        top = Math.max(12, above);
      }
      setPosition({ left, top });
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [align, anchor, gap, open, side]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) {
        return;
      }
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    const onScroll = () => onClose();

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    if (closeOnScroll) {
      document.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onScroll);
    }
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [closeOnScroll, onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const panel = panelRef.current;
    const first =
      panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>("button, input, select, a[href]");
    first?.focus({ preventScroll: true });
    if (!restoreFocus) {
      return;
    }
    const restore = anchor;
    return () => {
      if (restore && document.contains(restore)) {
        restore.focus({ preventScroll: true });
      }
    };
  }, [anchor, open, restoreFocus]);

  if (!open || !anchor) {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      className={className}
      role={role}
      aria-label={label}
      style={{
        position: "fixed",
        left: position?.left ?? 0,
        top: position?.top ?? 0,
        visibility: position ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

export function ConfirmPopover() {
  const { tx } = useLanguage();
  const { confirm, closeConfirm, runConfirm } = useApp();

  return (
    <Popover
      anchor={confirm?.anchor ?? null}
      open={confirm !== null}
      onClose={closeConfirm}
      className="confirmpop"
      role="dialog"
      align="end"
    >
      {confirm ? (
        <>
          <p className="confirmpop__title">{confirm.title}</p>
          <p className="confirmpop__text">{confirm.text}</p>
          <div className="confirmpop__actions">
            <button className="btn btn--quiet btn--sm" type="button" onClick={closeConfirm}>
              {tx("Zrušit", "Cancel")}
            </button>
            <button className="btn btn--primary btn--sm" type="button" data-autofocus onClick={runConfirm}>
              {confirm.label}
            </button>
          </div>
        </>
      ) : null}
    </Popover>
  );
}

export function MenuPopover() {
  const { menu, closeMenu } = useApp();
  const { tx } = useLanguage();

  return (
    <Popover
      anchor={menu?.anchor ?? null}
      open={menu !== null}
      onClose={closeMenu}
      className="menu"
      role="menu"
      label={tx("Možnosti", "Options")}
      align="end"
      gap={6}
    >
      {menu
        ? menu.items.map((item) => (
            <button
              key={item.label}
              className="menu__item"
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu();
                item.run();
              }}
            >
              {item.label}
            </button>
          ))
        : null}
    </Popover>
  );
}

export function TipPopover() {
  const { tip, closeTip } = useApp();
  return (
    <Popover
      anchor={tip?.anchor ?? null}
      open={tip !== null}
      onClose={closeTip}
      className="tip"
      role="tooltip"
      align="center"
      side="above"
      gap={8}
      restoreFocus={false}
    >
      {tip?.text}
    </Popover>
  );
}

export function Toasts() {
  const { toastMessage } = useApp();
  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toastMessage ? (
        <div className={`toast${toastMessage.tone === "danger" ? " toast--danger" : ""}`}>
          <Icon name={toastMessage.tone === "danger" ? "i-info" : "i-check"} className="ico ico--sm" />
          <span>{toastMessage.message}</span>
        </div>
      ) : null}
    </div>
  );
}

export function RestChip() {
  const { tx } = useLanguage();
  const { restTimer, pauseRest, resumeRest, addRest, stopRest, hideRest, today, catalogue } = useApp();
  const item = today?.exercises.find((row) => row.exerciseId === restTimer.exId);
  const row = restTimer.exId ? catalogue.find((entry) => entry.id === restTimer.exId) : undefined;
  const name = item
    ? tx(item.nameCs ?? item.nameEn, item.nameEn)
    : row
      ? tx(row.nameCs ?? row.nameEn, row.nameEn)
      : tx("Bez cviku", "No movement");

  if (!restTimer.visible) {
    return null;
  }

  const ratio = restTimer.total > 0 ? Math.max(0, restTimer.left) / restTimer.total : 0;
  const style = { "--p": ratio.toFixed(3) } as CSSProperties;

  return (
    <div
      className={`rest${restTimer.done ? " is-done" : ""}${!restTimer.done && restTimer.running ? " is-running" : ""}${!restTimer.done && !restTimer.running ? " is-paused" : ""}`}
    >
      <div className="rest__ring" aria-hidden="true">
        <svg viewBox="0 0 44 44">
          <circle className="rest__track" cx="22" cy="22" r="19" />
          <circle className="rest__prog" cx="22" cy="22" r="19" style={style} />
        </svg>
        <span className="rest__time">{restTimer.done ? "0:00" : formatClock(restTimer.left)}</span>
      </div>
      <div className="rest__copy">
        <span className="micro rest__state">
          <span className="rest__dot" aria-hidden="true" />
          {restTimer.done
            ? tx("Pauza skončila", "Rest over")
            : restTimer.running
              ? tx("Pauza běží", "Rest running")
              : tx("Pauza pozastavena", "Rest paused")}
        </span>
        <span className="rest__hint">{restTimer.done ? tx("Další série", "Next set") : name}</span>
      </div>
      <div className="rest__actions">
        <button
          className={`iconbtn rest__toggle ${restTimer.running ? "is-running" : "is-paused"}`}
          type="button"
          hidden={restTimer.done}
          aria-label={
            restTimer.running
              ? tx("Pozastavit pauzu", "Pause the rest")
              : tx("Pokračovat v pauze", "Resume the rest")
          }
          title={restTimer.running ? tx("Pozastavit pauzu", "Pause the rest") : tx("Pokračovat v pauze", "Resume the rest")}
          onClick={() => (restTimer.running ? pauseRest() : resumeRest())}
        >
          <Icon name={restTimer.running ? "i-pause" : "i-play"} />
        </button>
        <button
          className="iconbtn"
          type="button"
          hidden={restTimer.done}
          aria-label={tx("Přidat 15 sekund", "Add 15 seconds")}
          onClick={() => addRest(15)}
        >
          <span className="rest__plus num">+15</span>
        </button>
        <button
          className="iconbtn"
          type="button"
          aria-label={restTimer.done ? tx("Zavřít oznámení", "Dismiss") : tx("Přeskočit pauzu", "Skip the rest")}
          onClick={() => (restTimer.done ? hideRest() : stopRest())}
        >
          <Icon name="i-x" />
        </button>
      </div>
    </div>
  );
}

const PRESETS = [60, 90, 120, 180];

export function RestPopover({
  anchor,
  open,
  onClose,
  exerciseId,
}: {
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  exerciseId: number | null;
}) {
  const { tx } = useLanguage();
  const { rest, restValue, setRestValue, updateRest, playChime, buzz, today, catalogue } = useApp();
  const [tab, setTab] = useState<"time" | "alerts">("time");

  const item = exerciseId ? today?.exercises.find((row) => row.exerciseId === exerciseId) : undefined;
  const cat = exerciseId ? catalogue.find((row) => row.id === exerciseId) : undefined;
  const name = item
    ? tx(item.nameCs ?? item.nameEn, item.nameEn)
    : cat
      ? tx(cat.nameCs ?? cat.nameEn, cat.nameEn)
      : tx("Všechny cviky", "All movements");
  const current = restValue(exerciseId);

  return (
    <Popover
      anchor={anchor}
      open={open}
      onClose={onClose}
      className="restpop"
      role="dialog"
      label={tx("Nastavení pauzy", "Rest settings")}
      align="end"
      gap={8}
      closeOnScroll={false}
    >
      <div className="sheet__tabs restpop__tabs" role="tablist" aria-label={tx("Nastavení pauzy", "Rest settings")}>
        <button
          className="shtab"
          type="button"
          role="tab"
          aria-selected={tab === "time"}
          onClick={() => setTab("time")}
        >
          {tx("Čas", "Time")}
        </button>
        <button
          className="shtab"
          type="button"
          role="tab"
          aria-selected={tab === "alerts"}
          onClick={() => setTab("alerts")}
        >
          {tx("Zvuk", "Sound")}
        </button>
      </div>
      <p className="micro">{tx("Pauza pro cvik", "Rest for this movement")}</p>
      <p className="restpop__name">{name}</p>

      {tab === "time" ? (
        <>
          <div className="restpop__presets">
            {PRESETS.map((seconds) => (
              <button
                key={seconds}
                className="chip chip--sm"
                type="button"
                aria-pressed={current === seconds}
                onClick={() => setRestValue(exerciseId, seconds)}
              >
                {seconds} s
              </button>
            ))}
          </div>
          <label className="restpop__custom">
            <span>{tx("Vlastní", "Custom")}</span>
            <input
              type="number"
              min={5}
              max={900}
              step={5}
              inputMode="numeric"
              value={current}
              onChange={(event) => setRestValue(exerciseId, Number(event.target.value))}
            />
          </label>
          <label className="restpop__uniform">
            <input
              type="checkbox"
              className="switch__input"
              checked={rest.uniform}
              onChange={(event) => {
                if (event.target.checked) {
                  updateRest({ uniform: true, uniformValue: current });
                } else {
                  updateRest({ uniform: false });
                }
              }}
            />
            <span className="switch" aria-hidden="true">
              <Icon name="i-check" />
            </span>
            <span>{tx("Stejná pauza pro všechny cviky", "Same rest for every movement")}</span>
          </label>
          <label className="restpop__uniform">
            <input
              type="checkbox"
              className="switch__input"
              checked={rest.auto}
              onChange={(event) => updateRest({ auto: event.target.checked })}
            />
            <span className="switch" aria-hidden="true">
              <Icon name="i-check" />
            </span>
            <span>{tx("Spouštět pauzu po zaškrtnutí série", "Start a rest when a set is checked")}</span>
          </label>
        </>
      ) : (
        <>
          <label className="restpop__uniform">
            <input
              type="checkbox"
              className="switch__input"
              checked={rest.sound}
              onChange={(event) => {
                updateRest({ sound: event.target.checked });
                if (event.target.checked) {
                  playChime(true);
                }
              }}
            />
            <span className="switch" aria-hidden="true">
              <Icon name="i-check" />
            </span>
            <span>{tx("Přehrát zvuk na konci pauzy", "Play a sound when the rest ends")}</span>
          </label>
          <label className="restpop__volume">
            <span className="micro">{tx("Hlasitost", "Volume")}</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              aria-label={tx("Hlasitost zvuku", "Sound volume")}
              value={Math.round(Number(rest.volume) * 100)}
              onChange={(event) => updateRest({ volume: Number(event.target.value) / 100 })}
              onPointerUp={() => playChime(true)}
            />
            <span className="num">{Math.round(Number(rest.volume) * 100)} %</span>
          </label>
          {typeof navigator.vibrate === "function" ? (
            <label className="restpop__uniform">
              <input
                type="checkbox"
                className="switch__input"
                checked={rest.vibrate}
                onChange={(event) => {
                  updateRest({ vibrate: event.target.checked });
                  if (event.target.checked) {
                    buzz(true);
                  }
                }}
              />
              <span className="switch" aria-hidden="true">
                <Icon name="i-check" />
              </span>
              <span>{tx("Zavibrovat na konci pauzy", "Vibrate when the rest ends")}</span>
            </label>
          ) : null}
          <div className="restpop__actions">
            <button
              className="btn btn--quiet btn--sm"
              type="button"
              onClick={() => {
                playChime(true);
                buzz(true);
              }}
            >
              {tx("Vyzkoušet", "Test")}
            </button>
          </div>
        </>
      )}
    </Popover>
  );
}

