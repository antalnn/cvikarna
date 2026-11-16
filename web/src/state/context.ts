import { createContext } from "react";
import type { AppValue } from "./AppProvider";

export const AppContext = createContext<AppValue | null>(null);
