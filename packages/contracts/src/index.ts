/**
 * Shared API contracts between server and client.
 *
 * Single source of truth: each payload is defined once as a Zod schema and the
 * TypeScript type is inferred from it. The server validates/serializes its
 * routes against these schemas and the client parses its responses with them,
 * so the two cannot drift. The widget schemas below are the single source of
 * truth for both the server entity layer and the client registry.
 */
import { z } from 'zod';

/**
 * Uniform error envelope returned by the server's global error handler. The
 * client can rely on this shape for every non-2xx response.
 */
export const errorResponseSchema = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Widget contracts. The discriminated union over `type` is the single source of
 * truth for both the server entity layer and the client registry: each widget
 * type maps to a specific `data` shape, validated automatically by the union.
 */

/** A single data point used by chart widgets. */
export const chartPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export type ChartPoint = z.infer<typeof chartPointSchema>;

/** Chart payload — shared by `line` and `bar` (same data, different render). */
export const chartWidgetDataSchema = z.object({
  points: z.array(chartPointSchema),
});

export type ChartWidgetData = z.infer<typeof chartWidgetDataSchema>;

/** Upper bound on text content, enforced at the contract edge so neither the
 * server nor the client can persist an unbounded string into the `data` column. */
export const TEXT_WIDGET_MAX_LENGTH = 10_000;

/** Text payload — the editable widget. */
export const textWidgetDataSchema = z.object({
  content: z.string().max(TEXT_WIDGET_MAX_LENGTH),
});

export type TextWidgetData = z.infer<typeof textWidgetDataSchema>;

export const widgetTypeSchema = z.enum(['line', 'bar', 'text']);

export type WidgetType = z.infer<typeof widgetTypeSchema>;

/**
 * A widget — discriminated union on `type` with shared `id`/`position`. The
 * discriminant selects which `data` schema applies, so a widget's data can
 * never be validated against the wrong shape.
 */
export const widgetSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.number().int(),
    position: z.number().int(),
    type: z.literal('line'),
    data: chartWidgetDataSchema,
  }),
  z.object({
    id: z.number().int(),
    position: z.number().int(),
    type: z.literal('bar'),
    data: chartWidgetDataSchema,
  }),
  z.object({
    id: z.number().int(),
    position: z.number().int(),
    type: z.literal('text'),
    data: textWidgetDataSchema,
  }),
]);

export type Widget = z.infer<typeof widgetSchema>;

/** The type-specific payload of a widget (`Widget['data']`). */
export type WidgetData = Widget['data'];

/** POST body — only the type; the server generates data + assigns position. */
export const createWidgetRequestSchema = z.object({
  type: widgetTypeSchema,
});

export type CreateWidgetRequest = z.infer<typeof createWidgetRequestSchema>;

/** PATCH body — only text content is editable in this pass (additive later). */
export const updateWidgetRequestSchema = z.object({
  content: z.string().max(TEXT_WIDGET_MAX_LENGTH),
});

export type UpdateWidgetRequest = z.infer<typeof updateWidgetRequestSchema>;

export const widgetListResponseSchema = z.array(widgetSchema);

export type WidgetListResponse = z.infer<typeof widgetListResponseSchema>;

export const widgetResponseSchema = widgetSchema;

export type WidgetResponse = z.infer<typeof widgetResponseSchema>;

/** Path params for single-widget routes (ids arrive as strings). */
export const widgetIdParamSchema = z.object({
  id: z.coerce.number().int(),
});

export type WidgetIdParam = z.infer<typeof widgetIdParamSchema>;
