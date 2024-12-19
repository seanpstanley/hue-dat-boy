"use client";

import { Clipboard } from "lucide-react";

import { TooltipButton } from "@/components/tooltip-button";
import { Button } from "@/components/ui/button";
import { rgbaToHex } from "@/lib/utils";
import { RgbaColor } from "react-colorful";

type ColorType = "text" | "background";

interface CopyColorButtonProps {
  color: ColorType;
  foreground: RgbaColor;
  background: RgbaColor;
}

export const CopyColorButton = ({
  color,
  foreground,
  background,
}: CopyColorButtonProps) => {
  return (
    <TooltipButton
      foreground={foreground}
      background={background}
      tooltip="copy color"
    >
      <Button
        size="auto"
        variant="ghost"
        className="absolute size-9 md:size-12 right-2.5 md:right-4 top-1/2 -translate-y-1/2 p-2"
        onClick={() =>
          navigator.clipboard.writeText(
            rgbaToHex(color === "text" ? foreground : background)
          )
        }
      >
        <Clipboard className="!size-full" />
      </Button>
    </TooltipButton>
  );
};
