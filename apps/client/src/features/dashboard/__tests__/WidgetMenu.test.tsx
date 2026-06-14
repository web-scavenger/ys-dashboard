import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { WidgetMenu } from '../components/WidgetMenu.js';
import { openRadixMenu } from './test-utils.js';

function openMenu() {
  openRadixMenu(screen.getByRole('button', { name: 'Widget actions' }));
}

describe('WidgetMenu', () => {
  it('offers Edit and Delete for an editable type', async () => {
    render(<WidgetMenu type="text" disabled={false} onEdit={vi.fn()} onDelete={vi.fn()} />);
    openMenu();

    expect(await screen.findByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('hides Edit for a non-editable type', async () => {
    render(<WidgetMenu type="line" disabled={false} onEdit={vi.fn()} onDelete={vi.fn()} />);
    openMenu();

    expect(await screen.findByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('fires onDelete when Delete is selected', async () => {
    const onDelete = vi.fn();
    render(<WidgetMenu type="text" disabled={false} onEdit={vi.fn()} onDelete={onDelete} />);
    openMenu();

    fireEvent.click(await screen.findByText('Delete'));

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
