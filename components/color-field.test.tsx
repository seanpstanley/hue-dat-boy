import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ColorField } from "@/components/color-field";
import { RgbaColor } from "@/lib/types";
import { renderWithProviders } from "@/test/render";

const charcoal: RgbaColor = { r: 50, g: 46, b: 43, a: 1 };
const red: RgbaColor = { r: 255, g: 0, b: 0, a: 1 };

function setup(color = charcoal) {
  const onChange = vi.fn();
  const utils = renderWithProviders(
    <ColorField id="fg" label="text color" color={color} onChange={onChange} />,
  );
  const input = screen.getByLabelText("text color", {
    selector: "input",
  }) as HTMLInputElement;
  return { ...utils, input, onChange };
}

describe("ColorField", () => {
  it("shows the color as hex, with an RGB/HSL readout", () => {
    const { input } = setup();
    expect(input.value).toBe("#322e2b");
    expect(screen.getByText(/rgb 50 46 43/)).toBeTruthy();
  });

  it("keeps partial input as a draft without committing it", () => {
    const { input, onChange } = setup();
    fireEvent.change(input, { target: { value: "#ff" } });
    expect(input.value).toBe("#ff");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("commits as soon as the input is a valid hex color", () => {
    const { input, onChange } = setup();
    fireEvent.change(input, { target: { value: "#f00" } });
    expect(onChange).toHaveBeenCalledWith(red);
  });

  it("drops an unfinished draft on blur", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "#ff" } });
    fireEvent.blur(input);
    expect(input.value).toBe("#322e2b");
  });

  it("follows the color when it changes from outside (picker, swap, enhance)", () => {
    const { input, rerender } = setup();
    rerender(
      <ColorField id="fg" label="text color" color={red} onChange={vi.fn()} />,
    );
    expect(input.value).toBe("#ff0000");
  });
});
