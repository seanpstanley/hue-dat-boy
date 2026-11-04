import { ReactElement } from "react";

import { render, RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { TooltipProvider } from "@/components/ui/tooltip";
import messages from "@/messages/en.json";

/**
 * Renders a component with the providers the app's components expect: English translations and a tooltip provider.
 *
 * @example
 * ```tsx
 * const { getByRole } = renderWithProviders(<ColorField {...props} />);
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <TooltipProvider>{children}</TooltipProvider>
      </NextIntlClientProvider>
    ),
    ...options,
  });
}
