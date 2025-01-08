import { useState, Dispatch, SetStateAction } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { RgbaColor, GoogleFont } from "@/lib/types";
import { rgbToHex, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FontPickerProps {
  displayColor: string;
  background: RgbaColor;
  defaultFont: string;
  fonts: GoogleFont[];
  isLoading: boolean;
  error: any;
  onChange: Dispatch<SetStateAction<string>>;
}

const FontPicker = ({
  displayColor,
  background,
  defaultFont,
  fonts,
  isLoading,
  error,
  onChange: handleChange,
}: FontPickerProps) => {
  const [selectedFont, setSelectedFont] = useState<string>(defaultFont);

  const [open, setOpen] = useState(false);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="naked"
            role="combobox"
            aria-expanded={open}
            className="px-3 bg-transparent font-normal border-3 h-fit py-2 text-lg md:text-2xl justify-between"
            style={{
              borderColor: displayColor,
              color: displayColor,
            }}
            disabled={error}
          >
            {error ? (
              "font picker unavailable"
            ) : (
              <>
                {isLoading ? (
                  "loading..."
                ) : (
                  <>
                    {selectedFont
                      ? fonts.find((font) => font.family === selectedFont)
                          ?.family
                      : "select font..."}
                  </>
                )}
              </>
            )}
            <ChevronsUpDown className="ml-2 !size-6 shrink-0 " />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-3 p-0 w-full"
          style={{
            borderColor: displayColor,
            color: displayColor,
            backgroundColor: rgbToHex(background),
          }}
        >
          <Command className="bg-transparent ">
            <CommandInput
              className="text-lg md:text-xl placeholder:text-white/60 py-2"
              style={{
                color: displayColor,
                borderColor: displayColor,
              }}
              placeholder="search fonts..."
            />
            <CommandList className="p-1">
              <CommandEmpty
                style={{
                  color: displayColor,
                }}
                className="text-lg md:text-2xl p-3"
              >
                no font found.
              </CommandEmpty>
              <CommandGroup>
                {fonts?.map((font) => (
                  <CommandItem
                    key={font.family}
                    value={font.family}
                    onSelect={(currentValue) => {
                      setSelectedFont(
                        currentValue === selectedFont ? "" : currentValue
                      );
                      handleChange(selectedFont);
                      setOpen(false);
                    }}
                    style={{
                      color: displayColor,
                    }}
                    className="text-lg md:text-2xl"
                  >
                    <Check
                      className={cn(
                        "mr-2 !size-6",
                        selectedFont === font.family
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {font.family}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="p-4 border rounded-md" style={{ fontFamily: selectedFont }}>
        The quick brown fox jumps over the lazy dog.
      </p>

      {/* Dynamically load the selected font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=${selectedFont.replace(
          / /g,
          "+"
        )}&display=swap");
      `}</style>
    </>
  );
};

export default FontPicker;
