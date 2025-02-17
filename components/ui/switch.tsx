"use client";

import * as React from "react";

import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils/cn";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, color, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full border-3 border-transparent transition-colors focus-visible:outline-none focus-visible:ring focus-visible:ring-[--fg-display] focus-visible:ring-offset-4 focus-visible:ring-offset-[--bg-display] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[25px] data-[state=unchecked]:translate-x-px",
      )}
      style={{
        backgroundColor: color,
      }}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
