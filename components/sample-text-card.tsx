import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AccessibleIcon } from "@radix-ui/react-accessible-icon";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { rgbToHex, rgbaToHex } from "@/lib/utils/color";
import { cn } from "@/lib/utils/cn";
import { RgbaColor, ColorBlindnessType, AnimechanQuote } from "@/lib/types";
import { TooltipButton } from "@/components/tooltip-button";
import { Maximize2 } from "lucide-react";

/**
 * Simulates color blindness by transforming RGB colors.
 * @param {RgbaColor} color - Input color as an RGBA color object to be transformed based on type selection.
 * @param {ColorBlindnessType} type - The type of color blindness to simulate.
 * @returns The transformed color as an object with properties {r, g, b}.
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
  displayColor: string;
  font: string;
  colorBlindnessSimulation: any;
  textSize: "normal" | "large";
  isLoading: boolean;
  error: any;
  data: AnimechanQuote;
}

const SampleTextCard = ({
  foreground,
  background,
  displayColor,
  font,
  colorBlindnessSimulation,
  textSize,
  isLoading,
  error,
  data,
}: SampleTextCardProps) => {
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
            style={{ color: displayColor }}
          >
            {textSize} text
          </h4>

          <TooltipButton
            background={background}
            displayColor={displayColor}
            tooltip="view fullscreen"
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-1/2 size-8 -translate-y-1/2 p-2 md:size-9"
                style={{ color: displayColor }}
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

      <SheetContent className="h-full border-none p-0" side={"bottom"}>
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
      </SheetContent>
    </Sheet>
  );
};

SampleTextCard.displayName = "SampleTextCard";

export { SampleTextCard };
