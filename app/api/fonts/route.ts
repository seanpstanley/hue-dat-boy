import { FontListResponse, GoogleFont } from "@/lib/types";

const GOOGLE_FONTS_API = "https://www.googleapis.com/webfonts/v1/webfonts";

const ONE_DAY = 60 * 60 * 24;

// Rendered per request (so a build without the API key never bakes in an error response), but the font list rarely
// changes, so the upstream fetch and the response are both cached for a day.
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GOOGLE_FONTS_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "GOOGLE_FONTS_API_KEY is not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `${GOOGLE_FONTS_API}?key=${apiKey}&subset=latin&capability=WOFF2&sort=popularity`,
      { next: { revalidate: ONE_DAY } },
    );

    if (!res.ok) {
      return Response.json(
        { error: `Google Fonts API responded with ${res.status}` },
        { status: 502 },
      );
    }

    const data: { items?: GoogleFont[] } = await res.json();

    // The full response includes every file URL for every font (well over 1MB); the picker only needs names
    const items: FontListResponse["items"] = (data.items ?? []).map(
      ({ family, category }) => ({ family, category }),
    );

    return Response.json(
      { items },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${ONE_DAY}, stale-while-revalidate=${ONE_DAY}`,
        },
      },
    );
  } catch (error: unknown) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
