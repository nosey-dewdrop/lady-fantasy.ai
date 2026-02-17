export async function GET(request) {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return Response.json({ error: "FAL_KEY not configured" }, { status: 500 });
  const { searchParams } = new URL(request.url);
  const falUrl = searchParams.get("url");
  if (!falUrl || !falUrl.startsWith("https://queue.fal.run/")) return Response.json({ error: "Valid fal.ai URL required" }, { status: 400 });
  try {
    const res = await fetch(falUrl, { headers: { Authorization: `Key ${FAL_KEY}` } });
    if (!res.ok) return Response.json({ error: `Status check failed: ${res.status}` }, { status: res.status });
    return Response.json(await res.json());
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }); }
}
