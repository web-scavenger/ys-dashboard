/** Pulsing fill shown while a chart has no points yet — e.g. an optimistically
 *  created chart waiting for the server to return its generated data. Avoids a
 *  flash of empty axes before the real points arrive. */
export function ChartPlaceholder() {
  return <div className="h-full w-full animate-pulse rounded-md bg-muted" />;
}
