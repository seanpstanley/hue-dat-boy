"use client";

import { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { rgbaToHex, getDisplayColor } from "@/lib/utils";
import { RgbaColor } from "@/lib/types";

interface TooltipButtonProps {
  foreground: RgbaColor;
  background: RgbaColor;
  tooltip: string;
  children: ReactElement;
}

export const TooltipButton = ({
  foreground,
  background,
  tooltip,
  children,
}: TooltipButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          style={{
            borderColor: getDisplayColor(background, foreground),
            backgroundColor: rgbaToHex(background),
            color: getDisplayColor(background, foreground),
          }}
        >
          <span>{tooltip}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
