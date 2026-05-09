// ========== 图生图 ==========
// Workers AI 的 img2img 需要通过 REST API 调用（支持 form-data 上传图片）
// 需要在 Cloudflare Pages 设置 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get('content-type') || '';

    // 支持 JSON 格式（简单情况）
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { prompt, image_base64 } = body;
      if (!prompt) return jsonResponse({ error: 'prompt is required' }, 400);

      const accountId = env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = env.CLOUDFLARE_API_TOKEN;

      if (!accountId || !apiToken) {
        return jsonResponse({
          error: 'img2img 需要设置 CLOUDFLARE_ACCOUNT_ID 和 CLOUDFLARE_API_TOKEN 环境变量'
        }, 500);
      }

      // 通过 AI Gateway 调用图生图
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (image_base64) {
        const blob = dataURItoBlob(`data:image/png;base64,${image_base64}`);
        formData.append('image', blob, 'image.png');
      }

      const resp = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai_gateway/prompts`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiToken}` },
          body: JSON.stringify({
            model: 'runwayml/stable-diffusion-v1-5-img2img',
            prompt,
            image_base64
          })
        }
      );

      const data = await resp.json();
      return jsonResponse({ result: data });
    }

    return jsonResponse({ error: 'unsupported content type' }, 400);

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function dataURItoBlob(dataURI) {
  const arr = dataURI.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}