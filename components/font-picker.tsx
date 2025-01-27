import { useState, Dispatch, SetStateAction } from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { useMediaQuery } from "@/app/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RgbaColor, GoogleFont } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { rgbToHex } from "@/lib/utils/color";

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

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [open, setOpen] = useState(false);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="naked"
            role="combobox"
            aria-expanded={open}
            className="h-fit justify-between border-3 bg-transparent px-3 py-2 text-lg font-normal md:text-2xl"
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
            <ChevronsUpDown className="ml-2 !size-6 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-3 p-0 md:w-[368px] lg:w-[624px]"
          style={{
            borderColor: displayColor,
            color: displayColor,
            backgroundColor: rgbToHex(background),
          }}
        >
          <FontList
            setOpen={setOpen}
            setSelectedFont={setSelectedFont}
            handleChange={handleChange}
            displayColor={displayColor}
            fonts={fonts}
            selectedFont={selectedFont}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="naked"
          role="combobox"
          aria-expanded={open}
          className="h-fit justify-between border-3 bg-transparent px-3 py-2 text-lg font-normal md:text-2xl"
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
                    ? fonts.find((font) => font.family === selectedFont)?.family
                    : "select font..."}
                </>
              )}
            </>
          )}
          <ChevronsUpDown className="ml-2 !size-6 shrink-0" />
        </Button>
      </DrawerTrigger>
      <DrawerContent
        style={{
          borderColor: displayColor,
          color: displayColor,
          backgroundColor: rgbToHex(background),
        }}
      >
        <div
          className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-white/50"
          style={{
            backgroundColor: displayColor,
          }}
        />

        <div
          className="mt-4 border-t-2"
          style={{
            borderColor: displayColor,
            color: displayColor,
            backgroundColor: rgbToHex(background),
          }}
        >
          <FontList
            setOpen={setOpen}
            setSelectedFont={setSelectedFont}
            handleChange={handleChange}
            displayColor={displayColor}
            fonts={fonts}
            selectedFont={selectedFont}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

interface FontListProps {
  setOpen: (open: boolean) => void;
  setSelectedFont: Dispatch<SetStateAction<string>>;
  handleChange: Dispatch<SetStateAction<string>>;
  displayColor: string;
  fonts: GoogleFont[];
  selectedFont: string;
}

const FontList = ({
  setOpen,
  setSelectedFont,
  handleChange,
  displayColor,
  fonts,
  selectedFont,
}: FontListProps) => {
  return (
    <Command>
      <CommandInput
        style={{
          color: displayColor,
          borderColor: displayColor,
        }}
        placeholder="search fonts..."
      />
      <CommandList>
        <CommandEmpty
          style={{
            color: displayColor,
          }}
        >
          no font found.
        </CommandEmpty>
        <CommandGroup>
          {fonts?.map((font) => (
            <CommandItem
              key={font.family}
              value={font.family}
              onSelect={(currentValue) => {
                const newFont =
                  currentValue === selectedFont ? "" : currentValue;
                setSelectedFont(newFont); // Update the state
                handleChange(newFont); // Pass the updated (and current!) value to the parent
                setOpen(false);
              }}
              style={{
                color: displayColor,
              }}
            >
              <Check
                className={cn(
                  "mr-2 !size-6",
                  selectedFont === font.family ? "opacity-100" : "opacity-0",
                )}
              />
              {font.family}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

FontPicker.displayName = "FontPicker";

export { FontPicker };
