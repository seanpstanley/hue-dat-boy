import { describe, expect, it } from "vitest";

import { rgbaToHsla } from "./color";
import {
  calculateAPCAContrast,
  calculateContrastRange,
  enhanceContrast,
  getContrastReport,
} from "./contrast";

const black = { r: 0, g: 0, b: 0, a: 1 };
const white = { r: 255, g: 255, b: 255, a: 1 };

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

describe("enhanceContrast", () => {
  const fg = { r: 204, g: 102, b: 102, a: 1 }; // #cc6666
  const bg = { r: 221, g: 136, b: 136, a: 1 }; // #dd8888

  it("keeps the hue when adjusting text", () => {
    const { foreground, background } = enhanceContrast(bg, fg, "text", "wcag");
    expect(background).toEqual(bg);
    expect(Math.round(rgbaToHsla(foreground).h)).toBe(0);
  });

  it("improves light-on-dark pairs under APCA (negative Lc)", () => {
    const dark = { r: 40, g: 40, b: 80, a: 1 };
    const dim = { r: 90, g: 90, b: 140, a: 1 };
    const before = Math.abs(calculateAPCAContrast(dark, dim));
    const { foreground } = enhanceContrast(dark, dim, "text", "apca");
    expect(Math.abs(calculateAPCAContrast(dark, foreground))).toBeGreaterThan(
      before,
    );
    expect(
      Math.abs(calculateAPCAContrast(dark, foreground)),
    ).toBeGreaterThanOrEqual(75);
  });

  it("moves both colors when asked to adjust both", () => {
    const result = enhanceContrast(bg, fg, "both", "wcag");
    expect(result.foreground).not.toEqual(fg);
    expect(result.background).not.toEqual(bg);
  });
});
