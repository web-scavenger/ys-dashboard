import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TextWidget } from '../components/TextWidget.js';
import type { WidgetOf } from '../types.js';

const widget: WidgetOf<'text'> = {
  id: 1,
  position: 0,
  title: 'Text',
  createdAt: '2026-06-14T00:00:00.000Z',
  updatedAt: '2026-06-14T00:00:00.000Z',
  type: 'text',
  data: { content: 'hello' },
};

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

  it('saves on Enter without inserting a newline', () => {
    const onSave = vi.fn();
    render(<TextWidget widget={widget} isEditing onSave={onSave} onCancel={vi.fn()} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'edited' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(onSave).toHaveBeenCalledWith({ content: 'edited' });
    expect(textarea.value).toBe('edited');
  });

  it('inserts a newline at the caret on Cmd+Enter without saving', () => {
    const onSave = vi.fn();
    render(<TextWidget widget={widget} isEditing onSave={onSave} onCancel={vi.fn()} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'ab' } });
    textarea.setSelectionRange(1, 1);
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    expect(onSave).not.toHaveBeenCalled();
    expect(textarea.value).toBe('a\nb');
    expect(textarea.selectionStart).toBe(2);
    expect(textarea.selectionEnd).toBe(2);
  });

  it('inserts a newline on Ctrl+Enter without saving', () => {
    const onSave = vi.fn();
    render(<TextWidget widget={widget} isEditing onSave={onSave} onCancel={vi.fn()} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'ab' } });
    textarea.setSelectionRange(2, 2);
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    expect(onSave).not.toHaveBeenCalled();
    expect(textarea.value).toBe('ab\n');
  });

  it('does not save on Enter while composing (IME)', () => {
    const onSave = vi.fn();
    render(<TextWidget widget={widget} isEditing onSave={onSave} onCancel={vi.fn()} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'edited' } });
    fireEvent.keyDown(textarea, { key: 'Enter', isComposing: true });

    expect(onSave).not.toHaveBeenCalled();
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
