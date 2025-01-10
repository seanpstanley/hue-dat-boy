"use client";

import { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RgbaColor } from "@/lib/types";

interface TooltipButtonProps {
  background: RgbaColor;
  displayColor: string;
  tooltip: string;
  children: ReactElement;
}

const TooltipButton = ({
  background,
  displayColor,
  tooltip,
  children,
}: TooltipButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          style={{
            borderColor: displayColor,
            backgroundColor: `rgba(${background.r}, ${background.g}, ${background.b}, ${background.a})`,
            color: displayColor,
          }}
        >
          <span>{tooltip}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

TooltipButton.displayName = "TooltipButton";

export { TooltipButton };
