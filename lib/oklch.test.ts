import { describe, expect, it } from "vitest";

import { BLACK, WHITE } from "./color";
import { deltaEOK, oklchToRgba, rgbaToOklch } from "./oklch";

describe("rgbaToOklch", () => {
  it("puts black at L 0 and white at L 1 with no chroma", () => {
    expect(rgbaToOklch(BLACK).l).toBeCloseTo(0, 5);
    expect(rgbaToOklch(WHITE).l).toBeCloseTo(1, 5);
    expect(rgbaToOklch(WHITE).c).toBeCloseTo(0, 5);
  });

  it("matches the reference value for sRGB red", () => {
    const { l, c, h } = rgbaToOklch({ r: 255, g: 0, b: 0, a: 1 });
    expect(l).toBeCloseTo(0.628, 3);
    expect(c).toBeCloseTo(0.2577, 3);
    expect(h).toBeCloseTo(29.23, 1);
  });
});

describe("oklchToRgba", () => {
  it.each([
    BLACK,
    WHITE,
    { r: 204, g: 102, b: 102, a: 1 },
    { r: 0, g: 128, b: 128, a: 0.5 },
  ])("round-trips %j", (color) => {
    expect(oklchToRgba(rgbaToOklch(color))).toEqual(color);
  });

  it("maps out-of-gamut colors by reducing chroma, keeping lightness and hue", () => {
    const red = rgbaToOklch({ r: 255, g: 0, b: 0, a: 1 });
    // Very light red can't be as colorful as pure red in sRGB
    const result = rgbaToOklch(oklchToRgba({ ...red, l: 0.95 }));

    expect(result.l).toBeCloseTo(0.95, 2);
    expect(result.c).toBeLessThan(red.c);
    expect(Math.abs(result.h - red.h)).toBeLessThan(3);
  });

  it("clamps lightness to 0–1", () => {
    expect(oklchToRgba({ l: 1.5, c: 0, h: 0, a: 1 })).toEqual(WHITE);
    expect(oklchToRgba({ l: -1, c: 0, h: 0, a: 1 })).toEqual(BLACK);
  });
});

describe("deltaEOK", () => {
  it("is 0 for identical colors and about 1 for black vs. white", () => {
    expect(deltaEOK(WHITE, WHITE)).toBe(0);
    expect(deltaEOK(BLACK, WHITE)).toBeCloseTo(1, 3);
  });
});
