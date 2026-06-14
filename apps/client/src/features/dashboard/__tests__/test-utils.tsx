import type { ReactElement, ReactNode } from 'react';
import { fireEvent, render, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
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

const timestamps = {
  createdAt: '2026-06-14T00:00:00.000Z',
  updatedAt: '2026-06-14T00:00:00.000Z',
};

export const textWidget: Widget = {
  id: 1,
  position: 0,
  title: 'Text',
  ...timestamps,
  type: 'text',
  data: { content: 'hello' },
};

export const lineWidget: Widget = {
  id: 2,
  position: 1,
  title: 'Line chart',
  ...timestamps,
  type: 'line',
  data: { points: [{ label: 'Point 1', value: 10 }] },
};

export const barWidget: Widget = {
  id: 3,
  position: 2,
  title: 'Bar chart',
  ...timestamps,
  type: 'bar',
  data: { points: [{ label: 'Point 1', value: 20 }] },
};

type IoCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

/**
 * Controllable `IntersectionObserver` stand-in for jsdom (which lacks the API).
 * Install with `vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)`,
 * then drive callbacks via `MockIntersectionObserver.last().callback([...])`.
 */
export class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IoCallback;
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();

  constructor(callback: IoCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  static reset() {
    MockIntersectionObserver.instances = [];
  }

  static last() {
    const instance = MockIntersectionObserver.instances.at(-1);
    if (!instance) {
      throw new Error('no IntersectionObserver was created');
    }
    return instance;
  }
}

/**
 * Stubs `getBoundingClientRect` for every element so synchronous viewport math
 * is deterministic in jsdom (which reports all-zero rects).
 */
export function mockElementRect(rect: Partial<DOMRect>) {
  return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect);
}
