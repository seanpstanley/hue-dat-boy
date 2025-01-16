import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RgbaColor, HslaColor } from "@/lib/types";

/**
 * Merges class names conditionally and handles Tailwind merging.
 * @param inputs - The class names or conditions.
 * @returns A single merged class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Blends two colors using alpha compositing.
 * @param fg - The RGBA color object representing the foreground color.
 * @param bg - The RGBA color object representing the background color.
 * @returns The blended RGBA color object.
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
 * @param bg - The RGBA color object representing the background color
 * @param fg - The RGBA color object representing the foreground color.
 * @param solidBg - Optional solid background RGBA color for blending.
 * @returns The contrast ratio as a number.
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
 * @param bg - The RGBA color object representing the backround color
 * @param fg - The RGBA color object representing the foreground color.
 * @returns The HEX color string for the foreground color.
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
 * @param hex - The HEX color string (e.g., "#RRGGBB").
 * @returns The RGBA color object with properties {r, g, b, a}.
 */
export function hexToRgba(hex: string): RgbaColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1,
      }
    : { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Converts an RGBA color object to a HEX color string.
 * @param rgba - The RGBA color object with properties {r, g, b, a}.
 * @returns The HEX color string.
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
 * @param rgb - The RGB color object with properties {r, g, b}.
 * @returns The HEX color string.
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
 * @param hex - The HEX color string (e.g., "#RRGGBB" or "#RRGGBBAA").
 * @returns The RGBA color object with properties {r, g, b, a}.
 * @throws Will throw an error if the HEX color format is invalid.
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
 * @param rgba - The RGBA color object with properties {r, g, b, a}.
 * @returns The HSLA color object with properties {h, s, l, a}.
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
 * Converts an HSLA color object to an RGBA color object.
 * @param hsla - The HSLA color object with properties {h, s, l, a}.
 * @returns The RGBA color object with properties {r, g, b, a}.
 */
export function hslaToRgba({ h, s, l, a }: HslaColor): RgbaColor {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const f = (n: number) =>
    l - s * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
    a,
  };
}

/**
 * Creates a debounced version of a function that delays its execution.
 * @param func - The function to debounce.
 * @param wait - The delay in milliseconds.
 * @returns A debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
