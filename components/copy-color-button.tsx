"use client";

import { useState, useEffect } from "react";

import { Clipboard } from "lucide-react";

import { TooltipButton } from "@/components/tooltip-button";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
 * @param   {string}      copyColor     Specifies whether to copy the "text" (foreground) or "background" color.
 * @param   {string}      displayColor  The display color calculated by getDisplayColor, necessary for styling
 *                                      the tooltip's border and text color.
 * @param   {RgbaColor}   foreground    The RGBA color object representing the foreground color.
 * @param   {RgbaColor}   background    The RGBA color object representing the background color.
 *
 * @returns                             A button wrapped with a tooltip that, when clicked, copies the specified color to the clipboard.
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
  const [borderColor, setBorderColor] = useState(`border-[${displayColor}]/0`);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBorderColor(`border-[${displayColor}]`);
  }, [displayColor]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      rgbaToHex(copyColor === "text" ? foreground : background),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <Popover open={copied} onOpenChange={setCopied}>
      <TooltipButton
        displayColor={displayColor}
        background={background}
        tooltip="copy color"
      >
        <PopoverTrigger asChild>
          <Button
            size="auto"
            variant="ghost-outline"
            className={`absolute right-2.5 top-1/2 size-9 -translate-y-1/2 border-[${borderColor}] border-opacity-0 p-2 hover:border-black/100 hover:border-opacity-100 md:right-3 md:size-10 lg:right-4 lg:size-16`}
            onClick={handleCopy}
          >
            <Clipboard className="!size-full" />
          </Button>
        </PopoverTrigger>
      </TooltipButton>

      <PopoverContent
        className="w-fit border-3 px-3 py-1.5 text-sm"
        style={{
          backgroundColor: `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`,
          color: displayColor,
          borderColor: displayColor,
        }}
      >
        copied!
      </PopoverContent>
    </Popover>
  );
};

CopyColorButton.displayName = "CopyColorButton";

export { CopyColorButton };
