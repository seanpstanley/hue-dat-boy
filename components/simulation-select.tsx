"use client";

import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { rgbToHex, simulateColorBlindness } from "@/lib/color";
import { ColorBlindnessType, RgbaColor } from "@/lib/types";
import { COLOR_BLINDNESS_TYPES } from "@/lib/url-state";

interface SimulationSelectProps {
  /** `id` for the trigger, so a `<label htmlFor>` can point at it. */
  id: string;
  /** The selected simulation. */
  value: ColorBlindnessType;
  /** Called with the newly selected simulation. */
  onChange: (value: ColorBlindnessType) => void;
  /** The current text color, previewed under each simulation. */
  foreground: RgbaColor;
  /** The current background color, previewed under each simulation. */
  background: RgbaColor;
}

/**
 * A select for the color blindness simulation. Each option shows a pair of swatches: the current text and background
 * colors as they'd look under that simulation.
 *
 * @example
 * ```tsx
 * <label htmlFor="colorblind-select">simulate color blindness</label>
 * <SimulationSelect
 *   id="colorblind-select"
 *   value={simulation}
 *   onChange={setSimulation}
 *   foreground={foreground}
 *   background={background}
 * />
 * ```
 */
function SimulationSelect({
  id,
  value,
  onChange,
  foreground,
  background,
}: SimulationSelectProps) {
  const t = useTranslations("ContrastChecker");
  const labelFor = (simulation: ColorBlindnessType) =>
    simulation === "normal vision"
      ? t("selects.color-blindness.normal-vision")
      : simulation;

  const swatches = (simulation: ColorBlindnessType) => (
    <span aria-hidden className="inline-flex shrink-0 gap-1">
      {[foreground, background].map((color, i) => (
        <span
          key={i}
          className="size-4 rounded-[4px] border-2 border-current md:size-5"
          style={{
            backgroundColor: rgbToHex(
              simulateColorBlindness(color, simulation),
            ),
          }}
        />
      ))}
    </span>
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className="h-fit py-2 font-display-tight text-lg font-bold md:text-2xl"
      >
        <div className="flex min-w-0 items-center gap-3">
          {swatches(value)}
          <span className="truncate">{labelFor(value)}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {COLOR_BLINDNESS_TYPES.map((simulation) => (
          <SelectItem
            key={simulation}
            value={simulation}
            aside={swatches(simulation)}
            className="text-lg md:text-2xl"
          >
            {labelFor(simulation)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { SimulationSelect };
