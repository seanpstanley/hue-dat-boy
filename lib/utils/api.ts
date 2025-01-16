/**
 * Fetches data from the specified URL and parses the response as JSON.
 *
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<any>} A promise that resolves to the parsed JSON response.
 *
 * @example
 * ```typescript
 * const data = await fetcher("https://api.example.com/data");
 * console.log(data);
 * ```
 */
export const fetcher = (url: string) => fetch(url).then((res) => res.json());
