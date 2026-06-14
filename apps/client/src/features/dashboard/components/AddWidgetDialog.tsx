import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateWidget } from '../api/useWidgets.js';
import { widgetTypes } from '../registry.js';
import type { WidgetType } from '../types.js';
import { WidgetTypeOption } from './WidgetTypeOption.js';

/**
 * Top-bar action: opens a modal listing the registry's widget types and creates
 * the chosen one. Reads `widgetRegistry`, so a new type appears here for free.
 */
export function AddWidgetDialog() {
  const [open, setOpen] = useState(false);
  const createWidget = useCreateWidget();

  const handleSelect = (type: WidgetType) => {
    createWidget.mutate(
      { type },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add widget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a widget</DialogTitle>
          <DialogDescription>Pick a widget type to add to your dashboard.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {widgetTypes.map((type) => (
            <WidgetTypeOption
              key={type}
              type={type}
              disabled={createWidget.isPending}
              onSelect={handleSelect}
            />
          ))}
        </div>
        {createWidget.isError && (
          <p role="alert" className="text-sm text-destructive">
            {createWidget.error.message}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
