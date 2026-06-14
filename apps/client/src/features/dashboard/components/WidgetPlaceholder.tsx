/**
 * Lightweight pulse box shown while a widget's body is offscreen or its
 * lazy-loaded chunk is still resolving. Holds the cell's height so there is no
 * layout shift when the real widget mounts.
 */
export function WidgetPlaceholder() {
  return <div className="h-full w-full animate-pulse rounded-md bg-muted" />;
}
