import type { Widget } from '../types.js';
import { WidgetWrapper } from './WidgetWrapper.js';

interface WidgetGridProps {
  widgets: Widget[];
}

/**
 * Responsive layout — one column on mobile, two at `sm`, three at `lg` (the
 * spec's 3-per-row desktop). Owns spacing/responsibility-per-size; the wrapper
 * owns each cell.
 */
export function WidgetGrid({ widgets }: WidgetGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {widgets.map((widget) => (
        <WidgetWrapper key={widget.id} widget={widget} />
      ))}
    </div>
  );
}
