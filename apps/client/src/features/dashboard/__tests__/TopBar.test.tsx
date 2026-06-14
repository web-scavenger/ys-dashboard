import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { TopBar } from '../components/TopBar.js';
import { renderWithClient } from './test-utils.js';

describe('TopBar', () => {
  it('shows the title and opens the add-widget dialog', async () => {
    renderWithClient(<TopBar />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add widget/i }));

    expect(await screen.findByText('Add a widget')).toBeInTheDocument();
  });
});
