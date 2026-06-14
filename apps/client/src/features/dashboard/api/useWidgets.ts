import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { CreateWidgetRequest, UpdateWidgetRequest, Widget, WidgetType } from '@ys/contracts';
import { widgetRegistry } from '../registry.js';
import { createWidget, deleteWidget, listWidgets, updateWidget } from './widgetsApi.js';

const widgetsKey = ['widgets'] as const;

/** Monotonically decreasing id for optimistic (not-yet-persisted) widgets, kept
 *  negative so it can never collide with a server-assigned positive id. */
let nextTempId = -1;

/** Build a placeholder widget to show immediately on create, appended past the
 *  current highest position. The server replaces it (real id + data) on settle. */
function buildOptimisticWidget(type: WidgetType, widgets: Widget[]): Widget {
  const maxPosition = widgets.reduce((max, widget) => Math.max(max, widget.position), -1);
  return {
    id: nextTempId--,
    position: maxPosition + 1,
    type,
    data: widgetRegistry[type].createInitialData(),
  } as Widget;
}

/** Snapshot of the list captured in `onMutate` so `onError` can roll back. */
interface MutationContext {
  previous: Widget[] | undefined;
}

/** Restore the pre-mutation snapshot — shared `onError` for every widget mutation. */
function rollback(queryClient: QueryClient, context: MutationContext | undefined) {
  queryClient.setQueryData(widgetsKey, context?.previous);
}

/** Refetch the list so the optimistic cache reconciles with the server — shared
 *  `onSettled` for every widget mutation. */
function invalidate(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: widgetsKey });
}

export function useWidgets() {
  return useQuery({ queryKey: widgetsKey, queryFn: listWidgets });
}

export function useCreateWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWidgetRequest) => createWidget(body),
    onMutate: async (body): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: widgetsKey });
      const previous = queryClient.getQueryData<Widget[]>(widgetsKey);
      const optimistic = buildOptimisticWidget(body.type, previous ?? []);
      queryClient.setQueryData<Widget[]>(widgetsKey, (old = []) => [...old, optimistic]);
      return { previous };
    },
    onError: (_error, _body, context) => rollback(queryClient, context),
    onSettled: () => invalidate(queryClient),
  });
}

export function useUpdateWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; body: UpdateWidgetRequest }) =>
      updateWidget(vars.id, vars.body),
    onMutate: async ({ id, body }): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: widgetsKey });
      const previous = queryClient.getQueryData<Widget[]>(widgetsKey);
      queryClient.setQueryData<Widget[]>(widgetsKey, (old = []) =>
        old.map((widget) =>
          widget.id === id && widget.type === 'text'
            ? { ...widget, data: { content: body.content } }
            : widget,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => rollback(queryClient, context),
    onSettled: () => invalidate(queryClient),
  });
}

export function useDeleteWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWidget(id),
    onMutate: async (id): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: widgetsKey });
      const previous = queryClient.getQueryData<Widget[]>(widgetsKey);
      queryClient.setQueryData<Widget[]>(widgetsKey, (old = []) =>
        old.filter((widget) => widget.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => rollback(queryClient, context),
    onSettled: () => invalidate(queryClient),
  });
}
