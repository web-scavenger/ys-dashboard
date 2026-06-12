import type { FastifyInstance } from 'fastify';
import type { Db } from '../../db/client.js';
import { HelloController } from './hello.controller.js';
import { HelloService } from './hello.service.js';
import { SqliteHelloRepository } from './repositories/hello.repository.sqlite.js';

/** Builds the hello graph (repository -> service -> controller) and attaches its
 * routes. Called from the composition root with the shared Db. */
export function registerHelloModule(app: FastifyInstance, db: Db): void {
  const repository = new SqliteHelloRepository(db);
  const service = new HelloService(repository);
  const controller = new HelloController(service);
  controller.registerRoutes(app);
}
