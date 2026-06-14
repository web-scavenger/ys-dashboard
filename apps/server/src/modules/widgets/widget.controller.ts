import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { errorResponseSchema } from '@ys/contracts';
import {
  createWidgetRequestSchema,
  listWidgetsQuerySchema,
  updateWidgetRequestSchema,
  widgetIdParamSchema,
  widgetListResponseSchema,
  widgetResponseSchema,
} from './dto/widget.dto.js';
import type { WidgetService } from './widget.service.js';

/**
 * HTTP layer for the widgets module. Owns the route definitions + schemas and
 * delegates all work to the service. Schemas drive validation, serialization
 * and the inferred handler types via the Zod type provider.
 */
export class WidgetController {
  constructor(private readonly service: WidgetService) {}

  registerRoutes(app: FastifyInstance): void {
    const typed = app.withTypeProvider<ZodTypeProvider>();

    typed.get(
      '/api/widgets',
      {
        schema: {
          description:
            'List all widgets. Order with ?sortBy=createdAt|title|position&order=asc|desc (defaults to createdAt desc).',
          tags: ['widgets'],
          querystring: listWidgetsQuerySchema,
          response: {
            200: widgetListResponseSchema,
            500: errorResponseSchema,
          },
        },
      },
      (request) => this.service.list(request.query),
    );

    typed.post(
      '/api/widgets',
      {
        schema: {
          description: 'Create a widget of the given type; the server generates its data.',
          tags: ['widgets'],
          body: createWidgetRequestSchema,
          response: {
            201: widgetResponseSchema,
            400: errorResponseSchema,
            500: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const widget = await this.service.create(request.body);
        reply.code(201);
        return widget;
      },
    );

    typed.patch(
      '/api/widgets/:id',
      {
        schema: {
          description: 'Update a widget: title (any type) and/or text content.',
          tags: ['widgets'],
          params: widgetIdParamSchema,
          body: updateWidgetRequestSchema,
          response: {
            200: widgetResponseSchema,
            400: errorResponseSchema,
            404: errorResponseSchema,
            500: errorResponseSchema,
          },
        },
      },
      (request) => this.service.update(request.params.id, request.body),
    );

    typed.delete(
      '/api/widgets/:id',
      {
        schema: {
          description: 'Delete a widget.',
          tags: ['widgets'],
          params: widgetIdParamSchema,
          response: {
            204: z.null(),
            404: errorResponseSchema,
            500: errorResponseSchema,
          },
        },
      },
      async (request, reply) => {
        await this.service.delete(request.params.id);
        return reply.code(204).send(null);
      },
    );
  }
}
