import * as React from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A bordered, rounded container. Color it with classes, e.g. `border-sim-frame bg-sim-frame`.
 *
 * @example
 * ```tsx
 * <Card className="overflow-hidden border-ink">...</Card>
 * ```
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-lg border-3", className)} {...props} />;
}

export { Card };
