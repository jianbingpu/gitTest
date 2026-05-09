// 处理 POST 请求的函数
// Workers AI 内置模型，无需额外 token
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const userPrompt = body.prompt || body.message || '';

    if (!userPrompt) {
      return jsonResponse({ error: 'prompt is required' }, 400);
    }

    // 使用 Workers AI 内置的 Llama 4 Scout 模型
    const aiResponse = await env.AI.run('@cf/meta/llama-4-scout-17b-16e-instruct', {
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
      text = JSON.stringify(aiResponse);
    }

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
