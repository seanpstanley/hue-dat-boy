import useSWR from "swr";

import { AnimechanQuote } from "@/lib/types";
import { fetcher } from "@/lib/utils/fetcher";

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false, // the API is rate limited, so retrying makes things worse
};

/**
 * Fetches a random anime quote from the `/api/quote` route handler, once per page load. Errors aren't retried, since
 * the upstream API is rate limited.
 *
 * @returns The SWR response. `data` stays `undefined` if the request fails, so callers should have a fallback.
 *
 * @example
 * ```tsx
 * const { data: quote, isLoading } = useAnimeQuote();
 * ```
 */
export const useAnimeQuote = () =>
  useSWR<AnimechanQuote>("/api/quote", fetcher, options);
