import { useState } from 'react';
import type { UpdateWidgetRequest } from '@ys/contracts';
import { useDeleteWidget, useUpdateWidget } from '../api/useWidgets.js';
import type { Widget } from '../types.js';
import { WidgetMenu } from './WidgetMenu.js';
import { WidgetRenderer } from './WidgetRenderer.js';

interface WidgetWrapperProps {
  widget: Widget;
}

/**
 * The grid cell: border + shadow + fixed height, and the owner of per-widget
 * concerns — the edit lifecycle, the update/delete mutations, and the
 * in-flight/error UI. Widgets stay presentational; the wrapper drives them.
 */
export function WidgetWrapper({ widget }: WidgetWrapperProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateWidget = useUpdateWidget();
  const deleteWidget = useDeleteWidget();

  const isPending = updateWidget.isPending || deleteWidget.isPending;
  const error = updateWidget.error ?? deleteWidget.error;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (patch: UpdateWidgetRequest) => {
    updateWidget.mutate(
      { id: widget.id, body: patch },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteWidget.mutate(widget.id);
  };

  return (
    <div className="group relative flex h-64 flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="absolute right-2 top-2 z-10">
        <WidgetMenu
          type={widget.type}
          disabled={isPending}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <div className="min-h-0 flex-1">
        <WidgetRenderer
          widget={widget}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}
