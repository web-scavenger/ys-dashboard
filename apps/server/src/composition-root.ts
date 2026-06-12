import type { FastifyInstance } from 'fastify';
import { HelloController } from './modules/hello/hello.controller.js';
import { HelloService } from './modules/hello/hello.service.js';
import { InMemoryHelloRepository } from './modules/hello/hello.repository.memory.js';

/**
 * Composition root: the single place where concrete classes are instantiated
 * and dependencies are wired (manual constructor injection — no DI framework).
 * Dependencies flow inward: repository -> service -> controller. Swapping a
 * storage backend later is a one-line change here; the layers above are
 * untouched.
 */
export function registerModules(app: FastifyInstance): void {
  // --- hello module ---
  const helloRepository = new InMemoryHelloRepository();
  const helloService = new HelloService(helloRepository);
  const helloController = new HelloController(helloService);
  helloController.registerRoutes(app);

  // Future modules (e.g. widgets) are wired the same way and registered here.
}
