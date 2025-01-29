import Link from "next/link";

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
  return (
    <section
      id="apca-info"
      className="flex flex-col gap-y-6"
      style={{ color: displayColor }}
    >
      <h3 className="mb-0 text-xl font-bold md:text-2xl">
        About APCA (Advanced Perceptual Contrast Algorithm)
      </h3>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">What is APCA?</h4>

        <p>
          The Advanced Perceptual Contrast Algorithm (APCA) is a modern standard
          for evaluating text readability and visual accessibility based on
          human perception. Unlike traditional contrast ratios, APCA leverages
          advanced perceptual science to assess how humans perceive contrast
          across different colors, luminance levels, and text sizes.
        </p>

        <p>
          APCA represents a shift from fixed thresholds to a more nuanced
          approach that accounts for:
        </p>

        <ul className="list-inside list-disc">
          <li>Text size and weight</li>
          <li>Display environments (light or dark modes)</li>
          <li>The impact of background and foreground colors on readability</li>
        </ul>

        <p>
          This approach ensures accessible design tailored to real-world viewing
          conditions, making it especially valuable for modern digital
          interfaces.
        </p>
      </div>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">
          How APCA Calculates Contrast
        </h4>

        <p>
          APCA calculates contrast using a formula based on the relative
          luminance of foreground and background colors. The output is a score,
          measured in Lightness Contrast (Lc), which determines whether the
          combination is legible. Here&apos;s a quick overview:
        </p>

        <ul className="list-inside list-disc">
          <li>
            <strong>Relative Luminance</strong>: APCA evaluates the perceived
            brightness of colors, factoring in the non-linear way humans
            perceive light.
          </li>
          <li>
            <strong>Directional Contrast</strong>: The score reflects whether
            the foreground text is darker or lighter than the background.
          </li>
          <li>
            <strong>Dynamic Thresholds</strong>: Different text sizes and
            weights have distinct thresholds for accessibility.
          </li>
        </ul>

        <p>For example:</p>

        <ul className="list-inside list-disc">
          <li>Small, body text requires an Lc value of 75 or higher.</li>
          <li>
            Large or bold text is readable at lower contrast, with a threshold
            of 60 or higher.
          </li>
        </ul>

        <p>
          The algorithm replaces the traditional &quot;contrast ratio&quot; and
          focuses on achieving visual clarity aligned with the natural
          perception of contrast.
        </p>
      </div>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">APCA Levels</h4>

        <p>
          APCA does not use fixed &quot;pass/fail&quot; thresholds but instead
          provides dynamic guidance based on text characteristics:
        </p>

        <ul className="list-inside list-disc">
          <li>
            <strong>Normal Text (12–18px)</strong>: Lc ≥ 75 for readability.
          </li>
          <li>
            <strong>Large Text (24px or bold 18px)</strong>: Lc ≥ 60 for
            acceptable legibility.
          </li>
          <li>
            <strong>Non-Text Elements</strong>: Lc ≥ 45 for UI elements like
            icons and dividers.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">Attributions</h4>

        <p>
          The APCA algorithm was developed by Andrew Somers at Myndex
          Technologies.
        </p>

        <p>For more information, visit:</p>

        <ul className="list-inside list-disc">
          <li>
            <Button
              asChild
              variant="link"
              size="auto"
              className="text-base"
              style={{ color: displayColor }}
            >
              <Link href="https://www.myndex.com/APCA/">
                APCA Contrast Calculator
              </Link>
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
              <Link href="https://readtech.org/ARC/">
                APCA Readability Criterion
              </Link>
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
              <Link href="https://github.com/Myndex/apca-w3/?tab=readme-ov-file">
                APCA for W3C & WCAG3 GitHub
              </Link>
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
              <Link href="https://www.w3.org/TR/wcag-3.0/">
                W3C Working Draft
              </Link>
            </Button>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">Disclaimer</h4>
        <p>
          This website is beta testing the APCA guidelines for determining text
          and non-text contrast. It is well known that WCAG 2 contrast maths are
          not accurate regarding human perception, and automated testing using
          WCAG 2 math may incorrectly indicate errors in some color pairs on
          this site. The APCA guidelines are a substantial improvement in
          accessibility over WCAG 2 contrast criterions, and therefore compliant
          with the ADA, and also 508 rules under the alternative methods
          section. Any automated or manual testing done to determine conformance
          of this site needs to be conducted using a perceptually accurate
          method such as APCA.
        </p>

        <p>
          The APCA implementation of this tool aims to provide accurate and
          reliable contrast results. However:
        </p>

        <ul className="list-inside list-decimal">
          <li>
            The displayed values and thresholds may differ slightly depending on
            the color precision and calculation methods used. This tool uses the
            algorithm provided in the{" "}
            <Button
              asChild
              variant="link"
              size="auto"
              className="text-base"
              style={{ color: displayColor }}
            >
              <Link href="https://www.w3.org/WAI/fundamentals/accessibility-principles/">
                apca-w3
              </Link>
            </Button>{" "}
            package.
          </li>
          <li>
            This tool is designed for educational and reference purposes and
            should not replace a full accessibility audit by a qualified
            professional.
          </li>
          <li>
            APCA has not yes been integrated into any current standard, so it
            should not be used as the single source of truth for production
            work.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-y-2">
        <h4 className="text-lg font-medium md:text-xl">Further Reading</h4>

        <p>Explore more about color contrast and its role in accessibility:</p>

        <ul className="list-inside list-disc">
          <li>
            <Button
              asChild
              variant="link"
              size="auto"
              className="text-base"
              style={{ color: displayColor }}
            >
              <Link href="https://www.w3.org/WAI/fundamentals/accessibility-principles/">
                Accessibility Principles
              </Link>
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
              <Link
                href="https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_Colors_and_Luminance"
                style={{ color: displayColor }}
              >
                Web Accessibility: Understanding Colors and Luminance
              </Link>
            </Button>
          </li>
        </ul>
      </div>
    </section>
  );
};

ApcaInfo.displayName = "ApcaInfo";

export { ApcaInfo };
