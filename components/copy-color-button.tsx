"use client";

import { useEffect, useState } from "react";

import { AccessibleIcon } from "@radix-ui/react-accessible-icon";
import { Check, Clipboard } from "lucide-react";
import { useTranslations } from "next-intl";

import { TooltipButton } from "@/components/tooltip-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface CopyColorButtonProps {
  /** The text to copy, e.g. a hex color. */
  value: string;
  /** Classes for the button, e.g. its size and position. */
  className?: string;
}

/**
 * An icon button with a tooltip that copies `value` to the clipboard, briefly swapping to a check mark on success.
 *
 * @example
 * ```tsx
 * <CopyColorButton value={rgbaToHex(foreground)} />
 * ```
 */
const CopyColorButton = ({ value, className }: CopyColorButtonProps) => {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("CopyColorButton");

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard access can be denied (e.g. insecure context); there's nothing useful to do here
    }
  };

  return (
    <TooltipButton tooltip={copied ? t("popover") : t("tooltip")}>
      <Button
        size="auto"
        variant="ghost-outline"
        className={cn("p-1 text-ink lg:p-2", className)}
        onClick={handleCopy}
      >
        <AccessibleIcon label={copied ? t("popover") : t("alt")}>
          {copied ? (
            <Check className="size-full!" />
          ) : (
            <Clipboard className="size-full!" />
          )}
        </AccessibleIcon>
        <span className="sr-only" aria-live="polite">
          {copied ? t("popover") : ""}
        </span>
      </Button>
    </TooltipButton>
  );
};

export { CopyColorButton };
