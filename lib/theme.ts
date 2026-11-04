import { ColorBlindnessType, RgbaColor } from "@/lib/types";
import {
  blendColors,
  getDisplayColor,
  opaque,
  parseHex,
  rgbaToHex,
  rgbToHex,
  simulateColorBlindness,
} from "@/lib/utils/color";

/**
 * Builds the CSS custom properties that drive the dynamic theme (see the comment at the top of globals.css).
 */
export function buildThemeVars(
  foreground: RgbaColor,
  background: RgbaColor,
  simulation: ColorBlindnessType,
): Record<string, string> {
  const surface = rgbToHex(background);
  const simFg = simulateColorBlindness(foreground, simulation);
  const simBg = simulateColorBlindness(background, simulation);
  // The sample cards are framed in the (simulated, opaque) text color, with a header label on top of that frame
  const simFrame = rgbToHex(simFg);

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
    "--sim-frame": simFrame,
    "--sim-on-frame": getDisplayColor(parseHex(simFrame)!, simBg),
  };
}

/** Serializes theme vars into a `:root { ... }` rule. Values are always generated hex strings, never user input. */
export function themeVarsToCss(vars: Record<string, string>): string {
  return `:root{${Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(";")}}`;
}

/**
 * Whether the UI had to fall back to black or white because the text color is too low-contrast against the
 * background to build an interface with ("low contrast mode"). Returns which color it switched to, or null.
 */
export function getLowContrastFallback(
  foreground: RgbaColor,
  background: RgbaColor,
): "black" | "white" | null {
  const ink = getDisplayColor(background, foreground);
  const blended = rgbToHex(blendColors(foreground, opaque(background)));
  if (ink === blended) return null;
  return ink === "#000000" ? "black" : "white";
}
