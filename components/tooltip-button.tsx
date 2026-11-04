"use client";

import { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipButtonProps {
  tooltip: string;
  children: ReactElement;
}

/**
 * Wraps its child element with a tooltip styled with the dynamic theme. Requires a `TooltipProvider` ancestor.
 *
 * @example
 * ```tsx
 * <TooltipButton tooltip="Copy to clipboard">
 *   <button>Click me</button>
 * </TooltipButton>
 * ```
 */
const TooltipButton = ({ tooltip, children }: TooltipButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent>
      <span>{tooltip}</span>
    </TooltipContent>
  </Tooltip>
);

export { TooltipButton };
