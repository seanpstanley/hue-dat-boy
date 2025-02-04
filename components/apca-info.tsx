import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

/**
 * A section with information and links related to the APCA standard.
 *
 * @param   {string}      displayColor  The display color calculated by getDisplayColor, necessary for styling
 *                                      the tooltip's border and text color.
 *
 * @returns                             The 'APCA' component, containing details and links related to the WCAG standard.
 *
 * @example
 * ```tsx
 * import { ApcaInfo } from "@/components/apca-info";
 *
 * const displayColor = "#000000";
 *
 * <ApcaInfo
 *   displayColor={displayColor}
 * />
 * ```
 */
const ApcaInfo = ({ displayColor }: { displayColor: string }) => {
  const t = useTranslations("ApcaInfo");

  return (
    <section
      id="apca-info"
      className="flex flex-col gap-y-6"
      style={{ color: displayColor }}
    >
      <h3 className="mb-0 text-xl font-bold md:text-2xl">{t("title")}</h3>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">
          {t("sections.background")}
        </h4>

        <p>{t("content.background.description")}</p>

        <p>{t("content.background.shift")}:</p>

        <ul className="list-inside list-disc">
          <li>{t("content.background.considerations-list.text-size")}</li>
          <li>{t("content.background.considerations-list.display-env")}</li>
          <li>{t("content.background.considerations-list.color-impact")}</li>
        </ul>

        <p>{t("content.background.real-world")}</p>
      </div>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">
          {t("sections.calculation")}
        </h4>

        <p>{t("content.calculation.overview")}:</p>

        <ul className="list-inside list-disc">
          <li>
            <strong>
              {t("content.calculation.overview-list.relative-luminance.title")}
            </strong>
            :{" "}
            {t(
              "content.calculation.overview-list.relative-luminance.description",
            )}
          </li>
          <li>
            <strong>
              {t(
                "content.calculation.overview-list.directional-contrast.title",
              )}
            </strong>
            :{" "}
            {t(
              "content.calculation.overview-list.directional-contrast.description",
            )}
          </li>
          <li>
            <strong>
              {t("content.calculation.overview-list.dynamic-thresholds.title")}
            </strong>
            :{" "}
            {t(
              "content.calculation.overview-list.dynamic-thresholds.description",
            )}
          </li>
        </ul>

        <p>{t("content.calculation.example")}:</p>

        <ul className="list-inside list-disc">
          <li>{t("content.calculation.example-list.body-text")}</li>
          <li>{t("content.calculation.example-list.large-text")}</li>
        </ul>

        <p>{t("content.calculation.replaces")}</p>
      </div>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">
          {t("sections.levels")}
        </h4>

        <p>{t("content.levels.description")}:</p>

        <ul className="list-inside list-disc">
          <li>
            <strong>{t("content.levels.levels-list.normal-text.title")}</strong>
            : {t("content.levels.levels-list.normal-text.description")}
          </li>
          <li>
            <strong>{t("content.levels.levels-list.large-text.title")}</strong>:{" "}
            {t("content.levels.levels-list.large-text.description")}
          </li>
          <li>
            <strong>{t("content.levels.levels-list.non-text.title")}</strong>:{" "}
            {t("content.levels.levels-list.non-text.description")}
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
            <Button asChild variant="link" size="auto" className="text-base">
              <a
                href={t(
                  "content.attributions.more-info-list.contrast-calculator.link-url",
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t(
                  "content.attributions.more-info-list.contrast-calculator.link-text",
                )}
              </a>
            </Button>
          </li>
          <li>
            <Button asChild variant="link" size="auto" className="text-base">
              <a
                href={t(
                  "content.attributions.more-info-list.readability-criterion.link-url",
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t(
                  "content.attributions.more-info-list.readability-criterion.link-text",
                )}
              </a>
            </Button>
          </li>
          <li>
            <Button asChild variant="link" size="auto" className="text-base">
              <a
                href={t(
                  "content.attributions.more-info-list.apca-github.link-url",
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t("content.attributions.more-info-list.apca-github.link-text")}
              </a>
            </Button>
          </li>
          <li>
            <Button asChild variant="link" size="auto" className="text-base">
              <a
                href={t(
                  "content.attributions.more-info-list.w3c-draft.link-url",
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t("content.attributions.more-info-list.w3c-draft.link-text")}
              </a>
            </Button>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">
          {t("sections.disclaimer")}
        </h4>
        <p>{t("content.disclaimer.description")}</p>

        <p>{t("content.disclaimer.accuracy-disclaimer")}: </p>

        <ul className="list-inside list-decimal">
          <li>
            {t(
              "content.disclaimer.accuracy-disclaimer-list.thresholds.description",
            )}{" "}
            <Button asChild variant="link" size="auto" className="text-base">
              <a
                href={t(
                  "content.disclaimer.accuracy-disclaimer-list.thresholds.link-url",
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t(
                  "content.disclaimer.accuracy-disclaimer-list.thresholds.link-text",
                )}
              </a>
            </Button>{" "}
            {t("content.disclaimer.accuracy-disclaimer-list.package")}
          </li>
          <li>
            {t("content.disclaimer.accuracy-disclaimer-list.educational")}
          </li>
          <li>{t("content.disclaimer.accuracy-disclaimer-list.production")}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">
          {t("sections.further-reading")}
        </h4>

        <p>{t("content.further-reading.description")}:</p>

        <ul className="list-inside list-disc">
          <li>
            <Button asChild variant="link" size="auto" className="text-base">
              <a
                href={t(
                  "content.further-reading.further-reading-list.accessibility-principles.link-url",
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t(
                  "content.further-reading.further-reading-list.accessibility-principles.link-text",
                )}
              </a>
            </Button>
          </li>
          <li>
            <Button asChild variant="link" size="auto" className="text-base">
              <a
                href={t(
                  "content.further-reading.further-reading-list.understanding-colors.link-url",
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t(
                  "content.further-reading.further-reading-list.understanding-colors.link-text",
                )}
              </a>
            </Button>
          </li>
        </ul>
      </div>
    </section>
  );
};

ApcaInfo.displayName = "ApcaInfo";

export { ApcaInfo };
