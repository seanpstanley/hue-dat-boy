"use client";

import { useEffect, useMemo, useState } from "react";

import { ArrowLeftRight, Check, Clipboard, Info } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAnimeQuote } from "@/app/hooks/use-anime-quote";
import { ApcaInfo } from "@/components/apca-info";
import { ColorField } from "@/components/color-field";
import { ContrastMeter } from "@/components/contrast-meter";
import { FontPicker } from "@/components/font-picker";
import { Footer } from "@/components/footer";
import { SampleIconCard, SampleTextCard } from "@/components/sample-text-card";
import { TooltipButton } from "@/components/tooltip-button";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WcagInfo } from "@/components/wcag-info";
import {
  buildThemeVars,
  getLowContrastFallback,
  themeVarsToCss,
} from "@/lib/theme";
import { ColorBlindnessType, RgbaColor } from "@/lib/types";
import {
  CheckerState,
  COLOR_BLINDNESS_TYPES,
  serializeUrlState,
} from "@/lib/url-state";
import { cn } from "@/lib/utils/cn";
import { rgbToHex, simulateColorBlindness } from "@/lib/utils/color";
import {
  APCA_THRESHOLDS,
  ContrastReport,
  ENHANCE_MINIMUM,
  enhanceContrast,
  getContrastReport,
  WCAG_THRESHOLDS,
} from "@/lib/utils/contrast";

/** How long the URL waits for changes to settle before updating (dragging the picker fires on every pointer move). */
const URL_UPDATE_DELAY = 250;

export function ContrastChecker({ initial }: { initial: CheckerState }) {
  const [foreground, setForeground] = useState(initial.foreground);
  const [background, setBackground] = useState(initial.background);
  const [standard, setStandard] = useState(initial.standard);
  const [font, setFont] = useState(initial.font);
  const [simulation, setSimulation] = useState(initial.simulation);

  const [enhanceMenuOpen, setEnhanceMenuOpen] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const t = useTranslations("ContrastChecker");
  const { data: quote, isLoading: isQuoteLoading } = useAnimeQuote();

  const report = useMemo(
    () => getContrastReport(background, foreground, standard),
    [background, foreground, standard],
  );

  const themeCss = useMemo(
    () => themeVarsToCss(buildThemeVars(foreground, background, simulation)),
    [foreground, background, simulation],
  );

  const lowContrastFallback = getLowContrastFallback(foreground, background);

  const queryString = serializeUrlState({
    foreground,
    background,
    standard,
    font,
    simulation,
  });

  // Keep the URL shareable without re-rendering through the router. Next.js syncs native history updates with its
  // router, and debouncing keeps rapid picker changes from spamming the history API.
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.history.replaceState(null, "", `?${queryString}`);
    }, URL_UPDATE_DELAY);
    return () => clearTimeout(timeout);
  }, [queryString]);

  useEffect(() => {
    if (!urlCopied) return;
    const timeout = setTimeout(() => setUrlCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [urlCopied]);

  const handleCopyUrl = async () => {
    try {
      // Built from state rather than window.location, which may still be waiting on the debounced update
      const url = `${window.location.origin}${window.location.pathname}?${queryString}`;
      await navigator.clipboard.writeText(url);
      setUrlCopied(true);
    } catch {
      // Clipboard access can be denied; nothing useful to do
    }
  };

  const handleSwapColors = () => {
    setForeground(background);
    setBackground(foreground);
  };

  const handleEnhanceContrast = (type: "text" | "background" | "both") => {
    const enhanced = enhanceContrast(background, foreground, type, standard);
    setBackground(enhanced.background);
    setForeground(enhanced.foreground);
    setEnhanceMenuOpen(false);
  };

  const isOpaque = foreground.a === 1 && background.a === 1;
  const enhanceBlockedReason = !isOpaque
    ? t("buttons.enhance.reason.alpha")
    : report.score >= ENHANCE_MINIMUM[standard]
      ? t("buttons.enhance.reason.passes", {
          level: standard === "apca" ? "Lc 75" : "AA",
        })
      : null;

  const canEnhance =
    report.score < ENHANCE_MINIMUM[standard] &&
    foreground.a === 1 &&
    background.a === 1; // only usable on fully opaque colors

  return (
    <TooltipProvider>
      {/* Drives every themed color on the page (see globals.css). Rendered inline so it's correct on first paint. */}
      <style>{themeCss}</style>

      {/* Load the selected Google Font. React hoists this into <head> and dedupes it. */}
      {font && (
        <link
          rel="stylesheet"
          precedence="default"
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}&display=swap`}
        />
      )}

      <div className="min-h-screen bg-surface p-4 text-ink transition-colors">
        <header className="container mx-auto mb-6 md:mt-2 md:mb-10">
          <span className="font-display-tight text-lg font-extrabold tracking-tight md:text-xl">
            hue dat boy
            <span
              aria-hidden
              className="ml-0.5 inline-block size-[0.55em] rounded-full border-2 border-ink bg-fg"
            />
          </span>
        </header>

        <main className="container mx-auto">
          <div className="mb-8 md:mb-12">
            <h1 className="font-display-tight text-4xl leading-[0.95] font-extrabold tracking-[-0.01em] text-balance [font-variation-settings:'wdth'_88,'opsz'_96] [word-spacing:0.06em] md:text-6xl lg:text-7xl">
              {t("title")}
            </h1>
          </div>

          {lowContrastFallback && (
            <p
              role="status"
              className="mb-8 flex items-start gap-3 rounded-lg border-3 border-dashed border-ink px-4 py-3 font-semibold"
            >
              <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
              {t(`notice.low-contrast.${lowContrastFallback}`)}
            </p>
          )}

          <ContrastSummary report={report} />

          <section className="flex flex-col gap-y-8" id="controls">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              {/* Standards Toggle */}
              <SegmentedControl
                label={t("labels.standard")}
                value={standard}
                onChange={setStandard}
                options={[
                  { value: "wcag", label: "WCAG 2.2" },
                  { value: "apca", label: "APCA" },
                ]}
              />

              {/* Enhance Colors */}
              <Popover open={enhanceMenuOpen} onOpenChange={setEnhanceMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="xl"
                    disabled={!canEnhance}
                    className="w-full text-base sm:ml-auto sm:w-fit"
                  >
                    {t("buttons.enhance.title")}
                    {enhanceBlockedReason && (
                      <span className="font-mono text-xs font-semibold tracking-wide uppercase">
                        {enhanceBlockedReason}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="grid w-fit p-2">
                  {(["text", "background", "both"] as const).map((type) => (
                    <Button
                      key={type}
                      variant="ghost"
                      className="w-full justify-start text-base"
                      onClick={() => handleEnhanceContrast(type)}
                    >
                      {t(`buttons.enhance.popover.${type}`)}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Copy URL */}
              <Button
                onClick={handleCopyUrl}
                variant="primary"
                size="xl"
                className="w-full gap-x-1 text-base sm:w-fit"
              >
                {/* Both labels share one grid cell so the button keeps the wider width (no layout shift) */}
                <span className="grid place-items-center">
                  <span
                    className={cn(
                      "col-start-1 row-start-1 inline-flex items-center gap-x-1",
                      urlCopied && "invisible",
                    )}
                  >
                    {t("buttons.share.title")}
                    <Clipboard className="size-4" />
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "col-start-1 row-start-1 inline-flex items-center gap-x-1",
                      !urlCopied && "invisible",
                    )}
                  >
                    {t("buttons.share.popover")}
                    <Check className="size-4" />
                  </span>
                </span>
                <span className="sr-only" aria-live="polite">
                  {urlCopied ? t("buttons.share.popover") : ""}
                </span>
              </Button>
            </div>

            {/* Color Controls */}
            <div className="flex flex-col items-center justify-between gap-x-4 gap-y-2 md:flex-row">
              <ColorField
                id="foreground-color"
                label={t("labels.inputs.text")}
                color={foreground}
                onChange={setForeground}
              />

              <TooltipButton tooltip={t("buttons.swap.tooltip")}>
                <Button
                  variant="ghost-outline"
                  size="auto"
                  className="size-12 shrink-0 p-2"
                  onClick={handleSwapColors}
                >
                  <span className="sr-only">{t("buttons.swap.alt")}</span>
                  <ArrowLeftRight className="size-full! rotate-90 transition-transform md:rotate-0" />
                </Button>
              </TooltipButton>

              <ColorField
                id="background-color"
                label={t("labels.inputs.background")}
                color={background}
                onChange={setBackground}
              />
            </div>

            {/* Font and Color Blindness Dropdowns */}
            <div className="flex flex-col gap-x-8 gap-y-4 md:flex-row">
              <div className="flex flex-1 flex-col gap-y-2">
                <span id="typeface-label" className="label-mono">
                  {t("labels.selects.typeface")}
                </span>
                <FontPicker
                  labelledBy="typeface-label"
                  value={font}
                  onChange={setFont}
                />
              </div>

              <div className="flex flex-1 flex-col gap-y-2">
                <label htmlFor="colorblind-select" className="label-mono">
                  {t("labels.selects.color-blindness")}
                </label>
                <SimulationSelect
                  value={simulation}
                  onChange={setSimulation}
                  foreground={foreground}
                  background={background}
                />
              </div>
            </div>

            {/* Sample Text */}
            <section className="flex flex-col gap-y-4" id="sample-text">
              <h3 className="font-display-tight text-2xl font-extrabold tracking-[-0.01em] md:text-3xl">
                {t("sections.sample-text")}
              </h3>

              <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-10">
                <SampleTextCard
                  textSize="normal"
                  font={font}
                  isLoading={isQuoteLoading}
                  quote={quote}
                  className="lg:col-span-3"
                />
                <SampleTextCard
                  textSize="large"
                  font={font}
                  isLoading={isQuoteLoading}
                  quote={quote}
                  className="lg:col-span-5"
                />
                <SampleIconCard className="lg:col-span-2" />
              </div>
            </section>

            <Separator className="my-8" />

            {standard === "apca" ? <ApcaInfo /> : <WcagInfo />}
          </section>
        </main>

        <Footer />
      </div>
    </TooltipProvider>
  );
}

/** The big contrast number, pass/fail badges for each level of the active standard, and the contrast meter. */
function ContrastSummary({ report }: { report: ContrastReport }) {
  const t = useTranslations("ContrastChecker");
  const isApca = report.standard === "apca";

  // Remember the previous levels so a badge can "stamp" only when it flips from fail to pass (not on page load)
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

  const unit = (text: string) => (
    <span className="ml-[0.06em] text-[0.42em] font-medium tracking-normal">
      {text}
    </span>
  );
  const unitText = isApca ? "Lc" : ":1";
  const thresholds: Record<string, number> = isApca
    ? APCA_THRESHOLDS
    : WCAG_THRESHOLDS;

  return (
    <section className="mb-8 flex flex-col gap-y-4" id="contrast-info">
      <div className="flex w-full flex-col justify-between gap-x-8 gap-y-4 md:flex-row md:items-end">
        <div className="flex min-w-0 flex-col gap-y-2">
          <span id="contrast-label" className="label-mono">
            {t("labels.contrast")}
          </span>
          {/* Inverted "poster" block: shows the pair in the other polarity, background on text */}
          <div className="w-fit max-w-full rounded-lg bg-ink px-4 pt-3 pb-4 text-on-ink md:px-6">
            <h2
              aria-labelledby="contrast-label"
              className={cn(
                "font-display-tight leading-[0.82] font-extrabold tracking-tight whitespace-nowrap tabular-nums",
                report.range
                  ? "text-5xl sm:text-6xl md:text-7xl"
                  : "text-7xl sm:text-8xl md:text-9xl lg:text-[10rem]",
              )}
            >
              {report.range ? (
                <>
                  {report.range.min}
                  {unit(unitText)}{" "}
                  <span className="text-[0.4em] font-medium">to</span>{" "}
                  {report.range.max}
                  {unit(unitText)}
                </>
              ) : (
                <>
                  {report.value}
                  {unit(unitText)}
                </>
              )}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-y-2 md:items-end">
          <span id="levels-label" className="label-mono">
            {isApca ? t("labels.badges.apca") : t("labels.badges.wcag")}
          </span>
          <ul
            aria-labelledby="levels-label"
            className="flex flex-wrap gap-2 md:justify-end"
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
                    passes ? "bg-ink text-on-ink" : "line-through decoration-2",
                  )}
                >
                  {t(`badges.${report.standard}.${level}`)}
                  {passes && <Check className="size-5" aria-hidden />}
                  <span className="sr-only">{passes ? "Pass" : "Fail"}</span>
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

function SimulationSelect({
  value,
  onChange,
  foreground,
  background,
}: {
  value: ColorBlindnessType;
  onChange: (value: ColorBlindnessType) => void;
  foreground: RgbaColor;
  background: RgbaColor;
}) {
  const t = useTranslations("ContrastChecker");
  const labelFor = (simulation: ColorBlindnessType) =>
    simulation === "normal vision"
      ? t("selects.color-blindness.normal-vision")
      : simulation;

  // A preview of what the current pair looks like under each simulation
  const swatches = (simulation: ColorBlindnessType) => (
    <span aria-hidden className="inline-flex shrink-0 gap-1">
      {[foreground, background].map((color, i) => (
        <span
          key={i}
          className="size-4 rounded-[4px] border-2 border-current md:size-5"
          style={{
            backgroundColor: rgbToHex(
              simulateColorBlindness(color, simulation),
            ),
          }}
        />
      ))}
    </span>
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id="colorblind-select"
        className="h-fit py-2 font-display-tight text-lg font-bold md:text-2xl"
      >
        <div className="flex min-w-0 items-center gap-3">
          {swatches(value)}
          <span className="truncate">{labelFor(value)}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {COLOR_BLINDNESS_TYPES.map((simulation) => (
          <SelectItem
            key={simulation}
            value={simulation}
            aside={swatches(simulation)}
            className="text-lg md:text-2xl"
          >
            {labelFor(simulation)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
