"use client";

import { useEffect, useMemo, useState } from "react";

import { ArrowLeftRight, Check, Clipboard, Info } from "lucide-react";
import { useTranslations } from "next-intl";

import { ApcaInfo } from "@/components/apca-info";
import { ColorField } from "@/components/color-field";
import { ContrastSummary } from "@/components/contrast-summary";
import { FontPicker } from "@/components/font-picker";
import { Footer } from "@/components/footer";
import { SampleIconCard, SampleTextCard } from "@/components/sample-cards";
import { SimulationSelect } from "@/components/simulation-select";
import { TooltipButton } from "@/components/tooltip-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WcagInfo } from "@/components/wcag-info";
import { useAnimeQuote } from "@/hooks/use-anime-quote";
import {
  ENHANCE_GOALS,
  EnhanceGoal,
  enhanceContrast,
  EnhanceTarget,
  getContrastReport,
  nextEnhanceGoal,
} from "@/lib/contrast";
import {
  buildFaviconHref,
  buildThemeVars,
  getLowContrastFallback,
  themeVarsToCss,
} from "@/lib/theme";
import { CheckerState, serializeUrlState } from "@/lib/url-state";
import { cn } from "@/lib/utils/cn";

/** How long the URL waits for changes to settle before updating (dragging the picker fires on every pointer move). */
const URL_UPDATE_DELAY = 250;

interface ContrastCheckerProps {
  /** The starting state, parsed from the URL on the server so the first paint already has the right colors. */
  initial: CheckerState;
}

/**
 * The whole checker: owns the color, standard, font and simulation state, keeps the URL and favicon in sync with it,
 * and lays out the page. Rendered once by the locale page.
 */
export function ContrastChecker({ initial }: ContrastCheckerProps) {
  const [foreground, setForeground] = useState(initial.foreground);
  const [background, setBackground] = useState(initial.background);
  const [standard, setStandard] = useState(initial.standard);
  const [font, setFont] = useState(initial.font);
  const [simulation, setSimulation] = useState(initial.simulation);

  const [enhanceMenuOpen, setEnhanceMenuOpen] = useState(false);
  const [enhanceGoal, setEnhanceGoal] = useState<EnhanceGoal>("aa");
  const [urlCopied, setUrlCopied] = useState(false);

  const t = useTranslations("ContrastChecker");
  const { data: quote, isLoading: isQuoteLoading } = useAnimeQuote();

  const report = useMemo(
    () => getContrastReport(background, foreground, standard),
    [background, foreground, standard],
  );

  const themeCss = useMemo(
    () => themeVarsToCss(buildThemeVars(background, foreground, simulation)),
    [foreground, background, simulation],
  );

  const lowContrastFallback = getLowContrastFallback(background, foreground);

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

  // Repaint the tab's favicon in the current colors. Next renders the static icon links (favicon.ico, icon.svg) on
  // the server; pointing all of them at one generated SVG means the browser can't fall back to the static pink icon.
  // Debounced like the URL so dragging the picker doesn't regenerate it every frame.
  const faviconHref = useMemo(
    () => buildFaviconHref(background, foreground),
    [foreground, background],
  );
  useEffect(() => {
    const timeout = setTimeout(() => {
      document
        .querySelectorAll<HTMLLinkElement>('link[rel="icon"]')
        .forEach((link) => {
          link.type = "image/svg+xml";
          link.href = faviconHref;
        });
    }, URL_UPDATE_DELAY);
    return () => clearTimeout(timeout);
  }, [faviconHref]);

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

  const nextGoal = nextEnhanceGoal(report.score, standard);
  const goalLabel = (goal: EnhanceGoal) =>
    standard === "apca" ? `Lc ${ENHANCE_GOALS.apca[goal]}` : goal.toUpperCase();

  const handleEnhanceContrast = (type: EnhanceTarget) => {
    const enhanced = enhanceContrast(
      background,
      foreground,
      type,
      standard,
      enhanceGoal,
    );
    setBackground(enhanced.background);
    setForeground(enhanced.foreground);
    setEnhanceMenuOpen(false);
  };

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
              className="ml-0.5 inline-block size-[0.55em] rounded-full bg-ink"
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
            // role="status" rather than "alert": it's an explanation, not something urgent to interrupt for
            <Alert variant="notice" role="status" className="mb-8">
              <Info aria-hidden />
              <AlertDescription className="font-semibold">
                {t(`notice.low-contrast.${lowContrastFallback}`)}
              </AlertDescription>
            </Alert>
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
              <Popover
                open={enhanceMenuOpen}
                onOpenChange={(open) => {
                  // Each time the menu opens, default to the next level the pair doesn't meet yet
                  if (open && nextGoal) setEnhanceGoal(nextGoal);
                  setEnhanceMenuOpen(open);
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    size="xl"
                    disabled={!nextGoal}
                    className="w-full text-base sm:ml-auto sm:w-fit"
                  >
                    {t("buttons.enhance.title")}
                    {!nextGoal && (
                      <span className="font-mono text-xs font-semibold tracking-wide uppercase">
                        {t("buttons.enhance.reason.passes", {
                          level: goalLabel("aaa"),
                        })}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="grid w-fit min-w-52 gap-1 p-2">
                  {/* Only offer a choice when neither goal is met yet */}
                  {nextGoal === "aa" && (
                    <div className="mb-1 flex items-center justify-between gap-3 px-2 pt-1">
                      <span className="label-mono">
                        {t("buttons.enhance.goal")}
                      </span>
                      <SegmentedControl
                        label={t("buttons.enhance.goal")}
                        value={enhanceGoal}
                        onChange={setEnhanceGoal}
                        options={(["aa", "aaa"] as const).map((goal) => ({
                          value: goal,
                          label: goalLabel(goal),
                        }))}
                        className="[&_button]:px-2.5 [&_button]:py-1 [&_button]:text-sm"
                      />
                    </div>
                  )}
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
                  id="colorblind-select"
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
