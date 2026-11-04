/**
 * A tiny shared store for recently used colors: every color picker reads and writes the same list, which is persisted
 * in localStorage when it's available.
 */
import { useSyncExternalStore } from "react";

import { parseHex } from "@/lib/color";

const STORAGE_KEY = "hue-dat-boy:recent-colors";
const MAX_COLORS = 8;
const EMPTY: string[] = [];

let colors: string[] | null = null;
const listeners = new Set<() => void>();

function load(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored)
      ? stored
          .filter((c): c is string => typeof c === "string" && !!parseHex(c))
          .slice(0, MAX_COLORS)
      : [];
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); recents just won't persist
    return [];
  }
}

function getSnapshot() {
  colors ??= load();
  return colors;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Adds a color to the front of the recent colors list, moving it there if it's already in the list. The list keeps
 * the 8 most recent colors.
 *
 * @param hex - The color, as a hex string.
 */
export function addRecentColor(hex: string) {
  colors = [hex, ...getSnapshot().filter((c) => c !== hex)].slice(
    0,
    MAX_COLORS,
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  } catch {
    // See load()
  }
  listeners.forEach((listener) => listener());
}

/**
 * Subscribes to the recent colors list.
 *
 * @returns Hex colors, newest first. Always empty during server rendering.
 *
 * @example
 * ```tsx
 * const recent = useRecentColors();
 * recent.map((hex) => <Swatch key={hex} color={hex} />);
 * ```
 */
export function useRecentColors() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
