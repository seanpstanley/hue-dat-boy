"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clipboard, ArrowLeftRight, Check, X } from "lucide-react";
import { calcAPCA } from "apca-w3";
import useSWR from "swr";
import { AccessibleIcon } from "@radix-ui/react-accessible-icon";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { ColorPicker } from "@/components/color-picker";
import { ColorBlindnessType, RgbaColor } from "@/lib/types";
import {
  rgbToHex,
  hexToRgb,
  hslaToRgba,
  rgbaToHsla,
  debounce,
  getDisplayColor,
  rgbaToHex,
  calculateWCAGContrast,
  blendColors,
  hexToRgba,
} from "@/lib/utils";
import { Footer } from "@/components/footer";
import { CopyColorButton } from "@/components/copy-color-button";
import { SampleTextCard } from "@/components/sample-text-card";
import { FontPicker } from "@/components/font-picker";
import { ApcaInfo } from "@/components/apca-info";
import { Separator } from "@/components/ui/separator";
import { WcagInfo } from "@/components/wcag-info";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function calculateContrastRange(
  bg: RgbaColor,
  fg: RgbaColor,
  useAPCA: boolean
): { min: number; max: number } {
  const blackBg: RgbaColor = { r: 0, g: 0, b: 0, a: 1 };
  const whiteBg: RgbaColor = { r: 255, g: 255, b: 255, a: 1 };

  let minContrast, maxContrast;

  // set the font if it fails to be set by the url
  // useEffect(() => {
  //   if (!font) setFont("Inter"); // Ensure default font is set post-hydration
  // }, []);

  //  precompute / cache the list of fonts/ color blindness for refresh to avoid flicker
  // const GOOGLE_FONTS = useMemo(() => ["Inter", "Roboto", "Open Sans"], []);

  // use dynamic
  // const Select = dynamic(() => import("@/components/ui/select"), { ssr: false });

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

function calculateAPCAContrast(background: RgbaColor, foreground: RgbaColor) {
  return Number(
    Number(
      calcAPCA(
        [...Object.values(foreground)] as [number, number, number, number],
        [...Object.values(background)] as [number, number, number]
      )
    ).toFixed(2)
  );
}

function enhanceContrast(
  background: RgbaColor,
  foreground: RgbaColor,
  type: "text" | "background" | "both",
  useAPCA: boolean
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
    console.log(bestColor);
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

  console.log("enhance contrast function:");
  console.log(background.a);
  console.log(newBackground);
  console.log(newForeground);
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
    searchParamsInitBg ? hexToRgb(searchParamsInitBg) : hexToRgb("#f5b4c5")
  );
  const [foreground, setForeground] = useState<RgbaColor>(
    searchParamsInitText ? hexToRgb(searchParamsInitText) : hexToRgb("#322e2b")
  );
  const [backgroundHex, setBackgroundHex] = useState(rgbToHex(background));
  const [foregroundHex, setForegroundHex] = useState(rgbToHex(foreground));

  // Memoize the getDisplayColor calculations so it's not being constantly recalculated
  const fgDisplayColor = useMemo(
    () => getDisplayColor(background, foreground),
    [background, foreground]
  );
  const bgDisplayColor = useMemo(
    () => getDisplayColor(foreground, background),
    [background, foreground]
  );

  const [useAPCA, setUseAPCA] = useState(
    searchParamsInitStandard
      ? searchParamsInitStandard === "wcag"
        ? false
        : true
      : false
  );
  const [font, setFont] = useState(
    searchParamsInitFont ? searchParamsInitFont : ""
  );
  const [colorBlindnessType, setColorBlindnessType] =
    useState<ColorBlindnessType>(
      searchParamsInitSimulation
        ? (searchParamsInitSimulation as ColorBlindnessType)
        : "normal"
    );
  const [enhanceMenuOpen, setEnhanceMenuOpen] = useState(false);

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
    setBackgroundHex(rgbaToHex(newBackground));
    setForegroundHex(rgbaToHex(newForeground));
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.toString());
  };

  const handleEnhanceContrast = (type: "text" | "background" | "both") => {
    const { background: newBackground, foreground: newForeground } =
      enhanceContrast(background, foreground, type, useAPCA);

    console.log("background inside handler: " + newBackground.a);
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
    if (font !== "") newParams.set("font", font);
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

  const {
    data: quoteData,
    error: quoteError,
    isLoading: isQuoteLoading,
  } = useSWR(`/api/quote`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const {
    data: fontData,
    error: fontError,
    isLoading: isFontLoading,
  } = useSWR(`/api/fonts`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return (
    <div
      className={`min-h-screen p-4 pt-8 transition-[background-color]`}
      style={{ backgroundColor: rgbToHex(background) }}
    >
      {/* Website Title */}
      <header className="mb-12 md:mb-16 text-center">
        <span
          className="font-medium"
          style={{
            color: fgDisplayColor,
          }}
        >
          hue dat boy.
        </span>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto container">
        {/* Page Title */}
        <div className="mb-8">
          <h1
            className="font-bold text-2xl md:text-3xl"
            style={{
              color: fgDisplayColor,
            }}
          >
            color contrast checker (& more!)
          </h1>
        </div>

        {/* Contrast Info and Standards Compliance */}
        <section
          className="flex flex-col mb-8 items-start gap-y-4"
          style={{
            color: fgDisplayColor,
          }}
          id="contrast-info"
        >
          {/* Contrast Ratio */}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="contrast-value" className="text-base md:text-lg">
              contrast value
            </Label>

            <div
              className="flex gap-10 items-center rounded-lg border-3 px-2.5 py-4"
              style={{
                borderColor: fgDisplayColor,
              }}
            >
              <h2
                id="contrast-value"
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold"
              >
                {useAPCA ? (
                  <>
                    {apcaContrast} L
                    <sup className="-ml-3 md:-ml-4 -top-3.5 md:-top-6">c</sup>
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
          <div className="flex flex-col gap-y-2 ml-auto">
            {/* <Label
              htmlFor="contrast-value"
              className="text-base md:text-lg ml-auto"
            >
              standards
            </Label> */}
            <div className="grid grid-cols-1 ml-auto sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {useAPCA ? (
                <>
                  {Object.entries(apcaResults).map(([level, passes]) => (
                    <div
                      key={level}
                      className="inline-flex items-center justify-between gap-x-2 rounded-full font-semibold transition-colors text-base md:text-lg py-2 px-4 border-3 bg-transparent"
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
                      className="inline-flex items-center justify-between gap-x-2 rounded-full font-semibold transition-colors text-base md:text-lg py-2 px-4 border-3 bg-transparent"
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
        </section>

        {/* User Controls */}
        <section className="flex flex-col gap-y-8" id="controls">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-x-4 gap-y-4">
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

            {/* Copy Colors Button */}
            <Button
              variant="outline"
              onClick={handleCopyUrl}
              size="xl"
              className="gap-x-1 w-full sm:w-fit text-base"
              style={{
                color: fgDisplayColor,
                borderColor: fgDisplayColor,
              }}
            >
              share these colors
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>

          {/* Color Controls */}
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-x-4 gap-y-2 "
            style={{
              color: fgDisplayColor,
            }}
          >
            {/* Text Color */}
            <div className="flex flex-col gap-y-2 w-full">
              <Label className="text-base md:text-lg">text color</Label>
              <div className="relative">
                <ColorPicker
                  color={foreground}
                  externalColor={fgDisplayColor}
                  onChange={(value) => handleColorChange("foreground", value)}
                  className="absolute size-9 md:size-12 left-2.5 md:left-4 top-1/2 -translate-y-1/2"
                />
                <Input
                  value={foregroundHex}
                  onChange={(e) => {
                    const value = e.target.value;
                    // if (value.length <= 7) {
                    //   setForegroundHex(value);
                    //   if (/^#?[0-9A-Fa-f]{6}$/.test(value)) {
                    //     const colorValue = value.startsWith("#")
                    //       ? value
                    //       : `#${value}`;
                    //     setForeground(hexToRgb(colorValue));
                    //     setForegroundHex(colorValue);
                    //   }
                    // }
                    setForeground(hexToRgba(value));
                    setForegroundHex(value);
                  }}
                  style={{
                    borderColor: fgDisplayColor,
                  }}
                  spellCheck={false}
                  maxLength={7}
                  className="font-medium px-14 md:px-20 bg-transparent font-mono text-3xl h-fit py-2 leading-none md:text-4xl lg:text-5xl border-3"
                />

                <CopyColorButton
                  color="text"
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
              className="flex flex-col gap-y-2 w-full"
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
                    className="absolute size-9 md:size-12 left-2.5 md:left-4 top-1/2 -translate-y-1/2"
                  />
                </div>

                <Input
                  id="background-color"
                  value={backgroundHex}
                  onChange={(e) => {
                    const value = e.target.value;
                    // if (value.length <= 7) {
                    //   setBackgroundHex(value);
                    //   if (/^#?[0-9A-Fa-f]{6}$/.test(value)) {
                    //     const colorValue = value.startsWith("#")
                    //       ? value
                    //       : `#${value}`;
                    //     setBackground(hexToRgb(colorValue));
                    //     setBackgroundHex(colorValue);
                    //   }
                    // }
                    setBackground(hexToRgba(value));
                    setBackgroundHex(value);
                  }}
                  spellCheck={false}
                  // maxLength={7}
                  style={{
                    borderColor: fgDisplayColor,
                  }}
                  className="font-medium w-full px-14 md:px-20 bg-transparent font-mono text-3xl h-fit py-2 leading-none md:text-4xl lg:text-5xl border-3"
                />

                <CopyColorButton
                  color="background"
                  foreground={foreground}
                  background={background}
                />
              </div>
            </div>
          </div>

          {/* Font and Color Blindness Dropdowns */}
          <div className="flex flex-col md:flex-row gap-x-8 gap-y-4">
            <div
              className="flex flex-col gap-y-2 flex-1"
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
              className="flex flex-col gap-y-2 flex-1"
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
                value={colorBlindnessType}
                onValueChange={(value: ColorBlindnessType) =>
                  setColorBlindnessType(value)
                }
                name="colorblind-select"
              >
                <SelectTrigger
                  className="bg-transparent border-3 h-fit py-2 text-lg md:text-2xl"
                  style={{
                    borderColor: fgDisplayColor,
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="border-3"
                  style={{
                    borderColor: fgDisplayColor,
                    color: fgDisplayColor,
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
                color: fgDisplayColor,
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
                isLoading={isQuoteLoading}
                error={quoteError}
                data={quoteData?.data}
              />
              <SampleTextCard
                foreground={foreground}
                background={background}
                font={font}
                colorBlindnessType={colorBlindnessType}
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

      <Footer background={background} foreground={foreground} />

      {/* Dynamicly update selection and selected text colors based on foreground/background colors */}
      <style jsx global>{`
        ::selection {
          background-color: var(--selection-color, ${fgDisplayColor});
          color: var(--selection-text-color, ${rgbToHex(background)});
        }
      `}</style>

      {/* Dynamically load the selected font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=${font.replace(
          / /g,
          "+"
        )}&display=swap");
      `}</style>
    </div>
  );
}
