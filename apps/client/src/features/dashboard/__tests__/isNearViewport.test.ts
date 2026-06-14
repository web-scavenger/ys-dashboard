import { describe, expect, it } from 'vitest';
import { isNearViewport } from '../lib/isNearViewport.js';

function elementWithRect(rect: Partial<DOMRect>): Element {
  return {
    getBoundingClientRect: () => ({ top: 0, bottom: 0, left: 0, right: 0, ...rect }) as DOMRect,
  } as Element;
}

describe('isNearViewport', () => {
  it('is true for an element inside the viewport', () => {
    const element = elementWithRect({ top: 100, bottom: 300, left: 0, right: 200 });
    expect(isNearViewport(element, 0)).toBe(true);
  });

  it('is false for an element far below the viewport', () => {
    const element = elementWithRect({ top: 5000, bottom: 5200 });
    expect(isNearViewport(element, 0)).toBe(false);
  });

  it('counts an element within the margin as near, and outside it as not', () => {
    const justBelow = (): Element =>
      elementWithRect({ top: window.innerHeight + 100, bottom: window.innerHeight + 300 });
    expect(isNearViewport(justBelow(), 200)).toBe(true);
    expect(isNearViewport(justBelow(), 50)).toBe(false);
  });
});
