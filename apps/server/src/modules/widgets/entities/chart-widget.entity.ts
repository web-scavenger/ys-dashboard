import { type ChartWidgetData } from '@ys/contracts';
import { generateChartPoints } from '../lib/widget-data.js';
import { WidgetEntity } from './widget.entity.js';

/** Shared behavior for chart widgets (line + bar): same data shape and random
 * data generation. Concrete subclasses only pin the discriminant `type`.
 * Charts inherit the base `applyUpdate`, which rejects edits. */
export abstract class ChartWidgetEntity extends WidgetEntity<ChartWidgetData> {
  createInitialData(): ChartWidgetData {
    return { points: generateChartPoints() };
  }
}
