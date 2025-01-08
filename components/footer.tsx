import { Github, Linkedin } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getDisplayColor } from "@/lib/utils";
import { RgbaColor } from "@/lib/types";

interface FooterProps {
  background: RgbaColor;
  foreground: RgbaColor;
}

const getCurrentYear = () => new Date().getFullYear();

export function Footer({ background, foreground }: FooterProps) {
  return (
    <footer
      className="mt-12 py-6 container mx-auto"
      style={{
        color: getDisplayColor(background, foreground),
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
              <Github className="!size-full" />
              <span className="sr-only">GitHub</span>
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
              <Linkedin className="!size-full" />
              <span className="sr-only">Twitter</span>
            </Link>
          </Button>
        </div>
        <small className="text-sm">
          © {getCurrentYear()} Sean Stanley. Built with shadcn.
        </small>
      </div>
    </footer>
  );
}
