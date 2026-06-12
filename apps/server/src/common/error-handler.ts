import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import type { ErrorResponse } from '@ys/contracts';
import { AppError } from './errors.js';

/** Short reason phrases for the status codes we emit. */
const REASON: Record<number, string> = {
  400: 'Bad Request',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

const reasonFor = (statusCode: number): string =>
  REASON[statusCode] ?? 'Error';

/**
 * Global error handler. Every thrown/returned error funnels through here and is
 * normalized into a single `ErrorResponse` envelope, so clients get a
 * consistent shape regardless of where the error originated:
 *
 *  - `AppError` subclasses  -> their own `statusCode` + message (domain errors)
 *  - Zod request-validation failures -> 400
 *  - other Fastify HTTP errors (e.g. 404 route not found) -> their statusCode
 *  - anything else -> 500 with a generic message (details only in the log)
 */
export function registerErrorHandler(app: FastifyInstance): void {
  // Unknown routes get the same envelope as thrown errors (Fastify routes these
  // through a separate handler, so it's wired explicitly here).
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const body: ErrorResponse = {
      statusCode: 404,
      error: reasonFor(404),
      message: `Route ${request.method}:${request.url} not found`,
    };
    void reply.status(404).send(body);
  });

  app.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      let statusCode: number;
      let message: string;

      if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
      } else if (hasZodFastifySchemaValidationErrors(error)) {
        // Request failed Zod schema validation (body/params/query).
        statusCode = 400;
        message = error.message;
      } else if (typeof error.statusCode === 'number' && error.statusCode < 500) {
        statusCode = error.statusCode;
        message = error.message;
      } else {
        statusCode = 500;
        message = 'Internal Server Error';
        // Unexpected: keep the full error (with request context) in the logs,
        // hide details from clients.
        request.log.error({ err: error }, 'Unhandled error');
      }

      const body: ErrorResponse = {
        statusCode,
        error: reasonFor(statusCode),
        message,
      };
      void reply.status(statusCode).send(body);
    },
  );
}
