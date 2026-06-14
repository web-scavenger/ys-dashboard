import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { WidgetComponentProps } from '../types.js';

export function TextWidget({ widget, isEditing, onSave, onCancel }: WidgetComponentProps<'text'>) {
  const [draft, setDraft] = useState(widget.data.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaret = useRef<number | null>(null);

  useEffect(() => {
    if (isEditing) {
      setDraft(widget.data.content);
      textareaRef.current?.focus();
    }
  }, [isEditing, widget.data.content]);

  useLayoutEffect(() => {
    if (pendingCaret.current === null || !textareaRef.current) {
      return;
    }
    const caret = pendingCaret.current;
    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = caret;
    pendingCaret.current = null;
  }, [draft]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.target.value);
  };

  const handleSave = () => {
    onSave({ content: draft });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return;
    }
    event.preventDefault();
    if (event.metaKey || event.ctrlKey) {
      const { selectionStart, selectionEnd } = event.currentTarget;
      setDraft(`${draft.slice(0, selectionStart)}\n${draft.slice(selectionEnd)}`);
      pendingCaret.current = selectionStart + 1;
      return;
    }
    onSave({ content: draft });
  };

  if (isEditing) {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="min-h-0 flex-1 resize-none rounded-md border bg-background p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Write something…"
        />
        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto text-xs text-muted-foreground">
            Enter to save · ⌘/Ctrl+Enter for a new line
          </span>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto whitespace-pre-wrap break-words text-sm">
      {widget.data.content || <span className="text-muted-foreground">Empty text widget</span>}
    </div>
  );
}
