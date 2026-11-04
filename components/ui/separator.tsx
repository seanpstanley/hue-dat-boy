"use client";

import * as React from "react";

import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils/cn";

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
