import { Suspense } from 'react';
import { widgetRegistry } from '../registry.js';
import type { WidgetComponentProps } from '../types.js';
import { WidgetPlaceholder } from './WidgetPlaceholder.js';

/**
 * Picks the component for a widget's type from the registry — no `switch`. The
 * registry stores each `Component` narrowed to its own variant; here the widget
 * is the open union, so we cast to the general props type. The cast is safe
 * because the registry is keyed by the same discriminant we look up with. Chart
 * components are lazy-loaded, so the render is wrapped in `Suspense` with a
 * lightweight placeholder while the chunk loads.
 */
export function WidgetRenderer({ widget, isEditing, onSave, onCancel }: WidgetComponentProps) {
  const Component = widgetRegistry[widget.type]
    .Component as React.ComponentType<WidgetComponentProps>;
  return (
    <Suspense fallback={<WidgetPlaceholder />}>
      <Component widget={widget} isEditing={isEditing} onSave={onSave} onCancel={onCancel} />
    </Suspense>
  );
}
