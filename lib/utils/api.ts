/**
 * Fetches JSON from the specified URL for SWR, throwing on non-2xx responses so SWR reports them as errors.
 *
 * @example
 * ```typescript
 * const data = await fetcher("/api/fonts");
 * ```
 */
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request to ${url} failed with ${res.status}`);
  return res.json();
};
