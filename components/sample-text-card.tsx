import { AccessibleIcon } from "@radix-ui/react-accessible-icon";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Maximize2, X } from "lucide-react";

import { TooltipButton } from "@/components/tooltip-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { RgbaColor, ColorBlindnessType, AnimechanQuote } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { rgbToHex, rgbaToHex } from "@/lib/utils/color";

/**
 * Simulates color blindness by transforming RGB colors.
 * @param     {RgbaColor}           color   Input color as an RGBA color object to be transformed based on type selection.
 * @param     {ColorBlindnessType}  type    The type of color blindness to simulate.
 * @returns                                 The transformed color as an object with properties {r, g, b}.
 */
function simulateColorBlindness(
  color: RgbaColor,
  type: ColorBlindnessType,
): RgbaColor {
  if (type === "normal vision") return color;

  const { r, g, b, a } = color;
  let simulatedColor: RgbaColor;

  switch (type) {
    case "protanopia":
      simulatedColor = {
        r: 0.567 * r + 0.433 * g,
        g: 0.558 * r + 0.442 * g,
        b: 0.242 * r + 0.758 * b,
        a,
      };
      break;
    case "deuteranopia":
      simulatedColor = {
        r: 0.625 * r + 0.375 * g,
        g: 0.7 * r + 0.3 * g,
        b: 0.3 * r + 0.7 * b,
        a,
      };
      break;
    case "tritanopia":
      simulatedColor = {
        r: 0.95 * r + 0.05 * g,
        g: 0.433 * r + 0.567 * g,
        b: 0.475 * r + 0.525 * g,
        a,
      };
      break;
    case "achromatopsia":
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      simulatedColor = { r: gray, g: gray, b: gray, a: a };
      break;
    default:
      simulatedColor = color;
  }

  return {
    r: Math.round(simulatedColor.r),
    g: Math.round(simulatedColor.g),
    b: Math.round(simulatedColor.b),
    a: simulatedColor.a,
  };
}

interface SampleTextCardProps {
  foreground: RgbaColor;
  background: RgbaColor;
  bgDisplayColor: string;
  fgDisplayColor: string;
  font: string;
  colorBlindnessSimulation: ColorBlindnessType;
  textSize: "normal" | "large";
  isLoading: boolean;
  error: any;
  data: AnimechanQuote;
}

/**
 * A card component that displays a random Anime Quote. Styling is affected by foreground and background colors, in
 * addition to color blindness simulation selection.
 *
 * @param   {RgbaColor}             foreground                  The RGBA color object representing the foreground color.
 * @param   {RgbaColor}             background                  The RGBA color object representing the background color.
 * @param   {string}                bgDisplayColor              The background display color calculated by getDisplayColor.
 * @param   {string}                fgDisplayColor              The foreground display color calculated by getDisplayColor.
 * @param   {string}                font                        The current active font, selected by the "typeface" Drawer/Popover.
 * @param   {ColorBlindnessType}    colorBlindnessSimulation    The display color calculated by getDisplayColor, necessary for styling.
 * @param   {boolean}               textSize                    The display color calculated by getDisplayColor, necessary for styling.
 * @param   {boolean}               isLoading                   Loading state provided by SWR.
 * @param   {any}                   error                       Error object provided by SWR.
 * @param   {AnimechanQuote}        data                        The RGBA color object representing the background color.
 *
 * @returns                                                     A SampleTextCard component that displays a random Anime Quote.
 *
 * @example
 * ```tsx
 * import { SampleTextCard } from "@/components/sample-text-card";
 *
 * const foreground = { r: 255, g: 255, b: 255, a: 1 };
 * const background = { r: 255, g: 255, b: 255, a: 1 };
 * const bgDisplayColor = "#000000";
 * const fgDisplayColor = "#ffffff";
 * const font = "Inter";
 * const colorBlindnessSimulation = "protanopia";
 * const {
 *   data: quoteData,
 *   error: quoteError,
 *   isLoading: isQuoteLoading,
 * } = useAnimeQuote();
 *
 * <SampleTextCard
 *   copyColor="text"
 *   displayColor={displayColor}
 *   foreground={foreground}
 *   background={background}
 *   colorBlindnessSimulation={colorBlindnessSimulation}
 *   textSize="normal"
 *   isLoading={isQuoteLoading}
 *   error={quoteError}
 *   data={quoteData?.data}
 * />
 * ```
 */
const SampleTextCard = ({
  foreground,
  background,
  bgDisplayColor,
  fgDisplayColor,
  font,
  colorBlindnessSimulation,
  textSize,
  isLoading,
  error,
  data,
}: SampleTextCardProps) => {
  const fgBorderColor = `border-[${fgDisplayColor}]/0`;
  const bgBorderColor = `border-[${bgDisplayColor}]/0`;
  const hoverFgBorderColor = `hover:border-[${fgDisplayColor}]/100`;
  const hoverBgBorderColor = `hover:border-[${bgDisplayColor}]/100`;

  return (
    <Sheet>
      <Card
        className="overflow-hidden border-3 bg-transparent"
        style={{
          borderColor: rgbToHex(
            simulateColorBlindness(foreground, colorBlindnessSimulation),
          ),
          backgroundColor: rgbToHex(
            simulateColorBlindness(foreground, colorBlindnessSimulation),
          ),
        }}
      >
        <div className="relative px-4 pb-2.5 pt-2">
          <h4
            className="text-base font-medium leading-none md:text-lg"
            style={{ color: bgDisplayColor }}
          >
            {textSize} text
          </h4>

          <TooltipButton
            background={background}
            displayColor={fgDisplayColor}
            tooltip="view fullscreen"
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost-outline"
                size="icon"
                className={`absolute right-0.5 top-1/2 size-8 -translate-y-1/2 p-1 md:right-1 md:size-10 md:p-2 ${bgBorderColor} ${hoverBgBorderColor}`}
                style={{ color: bgDisplayColor }}
              >
                <AccessibleIcon label="Fullscreen view">
                  <Maximize2 className="!size-full" />
                </AccessibleIcon>
              </Button>
            </SheetTrigger>
          </TooltipButton>
        </div>
        {/* <div className="absolute inset-0 -z-10 " /> */}

        <div className="checkerboard-md h-full p-0">
          <blockquote
            cite="https://animechan.io/api/v1"
            className={cn("h-full p-4", { "text-2xl": textSize === "large" })}
            style={{
              color: rgbaToHex(
                simulateColorBlindness(foreground, colorBlindnessSimulation),
              ),
              backgroundColor: rgbaToHex(
                simulateColorBlindness(background, colorBlindnessSimulation),
              ),
              fontFamily: font,
            }}
          >
            {error ? (
              <span>failed to load resource.</span>
            ) : isLoading ? (
              <span>loading...</span>
            ) : (
              <>
                <p className="mb-2 before:content-[open-quote] after:content-[close-quote]">
                  {data?.content}
                </p>

                <cite className="block text-end">
                  <span className="not-italic">
                    &mdash; {data?.character?.name},{" "}
                  </span>
                  {data?.anime?.name}
                </cite>
              </>
            )}
          </blockquote>
        </div>
      </Card>

      <SheetContent
        className="h-full border-none p-0"
        side={"bottom"}
        style={{
          color: fgDisplayColor,
        }}
      >
        <VisuallyHidden>
          <SheetTitle>Full screen {textSize} text</SheetTitle>
        </VisuallyHidden>
        <div
          className="flex h-full items-center justify-center"
          style={{
            backgroundColor: rgbaToHex(
              simulateColorBlindness(background, colorBlindnessSimulation),
            ),
          }}
        >
          <div className="checkerboard-lg absolute inset-0 -z-10" />
          <blockquote
            cite="https://animechan.io/api/v1"
            className={cn("max-w-2xl p-4", {
              "text-2xl": textSize === "large",
            })}
            style={{
              color: rgbaToHex(
                simulateColorBlindness(foreground, colorBlindnessSimulation),
              ),
              fontFamily: font,
            }}
          >
            {error ? (
              <span>failed to load resource.</span>
            ) : isLoading ? (
              <span>loading...</span>
            ) : (
              <>
                <p className="mb-2 before:content-[open-quote] after:content-[close-quote]">
                  {data?.content}
                </p>

                <cite className="block text-end">
                  <span className="not-italic">
                    &mdash; {data?.character?.name},{" "}
                  </span>
                  {data?.anime?.name}
                </cite>
              </>
            )}
          </blockquote>
        </div>
        <SheetClose asChild>
          <Button
            size="auto"
            variant="ghost-outline"
            className={`absolute right-4 top-4 p-1 md:size-9 ${fgBorderColor} ${hoverFgBorderColor}`}
          >
            <X className="!size-full" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
};

SampleTextCard.displayName = "SampleTextCard";

export { SampleTextCard };
