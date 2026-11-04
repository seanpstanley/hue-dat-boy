"use client";

import { memo, useState } from "react";

import { Pipette } from "lucide-react";
import { useTranslations } from "next-intl";
import { RgbaColorPicker } from "react-colorful";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addRecentColor, useRecentColors } from "@/lib/recent-colors";
import { RgbaColor } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { parseHex, rgbaToHex } from "@/lib/utils/color";

// The EyeDropper API isn't in TypeScript's DOM lib yet (Chromium only)
declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

interface ColorPickerProps {
  color: RgbaColor;
  onChange: (color: RgbaColor) => void;
  label: string;
  className?: string;
}

/**
 * A swatch button that opens a color picker popover: an RGBA picker, a hex field, an eyedropper (where the browser
 * supports it), and the recently used colors.
 *
 * This is a fully controlled component: the parent should store the exact object passed to `onChange` (not a
 * converted copy), so react-colorful sees its own value come back and doesn't reset its internal HSV state.
 *
 * @example
 * ```tsx
 * <ColorPicker color={foreground} onChange={setForeground} label="Pick text color" />
 * ```
 */
const ColorPicker = memo(
  ({ color, onChange, label, className }: ColorPickerProps) => (
    <Popover
      onOpenChange={(open) => {
        // Remember whatever the color ended up as once the user is done with the picker
        if (!open) addRecentColor(rgbaToHex(color));
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="naked"
          size="auto"
          className={cn(
            "relative overflow-hidden rounded-sm border-3 border-ink checkerboard-sm",
            className,
          )}
          aria-label={label}
        >
          <span
            className="absolute inset-0"
            style={{ backgroundColor: rgbaToHex(color) }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={16}
        className="w-64 overflow-hidden rounded-xl p-0"
      >
        <PickerPanel color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  ),
);
ColorPicker.displayName = "ColorPicker";

function PickerPanel({
  color,
  onChange,
}: {
  color: RgbaColor;
  onChange: (color: RgbaColor) => void;
}) {
  const t = useTranslations("ColorPicker");
  const recent = useRecentColors();
  const [draft, setDraft] = useState<string | null>(null);
  const hex = rgbaToHex(color);
  // Only rendered once the popover opens, so this never runs on the server
  const canUseEyeDropper = "EyeDropper" in window;

  const pickFromScreen = async () => {
    try {
      const { sRGBHex } = await new window.EyeDropper!().open();
      const picked = parseHex(sRGBHex);
      if (picked) {
        onChange(picked);
        addRecentColor(rgbaToHex(picked));
      }
    } catch {
      // The user pressed Escape; nothing to do
    }
  };

  return (
    <div className="color-picker flex flex-col gap-3 pb-3">
      <RgbaColorPicker color={color} onChange={onChange} />

      <div className="flex items-center gap-2 px-3">
        <input
          aria-label={t("hex")}
          value={draft ?? hex}
          onChange={(e) => {
            setDraft(e.target.value);
            const parsed = parseHex(e.target.value);
            if (parsed) onChange(parsed);
          }}
          onBlur={() => setDraft(null)}
          spellCheck={false}
          autoComplete="off"
          maxLength={9}
          className="min-w-0 flex-1 rounded-md border-3 border-ink bg-transparent px-2 py-1 font-mono text-base font-semibold text-ink focus-ring"
        />
        {canUseEyeDropper && (
          <Button
            variant="outline"
            size="auto"
            className="size-10 shrink-0 p-2"
            onClick={pickFromScreen}
            aria-label={t("eyedropper")}
          >
            <Pipette className="size-full!" />
          </Button>
        )}
      </div>

      {recent.length > 0 && (
        <div
          role="group"
          aria-label={t("recent")}
          className="flex flex-wrap gap-1.5 px-3"
        >
          {recent.map((recentHex) => (
            <button
              key={recentHex}
              type="button"
              aria-label={recentHex}
              title={recentHex}
              onClick={() => {
                const parsed = parseHex(recentHex);
                if (parsed) onChange(parsed);
              }}
              className="relative size-6 overflow-hidden rounded-[5px] border-2 border-ink focus-ring checkerboard-sm"
            >
              <span
                className="absolute inset-0"
                style={{ backgroundColor: recentHex }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ColorPicker };
