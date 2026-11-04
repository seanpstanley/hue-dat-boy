/** A color in sRGB, with an alpha channel. */
export interface RgbaColor {
  /** Red channel, 0–255. */
  r: number;
  /** Green channel, 0–255. */
  g: number;
  /** Blue channel, 0–255. */
  b: number;
  /** Opacity, from 0 (transparent) to 1 (opaque). */
  a: number;
}

/** A color in HSL, with an alpha channel. */
export interface HslaColor {
  /** Hue angle in degrees, 0–360. */
  h: number;
  /** Saturation in percent, 0–100. */
  s: number;
  /** Lightness in percent, 0–100. */
  l: number;
  /** Opacity, from 0 (transparent) to 1 (opaque). */
  a: number;
}

/** The color vision types the sample previews can simulate. These strings are also the `simulation` URL param. */
export type ColorBlindnessType =
  | "normal vision"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

/** A random quote from the Animechan API (`GET /v1/quotes/random`, the `data` field). */
export interface AnimechanQuote {
  /** The anime the quote is from. */
  anime: {
    /** Animechan's id for the anime. */
    id: number;
    /** The anime's title. */
    name: string;
    /** An alternate title, if there is one. */
    altName?: string;
  };
  /** The character who said it. */
  character: {
    /** Animechan's id for the character. */
    id: number;
    /** The character's name. */
    name: string;
  };
  /** The quote itself. */
  content: string;
}

/** A font from the Google Fonts Developer API (`GET /webfonts/v1/webfonts`, one of `items`). */
export interface GoogleFont {
  /** The family name, e.g. "Open Sans". */
  family: string;
  /** Available styles, e.g. "regular", "700italic". */
  variants: string[];
  /** Supported scripts, e.g. "latin", "cyrillic". */
  subsets: string[];
  /** The font's version, e.g. "v34". */
  version: string;
  /** When the font was last updated, as an ISO date. */
  lastModified: string;
  /** Font file URLs, keyed by variant. */
  files: Record<string, string>;
  /** "sans-serif", "serif", "display", "handwriting" or "monospace". */
  category: string;
  /** Always "webfonts#webfont". */
  kind: string;
  /** A URL to a small file containing just the characters in the family name, for previews. */
  menu: string;
}

/** The trimmed-down font info `/api/fonts` returns: just what the font picker needs. */
export type GoogleFontFamily = Pick<GoogleFont, "family" | "category">;

/** The body of a successful `GET /api/fonts` response. */
export interface FontListResponse {
  /** Every available font family, most popular first. */
  items: GoogleFontFamily[];
}
