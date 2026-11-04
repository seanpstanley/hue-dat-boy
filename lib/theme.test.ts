import { describe, expect, it } from "vitest";

import {
  buildFaviconHref,
  buildThemeVars,
  getLowContrastFallback,
  themeVarsToCss,
} from "./theme";

const pink = { r: 245, g: 180, b: 197, a: 1 }; // #f5b4c5
const charcoal = { r: 50, g: 46, b: 43, a: 1 }; // #322e2b
const palePink = { r: 240, g: 160, b: 176, a: 1 }; // #f0a0b0, too close to pink

describe("buildThemeVars", () => {
  it("uses the text color as ink when it's readable", () => {
    expect(buildThemeVars(pink, charcoal, "normal vision")).toMatchObject({
      "--surface": "#f5b4c5",
      "--ink": "#322e2b",
      "--on-ink": "#f5b4c5",
      "--fg": "#322e2b",
      "--bg": "#f5b4c5",
    });
  });

  it("falls back to black/white ink in low contrast mode, but keeps the real colors", () => {
    const vars = buildThemeVars(pink, palePink, "normal vision");
    expect(vars["--ink"]).toBe("#000000");
    expect(vars["--fg"]).toBe("#f0a0b0");
  });

  it("paints the surface opaque and keeps alpha in --bg", () => {
    const vars = buildThemeVars({ ...pink, a: 0.5 }, charcoal, "normal vision");
    expect(vars["--surface"]).toBe("#f5b4c5");
    expect(vars["--bg"]).toBe("#f5b4c580");
  });

  it("applies the simulation only to the --sim-* vars", () => {
    const vars = buildThemeVars(pink, charcoal, "achromatopsia");
    expect(vars["--fg"]).toBe("#322e2b");
    const simBg = vars["--sim-bg"];
    // Achromatopsia turns everything gray
    expect(simBg.slice(1, 3)).toBe(simBg.slice(3, 5));
    expect(simBg.slice(3, 5)).toBe(simBg.slice(5, 7));
  });
});

describe("themeVarsToCss", () => {
  it("serializes vars into a :root rule", () => {
    expect(themeVarsToCss({ "--ink": "#000000", "--surface": "#ffffff" })).toBe(
      ":root{--ink:#000000;--surface:#ffffff}",
    );
  });
});

describe("getLowContrastFallback", () => {
  it("is null when the UI can use the text color", () => {
    expect(getLowContrastFallback(pink, charcoal)).toBeNull();
  });

  it("says which color the UI switched to", () => {
    expect(getLowContrastFallback(pink, palePink)).toBe("black");
    expect(
      getLowContrastFallback(charcoal, { r: 60, g: 56, b: 53, a: 1 }),
    ).toBe("white");
  });

  it("treats faint semi-transparent text as low contrast", () => {
    expect(getLowContrastFallback(pink, { ...charcoal, a: 0.1 })).toBe("black");
  });
});

describe("buildFaviconHref", () => {
  const decode = (href: string) =>
    decodeURIComponent(href.replace("data:image/svg+xml,", ""));

  it("paints the tile in the background and the dot in the text color", () => {
    const svg = decode(buildFaviconHref(pink, charcoal));
    expect(svg).toContain('rx="8" fill="#f5b4c5"');
    expect(svg).toContain('r="8.5" fill="#322e2b"');
  });

  it("falls back to black/white for the dot when the pair is low contrast", () => {
    expect(decode(buildFaviconHref(pink, palePink))).toContain(
      'r="8.5" fill="#000000"',
    );
  });
});
