import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function ApcaInfo({ displayColor }: { displayColor: string }) {
  return (
    <section
      id="apca-info"
      className="flex flex-col gap-y-6"
      style={{ color: displayColor }}
    >
      <h3 className="font-bold text-xl md:text-2xl mb-0">
        About APCA (Advanced Perceptual Contrast Algorithm)
      </h3>

      <div className="flex flex-col gap-y-2">
        <h4 className="font-medium text-lg md:text-xl ">What is APCA?</h4>

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

        <ul className="list-disc list-inside">
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

      {/* <Separator className="my-2" style={{ backgroundColor: displayColor }} /> */}

      <div className="flex flex-col gap-y-2">
        <h4 className="font-medium text-lg md:text-xl mb-2">
          How APCA Calculates Contrast
        </h4>

        <p>
          APCA calculates contrast using a formula based on the relative
          luminance of foreground and background colors. The output is a score,
          measured in Lightness Contrast (Lc), which determines whether the
          combination is legible. Here&apos;s a quick overview:
        </p>

        <ul className="list-disc list-inside">
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

        <ul className="list-disc list-inside">
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

      {/* <Separator className="my-2" style={{ backgroundColor: "#000" }} /> */}

      <div className="flex flex-col gap-y-2">
        <h4 className="font-medium text-lg md:text-xl mb-2">APCA Levels</h4>

        <p>
          APCA does not use fixed &quot;pass/fail&quot; thresholds but instead
          provides dynamic guidance based on text characteristics:
        </p>

        <ul className="list-disc list-inside">
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

      {/* <Separator className="my-2" style={{ backgroundColor: "#000" }} /> */}

      <div className="flex flex-col gap-y-2">
        <h4 className="font-medium text-lg md:text-xl mb-2">Attributions</h4>

        <p>
          APCA was developed by the Myndex Research team, led by Andrew Somers.
          The algorithm is part of the evolving WCAG 3.0 guidelines and
          represents a scientific leap in accessibility standards.
        </p>

        <p>For detailed insights, visit:</p>

        <ul className="list-disc list-inside">
          <li>
            <Button
              asChild
              variant="link"
              size="auto"
              className="text-base"
              style={{ color: displayColor }}
            >
              <Link href="https://www.myndex.com/APCA/">
                Myndex APCA Overview
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
              <Link href="https://www.myndex.com/APCA/">
                APCA Technical Details
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
              <Link href="https://www.w3.org/WAI/GL/WCAG3/">
                W3C WCAG Draft
              </Link>
            </Button>
          </li>
        </ul>
      </div>

      {/* <Separator className="my-2" style={{ backgroundColor: "#000" }} /> */}

      <div className="flex flex-col gap-y-2">
        <h4 className="font-medium text-lg md:text-xl mb-2">Disclaimer</h4>

        <p>
          The APCA implementation on huedatboy.com aims to provide accurate and
          reliable contrast results. However:
        </p>

        <ul className="list-decimal list-inside">
          <li>
            The displayed values and thresholds may differ slightly depending on
            the color precision and calculation methods used.
          </li>
          <li>
            This tool is designed for educational and reference purposes and
            should not replace a full accessibility audit by a qualified
            professional.
          </li>
        </ul>
      </div>

      {/* <Separator className="my-2" style={{ backgroundColor: "#000" }} /> */}

      <div className="flex flex-col gap-y-2">
        <h4 className="font-medium text-lg md:text-xl mb-2">Further Reading</h4>

        <p>Explore more about color contrast and its role in accessibility:</p>

        <ul className="list-disc list-inside">
          <li>
            <Button
              asChild
              variant="link"
              size="auto"
              className="text-base"
              style={{ color: displayColor }}
            >
              <Link href="https://www.w3.org/WAI/fundamentals/accessibility-principles/">
                Why Contrast Matters
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
                href="https://www.nature.com/articles/s41598-019-49505-y"
                style={{ color: displayColor }}
              >
                Understanding Color Perception
              </Link>
            </Button>
          </li>
        </ul>
      </div>
    </section>
  );
}
