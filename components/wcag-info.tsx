import { MathJax, MathJaxContext } from "better-react-mathjax";
import Link from "next/link";

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
  return (
    <MathJaxContext>
      <section
        id="wcag-info"
        className="flex flex-col gap-y-6"
        style={{ color: displayColor }}
      >
        <h3 className="mb-0 text-xl font-bold md:text-2xl">
          About WCAG (Web Content Accessibility Guidelines)
        </h3>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">What is WCAG?</h4>

          <p>
            The Web Content Accessibility Guidelines (WCAG) are internationally
            recognized standards for making web content accessible to people
            with disabilities. These guidelines, developed by the World Wide Web
            Consortium (W3C), aim to improve web usability for individuals with
            visual, auditory, cognitive, and motor impairments.
          </p>

          <p>WCAG ensures that content is:</p>

          <ul className="list-inside list-disc">
            <li>
              <strong>Perceivable</strong>: Users can recognize and use
              information.
            </li>
            <li>
              <strong>Operable</strong>: Interfaces are functional for a wide
              range of users.
            </li>
            <li>
              <strong>Understandable</strong>: Content is clear and predictable.
            </li>
            <li>
              <strong>Robust</strong>: Content works well with assistive
              technologies.
            </li>
          </ul>

          <p>
            The guidelines are part of accessibility regulations in many
            countries, making them crucial for compliance and inclusivity.
          </p>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">
            How WCAG Calculates Contrast
          </h4>

          <p>
            The current WCAG 2.2 standard defines contrast ratios as the
            luminance difference between text and background colors. The ratio
            ranges from 1:1 (no contrast) to 21:1 (maximum contrast).
          </p>

          <h5 className="font-bold">Calculation Formula:</h5>
          <MathJax>
            <p>
              <i>Contrast Ratio</i> =
              <span
                suppressHydrationWarning
              >{`\\(\\frac{L_{1} + 0.05}{L_{2} + 0.05}\\)`}</span>
            </p>
          </MathJax>

          <p>Where:</p>
          <ul className="list-inside list-disc" suppressHydrationWarning>
            <li>
              <MathJax inline suppressHydrationWarning>
                {"\\({L_{1}}\\)"}
              </MathJax>
              ​ is the relative luminance of the lighter color.
            </li>
            <li>
              <MathJax inline suppressHydrationWarning>
                {"\\({L_{2}}\\)"}
              </MathJax>
              ​ is the relative luminance of the darker color.
            </li>
          </ul>

          <p>
            <strong>Relative Luminance</strong> considers the perceived
            brightness of colors based on human vision. It accounts for the RGB
            values of the color and adjusts them using a weighting system to
            approximate perception.
          </p>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">WCAG Levels</h4>

          <p>
            WCAG contrast requirements are split into levels to meet varying
            accessibility needs:
          </p>

          <ul className="list-inside list-disc [&_ul]:list-[revert]">
            <li>
              <strong>Level AA</strong>: Minimum contrast for readability.
              <ul className="ml-4 list-inside">
                <li>
                  <strong>Normal Text (12–18px)</strong>: 4.5:1
                </li>
                <li>
                  <strong>Large Text (18px bold or 24px regular)</strong>: 3:1
                </li>
              </ul>
            </li>
            <li>
              <strong>Level AAA</strong>: Enhanced contrast for high
              accessibility.
              <ul className="ml-4 list-inside">
                <li>
                  <strong>Normal Text</strong>: 7:1
                </li>
                <li>
                  <strong>Large Text</strong>: 4.5:1
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">Attributions</h4>

          <p>
            WCAG is developed and maintained by the W3C Web Accessibility
            Initiative (WAI). The guidelines are part of an ongoing effort to
            ensure that digital content is usable by all.
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
                <Link href="https://www.w3.org/WAI/standards-guidelines/wcag/">
                  WCAG 2 Overview
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
                <Link href="https://www.w3.org/WAI/WCAG22/Understanding/">
                  WCAG 2.2 Understanding Docs
                </Link>
              </Button>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">Disclaimer</h4>

          <p>
            The WCAG compliance compliance calculation of this tool aims to
            provide accurate and reliable contrast results. However:
          </p>

          <ul className="list-inside list-decimal">
            <li>
              The displayed values and thresholds may differ slightly depending
              on the color precision and calculation methods used.
            </li>
            <li>
              This tool is designed for educational and reference purposes and
              should not replace a full accessibility audit by a qualified
              professional.
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-y-2">
          <h4 className="text-lg font-medium md:text-xl">Further Reading</h4>

          <p>Explore more about WCAG and color contrast::</p>

          <ul className="list-inside list-disc">
            <li>
              <Button
                asChild
                variant="link"
                size="auto"
                className="text-base"
                style={{ color: displayColor }}
              >
                <Link href="https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/">
                  WCAG 3 Introduction
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
                  href="https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast"
                  style={{ color: displayColor }}
                >
                  Color contrast - Accessibility
                </Link>
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
