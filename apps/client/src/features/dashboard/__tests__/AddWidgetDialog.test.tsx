import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const createMutate = vi.fn();

vi.mock('../api/useWidgets.js', () => ({
  useCreateWidget: () => ({ mutate: createMutate, isPending: false, isError: false, error: null }),
}));

const { AddWidgetDialog } = await import('../components/AddWidgetDialog.js');

afterEach(() => {
  createMutate.mockReset();
});

describe('AddWidgetDialog', () => {
  it('opens the modal and lists the widget types', async () => {
    render(<AddWidgetDialog />);
    fireEvent.click(screen.getByRole('button', { name: /add widget/i }));

    expect(await screen.findByText('Add a widget')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Line chart' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bar chart' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Text' })).toBeInTheDocument();
  });

  it('creates the chosen type', async () => {
    render(<AddWidgetDialog />);
    fireEvent.click(screen.getByRole('button', { name: /add widget/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Bar chart' }));

    expect(createMutate).toHaveBeenCalledWith({ type: 'bar' }, expect.any(Object));
  });
});
