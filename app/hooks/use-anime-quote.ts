import useSWR from "swr";

import { fetcher } from "@/lib/utils/api";

/**
 * Hook for fetching a random anime quote from a route handler using SWR.
 *
 * @returns   {Object}    An object containing the fetched data, error, and loading state.
 *
 * @example
 * import { useAnimeQuote } from "@/app/hooks/use-anime-quote";
 *
 * const { data, error, isLoading } = useAnimeQuote();
 * if (isLoading) return <p>Loading...</p>;
 * if (error) return <p>Error loading fonts.</p>;
 * return <FontList fonts={data} />;
 */
export const useAnimeQuote = () => {
  const { data, error, isLoading } = useSWR("/api/quote", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    data,
    error,
    isLoading,
  };
};
