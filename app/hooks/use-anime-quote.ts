import useSWR from "swr";
import { fetcher } from "@/lib/utils/api";

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
