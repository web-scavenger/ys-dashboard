import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { WidgetComponentProps } from '../types.js';
import { ChartPlaceholder } from './ChartPlaceholder.js';

export function BarChartWidget({ widget }: WidgetComponentProps<'bar'>) {
  if (widget.data.points.length === 0) {
    return <ChartPlaceholder />;
  }
  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height: 200 }}>
      <BarChart data={widget.data.points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
