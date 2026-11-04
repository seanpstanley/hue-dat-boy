"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";
import {
  APCA_THRESHOLDS,
  ContrastReport,
  WCAG_THRESHOLDS,
} from "@/lib/utils/contrast";

/** WCAG ratios run 1–21 and are spread out on a log scale; APCA Lc runs roughly 0–108 and is linear. */
const SCALES = {
  wcag: {
    position: (v: number) => (Math.log(Math.max(v, 1)) / Math.log(21)) * 100,
    ends: ["1:1", "21:1"],
    ticks: [
      { value: WCAG_THRESHOLDS.aa_large, key: "aa_large" },
      { value: WCAG_THRESHOLDS.aa_normal, key: "aa_normal" },
      { value: WCAG_THRESHOLDS.aaa_normal, key: "aaa_normal" },
    ],
  },
  apca: {
    position: (v: number) => (Math.min(Math.abs(v), 108) / 108) * 100,
    ends: ["Lc 0", "Lc 108"],
    ticks: [
      { value: APCA_THRESHOLDS.non_text, key: "non_text" },
      { value: APCA_THRESHOLDS.large_text, key: "large_text" },
      { value: APCA_THRESHOLDS.normal_text, key: "normal_text" },
    ],
  },
} as const;

/**
 * A bar showing where the current contrast sits relative to each level's threshold. Purely visual: the pass/fail
 * badges carry the same information for assistive tech, so this is hidden from screen readers.
 */
export function ContrastMeter({ report }: { report: ContrastReport }) {
  const t = useTranslations("ContrastChecker");
  const scale = SCALES[report.standard];
  const min = scale.position(report.score);
  const max = report.range ? scale.position(report.range.max) : min;

  return (
    <div aria-hidden className="flex flex-col gap-1.5">
      <div className="relative h-12 overflow-hidden rounded-lg border-3 border-ink md:h-14">
        {/* Possible range for semi-transparent backgrounds */}
        {report.range && (
          <div
            className="absolute inset-y-0 left-0 bg-ink/25 motion-safe:transition-[width] motion-safe:duration-500"
            style={{ width: `${max}%` }}
          />
        )}
        <div
          className="absolute inset-y-0 left-0 bg-ink motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out"
          style={{ width: `${Math.max(min, 1.5)}%` }}
        />

        {scale.ticks.map((tick) => {
          const left = scale.position(tick.value);
          const cleared = report.score >= tick.value;

          return (
            <div
              key={tick.key}
              className={cn(
                "absolute inset-y-0 border-l-3 border-dashed transition-colors",
                cleared ? "border-on-ink" : "border-ink",
              )}
              style={{ left: `${left}%` }}
            >
              <span
                className={cn(
                  "absolute top-1/2 font-mono text-xs font-bold whitespace-nowrap transition-colors md:text-sm",
                  // Cleared labels sit inside the fill (left of the tick); upcoming ones sit to its right
                  cleared
                    ? "right-1.5 -translate-y-1/2 text-on-ink"
                    : "left-1.5 -translate-y-1/2 text-ink",
                )}
              >
                <span className="hidden lg:inline">
                  {t(`badges.${report.standard}.${tick.key}`)}{" "}
                </span>
                {tick.value}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between font-mono text-xs">
        <span>{scale.ends[0]}</span>
        <span>{scale.ends[1]}</span>
      </div>
    </div>
  );
}
