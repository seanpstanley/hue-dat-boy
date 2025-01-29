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
} from "./color";

const black = { r: 0, g: 0, b: 0, a: 1 };
const white = { r: 255, g: 255, b: 255, a: 1 };
const red = { r: 255, g: 0, b: 0, a: 1 };
const semiTransparentRed = { r: 255, g: 0, b: 0, a: 0.5 };

describe("Color Utility Functions", () => {
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
