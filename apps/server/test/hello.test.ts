import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

describe('GET /api/hello', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the hello-world message', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/hello' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ message: 'Hello world' });
  });
});
