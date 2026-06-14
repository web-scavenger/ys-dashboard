import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useInView } from '../lib/useInView.js';
import { MockIntersectionObserver, mockElementRect } from './test-utils.js';

function Probe(props?: Parameters<typeof useInView>[0]) {
  const { ref, inView } = useInView<HTMLDivElement>(props);
  return (
    <div ref={ref} data-testid="probe">
      {String(inView)}
    </div>
  );
}

function intersect(isIntersecting: boolean) {
  act(() => {
    MockIntersectionObserver.last().callback([{ isIntersecting }]);
  });
}

beforeEach(() => {
  MockIntersectionObserver.reset();
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useInView', () => {
  it('starts hidden for an offscreen element and flips on intersection', () => {
    mockElementRect({ top: 10000, bottom: 10256 });
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('false');

    intersect(true);
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
  });

  it('seeds visible synchronously for an already-in-view element (no observer)', () => {
    mockElementRect({ top: 0, bottom: 256, left: 0, right: 300 });
    render(<Probe />);

    expect(screen.getByTestId('probe')).toHaveTextContent('true');
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('latches and disconnects after the first intersection (once)', () => {
    mockElementRect({ top: 10000, bottom: 10256 });
    render(<Probe />);

    intersect(true);
    expect(MockIntersectionObserver.last().disconnect).toHaveBeenCalled();
  });

  it('tracks both directions when once is false', () => {
    mockElementRect({ top: 10000, bottom: 10256 });
    render(<Probe once={false} />);

    intersect(true);
    expect(screen.getByTestId('probe')).toHaveTextContent('true');

    intersect(false);
    expect(screen.getByTestId('probe')).toHaveTextContent('false');
    expect(MockIntersectionObserver.last().disconnect).not.toHaveBeenCalled();
  });

  it('defaults to visible when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
  });
});
