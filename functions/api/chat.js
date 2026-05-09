// 处理 POST 请求的函数
export async function onRequestPost(context) {
  // context.request 包含请求信息
  // context.env 包含环境变量和绑定的能力（如 AI）

  try {
    const body = await context.request.json();

    // 调用 Cloudflare AI Gateway 的 Anthropic Claude Opus 4.7 模型
    const aiResponse = await context.env.AI.run('@cf/anthropic/claude-opus-4.7', {
      messages: [
        { role: 'user', content: body.prompt }
      ]
    });

    return new Response(JSON.stringify({ response: aiResponse.messages?.[0]?.content || aiResponse.response || JSON.stringify(aiResponse) }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response("Error processing request: " + err.message, { status: 500 });
  }
}