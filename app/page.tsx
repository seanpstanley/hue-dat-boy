"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clipboard, ArrowLeftRight, Check, X } from "lucide-react";
import { calcAPCA } from "apca-w3";
import useSWR from "swr";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  debounce,
  getDisplayColor,
  rgbaToHex,
  calculateWCAGContrast,
} from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ColorPicker from "@/components/color-picker";
import { RgbColor, ColorBlindnessType } from "@/lib/types";
import { rgbToHex, hexToRgb, hslToRgb, rgbToHsl } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { RgbaColor } from "react-colorful";
import { CopyColorButton } from "@/components/copy-color-button";
import { SampleTextCard } from "@/components/sample-text-card";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function calculateWCAGContrastRange(
  bg: RgbColor,
  fg: RgbColor
): { min: number; max: number } {
  const blackBg: RgbColor = { r: 0, g: 0, b: 0, a: 1 };
  const whiteBg: RgbColor = { r: 255, g: 255, b: 255, a: 1 };

  const minContrast = calculateWCAGContrast(bg, fg, blackBg);
  const maxContrast = calculateWCAGContrast(bg, fg, whiteBg);

  return {
    min: Math.min(minContrast, maxContrast),
    max: Math.max(minContrast, maxContrast),
  };
}

// export function calculateWCAGContrast(bg: RgbColor, fg: RgbColor) {
//   const bgLuminance = calculateRelativeLuminance(bg);
//   const fgLuminance = calculateRelativeLuminance(fg);

//   const lighter = Math.max(bgLuminance, fgLuminance);
//   const darker = Math.min(bgLuminance, fgLuminance);

//   return (lighter + 0.05) / (darker + 0.05);
// }

function calculateAPCAContrast(background: RgbColor, foreground: RgbColor) {
  return Number(
    calcAPCA(
      [...Object.values(foreground), 1] as [number, number, number, number],
      [...Object.values(background)] as [number, number, number]
    )
  );
}

function enhanceContrast(
  background: RgbColor,
  foreground: RgbColor,
  type: "text" | "background" | "both",
  useAPCA: boolean
): { background: RgbColor; foreground: RgbColor } {
  const initialContrast = useAPCA
    ? calculateAPCAContrast(background, foreground)
    : calculateWCAGContrast(background, foreground);
  let newBackground = { ...background };
  let newForeground = { ...foreground };

  const adjustColor = (color: RgbColor, isBackground: boolean): RgbColor => {
    const hsl = rgbToHsl(color);
    const step = 1;
    let bestContrast = isBackground
      ? initialContrast
      : useAPCA
      ? calculateAPCAContrast(background, color)
      : calculateWCAGContrast(background, color);
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
          : calculateWCAGContrast(lighterRGB, newForeground)
        : useAPCA
        ? calculateAPCAContrast(background, lighterRGB)
        : calculateWCAGContrast(background, lighterRGB);
      const darkerContrast = isBackground
        ? useAPCA
          ? calculateAPCAContrast(darkerRGB, newForeground)
          : calculateWCAGContrast(darkerRGB, newForeground)
        : useAPCA
        ? calculateAPCAContrast(background, darkerRGB)
        : calculateWCAGContrast(background, darkerRGB);

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
            : calculateWCAGContrast(lessSaturatedRGB, newForeground)
          : useAPCA
          ? calculateAPCAContrast(background, lessSaturatedRGB)
          : calculateWCAGContrast(background, lessSaturatedRGB);
        const moreSaturatedContrast = isBackground
          ? useAPCA
            ? calculateAPCAContrast(moreSaturatedRGB, newForeground)
            : calculateWCAGContrast(moreSaturatedRGB, newForeground)
          : useAPCA
          ? calculateAPCAContrast(background, moreSaturatedRGB)
          : calculateWCAGContrast(background, moreSaturatedRGB);

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
    : calculateWCAGContrast(newBackground, newForeground);
  if (useAPCA ? Math.abs(finalContrast) < 60 : finalContrast < 4.5) {
    const blackContrast = useAPCA
      ? calculateAPCAContrast(newBackground, { r: 0, g: 0, b: 0, a: 1 })
      : calculateWCAGContrast(newBackground, { r: 0, g: 0, b: 0, a: 1 });

    const whiteContrast = useAPCA
      ? calculateAPCAContrast(newBackground, { r: 255, g: 255, b: 255, a: 1 })
      : calculateWCAGContrast(newBackground, { r: 255, g: 255, b: 255, a: 1 });

    newForeground =
      Math.abs(blackContrast) > Math.abs(whiteContrast)
        ? { r: 0, g: 0, b: 0, a: 1 }
        : { r: 255, g: 255, b: 255, a: 1 };
  }

  return { background: newBackground, foreground: newForeground };
}

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

export default function ContrastChecker() {
  const { replace } = useRouter();

  const searchParams = useSearchParams();

  const searchParamsInitText = searchParams.get("text") as string;
  const searchParamsInitBg = searchParams.get("background") as string;
  const searchParamsInitStandard = searchParams.get("standard") as string;
  const searchParamsInitFont = searchParams.get("font") as string;
  const searchParamsInitSimulation = searchParams.get("simulation") as string;

  const [background, setBackground] = useState<RgbColor>(
    searchParamsInitBg ? hexToRgb(searchParamsInitBg) : hexToRgb("#f5b4c5")
  );
  const [foreground, setForeground] = useState<RgbColor>(
    searchParamsInitText ? hexToRgb(searchParamsInitText) : hexToRgb("#322e2b")
  );
  const [backgroundHex, setBackgroundHex] = useState(rgbToHex(background));
  const [foregroundHex, setForegroundHex] = useState(rgbToHex(foreground));
  const [useAPCA, setUseAPCA] = useState(
    searchParamsInitStandard
      ? searchParamsInitStandard === "wcag"
        ? true
        : false
      : false
  );
  const [font, setFont] = useState(
    searchParamsInitFont ? searchParamsInitFont : "Inter"
  );
  const [colorBlindnessType, setColorBlindnessType] =
    useState<ColorBlindnessType>(
      searchParamsInitSimulation
        ? (searchParamsInitSimulation as ColorBlindnessType)
        : "normal"
    );
  const [enhanceMenuOpen, setEnhanceMenuOpen] = useState(false);

  const wcagContrast = calculateWCAGContrast(background, foreground);
  const wcagContrastRange = calculateWCAGContrastRange(background, foreground);
  const apcaContrast = calculateAPCAContrast(background, foreground);

  const wcagResults = {
    AANormal: wcagContrast >= 4.5,
    AAANormal: wcagContrast >= 7,
    AALarge: wcagContrast >= 3,
    AAALarge: wcagContrast >= 4.5,
  };

  const debouncedColorChange = debounce(
    (colorType: "background" | "foreground", value: string) => {
      if (/^#?[0-9A-Fa-f]{6,8}$/.test(value)) {
        const colorValue = value.startsWith("#") ? value : `#${value}`;
        const newColor = hexToRgb(colorValue);
        if (colorType === "background") {
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
          if (colorType === "background") {
            setBackground(newRgb);
            setBackgroundHex(rgbToHex(newRgb));
          } else {
            setForeground(newRgb);
            setForegroundHex(rgbToHex(newRgb));
          }
        }
      }
    },
    50
  );

  const handleColorChange = useCallback(
    (colorType: "background" | "foreground", value: RgbaColor) => {
      debouncedColorChange(colorType, rgbaToHex(value));
    },
    [debouncedColorChange]
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

  const updateUrl = useCallback(() => {
    const newParams = new URLSearchParams();

    newParams.set("text", foregroundHex.replace("#", ""));
    newParams.set("background", backgroundHex.replace("#", ""));
    newParams.set("standard", useAPCA ? "apca" : "wcag");
    newParams.set("font", font);
    newParams.set("simulation", colorBlindnessType);
    replace(`?${newParams.toString()}`, { scroll: false });
  }, [
    replace,
    foregroundHex,
    backgroundHex,
    useAPCA,
    font,
    colorBlindnessType,
  ]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  const { data, error, isLoading } = useSWR(
    "https://api.kanye.rest/",
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return (
    <div
      className={`min-h-screen p-4 pt-8 transition-[background-color] selection:bg-[#${rgbToHex(
        background
      )}] selection:text-[${rgbToHex(background)}]`}
      style={{ backgroundColor: rgbToHex(background) }}
    >
      <main className="mx-auto container">
        <div className="mb-12 md:mb-16 text-center">
          <span
            className="font-medium"
            style={{
              color: getDisplayColor(background, foreground),
            }}
          >
            hue dat boy.
          </span>
        </div>

        <div className="mb-8">
          <h1
            className="font-bold text-2xl md:text-3xl"
            style={{
              color: getDisplayColor(background, foreground),
            }}
          >
            color contrast checker (& more!)
          </h1>
        </div>

        {/* Contrast Ratio and WCAG Compliance */}
        <section
          className="flex flex-col mb-8 lg:flex-row justify-between items-center lg:items-end gap-6 text-4xl font-bold"
          style={{
            color: getDisplayColor(background, foreground),
          }}
        >
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="contrast-value" className="text-base md:text-lg">
              contrast value
            </Label>
            <div
              className="flex gap-10 items-center rounded-lg border-3 px-2.5 py-4"
              style={{
                borderColor: getDisplayColor(background, foreground),
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
                  <>
                    {background.a < 1 ? (
                      <>
                        {wcagContrastRange.min.toFixed(2)} : 1 to{" "}
                        {wcagContrastRange.max.toFixed(2)} : 1 alpha:
                        {background.a}
                      </>
                    ) : (
                      <>
                        {wcagContrast.toFixed(2)} : 1<>alpha:{background.a}</>
                      </>
                    )}
                  </>
                )}
              </h2>
            </div>
          </div>

          {/* <div className="grid grid-cols-1 mx-auto sm:grid-cols-2 lg:grid-cols-4 gap-2 justify-center">
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
          </div> */}
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-x-4 gap-y-4 mb-8">
          <div className="flex items-center gap-x-2">
            <Label
              htmlFor="contrast-standard"
              className="text-base md:text-lg"
              style={{
                color: getDisplayColor(background, foreground),
              }}
            >
              wcag 2.2
            </Label>
            <Switch
              id="contrast-standard"
              checked={useAPCA}
              onCheckedChange={setUseAPCA}
              style={{
                borderColor: getDisplayColor(background, foreground),
                backgroundColor: backgroundHex,
              }}
              color={getDisplayColor(background, foreground)}
            />
            <Label
              htmlFor="contrast-standard"
              className="text-base md:text-lg"
              style={{
                color: getDisplayColor(background, foreground),
              }}
            >
              apca
            </Label>
          </div>

          <Popover open={enhanceMenuOpen} onOpenChange={setEnhanceMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                style={{
                  color: getDisplayColor(background, foreground),
                  borderColor: getDisplayColor(background, foreground),
                }}
                size="xl"
                disabled={
                  (!useAPCA && wcagContrast >= 4.5) ||
                  (useAPCA && Math.abs(apcaContrast) >= 75)
                }
                className="sm:ml-auto w-full sm:w-fit text-base"
              >
                enhance contrast
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-fit p-0 border-3"
              style={{
                color: getDisplayColor(background, foreground),
                borderColor: getDisplayColor(background, foreground),
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

          <Button
            variant="outline"
            onClick={handleCopyUrl}
            size="xl"
            className="gap-x-1 w-full sm:w-fit text-base"
            style={{
              color: getDisplayColor(background, foreground),
              borderColor: getDisplayColor(background, foreground),
            }}
          >
            share these colors
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex flex-col lg:flex-col gap-8">
          {/* Color controls */}
          <div
            className="flex flex-col gap-y-4 lg:w-full"
            style={{
              color: getDisplayColor(background, foreground),
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-x-8 gap-y-2">
              {/* Text color */}
              <div className="flex flex-col gap-y-2">
                <Label className="text-base md:text-lg">text color</Label>
                <div className="relative">
                  <ColorPicker
                    color={foreground}
                    externalColor={getDisplayColor(background, foreground)}
                    onChange={(value) => handleColorChange("foreground", value)}
                    className="absolute size-9 md:size-12 left-2.5 md:left-4 top-1/2 -translate-y-1/2"
                  />
                  <Input
                    value={foregroundHex}
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
                      borderColor: getDisplayColor(background, foreground),
                    }}
                    spellCheck={false}
                    maxLength={7}
                    className="font-medium px-14 md:px-20 bg-transparent font-mono text-3xl h-fit py-2 leading-none md:text-5xl border-3"
                  />

                  <CopyColorButton
                    color="text"
                    foreground={foreground}
                    background={background}
                  />
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
                      borderColor: getDisplayColor(background, foreground),
                      backgroundColor: rgbToHex(background),
                      color: getDisplayColor(background, foreground),
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
                  color: getDisplayColor(background, foreground),
                  borderColor: getDisplayColor(background, foreground),
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
                      borderColor: getDisplayColor(background, foreground),
                    }}
                  >
                    <ColorPicker
                      color={background}
                      onChange={(value) =>
                        handleColorChange("background", value)
                      }
                      externalColor={getDisplayColor(background, foreground)}
                      className="absolute size-9 md:size-12 left-2.5 md:left-4 top-1/2 -translate-y-1/2"
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
                    // maxLength={7}
                    style={{
                      borderColor: getDisplayColor(background, foreground),
                    }}
                    className="font-medium px-14 md:px-20 bg-transparent font-mono text-3xl h-fit py-2 leading-none md:text-5xl border-3"
                  />

                  <CopyColorButton
                    color="background"
                    foreground={foreground}
                    background={background}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Standard levels */}
          <div className="grid grid-cols-1 mx-auto sm:grid-cols-2 lg:grid-cols-4 gap-2 justify-center">
            {Object.entries(wcagResults).map(([level, passes]) => (
              <div
                key={level}
                className="inline-flex items-center justify-between gap-x-2 rounded-full font-semibold transition-colors text-base md:text-lg py-2 px-4 border-3 bg-transparent"
                style={{
                  borderColor: getDisplayColor(background, foreground),
                  backgroundColor: rgbToHex(background),
                  color: getDisplayColor(background, foreground),
                }}
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

          {/* Font and Color Blindness Controls */}
          <div className="flex flex-col md:flex-row gap-x-8 gap-y-4">
            <div
              className="flex flex-col gap-y-2 flex-1"
              style={{
                color: getDisplayColor(background, foreground),
              }}
            >
              <Label htmlFor="typeface-select" className="text-base md:text-lg">
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
                    borderColor: getDisplayColor(background, foreground),
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="border-3 max-h-72 overflow-y-scroll"
                  style={{
                    borderColor: getDisplayColor(background, foreground),
                    color: getDisplayColor(background, foreground),
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
                color: getDisplayColor(background, foreground),
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
                    borderColor: getDisplayColor(background, foreground),
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="border-3"
                  style={{
                    borderColor: getDisplayColor(background, foreground),
                    color: getDisplayColor(background, foreground),
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
                color: getDisplayColor(background, foreground),
              }}
            >
              sample text
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <SampleTextCard
                foreground={foreground}
                background={background}
                font={font}
                colorBlindnessType={colorBlindnessType}
                textSize="normal"
                content={error ? error : isLoading ? "Loading..." : data?.quote}
              />

              <SampleTextCard
                foreground={foreground}
                background={background}
                font={font}
                colorBlindnessType={colorBlindnessType}
                textSize="large"
                content={error ? error : isLoading ? "Loading..." : data?.quote}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer background={background} foreground={foreground} />
    </div>
  );
}
