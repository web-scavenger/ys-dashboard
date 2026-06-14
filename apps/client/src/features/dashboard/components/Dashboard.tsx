import { useWidgets } from '../api/useWidgets.js';
import { TopBar } from './TopBar.js';
import { WidgetGrid } from './WidgetGrid.js';
import { WidgetGridSkeleton } from './WidgetGridSkeleton.js';

export function Dashboard() {
  const { data: widgets, isPending, isError, error } = useWidgets();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <main className="p-6">
        {isPending && <WidgetGridSkeleton />}
        {isError && (
          <p role="alert" className="text-destructive">
            Failed to load widgets: {error.message}
          </p>
        )}
        {widgets &&
          (widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <p className="text-lg font-medium">No widgets yet</p>
              <p className="text-sm">Use “Add widget” to create your first one.</p>
            </div>
          ) : (
            <WidgetGrid widgets={widgets} />
          ))}
      </main>
    </div>
  );
}
