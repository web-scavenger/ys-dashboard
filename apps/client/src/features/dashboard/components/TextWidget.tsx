import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { WidgetComponentProps } from '../types.js';

export function TextWidget({ widget, isEditing, onSave, onCancel }: WidgetComponentProps<'text'>) {
  const [draft, setDraft] = useState(widget.data.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      setDraft(widget.data.content);
      textareaRef.current?.focus();
    }
  }, [isEditing, widget.data.content]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.target.value);
  };

  const handleSave = () => {
    onSave({ content: draft });
  };

  if (isEditing) {
    return (
      <div className="flex h-full w-full flex-col gap-2">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleChange}
          className="min-h-0 flex-1 resize-none rounded-md border bg-background p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Write something…"
        />
        <div className="flex justify-end gap-2">
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
