import { useState, useEffect } from "react";

/**
 * React hook to determine if a given media query matches a threshold.
 *
 * @param     {string}    query   The media query string to evaluate.
 * @returns   {boolean}           A boolean indicating whether the media query matches.
 *
 * @example
 * import { useMediaQuery } from "@/app/hooks/use-media-query";
 *
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * console.log(isMobile); // true or false based on viewport width
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
