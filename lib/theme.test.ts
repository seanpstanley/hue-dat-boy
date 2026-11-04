import { describe, expect, it } from "vitest";

import { buildFaviconHref } from "./theme";

const decode = (href: string) =>
  decodeURIComponent(href.replace("data:image/svg+xml,", ""));

describe("buildFaviconHref", () => {
  it("paints the tile in the background and the dot in the text color", () => {
    const svg = decode(
      buildFaviconHref(
        { r: 50, g: 46, b: 43, a: 1 },
        { r: 245, g: 180, b: 197, a: 1 },
      ),
    );
    expect(svg).toContain(
      '<rect width="32" height="32" rx="8" fill="#f5b4c5"/>',
    );
    expect(svg).toContain('fill="#322e2b"/></svg>');
  });

  it("falls back to black/white for the dot when the pair is low contrast", () => {
    const svg = decode(
      buildFaviconHref(
        { r: 240, g: 160, b: 176, a: 1 },
        { r: 245, g: 180, b: 197, a: 1 },
      ),
    );
    expect(svg).toContain('fill="#000000"/></svg>');
  });
});
