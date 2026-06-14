const SKELETON_COUNT = 12;

/** Placeholder grid shown while the widget list is loading. */
export function WidgetGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading widgets"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl border bg-muted" />
      ))}
    </div>
  );
}
