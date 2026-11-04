"use client";

import * as React from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils/cn";

/** Shares tooltip timing across the app. Render once near the root. */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * A tooltip (Radix Tooltip). For the common case of a tooltip on a button, use `TooltipButton` instead.
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <Button aria-label="Swap colors">⇄</Button>
 *   </TooltipTrigger>
 *   <TooltipContent>swap colors</TooltipContent>
 * </Tooltip>
 * ```
 */
const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Inverted (ink fill, mono text, pointer arrow) so a tooltip never looks like one of the outlined buttons.
 */
function TooltipContent({
  className,
  children,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 animate-in rounded-md bg-ink px-2.5 py-1.5 font-mono text-xs font-semibold tracking-wide text-on-ink fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 md:text-sm",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-ink" width={12} height={6} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
