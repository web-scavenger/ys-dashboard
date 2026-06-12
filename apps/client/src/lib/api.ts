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

/**
 * Thin typed fetch wrapper. On a non-2xx response it surfaces the server's
 * `ErrorResponse` envelope as an `ApiError`. On success it validates the body
 * against the route's Zod schema, so a server/client contract mismatch throws
 * here instead of leaking a wrongly-typed value into the app. React Query
 * handles retries/loading/error state on top of this. Feature `api/` modules
 * build their typed calls on top of this transport.
 */
export async function request<T>(
  path: string,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...init,
  });

  const body: unknown = await res.json().catch(() => undefined);

  if (!res.ok) {
    const parsed = errorResponseSchema.safeParse(body);
    const message = parsed.success
      ? parsed.data.message
      : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return schema.parse(body);
}
