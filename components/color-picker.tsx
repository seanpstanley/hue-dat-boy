import { memo, useState, useEffect, useCallback } from "react";
import { RgbaColorPicker } from "react-colorful";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, hexToRgba, rgbaToHex } from "@/lib/utils";
import { RgbaColor } from "@/lib/types";

interface ColorPickerProps {
  color: string;
  externalColor: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker = memo(
  ({ color, externalColor, onChange, className }: ColorPickerProps) => {
    const [internalColor, setInternalColor] = useState<RgbaColor>(
      hexToRgba(color)
    );

    useEffect(() => {
      setInternalColor(hexToRgba(color));
    }, [color]);

    const handleChange = useCallback(
      (newColor: RgbaColor) => {
        setInternalColor(newColor);
        onChange(rgbaToHex(newColor));
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
              backgroundColor: rgbaToHex(internalColor),
              borderColor: externalColor,
            }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none">
          <RgbaColorPicker color={internalColor} onChange={handleChange} />
        </PopoverContent>
      </Popover>
    );
  }
);
