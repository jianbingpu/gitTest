// Workers AI 内置 SD v1.5 模型
// /api/txt2img → 文生图 inpainting（空白底图）
// /api/img2img → 图生图 img2img（用户底图）

// 纯白 512x512 PNG（inpainting 的底图）
const WHITE_IMG_B64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

// ========== 文生图（inpainting + 空白底图） ==========
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { prompt } = body;
    if (!prompt) return jsonResponse({ error: 'prompt is required' }, 400);

    // inpainting 的 image 和 mask 都需要是数组
    const result = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-inpainting', {
      prompt,
      image: [WHITE_IMG_B64],
      mask: [WHITE_IMG_B64]
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
