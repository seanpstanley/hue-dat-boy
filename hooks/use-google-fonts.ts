import useSWR from "swr";

import { FontListResponse } from "@/lib/types";
import { fetcher } from "@/lib/utils/fetcher";

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

/**
 * Fetches the Google Fonts families from the `/api/fonts` route handler. Fetched once per page load; the list rarely
 * changes, so it's never revalidated.
 *
 * @returns The SWR response. `error` is set when the API key is missing or the upstream request fails.
 *
 * @example
 * ```tsx
 * const { data, error, isLoading } = useGoogleFonts();
 * const families = data?.items.map((font) => font.family) ?? [];
 * ```
 */
export const useGoogleFonts = () =>
  useSWR<FontListResponse>("/api/fonts", fetcher, options);
