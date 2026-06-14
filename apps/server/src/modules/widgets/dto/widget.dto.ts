// Module-local DTOs. The shared API schemas live in @ys/contracts (single source
// of truth) and are re-exported here so routes import them from the module's dto/.
export {
  widgetSchema,
  widgetListResponseSchema,
  widgetResponseSchema,
  listWidgetsQuerySchema,
  createWidgetRequestSchema,
  updateWidgetRequestSchema,
  widgetIdParamSchema,
} from '@ys/contracts';
export type {
  Widget,
  WidgetListResponse,
  WidgetResponse,
  ListWidgetsQuery,
  CreateWidgetRequest,
  UpdateWidgetRequest,
  WidgetIdParam,
} from '@ys/contracts';
