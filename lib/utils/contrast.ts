import { calcAPCA } from "apca-w3";

import { RgbaColor } from "@/lib/types";
import { blendColors, calculateWCAGContrast, opaque } from "@/lib/utils/color";
import { deltaEOK, oklchToRgba, rgbaToOklch } from "@/lib/utils/oklch";

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

export type EnhanceGoal = "aa" | "aaa";

/**
 * What "enhance contrast" can aim for. "aa" is the body text minimum (WCAG AA normal / APCA Lc 75); "aaa" is the
 * enhanced level (WCAG AAA normal / APCA Lc 90, APCA's preferred level for body text).
 */
export const ENHANCE_GOALS: Record<
  ContrastStandard,
  Record<EnhanceGoal, number>
> = {
  wcag: { aa: WCAG_THRESHOLDS.aa_normal, aaa: WCAG_THRESHOLDS.aaa_normal },
  apca: { aa: APCA_THRESHOLDS.normal_text, aaa: 90 },
};

/** The lowest goal the pair doesn't meet yet, or null if it already meets every goal. */
export function nextEnhanceGoal(
  score: number,
  standard: ContrastStandard,
): EnhanceGoal | null {
  const goals = ENHANCE_GOALS[standard];
  if (score < goals.aa) return "aa";
  if (score < goals.aaa) return "aaa";
  return null;
}

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
 * The pass/fail score for a pair, including transparency: text alpha is blended over the background, and a
 * semi-transparent background is judged by its worst case across backdrops (the same rule the score display uses).
 */
function worstCaseScore(
  bg: RgbaColor,
  fg: RgbaColor,
  standard: ContrastStandard,
): number {
  return bg.a < 1
    ? calculateContrastRange(bg, fg, standard).min
    : contrastScore(bg, fg, standard);
}

/**
 * Returns a function that gives `color` at any OKLCH lightness (keeping its hue, chroma where displayable, and alpha).
 * Results are cached, since the searches below revisit the same lightness values.
 */
function lightnessLadder(color: RgbaColor) {
  const base = rgbaToOklch(color);
  const cache = new Map<number, RgbaColor>();

  return {
    l: base.l,
    at(l: number) {
      const key = Math.round(Math.min(1, Math.max(0, l)) * 1e4) / 1e4;
      let result = cache.get(key);
      if (!result) {
        result = oklchToRgba({ ...base, l: key });
        cache.set(key, result);
      }
      return result;
    },
  };
}

const COARSE_STEP = 0.01;
const BISECT_ITERATIONS = 12;

/**
 * Finds the smallest lightness change to a color that reaches `target`, trying both lighter and darker. Each
 * direction walks in coarse steps until it passes, then bisects back to land just above the threshold instead of
 * overshooting it.
 *
 * @returns `found`: the closest passing color (or null if neither direction can reach the target), and `best`: the
 *          highest-scoring color seen, as a fallback.
 */
function searchLightness(
  ladder: ReturnType<typeof lightnessLadder>,
  scoreOf: (candidate: RgbaColor) => number,
  target: number,
) {
  const original = ladder.at(ladder.l);
  let best = { color: original, score: scoreOf(original) };
  if (best.score >= target) {
    return { found: { color: original, delta: 0 }, best };
  }

  let found: { color: RgbaColor; delta: number } | null = null;

  for (const direction of [1, -1]) {
    let previous = ladder.l;

    for (let step = 1; step <= 100; step++) {
      const l = Math.min(
        1,
        Math.max(0, ladder.l + direction * step * COARSE_STEP),
      );
      const score = scoreOf(ladder.at(l));
      if (score > best.score) best = { color: ladder.at(l), score };

      if (score >= target) {
        let failing = previous;
        let passing = l;
        for (let i = 0; i < BISECT_ITERATIONS; i++) {
          const mid = (failing + passing) / 2;
          if (scoreOf(ladder.at(mid)) >= target) passing = mid;
          else failing = mid;
        }
        const delta = Math.abs(passing - ladder.l);
        if (!found || delta < found.delta) {
          found = { color: ladder.at(passing), delta };
        }
        break;
      }

      previous = l;
      if (l === 0 || l === 1) break;
    }
  }

  return { found, best };
}

/**
 * Enhances the contrast between a background and a foreground color as gently as possible.
 *
 * Colors are adjusted along OKLCH lightness, so they keep their hue and colorfulness (HSL lightness, used previously,
 * shifts how saturated and even which hue a color looks). The result lands just above the goal rather than past it.
 * For "both", it searches combinations of text and background lightness for the smallest combined perceived change
 * (sum of squared ΔEOK, which favors sharing the change between the two colors over moving just one). Transparency is
 * preserved, and semi-transparent backgrounds are judged by their worst case.
 *
 * If the goal can't be reached at all (e.g. very transparent text), the highest-contrast option found is returned.
 *
 * @param background - The RGBA color object representing the background color.
 * @param foreground - The RGBA color object representing the foreground color.
 * @param type - Specifies which color(s) to adjust: "text", "background", or "both".
 * @param standard - Which contrast standard to target.
 * @param goal - Which level to aim for (defaults to the body text minimum).
 * @returns An object containing the adjusted background and foreground colors as RGBA objects.
 */
export function enhanceContrast(
  background: RgbaColor,
  foreground: RgbaColor,
  type: "text" | "background" | "both",
  standard: ContrastStandard,
  goal: EnhanceGoal = "aa",
): { background: RgbaColor; foreground: RgbaColor } {
  const target = ENHANCE_GOALS[standard][goal];
  const fgLadder = lightnessLadder(foreground);
  const bgLadder = lightnessLadder(background);

  if (type === "text") {
    const { found, best } = searchLightness(
      fgLadder,
      (fg) => worstCaseScore(background, fg, standard),
      target,
    );
    return { background, foreground: (found ?? best).color };
  }

  if (type === "background") {
    const { found, best } = searchLightness(
      bgLadder,
      (bg) => worstCaseScore(bg, foreground, standard),
      target,
    );
    return { background: (found ?? best).color, foreground };
  }

  // "both": for each candidate text lightness, find the closest passing background, and keep the cheapest pair
  type Pair = { background: RgbaColor; foreground: RgbaColor };
  const result: {
    cheapest: { pair: Pair; cost: number } | null;
    strongest: { pair: Pair; score: number };
  } = {
    cheapest: null,
    strongest: {
      pair: { background, foreground },
      score: worstCaseScore(background, foreground, standard),
    },
  };

  const tryTextLightness = (l: number) => {
    const fg = fgLadder.at(l);
    const { found, best } = searchLightness(
      bgLadder,
      (bg) => worstCaseScore(bg, fg, standard),
      target,
    );

    if (found) {
      const cost =
        deltaEOK(fg, foreground) ** 2 + deltaEOK(found.color, background) ** 2;
      if (!result.cheapest || cost < result.cheapest.cost) {
        result.cheapest = {
          pair: { background: found.color, foreground: fg },
          cost,
        };
      }
    } else if (best.score > result.strongest.score) {
      result.strongest = {
        pair: { background: best.color, foreground: fg },
        score: best.score,
      };
    }
  };

  // Coarse pass over the whole lightness range (coarser when the background is transparent, since every score then
  // samples 18 backdrops), then a fine pass around the cheapest pair found
  const coarse = background.a < 1 ? 0.05 : 0.02;
  for (let l = 0; l <= 1 + 1e-9; l += coarse) tryTextLightness(l);
  tryTextLightness(fgLadder.l);

  if (result.cheapest) {
    const center = rgbaToOklch(result.cheapest.pair.foreground).l;
    for (let l = center - coarse; l <= center + coarse; l += coarse / 10) {
      tryTextLightness(l);
    }
  }

  return result.cheapest?.pair ?? result.strongest.pair;
}
