import type { FastifyInstance } from 'fastify';
import type { Db } from '../../db/client.js';
import { WidgetManager } from './entities/widget-manager.js';
import { SqliteWidgetRepository } from './repositories/widget.repository.sqlite.js';
import { WidgetController } from './widget.controller.js';
import { WidgetService } from './widget.service.js';

/** Builds the widgets graph (repository + manager -> service -> controller) and
 * attaches its routes. Called from the composition root with the shared Db. */
export function registerWidgetsModule(app: FastifyInstance, db: Db): void {
  const repository = new SqliteWidgetRepository(db);
  const manager = new WidgetManager();
  const service = new WidgetService(repository, manager);
  const controller = new WidgetController(service);
  controller.registerRoutes(app);
}
