import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WidgetGridSkeleton } from '../components/WidgetGridSkeleton.js';

describe('WidgetGridSkeleton', () => {
  it('renders a busy placeholder grid', () => {
    render(<WidgetGridSkeleton />);
    expect(screen.getByLabelText('Loading widgets')).toHaveAttribute('aria-busy', 'true');
  });
});
