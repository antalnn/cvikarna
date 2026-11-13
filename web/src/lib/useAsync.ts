import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: unknown };

/**
 * Loads once per memoized loader and exposes a retry counter.
 * The caller passes a useCallback loader so the dependency list stays honest.
 */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setState({ status: "loading" });

    load().then(
      (data) => {
        if (live) {
          setState({ status: "success", data });
        }
      },
      (error: unknown) => {
        if (live) {
          setState({ status: "error", error });
        }
      },
    );

    return () => {
      live = false;
    };
  }, [load, attempt]);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
