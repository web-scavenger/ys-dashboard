/**
 * Environment schema for @fastify/env.
 *
 * Values are validated and type-coerced at boot; defaults keep the app runnable
 * (and tests green) without a .env file. The instance is decorated as
 * `app.config` (see the module augmentation below).
 */
export const envSchema = {
  type: 'object',
  required: ['HOST', 'PORT'],
  properties: {
    NODE_ENV: { type: 'string', default: 'development' },
    HOST: { type: 'string', default: '0.0.0.0' },
    PORT: { type: 'number', default: 8080 },
    CORS_ORIGIN: { type: 'string', default: 'http://localhost:3000' },
    SWAGGER_UI_PREFIX: { type: 'string', default: '/swagger-ui' },
  },
} as const;

export interface AppConfig {
  NODE_ENV: string;
  HOST: string;
  PORT: number;
  CORS_ORIGIN: string;
  SWAGGER_UI_PREFIX: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
  }
}
