import type { UpdateWidgetRequest, WidgetData, WidgetType } from '@ys/contracts';
import { BarWidgetEntity } from './bar-widget.entity.js';
import { LineWidgetEntity } from './line-widget.entity.js';
import { TextWidgetEntity } from './text-widget.entity.js';
import type { WidgetEntity } from './widget.entity.js';

/**
 * Dispatches widget behavior by type: holds one entity instance per type and
 * runs the instance's method. The `Record<WidgetType, …>` is the exhaustiveness
 * guard — a new type added to the contract enum won't compile until it's
 * registered here. The service depends on this manager, never on a concrete
 * entity, so it stays unaware of what any type actually does.
 */
export class WidgetManager {
  private readonly entities: Record<WidgetType, WidgetEntity> = {
    line: new LineWidgetEntity(),
    bar: new BarWidgetEntity(),
    text: new TextWidgetEntity(),
  };

  get(type: WidgetType): WidgetEntity {
    return this.entities[type];
  }

  createInitialData(type: WidgetType): WidgetData {
    return this.get(type).createInitialData();
  }

  applyUpdate(type: WidgetType, current: WidgetData, patch: UpdateWidgetRequest): WidgetData {
    return this.get(type).applyUpdate(current, patch);
  }
}
