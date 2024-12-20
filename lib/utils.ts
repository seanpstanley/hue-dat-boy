import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RgbColor, RgbaColor, HslColor } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function blendColors(fg: RgbColor, bg: RgbColor): RgbColor {
  const alpha = fg.a;
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
    a: 1,
  };
}

function calculateRelativeLuminance({ r, g, b }: RgbColor) {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateWCAGContrast(
  bg: RgbColor,
  fg: RgbColor,
  solidBg?: RgbColor
): number {
  const blendedFg = blendColors(fg, solidBg || bg);
  const blendedBg = solidBg || bg;

  const bgLuminance = calculateRelativeLuminance(blendedBg);
  const fgLuminance = calculateRelativeLuminance(blendedFg);

  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export function getDisplayColor(
  background: RgbColor,
  foreground: RgbColor
): string {
  const contrastRatio = calculateWCAGContrast(background, foreground);
  if (contrastRatio >= 3.0) {
    return rgbToHex(foreground);
  }

  const blackContrast = calculateWCAGContrast(background, {
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  });
  const whiteContrast = calculateWCAGContrast(background, {
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  });

  return blackContrast > whiteContrast ? "#000000" : "#ffffff";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/*  Color Conversion Functions */
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

export function rgbaToHex({ r, g, b }: RgbaColor): string {
  return `#${[r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function rgbToHex({ r, g, b }: RgbColor): string {
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

export function hexToRgb(hex: string): RgbColor {
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

export function rgbToHsl({ r, g, b }: RgbColor): HslColor {
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

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: HslColor): RgbColor {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
    a,
  };
}
