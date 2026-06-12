import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { registerErrorHandler } from '../src/common/error-handler.js';
import { NotFoundError } from '../src/common/errors.js';

/**
 * Exercises the global error handler in isolation: a bare Fastify instance with
 * just the handler registered, plus a route that throws a domain error.
 */
describe('global error handling', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    registerErrorHandler(app);
    app.get('/boom', () => {
      throw new NotFoundError('widget 42 not found');
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('maps a domain AppError to its status code and envelope', async () => {
    const res = await app.inject({ method: 'GET', url: '/boom' });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'widget 42 not found',
    });
  });

  it('returns the same envelope for unknown routes', async () => {
    const res = await app.inject({ method: 'GET', url: '/does-not-exist' });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
    });
  });
});
