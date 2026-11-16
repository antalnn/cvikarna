import { useCallback, useContext } from "react";
import { AppContext } from "./context";

export function useApp() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("useApp must be used inside AppProvider.");
  }
  return value;
}

export function useToast() {
  const { toast } = useApp();
  return useCallback(toast, [toast]);
}
