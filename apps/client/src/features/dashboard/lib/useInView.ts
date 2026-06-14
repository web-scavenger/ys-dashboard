import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { isNearViewport } from './isNearViewport.js';

interface UseInViewOptions {
  /** Pixels to expand the viewport by, so content mounts just before it enters. */
  rootMargin?: number;
  /** Latch to `true` on first intersection and stop observing (default). */
  once?: boolean;
}

interface UseInViewResult<T extends Element> {
  ref: RefObject<T>;
  inView: boolean;
}

/**
 * Reports whether the referenced element is near the viewport via
 * `IntersectionObserver`. On mount it seeds the result synchronously (in a
 * layout effect, before paint) so an already-visible element never flashes a
 * placeholder. Where the API is unavailable (jsdom, older runtimes) it degrades
 * to always-visible. With `once` (the default) it latches on first intersection
 * and disconnects — callers can mount heavy content lazily and keep it mounted.
 */
export function useInView<T extends Element>({
  rootMargin = 200,
  once = true,
}: UseInViewOptions = {}): UseInViewResult<T> {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const element = ref.current;
    if (!element) {
      return;
    }

    // Seed before paint: an element already in view skips the placeholder, and
    // when latching (`once`) there is nothing left to observe.
    const visible = isNearViewport(element, rootMargin);
    if (visible) {
      setInView(true);
      if (once) {
        return;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin: `${rootMargin}px` },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, once]);

  return { ref, inView };
}
