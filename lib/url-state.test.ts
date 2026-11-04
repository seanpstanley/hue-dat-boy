import { describe, expect, it } from "vitest";

import { DEFAULT_STATE, parseUrlState, serializeUrlState } from "./url-state";

describe("parseUrlState", () => {
  it("uses defaults when there are no params", () => {
    expect(parseUrlState({})).toEqual(DEFAULT_STATE);
  });

  it("parses every param", () => {
    expect(
      parseUrlState({
        text: "000000",
        background: "ffffff80",
        standard: "apca",
        font: "Open Sans",
        simulation: "protanopia",
      }),
    ).toEqual({
      foreground: { r: 0, g: 0, b: 0, a: 1 },
      background: { r: 255, g: 255, b: 255, a: 0x80 / 255 },
      standard: "apca",
      font: "Open Sans",
      simulation: "protanopia",
    });
  });

  it("falls back per param, so one bad value doesn't reset the rest", () => {
    const state = parseUrlState({
      text: "not-a-color",
      background: "000",
      standard: "nope",
      simulation: "x-ray vision",
    });
    expect(state.foreground).toEqual(DEFAULT_STATE.foreground);
    expect(state.background).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(state.standard).toBe("wcag");
    expect(state.simulation).toBe("normal vision");
  });

  it("rejects font names that could break out of the stylesheet URL", () => {
    expect(parseUrlState({ font: "Inter&family=Evil" }).font).toBe("");
    expect(parseUrlState({ font: "a);}body{display:none" }).font).toBe("");
    expect(parseUrlState({ font: "x".repeat(65) }).font).toBe("");
  });

  it("uses the first value of a repeated param", () => {
    expect(parseUrlState({ standard: ["apca", "wcag"] }).standard).toBe("apca");
  });
});

describe("serializeUrlState", () => {
  it("writes hex colors without the #", () => {
    expect(serializeUrlState(DEFAULT_STATE)).toBe(
      "text=322e2b&background=f5b4c5&standard=wcag",
    );
  });

  it("omits the font and simulation params when they're defaults", () => {
    const query = serializeUrlState(DEFAULT_STATE);
    expect(query).not.toContain("font=");
    expect(query).not.toContain("simulation=");
  });

  it("round-trips through parseUrlState", () => {
    const state = {
      ...DEFAULT_STATE,
      background: { r: 18, g: 52, b: 86, a: 0x80 / 255 },
      standard: "apca" as const,
      font: "Roboto Slab",
      simulation: "tritanopia" as const,
    };
    const params = Object.fromEntries(
      new URLSearchParams(serializeUrlState(state)),
    );
    expect(parseUrlState(params)).toEqual(state);
  });
});
