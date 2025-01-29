import { memo, useState, useEffect, useCallback } from "react";

import { RgbaColorPicker } from "react-colorful";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RgbaColor } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface ColorPickerProps {
  color: RgbaColor;
  displayColor: string;
  onChange: (color: RgbaColor) => void;
  className?: string;
}

/**
 * A color picker component component wrapped in a Popover.
 *
 * @param   {string}                        foreground      The display color calculated by getDisplayColor, necessary for styling
 *                                                          the Popover's border and text colors.
 * @param   {string}                        displayColor    The RGBA color object representing the background color.
 * @param   {(color: RgbaColor) => void}    onChange        Change handler for the parent's color state.
 *
 * @returns                                                 ColorPicker component.
 *
 * @example
 * ```tsx
 * import { ColorPicker } from "@/components/color-picker";
 *
 * const displayColor = "#ffffff";
 * const foreground = { r: 255, g: 255, b: 255, a: 1 };
 *
 * <ColorPicker
 *   color={foreground}
 *   displayColor={displayColor}
 *   onChange={(value) => handleColorChange("foreground", value)}
 * />
 * ```
 */
const ColorPicker = memo(
  ({ color, displayColor, onChange, className }: ColorPickerProps) => {
    const [internalColor, setInternalColor] = useState<RgbaColor>(color);

    // Sync internal state when the color prop changes
    useEffect(() => {
      setInternalColor(color);
    }, [color]);

    const handleChange = useCallback(
      (newColor: RgbaColor) => {
        setInternalColor(newColor);
        onChange(newColor);
      },
      [onChange],
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="naked"
            className={cn(
              "checkerboard-sm size-6 rounded-sm border-3",
              className,
            )}
            style={{
              borderColor: displayColor,
            }}
            aria-label="Pick a color"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(${internalColor.r}, ${internalColor.g}, ${internalColor.b}, ${internalColor.a})`,
              }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          collisionPadding={16}
          className="w-auto rounded-xl border-3 p-0"
          style={{ borderColor: displayColor }}
        >
          <RgbaColorPicker color={internalColor} onChange={handleChange} />
        </PopoverContent>
      </Popover>
    );
  },
);

ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
