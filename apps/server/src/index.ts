import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';

/**
 * Close the server (and any onClose hooks, e.g. the DB connection) cleanly on
 * the signals the platform sends on redeploy/stop.
 */
function registerShutdownHandlers(app: FastifyInstance): void {
  const onSignal = (signal: NodeJS.Signals): void => {
    app.log.info({ signal }, 'Received shutdown signal, closing server');
    app.close().then(
      () => process.exit(0),
      (err: unknown) => {
        app.log.error({ err }, 'Error during shutdown');
        process.exit(1);
      },
    );
  };

  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
}

async function start(): Promise<void> {
  const app = await buildApp();
  registerShutdownHandlers(app);
  await app.listen({ host: app.config.HOST, port: app.config.PORT });
}

start().catch((err: unknown) => {
  // No logger yet if buildApp failed (e.g. missing required env).
  console.error('Failed to start server:', err);
  process.exit(1);
});
