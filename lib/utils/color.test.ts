import { describe, it, expect } from "vitest";

import {
  blendColors,
  calculateWCAGContrast,
  getDisplayColor,
  hexToRgba,
  rgbaToHex,
  rgbToHex,
  hexToRgb,
  rgbaToHsla,
  hslaToRgba,
  simulateColorBlindness,
} from "./color";

const black = { r: 0, g: 0, b: 0, a: 1 };
const white = { r: 255, g: 255, b: 255, a: 1 };
const red = { r: 255, g: 0, b: 0, a: 1 };
const semiTransparentRed = { r: 255, g: 0, b: 0, a: 0.5 };
const sampleColor = { r: 200, g: 150, b: 100, a: 1 };

describe("Color Conversion Functions", () => {
  it("should convert HEX to RGBA correctly", () => {
    expect(hexToRgba("#ff0000")).toEqual(red);
  });

  it("should convert RGBA to HEX correctly", () => {
    expect(rgbaToHex(red)).toBe("#ff0000");
  });

  it("should convert RGB to HEX correctly", () => {
    expect(rgbToHex(red)).toBe("#ff0000");
  });

  it("should convert HEX to RGB correctly", () => {
    expect(hexToRgb("#ff0000ff")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("should convert RGBA to HSLA correctly", () => {
    expect(rgbaToHsla(red)).toEqual({ h: 0, s: 100, l: 50, a: 1 });
  });

  it("should convert HSLA to RGBA correctly", () => {
    expect(hslaToRgba({ h: 0, s: 100, l: 50, a: 1 })).toEqual(red);
  });
});

describe("Color Contrast Functions", () => {
  it("should blend two colors correctly", () => {
    expect(blendColors(semiTransparentRed, white)).toEqual({
      r: 255,
      g: 128,
      b: 128,
      a: 1,
    });
  });

  it("should calculate WCAG contrast ratio correctly", () => {
    expect(calculateWCAGContrast(white, black)).toBeCloseTo(21, 1);
    expect(calculateWCAGContrast(white, red)).toBeCloseTo(4, 2);
  });

  it("should determine display color for two low contrast colors correctly", () => {
    expect(getDisplayColor(white, red)).toBe("#ff0000");
    expect(getDisplayColor(black, red)).toBe("#ff0000");
  });
});

describe("simulateColorBlindness", () => {
  it("should return the same color for normal vision", () => {
    expect(simulateColorBlindness(sampleColor, "normal vision")).toEqual(
      sampleColor,
    );
  });

  it("should transform color correctly for protanopia", () => {
    expect(simulateColorBlindness(sampleColor, "protanopia")).toEqual({
      r: 178,
      g: 178,
      b: 124,
      a: 1,
    });
  });

  it("should transform color correctly for deuteranopia", () => {
    expect(simulateColorBlindness(sampleColor, "deuteranopia")).toEqual({
      r: 181,
      g: 185,
      b: 130,
      a: 1,
    });
  });

  it("should transform color correctly for tritanopia", () => {
    expect(simulateColorBlindness(sampleColor, "tritanopia")).toEqual({
      r: 198,
      g: 172,
      b: 174,
      a: 1,
    });
  });

  it("should transform color correctly for achromatopsia", () => {
    expect(simulateColorBlindness(sampleColor, "achromatopsia")).toEqual({
      r: 159,
      g: 159,
      b: 159,
      a: 1,
    });
  });

  it("should return the same color for an unknown type", () => {
    expect(simulateColorBlindness(sampleColor, "unknown" as any)).toEqual(
      sampleColor,
    );
  });
});
