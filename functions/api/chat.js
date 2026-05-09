// 处理 POST 请求的函数
// 注意：通过 AI Gateway REST API 调用第三方模型（需要 CLOUDFLARE_API_TOKEN 环境变量）
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const userPrompt = body.prompt || body.message || '';

    if (!userPrompt) {
      return jsonResponse({ error: 'prompt is required' }, 400);
    }

    // 通过 Cloudflare AI Gateway REST API 调用（需要 CF_API_TOKEN）
    const accountId = env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return jsonResponse({ error: 'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN env' }, 500);
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai_gateway/prompts`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-opus-4.7',
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await resp.json();
    const text = data?.result?.response || data?.response || JSON.stringify(data);

    return jsonResponse({ response: text });

  } catch (err) {
    return jsonResponse({ error: err.message || String(err) }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
