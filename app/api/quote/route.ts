export async function GET() {
  const BASE_URL = "https://animechan.io/api/v1";

  const res = await fetch(`${BASE_URL}/quotes/random`, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
  const data = await res.json();
  console.log(data);

  return Response.json({ data });
}
