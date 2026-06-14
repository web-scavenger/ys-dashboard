import { lazy, type ComponentType } from 'react';
import { TextWidget } from './components/TextWidget.js';
import type { WidgetComponentProps, WidgetOf, WidgetType } from './types.js';

// The chart widgets pull in Recharts (a large charting library). Lazy-load them
// so Recharts is split into its own chunk and only downloaded when a chart is
// actually rendered — keeping it out of the initial dashboard bundle. Text stays
// eager since it's tiny and always cheap to render.
const LineChartWidget = lazy(() =>
  import('./components/LineChartWidget.js').then((m) => ({ default: m.LineChartWidget })),
);
const BarChartWidget = lazy(() =>
  import('./components/BarChartWidget.js').then((m) => ({ default: m.BarChartWidget })),
);

interface WidgetDefinition<T extends WidgetType> {
  /** Human label shown in the add-widget picker. */
  label: string;
  /** Whether the 3-dots menu offers an inline "Edit" action. */
  editable: boolean;
  Component: ComponentType<WidgetComponentProps<T>>;
  /** Placeholder payload for an optimistically-created widget, shown until the
   *  server returns the real (e.g. randomly generated) data. */
  createInitialData: () => WidgetOf<T>['data'];
}

/**
 * The single client-side source of widget behavior. Keyed by `WidgetType`, so
 * adding a member to the union forces a new entry here (or the build fails) —
 * the add-dialog, the 3-dots menu, and the renderer all read from this map, so
 * a new widget type is a one-entry change with no `switch` statements.
 */
export const widgetRegistry: { [T in WidgetType]: WidgetDefinition<T> } = {
  line: {
    label: 'Line chart',
    editable: false,
    Component: LineChartWidget,
    createInitialData: () => ({ points: [] }),
  },
  bar: {
    label: 'Bar chart',
    editable: false,
    Component: BarChartWidget,
    createInitialData: () => ({ points: [] }),
  },
  text: {
    label: 'Text',
    editable: true,
    Component: TextWidget,
    createInitialData: () => ({ content: '' }),
  },
};

export const widgetTypes = Object.keys(widgetRegistry) as WidgetType[];
