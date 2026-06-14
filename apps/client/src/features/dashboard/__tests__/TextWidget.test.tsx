import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TextWidget } from '../components/TextWidget.js';
import type { WidgetOf } from '../types.js';

const widget: WidgetOf<'text'> = { id: 1, position: 0, type: 'text', data: { content: 'hello' } };

describe('TextWidget', () => {
  it('shows the content in view mode', () => {
    render(<TextWidget widget={widget} isEditing={false} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('edits and saves the draft via onSave', () => {
    const onSave = vi.fn();
    render(<TextWidget widget={widget} isEditing onSave={onSave} onCancel={vi.fn()} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'edited' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith({ content: 'edited' });
  });

  it('calls onCancel without saving', () => {
    const onCancel = vi.fn();
    const onSave = vi.fn();
    render(<TextWidget widget={widget} isEditing onSave={onSave} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });
});
