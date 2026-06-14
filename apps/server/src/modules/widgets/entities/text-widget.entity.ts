import { type TextWidgetData, type UpdateWidgetRequest } from '@ys/contracts';
import { WidgetEntity } from './widget.entity.js';

export class TextWidgetEntity extends WidgetEntity<TextWidgetData> {
  readonly type = 'text';

  createInitialData(): TextWidgetData {
    return { content: '' };
  }

  defaultTitle(): string {
    return 'Text';
  }

  override applyUpdate(current: TextWidgetData, patch: UpdateWidgetRequest): TextWidgetData {
    return { content: patch.content ?? current.content };
  }
}
