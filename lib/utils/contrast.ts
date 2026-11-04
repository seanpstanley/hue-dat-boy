import { calcAPCA } from "apca-w3";

import { RgbaColor } from "@/lib/types";
import {
  blendColors,
  calculateWCAGContrast,
  hslaToRgba,
  opaque,
  rgbaToHsla,
} from "@/lib/utils/color";

export type ContrastStandard = "wcag" | "apca";

export type WcagLevel = "aa_large" | "aaa_large" | "aa_normal" | "aaa_normal";
export type ApcaLevel = "normal_text" | "large_text" | "non_text";

/** Minimum score for each level. WCAG levels are ratios, APCA levels are absolute Lc values. */
export const WCAG_THRESHOLDS: Record<WcagLevel, number> = {
  aa_large: 3,
  aaa_large: 4.5,
  aa_normal: 4.5,
  aaa_normal: 7,
};

export const APCA_THRESHOLDS: Record<ApcaLevel, number> = {
  normal_text: 75,
  large_text: 60,
  non_text: 45,
};

/** Score at which the "enhance contrast" button is no longer needed. */
export const ENHANCE_MINIMUM: Record<ContrastStandard, number> = {
  wcag: WCAG_THRESHOLDS.aa_normal,
  apca: APCA_THRESHOLDS.normal_text,
};

/** Score "enhance contrast" aims for. */
const ENHANCE_TARGET: Record<ContrastStandard, number> = {
  wcag: WCAG_THRESHOLDS.aaa_normal,
  apca: APCA_THRESHOLDS.normal_text,
};

/**
 * Calculates the signed APCA lightness contrast (Lc) of `fg` text on an opaque `bg`. Text alpha is blended over the
 * background first. Positive values are dark text on light backgrounds, negative values are light text on dark.
 *
 * @returns   {number}    The Lc value, rounded to two decimals.
 */
export function calculateAPCAContrast(bg: RgbaColor, fg: RgbaColor): number {
  const solidBg = opaque(bg);
  const text = blendColors(fg, solidBg);

  return Number(
    Number(
      // apca-w3 treats a missing alpha channel as "has alpha" and blends with NaN, so text alpha must be passed explicitly
      calcAPCA([text.r, text.g, text.b, 1], [solidBg.r, solidBg.g, solidBg.b]),
    ).toFixed(2),
  );
}

/** A comparable, always-positive contrast score for the given standard. */
export function contrastScore(
  bg: RgbaColor,
  fg: RgbaColor,
  standard: ContrastStandard,
): number {
  return standard === "apca"
    ? Math.abs(calculateAPCAContrast(bg, fg))
    : calculateWCAGContrast(bg, fg);
}

/** Gray backdrops a semi-transparent background could be sitting on (black → white). */
const BACKDROPS: RgbaColor[] = Array.from({ length: 18 }, (_, i) => {
  const v = Math.round((i / 17) * 255);
  return { r: v, g: v, b: v, a: 1 };
});

/**
 * Calculates the range of possible contrast scores when `bg` is semi-transparent, by compositing it over a sweep of
 * backdrops from black to white. Contrast isn't monotonic across backdrops (it bottoms out where text and background
 * luminance cross), which is why the range is sampled rather than only checked at black and white.
 */
export function calculateContrastRange(
  bg: RgbaColor,
  fg: RgbaColor,
  standard: ContrastStandard,
): { min: number; max: number } {
  const scores = BACKDROPS.map((backdrop) =>
    contrastScore(blendColors(bg, backdrop), fg, standard),
  );

  return { min: Math.min(...scores), max: Math.max(...scores) };
}

export interface ContrastReport {
  standard: ContrastStandard;
  /** The score used for pass/fail. For semi-transparent backgrounds, this is the worst case. */
  score: number;
  /** The raw value to display: a WCAG ratio, or a signed APCA Lc. */
  value: number;
  /** Present when the background is semi-transparent. */
  range: { min: number; max: number } | null;
  levels: Record<string, boolean>;
}

/** Calculates everything the UI needs to show about a color pair's contrast. */
export function getContrastReport(
  bg: RgbaColor,
  fg: RgbaColor,
  standard: ContrastStandard,
): ContrastReport {
  const range = bg.a < 1 ? calculateContrastRange(bg, fg, standard) : null;
  const value =
    standard === "apca"
      ? calculateAPCAContrast(bg, fg)
      : calculateWCAGContrast(bg, fg);
  const score = range ? range.min : Math.abs(value);
  const thresholds: Record<string, number> =
    standard === "apca" ? APCA_THRESHOLDS : WCAG_THRESHOLDS;

  return {
    standard,
    score,
    value,
    range,
    levels: Object.fromEntries(
      Object.entries(thresholds).map(([level, min]) => [level, score >= min]),
    ),
  };
}

/**
 * Finds the smallest lightness change to `color` that reaches the target score against `other`. If the target can't
 * be reached, returns the best candidate found (the lightness sweep ends at pure black and pure white, which are the
 * highest-contrast options available).
 */
function adjustLightness(
  color: RgbaColor,
  other: RgbaColor,
  isBackground: boolean,
  standard: ContrastStandard,
): RgbaColor {
  const target = ENHANCE_TARGET[standard];
  const hsl = rgbaToHsla(color);
  const score = (candidate: RgbaColor) =>
    isBackground
      ? contrastScore(candidate, other, standard)
      : contrastScore(other, candidate, standard);

  let best = color;
  let bestScore = score(color);

  for (let delta = 1; delta <= 100; delta++) {
    for (const l of [hsl.l + delta, hsl.l - delta]) {
      if (l < 0 || l > 100) continue;

      const candidate = hslaToRgba({ ...hsl, l });
      const candidateScore = score(candidate);

      if (candidateScore >= target) return candidate;
      if (candidateScore > bestScore) {
        best = candidate;
        bestScore = candidateScore;
      }
    }
  }

  return best;
}

/**
 * Enhances the contrast between a background and a foreground color by adjusting lightness (keeping hue and
 * saturation) as little as possible.
 *
 * @param background - The RGBA color object representing the background color.
 * @param foreground - The RGBA color object representing the foreground color.
 * @param type - Specifies which color(s) to adjust: "text", "background", or "both".
 * @param standard - Which contrast standard to target.
 * @returns An object containing the adjusted background and foreground colors as RGBA objects.
 */
export function enhanceContrast(
  background: RgbaColor,
  foreground: RgbaColor,
  type: "text" | "background" | "both",
  standard: ContrastStandard,
): { background: RgbaColor; foreground: RgbaColor } {
  if (type === "text") {
    return {
      background,
      foreground: adjustLightness(foreground, background, false, standard),
    };
  }

  if (type === "background") {
    return {
      background: adjustLightness(background, foreground, true, standard),
      foreground,
    };
  }

  // "both": push the two colors apart symmetrically, so each one changes about half as much
  const target = ENHANCE_TARGET[standard];
  const fgHsl = rgbaToHsla(foreground);
  const bgHsl = rgbaToHsla(background);
  const clamp = (l: number) => Math.min(100, Math.max(0, l));

  let best = { background, foreground };
  let bestScore = contrastScore(background, foreground, standard);

  for (let delta = 1; delta <= 100; delta++) {
    for (const direction of [1, -1]) {
      const candidate = {
        foreground: hslaToRgba({
          ...fgHsl,
          l: clamp(fgHsl.l + direction * delta),
        }),
        background: hslaToRgba({
          ...bgHsl,
          l: clamp(bgHsl.l - direction * delta),
        }),
      };
      const candidateScore = contrastScore(
        candidate.background,
        candidate.foreground,
        standard,
      );

      if (candidateScore >= target) return candidate;
      if (candidateScore > bestScore) {
        best = candidate;
        bestScore = candidateScore;
      }
    }
  }

  return best;
}
