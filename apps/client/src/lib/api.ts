import type { ZodType } from 'zod';
import { errorResponseSchema } from '@ys/contracts';

// Fall back to the server's default dev port so a fresh checkout works without a
// local .env (Vite does not load .env.example).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/** Error thrown for non-2xx responses, carrying the server's envelope. */
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Turn a non-2xx response's body into an `ApiError` using the server envelope,
 * falling back to a status-based message when the body isn't the expected shape. */
function toApiError(status: number, body: unknown): ApiError {
  const parsed = errorResponseSchema.safeParse(body);
  const message = parsed.success ? parsed.data.message : `Request failed with status ${status}`;
  return new ApiError(status, message);
}

/**
 * The single transport for every client → server call. On a non-2xx response it
 * surfaces the server's `ErrorResponse` envelope as an `ApiError`. React Query
 * handles retries/loading/error state on top of this; feature `api/` modules
 * build their typed calls on top of it.
 *
 * Pass a Zod `schema` for routes that return a body: the success body is parsed
 * against it, so a server/client contract mismatch throws here instead of
 * leaking a wrongly-typed value into the app. Omit the schema for bodyless
 * routes (e.g. a `204` from DELETE) — nothing is read and the call resolves to
 * `void`.
 */
export function request<T>(path: string, schema: ZodType<T>, init?: RequestInit): Promise<T>;
export function request(path: string, schema?: undefined, init?: RequestInit): Promise<void>;
export async function request<T>(
  path: string,
  schema?: ZodType<T>,
  init?: RequestInit,
): Promise<T | void> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    // Only declare a JSON content-type when we're actually sending a body — a
    // bodyless request (e.g. DELETE) with this header is rejected by the server.
    headers: {
      ...(init?.body != null ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => undefined);
    throw toApiError(res.status, body);
  }

  if (!schema) {
    return;
  }

  const body: unknown = await res.json().catch(() => undefined);
  return schema.parse(body);
}
