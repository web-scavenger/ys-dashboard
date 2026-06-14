import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const updateMutate = vi.fn();
const deleteMutate = vi.fn();

vi.mock('../api/useWidgets.js', () => ({
  useUpdateWidget: () => ({ mutate: updateMutate, isPending: false, error: null }),
  useDeleteWidget: () => ({ mutate: deleteMutate, isPending: false, error: null }),
}));

const { WidgetWrapper } = await import('../components/WidgetWrapper.js');
const { textWidget, openRadixMenu } = await import('./test-utils.js');

afterEach(() => {
  updateMutate.mockReset();
  deleteMutate.mockReset();
});

describe('WidgetWrapper', () => {
  it('toggles inline edit mode from the menu', async () => {
    render(<WidgetWrapper widget={textWidget} />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    openRadixMenu(screen.getByRole('button', { name: 'Widget actions' }));
    fireEvent.click(await screen.findByText('Edit'));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('saves an edit through the update mutation', async () => {
    render(<WidgetWrapper widget={textWidget} />);

    openRadixMenu(screen.getByRole('button', { name: 'Widget actions' }));
    fireEvent.click(await screen.findByText('Edit'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'next' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateMutate).toHaveBeenCalledWith(
      { id: textWidget.id, body: { content: 'next' } },
      expect.any(Object),
    );
  });

  it('deletes through the delete mutation', async () => {
    render(<WidgetWrapper widget={textWidget} />);

    openRadixMenu(screen.getByRole('button', { name: 'Widget actions' }));
    fireEvent.click(await screen.findByText('Delete'));

    expect(deleteMutate).toHaveBeenCalledWith(textWidget.id);
  });
});
