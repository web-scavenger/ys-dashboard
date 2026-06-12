import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { errorResponseSchema, helloResponseSchema } from '@ys/contracts';
import type { HelloService } from './hello.service.js';

/**
 * HTTP layer for the hello module. Owns route definitions + their schemas and
 * delegates all work to the service. Instantiated with its dependency in the
 * composition root; `registerRoutes` attaches the routes to the Fastify app.
 */
export class HelloController {
  constructor(private readonly service: HelloService) {}

  registerRoutes(app: FastifyInstance): void {
    // Register on the Zod-typed instance so the schemas drive validation,
    // serialization and the inferred handler types.
    app.withTypeProvider<ZodTypeProvider>().get(
      '/api/hello',
      {
        schema: {
          description: 'Hello-world endpoint used to verify the stack is wired up.',
          tags: ['hello'],
          response: {
            200: helloResponseSchema,
            500: errorResponseSchema,
          },
        },
      },
      () => this.service.getHello(),
    );
  }
}
