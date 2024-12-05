"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clipboard,
  ArrowLeftRight,
  Github,
  Twitter,
  Linkedin,
  Check,
  X,
  Maximize2,
} from "lucide-react";
// import {
//   APCAcontrast,
//   sRGBtoY,
//   displayP3toY,
//   adobeRGBtoY,
//   alphaBlend,
//   calcAPCA,
// } from "apca-w3";
import { calcAPCA } from "apca-w3";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { debounce } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorPicker } from "@/components/color-picker";

const getCurrentYear = () => new Date().getFullYear();

function calculateRelativeLuminance({ r, g, b }: RGB) {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(bg: RGB, fg: RGB) {
  const bgLuminance = calculateRelativeLuminance(bg);
  const fgLuminance = calculateRelativeLuminance(fg);

  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function calculateAPCAContrast(background: RGB, foreground: RGB) {
  return Number(
    calcAPCA(
      [...Object.values(foreground), 1] as [number, number, number, number],
      [...Object.values(background)] as [number, number, number]
    )
  );
}

function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
}

function getDisplayColor(
  background: RGB,
  foreground: RGB,
  colorBlindnessType?: ColorBlindnessType
): string {
  if (colorBlindnessType) {
    const simulatedBackground = simulateColorBlindness(
      background,
      colorBlindnessType
    );
    const simulatedForeground = simulateColorBlindness(
      foreground,
      colorBlindnessType
    );
    const contrastRatio = calculateContrastRatio(
      simulatedBackground,
      simulatedForeground
    );
    if (contrastRatio >= 3.0) {
      return rgbToHex(simulatedForeground);
    }

    const blackContrast = calculateContrastRatio(
      simulatedBackground,
      simulateColorBlindness({ r: 0, g: 0, b: 0 }, colorBlindnessType)
    );
    const whiteContrast = calculateContrastRatio(
      simulatedBackground,
      simulateColorBlindness({ r: 255, g: 255, b: 255 }, colorBlindnessType)
    );

    return blackContrast > whiteContrast ? "#000000" : "#ffffff";
  } else {
    const contrastRatio = calculateContrastRatio(background, foreground);
    if (contrastRatio >= 3.0) {
      return rgbToHex(foreground);
    }

    const blackContrast = calculateContrastRatio(background, {
      r: 0,
      g: 0,
      b: 0,
    });
    const whiteContrast = calculateContrastRatio(background, {
      r: 255,
      g: 255,
      b: 255,
    });

    return blackContrast > whiteContrast ? "#000000" : "#ffffff";
  }
}

function enhanceContrast(
  background: RGB,
  foreground: RGB,
  type: "text" | "background" | "both",
  useAPCA: boolean
): { background: RGB; foreground: RGB } {
  const initialContrast = useAPCA
    ? calculateAPCAContrast(background, foreground)
    : calculateContrastRatio(background, foreground);
  let newBackground = { ...background };
  let newForeground = { ...foreground };

  const adjustColor = (color: RGB, isBackground: boolean): RGB => {
    const hsl = rgbToHsl(color);
    const step = 1;
    let bestContrast = isBackground
      ? initialContrast
      : useAPCA
      ? calculateAPCAContrast(background, color)
      : calculateContrastRatio(background, color);
    let bestColor = color;

    // Try adjusting lightness
    for (let i = 0; i <= 100; i += step) {
      const lighterHSL = { ...hsl, l: Math.min(100, hsl.l + i) };
      const darkerHSL = { ...hsl, l: Math.max(0, hsl.l - i) };

      const lighterRGB = hslToRgb(lighterHSL);
      const darkerRGB = hslToRgb(darkerHSL);

      const lighterContrast = isBackground
        ? useAPCA
          ? calculateAPCAContrast(lighterRGB, newForeground)
          : calculateContrastRatio(lighterRGB, newForeground)
        : useAPCA
        ? calculateAPCAContrast(background, lighterRGB)
        : calculateContrastRatio(background, lighterRGB);
      const darkerContrast = isBackground
        ? useAPCA
          ? calculateAPCAContrast(darkerRGB, newForeground)
          : calculateContrastRatio(darkerRGB, newForeground)
        : useAPCA
        ? calculateAPCAContrast(background, darkerRGB)
        : calculateContrastRatio(background, darkerRGB);

      if (lighterContrast > bestContrast) {
        bestContrast = lighterContrast;
        bestColor = lighterRGB;
      }

      if (darkerContrast > bestContrast) {
        bestContrast = darkerContrast;
        bestColor = darkerRGB;
      }

      if (useAPCA ? Math.abs(bestContrast) >= 75 : bestContrast >= 7) break; // Stop if we've reached the highest level
    }

    // If we still haven't reached the desired level, try adjusting saturation
    if (useAPCA ? Math.abs(bestContrast) < 60 : bestContrast < 4.5) {
      const currentHSL = rgbToHsl(bestColor);
      for (let i = 0; i <= 100; i += step) {
        const lessSaturatedHSL = {
          ...currentHSL,
          s: Math.max(0, currentHSL.s - i),
        };
        const moreSaturatedHSL = {
          ...currentHSL,
          s: Math.min(100, currentHSL.s + i),
        };

        const lessSaturatedRGB = hslToRgb(lessSaturatedHSL);
        const moreSaturatedRGB = hslToRgb(moreSaturatedHSL);

        const lessSaturatedContrast = isBackground
          ? useAPCA
            ? calculateAPCAContrast(lessSaturatedRGB, newForeground)
            : calculateContrastRatio(lessSaturatedRGB, newForeground)
          : useAPCA
          ? calculateAPCAContrast(background, lessSaturatedRGB)
          : calculateContrastRatio(background, lessSaturatedRGB);
        const moreSaturatedContrast = isBackground
          ? useAPCA
            ? calculateAPCAContrast(moreSaturatedRGB, newForeground)
            : calculateContrastRatio(moreSaturatedRGB, newForeground)
          : useAPCA
          ? calculateAPCAContrast(background, moreSaturatedRGB)
          : calculateContrastRatio(background, moreSaturatedRGB);

        if (lessSaturatedContrast > bestContrast) {
          bestContrast = lessSaturatedContrast;
          bestColor = lessSaturatedRGB;
        }

        if (moreSaturatedContrast > bestContrast) {
          bestContrast = moreSaturatedContrast;
          bestColor = moreSaturatedRGB;
        }

        if (useAPCA ? Math.abs(bestContrast) >= 75 : bestContrast >= 7) break;
      }
    }

    return bestColor;
  };

  if (type === "text" || type === "both") {
    newForeground = adjustColor(foreground, false);
  }

  if (type === "background" || type === "both") {
    newBackground = adjustColor(background, true);
  }

  // If we still haven't reached the desired level, consider switching to black or white
  const finalContrast = useAPCA
    ? calculateAPCAContrast(newBackground, newForeground)
    : calculateContrastRatio(newBackground, newForeground);
  if (useAPCA ? Math.abs(finalContrast) < 60 : finalContrast < 4.5) {
    const blackContrast = useAPCA
      ? calculateAPCAContrast(newBackground, { r: 0, g: 0, b: 0 })
      : calculateContrastRatio(newBackground, { r: 0, g: 0, b: 0 });
    // ? calculateAPCAContrast(newBackground, { r: 0, g: 0, b: 0, a: 1 })
    // : calculateContrastRatio(newBackground, { r: 0, g: 0, b: 0, a: 1 });
    const whiteContrast = useAPCA
      ? calculateAPCAContrast(newBackground, { r: 255, g: 255, b: 255 })
      : calculateContrastRatio(newBackground, { r: 255, g: 255, b: 255 });
    // ? calculateAPCAContrast(newBackground, { r: 255, g: 255, b: 255, a: 1 })
    // : calculateContrastRatio(newBackground, { r: 255, g: 255, b: 255, a: 1 });
    newForeground =
      Math.abs(blackContrast) > Math.abs(whiteContrast)
        ? // ? { r: 0, g: 0, b: 0,a: 1 }
          // : { r: 255, g: 255, b: 255, a: 1 };
          { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 };
  }

  return { background: newBackground, foreground: newForeground };
}

type ColorBlindnessType =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

function simulateColorBlindness(color: RGB, type: ColorBlindnessType): RGB {
  if (type === "normal") return color;

  const { r, g, b } = color;
  let simulatedColor: RGB;

  switch (type) {
    case "protanopia":
      simulatedColor = {
        r: 0.567 * r + 0.433 * g,
        g: 0.558 * r + 0.442 * g,
        b: 0.242 * r + 0.758 * b,
      };
      break;
    case "deuteranopia":
      simulatedColor = {
        r: 0.625 * r + 0.375 * g,
        g: 0.7 * r + 0.3 * g,
        b: 0.3 * r + 0.7 * b,
      };
      break;
    case "tritanopia":
      simulatedColor = {
        r: 0.95 * r + 0.05 * g,
        g: 0.433 * r + 0.567 * g,
        b: 0.475 * r + 0.525 * g,
      };
      break;
    case "achromatopsia":
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      simulatedColor = { r: gray, g: gray, b: gray };
      break;
    default:
      simulatedColor = color;
  }

  return {
    r: Math.round(simulatedColor.r),
    g: Math.round(simulatedColor.g),
    b: Math.round(simulatedColor.b),
  };
}

const SAMPLE_TEXT = "temp";

const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans Pro",
  "Ubuntu",
];

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

export default function ContrastChecker() {
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const searchParamsInitText = searchParams.get("text") as string;
  const searchParamsInitBg = searchParams.get("background") as string;

  const [background, setBackground] = useState<RGB>(
    searchParamsInitBg ? hexToRgb(searchParamsInitBg) : hexToRgb("#f5b4c5")
  );
  const [foreground, setForeground] = useState<RGB>(
    searchParamsInitText ? hexToRgb(searchParamsInitText) : hexToRgb("#322e2b")
  );
  const [backgroundHex, setBackgroundHex] = useState(rgbToHex(background));
  const [foregroundHex, setForegroundHex] = useState(rgbToHex(foreground));
  const [useAPCA, setUseAPCA] = useState(false);
  const [colorBlindnessType, setColorBlindnessType] =
    useState<ColorBlindnessType>("normal");
  const [enhanceMenuOpen, setEnhanceMenuOpen] = useState(false);
  const [font, setFont] = useState("Inter");

  const wcagContrast = calculateContrastRatio(background, foreground);
  const apcaContrast = calculateAPCAContrast(background, foreground);

  const wcagResults = {
    AANormal: wcagContrast >= 4.5,
    AAANormal: wcagContrast >= 7,
    AALarge: wcagContrast >= 3,
    AAALarge: wcagContrast >= 4.5,
  };

  const handleColorChange = useCallback(
    (color: "background" | "foreground") => {
      return debounce((value: string) => {
        if (/^#?[0-9A-Fa-f]{6,8}$/.test(value)) {
          const colorValue = value.startsWith("#") ? value : `#${value}`;
          const newColor = hexToRgb(colorValue);
          if (color === "background") {
            setBackground(newColor);
            setBackgroundHex(colorValue);
          } else {
            setForeground(newColor);
            setForegroundHex(colorValue);
          }
        } else if (/^(\d{1,3},){3}(\d*\.?\d+)$/.test(value)) {
          const [r, g, b, a] = value.split(",").map(Number);
          if (r <= 255 && g <= 255 && b <= 255 && a >= 0 && a <= 1) {
            const newRgb = { r, g, b, a };
            if (color === "background") {
              setBackground(newRgb);
              setBackgroundHex(rgbToHex(newRgb));
            } else {
              setForeground(newRgb);
              setForegroundHex(rgbToHex(newRgb));
            }
          }
        }
      }, 50);
    },
    []
  );

  const handleReverseColors = () => {
    const newBackground = foreground;
    const newForeground = background;
    setBackground(newBackground);
    setForeground(newForeground);
    setBackgroundHex(rgbToHex(newBackground));
    setForegroundHex(rgbToHex(newForeground));
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.toString());
  };

  const handleEnhanceContrast = (type: "text" | "background" | "both") => {
    const { background: newBackground, foreground: newForeground } =
      enhanceContrast(background, foreground, type, useAPCA);
    setBackground(newBackground);
    setBackgroundHex(rgbToHex(newBackground));
    setForeground(newForeground);
    setForegroundHex(rgbToHex(newForeground));
  };

  const updateUrl = () => {
    const newParams = new URLSearchParams();

    newParams.set("text", foregroundHex.replace("#", ""));
    newParams.set("background", backgroundHex.replace("#", ""));
    replace(`?${newParams.toString()}`);
  };

  useEffect(() => {
    updateUrl();
  }, [foreground, background, updateUrl]);

  return (
    <div
      className={`min-h-screen p-4 pt-8 transition-colors selection:bg-[#${rgbToHex(
        background
      )}] selection:text-[${rgbToHex(background)}]`}
      style={{ backgroundColor: rgbToHex(background) }}
    >
      <main className="mx-auto container">
        <div className="mb-16 text-center">
          <span
            className="font-medium"
            style={{
              color: getDisplayColor(
                background,
                foreground,
                colorBlindnessType
              ),
            }}
          >
            hue dat boy.
          </span>
        </div>

        <div className="mb-8">
          <h1
            className="font-bold text-2xl md:text-3xl"
            style={{
              color: getDisplayColor(
                background,
                foreground,
                colorBlindnessType
              ),
            }}
          >
            color contrast checker
          </h1>
        </div>

        {/* Contrast Ratio and WCAG Compliance */}
        <section
          className="flex flex-col mb-8 lg:flex-row justify-between items-center lg:items-end gap-6 text-4xl font-bold"
          style={{
            color: getDisplayColor(background, foreground, colorBlindnessType),
          }}
        >
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="contrast-value" className="text-base md:text-lg">
              contrast value
            </Label>
            <div
              className="flex gap-10 items-center rounded-lg border-3 px-2.5 py-4"
              style={{
                borderColor: getDisplayColor(
                  background,
                  foreground,
                  colorBlindnessType
                ),
              }}
            >
              <h2
                id="contrast-value"
                className="text-6xl md:text-8xl text-nowrap"
              >
                {useAPCA ? (
                  <>
                    {apcaContrast.toFixed(2)} L
                    <sup className="-ml-3 md:-ml-4 -top-3.5 md:-top-6">c</sup>
                  </>
                ) : (
                  <>{wcagContrast.toFixed(2)} : 1</>
                )}
              </h2>
            </div>
          </div>
          {/* <span className="text-2xl md:text-4xl">{message}</span> */}

          <div className="grid grid-cols-1 mx-auto sm:grid-cols-2 lg:grid-cols-4 gap-2 justify-center">
            {Object.entries(wcagResults).map(([level, passes]) => (
              <div
                key={level}
                className="inline-flex items-center justify-between gap-x-2 rounded-full font-semibold transition-colors text-base md:text-lg py-2 px-4 border-3 bg-transparent"
              >
                {level.replace(/([A-Z])/g, " $1").trim()}{" "}
                {passes ? (
                  <>
                    <span className="sr-only">Pass</span>
                    <Check className="h-6 w-6" />
                  </>
                ) : (
                  <>
                    <span className="sr-only">Fail</span>
                    <X className="h-6 w-6" />
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
        <div className="flex items-center space-x-2">
          <Switch
            id="apca-mode"
            checked={useAPCA}
            onCheckedChange={setUseAPCA}
          />
          <Label htmlFor="apca-mode">Use APCA</Label>
        </div>

        <Popover open={enhanceMenuOpen} onOpenChange={setEnhanceMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              style={{
                color: getDisplayColor(
                  background,
                  foreground,
                  colorBlindnessType
                ),
                borderColor: getDisplayColor(
                  background,
                  foreground,
                  colorBlindnessType
                ),
              }}
              disabled={
                (!useAPCA && wcagContrast >= 4.5) ||
                (useAPCA && Math.abs(apcaContrast) >= 75)
              }
            >
              enhance contrast
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-fit p-0 border-3"
            style={{
              color: getDisplayColor(
                background,
                foreground,
                colorBlindnessType
              ),
              borderColor: getDisplayColor(
                background,
                foreground,
                colorBlindnessType
              ),
              backgroundColor: rgbToHex(background),
            }}
          >
            <div className="grid gap-2 p-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setEnhanceMenuOpen(false);
                  handleEnhanceContrast("text");
                }}
              >
                adjust text color
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setEnhanceMenuOpen(false);
                  handleEnhanceContrast("background");
                }}
              >
                adjust background color
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setEnhanceMenuOpen(false);
                  handleEnhanceContrast("both");
                }}
              >
                adjust both colors
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" onClick={handleCopyUrl} className="gap-x-1">
          <Clipboard className="h-4 w-4" />
          share these colors
        </Button>

        {/* Main content area */}
        <div className="flex flex-col lg:flex-col gap-8">
          {/* Color controls */}
          <div
            className="flex flex-col gap-y-4 lg:w-full"
            style={{
              color: getDisplayColor(
                background,
                foreground,
                colorBlindnessType
              ),
            }}
          >
            <div className="flex  flex-col md:flex-row justify-between items-center gap-x-8 gap-y-2">
              {/* Text color */}
              <div className="flex flex-col gap-y-2">
                <Label className="text-base md:text-lg">text color</Label>
                <div className="relative">
                  <ColorPicker
                    color={foregroundHex}
                    // onChange={(color: string) => {
                    //   setForegroundHex(color);
                    //   setForeground(hexToRgb(color));
                    // }}
                    externalColor={backgroundHex}
                    onChange={handleColorChange("foreground")}
                    className="absolute size-10 md:size-12 left-3 md:left-4 top-1/2 -translate-y-1/2"
                  />
                  <Input
                    value={foregroundHex}
                    // onChange={(e) => {
                    //   const value = e.target.value;
                    //   if (value.length <= 7) {
                    //     setForegroundHex(value);
                    //     if (/^#?[0-9A-Fa-f]{6}$/.test(value)) {
                    //       const colorValue = value.startsWith("#")
                    //         ? value
                    //         : `#${value}`;
                    //       setForeground(hexToRgb(colorValue));
                    //       setForegroundHex(colorValue);
                    //     }
                    //   }
                    // }}

                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 7) {
                        setForegroundHex(value);
                        if (/^#?[0-9A-Fa-f]{6}$/.test(value)) {
                          const colorValue = value.startsWith("#")
                            ? value
                            : `#${value}`;
                          setForeground(hexToRgb(colorValue));
                          setForegroundHex(colorValue);
                        }
                      }
                    }}
                    style={{
                      borderColor: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                    }}
                    spellCheck={false}
                    maxLength={7}
                    className="font-medium px-14 md:px-20 bg-transparent font-mono text-2xl h-fit py-2 leading-none md:text-5xl border-3"
                  />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="auto"
                          variant="ghost"
                          className="absolute size-12 right-4 top-1/2 -translate-y-1/2 p-2"
                          onClick={() =>
                            navigator.clipboard.writeText(rgbToHex(foreground))
                          }
                        >
                          <Clipboard className="!size-full" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        style={{
                          borderColor: getDisplayColor(
                            background,
                            foreground,
                            colorBlindnessType
                          ),
                          backgroundColor: rgbToHex(background),
                          color: getDisplayColor(
                            background,
                            foreground,
                            colorBlindnessType
                          ),
                        }}
                      >
                        <span>copy color</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Swap colors */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="auto"
                      className="size-12 p-2 shrink-0"
                      onClick={handleReverseColors}
                    >
                      <span className="sr-only">Swap colors</span>
                      <ArrowLeftRight className="-rotate-90 md:rotate-0 transition-transform !size-full" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    style={{
                      borderColor: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                      backgroundColor: rgbToHex(background),
                      color: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                    }}
                  >
                    <span>swap colors</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Background color */}
              <div
                className="flex flex-col gap-y-2"
                style={{
                  color: getDisplayColor(
                    background,
                    foreground,
                    colorBlindnessType
                  ),
                  borderColor: getDisplayColor(
                    background,
                    foreground,
                    colorBlindnessType
                  ),
                }}
              >
                <Label
                  htmlFor="background-color"
                  className="text-base md:text-lg"
                >
                  background color
                </Label>
                <div className="relative">
                  <div
                    style={{
                      borderColor: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                    }}
                  >
                    <ColorPicker
                      color={backgroundHex}
                      onChange={(color: string) => {
                        setBackgroundHex(color);
                        setBackground(hexToRgb(color));
                      }}
                      externalColor={foregroundHex}
                      className="absolute size-12 left-4 top-1/2 -translate-y-1/2"
                    />
                  </div>

                  <Input
                    id="background-color"
                    value={backgroundHex}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 7) {
                        setBackgroundHex(value);
                        if (/^#?[0-9A-Fa-f]{6}$/.test(value)) {
                          const colorValue = value.startsWith("#")
                            ? value
                            : `#${value}`;
                          setBackground(hexToRgb(colorValue));
                          setBackgroundHex(colorValue);
                        }
                      }
                    }}
                    spellCheck={false}
                    maxLength={7}
                    style={{
                      borderColor: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                    }}
                    className="px-20 font-mono bg-transparent text-xl h-fit  py-2 leading-none md:text-5xl  border-3"
                  />

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="auto"
                          variant="ghost"
                          className="absolute size-12 right-4 top-1/2 -translate-y-1/2 p-2"
                          onClick={() =>
                            navigator.clipboard.writeText(rgbToHex(background))
                          }
                        >
                          <Clipboard className="!size-full" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        style={{
                          borderColor: getDisplayColor(
                            background,
                            foreground,
                            colorBlindnessType
                          ),
                          backgroundColor: rgbToHex(background),
                          color: getDisplayColor(
                            background,
                            foreground,
                            colorBlindnessType
                          ),
                        }}
                      >
                        <span>copy color</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-y-8">
            {/* Font and Color Blindness Controls */}
            <div className="flex flex-col md:flex-row gap-x-8 gap-y-4">
              <div
                className="flex flex-col gap-y-2 flex-1"
                style={{
                  color: getDisplayColor(
                    background,
                    foreground,
                    colorBlindnessType
                  ),
                }}
              >
                <Label
                  htmlFor="typeface-select"
                  className="text-base md:text-lg"
                >
                  typeface
                </Label>
                <Select
                  value={font}
                  onValueChange={setFont}
                  name="typeface-select"
                >
                  <SelectTrigger
                    className="bg-transparent border-3 h-fit py-2 text-lg md:text-2xl"
                    style={{
                      borderColor: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="border-3 max-h-72 overflow-y-scroll"
                    style={{
                      borderColor: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                      color: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                      backgroundColor: rgbToHex(background),
                    }}
                  >
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem
                        key={font}
                        value={font}
                        className="text-lg md:text-2xl"
                      >
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div
                className="flex flex-col gap-y-2 flex-1"
                style={{
                  color: getDisplayColor(
                    background,
                    foreground,
                    colorBlindnessType
                  ),
                }}
              >
                <Label
                  htmlFor="colorblind-select"
                  className="text-base md:text-lg"
                >
                  simulate colorblindness
                </Label>
                <Select
                  value={colorBlindnessType}
                  onValueChange={(value: ColorBlindnessType) =>
                    setColorBlindnessType(value)
                  }
                  name="colorblind-select"
                >
                  <SelectTrigger
                    className="bg-transparent border-3 h-fit py-2 text-lg md:text-2xl"
                    style={{
                      borderColor: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className="border-3"
                    style={{
                      borderColor: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                      color: getDisplayColor(
                        background,
                        foreground,
                        colorBlindnessType
                      ),
                      backgroundColor: rgbToHex(background),
                    }}
                  >
                    <SelectItem value="normal" className="text-lg md:text-2xl">
                      normal vision
                    </SelectItem>
                    <SelectItem
                      value="protanopia"
                      className="text-lg md:text-2xl"
                    >
                      protanopia
                    </SelectItem>
                    <SelectItem
                      value="deuteranopia"
                      className="text-lg md:text-2xl"
                    >
                      deuteranopia
                    </SelectItem>
                    <SelectItem
                      value="tritanopia"
                      className="text-lg md:text-2xl"
                    >
                      tritanopia
                    </SelectItem>
                    <SelectItem
                      value="achromatopsia"
                      className="text-lg md:text-2xl"
                    >
                      achromatopsia
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sample Text Section */}
            <section className="flex flex-col gap-y-4" id="sample-text">
              <h3
                className="font-bold text-xl md:text-2xl"
                style={{
                  color: getDisplayColor(
                    background,
                    foreground,
                    colorBlindnessType
                  ),
                }}
              >
                sample text
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                <Sheet>
                  <Card
                    className="overflow-hidden bg-transparent border-3"
                    style={{ borderColor: rgbToHex(foreground) }}
                  >
                    <div
                      className="py-2 px-4  relative"
                      style={{ backgroundColor: rgbToHex(foreground) }}
                    >
                      <h4
                        className="text-xl md:text-3xl font-bold"
                        style={{ color: rgbToHex(background) }}
                      >
                        large text
                      </h4>
                      <SheetTrigger asChild>
                        {/* <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1/2 -translate-y-1/2 right-1"
                          style={{ color: rgbToHex(background) }}
                        >
                          <Maximize2 />
                          <span className="sr-only">Fullscreen view</span>
                        </Button>
                        {/* </TooltipTrigger>
                        <TooltipContent
                          style={{
                            borderColor: getDisplayColor(
                              background,
                              foreground,
                              colorBlindnessType
                            ),
                            backgroundColor: rgbToHex(background),
                            color: getDisplayColor(
                              background,
                              foreground,
                              colorBlindnessType
                            ),
                          }}
                        >
                          <span>view fullscreen</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider> */}
                      </SheetTrigger>
                    </div>
                    <div className="p-4">
                      <p
                        className="text-2xl"
                        style={{
                          color: rgbToHex(foreground),
                          fontFamily: font,
                        }}
                      >
                        {SAMPLE_TEXT}
                      </p>
                    </div>
                  </Card>

                  <SheetContent
                    className="h-full flex flex-col justify-center items-center border-none"
                    style={{ backgroundColor: rgbToHex(background) }}
                    side={"bottom"}
                  >
                    <p
                      className="max-w-2xl text-2xl"
                      style={{
                        color: rgbToHex(foreground),
                        fontFamily: font,
                      }}
                    >
                      {SAMPLE_TEXT}
                    </p>
                  </SheetContent>
                </Sheet>

                <Card
                  className="overflow-hidden bg-transparent border-3"
                  style={{ borderColor: rgbToHex(foreground) }}
                >
                  <div
                    className="py-2 px-4"
                    style={{ backgroundColor: rgbToHex(foreground) }}
                  >
                    <h4
                      className="text-xl md:text-3xl font-bold"
                      style={{ color: rgbToHex(background) }}
                    >
                      small text
                    </h4>
                  </div>
                  <div className="p-4">
                    <p
                      className="text-base"
                      style={{
                        color: rgbToHex(foreground),
                      }}
                    >
                      {SAMPLE_TEXT}
                    </p>
                  </div>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer
        className="mt-12 py-6 container mx-auto"
        style={{
          color: wcagContrast < 3 ? "black" : rgbToHex(foreground),
        }}
      >
        <div className="flex flex-col items-center sm:flex-row-reverse justify-between gap-4">
          <div className="flex gap-x-4">
            <Button
              asChild
              variant={"ghost"}
              size={"auto"}
              className="size-12 p-2"
            >
              <Link
                href="https://github.com/seanpstanley"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="!size-full" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button
              asChild
              variant={"ghost"}
              size={"auto"}
              className="size-12 p-2"
            >
              <Link
                href="https://www.linkedin.com/in/seanpstanley/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="!size-full" />
                <span className="sr-only">Twitter</span>
              </Link>
            </Button>
          </div>
          <small className="text-sm">
            © {getCurrentYear()} Sean Stanley. Built with shadcn.
          </small>
        </div>
      </footer>
    </div>
  );
}
