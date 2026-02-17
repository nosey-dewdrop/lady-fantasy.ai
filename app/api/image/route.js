// POST /api/image
// Body: { prompt }
// Returns: { url } (image URL) or polls queue

export async function POST(request) {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    return Response.json({ error: "FAL_KEY not configured" }, { status: 500 });
  }

  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return Response.json({ error: "prompt required" }, { status: 400 });
    }

    // Use FLUX schnell for fast card image generation
    const model = "fal-ai/flux/schnell";

    const res = await fetch(`https://queue.fal.run/${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${FAL_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        image_size: "portrait_4_3",
        num_images: 1,
        num_inference_steps: 4,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return Response.json(
        { error: err.detail || `fal.ai error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // FLUX schnell is fast — often returns directly
    if (data.images && data.images.length > 0) {
      return Response.json({ url: data.images[0].url });
    }

    // If queued, poll for result
    const requestId = data.request_id;
    if (!requestId) {
      return Response.json({ error: "No image or request_id" }, { status: 500 });
    }

    // Poll up to 30 seconds
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      const statusRes = await fetch(
        `https://queue.fal.run/${model}/requests/${requestId}/status`,
        { headers: { Authorization: `Key ${FAL_KEY}` } }
      );

      if (statusRes.ok) {
        const s = await statusRes.json();
        if (s.status === "COMPLETED") {
          const resultRes = await fetch(
            `https://queue.fal.run/${model}/requests/${requestId}`,
            { headers: { Authorization: `Key ${FAL_KEY}` } }
          );
          const result = await resultRes.json();
          if (result.images?.[0]?.url) {
            return Response.json({ url: result.images[0].url });
          }
        } else if (s.status === "FAILED") {
          return Response.json({ error: "Image generation failed" }, { status: 500 });
        }
      }
    }

    return Response.json({ error: "Timeout" }, { status: 504 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
