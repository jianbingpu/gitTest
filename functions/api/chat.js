// 处理 POST 请求的函数
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const userPrompt = body.prompt || body.message || '';

    if (!userPrompt) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 调用 Cloudflare AI Gateway 的 Anthropic Claude Opus 4.7
    const aiResponse = await env.AI.run('@cf/anthropic/claude-opus-4.7', {
      messages: [{ role: 'user', content: userPrompt }]
    });

    // 兼容多种返回结构
    let text = '';
    if (typeof aiResponse === 'string') {
      text = aiResponse;
    } else if (aiResponse.response) {
      text = aiResponse.response;
    } else if (aiResponse.messages?.length) {
      text = aiResponse.messages[0]?.content || '';
    } else if (aiResponse.choices?.length) {
      text = aiResponse.choices[0]?.message?.content || '';
    } else if (aiResponse.output?.text) {
      text = aiResponse.output.text;
    } else if (aiResponse.result?.text) {
      text = aiResponse.result.text;
    } else {
      // 兜底：尝试序列化整个响应看有什么字段
      text = JSON.stringify(aiResponse);
    }

    return new Response(JSON.stringify({ response: text }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
