import {
  widgetListResponseSchema,
  widgetResponseSchema,
  type CreateWidgetRequest,
  type ListWidgetsQuery,
  type UpdateWidgetRequest,
  type Widget,
  type WidgetListResponse,
} from '@ys/contracts';
import { request } from '@/lib/api';

export function listWidgets(query?: Partial<ListWidgetsQuery>): Promise<WidgetListResponse> {
  const params = new URLSearchParams();
  if (query?.sortBy) params.set('sortBy', query.sortBy);
  if (query?.order) params.set('order', query.order);
  const qs = params.toString();
  return request(`/api/widgets${qs ? `?${qs}` : ''}`, widgetListResponseSchema);
}

export function createWidget(body: CreateWidgetRequest): Promise<Widget> {
  return request('/api/widgets', widgetResponseSchema, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateWidget(id: number, body: UpdateWidgetRequest): Promise<Widget> {
  return request(`/api/widgets/${id}`, widgetResponseSchema, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE returns 204 with no body, so it's called without a response schema —
 * `request()` then skips body parsing and resolves to `void`, while still
 * surfacing the same `ApiError` envelope on failure.
 */
export function deleteWidget(id: number): Promise<void> {
  return request(`/api/widgets/${id}`, undefined, { method: 'DELETE' });
}
