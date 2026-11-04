import { useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SegmentedControl } from "@/components/ui/segmented-control";

const options = [
  { value: "wcag", label: "WCAG 2.2" },
  { value: "apca", label: "APCA" },
];

function Controlled() {
  const [value, setValue] = useState("wcag");
  return (
    <SegmentedControl
      label="contrast standard"
      value={value}
      onChange={setValue}
      options={options}
    />
  );
}

const radio = (name: string) => screen.getByRole("radio", { name });

describe("SegmentedControl", () => {
  it("is a labelled radio group with the selected option checked", () => {
    render(<Controlled />);
    expect(
      screen.getByRole("radiogroup", { name: "contrast standard" }),
    ).toBeTruthy();
    expect(radio("WCAG 2.2").getAttribute("aria-checked")).toBe("true");
    expect(radio("APCA").getAttribute("aria-checked")).toBe("false");
  });

  it("only puts the selected option in the tab order", () => {
    render(<Controlled />);
    expect(radio("WCAG 2.2").tabIndex).toBe(0);
    expect(radio("APCA").tabIndex).toBe(-1);
  });

  it("selects on click", () => {
    render(<Controlled />);
    fireEvent.click(radio("APCA"));
    expect(radio("APCA").getAttribute("aria-checked")).toBe("true");
  });

  it("moves and selects with arrow keys, wrapping around", () => {
    render(<Controlled />);
    fireEvent.keyDown(radio("WCAG 2.2"), { key: "ArrowRight" });
    expect(radio("APCA").getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(radio("APCA"));

    fireEvent.keyDown(radio("APCA"), { key: "ArrowRight" });
    expect(radio("WCAG 2.2").getAttribute("aria-checked")).toBe("true");
  });
});
