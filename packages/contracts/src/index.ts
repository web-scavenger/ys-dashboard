/**
 * Shared API contracts between server and client.
 *
 * Single source of truth: each payload is defined once as a Zod schema and the
 * TypeScript type is inferred from it. The server validates/serializes its
 * routes against these schemas and the client parses its responses with them,
 * so the two cannot drift. Widget/entity schemas will be added here in the
 * feature phase (e.g. a `z.discriminatedUnion` over the widget types).
 */
import { z } from 'zod';

export const helloResponseSchema = z.object({
  message: z.string(),
});

export type HelloResponse = z.infer<typeof helloResponseSchema>;

/**
 * Uniform error envelope returned by the server's global error handler. The
 * client can rely on this shape for every non-2xx response.
 */
export const errorResponseSchema = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
