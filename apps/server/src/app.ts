import Fastify, { type FastifyInstance } from 'fastify';
import { config as loadDotenv } from 'dotenv';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { getLoggerOptions, loadConfig } from './config.js';
import { registerErrorHandler } from './common/error-handler.js';
import { registerModules } from './composition-root.js';

/**
 * Build (but do not start) the Fastify app. Kept separate from `index.ts` so
 * tests can `inject` against it without binding a port.
 */
export async function buildApp(): Promise<FastifyInstance> {
  // Load .env into process.env for local/dev convenience (no-op when the file is
  // absent, e.g. in production / CI). Previously handled by @fastify/env's
  // `dotenv: true`; restored here now that config is parsed by `loadConfig()`.
  loadDotenv({ quiet: true });

  const app = Fastify({ logger: getLoggerOptions() });

  // Load + validate the environment once and expose it as `app.config`. Throws
  // (failing boot) if a production-required var is missing.
  app.decorate('config', loadConfig());

  // Use Zod as the validator + serializer for all routes (fastify-type-provider-zod),
  // so route schemas are the single source of truth for validation and types.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, { origin: app.config.CORS_ORIGIN });

  // API docs are opt-in: mount Swagger + its UI only when a prefix is configured.
  // `jsonSchemaTransform` turns the Zod route schemas into OpenAPI definitions.
  if (app.config.SWAGGER_UI_PREFIX) {
    await app.register(swagger, {
      openapi: {
        info: { title: 'YS Dashboard API', version: '0.0.0' },
      },
      transform: jsonSchemaTransform,
    });
    await app.register(swaggerUi, { routePrefix: app.config.SWAGGER_UI_PREFIX });
  }

  // Normalize all errors into a single envelope before routes are registered.
  registerErrorHandler(app);

  // Wire and register feature modules (controller -> service -> repository).
  registerModules(app);

  return app;
}
