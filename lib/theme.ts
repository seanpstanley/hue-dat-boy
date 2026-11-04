import {
  blendColors,
  getDisplayColor,
  opaque,
  rgbaToHex,
  rgbToHex,
  simulateColorBlindness,
} from "@/lib/color";
import { ColorBlindnessType, RgbaColor } from "@/lib/types";

/** CSS custom properties for the dynamic theme, keyed by property name (e.g. `"--ink"`). */
export type ThemeVars = Record<`--${string}`, string>;

/**
 * Builds the CSS custom properties that drive the dynamic theme. See the comment at the top of `globals.css` for what
 * each one is for.
 *
 * @param background - The background color.
 * @param foreground - The text color.
 * @param simulation - The color blindness simulation, applied to the `--sim-*` properties.
 */
export function buildThemeVars(
  background: RgbaColor,
  foreground: RgbaColor,
  simulation: ColorBlindnessType,
): ThemeVars {
  const surface = rgbToHex(background);
  const simFg = simulateColorBlindness(foreground, simulation);
  const simBg = simulateColorBlindness(background, simulation);

  return {
    "--surface": surface,
    "--ink": getDisplayColor(background, foreground),
    "--on-ink": surface,
    "--fg": rgbaToHex(foreground),
    "--bg": rgbaToHex(background),
    "--sim-fg": rgbaToHex(simFg),
    "--sim-bg": rgbaToHex(simBg),
    // Readable UI color on the simulated background (e.g. the fullscreen sheet's close button)
    "--sim-ink": getDisplayColor(simBg, simFg),
    // The sample cards are framed in the (simulated, opaque) text color, with a header label on top of that frame
    "--sim-frame": rgbToHex(simFg),
    "--sim-on-frame": getDisplayColor(opaque(simFg), simBg),
  };
}

/**
 * Serializes theme vars into a `:root { ... }` rule for an inline `<style>` tag.
 *
 * @param vars - The theme vars. Values are always generated hex strings, never raw user input, so no escaping is
 *               needed.
 */
export function themeVarsToCss(vars: ThemeVars): string {
  return `:root{${Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(";")}}`;
}

/**
 * Checks whether the UI had to fall back to black or white because the text color is too low-contrast against the
 * background to build an interface with ("low contrast mode").
 *
 * @param background - The background color.
 * @param foreground - The text color.
 * @returns Which color the UI switched to, or `null` if it's using the text color.
 */
export function getLowContrastFallback(
  background: RgbaColor,
  foreground: RgbaColor,
): "black" | "white" | null {
  const ink = getDisplayColor(background, foreground);
  const blended = rgbToHex(blendColors(foreground, opaque(background)));
  if (ink === blended) return null;
  return ink === "#000000" ? "black" : "white";
}

/**
 * Builds the favicon (the wordmark dot on a rounded tile) in the current colors. Uses the same colors as the
 * wordmark: the background for the tile and the UI ink color for the dot, so the dot stays visible even when the text
 * color is too low-contrast.
 *
 * @param background - The background color (alpha ignored).
 * @param foreground - The text color.
 * @returns An SVG data URI, ready for a `<link rel="icon">` href.
 */
export function buildFaviconHref(
  background: RgbaColor,
  foreground: RgbaColor,
): string {
  const tile = rgbToHex(background);
  const dot = getDisplayColor(background, foreground);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${tile}"/><circle cx="16" cy="16" r="8.5" fill="${dot}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
