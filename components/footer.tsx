import { AccessibleIcon } from "@radix-ui/react-accessible-icon";
import { Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const getCurrentYear = () => new Date().getFullYear();

/**
 * A footer with the current year and personal links.
 *
 * @param   {string}      displayColor  The display color calculated by getDisplayColor, necessary for styling
 *                                      the tooltip's border and text color.
 *
 * @returns                             'Footer' component with the current year and personal links.
 *
 * @example
 * ```tsx
 * import { Footer } from "@/components/footer";
 *
 * const displayColor = "#000000";

 * <Footer 
 * displayColor={displayColor}
 * />
 * ```
 */
const Footer = ({ displayColor }: { displayColor: string }) => {
  const t = useTranslations("Footer");

  return (
    <footer
      className="container mx-auto mt-12 py-6"
      style={{ color: displayColor }}
    >
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row-reverse">
        <div className="flex gap-x-4">
          <Button
            asChild
            variant="ghost-outline"
            size="auto"
            className={`border-ghost size-12 p-2`}
          >
            <Link
              href="https://github.com/seanpstanley/hue-dat-boy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AccessibleIcon label={t("links.github.alt")}>
                <Github className="!size-full" />
              </AccessibleIcon>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost-outline"
            size="auto"
            className={`border-ghost size-12 p-2`}
          >
            <Link
              href="https://www.linkedin.com/in/seanpstanley/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AccessibleIcon label={t("links.linkedin.alt")}>
                <Linkedin className="!size-full" />
              </AccessibleIcon>
            </Link>
          </Button>
        </div>
        <small className="text-sm">
          {t("text", { year: getCurrentYear(), tech: "shadcn" })}
        </small>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";

export { Footer };
