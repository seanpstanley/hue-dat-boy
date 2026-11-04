import { ColorBlindnessType, RgbaColor } from "@/lib/types";
import {
  getDisplayColor,
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
