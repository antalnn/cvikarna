import { useEffect, useState } from "react";

/**
 * A local one-second tick for the session clock. The app provider holds the
 * start timestamp and changes only when the clock starts or resets, so a
 * running clock does not re-render the catalogue or the dashboard every second.
 */
export function useClockElapsed(startedAt: number | null): number {
  const [elapsed, setElapsed] = useState(() =>
    startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0,
  );

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return elapsed;
}
