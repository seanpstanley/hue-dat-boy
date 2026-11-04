"use client";

import { memo, ReactNode } from "react";

import { AccessibleIcon } from "@radix-ui/react-accessible-icon";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Maximize2, Rabbit, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { TooltipButton } from "@/components/tooltip-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AnimechanQuote } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface SampleCardProps {
  title: string;
  sheetTitle: string;
  children: ReactNode;
  className?: string;
}

/**
 * A card that previews `children` in the (color blindness-simulated) text and background colors, with a button to
 * view the same content fullscreen. Colors come from the `--sim-*` theme variables, so no color props are needed.
 */
const SampleCard = ({
  title,
  sheetTitle,
  children,
  className,
}: SampleCardProps) => {
  const t = useTranslations("SampleTextCard");

  return (
    <Sheet>
      <Card
        className={cn(
          "flex flex-col overflow-hidden border-sim-frame bg-sim-frame",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2 py-1 pr-1 pl-4">
          <h4 className="text-base leading-none font-normal text-sim-on-frame md:text-lg">
            {title}
          </h4>

          <TooltipButton tooltip={t("buttons.expand.tooltip")}>
            <SheetTrigger asChild>
              <Button
                variant="ghost-outline"
                size="icon"
                className="size-9 shrink-0 p-1.5 text-sim-on-frame hover:border-sim-on-frame focus-visible:border-sim-on-frame focus-visible:outline-none md:size-10 md:p-2"
              >
                <AccessibleIcon label={t("buttons.expand.alt")}>
                  <Maximize2 className="size-full!" />
                </AccessibleIcon>
              </Button>
            </SheetTrigger>
          </TooltipButton>
        </div>

        <div className="flex-1 checkerboard-md">
          <div className="h-full bg-sim-bg p-4 text-sim-fg">{children}</div>
        </div>
      </Card>

      <SheetContent className="h-full border-none p-0" side="bottom">
        <VisuallyHidden>
          <SheetTitle>{sheetTitle}</SheetTitle>
        </VisuallyHidden>
        <div className="absolute inset-0 checkerboard-lg" />
        <div className="relative flex h-full items-center justify-center bg-sim-bg text-sim-fg">
          <div className="max-w-2xl p-4">{children}</div>
        </div>
        <SheetClose asChild>
          <Button
            size="auto"
            variant="ghost-outline"
            className="absolute top-4 right-4 size-10 p-1.5 text-sim-ink hover:border-sim-ink focus-visible:border-sim-ink focus-visible:outline-sim-ink"
          >
            <X className="size-full!" />
            <span className="sr-only">{t("buttons.close.alt")}</span>
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
};

/** Shown when the quote API is unavailable (it's rate limited), so the sample text never ends up empty. */
const FALLBACK_QUOTE: AnimechanQuote = {
  content:
    "Sphinx of black quartz, judge my vow. The quick brown fox jumps over the lazy dog.",
  character: { id: 0, name: "Pangram" },
  anime: { id: 0, name: "hue dat boy" },
};

interface SampleTextCardProps {
  textSize: "normal" | "large";
  font: string;
  isLoading: boolean;
  quote: AnimechanQuote | undefined;
  className?: string;
}

/**
 * A sample card showing a random anime quote in the selected font and size.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAnimeQuote();
 *
 * <SampleTextCard textSize="large" font="Inter" isLoading={isLoading} quote={data} />
 * ```
 */
const SampleTextCard = memo(
  ({ textSize, font, isLoading, quote, className }: SampleTextCardProps) => {
    const t = useTranslations("SampleTextCard");
    const data = quote ?? FALLBACK_QUOTE;

    return (
      <SampleCard
        title={t(`title.${textSize}`)}
        sheetTitle={t(`sheet-title.${textSize}`)}
        className={className}
      >
        <blockquote
          cite="https://animechan.io"
          className={cn({ "text-2xl": textSize === "large" })}
          style={font ? { fontFamily: `"${font}", sans-serif` } : undefined}
        >
          {/* Type specimen: a big "Aa" in the chosen typeface makes the font (and large-text contrast) obvious */}
          <span
            aria-hidden
            className={cn(
              "mb-3 block leading-[0.85] font-extrabold tracking-tight",
              font ? "" : "font-display-tight",
              textSize === "large"
                ? "text-7xl md:text-8xl"
                : "text-5xl md:text-6xl",
            )}
          >
            Aa
          </span>
          {isLoading ? (
            <span>{t("loading")}</span>
          ) : (
            <>
              <p className="mb-2 before:content-[open-quote] after:content-[close-quote]">
                {data.content}
              </p>
              <cite className="block text-end">
                <span className="not-italic">
                  &mdash; {data.character?.name},{" "}
                </span>
                {data.anime?.name}
              </cite>
            </>
          )}
        </blockquote>
      </SampleCard>
    );
  },
);
SampleTextCard.displayName = "SampleTextCard";

/** A sample card showing icons, for checking non-text contrast. */
const SampleIconCard = memo(({ className }: { className?: string }) => {
  const t = useTranslations("SampleTextCard");

  return (
    <SampleCard
      title={t("title.icons")}
      sheetTitle={t("sheet-title.icons")}
      className={className}
    >
      <div className="flex justify-center gap-x-4" aria-hidden>
        <Rabbit className="size-8" />
        <Rabbit className="size-8" />
        <Rabbit className="size-8" />
      </div>
    </SampleCard>
  );
});
SampleIconCard.displayName = "SampleIconCard";

export { SampleTextCard, SampleIconCard };
