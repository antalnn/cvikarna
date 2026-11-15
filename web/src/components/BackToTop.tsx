import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/useLanguage";

const SHOW_AFTER = 400;

/**
 * One floating way back to the top. The footer is the floor: the button lifts
 * as the footer scrolls in, so it never sits on top of the footer text. Rising
 * is instant, because a lagging lift would overlap the footer; falling eases,
 * because a lifted button dropping to its base must not snap.
 *
 * The lift is written straight to the node inside the scroll handler. A React
 * state round trip lands a frame late, which paints the button inside the
 * footer for one frame while scrolling.
 */
export function BackToTop() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previousLift = useRef(0);

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>(".site-footer");

    const update = () => {
      setVisible(window.scrollY > SHOW_AFTER);

      const button = buttonRef.current;

      if (!footer || !button) {
        return;
      }

      // The button stays on screen even if a very tall footer scrolls in.
      const limit = Math.max(0, window.innerHeight - 88);
      const overlap = window.innerHeight - footer.getBoundingClientRect().top;
      const next = Math.max(0, Math.min(overlap, limit));

      button.style.setProperty("--lift", `${next}px`);
      button.classList.toggle("is-dropping", next < previousLift.current);
      previousLift.current = next;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const observer = footer ? new ResizeObserver(update) : null;
    if (footer && observer) {
      observer.observe(footer);
    }

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      className={visible ? "back-to-top is-visible" : "back-to-top"}
      type="button"
      aria-label={t.backToTop}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      title={t.backToTop}
      onClick={() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
