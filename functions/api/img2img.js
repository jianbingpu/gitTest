// ========== 图生图（img2img） ==========
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { prompt, image } = body;
    if (!prompt) return jsonResponse({ error: 'prompt is required' }, 400);
    if (!image) return jsonResponse({ error: 'image is required for img2img' }, 400);

    // 去掉 data:image/xxx;base64, 前缀，只留纯 base64
    const cleanImage = image.replace(/^data:[^;]+;base64,/, '');

    const result = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
      prompt,
      image: [cleanImage]
    });

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