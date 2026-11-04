"use client";

import { memo, useState } from "react";

import { ColorPicker } from "@/components/color-picker";
import { CopyColorButton } from "@/components/copy-color-button";
import { Input } from "@/components/ui/input";
import { RgbaColor } from "@/lib/types";
import { parseHex, rgbaToHex } from "@/lib/utils/color";

interface ColorFieldProps {
  id: string;
  label: string;
  color: RgbaColor;
  onChange: (color: RgbaColor) => void;
}

/**
 * A labelled hex input with a color picker swatch and copy button.
 *
 * The input shows the current color, except while the user is typing: then it shows their in-progress text (a
 * "draft"), and only commits it once it's a valid hex color. Because the displayed value is otherwise derived from
 * `color`, it can never get out of sync with the picker, the swap button, or "enhance contrast".
 */
const ColorField = memo(({ id, label, color, onChange }: ColorFieldProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const hex = rgbaToHex(color);

  return (
    <div className="flex w-full flex-col gap-y-2">
      <label htmlFor={id} className="text-base md:text-lg">
        {label}
      </label>
      <div className="relative">
        <ColorPicker
          color={color}
          onChange={onChange}
          label={label}
          className="absolute top-1/2 left-2.5 size-9 -translate-y-1/2 md:left-3.5 md:size-10 lg:left-4 lg:size-14"
        />
        <Input
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
          className="h-fit px-14 py-2 font-mono text-3xl leading-none font-medium md:px-16 md:text-4xl lg:px-20 lg:text-6xl"
        />
        <CopyColorButton
          value={hex}
          className="absolute top-1/2 right-2.5 size-9 -translate-y-1/2 md:right-3 md:size-10 lg:right-4 lg:size-16"
        />
      </div>
    </div>
  );
});
ColorField.displayName = "ColorField";

export { ColorField };
