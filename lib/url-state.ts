import { ColorBlindnessType, RgbaColor } from "@/lib/types";
import { parseHex, rgbaToHex } from "@/lib/utils/color";
import { ContrastStandard } from "@/lib/utils/contrast";

export const COLOR_BLINDNESS_TYPES: ColorBlindnessType[] = [
  "normal vision",
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "achromatopsia",
];

export interface CheckerState {
  foreground: RgbaColor;
  background: RgbaColor;
  standard: ContrastStandard;
  font: string;
  simulation: ColorBlindnessType;
}

export const DEFAULT_STATE: CheckerState = {
  foreground: { r: 50, g: 46, b: 43, a: 1 }, // #322e2b
  background: { r: 245, g: 180, b: 197, a: 1 }, // #f5b4c5
  standard: "wcag",
  font: "",
  simulation: "normal vision",
};

/** Google Font family names are letters, digits, spaces and hyphens. Anything else is rejected. */
const FONT_FAMILY_PATTERN = /^[\w\s-]{1,64}$/;

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** Parses (and validates) the checker state from URL search params, falling back to defaults for anything invalid. */
export function parseUrlState(params: SearchParams): CheckerState {
  const text = first(params.text);
  const background = first(params.background);
  const standard = first(params.standard);
  const font = first(params.font)?.trim();
  const simulation = first(params.simulation);

  return {
    foreground: (text && parseHex(text)) || DEFAULT_STATE.foreground,
    background:
      (background && parseHex(background)) || DEFAULT_STATE.background,
    standard: standard === "apca" ? "apca" : "wcag",
    font: font && FONT_FAMILY_PATTERN.test(font) ? font : "",
    simulation: COLOR_BLINDNESS_TYPES.includes(simulation as ColorBlindnessType)
      ? (simulation as ColorBlindnessType)
      : "normal vision",
  };
}

/** Serializes the checker state into a query string (without the leading "?"). */
export function serializeUrlState(state: CheckerState): string {
  const params = new URLSearchParams();

  params.set("text", rgbaToHex(state.foreground).slice(1));
  params.set("background", rgbaToHex(state.background).slice(1));
  params.set("standard", state.standard);
  if (state.font) params.set("font", state.font);
  if (state.simulation !== "normal vision")
    params.set("simulation", state.simulation);

  return params.toString();
}
