"use client";

import { Clipboard } from "lucide-react";

import { TooltipButton } from "@/components/tooltip-button";
import { Button } from "@/components/ui/button";
import { RgbaColor } from "@/lib/types";
import { rgbaToHex } from "@/lib/utils/color";

type ColorType = "text" | "background";

interface CopyColorButtonProps {
  copyColor: ColorType;
  displayColor: string;
  foreground: RgbaColor;
  background: RgbaColor;
}

/**
 * A button component with a tooltip for copying a color value (foreground or background) to the clipboard.
 *
 * @param {string} copyColor - Specifies whether to copy the "text" (foreground) or "background" color.
 * @param {string} displayColor - The display color calculated by getDisplayColor, necessary for styling
 * the tooltip's border and text color.
 * @param {RgbaColor} foreground - The RGBA color object representing the foreground color.
 * @param {RgbaColor} background - The RGBA color object representing the background color.
 *
 * @returns A button wrapped with a tooltip that, when clicked, copies the specified color to the clipboard.
 *
 * @example
 * ```tsx
 * import { CopyColorButton } from "@/components/copy-color-button";
 *
 * const displayColor = "#000000";
 * const foreground = { r: 255, g: 255, b: 255, a: 1 };
 * const background = { r: 255, g: 255, b: 255, a: 1 };
 *
 * <CopyColorButton
 *   copyColor="text"
 *   displayColor={displayColor}
 *   foreground={foreground}
 *   background={background}
 * />
 * ```
 */
const CopyColorButton = ({
  copyColor,
  displayColor,
  foreground,
  background,
}: CopyColorButtonProps) => {
  return (
    <TooltipButton
      displayColor={displayColor}
      background={background}
      tooltip="copy color"
    >
      <Button
        size="auto"
        variant="ghost"
        className="absolute right-2.5 top-1/2 size-9 -translate-y-1/2 p-2 md:right-3 md:size-10 lg:right-4 lg:size-16"
        onClick={() =>
          navigator.clipboard.writeText(
            rgbaToHex(copyColor === "text" ? foreground : background),
          )
        }
      >
        <Clipboard className="!size-full" />
      </Button>
    </TooltipButton>
  );
};

CopyColorButton.displayName = "CopyColorButton";

export { CopyColorButton };
