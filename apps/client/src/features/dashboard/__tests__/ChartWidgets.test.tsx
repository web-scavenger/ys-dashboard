import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BarChartWidget } from '../components/BarChartWidget.js';
import { LineChartWidget } from '../components/LineChartWidget.js';
import { barWidget, lineWidget } from './test-utils.js';
import type { WidgetOf } from '../types.js';

// recharts renders a 0-width container in jsdom; we assert the responsive
// container mounts rather than inspecting the (unrendered) SVG.
describe('chart widgets', () => {
  it('renders the line chart container', () => {
    const { container } = render(
      <LineChartWidget
        widget={lineWidget as WidgetOf<'line'>}
        isEditing={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders the bar chart container', () => {
    const { container } = render(
      <BarChartWidget
        widget={barWidget as WidgetOf<'bar'>}
        isEditing={false}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
