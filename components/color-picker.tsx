"use client";

import { memo } from "react";

import { RgbaColorPicker } from "react-colorful";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RgbaColor } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { rgbaToHex } from "@/lib/utils/color";

interface ColorPickerProps {
  color: RgbaColor;
  onChange: (color: RgbaColor) => void;
  label: string;
  className?: string;
}

/**
 * A swatch button that opens an RGBA color picker in a popover.
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
    <Popover>
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
      <PopoverContent collisionPadding={16} className="w-auto rounded-xl p-0">
        <RgbaColorPicker color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  ),
);

ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
