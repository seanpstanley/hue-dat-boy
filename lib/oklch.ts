import { RgbaColor } from "@/lib/types";

/**
 * A color in OKLCH: a perceptual color space (Björn Ottosson's OKLab, in polar form). Unlike HSL, changing `l` here
 * changes only perceived lightness, so a color keeps its hue and colorfulness as it gets lighter or darker.
 */
export interface OklchColor {
  /** Perceived lightness, from 0 (black) to 1 (white). */
  l: number;
  /** Chroma (colorfulness), from 0 (gray) to about 0.37 for the most vivid sRGB colors. */
  c: number;
  /** Hue angle in degrees, 0–360. */
  h: number;
  /** Opacity, from 0 (transparent) to 1 (opaque). Carried through unchanged. */
  a: number;
}

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

const fromLinear = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

/**
 * Converts a color to OKLab (the rectangular form of OKLCH).
 *
 * @param color - The color to convert. Alpha is ignored.
 * @returns `L` is lightness (0–1); `A` (green–red) and `B` (blue–yellow) are the color axes.
 */
export function rgbaToOklab({ r, g, b }: RgbaColor) {
  const [lr, lg, lb] = [r, g, b].map((v) => toLinear(v / 255));

  const l = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb,
  );
  const m = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb,
  );
  const s = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb,
  );

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    A: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    B: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/**
 * Converts a color to OKLCH.
 *
 * @param color - The color to convert. Alpha is carried through.
 */
export function rgbaToOklch(color: RgbaColor): OklchColor {
  const { L, A, B } = rgbaToOklab(color);
  const c = Math.sqrt(A * A + B * B);
  const h = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;

  return { l: L, c, h, a: color.a };
}

/** Linear sRGB channels (unclamped, so callers can check whether the color is in gamut). */
function oklchToLinearRgb({
  l: L,
  c,
  h,
}: OklchColor): [number, number, number] {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);

  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const EPSILON = 1e-4;
const inGamut = (rgb: number[]) =>
  rgb.every((v) => v >= -EPSILON && v <= 1 + EPSILON);

/**
 * Converts an OKLCH color to 8-bit sRGB. Out-of-gamut colors (common when a saturated color is made much lighter or
 * darker) are mapped into sRGB by reducing chroma while keeping lightness and hue, which is the least noticeable way
 * to make a color displayable.
 */
export function oklchToRgba(color: OklchColor): RgbaColor {
  const l = Math.min(1, Math.max(0, color.l));
  let rgb = oklchToLinearRgb({ ...color, l });

  if (!inGamut(rgb)) {
    let low = 0;
    let high = color.c;
    for (let i = 0; i < 16; i++) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToLinearRgb({ ...color, l, c: mid }))) low = mid;
      else high = mid;
    }
    rgb = oklchToLinearRgb({ ...color, l, c: low });
  }

  const [r, g, b] = rgb.map((v) =>
    Math.round(Math.min(1, Math.max(0, fromLinear(v))) * 255),
  );

  return { r, g, b, a: color.a };
}

/**
 * The perceived difference between two colors: Euclidean distance in OKLab ("ΔEOK"). About 0.02 is a
 * just-noticeable difference.
 *
 * @param x - One color (alpha ignored).
 * @param y - The other color (alpha ignored).
 */
export function deltaEOK(x: RgbaColor, y: RgbaColor): number {
  const p = rgbaToOklab(x);
  const q = rgbaToOklab(y);
  return Math.hypot(p.L - q.L, p.A - q.A, p.B - q.B);
}
