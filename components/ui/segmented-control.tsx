"use client";

import { KeyboardEvent, useRef } from "react";

import { cn } from "@/lib/utils/cn";

interface SegmentedControlProps<T extends string> {
  /** The selected option's value. */
  value: T;
  /** Called with the newly selected value (on click, or as arrow keys move the selection). */
  onChange: (value: T) => void;
  /** The options, in display order. */
  options: {
    /** The value passed to `onChange`. */
    value: T;
    /** The visible text. */
    label: string;
  }[];
  /** Accessible name for the group. */
  label: string;
  /** Classes for the group container. */
  className?: string;
}

/**
 * A two-or-more option picker drawn as connected segments, with the active one filled in ink.
 *
 * Semantically it's a radio group: arrow keys move (and select), and only the selected option is in the tab order.
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   label="contrast standard"
 *   value={standard}
 *   onChange={setStandard}
 *   options={[
 *     { value: "wcag", label: "WCAG 2.2" },
 *     { value: "apca", label: "APCA" },
 *   ]}
 * />
 * ```
 */
function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) return;

    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-grid auto-cols-fr grid-flow-col gap-1 rounded-lg border-3 border-ink p-1",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "rounded-md px-4 py-2 font-display-tight text-base font-bold whitespace-nowrap focus-ring transition-colors md:text-lg",
              selected ? "bg-ink text-on-ink" : "text-ink hover:bg-ink/15",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl };
