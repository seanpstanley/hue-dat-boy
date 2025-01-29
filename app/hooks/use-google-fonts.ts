import useSWR from "swr";

import { fetcher } from "@/lib/utils/api";

/**
 * Hook for fetching Google Fonts data from a route handler using SWR.
 *
 * @returns   {Object}    An object containing the fetched data, error, and loading state.
 *
 * @example
 * import { useGoogleFonts } from "@/app/hooks/use-google-fonts";
 *
 * const { data, error, isLoading } = useGoogleFonts();
 * if (isLoading) return <p>Loading...</p>;
 * if (error) return <p>Error loading fonts.</p>;
 * return <FontList fonts={data} />;
 */
export const useGoogleFonts = () => {
  const { data, error, isLoading } = useSWR("/api/fonts", fetcher, {
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
