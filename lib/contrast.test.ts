import { describe, expect, it } from "vitest";

import { BLACK as black, calculateWCAGContrast, WHITE as white } from "./color";
import {
  calculateAPCAContrast,
  calculateContrastRange,
  enhanceContrast,
  getContrastReport,
  nextEnhanceGoal,
} from "./contrast";
import { deltaEOK, rgbaToOklch } from "./oklch";

describe("calculateAPCAContrast", () => {
  it("is positive for dark text on light backgrounds and negative for the reverse", () => {
    expect(calculateAPCAContrast(white, black)).toBeCloseTo(106.04, 1);
    expect(calculateAPCAContrast(black, white)).toBeCloseTo(-107.88, 1);
  });

  it("blends semi-transparent text over the background", () => {
    const faint = { ...black, a: 0.1 };
    expect(Math.abs(calculateAPCAContrast(white, faint))).toBeLessThan(15);
  });
});

describe("calculateContrastRange", () => {
  it("accounts for the semi-transparent background itself", () => {
    // 50% white over black is mid gray: black text on it is nowhere near 21:1
    const range = calculateContrastRange({ ...white, a: 0.5 }, black, "wcag");
    expect(range.max).toBe(21);
    expect(range.min).toBeGreaterThan(4);
    expect(range.min).toBeLessThan(6);
  });

  it("works for APCA", () => {
    const range = calculateContrastRange({ ...white, a: 0.5 }, black, "apca");
    expect(range.min).toBeGreaterThan(20);
    expect(range.max).toBeGreaterThan(100);
  });
});

describe("getContrastReport", () => {
  it("uses APCA thresholds (not WCAG ratios) for APCA levels", () => {
    const report = getContrastReport(
      white,
      { r: 120, g: 120, b: 120, a: 1 },
      "apca",
    );
    expect(report.levels).toEqual({
      normal_text: false,
      large_text: true,
      non_text: true,
    });
  });

  it("uses the worst case for semi-transparent backgrounds", () => {
    const report = getContrastReport({ ...white, a: 0.5 }, black, "wcag");
    expect(report.range).not.toBeNull();
    expect(report.levels.aaa_normal).toBe(false);
  });
});

describe("nextEnhanceGoal", () => {
  it("picks the lowest goal not met yet", () => {
    expect(nextEnhanceGoal(3, "wcag")).toBe("aa");
    expect(nextEnhanceGoal(5, "wcag")).toBe("aaa");
    expect(nextEnhanceGoal(7.5, "wcag")).toBeNull();
    expect(nextEnhanceGoal(80, "apca")).toBe("aaa");
  });
});

describe("enhanceContrast", () => {
  const fg = { r: 204, g: 102, b: 102, a: 1 }; // #cc6666
  const bg = { r: 221, g: 136, b: 136, a: 1 }; // #dd8888
  const hue = (c: typeof fg) => rgbaToOklch(c).h;
  const hueDiff = (x: number, y: number) =>
    Math.abs(((x - y + 540) % 360) - 180);

  it("aims for AA by default and lands just above it instead of overshooting", () => {
    const { foreground, background } = enhanceContrast(bg, fg, "text", "wcag");
    const score = calculateWCAGContrast(background, foreground);
    expect(background).toEqual(bg);
    expect(score).toBeGreaterThanOrEqual(4.5);
    expect(score).toBeLessThan(4.7);
  });

  it("can aim for AAA", () => {
    const { foreground } = enhanceContrast(bg, fg, "text", "wcag", "aaa");
    const score = calculateWCAGContrast(bg, foreground);
    expect(score).toBeGreaterThanOrEqual(7);
    expect(score).toBeLessThan(7.3);
  });

  it.each([
    ["yellow on white", { r: 230, g: 200, b: 0, a: 1 }, white],
    [
      "blue on navy",
      { r: 70, g: 90, b: 200, a: 1 },
      { r: 20, g: 30, b: 80, a: 1 },
    ],
    ["red on pink", fg, bg],
    [
      "teal on mint",
      { r: 0, g: 150, b: 140, a: 1 },
      { r: 180, g: 230, b: 210, a: 1 },
    ],
  ])("keeps the perceived hue of %s", (_, text, back) => {
    const { foreground } = enhanceContrast(back, text, "text", "wcag");
    expect(calculateWCAGContrast(back, foreground)).toBeGreaterThanOrEqual(4.5);
    expect(hueDiff(hue(foreground), hue(text))).toBeLessThan(6);
  });

  it("improves light-on-dark pairs under APCA (negative Lc)", () => {
    const dark = { r: 40, g: 40, b: 80, a: 1 };
    const dim = { r: 90, g: 90, b: 140, a: 1 };
    const { foreground } = enhanceContrast(dark, dim, "text", "apca");
    const lc = Math.abs(calculateAPCAContrast(dark, foreground));
    expect(lc).toBeGreaterThanOrEqual(75);
    expect(lc).toBeLessThan(78);
  });

  it("splits the change between both colors with the smallest combined change", () => {
    const cost = (r: { foreground: typeof fg; background: typeof fg }) =>
      deltaEOK(r.foreground, fg) ** 2 + deltaEOK(r.background, bg) ** 2;
    const both = enhanceContrast(bg, fg, "both", "wcag");
    expect(
      calculateWCAGContrast(both.background, both.foreground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(both.foreground).not.toEqual(fg);
    expect(both.background).not.toEqual(bg);
    expect(cost(both)).toBeLessThanOrEqual(
      cost(enhanceContrast(bg, fg, "text", "wcag")),
    );
    expect(cost(both)).toBeLessThanOrEqual(
      cost(enhanceContrast(bg, fg, "background", "wcag")),
    );
  });

  it("keeps transparency and passes in the worst case for semi-transparent backgrounds", () => {
    const glass = { r: 240, g: 240, b: 255, a: 0.7 };
    const text = { r: 120, g: 120, b: 140, a: 1 };
    const { background, foreground } = enhanceContrast(
      glass,
      text,
      "text",
      "wcag",
    );
    expect(background).toEqual(glass);
    expect(
      getContrastReport(background, foreground, "wcag").score,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps text alpha and returns its best effort when the goal is unreachable", () => {
    const ghost = { r: 0, g: 0, b: 0, a: 0.1 };
    const { foreground } = enhanceContrast(white, ghost, "text", "wcag");
    expect(foreground.a).toBe(0.1);
    expect(calculateWCAGContrast(white, foreground)).toBeGreaterThanOrEqual(
      calculateWCAGContrast(white, ghost),
    );
  });
});
