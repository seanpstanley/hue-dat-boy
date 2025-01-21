import useSWR from "swr";
import { fetcher } from "@/lib/utils/api";

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
