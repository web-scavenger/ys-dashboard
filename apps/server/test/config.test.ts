import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('applies dev defaults with an empty environment', () => {
    expect(loadConfig({})).toMatchObject({
      NODE_ENV: 'development',
      HOST: '0.0.0.0',
      PORT: 8080,
      CORS_ORIGIN: 'http://localhost:3000',
    });
  });

  it('coerces PORT to a number', () => {
    expect(loadConfig({ PORT: '9090' }).PORT).toBe(9090);
  });

  it('throws in production when a required var is missing', () => {
    expect(() =>
      loadConfig({ NODE_ENV: 'production', HOST: '0.0.0.0', PORT: '8080' }),
    ).toThrow(/CORS_ORIGIN/);
  });

  it('treats a blank value as missing in production', () => {
    expect(() =>
      loadConfig({
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '8080',
        CORS_ORIGIN: '   ',
      }),
    ).toThrow(/CORS_ORIGIN/);
  });

  it('passes in production when all required vars are present', () => {
    expect(() =>
      loadConfig({
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '8080',
        CORS_ORIGIN: 'https://app.example.com',
      }),
    ).not.toThrow();
  });
});
