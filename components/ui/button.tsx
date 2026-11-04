import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap focus-ring transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-dashed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Filled in the ink color: the main action in a group
        primary:
          "border-3 border-ink bg-ink text-on-ink hover:bg-transparent hover:text-ink focus-visible:bg-transparent focus-visible:text-ink disabled:bg-transparent disabled:text-ink",
        // Outlined in the ink color, fills in on hover/focus
        outline:
          "border-3 border-ink bg-transparent text-ink hover:bg-ink hover:text-on-ink focus-visible:bg-ink focus-visible:text-on-ink",
        // Borderless until hovered/focused
        "ghost-outline":
          "border-3 border-transparent hover:border-ink focus-visible:border-ink",
        // Menu-style item, fills in on hover/focus
        ghost:
          "hover:bg-ink hover:text-on-ink focus-visible:bg-ink focus-visible:text-on-ink",
        link: "text-wrap text-ink underline underline-offset-4 hover:decoration-2",
        naked: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        xl: "h-12 px-6",
        icon: "size-10",
        auto: "h-auto w-auto",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
