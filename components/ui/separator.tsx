"use client";

import * as React from "react";

import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils/cn";

/**
 * A 2px rule in the ink color. Decorative (hidden from screen readers) unless `decorative={false}`.
 *
 * @example
 * ```tsx
 * <Separator className="my-8" />
 * ```
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-ink",
        orientation === "horizontal" ? "h-0.5 w-full" : "h-full w-0.5",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
