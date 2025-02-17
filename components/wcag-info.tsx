import { useEffect } from "react";

import { MathJax, MathJaxContext } from "better-react-mathjax";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

/**
 * A section with information and links related to the WCAG standard.
 *
 * @param   {string}      displayColor  The display color calculated by getDisplayColor, necessary for styling
 *                                      the tooltip's border and text color.
 *
 * @returns                             The 'WcagInfo' component, containing details and links related to the WCAG standard.
 *
 * @example
 * ```tsx
 * import { WcagInfo } from "@/components/wcag-info";
 *
 * const displayColor = "#000000";
 *
 * <WcagInfo
 *   displayColor={displayColor}
 * />
 * ```
 */
const WcagInfo = ({ displayColor }: { displayColor: string }) => {
  const t = useTranslations("WcagInfo");

  return (
    // Config disables MathJax's built-in interaction elements, which was causing extra focusable elements in Safari.
    <MathJaxContext
      config={{
        options: {
          enableMenu: false, // Disables right-click MathJax menu
          renderActions: {
            addMenu: [], // Prevents menu elements from being injected
          },
        },
      }}
    >
      <section
        id="wcag-info"
        className="flex flex-col gap-y-6"
        style={{ color: displayColor }}
      >
        <h3 className="mb-0 text-xl font-bold md:text-2xl">{t("title")}</h3>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">
            {t("sections.background")}
          </h4>

          <p>{t("content.background.description")}</p>

          <p>{t("content.background.ensures")}:</p>

          <ul className="list-inside list-disc">
            <li>
              <strong>
                {t("content.background.ensures-list.perceivable.title")}
              </strong>
              : {t("content.background.ensures-list.perceivable.description")}
            </li>
            <li>
              <strong>
                {t("content.background.ensures-list.operable.title")}
              </strong>
              : {t("content.background.ensures-list.operable.description")}
            </li>
            <li>
              <strong>
                {t("content.background.ensures-list.understandable.title")}
              </strong>
              :{" "}
              {t("content.background.ensures-list.understandable.description")}
            </li>
            <li>
              <strong>
                {t("content.background.ensures-list.robust.title")}
              </strong>
              : {t("content.background.ensures-list.robust.description")}
            </li>
          </ul>

          <p>{t("content.background.regulation-compliance")}</p>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">
            {t("sections.calculation")}
          </h4>

          <p>{t("content.calculation.description")}</p>

          <h5 className="font-bold">
            {t("content.calculation.calculation-formula")}:
          </h5>
          <MathJax suppressHydrationWarning hideUntilTypeset="first">
            <p>
              <i>{t("content.calculation.contrast-ratio")}</i> =
              <span
                suppressHydrationWarning
              >{`\\(\\frac{L_{1} + 0.05}{L_{2} + 0.05}\\)`}</span>
            </p>
          </MathJax>

          <p>{t("content.calculation.where")}</p>
          <ul className="list-inside list-disc" suppressHydrationWarning>
            <li>
              <MathJax inline suppressHydrationWarning hideUntilTypeset="first">
                {"\\({L_{1}}\\)"}
              </MathJax>{" "}
              {t("content.calculation.lighter-luminance")}
            </li>
            <li>
              <MathJax inline suppressHydrationWarning hideUntilTypeset="first">
                {"\\({L_{2}}\\)"}
              </MathJax>{" "}
              {t("content.calculation.darker-luminance")}
            </li>
          </ul>

          <p>
            <strong>{t("content.calculation.relative-luminance.title")}</strong>{" "}
            {t("content.calculation.relative-luminance.description")}
          </p>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">
            {t("sections.levels")}
          </h4>

          <p>{t("content.levels.description")}</p>

          <ul className="list-inside list-disc [&_ul]:list-[revert]">
            <li>
              <strong>{t("content.levels.levels-list.aa.title")}</strong>:
              {t("content.levels.levels-list.aa.description")}
              <ul className="ml-4 list-inside">
                <li>
                  <strong>
                    {" "}
                    {t(
                      "content.levels.levels-list.aa.text-sizes-list.normal.title",
                    )}
                  </strong>
                  :{" "}
                  {t(
                    "content.levels.levels-list.aa.text-sizes-list.normal.description",
                  )}
                </li>
                <li>
                  <strong>
                    {t(
                      "content.levels.levels-list.aa.text-sizes-list.large.title",
                    )}
                  </strong>
                  :{" "}
                  {t(
                    "content.levels.levels-list.aa.text-sizes-list.large.description",
                  )}
                </li>
              </ul>
            </li>
            <li>
              <strong>{t("content.levels.levels-list.aaa.title")}</strong>:{" "}
              {t("content.levels.levels-list.aaa.description")}
              <ul className="ml-4 list-inside">
                <li>
                  <strong>
                    {t(
                      "content.levels.levels-list.aaa.text-sizes-list.normal.title",
                    )}
                  </strong>
                  :{" "}
                  {t(
                    "content.levels.levels-list.aaa.text-sizes-list.normal.description",
                  )}
                </li>
                <li>
                  <strong>
                    {t(
                      "content.levels.levels-list.aaa.text-sizes-list.large.title",
                    )}
                  </strong>
                  :{" "}
                  {t(
                    "content.levels.levels-list.aaa.text-sizes-list.large.description",
                  )}
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">
            {t("sections.attributions")}
          </h4>

          <p>{t("content.attributions.description")}</p>

          <p>{t("content.attributions.more-info")}:</p>

          <ul className="list-inside list-disc">
            <li>
              <Button
                asChild
                variant="link"
                size="auto"
                className="text-base"
                style={{ color: displayColor }}
              >
                <a
                  href={t(
                    "content.attributions.more-info-list.wcag-overview.link-url",
                  )}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t(
                    "content.attributions.more-info-list.wcag-overview.link-text",
                  )}
                </a>
              </Button>
            </li>
            <li>
              <Button
                asChild
                variant="link"
                size="auto"
                className="text-base"
                style={{ color: displayColor }}
              >
                <a
                  href={t(
                    "content.attributions.more-info-list.wcag-understanding.link-url",
                  )}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t(
                    "content.attributions.more-info-list.wcag-understanding.link-text",
                  )}
                </a>
              </Button>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">
            {t("sections.disclaimer")}
          </h4>

          <p>{t("content.disclaimer.description")}:</p>

          <ul className="list-inside list-decimal">
            <li>{t("content.disclaimer.disclaimer-list.thresholds")}</li>
            <li>{t("content.disclaimer.disclaimer-list.educational")}</li>
          </ul>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">
            {t("sections.further-reading")}
          </h4>

          <p>{t("content.further-reading.description")}:</p>

          <ul className="list-inside list-disc">
            <li>
              <Button
                asChild
                variant="link"
                size="auto"
                className="text-base"
                style={{ color: displayColor }}
              >
                <a
                  href={t(
                    "content.further-reading.further-reading-list.wcag3-intro.link-url",
                  )}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t(
                    "content.further-reading.further-reading-list.wcag3-intro.link-text",
                  )}
                </a>
              </Button>
            </li>
            <li>
              <Button
                asChild
                variant="link"
                size="auto"
                className="text-base"
                style={{ color: displayColor }}
              >
                <a
                  href={t(
                    "content.further-reading.further-reading-list.color-contrast.link-url",
                  )}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t(
                    "content.further-reading.further-reading-list.color-contrast.link-text",
                  )}
                </a>
              </Button>
            </li>
          </ul>
        </div>
      </section>
    </MathJaxContext>
  );
};

WcagInfo.displayName = "WcagInfo";

export { WcagInfo };
