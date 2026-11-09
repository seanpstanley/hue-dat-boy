"use client";

import { useState } from "react";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { ContrastMeter } from "@/components/contrast-meter";
import {
  APCA_THRESHOLDS,
  ContrastReport,
  WCAG_THRESHOLDS,
} from "@/lib/contrast";
import { cn } from "@/lib/utils/cn";

/**
 * How big the contrast number gets: `max` is its full size, and `em` is the widest the text can be in ems (measured
 * with the display font: e.g. "10.95:1" is ~2.1em wide, "72.87Lc to 107.88Lc" is ~5.25em). On narrower screens the
 * number shrinks just enough that its widest possible value still fits the section, so it can never overflow its
 * block or push the page sideways.
 */
const NUMBER_SIZES = {
  wcag: { max: "10rem", em: 2.2 },
  apca: { max: "10rem", em: 2.9 },
  wcagRange: { max: "4.5rem", em: 4.5 },
  apcaRange: { max: "4.5rem", em: 5.4 },
};

/** Horizontal padding of the number's block (px-6 at most), which the number can't use. */
const BLOCK_PADDING = "3rem";

function numberFontSize({ standard, range }: ContrastReport) {
  const { max, em } =
    NUMBER_SIZES[range ? (`${standard}Range` as const) : standard];
  return `min(${max}, calc((100cqi - ${BLOCK_PADDING}) / ${em}))`;
}

interface ContrastSummaryProps {
  /** The contrast report for the current pair, from `getContrastReport`. */
  report: ContrastReport;
}

/**
 * The headline result: the big contrast number (or range, for semi-transparent backgrounds), a pass/fail ticket for
 * each level of the active standard, and the contrast meter. A ticket plays a "stamp" animation when its level flips
 * from fail to pass.
 *
 * @example
 * ```tsx
 * const report = getContrastReport(background, foreground, "wcag");
 *
 * <ContrastSummary report={report} />
 * ```
 */
function ContrastSummary({ report }: ContrastSummaryProps) {
  const t = useTranslations("ContrastChecker");
  const isApca = report.standard === "apca";

  // Remember the previous levels so a ticket can stamp only when it flips from fail to pass (not on page load)
  const [prevLevels, setPrevLevels] = useState(report.levels);
  const [stamped, setStamped] = useState<string[]>([]);
  if (prevLevels !== report.levels) {
    setPrevLevels(report.levels);
    setStamped(
      Object.keys(report.levels).filter(
        (level) => report.levels[level] && prevLevels[level] === false,
      ),
    );
  }

  const unitText = isApca ? "Lc" : ":1";
  const unit = (
    <span className="ml-[0.06em] text-[0.42em] font-medium tracking-normal">
      {unitText}
    </span>
  );
  const thresholds: Record<string, number> = isApca
    ? APCA_THRESHOLDS
    : WCAG_THRESHOLDS;

  return (
    // A size container, so the number can scale to the section's width (see NUMBER_SIZES)
    <section
      className="@container mb-8 flex flex-col gap-y-4"
      id="contrast-info"
    >
      {/* Wraps instead of switching to a row at a breakpoint: the tickets only sit beside the number when both fit */}
      <div className="flex w-full flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex max-w-full shrink-0 flex-col gap-y-2">
          <span id="contrast-label" className="label-mono">
            {t("labels.contrast")}
          </span>
          {/* Inverted "poster" block: shows the pair in the other polarity, background on text */}
          <div className="w-fit max-w-full rounded-lg bg-ink px-4 pt-3 pb-4 text-on-ink md:px-6">
            <h2
              aria-labelledby="contrast-label"
              className="font-display-tight leading-[0.82] font-extrabold tracking-tight whitespace-nowrap tabular-nums"
              style={{ fontSize: numberFontSize(report) }}
            >
              {report.range ? (
                <>
                  {report.range.min}
                  {unit}{" "}
                  <span className="text-[0.4em] font-medium">
                    {t("labels.range-to")}
                  </span>{" "}
                  {report.range.max}
                  {unit}
                </>
              ) : (
                <>
                  {report.value}
                  {unit}
                </>
              )}
            </h2>
          </div>
        </div>

        <div className="ml-auto flex flex-col items-end gap-y-2">
          <span id="levels-label" className="label-mono">
            {isApca ? t("labels.badges.apca") : t("labels.badges.wcag")}
          </span>
          <ul
            aria-labelledby="levels-label"
            className="flex flex-wrap justify-end gap-2"
          >
            {Object.entries(report.levels).map(([level, passes]) => (
              <li
                // Remounting on change replays the stamp animation each time a level flips to pass
                key={`${report.standard}-${level}-${passes}`}
                className={cn(
                  "inline-grid grid-cols-[auto_auto] overflow-hidden rounded-lg border-3 border-ink text-base font-semibold md:text-lg",
                  !passes && "border-dashed",
                  stamped.includes(level) && "motion-safe:animate-stamp",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-x-2 px-3 py-1.5",
                    passes && "bg-ink text-on-ink",
                  )}
                >
                  {t(`badges.${report.standard}.${level}`)}
                  {passes && <Check className="size-5" aria-hidden />}
                  <span className="sr-only">
                    {passes ? t("labels.pass") : t("labels.fail")}
                  </span>
                </span>
                {/* The required score, so the numbers sink in just by using the tool */}
                <span
                  className={cn(
                    "inline-flex items-center border-l-3 border-ink px-2.5 font-mono text-sm",
                    !passes && "border-dashed",
                  )}
                >
                  {thresholds[level]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ContrastMeter report={report} />
    </section>
  );
}

export { ContrastSummary };
