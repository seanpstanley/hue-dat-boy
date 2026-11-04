"use client";

import * as React from "react";

import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils/cn";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-7 w-13 shrink-0 cursor-pointer items-center rounded-full border-3 border-ink bg-surface focus-ring transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb className="pointer-events-none block size-4 rounded-full bg-ink transition-transform data-[state=checked]:translate-x-[27px] data-[state=unchecked]:translate-x-[3px]" />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
