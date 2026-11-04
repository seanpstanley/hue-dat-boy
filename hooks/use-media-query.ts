import { useSyncExternalStore } from "react";

/**
 * Tracks whether a CSS media query matches, updating when it changes.
 *
 * @param query - The media query, e.g. `"(min-width: 768px)"`.
 * @returns Whether it matches. Always `false` during server rendering.
 *
 * @example
 * ```tsx
 * const isDesktop = useMediaQuery("(min-width: 768px)");
 * ```
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
