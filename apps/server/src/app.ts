import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { envSchema } from './config.js';
import { helloRoutes } from './routes/hello.js';

/**
 * Build (but do not start) the Fastify app. Kept separate from `index.ts` so
 * tests can `inject` against it without binding a port.
 *
 * Order matters: env is loaded first (via `after()`) so dependent plugins like
 * CORS can read validated `app.config`.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(fastifyEnv, { schema: envSchema, dotenv: true });
  await app.after();

  await app.register(cors, { origin: app.config.CORS_ORIGIN });

  await app.register(swagger, {
    openapi: {
      info: { title: 'YS Dashboard API', version: '0.0.0' },
    },
  });
  await app.register(swaggerUi, { routePrefix: app.config.SWAGGER_UI_PREFIX });

  await app.register(helloRoutes);

  return app;
}
