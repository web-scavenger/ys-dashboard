import type { ReactElement, ReactNode } from 'react';
import { fireEvent, render, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Widget } from '../types.js';

/**
 * Radix's DropdownMenu trigger opens on `pointerdown` (button 0), not a plain
 * `click`, so jsdom tests must dispatch that to reveal the menu items.
 */
export function openRadixMenu(trigger: HTMLElement) {
  trigger.focus();
  fireEvent.keyDown(trigger, { key: 'Enter' });
}

/** Wraps a tree in a fresh QueryClient (retries off) for query/mutation tests. */
export function renderWithClient(ui: ReactElement): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(ui, { wrapper });
}

export const textWidget: Widget = {
  id: 1,
  position: 0,
  type: 'text',
  data: { content: 'hello' },
};

export const lineWidget: Widget = {
  id: 2,
  position: 1,
  type: 'line',
  data: { points: [{ label: 'Point 1', value: 10 }] },
};

export const barWidget: Widget = {
  id: 3,
  position: 2,
  type: 'bar',
  data: { points: [{ label: 'Point 1', value: 20 }] },
};
