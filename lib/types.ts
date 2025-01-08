/* Color interface */
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
}

export interface HslaColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

export type ColorBlindnessType =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

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
