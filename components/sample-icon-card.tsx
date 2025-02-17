import { useEffect } from "react";

import { AccessibleIcon } from "@radix-ui/react-accessible-icon";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Maximize2, X, Rabbit } from "lucide-react";
import { useTranslations } from "next-intl";

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
import { RgbaColor, ColorBlindnessType } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { rgbToHex, rgbaToHex, simulateColorBlindness } from "@/lib/utils/color";

interface SampleIconCardProps {
  foreground: RgbaColor;
  background: RgbaColor;
  bgDisplayColor: string;
  fgDisplayColor: string;
  colorBlindnessSimulation: ColorBlindnessType;
  className?: string;
}

/**
 * A card component that displays a random Anime Quote. Styling is affected by foreground and background colors, in
 * addition to color blindness simulation selection.
 *
 * @param   {RgbaColor}             foreground                  The RGBA color object representing the foreground color.
 * @param   {RgbaColor}             background                  The RGBA color object representing the background color.
 * @param   {string}                bgDisplayColor              The background display color calculated by getDisplayColor.
 * @param   {string}                fgDisplayColor              The foreground display color calculated by getDisplayColor.
 * @param   {ColorBlindnessType}    colorBlindnessSimulation    The display color calculated by getDisplayColor, necessary for styling.
 * @param   {string}                className                   String of classes to apply to the component using cn.
 *
 * @returns                                                     A SampleTextCard component that displays a random Anime Quote.
 *
 * @example
 * ```tsx
 * import { SampleIconCard } from "@/components/sample-icon-card";
 *
 * const foreground = { r: 255, g: 255, b: 255, a: 1 };
 * const background = { r: 255, g: 255, b: 255, a: 1 };
 * const bgDisplayColor = "#000000";
 * const fgDisplayColor = "#ffffff";
 * const colorBlindnessSimulation = "protanopia";
 *
 * <SampleIconCard
 *   bgDisplayColor={bgDisplayColor}
 *   fgDisplayColor={fgDisplayColor}
 *   foreground={foreground}
 *   background={background}
 *   colorBlindnessSimulation={colorBlindnessSimulation}
 *   className="w-80 md:w-96"
 * />
 * ```
 */
const SampleIconCard = ({
  foreground,
  background,
  bgDisplayColor,
  fgDisplayColor,
  colorBlindnessSimulation,
  className,
}: SampleIconCardProps) => {
  // Update CSS variables for the color blindness-simulated colors
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--fg-color-blind",
      rgbaToHex(simulateColorBlindness(foreground, colorBlindnessSimulation)),
    );
    document.documentElement.style.setProperty(
      "--bg-color-blind",
      rgbaToHex(simulateColorBlindness(background, colorBlindnessSimulation)),
    );
  }, [foreground, background, colorBlindnessSimulation]);

  const t = useTranslations("SampleTextCard");

  const simulatedFg = rgbToHex(
    simulateColorBlindness(foreground, colorBlindnessSimulation),
  );

  const simulatedFgAlpha = rgbaToHex(
    simulateColorBlindness(foreground, colorBlindnessSimulation),
  );
  const simulatedBgAlpha = rgbaToHex(
    simulateColorBlindness(background, colorBlindnessSimulation),
  );

  return (
    <Sheet>
      <Card
        className={cn("overflow-hidden border-3 bg-transparent", className)}
        style={{
          borderColor: simulatedFg,
          backgroundColor: simulatedFg,
        }}
      >
        <div
          className="relative border-b-3 px-4 pb-2.5 pt-2"
          style={{
            borderColor: simulatedFg,
          }}
        >
          <h4
            className="text-base font-normal leading-none md:text-lg"
            style={{ color: bgDisplayColor }}
          >
            {t("title.icons")}
          </h4>

          <TooltipButton
            background={background}
            displayColor={fgDisplayColor}
            tooltip={t("buttons.expand.tooltip")}
          >
            <SheetTrigger asChild>
              <Button
                variant="ghost-outline"
                size="icon"
                className="border-ghost-blind absolute right-0.5 top-1/2 size-8 -translate-y-1/2 p-1 focus-visible:ring-offset-[--fg-display] md:right-1 md:size-10 md:p-2"
                style={{ color: bgDisplayColor }}
              >
                <AccessibleIcon label={t("buttons.expand.alt")}>
                  <Maximize2 className="!size-full" />
                </AccessibleIcon>
              </Button>
            </SheetTrigger>
          </TooltipButton>
        </div>

        <div className="checkerboard-md h-full p-0">
          <div
            className="flex h-full justify-center gap-x-4 p-4 text-2xl"
            style={{
              color: simulatedFgAlpha,
              backgroundColor: simulatedBgAlpha,
            }}
          >
            <Rabbit className="size-8" />
            {/* <Separator
                orientation="vertical"
                style={{
                  backgroundColor: simulatedFgAlpha,
                }}
              /> */}
            <Rabbit className="size-8" />
            {/* <Separator
                orientation="vertical"
                style={{
                  backgroundColor: simulatedFgAlpha,
                }}
              /> */}
            <Rabbit className="size-8" />
          </div>
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
          <SheetTitle>{t("sheet-title.icons")}</SheetTitle>
        </VisuallyHidden>
        <div
          className="flex h-full items-center justify-center"
          style={{
            backgroundColor: simulatedBgAlpha,
          }}
        >
          <div className="checkerboard-lg absolute inset-0 -z-10" />
          <div
            className="flex max-w-2xl gap-x-4 p-4 text-2xl"
            style={{
              color: simulatedFgAlpha,
            }}
          >
            <Rabbit className="size-8" />
            <Rabbit className="size-8" />
            <Rabbit className="size-8" />
          </div>
        </div>
        <SheetClose asChild>
          <Button
            size="auto"
            variant="ghost-outline"
            className={`border-ghost absolute right-4 top-4 p-1 md:size-9`}
          >
            <X className="!size-full" />
            <span className="sr-only">{t("buttons.close.alt")}</span>
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
};

SampleIconCard.displayName = "SampleIconCard";

export { SampleIconCard };
