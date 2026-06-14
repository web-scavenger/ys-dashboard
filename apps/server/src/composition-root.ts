import type { FastifyInstance } from 'fastify';
import { createDb, runMigrations } from './db/client.js';
import { registerWidgetsModule } from './modules/widgets/widget.module.js';

/**
 * Composition root: the single place where infrastructure (the DB) and feature
 * modules are instantiated and wired (manual constructor injection — no DI
 * framework). Each module exposes a `register*` function called here.
 */
export function registerModules(app: FastifyInstance): void {
  const { db, close } = createDb(app.config.DATABASE_PATH);
  runMigrations(db);
  app.addHook('onClose', () => {
    close();
  });

  registerWidgetsModule(app, db);
}
