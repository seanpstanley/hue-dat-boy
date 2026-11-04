import useSWR from "swr";

import { AnimechanQuote } from "@/lib/types";
import { fetcher } from "@/lib/utils/api";

const options = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false, // the API is rate limited, so retrying makes things worse
};

/**
 * Fetches a random anime quote from the `/api/quote` route handler.
 *
 * @example
 * const { data, error, isLoading } = useAnimeQuote();
 */
export const useAnimeQuote = () =>
  useSWR<AnimechanQuote>("/api/quote", fetcher, options);
