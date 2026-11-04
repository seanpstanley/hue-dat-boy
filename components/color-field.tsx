"use client";

import { memo, useState } from "react";

import { ColorPicker } from "@/components/color-picker";
import { CopyColorButton } from "@/components/copy-color-button";
import { RgbaColor } from "@/lib/types";
import { parseHex, rgbaToHex, rgbaToHsla } from "@/lib/utils/color";

interface ColorFieldProps {
  id: string;
  label: string;
  color: RgbaColor;
  onChange: (color: RgbaColor) => void;
}

/** "rgb 50 46 43 · hsl 26 8% 18%", plus alpha when the color isn't opaque. */
function describe(color: RgbaColor) {
  const { h, s, l } = rgbaToHsla(color);
  const parts = [
    `rgb ${color.r} ${color.g} ${color.b}`,
    `hsl ${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`,
  ];
  if (color.a < 1) parts.push(`${Math.round(color.a * 100)}% alpha`);
  return parts.join(" · ");
}

/**
 * A "paint chip" color input: a tall swatch that opens the color picker, with an editable hex value, RGB/HSL readout
 * and copy button underneath.
 *
 * The hex input shows the current color, except while the user is typing: then it shows their in-progress text (a
 * "draft"), and only commits it once it's a valid hex color. Because the displayed value is otherwise derived from
 * `color`, it can never get out of sync with the picker, the swap button, or "enhance contrast".
 */
const ColorField = memo(({ id, label, color, onChange }: ColorFieldProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const hex = rgbaToHex(color);

  return (
    <div className="flex w-full min-w-0 flex-col gap-y-2">
      <label htmlFor={id} className="label-mono">
        {label}
      </label>
      <div className="overflow-hidden rounded-lg border-3 border-ink outline-offset-4 outline-ink has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-solid">
        <ColorPicker
          color={color}
          onChange={onChange}
          label={label}
          className="block h-20 w-full rounded-none border-0 border-b-3 focus-visible:outline-offset-[-9px] md:h-28"
        />
        <div className="flex items-center gap-2 py-2 pr-2 pl-3">
          <div className="min-w-0 flex-1">
            <input
              id={id}
              name={id}
              value={draft ?? hex}
              onChange={(e) => {
                const value = e.target.value;
                setDraft(value);
                const parsed = parseHex(value);
                if (parsed) onChange(parsed);
              }}
              onBlur={() => setDraft(null)}
              spellCheck={false}
              autoComplete="off"
              maxLength={9} // "#" + 8 characters
              className="w-full bg-transparent font-mono text-3xl leading-tight font-semibold tracking-tight text-ink outline-none md:text-4xl lg:text-5xl"
            />
            <p className="truncate font-mono text-xs">{describe(color)}</p>
          </div>
          <CopyColorButton
            value={hex}
            className="size-10 shrink-0 lg:size-12"
          />
        </div>
      </div>
    </div>
  );
});
ColorField.displayName = "ColorField";

export { ColorField };
