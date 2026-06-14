import { describe, expect, it } from 'vitest';
import { generateChartPoints } from '../widget-data.js';

describe('generateChartPoints', () => {
  it('produces 7 labeled points with values in [0, 100]', () => {
    const points = generateChartPoints();

    expect(points).toHaveLength(7);
    points.forEach((point, i) => {
      expect(point.label).toBe(`Point ${i + 1}`);
      expect(point.value).toBeGreaterThanOrEqual(0);
      expect(point.value).toBeLessThanOrEqual(100);
    });
  });
});
