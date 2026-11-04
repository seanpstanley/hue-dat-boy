import useSWR from "swr";

import { GoogleFontFamily } from "@/lib/types";
import { fetcher } from "@/lib/utils/api";

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

/**
 * Fetches the list of Google Fonts families from the `/api/fonts` route handler.
 *
 * @example
 * const { data, error, isLoading } = useGoogleFonts();
 * data?.items.map((font) => font.family);
 */
export const useGoogleFonts = () =>
  useSWR<{ items: GoogleFontFamily[] }>("/api/fonts", fetcher, options);
