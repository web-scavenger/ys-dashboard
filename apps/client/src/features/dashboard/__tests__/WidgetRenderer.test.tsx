import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WidgetRenderer } from '../components/WidgetRenderer.js';
import { lineWidget, textWidget } from './test-utils.js';

describe('WidgetRenderer', () => {
  it('renders the text component for a text widget', () => {
    render(
      <WidgetRenderer widget={textWidget} isEditing={false} onSave={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders a chart container for a chart widget', async () => {
    const { container } = render(
      <WidgetRenderer widget={lineWidget} isEditing={false} onSave={vi.fn()} onCancel={vi.fn()} />,
    );
    // The chart component is lazy-loaded, so wait for the Suspense boundary to
    // resolve before the recharts container appears.
    await waitFor(() =>
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument(),
    );
  });
});
