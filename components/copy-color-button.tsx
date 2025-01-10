"use client";

import { Clipboard } from "lucide-react";

import { TooltipButton } from "@/components/tooltip-button";
import { Button } from "@/components/ui/button";
import { rgbaToHex } from "@/lib/utils";
import { RgbaColor } from "react-colorful";

type ColorType = "text" | "background";

interface CopyColorButtonProps {
  copyColor: ColorType;
  displayColor: string;
  foreground: RgbaColor;
  background: RgbaColor;
}

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
        className="absolute size-9 md:size-12 right-2.5 md:right-4 top-1/2 -translate-y-1/2 p-2"
        onClick={() =>
          navigator.clipboard.writeText(
            rgbaToHex(copyColor === "text" ? foreground : background)
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
