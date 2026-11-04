import { parseHex, rgbaToHex } from "@/lib/color";
import { ContrastStandard } from "@/lib/contrast";
import { ColorBlindnessType, RgbaColor } from "@/lib/types";

/** Every color vision type, in the order the simulation select lists them. */
export const COLOR_BLINDNESS_TYPES: ColorBlindnessType[] = [
  "normal vision",
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "achromatopsia",
];

/** Everything that's shareable through the URL. */
export interface CheckerState {
  /** The text color (`text` param, hex without the `#`). */
  foreground: RgbaColor;
  /** The background color (`background` param, hex without the `#`). */
  background: RgbaColor;
  /** The contrast standard (`standard` param). */
  standard: ContrastStandard;
  /** The Google Font family for the samples, or `""` for the default font (`font` param, omitted when empty). */
  font: string;
  /** The color blindness simulation (`simulation` param, omitted for normal vision). */
  simulation: ColorBlindnessType;
}

/** What a visit with no (or invalid) URL params starts with. */
export const DEFAULT_STATE: CheckerState = {
  foreground: { r: 50, g: 46, b: 43, a: 1 }, // #322e2b
  background: { r: 245, g: 180, b: 197, a: 1 }, // #f5b4c5
  standard: "wcag",
  font: "",
  simulation: "normal vision",
};

/** Google Font family names are letters, digits, spaces and hyphens. Anything else is rejected. */
const FONT_FAMILY_PATTERN = /^[\w\s-]{1,64}$/;

/** Search params as Next.js passes them to pages (a repeated param arrives as an array). */
type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * Parses and validates the checker state from URL search params. Each param falls back to its default on its own, so
 * one bad value doesn't reset the rest.
 *
 * @param params - The page's search params.
 *
 * @example
 * ```ts
 * parseUrlState({ text: "000000", background: "ffffff", standard: "apca" });
 * ```
 */
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

/**
 * Serializes the checker state into a query string, the inverse of {@link parseUrlState}.
 *
 * @param state - The state to serialize.
 * @returns The query string, without the leading `?`. Default-valued `font` and `simulation` params are omitted.
 */
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
