import { RgbaColor, HslaColor, ColorBlindnessType } from "@/lib/types";

export const BLACK: RgbaColor = { r: 0, g: 0, b: 0, a: 1 };
export const WHITE: RgbaColor = { r: 255, g: 255, b: 255, a: 1 };

/**
 * Minimum WCAG contrast the UI chrome needs against the page background. Below this, the UI switches to black or
 * white ("low contrast mode") so the app stays usable no matter which colors are being tested.
 */
export const UI_MIN_CONTRAST = 3;

/**
 * Blends two colors using alpha compositing (`fg` over `bg`).
 * @param     {RgbaColor}   fg    The RGBA color object representing the foreground color.
 * @param     {RgbaColor}   bg    The RGBA color object representing the background color. Its alpha is ignored.
 * @returns   {RgbaColor}         The blended, fully opaque RGBA color object.
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

/** Returns an opaque copy of the color (alpha discarded, not blended). */
export function opaque(color: RgbaColor): RgbaColor {
  return { r: color.r, g: color.g, b: color.b, a: 1 };
}

/** Whether two colors are identical once rounded to 8-bit hex. */
export function colorsEqual(a: RgbaColor, b: RgbaColor): boolean {
  return rgbaToHex(a) === rgbaToHex(b);
}

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
 * @param     {RgbaColor}   bg        The RGBA color object representing the background color
 * @param     {RgbaColor}   fg        The RGBA color object representing the foreground color.
 * @param     {RgbaColor}   solidBg   Optional opaque backdrop the background sits on.
 * @returns   {number}                The contrast ratio, rounded to two decimals.
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
 * @param     {RgbaColor}   bg    The RGBA color object representing the background color. Alpha is ignored, since
 *                                the UI paints it opaque.
 * @param     {RgbaColor}   fg    The RGBA color object representing the foreground color. Alpha is respected.
 * @returns   {string}            An opaque HEX color string.
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

/*  Color Conversion Functions */

/**
 * Parses a HEX color string in any of the `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` forms (the `#` is optional).
 * @param     {string}              hex   The HEX color string.
 * @returns   {RgbaColor | null}          The parsed color, or `null` if the string isn't a valid HEX color.
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
 * Converts a HEX color string to an RGBA color object.
 * @param     {string}      hex   The HEX color string (e.g., "#RRGGBB").
 * @returns   {RgbaColor}         The RGBA color object, or opaque black if the string is invalid.
 */
export function hexToRgba(hex: string): RgbaColor {
  return parseHex(hex) ?? { ...BLACK };
}

/**
 * Converts a HEX color string to an RGBA color object.
 * @param     {string}      hex   The HEX color string (e.g., "#RRGGBB" or "#RRGGBBAA").
 * @returns   {RgbaColor}         The RGBA color object with properties {r, g, b, a}.
 * @throws                        Will throw an error if the HEX color format is invalid.
 */
export function hexToRgb(hex: string): RgbaColor {
  const color = parseHex(hex);
  if (!color) throw new Error("Invalid HEX color format");
  return color;
}

/**
 * Converts an RGBA color object to a HEX color string. Alpha is only included when it's less than 1.
 * @param {RgbaColor} rgba The RGBA color object with properties {r, g, b, a}.
 * @returns {string} The HEX color string.
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
 * Converts an RGB color object to an opaque HEX color string (alpha is discarded).
 * @param     {RgbColor}    rgb   The RGB color object with properties {r, g, b}.
 * @returns   {string}            The HEX color string.
 */
export function rgbToHex({ r, g, b }: RgbaColor): string {
  return rgbaToHex({ r, g, b, a: 1 });
}

/**
 * Converts an RGBA color object to an HSLA color object.
 * @param     {RgbaColor}   rgba    The RGBA color object with properties {r, g, b, a}.
 * @returns   {HslaColor}           The HSLA color object, with h in degrees [0, 360) and s/l in percent [0, 100].
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

/**
 * Converts an HSLA color object to an RGBA color object. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 *
 * @param    {HslaColor}   hsla    The HSLA color object, with h in degrees and s/l in percent (same as rgbaToHsla).
 * @returns  {RgbaColor}           The RGBA color object with properties {r, g, b, a}.
 */
export function hslaToRgba({ h, s, l, a }: HslaColor): RgbaColor {
  let r, g, b;

  h = (((h % 360) + 360) % 360) / 360;
  s /= 100;
  l /= 100;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: a ?? 1,
  };
}

/**
 * Simulates color blindness by transforming RGB colors.
 * @param     {RgbaColor}           color   Input color as an RGBA color object to be transformed based on type selection.
 * @param     {ColorBlindnessType}  type    The type of color blindness to simulate.
 * @returns                                 The transformed color as an object with properties {r, g, b}.
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
      simulatedColor = { r: gray, g: gray, b: gray, a: a };
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
