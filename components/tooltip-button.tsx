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

/**
 * A component that wraps its child element with a tooltip.
 * The tooltip displays a custom message and supports customizable background and text colors.
 *
 * @param {RgbaColor} background - The background color of the tooltip as an RGBA object.
 * @param {string} displayColor - The text color and border color of the tooltip.
 * @param {string} tooltip - The message to display inside the tooltip.
 * @param {ReactElement} children - The child ReactElement that triggers the tooltip.
 *
 * @returns The 'TooltipButton' component.
 *
 * @example
 * ```tsx
 * import { TooltipButton } from "@/components/tooltip-button";
 *
 * const background = { r: 255, g: 255, b: 255, a: 0.9 };
 * const displayColor = "#000000";
 * const tooltip = "Copy to clipboard";
 *
 * <TooltipButton
 *   background={background}
 *   displayColor={displayColor}
 *   tooltip={tooltip}
 * >
 *   <button>Click me</button>
 * </TooltipButton>
 */
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
