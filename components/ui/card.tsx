import * as React from "react";

import { cn } from "@/lib/utils/cn";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-lg border-3", className)} {...props} />;
}

export { Card };
