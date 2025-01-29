"use client";

import { useState, useEffect, useCallback, useMemo, ChangeEvent } from "react";

import { AccessibleIcon } from "@radix-ui/react-accessible-icon";
import { calcAPCA } from "apca-w3";
import { Clipboard, ArrowLeftRight, Check, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAnimeQuote } from "@/app/hooks/use-anime-quote";
import { useGoogleFonts } from "@/app/hooks/use-google-fonts";
import { ApcaInfo } from "@/components/apca-info";
import { ColorPicker } from "@/components/color-picker";
import { CopyColorButton } from "@/components/copy-color-button";
import { FontPicker } from "@/components/font-picker";
import { Footer } from "@/components/footer";
import { SampleTextCard } from "@/components/sample-text-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  // SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WcagInfo } from "@/components/wcag-info";
import { ColorBlindnessType, RgbaColor } from "@/lib/types";
import {
  rgbToHex,
  hexToRgb,
  hslaToRgba,
  rgbaToHsla,
  getDisplayColor,
  rgbaToHex,
  calculateWCAGContrast,
  blendColors,
  hexToRgba,
} from "@/lib/utils/color";
import { debounce } from "@/lib/utils/debounce";

/**
 * An object with the minimum and maximum contrast values as numbers with two decimal points of precision.
 * @typedef   {Object}    ContrastRange
 * @property  {number}    min     The minimum possible contrast value based on the semi-transparent background color.
 * @property  {number}    max   The maximum possible contrast value based on the semi-transparent background color.
 */

/**
 * Calculates the contrast range (minimum and maximum) between two colors
 * using either the WCAG or APCA contrast algorithms.
 *
 * @param     {RgbaColor}       bg        The RGBA color object representing the background color.
 * @param     {RgbaColor}       fg        The RGBA color object representing the foreground color.
 * @param     {boolean}         useAPCA   A boolean indicating whether to use WCAG or APCA contrast calculation.
 * @returns   {ContrastRange}             An object with the minimum and maximum contrast values as numbers with two decimal points of
 *                                        precision.
 *
 * @example
 * const bg = { r: 255, g: 255, b: 255, a: 0.5 };
 * const fg = { r: 0, g: 0, b: 0, a: 1 };
 * const result = calculateContrastRange(bg, fg, false);
 * // result: { min: 1, max: 21 }
 */
function calculateContrastRange(
  bg: RgbaColor,
  fg: RgbaColor,
  useAPCA: boolean,
): { min: number; max: number } {
  const blackBg: RgbaColor = { r: 0, g: 0, b: 0, a: 1 };
  const whiteBg: RgbaColor = { r: 255, g: 255, b: 255, a: 1 };

  let minContrast, maxContrast;

  if (useAPCA) {
    // minContrast = calculateWCAGContrast(bg, fg, blackBg);
    // maxContrast = calculateWCAGContrast(bg, fg, whiteBg);
    minContrast = calculateAPCAContrast(fg, blendColors(bg, blackBg));
    maxContrast = calculateAPCAContrast(fg, blendColors(bg, whiteBg));
  } else {
    minContrast = calculateWCAGContrast(bg, fg, blackBg);
    maxContrast = calculateWCAGContrast(bg, fg, whiteBg);
    // minContrast = calculateWCAGContrast(fg, blendColors(bg, blackBg));
    // maxContrast = calculateWCAGContrast(fg, blendColors(bg, whiteBg));
  }

  return {
    min: Math.min(minContrast, maxContrast),
    max: Math.max(minContrast, maxContrast),
  };
}

/**
 * Calculates the APCA (Advanced Perceptual Contrast Algorithm) contrast between two colors.
 *
 * @param     {RgbaColor}   background    The RGBA color object representing the background color.
 * @param     {RgbaColor}   foreground    The RGBA color object representing the foreground color.
 * @returns   {number}                    The calculated APCA contrast as a number with two decimal places of precision.
 *
 * @example
 * const bg = { r: 255, g: 255, b: 255, a: 1 };
 * const fg = { r: 0, g: 0, b: 0, a: 1 };
 * const contrast = calculateAPCAContrast(bg, fg);
 * // contrast: -90.5 (example value)
 */
function calculateAPCAContrast(background: RgbaColor, foreground: RgbaColor) {
  return Number(
    Number(
      calcAPCA(
        [...Object.values(foreground)] as [number, number, number, number],
        [...Object.values(background)] as [number, number, number],
      ),
    ).toFixed(2),
  );
}

/**
 * Enhances the contrast between a background and a foreground color
 * by adjusting lightness or saturation, or by switching to black/white.
 *
 * @param background - The RGBA color object representing the background color.
 * @param foreground - The RGBA color object representing the foreground color.
 * @param type - Specifies which color(s) to adjust: "text", "background", or "both".
 * @param useAPCA - A boolean indicating whether to use WCAG or APCA contrast calculation.
 * @returns An object containing the adjusted background and foreground colors as RGBA objects.
 *
 * @example
 * const bg = { r: 255, g: 255, b: 255, a: 1 };
 * const fg = { r: 128, g: 128, b: 128, a: 1 };
 * const result = enhanceContrast(bg, fg, "text", false);
 * // result: { background: { r: 255, g: 255, b: 255, a: 1 }, foreground: { r: 0, g: 0, b: 0, a: 1 } }
 */
function enhanceContrast(
  background: RgbaColor,
  foreground: RgbaColor,
  type: "text" | "background" | "both",
  useAPCA: boolean,
): { background: RgbaColor; foreground: RgbaColor } {
  const initialContrast = useAPCA
    ? calculateAPCAContrast(background, foreground)
    : calculateWCAGContrast(background, foreground);
  let newBackground = { ...background };
  let newForeground = { ...foreground };

  const adjustColor = (color: RgbaColor, isBackground: boolean): RgbaColor => {
    const hsl = rgbaToHsla(color);
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

      const lighterRGB = hslaToRgba(lighterHSL);
      const darkerRGB = hslaToRgba(darkerHSL);

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
      const currentHSL = rgbaToHsla(bestColor);
      for (let i = 0; i <= 100; i += step) {
        const lessSaturatedHSL = {
          ...currentHSL,
          s: Math.max(0, currentHSL.s - i),
        };
        const moreSaturatedHSL = {
          ...currentHSL,
          s: Math.min(100, currentHSL.s + i),
        };

        const lessSaturatedRGB = hslaToRgba(lessSaturatedHSL);
        const moreSaturatedRGB = hslaToRgba(moreSaturatedHSL);

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

export default function ContrastChecker() {
  const { replace } = useRouter();

  const searchParams = useSearchParams();

  const searchParamsInitText = searchParams.get("text") as string;
  const searchParamsInitBg = searchParams.get("background") as string;
  const searchParamsInitStandard = searchParams.get("standard") as string;
  const searchParamsInitFont = searchParams.get("font") as string;
  const searchParamsInitSimulation = searchParams.get("simulation") as string;

  const [background, setBackground] = useState<RgbaColor>(
    searchParamsInitBg ? hexToRgba(searchParamsInitBg) : hexToRgba("#f5b4c5"),
  );
  const [foreground, setForeground] = useState<RgbaColor>(
    searchParamsInitText
      ? hexToRgba(searchParamsInitText)
      : hexToRgba("#322e2b"),
  );
  const [backgroundHex, setBackgroundHex] = useState(rgbaToHex(background));
  const [foregroundHex, setForegroundHex] = useState(rgbaToHex(foreground));
  const [backgroundInputValue, setBackgroundInputValue] = useState(
    rgbaToHex(background),
  );
  const [foregroundInputValue, setForegroundInputValue] = useState(
    rgbaToHex(foreground),
  );

  // Memoize the getDisplayColor calculations so it's not being constantly recalculated
  const fgDisplayColor = useMemo(
    () => getDisplayColor(background, foreground),
    [background, foreground],
  );
  const bgDisplayColor = useMemo(
    () => getDisplayColor(foreground, background),
    [background, foreground],
  );

  const [useAPCA, setUseAPCA] = useState(
    searchParamsInitStandard
      ? searchParamsInitStandard === "wcag"
        ? false
        : true
      : false,
  );
  const [font, setFont] = useState(
    searchParamsInitFont ? searchParamsInitFont : "",
  );
  const [colorBlindnessSimulation, setColorBlindnessSimulation] =
    useState<ColorBlindnessType>(
      searchParamsInitSimulation
        ? (searchParamsInitSimulation as ColorBlindnessType)
        : "normal vision",
    );

  const [enhanceMenuOpen, setEnhanceMenuOpen] = useState(false);
  const [copyUrlOpen, setCopyUrlOpen] = useState(false);

  const wcagContrast = calculateWCAGContrast(background, foreground);
  const contrastRange = calculateContrastRange(background, foreground, useAPCA);
  const apcaContrast = calculateAPCAContrast(background, foreground);

  const wcagResults = {
    "AA Large":
      background.a && background.a < 1
        ? contrastRange.min >= 3
        : wcagContrast >= 3,
    "AAA Large":
      background.a && background.a < 1
        ? contrastRange.min >= 4.5
        : wcagContrast >= 4.5,
    "AA Normal":
      background.a && background.a < 1
        ? contrastRange.min >= 4.5
        : wcagContrast >= 4.5,
    "AAA Normal":
      background.a && background.a < 1
        ? contrastRange.min >= 7
        : wcagContrast >= 7,
  };

  const apcaResults = {
    "normal body text":
      background.a && background.a < 1
        ? contrastRange.min >= 4.5
        : Math.abs(apcaContrast) >= 75,
    "medium-size (24px or more) or bold (16px) text":
      background.a && background.a < 1
        ? contrastRange.min >= 7
        : Math.abs(wcagContrast) >= 60,
    "large (36px or more) or bold (24px or more) or non-text elements":
      background.a && background.a < 1
        ? contrastRange.min >= 7
        : Math.abs(wcagContrast) >= 45,
  };

  //  precompute / cache the list of fonts/ color blindness for refresh to avoid flicker
  const COLOR_BLINDNESS_TYPES = [
    "normal vision",
    "protanopia",
    "deuteranopia",
    "tritanopia",
    "achromatopsia",
  ];

  const debouncedColorChange = debounce(
    (colorType: "background" | "foreground", value: string) => {
      if (/^#?[0-9A-Fa-f]{6,8}$/.test(value)) {
        const colorValue = value.startsWith("#") ? value : `#${value}`;
        const newColor = hexToRgb(colorValue);
        if (colorType === "background") {
          setBackground(newColor);
        } else {
          setForeground(newColor);
        }
      } else if (/^(\d{1,3},){3}(\d*\.?\d+)$/.test(value)) {
        const [r, g, b, a] = value.split(",").map(Number);
        if (r <= 255 && g <= 255 && b <= 255 && a >= 0 && a <= 1) {
          const newRgb = { r, g, b, a };
          if (colorType === "background") {
            setBackground(newRgb);
          } else {
            setForeground(newRgb);
          }
        }
      }
    },
    50,
  );

  const handleColorChange = useCallback(
    (colorType: "background" | "foreground", value: RgbaColor) => {
      debouncedColorChange(colorType, rgbaToHex(value));
    },
    [debouncedColorChange],
  );

  const handleReverseColors = () => {
    const newBackground = foreground;
    const newForeground = background;
    setBackground(newBackground);
    setForeground(newForeground);
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.toString());
    setCopyUrlOpen(true);
    setTimeout(() => setCopyUrlOpen(false), 2000); // Reset after 2 seconds
  };

  const handleEnhanceContrast = (type: "text" | "background" | "both") => {
    const { background: newBackground, foreground: newForeground } =
      enhanceContrast(background, foreground, type, useAPCA);

    setBackground(newBackground);
    setForeground(newForeground);
  };

  const updateUrl = useCallback(() => {
    const newParams = new URLSearchParams();

    newParams.set("text", foregroundHex.replace("#", ""));
    newParams.set("background", backgroundHex.replace("#", ""));
    newParams.set("standard", useAPCA ? "apca" : "wcag");
    if (font !== "") newParams.set("font", font);
    newParams.set("simulation", colorBlindnessSimulation);
    replace(`?${newParams.toString()}`, { scroll: false });
  }, [
    replace,
    foregroundHex,
    backgroundHex,
    useAPCA,
    font,
    colorBlindnessSimulation,
  ]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    color: "foreground" | "background",
  ) => {
    let value = e.target.value;

    // Add "#" to the beginning if missing and input matches valid hex length
    if (!value.startsWith("#") && (value.length === 6 || value.length === 8)) {
      value = "#" + value;
    }

    // Regex for 6 or 8 character hex codes (with or without alpha)
    const hexRegex = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;

    if (color === "foreground") {
      setForegroundInputValue(value); // Update input field regardless of validity

      // Only update background color if valid hex string
      if (hexRegex.test(value)) {
        setForeground(hexToRgba(value));
      }
    } else {
      setBackgroundInputValue(value); // Update input field regardless of validity

      // Only update background color if valid hex string
      if (hexRegex.test(value)) {
        setBackground(hexToRgba(value));
      }
    }
  };

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // Keep the hex conversion of the fg/bg colors and inputs up to date
  useEffect(() => {
    const newForegroundHex = rgbaToHex(foreground);
    const newBackgroundHex = rgbaToHex(background);
    setForegroundHex(newForegroundHex);
    setBackgroundHex(newBackgroundHex);
    setForegroundInputValue(newForegroundHex);
    setBackgroundInputValue(newBackgroundHex);
  }, [foreground, background]);

  const {
    data: quoteData,
    error: quoteError,
    isLoading: isQuoteLoading,
  } = useAnimeQuote();
  const {
    data: fontData,
    error: fontError,
    isLoading: isFontLoading,
  } = useGoogleFonts();

  return (
    <div
      className={`min-h-screen p-4 pt-8 transition-[background-color]`}
      style={{ backgroundColor: rgbToHex(background) }}
    >
      {/* Website Title */}
      <header className="mb-12 text-center md:mb-16">
        <span
          className="text-sm font-medium md:text-base"
          style={{
            color: fgDisplayColor,
          }}
        >
          hue dat boy.
        </span>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto">
        {/* Page Title */}
        <div className="mb-8 md:mb-12">
          <h1
            className="text-2xl font-bold md:text-4xl"
            style={{
              color: fgDisplayColor,
            }}
          >
            color contrast checker (& more!)
          </h1>
        </div>

        {/* Contrast Info and Standards Compliance */}
        <section
          className="mb-8 flex flex-col items-start gap-y-4"
          style={{
            color: fgDisplayColor,
          }}
          id="contrast-info"
        >
          {/* Contrast Ratio and Standards Levels */}
          <div className="flex w-full flex-col flex-wrap justify-between gap-x-8 gap-y-4 md:flex-row md:items-end">
            {/* Contrast Ratio  */}
            <div className="flex w-fit flex-col gap-y-2 text-nowrap">
              <Label htmlFor="contrast-value" className="text-base md:text-lg">
                contrast value
              </Label>

              <div
                className="flex items-center gap-10 rounded-lg border-3 px-2.5 py-4"
                style={{
                  borderColor: fgDisplayColor,
                }}
              >
                <h2
                  id="contrast-value"
                  className="text-5xl font-bold sm:text-6xl md:text-7xl lg:text-8xl"
                >
                  {useAPCA ? (
                    <>
                      {apcaContrast} L
                      <sup className="-top-3.5 -ml-3 md:-top-6 md:-ml-4">c</sup>
                    </>
                  ) : (
                    <>
                      {background.a && background.a < 1 ? (
                        <>
                          {useAPCA ? (
                            <>
                              {contrastRange.min} to {contrastRange.max}
                            </>
                          ) : (
                            <>
                              {contrastRange.min} : 1 to {contrastRange.max} : 1
                            </>
                          )}
                        </>
                      ) : (
                        <>{wcagContrast} : 1</>
                      )}
                    </>
                  )}
                </h2>
              </div>
            </div>

            {/* Standards Levels */}
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="contrast-value" className="text-base md:text-lg">
                {useAPCA ? "apca" : "wcag"} levels
              </Label>
              <div className="flex flex-wrap gap-2 md:grid md:grid-cols-2 lg:grid-cols-4">
                {useAPCA ? (
                  <>
                    {Object.entries(apcaResults).map(([level, passes]) => (
                      <div
                        key={level}
                        className="inline-flex items-center justify-between gap-x-2 rounded-full border-3 bg-transparent px-4 py-2 text-base font-semibold transition-colors md:text-lg"
                        style={{
                          borderColor: fgDisplayColor,
                          backgroundColor: passes
                            ? fgDisplayColor
                            : rgbToHex(background),
                          color: passes ? bgDisplayColor : fgDisplayColor,
                        }}
                      >
                        {level}
                        {passes ? (
                          <AccessibleIcon label="Pass">
                            <Check className="h-6 w-6" />
                          </AccessibleIcon>
                        ) : (
                          <AccessibleIcon label="Fail">
                            <X className="h-6 w-6" />
                          </AccessibleIcon>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {Object.entries(wcagResults).map(([level, passes]) => (
                      <div
                        key={level}
                        className="inline-flex items-center justify-between gap-x-2 rounded-full border-3 bg-transparent px-4 py-2 text-base font-semibold transition-colors md:text-lg"
                        style={{
                          borderColor: fgDisplayColor,
                          backgroundColor: passes
                            ? fgDisplayColor
                            : rgbToHex(background),
                          color: passes ? bgDisplayColor : fgDisplayColor,
                        }}
                      >
                        {level}
                        {passes ? (
                          <AccessibleIcon label="Pass">
                            <Check className="h-6 w-6" />
                          </AccessibleIcon>
                        ) : (
                          <AccessibleIcon label="Fail">
                            <X className="h-6 w-6" />
                          </AccessibleIcon>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* User Controls */}
        <section className="flex flex-col gap-y-8" id="controls">
          <div className="flex flex-col items-center justify-between gap-x-4 gap-y-4 sm:flex-row">
            {/* Standards Toggle */}
            <div className="flex items-center gap-x-2">
              <Label
                htmlFor="contrast-standard"
                className="text-base md:text-lg"
                style={{
                  color: fgDisplayColor,
                }}
              >
                wcag 2.2
              </Label>
              <Switch
                id="contrast-standard"
                checked={useAPCA}
                onCheckedChange={setUseAPCA}
                style={{
                  borderColor: fgDisplayColor,
                  backgroundColor: backgroundHex,
                }}
                color={fgDisplayColor}
              />
              <Label
                htmlFor="contrast-standard"
                className="text-base md:text-lg"
                style={{
                  color: fgDisplayColor,
                }}
              >
                apca
              </Label>
            </div>

            {/* Enhance Colors Button */}
            <Popover open={enhanceMenuOpen} onOpenChange={setEnhanceMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  style={{
                    color: fgDisplayColor,
                    borderColor: fgDisplayColor,
                  }}
                  size="xl"
                  disabled={
                    (!useAPCA && wcagContrast >= 4.5) ||
                    (useAPCA && Math.abs(apcaContrast) >= 75) ||
                    foreground.a < 1 ||
                    background.a < 1 // only usable on fully opaque colors
                  }
                  className="w-full text-base sm:ml-auto sm:w-fit"
                >
                  enhance contrast
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-fit border-3 p-0"
                style={{
                  color: fgDisplayColor,
                  borderColor: fgDisplayColor,
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

            {/* Copy URL Button */}
            <Popover open={copyUrlOpen} onOpenChange={setCopyUrlOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleCopyUrl}
                  size="xl"
                  className={`w-full gap-x-1 text-base hover:text-[${bgDisplayColor}] sm:w-fit`}
                  style={{
                    color: fgDisplayColor,
                    borderColor: fgDisplayColor,
                  }}
                >
                  share these colors
                  <Clipboard className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-fit border-3 px-3 py-1.5 text-sm"
                style={{
                  backgroundColor: `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`,
                  color: fgDisplayColor,
                  borderColor: fgDisplayColor,
                }}
              >
                copied url!
              </PopoverContent>
            </Popover>
          </div>

          {/* Color Controls */}
          <div
            className="flex flex-col items-center justify-between gap-x-4 gap-y-2 md:flex-row"
            style={{
              color: fgDisplayColor,
            }}
          >
            {/* Text Color */}
            <div className="flex w-full flex-col gap-y-2">
              <Label
                htmlFor="foreground-color"
                className="text-base md:text-lg"
              >
                text color
              </Label>
              <div className="relative">
                <ColorPicker
                  color={foreground}
                  displayColor={fgDisplayColor}
                  onChange={(value) => handleColorChange("foreground", value)}
                  className="absolute left-2.5 top-1/2 size-9 -translate-y-1/2 md:left-3.5 md:size-10 lg:left-4 lg:size-14"
                />
                <Input
                  id="foreground-color"
                  name="foreground-color"
                  value={foregroundInputValue}
                  onChange={(e) => {
                    handleInputChange(e, "foreground");
                  }}
                  style={{
                    borderColor: fgDisplayColor,
                  }}
                  spellCheck={false}
                  maxLength={9} // Allow for "#" + 8 characters
                  className="h-fit border-3 bg-transparent px-14 py-2 font-mono text-3xl font-medium leading-none md:px-16 md:text-4xl lg:px-20 lg:text-6xl"
                />

                <CopyColorButton
                  copyColor="text"
                  displayColor={fgDisplayColor}
                  foreground={foreground}
                  background={background}
                />
              </div>
            </div>

            {/* Swap Colors */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost-outline"
                    size="auto"
                    className={`size-12 shrink-0 p-2 border-[${fgDisplayColor}]/0 border-opacity-0`}
                    onClick={handleReverseColors}
                  >
                    <span className="sr-only">Swap colors</span>
                    <ArrowLeftRight className="!size-full rotate-90 transition-transform md:rotate-0" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  style={{
                    borderColor: fgDisplayColor,
                    backgroundColor: rgbToHex(background),
                    color: fgDisplayColor,
                  }}
                >
                  <span>swap colors</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Background Color */}
            <div
              className="flex w-full flex-col gap-y-2"
              style={{
                borderColor: fgDisplayColor,
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
                    borderColor: fgDisplayColor,
                  }}
                >
                  <ColorPicker
                    color={background}
                    onChange={(value) => handleColorChange("background", value)}
                    displayColor={fgDisplayColor}
                    className="absolute left-2.5 top-1/2 size-9 -translate-y-1/2 md:left-3.5 md:size-10 lg:left-4 lg:size-14"
                  />
                </div>

                <Input
                  id="background-color"
                  name="background-color"
                  value={backgroundInputValue}
                  onChange={(e) => {
                    handleInputChange(e, "background");
                  }}
                  spellCheck={false}
                  maxLength={9} // Allow for "#" + 8 characters
                  style={{
                    borderColor: fgDisplayColor,
                  }}
                  className="h-fit border-3 bg-transparent px-14 py-2 font-mono text-3xl font-medium leading-none md:px-16 md:text-4xl lg:px-20 lg:text-6xl"
                />

                <CopyColorButton
                  copyColor="background"
                  displayColor={fgDisplayColor}
                  foreground={foreground}
                  background={background}
                />
              </div>
            </div>
          </div>

          {/* Font and Color Blindness Dropdowns */}
          <div className="flex flex-col gap-x-8 gap-y-4 md:flex-row">
            <div
              className="flex flex-1 flex-col gap-y-2"
              style={{
                color: fgDisplayColor,
              }}
            >
              <Label htmlFor="typeface-select" className="text-base md:text-lg">
                typeface
              </Label>
              <FontPicker
                defaultFont={font}
                fonts={fontData?.items}
                isLoading={isFontLoading}
                error={fontError}
                displayColor={fgDisplayColor}
                background={background}
                onChange={setFont}
              />
            </div>

            <div
              className="flex flex-1 flex-col gap-y-2"
              style={{
                color: fgDisplayColor,
              }}
            >
              <Label
                htmlFor="colorblind-select"
                className="text-base md:text-lg"
              >
                simulate colorblindness
              </Label>
              <Select
                value={colorBlindnessSimulation}
                onValueChange={(value: ColorBlindnessType) =>
                  setColorBlindnessSimulation(value)
                }
              >
                <SelectTrigger
                  className="h-fit border-3 bg-transparent py-2 text-lg md:text-2xl"
                  id="colorblind-select"
                  style={{
                    borderColor: fgDisplayColor,
                  }}
                >
                  {colorBlindnessSimulation}
                  {/* <SelectValue /> */}
                </SelectTrigger>
                <SelectContent
                  className="border-3"
                  style={{
                    borderColor: fgDisplayColor,
                    color: fgDisplayColor,
                    backgroundColor: `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`,
                  }}
                >
                  {COLOR_BLINDNESS_TYPES.map((simulation) => (
                    <SelectItem
                      key={simulation}
                      value={simulation}
                      className="text-lg md:text-2xl"
                    >
                      {simulation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sample Text Section */}
          <section className="flex flex-col gap-y-4" id="sample-text">
            <h3
              className="text-xl font-bold md:text-2xl"
              style={{
                color: fgDisplayColor,
              }}
            >
              sample text
            </h3>

            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              <SampleTextCard
                foreground={foreground}
                background={background}
                fgDisplayColor={fgDisplayColor}
                bgDisplayColor={bgDisplayColor}
                font={font}
                colorBlindnessSimulation={colorBlindnessSimulation}
                textSize="normal"
                isLoading={isQuoteLoading}
                error={quoteError}
                data={quoteData?.data}
              />
              <SampleTextCard
                foreground={foreground}
                background={background}
                fgDisplayColor={fgDisplayColor}
                bgDisplayColor={bgDisplayColor}
                font={font}
                colorBlindnessSimulation={colorBlindnessSimulation}
                textSize="large"
                isLoading={isQuoteLoading}
                error={quoteError}
                data={quoteData?.data}
              />
            </div>
          </section>

          <Separator
            className="my-8"
            style={{ backgroundColor: fgDisplayColor }}
          />

          {useAPCA ? (
            <ApcaInfo displayColor={fgDisplayColor} />
          ) : (
            <WcagInfo displayColor={fgDisplayColor} />
          )}
        </section>
      </main>

      <Footer displayColor={fgDisplayColor} />

      {/* Dynamicly update selection and selected text colors based on foreground/background colors */}
      <style jsx global>{`
        ::selection {
          background-color: var(--selection-color, ${fgDisplayColor});
          color: var(--selection-text-color, ${backgroundHex});
        }
      `}</style>

      {/* Dynamically load the selected font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=${font.replace(
          / /g,
          "+",
        )}&display=swap");
      `}</style>
    </div>
  );
}
