import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { WidgetGrid } from '../components/WidgetGrid.js';
import { renderWithClient, textWidget } from './test-utils.js';
import type { Widget } from '../types.js';

describe('WidgetGrid', () => {
  it('renders a wrapper per widget', () => {
    const second: Widget = {
      id: 2,
      position: 1,
      title: 'Text',
      createdAt: '2026-06-14T00:00:00.000Z',
      updatedAt: '2026-06-14T00:00:00.000Z',
      type: 'text',
      data: { content: 'second' },
    };
    renderWithClient(<WidgetGrid widgets={[textWidget, second]} />);

    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Widget actions' })).toHaveLength(2);
  });
});
