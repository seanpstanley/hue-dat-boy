import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border-3 border-ink px-4 py-3 text-ink has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "",
        // Dashed: informational, about the app itself rather than the user's colors
        notice: "border-dashed",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * A callout box with an optional leading icon. Variants: `default` (solid border) and `notice` (dashed, for notes
 * about the app itself). Defaults to `role="alert"`; pass `role="status"` for anything that isn't urgent.
 *
 * @example
 * ```tsx
 * <Alert variant="notice" role="status">
 *   <Info aria-hidden />
 *   <AlertTitle>low contrast mode</AlertTitle>
 *   <AlertDescription>The interface switched to black so it stays usable.</AlertDescription>
 * </Alert>
 * ```
 */
function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("col-start-2 font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("col-start-2", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
