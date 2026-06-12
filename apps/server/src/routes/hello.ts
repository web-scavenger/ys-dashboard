import type { FastifyInstance } from 'fastify';
import type { HelloResponse } from '@ys/types';

const helloResponseSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string' },
  },
} as const;

/**
 * Hello-world route. The response schema both validates the payload and makes
 * the endpoint show up in Swagger UI (/docs).
 */
export async function helloRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/api/hello',
    {
      schema: {
        description: 'Hello-world endpoint used to verify the stack is wired up.',
        tags: ['hello'],
        response: { 200: helloResponseSchema },
      },
    },
    async (): Promise<HelloResponse> => ({ message: 'Hello world' }),
  );
}
