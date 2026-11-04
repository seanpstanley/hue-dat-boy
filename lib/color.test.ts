import { describe, expect, it } from "vitest";

import {
  BLACK,
  blendColors,
  calculateWCAGContrast,
  getDisplayColor,
  parseHex,
  rgbaToHex,
  rgbaToHsla,
  rgbToHex,
  simulateColorBlindness,
  WHITE,
} from "./color";

const red = { r: 255, g: 0, b: 0, a: 1 };
const sample = { r: 200, g: 150, b: 100, a: 1 };

describe("parseHex", () => {
  it.each([
    ["#ff0000", red],
    ["ff0000", red],
    ["#f00", red],
    ["  #FF0000 ", red],
    ["#ff000080", { ...red, a: 0x80 / 255 }],
    ["#f008", { ...red, a: 0x88 / 255 }],
  ])("parses %j", (input, expected) => {
    expect(parseHex(input)).toEqual(expected);
  });

  it.each(["", "#", "#12345", "#1234567", "red", "#gggggg"])(
    "rejects %j",
    (input) => {
      expect(parseHex(input)).toBeNull();
    },
  );
});

describe("rgbaToHex", () => {
  it("omits alpha for opaque colors", () => {
    expect(rgbaToHex(red)).toBe("#ff0000");
  });

  it("includes alpha for transparent colors", () => {
    expect(rgbaToHex({ ...red, a: 0.5 })).toBe("#ff000080");
  });

  it("rounds and clamps channels", () => {
    expect(rgbaToHex({ r: 254.6, g: -3, b: 300, a: 1 })).toBe("#ff00ff");
  });

  it("round-trips with parseHex", () => {
    expect(rgbaToHex(parseHex("#12abef80")!)).toBe("#12abef80");
  });
});

describe("rgbToHex", () => {
  it("drops alpha instead of blending it", () => {
    expect(rgbToHex({ ...red, a: 0.2 })).toBe("#ff0000");
  });
});

describe("rgbaToHsla", () => {
  it("converts to degrees and percentages", () => {
    expect(rgbaToHsla(red)).toEqual({ h: 0, s: 100, l: 50, a: 1 });
    expect(rgbaToHsla({ r: 0, g: 128, b: 128, a: 0.5 })).toMatchObject({
      h: 180,
      s: 100,
      a: 0.5,
    });
  });
});

describe("blendColors", () => {
  it("composites the top color over the bottom one", () => {
    expect(blendColors({ ...red, a: 0.5 }, WHITE)).toEqual({
      r: 255,
      g: 128,
      b: 128,
      a: 1,
    });
  });
});

describe("calculateWCAGContrast", () => {
  it("matches known ratios", () => {
    expect(calculateWCAGContrast(WHITE, BLACK)).toBe(21);
    expect(calculateWCAGContrast(WHITE, WHITE)).toBe(1);
    // #767676 is the classic "lightest gray that passes AA on white"
    expect(calculateWCAGContrast(WHITE, parseHex("#767676")!)).toBe(4.54);
  });

  it("is symmetric for opaque colors", () => {
    expect(calculateWCAGContrast(red, WHITE)).toBe(
      calculateWCAGContrast(WHITE, red),
    );
  });

  it("truncates instead of rounding up (WCAG never rounds into a pass)", () => {
    // red on white is 3.998:1
    expect(calculateWCAGContrast(WHITE, red)).toBe(3.99);
  });

  it("blends semi-transparent text over the background", () => {
    expect(calculateWCAGContrast(WHITE, { ...BLACK, a: 0.5 })).toBeLessThan(5);
  });

  it("blends a semi-transparent background over the given backdrop", () => {
    const halfWhite = { ...WHITE, a: 0.5 };
    expect(calculateWCAGContrast(halfWhite, BLACK, WHITE)).toBe(21);
    expect(calculateWCAGContrast(halfWhite, BLACK, BLACK)).toBeLessThan(6);
  });
});

describe("getDisplayColor", () => {
  it("uses the text color when it's readable enough", () => {
    expect(getDisplayColor(WHITE, red)).toBe("#ff0000"); // 3.99:1
    expect(getDisplayColor(BLACK, red)).toBe("#ff0000"); // 5.25:1
  });

  it("falls back to black or white for low contrast colors", () => {
    const yellow = { r: 255, g: 230, b: 0, a: 1 };
    expect(getDisplayColor(WHITE, yellow)).toBe("#000000");
    expect(getDisplayColor(BLACK, { r: 30, g: 30, b: 60, a: 1 })).toBe(
      "#ffffff",
    );
  });

  it("judges semi-transparent text by how it actually looks", () => {
    expect(getDisplayColor(WHITE, { ...BLACK, a: 0.1 })).toBe("#000000");
    expect(getDisplayColor(BLACK, { ...WHITE, a: 0.1 })).toBe("#ffffff");
  });

  it("returns the blended color, not the transparent one", () => {
    expect(getDisplayColor(WHITE, { ...BLACK, a: 0.8 })).toBe("#333333");
  });
});

describe("simulateColorBlindness", () => {
  it("returns the same color for normal vision", () => {
    expect(simulateColorBlindness(sample, "normal vision")).toBe(sample);
  });

  it.each([
    ["protanopia", { r: 178, g: 178, b: 124 }],
    ["deuteranopia", { r: 181, g: 185, b: 130 }],
    ["tritanopia", { r: 198, g: 172, b: 174 }],
    ["achromatopsia", { r: 159, g: 159, b: 159 }],
  ] as const)("transforms colors for %s", (type, expected) => {
    expect(simulateColorBlindness(sample, type)).toEqual({ ...expected, a: 1 });
  });

  it("preserves alpha", () => {
    expect(simulateColorBlindness({ ...sample, a: 0.4 }, "protanopia").a).toBe(
      0.4,
    );
  });
});
