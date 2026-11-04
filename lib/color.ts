import { RgbaColor, HslaColor, ColorBlindnessType } from "@/lib/types";

/** Opaque black. */
export const BLACK: RgbaColor = { r: 0, g: 0, b: 0, a: 1 };

/** Opaque white. */
export const WHITE: RgbaColor = { r: 255, g: 255, b: 255, a: 1 };

/**
 * Minimum WCAG contrast the UI chrome needs against the page background. Below this, the UI switches to black or
 * white ("low contrast mode") so the app stays usable no matter which colors are being tested.
 */
export const UI_MIN_CONTRAST = 3;

/* Blending and contrast */

/**
 * Blends two colors using alpha compositing (`fg` over `bg`).
 *
 * @param fg - The color on top. Its alpha controls how much of `bg` shows through.
 * @param bg - The color underneath. Its alpha is ignored.
 * @returns The blended, fully opaque color.
 */
export function blendColors(fg: RgbaColor, bg: RgbaColor): RgbaColor {
  const alpha = fg.a;
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
    a: 1,
  };
}

/**
 * Returns an opaque copy of a color. The alpha channel is discarded, not blended.
 *
 * @param color - The color to copy.
 */
export function opaque(color: RgbaColor): RgbaColor {
  return { r: color.r, g: color.g, b: color.b, a: 1 };
}

/** WCAG relative luminance of an (opaque) sRGB color, from 0 (black) to 1 (white). */
function calculateRelativeLuminance({ r, g, b }: RgbaColor) {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates the WCAG contrast ratio between two colors.
 *
 * The text color is alpha-blended over the background. If a `solidBg` is provided, the background is first blended
 * over it, which is how the min/max range for a semi-transparent background is calculated.
 *
 * @param bg - The background color. Its alpha is only used when `solidBg` is provided.
 * @param fg - The text color. Its alpha is respected.
 * @param solidBg - An optional opaque backdrop the background sits on.
 * @returns The contrast ratio (1–21), truncated to two decimals so it's never rounded up into a passing level.
 *
 * @example
 * ```ts
 * calculateWCAGContrast(WHITE, BLACK); // 21
 * ```
 */
export function calculateWCAGContrast(
  bg: RgbaColor,
  fg: RgbaColor,
  solidBg?: RgbaColor,
): number {
  const blendedBg = solidBg ? blendColors(bg, solidBg) : opaque(bg);
  const blendedFg = blendColors(fg, blendedBg);

  const bgLuminance = calculateRelativeLuminance(blendedBg);
  const fgLuminance = calculateRelativeLuminance(blendedFg);

  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  // Truncate rather than round so a 4.499 ratio is never displayed (or passed) as 4.5
  return Math.floor(ratio * 100) / 100;
}

/**
 * Determines a readable UI color for content drawn on `bg`.
 *
 * Returns the (alpha-blended) `fg` color when it has at least {@link UI_MIN_CONTRAST} against `bg`. Otherwise returns
 * black or white, whichever has more contrast with `bg`.
 *
 * @param bg - The background color. Alpha is ignored, since the UI paints it opaque.
 * @param fg - The preferred color for content. Alpha is respected.
 * @returns An opaque hex color string.
 *
 * @example
 * ```ts
 * getDisplayColor(WHITE, { r: 255, g: 0, b: 0, a: 1 }); // "#ff0000" (3.99:1, readable enough)
 * getDisplayColor(WHITE, { r: 255, g: 230, b: 0, a: 1 }); // "#000000" (too faint, falls back)
 * ```
 */
export function getDisplayColor(bg: RgbaColor, fg: RgbaColor): string {
  const displayBg = opaque(bg);
  const displayFg = blendColors(fg, displayBg);

  if (calculateWCAGContrast(displayBg, displayFg) >= UI_MIN_CONTRAST) {
    return rgbaToHex(displayFg);
  }

  return calculateWCAGContrast(displayBg, BLACK) >=
    calculateWCAGContrast(displayBg, WHITE)
    ? "#000000"
    : "#ffffff";
}

/* Conversion */

/**
 * Parses a hex color string in any of the `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` forms (the `#` is optional).
 *
 * @param hex - The hex color string. Surrounding whitespace is ignored.
 * @returns The parsed color, or `null` if the string isn't a valid hex color.
 *
 * @example
 * ```ts
 * parseHex("#f00"); // { r: 255, g: 0, b: 0, a: 1 }
 * parseHex("nope"); // null
 * ```
 */
export function parseHex(hex: string): RgbaColor | null {
  let value = hex.trim().replace(/^#/, "");

  if (!/^([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) return null;

  if (value.length <= 4) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
    a: value.length === 8 ? parseInt(value.slice(6, 8), 16) / 255 : 1,
  };
}

/**
 * Converts a color to a lowercase hex string. The alpha pair is only included when the color isn't opaque.
 *
 * @param color - The color to convert. Channels are rounded and clamped to 0–255.
 * @returns A `#rrggbb` or `#rrggbbaa` string.
 */
export function rgbaToHex({ r, g, b, a }: RgbaColor): string {
  const toHex = (value: number) =>
    Math.min(255, Math.max(0, Math.round(value)))
      .toString(16)
      .padStart(2, "0");
  const alpha = Math.round(a * 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alpha < 255 ? toHex(alpha) : ""}`;
}

/**
 * Converts a color to an opaque `#rrggbb` hex string. The alpha channel is discarded, not blended.
 *
 * @param color - The color to convert.
 */
export function rgbToHex({ r, g, b }: RgbaColor): string {
  return rgbaToHex({ r, g, b, a: 1 });
}

/**
 * Converts a color to HSL.
 *
 * @param color - The color to convert.
 * @returns The HSL color, with hue in degrees (0–360) and saturation/lightness in percent (0–100).
 */
export function rgbaToHsla({ r, g, b, a }: RgbaColor): HslaColor {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100, a };
}

/* Color blindness */

/**
 * Approximates how a color looks with a type of color blindness, using simple linear transforms. Good enough to
 * spot problem pairs; not a clinical simulation.
 *
 * @param color - The color to transform. Alpha is preserved.
 * @param type - The type of color blindness to simulate.
 * @returns The simulated color (the same color for `"normal vision"`).
 */
export function simulateColorBlindness(
  color: RgbaColor,
  type: ColorBlindnessType,
): RgbaColor {
  if (type === "normal vision") return color;

  const { r, g, b, a } = color;
  let simulatedColor: RgbaColor;

  switch (type) {
    case "protanopia":
      simulatedColor = {
        r: 0.567 * r + 0.433 * g,
        g: 0.558 * r + 0.442 * g,
        b: 0.242 * r + 0.758 * b,
        a,
      };
      break;
    case "deuteranopia":
      simulatedColor = {
        r: 0.625 * r + 0.375 * g,
        g: 0.7 * r + 0.3 * g,
        b: 0.3 * r + 0.7 * b,
        a,
      };
      break;
    case "tritanopia":
      simulatedColor = {
        r: 0.95 * r + 0.05 * g,
        g: 0.433 * r + 0.567 * g,
        b: 0.475 * r + 0.525 * g,
        a,
      };
      break;
    case "achromatopsia": {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      simulatedColor = { r: gray, g: gray, b: gray, a };
      break;
    }
    default:
      simulatedColor = color;
  }

  return {
    r: Math.round(simulatedColor.r),
    g: Math.round(simulatedColor.g),
    b: Math.round(simulatedColor.b),
    a: simulatedColor.a,
  };
}
