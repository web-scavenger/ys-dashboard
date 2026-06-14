import { ChartWidgetEntity } from './chart-widget.entity.js';

export class LineWidgetEntity extends ChartWidgetEntity {
  readonly type = 'line';

  defaultTitle(): string {
    return 'Line chart';
  }
}
