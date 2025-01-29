const GOOGLE_FONTS_API = "https://www.googleapis.com/webfonts/v1/webfonts";

export async function GET() {
  const apiKey = process.env.GOOGLE_FONTS_API_KEY;

  try {
    const res = await fetch(
      `${GOOGLE_FONTS_API}?key=${apiKey}&subset=latin&capability=WOFF2&sort=popularity`,
    );

    const data = await res.json();

    return Response.json(data);
  } catch (error: unknown) {
    // console.log(error);
    return Response.json(`Error: ${error}`, {
      status: 500,
    });
    //   return Response.json(
    //     { message: error.message },
    //     { status: 500 },
    // );
  }
}
