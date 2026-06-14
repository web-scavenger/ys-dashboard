import type { UpdateWidgetRequest, Widget, WidgetData, WidgetType } from '@ys/contracts';

export type { UpdateWidgetRequest, Widget, WidgetData, WidgetType };

/** Narrow a widget to a single concrete variant of the union. */
export type WidgetOf<T extends WidgetType> = Extract<Widget, { type: T }>;

/**
 * Props every widget component receives. The wrapper owns the edit lifecycle and
 * passes it down: components render view mode, or an inline editor when
 * `isEditing`, calling `onSave`/`onCancel` to drive the wrapper's mutation.
 */
export interface WidgetComponentProps<T extends WidgetType = WidgetType> {
  widget: WidgetOf<T>;
  isEditing: boolean;
  onSave: (patch: UpdateWidgetRequest) => void;
  onCancel: () => void;
}
