import { useState, useEffect } from "react";
import {
  HexColorPicker,
  RgbaColorPicker,
  RgbColorPicker,
} from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Helper functions
function hexToRgba(hex: string): RgbaColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1,
      }
    : { r: 0, g: 0, b: 0, a: 1 };
}

function rgbaToHex({ r, g, b, a }: RgbaColor): string {
  return `#${[r, g, b]
    .map((x) => Math.round(x).toString(16).padStart(2, "0"))
    .join("")}`;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  useAPCA: boolean;
  className?: string;
}

export const ColorPicker = ({
  color,
  onChange,
  useAPCA,
  className,
}: ColorPickerProps) => {
  const [internalColor, setInternalColor] = useState<RgbaColor>(
    hexToRgba(color)
  );

  useEffect(() => {
    setInternalColor(hexToRgba(color));
  }, [color]);

  const handleChange = (newColor: RgbaColor) => {
    setInternalColor(newColor);
    onChange(rgbaToHex(newColor));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="naked"
          className={cn("size-6 rounded-sm border-2", className)}
          style={{
            backgroundColor: rgbaToHex(internalColor),
          }}
          aria-label="Pick a color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none">
        {useAPCA ? (
          <RgbaColorPicker color={internalColor} onChange={handleChange} />
        ) : (
          // <HexColorPicker color={internalColor} onChange={handleChange} />
          <RgbaColorPicker color={internalColor} onChange={handleChange} />
        )}
      </PopoverContent>
    </Popover>
  );
};
