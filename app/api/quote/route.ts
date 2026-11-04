import { AnimechanQuote } from "@/lib/types";

const BASE_URL = "https://api.animechan.io/v1";

// Always fetch a fresh random quote
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/quotes/random`, {
      cache: "no-store",
    });

    if (!res.ok) {
      // The free tier is rate limited, so this is expected occasionally; the client falls back to a pangram
      return Response.json(
        { error: `Animechan responded with ${res.status}` },
        { status: 502 },
      );
    }

    const { data }: { data: AnimechanQuote } = await res.json();

    return Response.json(data);
  } catch (error: unknown) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
