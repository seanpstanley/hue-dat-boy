import { memo, useState, useEffect, useCallback } from "react";
import { RgbaColorPicker } from "react-colorful";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, rgbaToHex } from "@/lib/utils";
import { RgbaColor } from "@/lib/types";

interface ColorPickerProps {
  color: RgbaColor; // Use RGBA object directly
  externalColor: string;
  onChange: (color: RgbaColor) => void; // Pass back RGBA object
  className?: string;
}

export const ColorPicker = memo(
  ({ color, externalColor, onChange, className }: ColorPickerProps) => {
    const [internalColor, setInternalColor] = useState<RgbaColor>(color);

    // Sync internal state when the color prop changes
    useEffect(() => {
      console.log(`set internal color ${rgbaToHex(color)}`);
      setInternalColor(color);
    }, [color]);

    // Handle changes from the color picker
    const handleChange = useCallback(
      (newColor: RgbaColor) => {
        setInternalColor(newColor);
        onChange(newColor); // Pass back the RGBA object directly
      },
      [onChange]
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="naked"
            className={cn("size-6 rounded-sm border-3", className)}
            style={{
              backgroundColor: `rgba(${internalColor.r}, ${internalColor.g}, ${internalColor.b}, ${internalColor.a})`,
              borderColor: externalColor,
            }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent
          collisionPadding={16}
          className="w-auto p-0 border-none"
        >
          <RgbaColorPicker color={internalColor} onChange={handleChange} />
        </PopoverContent>
      </Popover>
    );
  }
);

ColorPicker.displayName = "ColorPicker";

export default ColorPicker;
