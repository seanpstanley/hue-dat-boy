import { memo, useState, useEffect, useCallback } from "react";
import { RgbaColorPicker } from "react-colorful";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { RgbaColor } from "@/lib/types";

interface ColorPickerProps {
  color: RgbaColor;
  displayColor: string;
  onChange: (color: RgbaColor) => void;
  className?: string;
}

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
