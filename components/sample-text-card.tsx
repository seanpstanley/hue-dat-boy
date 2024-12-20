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
import { rgbToHex, cn } from "@/lib/utils";
import { RgbaColor, ColorBlindnessType } from "@/lib/types";
import { TooltipButton } from "@/components/tooltip-button";
import { Maximize2 } from "lucide-react";

/**
 * Simulates color blindness by transforming RGB colors.
 * @param color - Input color as an object with properties {r, g, b}, where each value is between 0 and 255.
 * @param type - The type of color blindness to simulate.
 * @returns The transformed color as an object with properties {r, g, b}.
 */
function simulateColorBlindness(
  color: RgbaColor,
  type: ColorBlindnessType
): RgbaColor {
  if (type === "normal") return color;

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
  font: string;
  colorBlindnessType: any;
  textSize: "normal" | "large";
  content: string;
}

export function SampleTextCard({
  foreground,
  background,
  font,
  colorBlindnessType,
  textSize,
  content,
}: SampleTextCardProps) {
  return (
    <Sheet>
      <Card
        className="overflow-hidden bg-transparent border-3"
        style={{
          borderColor: rgbToHex(
            simulateColorBlindness(foreground, colorBlindnessType)
          ),
          backgroundColor: rgbToHex(
            simulateColorBlindness(foreground, colorBlindnessType)
          ),
        }}
      >
        <div
          className="py-2 px-4 relative"
          style={{
            backgroundColor: rgbToHex(
              simulateColorBlindness(foreground, colorBlindnessType)
            ),
          }}
        >
          <h4
            className="text-base md:text-lg font-medium leading-none"
            style={{
              color: rgbToHex(
                simulateColorBlindness(background, colorBlindnessType)
              ),
            }}
          >
            {textSize} text
          </h4>

          <TooltipButton
            foreground={foreground}
            background={background}
            tooltip="view fullscreen"
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 -translate-y-1/2 right-0.5"
                style={{ color: rgbToHex(background) }}
              >
                <AccessibleIcon label="Fullscreen view">
                  <Maximize2 />
                </AccessibleIcon>
              </Button>
            </SheetTrigger>
          </TooltipButton>
        </div>
        <div
          className="p-4 h-full"
          style={{
            backgroundColor: rgbToHex(
              simulateColorBlindness(background, colorBlindnessType)
            ),
          }}
        >
          <blockquote
            cite="https://kanye.rest"
            className={textSize === "large" ? "text-2xl" : "text-base"}
            style={{
              color: rgbToHex(
                simulateColorBlindness(foreground, colorBlindnessType)
              ),
              fontFamily: font,
            }}
          >
            <p className="before:content-[open-quote] after:content-[close-quote] mb-2">
              {content}
            </p>

            <cite className="text-end block">Kanye West</cite>
          </blockquote>
        </div>
      </Card>

      <SheetContent
        className="h-full flex flex-col justify-center items-center border-none"
        style={{
          backgroundColor: rgbToHex(
            simulateColorBlindness(background, colorBlindnessType)
          ),
        }}
        side={"bottom"}
      >
        <VisuallyHidden>
          <SheetTitle>Full screen {textSize} text</SheetTitle>
        </VisuallyHidden>
        <blockquote
          cite="https://kanye.rest"
          className={cn("max-w-2xl", { "text-2xl": textSize === "large" })}
          style={{
            color: rgbToHex(
              simulateColorBlindness(foreground, colorBlindnessType)
            ),
            fontFamily: font,
          }}
        >
          <p className="before:content-[open-quote] after:content-[close-quote] mb-2">
            {content}
          </p>

          <cite className="text-end block">Kanye West</cite>
        </blockquote>
      </SheetContent>
    </Sheet>
  );
}
