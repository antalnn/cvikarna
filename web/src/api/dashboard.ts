import { getJson, putJson } from "./client";
import type { Dashboard, RestSettings } from "./types";

export function fetchDashboard(): Promise<Dashboard> {
  return getJson<Dashboard>("/api/dashboard");
}

export function fetchRestSettings(): Promise<RestSettings> {
  return getJson<RestSettings>("/api/settings/rest");
}

export function saveRestSettings(settings: RestSettings): Promise<RestSettings> {
  return putJson<RestSettings>("/api/settings/rest", settings);
}
