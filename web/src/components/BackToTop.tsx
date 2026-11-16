import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { useLanguage } from "../i18n/useLanguage";

/**
 * The library's way back to the top. It appears only after a screenful, sits
 * clear of the tab bar on narrow screens, and lifts above the footer instead of
 * covering it. Reduced motion returns instantly.
 */
export function BackToTop() {
  const { tx } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const footer = document.querySelector(".site-footer");

    const sync = () => {
      setVisible(window.scrollY > 520);
      if (!footer) {
        setLift(0);
        return;
      }
      const overlap = window.innerHeight - footer.getBoundingClientRect().top;
      setLift(Math.max(0, Math.min(overlap, window.innerHeight - 96)));
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return createPortal(
    <button
      className={`totop${visible ? " is-on" : ""}`}
      type="button"
      aria-label={tx("Zpět nahoru", "Back to top")}
      title={tx("Zpět nahoru", "Back to top")}
      style={{ "--lift": `${Math.round(lift)}px` } as CSSProperties}
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }}
    >
      <Icon name="i-arrow" className="ico" style={{ transform: "rotate(-90deg)" }} />
    </button>,
    document.body,
  );
}

