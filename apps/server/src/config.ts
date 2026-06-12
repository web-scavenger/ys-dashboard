import type { FastifyServerOptions } from 'fastify';
import { z } from 'zod';

/** Treat blank/whitespace-only env values as "not provided". */
const blankToUndefined = (v: unknown): unknown =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

/**
 * Vars that must be supplied explicitly in production. Every var has a dev
 * default below so local dev and tests run with zero config, but in production
 * those defaults would silently mask a forgotten var (e.g. CORS_ORIGIN falling
 * back to localhost), so the schema requires these to be set there.
 */
const PRODUCTION_REQUIRED = ['HOST', 'PORT', 'CORS_ORIGIN'] as const;

/**
 * Environment schema — the single source of truth for config validation, types,
 * and defaults. Fields are coerced + defaulted for dev/test; the transform then
 * enforces the production-required vars and produces the final typed config
 * (`AppConfig` is inferred from it). The result is decorated as `app.config`.
 */
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.preprocess(blankToUndefined, z.string().optional()),
    PORT: z.preprocess(blankToUndefined, z.coerce.number().optional()),
    CORS_ORIGIN: z.preprocess(blankToUndefined, z.string().optional()),
    // No default: Swagger docs are opt-in. When unset, the UI is not mounted.
    SWAGGER_UI_PREFIX: z.preprocess(blankToUndefined, z.string().optional()),
  })
  .transform((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      for (const key of PRODUCTION_REQUIRED) {
        if (env[key] === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} must be set in production (see .env.example).`,
          });
        }
      }
    }

    return {
      NODE_ENV: env.NODE_ENV,
      HOST: env.HOST ?? '0.0.0.0',
      PORT: env.PORT ?? 8080,
      CORS_ORIGIN: env.CORS_ORIGIN ?? 'http://localhost:3000',
      SWAGGER_UI_PREFIX: env.SWAGGER_UI_PREFIX,
    };
  });

export type AppConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate the environment into a typed config. Applies dev defaults
 * and, in production, throws (Zod's formatted issues) if a required var is
 * missing or a supplied value is the wrong type. Single boot-time gate.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return envSchema.parse(env);
}

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
  }
}

/**
 * Logger options by environment: silent in tests, verbose in dev, structured
 * JSON at `info` in production. Reads `process.env` directly because the logger
 * is configured when the Fastify instance is built — before @fastify/env has
 * populated `app.config`.
 */
export function getLoggerOptions(): FastifyServerOptions['logger'] {
  switch (process.env.NODE_ENV) {
    case 'test':
      return false;
    case 'production':
      return { level: 'info' };
    default:
      return { level: 'debug' };
  }
}
