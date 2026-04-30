// 处理 POST 请求的函数
export async function onRequestPost(context) {
  // context.request 包含请求信息
  // context.env 包含环境变量和绑定的能力（如 AI）
  
  try {
    const body = await context.request.json();
    
    // 调用绑定的 AI 模型
    const aiResponse = await context.env.AI.run('openai/gpt-5.5-pro', {
      prompt: body.prompt
    });

    return new Response(JSON.stringify(aiResponse), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response("Error processing request", { status: 500 });
  }
}