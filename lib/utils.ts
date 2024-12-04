import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}
