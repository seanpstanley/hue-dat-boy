"use client";

import { memo, useState } from "react";

import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

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
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGoogleFonts } from "@/hooks/use-google-fonts";
import { useMediaQuery } from "@/hooks/use-media-query";
import { GoogleFontFamily } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface FontPickerProps {
  /** `id` of the element labelling the picker. */
  labelledBy: string;
  /** The selected font family, or `""` for none. */
  value: string;
  /** Called with the chosen family, or `""` when the selected font is chosen again (to clear it). */
  onChange: (font: string) => void;
}

/**
 * A searchable Google Fonts picker. Uses a Popover on larger screens and a Drawer on mobile.
 *
 * @example
 * ```tsx
 * const [font, setFont] = useState("");
 *
 * <FontPicker labelledBy="typeface-label" value={font} onChange={setFont} />
 * ```
 */
const FontPicker = memo(({ labelledBy, value, onChange }: FontPickerProps) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data, error, isLoading } = useGoogleFonts();
  const t = useTranslations("FontPicker");

  const handleSelect = (font: string) => {
    onChange(font === value ? "" : font);
    setOpen(false);
  };

  const trigger = (
    <Button
      variant="naked"
      role="combobox"
      aria-labelledby={labelledBy}
      aria-expanded={open}
      className="h-fit justify-between rounded-md border-3 border-ink bg-transparent px-3 py-2 font-display-tight text-lg font-bold text-ink md:text-2xl"
      disabled={!!error}
    >
      <span className="truncate">
        {error
          ? t("error")
          : isLoading
            ? t("loading")
            : value || t("placeholder")}
      </span>
      <ChevronsUpDown className="ml-2 size-6! shrink-0" />
    </Button>
  );

  const list = (
    <FontList
      fonts={data?.items ?? []}
      selectedFont={value}
      onSelect={handleSelect}
      placeholder={t("search")}
      emptyText={t("empty")}
    />
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          sideOffset={-3}
          className="w-(--radix-popover-trigger-width) p-0 data-[side=bottom]:rounded-t-none data-[side=top]:rounded-b-none"
        >
          {list}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">{t("search")}</DrawerTitle>
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-ink opacity-80" />
        <div className="mt-4 border-t-3 border-ink">{list}</div>
      </DrawerContent>
    </Drawer>
  );
});
FontPicker.displayName = "FontPicker";

interface FontListProps {
  /** Every font to list. */
  fonts: GoogleFontFamily[];
  /** The selected family, which gets a check mark. */
  selectedFont: string;
  /** Called with the family of the clicked font. */
  onSelect: (font: string) => void;
  /** Placeholder for the search input. */
  placeholder: string;
  /** Shown when the search matches nothing. */
  emptyText: string;
}

/** The searchable list shared by the desktop popover and the mobile drawer. */

const FontList = ({
  fonts,
  selectedFont,
  onSelect,
  placeholder,
  emptyText,
}: FontListProps) => (
  <Command>
    <CommandInput placeholder={`${placeholder}...`} />
    <CommandList>
      <CommandEmpty>{emptyText}</CommandEmpty>
      <CommandGroup>
        {fonts.map((font) => (
          <CommandItem
            key={font.family}
            value={font.family}
            onSelect={() => onSelect(font.family)}
          >
            <Check
              className={cn(
                "mr-2 size-6!",
                selectedFont === font.family ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="flex-1 truncate">{font.family}</span>
            <span className="font-mono text-xs font-semibold tracking-wider uppercase opacity-75">
              {font.category.replace("-", " ")}
            </span>
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  </Command>
);

export { FontPicker };
