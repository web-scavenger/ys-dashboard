import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

const updateMutate = vi.fn();
const deleteMutate = vi.fn();

vi.mock('../api/useWidgets.js', () => ({
  useUpdateWidget: () => ({ mutate: updateMutate, isPending: false, error: null }),
  useDeleteWidget: () => ({ mutate: deleteMutate, isPending: false, error: null }),
}));

const { WidgetWrapper } = await import('../components/WidgetWrapper.js');
const { textWidget, MockIntersectionObserver, mockElementRect } = await import('./test-utils.js');

beforeEach(() => {
  MockIntersectionObserver.reset();
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  mockElementRect({ top: 10000, bottom: 10256 });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  updateMutate.mockReset();
  deleteMutate.mockReset();
});

describe('WidgetWrapper render-on-visible', () => {
  it('mounts the body only once the cell scrolls into view', () => {
    render(<WidgetWrapper widget={textWidget} />);

    expect(screen.queryByText('hello')).not.toBeInTheDocument();

    act(() => {
      MockIntersectionObserver.last().callback([{ isIntersecting: true }]);
    });

    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
