/**
 * One fetch wrapper for the whole app: JSON in, typed value out, and the two
 * error shapes the pages care about. A 404 becomes NotFoundError so the detail
 * page can show its own state; everything else becomes ApiError with the
 * ProblemDetails text and field errors when the API sends them.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("The API did not answer. Is it running?", 0);
  }

  if (response.status === 404) {
    throw new NotFoundError(`Not found: ${path}`);
  }

  if (!response.ok) {
    let problem: ProblemDetails | null = null;
    try {
      problem = (await response.json()) as ProblemDetails;
    } catch {
      // A non-JSON error body is still an error; fall back to the status.
    }

    throw new ApiError(
      problem?.detail ?? problem?.title ?? `The API answered ${response.status}.`,
      response.status,
      problem?.errors ?? {},
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getJson<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function postJson<T>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method: "POST" };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  return request<T>(path, init);
}

export function deleteJson(path: string): Promise<void> {
  return request<void>(path, { method: "DELETE" });
}

export function putJson<T>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method: "PUT" };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  return request<T>(path, init);
}
