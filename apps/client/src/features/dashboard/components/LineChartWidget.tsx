import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WidgetComponentProps } from '../types.js';
import { ChartPlaceholder } from './ChartPlaceholder.js';

export function LineChartWidget({ widget }: WidgetComponentProps<'line'>) {
  if (widget.data.points.length === 0) {
    return <ChartPlaceholder />;
  }
  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 200 }}>
      <LineChart data={widget.data.points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
