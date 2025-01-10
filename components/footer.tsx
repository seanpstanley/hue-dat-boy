import { Github, Linkedin } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AccessibleIcon } from "@radix-ui/react-accessible-icon";

const getCurrentYear = () => new Date().getFullYear();

const Footer = ({ displayColor }: { displayColor: string }) => {
  return (
    <footer
      className="mt-12 py-6 container mx-auto"
      style={{
        color: displayColor,
      }}
    >
      <div className="flex flex-col items-center sm:flex-row-reverse justify-between gap-4">
        <div className="flex gap-x-4">
          <Button
            asChild
            variant={"ghost"}
            size={"auto"}
            className="size-12 p-2"
          >
            <Link
              href="https://github.com/seanpstanley/hue-dat-boy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AccessibleIcon label="GitHub">
                <Github className="!size-full" />
              </AccessibleIcon>
            </Link>
          </Button>
          <Button
            asChild
            variant={"ghost"}
            size={"auto"}
            className="size-12 p-2"
          >
            <Link
              href="https://www.linkedin.com/in/seanpstanley/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AccessibleIcon label="Twitter">
                <Linkedin className="!size-full" />
              </AccessibleIcon>
            </Link>
          </Button>
        </div>
        <small className="text-sm">
          © {getCurrentYear()} Sean Stanley. Built with shadcn.
        </small>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";

export { Footer };
