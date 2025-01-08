import { memo, useState, useEffect, useCallback } from "react";
import { RgbaColorPicker } from "react-colorful";
// import { ChromePicker } from "react-color";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RgbaColor } from "@/lib/types";

interface ColorPickerProps {
  color: RgbaColor;
  externalColor: string;
  onChange: (color: RgbaColor) => void;
  className?: string;
}

export const ColorPicker = memo(
  ({ color, externalColor, onChange, className }: ColorPickerProps) => {
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
      [onChange]
    );

    // const handleChange = (color: any, event: any) => {
    //   setInternalColor(color.hex);
    //   onChange(color.rgb);
    // };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="naked"
            className={cn(
              "size-6 rounded-sm border-3 checkerboard-sm",
              className
            )}
            style={{
              borderColor: externalColor,
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
          className="w-auto p-0 border-3 rounded-xl"
          style={{ borderColor: externalColor }}
        >
          {/* <ChromePicker
            color={internalColor}
            onChange={handleChange}
            // styles={{ borderRadius: "50px!important" }}
            className="border-radiusImportant"
          /> */}
          <RgbaColorPicker color={internalColor} onChange={handleChange} />
        </PopoverContent>
      </Popover>
    );
  }
);

ColorPicker.displayName = "ColorPicker";

export default ColorPicker;
