import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type {
  CreateWidgetRequest,
  ListWidgetsQuery,
  UpdateWidgetRequest,
  Widget,
  WidgetSortField,
  WidgetType,
} from '@ys/contracts';
import { widgetRegistry } from '../registry.js';
import { createWidget, deleteWidget, listWidgets, updateWidget } from './widgetsApi.js';

/** Base key + prefix for every widget query. Mutations operate on the prefix so
 * optimistic updates apply across all ordering variations. */
const widgetsKey = ['widgets'] as const;

/** Monotonically decreasing id for optimistic (not-yet-persisted) widgets, kept
 *  negative so it can never collide with a server-assigned positive id. */
let nextTempId = -1;

/** Build a placeholder widget to show immediately on create, appended past the
 *  current highest position. The server replaces it (real id + data) on settle. */
function buildOptimisticWidget(type: WidgetType, widgets: Widget[]): Widget {
  const maxPosition = widgets.reduce((max, widget) => Math.max(max, widget.position), -1);
  const now = new Date().toISOString();
  return {
    id: nextTempId--,
    position: maxPosition + 1,
    title: widgetRegistry[type].label,
    createdAt: now,
    updatedAt: now,
    type,
    data: widgetRegistry[type].createInitialData(),
  } as Widget;
}

/** Snapshots of every cached widget list (one per ordering) captured in
 *  `onMutate` so `onError` can roll them all back. */
interface MutationContext {
  previous: [readonly unknown[], Widget[] | undefined][];
}

/** Compare two widgets on a single field, mirroring the server's ordering
 *  (`title` case-insensitive; ISO `createdAt` strings compare lexically). */
function compareField(a: Widget, b: Widget, field: WidgetSortField): number {
  if (field === 'title') return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  if (field === 'position') return a.position - b.position;
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

/** Re-sort a list to match a cached ordering, mirroring the server: chosen field
 *  then `id` as a stable tiebreaker, both in the requested direction. A null key
 *  (the default `useWidgets()` query) means `createdAt desc`. */
function sortWidgets(list: Widget[], query: Partial<ListWidgetsQuery> | null): Widget[] {
  const sortBy = query?.sortBy ?? 'createdAt';
  const dir = (query?.order ?? 'desc') === 'desc' ? -1 : 1;
  return [...list].sort((a, b) => {
    const primary = compareField(a, b, sortBy);
    return (primary !== 0 ? primary : a.id - b.id) * dir;
  });
}

/** Apply an updater to every cached widget list, then re-sort each to its own
 *  ordering so optimistic entries land where the server would place them. */
function updateAllLists(queryClient: QueryClient, updater: (widgets: Widget[]) => Widget[]) {
  for (const [key, data] of queryClient.getQueriesData<Widget[]>({ queryKey: widgetsKey })) {
    const query = (key[key.length - 1] ?? null) as Partial<ListWidgetsQuery> | null;
    queryClient.setQueryData<Widget[]>(key, sortWidgets(updater(data ?? []), query));
  }
}

/** Restore the pre-mutation snapshots — shared `onError` for every widget mutation. */
function rollback(queryClient: QueryClient, context: MutationContext | undefined) {
  context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

/** Refetch the lists so the optimistic cache reconciles with the server — shared
 *  `onSettled` for every widget mutation. Matches every ordering by prefix. */
function invalidate(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: widgetsKey });
}

/** Cancel in-flight list fetches and snapshot every cached ordering for rollback. */
async function snapshotLists(queryClient: QueryClient): Promise<MutationContext> {
  await queryClient.cancelQueries({ queryKey: widgetsKey });
  return { previous: queryClient.getQueriesData<Widget[]>({ queryKey: widgetsKey }) };
}

export function useWidgets(query?: Partial<ListWidgetsQuery>) {
  return useQuery({
    queryKey: [...widgetsKey, query ?? null],
    queryFn: () => listWidgets(query),
  });
}

export function useCreateWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWidgetRequest) => createWidget(body),
    onMutate: async (body): Promise<MutationContext> => {
      const context = await snapshotLists(queryClient);
      const current = context.previous[0]?.[1] ?? [];
      const optimistic = buildOptimisticWidget(body.type, current);
      updateAllLists(queryClient, (old) => [...old, optimistic]);
      return context;
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
      const context = await snapshotLists(queryClient);
      updateAllLists(queryClient, (old) =>
        old.map((widget) => {
          if (widget.id !== id) return widget;
          const next = body.title !== undefined ? { ...widget, title: body.title } : widget;
          return body.content !== undefined && next.type === 'text'
            ? { ...next, data: { content: body.content } }
            : next;
        }),
      );
      return context;
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
      const context = await snapshotLists(queryClient);
      updateAllLists(queryClient, (old) => old.filter((widget) => widget.id !== id));
      return context;
    },
    onError: (_error, _id, context) => rollback(queryClient, context),
    onSettled: () => invalidate(queryClient),
  });
}
