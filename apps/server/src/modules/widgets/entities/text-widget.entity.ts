import { type TextWidgetData, type UpdateWidgetRequest } from '@ys/contracts';
import { WidgetEntity } from './widget.entity.js';

export class TextWidgetEntity extends WidgetEntity<TextWidgetData> {
  readonly type = 'text';

  createInitialData(): TextWidgetData {
    return { content: '' };
  }

  override applyUpdate(_current: TextWidgetData, patch: UpdateWidgetRequest): TextWidgetData {
    return { content: patch.content };
  }
}
