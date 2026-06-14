import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Widget } from '@ys/contracts';
import { useCreateWidget, useWidgets } from '../api/useWidgets.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

const textWidget: Widget = { id: 1, position: 0, type: 'text', data: { content: 'hi' } };

/** Renders the widgets list + create hooks against a real (retry-off) QueryClient. */
function renderWidgetHooks() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => ({ list: useWidgets(), create: useCreateWidget() }), { wrapper });
}

describe('useCreateWidget', () => {
  it('appends an optimistic widget immediately, then settles to the server widget', async () => {
    const created: Widget = { id: 5, position: 1, type: 'text', data: { content: '' } };
    // Hold the POST pending so the optimistic state is observable before settle.
    let resolvePost!: (value: unknown) => void;
    const postPending = new Promise((resolve) => {
      resolvePost = resolve;
    });
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        // initial list load
        .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([textWidget]) })
        // POST create — stays pending until we resolve it below
        .mockReturnValueOnce(postPending)
        // refetch after invalidation
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve([textWidget, created]),
        }),
    );

    const { result } = renderWidgetHooks();
    await waitFor(() => expect(result.current.list.data).toEqual([textWidget]));

    result.current.create.mutate({ type: 'text' });

    // While the POST is in flight, the optimistic entry is appended with a
    // negative (temp) id that can't collide with a server id.
    await waitFor(() => expect(result.current.list.data).toHaveLength(2));
    const optimistic = result.current.list.data?.[1];
    expect(optimistic?.id).toBeLessThan(0);

    // Let the POST settle; the list refetches and the real widget replaces it.
    resolvePost({ ok: true, status: 201, json: () => Promise.resolve(created) });
    await waitFor(() => expect(result.current.list.data).toEqual([textWidget, created]));
  });

  it('rolls back the optimistic widget when the create fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([textWidget]) })
        // POST create fails
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ statusCode: 500, error: 'Server', message: 'boom' }),
        })
        // refetch after invalidation restores the server truth
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve([textWidget]),
        }),
    );

    const { result } = renderWidgetHooks();
    await waitFor(() => expect(result.current.list.data).toEqual([textWidget]));

    result.current.create.mutate({ type: 'text' });

    await waitFor(() => expect(result.current.create.isError).toBe(true));
    expect(result.current.list.data).toEqual([textWidget]);
  });
});
