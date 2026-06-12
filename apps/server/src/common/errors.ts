/**
 * Domain error hierarchy. Services and repositories throw these instead of
 * raw Errors; the global error handler (see `error-handler.ts`) maps them to
 * HTTP responses, so the layers below the controller stay HTTP-agnostic.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
}
