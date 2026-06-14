/**
 * Whether an element's box is within the viewport, expanded by `margin` px on
 * every side. Mirrors the `IntersectionObserver` `rootMargin` it's used with, so
 * an already-visible element can be detected synchronously (before paint) and
 * skip the placeholder.
 */
export function isNearViewport(element: Element, margin: number): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  return (
    rect.top <= viewportHeight + margin &&
    rect.bottom >= -margin &&
    rect.left <= viewportWidth + margin &&
    rect.right >= -margin
  );
}
