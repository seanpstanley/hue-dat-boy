import { RgbaColor, HslaColor } from "@/lib/types";

/**
 * Blends two colors using alpha compositing.
 * @param     {RgbaColor}   fg    The RGBA color object representing the foreground color.
 * @param     {RgbaColor}   bg    The RGBA color object representing the background color.
 * @returns   {RgbaColor}         The blended RGBA color object.
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

function calculateRelativeLuminance({ r, g, b }: RgbaColor) {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates the WCAG contrast ratio between two colors.
 * @param     {RgbaColor}   bg        The RGBA color object representing the background color
 * @param     {RgbaColor}   fg        The RGBA color object representing the foreground color.
 * @param     {RgbaColor}   solidBg   Optional solid background RGBA color for blending.
 * @returns   {number}                The contrast ratio as a number.
 */
export function calculateWCAGContrast(
  bg: RgbaColor,
  fg: RgbaColor,
  solidBg?: RgbaColor,
): number {
  const blendedFg = blendColors(fg, solidBg || bg);
  const blendedBg = solidBg || bg;

  const bgLuminance = calculateRelativeLuminance(blendedBg);
  const fgLuminance = calculateRelativeLuminance(blendedFg);

  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  if (ratio === 1) return Number(ratio.toPrecision(1));

  return Number(ratio.toFixed(2));
}

// export function calculateWCAGContrast(bg: RgbaColor, fg: RgbaColor) {
//   const bgLuminance = calculateRelativeLuminance(bg);
//   const fgLuminance = calculateRelativeLuminance(fg);

//   const lighter = Math.max(bgLuminance, fgLuminance);
//   const darker = Math.min(bgLuminance, fgLuminance);

//   const ratio = (lighter + 0.05) / (darker + 0.05);

//   if (ratio === 1) return Number(ratio.toPrecision(1));

//   return Number(ratio.toFixed(2));
// }

/**
 * Determines the display color (foreground) for a given background color.
 * Will return black (#000) or white (#fff) if the WCAG contrast ratio is less than 3, depending on which color creates a higher contrast.
 * @param     {RgbaColor}   bg    The RGBA color object representing the backround color
 * @param     {RgbaColor}   fg    The RGBA color object representing the foreground color.
 * @returns   {string}            The HEX color string for the foreground color.
 */
export function getDisplayColor(bg: RgbaColor, fg: RgbaColor): string {
  const displayFg: RgbaColor = { r: fg.r, g: fg.g, b: fg.b, a: 1 };
  const displayBg: RgbaColor = { r: bg.r, g: bg.g, b: bg.b, a: 1 };
  const contrastRatio = calculateWCAGContrast(displayBg, displayFg);

  if (contrastRatio >= 3.0) {
    return rgbaToHex(displayFg);
  }

  const blackContrast = calculateWCAGContrast(displayBg, {
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  });
  const whiteContrast = calculateWCAGContrast(displayBg, {
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  });

  return blackContrast > whiteContrast ? "#000000" : "#ffffff";
}

/*  Color Conversion Functions */

/**
 * Converts a HEX color string to an RGBA color object.
 * @param     {string}      hex   The HEX color string (e.g., "#RRGGBB").
 * @returns   {RgbaColor}         The RGBA color object with properties {r, g, b, a}.
 */
export function hexToRgba(hex: string): RgbaColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(
    hex,
  );

  if (!result) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  const a = result[4] ? parseInt(result[4], 16) / 255 : 1; // Convert alpha (0-255) to 0-1 range

  return { r, g, b, a };
}

/**
 * Converts an RGBA color object to a HEX color string.
 * @param {RgbaColor} rgba The RGBA color object with properties {r, g, b, a}.
 * @returns {string} The HEX color string.
 */
export function rgbaToHex({ r, g, b, a }: RgbaColor): string {
  const toHex = (value: number) =>
    Math.round(value).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${
    a < 1 ? toHex(Math.round(a * 255)) : ""
  }`;
}

/**
 * Converts an RGB color object to a HEX color string.
 * @param     {RgbColor}    rgb   The RGB color object with properties {r, g, b}.
 * @returns   {string}            The HEX color string.
 */
export function rgbToHex({ r, g, b }: RgbaColor): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

// export function hexToRgb(hex: string): RgbColor {
//   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//   return result
//     ? {
//         r: parseInt(result[1], 16),
//         g: parseInt(result[2], 16),
//         b: parseInt(result[3], 16),
//         a: result[4] ? parseInt(result[4], 16) / 255 : 1,
//       }
//     : { r: 0, g: 0, b: 0, a: 1 };
// }

/**
 * Converts a HEX color string to an RGBA color object.
 * @param     {string}      hex   The HEX color string (e.g., "#RRGGBB" or "#RRGGBBAA").
 * @returns   {RgbaColor}         The RGBA color object with properties {r, g, b, a}.
 * @throws                        Will throw an error if the HEX color format is invalid.
 */
export function hexToRgb(hex: string): RgbaColor {
  const parsedHex = hex.replace("#", "");
  let r, g, b, a;

  if (parsedHex.length === 6) {
    // No alpha
    r = parseInt(parsedHex.slice(0, 2), 16);
    g = parseInt(parsedHex.slice(2, 4), 16);
    b = parseInt(parsedHex.slice(4, 6), 16);
    a = 1; // Default alpha
  } else if (parsedHex.length === 8) {
    // With alpha
    r = parseInt(parsedHex.slice(0, 2), 16);
    g = parseInt(parsedHex.slice(2, 4), 16);
    b = parseInt(parsedHex.slice(4, 6), 16);
    a = parseInt(parsedHex.slice(6, 8), 16) / 255; // Normalize alpha
  } else {
    throw new Error("Invalid HEX color format");
  }

  return { r, g, b, a };
}

/**
 * Converts an RGBA color object to an HSLA color object.
 * @param     {RgbaColor}   rgba    The RGBA color object with properties {r, g, b, a}.
 * @returns   {HslaColor}           The HSLA color object with properties {h, s, l, a}.
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
 * Converts an HSL color object to an RGB color object. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param    {HslaColor}   hsla    The HSLA color object with properties {h, s, l, a}.
 * @returns  {RgbaColor}           The RGBA color object with properties {r, g, b, a}.
 */
export function hslaToRgba({ h, s, l }: HslaColor): RgbaColor {
  let r, g, b;

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
    a: 1,
  };
}
