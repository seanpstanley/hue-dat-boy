"use client";

import { useEffect, useMemo, useState } from "react";

import { AccessibleIcon } from "@radix-ui/react-accessible-icon";
import { ArrowLeftRight, Check, Clipboard, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAnimeQuote } from "@/app/hooks/use-anime-quote";
import { ApcaInfo } from "@/components/apca-info";
import { ColorField } from "@/components/color-field";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WcagInfo } from "@/components/wcag-info";
import { buildThemeVars, themeVarsToCss } from "@/lib/theme";
import { ColorBlindnessType } from "@/lib/types";
import {
  CheckerState,
  COLOR_BLINDNESS_TYPES,
  serializeUrlState,
} from "@/lib/url-state";
import { cn } from "@/lib/utils/cn";
import {
  ContrastReport,
  ENHANCE_MINIMUM,
  enhanceContrast,
  getContrastReport,
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
        <header className="mb-4 text-center md:mt-4 md:mb-6">
          <span className="text-sm font-medium md:text-base">hue dat boy.</span>
        </header>

        <main className="container mx-auto">
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl font-semibold md:text-5xl">{t("title")}</h1>
          </div>

          <ContrastSummary report={report} />

          <section className="flex flex-col gap-y-8" id="controls">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              {/* Standards Toggle */}
              <div className="flex items-center gap-x-2 text-base md:text-lg">
                <label htmlFor="contrast-standard">wcag 2.2</label>
                <Switch
                  id="contrast-standard"
                  checked={standard === "apca"}
                  onCheckedChange={(checked) =>
                    setStandard(checked ? "apca" : "wcag")
                  }
                />
                <label htmlFor="contrast-standard">apca</label>
              </div>

              {/* Enhance Colors */}
              <Popover open={enhanceMenuOpen} onOpenChange={setEnhanceMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="xl"
                    disabled={!canEnhance}
                    className="w-full text-base sm:ml-auto sm:w-fit"
                  >
                    {t("buttons.enhance.title")}
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
                size="xl"
                className="w-full gap-x-1 text-base sm:w-fit"
              >
                {urlCopied
                  ? t("buttons.share.popover")
                  : t("buttons.share.title")}
                {urlCopied ? (
                  <Check className="size-4" />
                ) : (
                  <Clipboard className="size-4" />
                )}
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
                <span id="typeface-label" className="text-base md:text-lg">
                  {t("labels.selects.typeface")}
                </span>
                <FontPicker
                  labelledBy="typeface-label"
                  value={font}
                  onChange={setFont}
                />
              </div>

              <div className="flex flex-1 flex-col gap-y-2">
                <label
                  htmlFor="colorblind-select"
                  className="text-base md:text-lg"
                >
                  {t("labels.selects.color-blindness")}
                </label>
                <SimulationSelect value={simulation} onChange={setSimulation} />
              </div>
            </div>

            {/* Sample Text */}
            <section className="flex flex-col gap-y-4" id="sample-text">
              <h3 className="text-xl font-semibold md:text-2xl">
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

/** The big contrast number plus the pass/fail badges for each level of the active standard. */
function ContrastSummary({ report }: { report: ContrastReport }) {
  const t = useTranslations("ContrastChecker");
  const isApca = report.standard === "apca";

  const value = report.range ? (
    isApca ? (
      <>
        {report.range.min} to {report.range.max} L<sup>c</sup>
      </>
    ) : (
      <>
        {report.range.min} : 1 to {report.range.max} : 1
      </>
    )
  ) : isApca ? (
    <>
      {report.value} L<sup>c</sup>
    </>
  ) : (
    <>{report.value} : 1</>
  );

  return (
    <section
      className="mb-8 flex flex-col items-start gap-y-4"
      id="contrast-info"
    >
      <div className="flex w-full flex-col flex-wrap justify-between gap-x-8 gap-y-4 md:flex-row md:items-end">
        <div className="flex w-fit flex-col gap-y-2 text-nowrap">
          <span id="contrast-label" className="text-base md:text-lg">
            {t("labels.contrast")}
          </span>
          <div className="rounded-lg border-3 border-ink px-2.5 py-4">
            <h2
              aria-labelledby="contrast-label"
              className="text-5xl font-bold tabular-nums sm:text-6xl md:text-7xl lg:text-8xl [&_sup]:-top-[0.9em] [&_sup]:-ml-[0.2em] [&_sup]:text-[0.45em]"
            >
              {value}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <span id="levels-label" className="text-base md:text-lg">
            {isApca ? t("labels.badges.apca") : t("labels.badges.wcag")}
          </span>
          <ul
            aria-labelledby="levels-label"
            className="ml-auto flex flex-wrap gap-2"
          >
            {Object.entries(report.levels).map(([level, passes]) => (
              <li
                key={level}
                className={cn(
                  "inline-flex items-center justify-between gap-x-2 rounded-full border-3 border-ink px-4 py-2 text-base font-semibold transition-colors md:text-lg",
                  passes ? "bg-ink text-on-ink" : "bg-transparent text-ink",
                )}
              >
                {t(`badges.${report.standard}.${level}`)}
                <AccessibleIcon label={passes ? "Pass" : "Fail"}>
                  {passes ? (
                    <Check className="size-6" />
                  ) : (
                    <X className="size-6" />
                  )}
                </AccessibleIcon>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SimulationSelect({
  value,
  onChange,
}: {
  value: ColorBlindnessType;
  onChange: (value: ColorBlindnessType) => void;
}) {
  const t = useTranslations("ContrastChecker");
  const labelFor = (simulation: ColorBlindnessType) =>
    simulation === "normal vision"
      ? t("selects.color-blindness.normal-vision")
      : simulation;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id="colorblind-select"
        className="h-fit py-2 text-lg md:text-2xl"
      >
        {labelFor(value)}
      </SelectTrigger>
      <SelectContent>
        {COLOR_BLINDNESS_TYPES.map((simulation) => (
          <SelectItem
            key={simulation}
            value={simulation}
            className="text-lg md:text-2xl"
          >
            {labelFor(simulation)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
