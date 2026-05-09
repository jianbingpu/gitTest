// ========== 文生图 ==========
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { prompt } = body;
    if (!prompt) return jsonResponse({ error: 'prompt is required' }, 400);

    const result = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-inpainting', { prompt });

    return jsonResponse({ image: result });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}