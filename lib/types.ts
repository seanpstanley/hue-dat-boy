/* Color interfaces */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
  // a?: number | undefined;
}

export interface HslaColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

/* Color blindness type */
export type ColorBlindnessType =
  | "normal vision"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

/* Anime quote API interface */
export interface AnimechanQuote {
  anime: {
    id: number;
    name: string;
    altName?: string;
  };
  character: {
    id: number;
    name: string;
  };
  content: string;
}

/* Google Font API interface */
export interface GoogleFont {
  family: string;
  variants: string[];
  subets: string[];
  version: string;
  lastModified: string;
  files: Record<string, string>;
  category: string;
  kind: string;
  menu: string;
}
