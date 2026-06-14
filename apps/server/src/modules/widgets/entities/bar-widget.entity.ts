import { ChartWidgetEntity } from './chart-widget.entity.js';

export class BarWidgetEntity extends ChartWidgetEntity {
  readonly type = 'bar';

  defaultTitle(): string {
    return 'Bar chart';
  }
}
