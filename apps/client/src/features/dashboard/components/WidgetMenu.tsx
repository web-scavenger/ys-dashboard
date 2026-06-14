import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { widgetRegistry } from '../registry.js';
import type { WidgetType } from '../types.js';

interface WidgetMenuProps {
  type: WidgetType;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * The 3-dots menu lives on the wrapper, not the widget. Edit is offered only for
 * registry-editable types; Delete is always available.
 */
export function WidgetMenu({ type, disabled, onEdit, onDelete }: WidgetMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
          aria-label="Widget actions"
          disabled={disabled}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {widgetRegistry[type].editable && (
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
