export async function onRequestPost(context) {
const { request, env } = context;
try {
const { prompt } = await request.json();
if (!prompt) return jsonResponse({ error: 'prompt is required' }, 400);

// FLUX.2 强制要求 multipart/form-data 格式，借助 FormData 组装
const formData = new FormData();
formData.append("prompt", prompt);

// 巧妙利用原生的 Request 对象自动生成 Multipart 的数据流和 boundary 头部
const tempReq = new Request('https://dummy', { method: 'POST', body: formData });

// 调用模型并按格式传入 multipart 配置
const result = await env.AI.run('@cf/black-forest-labs/flux-2-klein-9b', {
  multipart: {
    body: tempReq.body,
    contentType: tempReq.headers.get('content-type')
  }
});

// 兼容处理：FLUX.2 可能返回 { image: "base64..." } 对象，也可能是原始 Uint8Array 流
let base64Image = result;
if (result && result.image) {
  base64Image = result.image;
} else if (result instanceof Uint8Array || result instanceof ArrayBuffer) {
  const buffer = new Uint8Array(result);
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  base64Image = btoa(binary);
}

return jsonResponse({ image: base64Image });
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