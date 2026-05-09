export async function onRequestPost(context) {
const { request, env } = context;
try {
const { prompt, image } = await request.json();
if (!prompt) return jsonResponse({ error: 'prompt is required' }, 400);
if (!image) return jsonResponse({ error: 'image is required' }, 400);

const base64Data = image.replace(/^data:[^;]+;base64,/, '');

// 1. 将前端传来的 Base64 解码并转为模型需要的数字数组
const binaryString = atob(base64Data);
const imgArray = new Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  imgArray[i] = binaryString.charCodeAt(i);
}

// 2. 调用图生图模型
const result = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
  prompt,
  image: imgArray
});

// 3. 稳妥处理模型返回：不论是 Stream 还是 Buffer，利用 Response 原生解析为 ArrayBuffer
const buffer = await new Response(result).arrayBuffer();
const uint8Array = new Uint8Array(buffer);

// 4. 将输出的二进制转回 Base64（采用安全的分块拼接，防止图片过大导致内存栈溢出）
let binary = '';
const chunkSize = 8192;
for (let i = 0; i < uint8Array.length; i += chunkSize) {
  binary += String.fromCharCode.apply(null, uint8Array.subarray(i, i + chunkSize));
}
const base64Image = btoa(binary);

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