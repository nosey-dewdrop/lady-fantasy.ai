export async function POST(request) {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) return Response.json({ error: "FAL_KEY not configured" }, { status: 500 });
  try {
    const { prompt, model } = await request.json();
    if (!prompt || !model) return Response.json({ error: "prompt and model required" }, { status: 400 });
    const allowed = ["fal-ai/minimax/video-01","fal-ai/minimax/video-01-live","fal-ai/minimax/hailuo-02/standard/text-to-video"];
    if (!allowed.includes(model)) return Response.json({ error: "Model not allowed" }, { status: 400 });
    const res = await fetch(`https://queue.fal.run/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Key ${FAL_KEY}` },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); return Response.json({ error: e.detail || e.message || `fal error ${res.status}` }, { status: res.status }); }
    const data = await res.json();
    if (data.video?.url) return Response.json({ video: { url: data.video.url } });
    return Response.json({ request_id: data.request_id, status_url: data.status_url, response_url: data.response_url });
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }); }
}
