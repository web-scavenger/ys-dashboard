import type { ChartPoint } from '@ys/contracts';

const POINT_COUNT = 7;
const MAX_VALUE = 100;

/** Random series for chart widgets — fixed shape, randomized values. Generated
 * once at create time and persisted, so a widget's chart is stable on reload. */
export function generateChartPoints(): ChartPoint[] {
  return Array.from({ length: POINT_COUNT }, (_, i) => ({
    label: `Point ${i + 1}`,
    value: Math.round(Math.random() * MAX_VALUE),
  }));
}
