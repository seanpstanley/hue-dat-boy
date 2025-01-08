const BASE_URL = "https://animechan.io/api/v1";

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/quotes/random`, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });

    const data = await res.json();

    return Response.json(data);
  } catch (error: unknown) {
    console.log(error);

    // return Response.json(`Error: ${error.message}`, {
    //   status: 500,
    // })
    //   return Response.json(
    //     { message: error.message },
    //     { status: 500 },
    // );
  }
}
