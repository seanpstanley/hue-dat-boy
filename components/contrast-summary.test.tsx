import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContrastSummary } from "@/components/contrast-summary";
import { getContrastReport } from "@/lib/contrast";
import { renderWithProviders } from "@/test/render";

const white = { r: 255, g: 255, b: 255, a: 1 };
const gray = { r: 150, g: 150, b: 150, a: 1 }; // 2.96:1 on white, fails everything
const black = { r: 0, g: 0, b: 0, a: 1 };

const stamped = () =>
  document.querySelectorAll('li[class*="animate-stamp"]').length;

describe("ContrastSummary", () => {
  it("shows the ratio and a ticket per level with its threshold", () => {
    renderWithProviders(
      <ContrastSummary report={getContrastReport(white, black, "wcag")} />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("21:1");
    const tickets = screen.getAllByRole("listitem");
    expect(tickets).toHaveLength(4);
    // Each ticket shows its required score
    expect(tickets.map((ticket) => ticket.textContent)).toEqual([
      "AA largepass3",
      "AAA largepass4.5",
      "AA normalpass4.5",
      "AAA normalpass7",
    ]);
  });

  it("shows a range for semi-transparent backgrounds", () => {
    renderWithProviders(
      <ContrastSummary
        report={getContrastReport({ ...white, a: 0.5 }, black, "wcag")}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toMatch(
      /:1 to .*:1/,
    );
  });

  it("doesn't stamp passing levels on first render", () => {
    renderWithProviders(
      <ContrastSummary report={getContrastReport(white, black, "wcag")} />,
    );
    expect(stamped()).toBe(0);
  });

  it("stamps the levels that flip from fail to pass", () => {
    const { rerender } = renderWithProviders(
      <ContrastSummary report={getContrastReport(white, gray, "wcag")} />,
    );
    rerender(
      <ContrastSummary report={getContrastReport(white, black, "wcag")} />,
    );
    expect(stamped()).toBe(4);
  });
});
