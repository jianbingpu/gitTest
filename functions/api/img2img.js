export async function onRequestPost(context) {
const { request, env } = context;
try {
const { prompt, image } = await request.json();
if (!prompt) return jsonResponse({ error: 'prompt is required' }, 400);
if (!image) return jsonResponse({ error: 'image is required' }, 400);

const base64Data = image.replace(/^data:[^;]+;base64,/, '');

// 将 Base64 解码并转换为 u8 字节数组
const binaryString = atob(base64Data);
const imgArray = new Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  imgArray[i] = binaryString.charCodeAt(i);
}

const result = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
  prompt,
  image: imgArray
});

// 处理返回结果格式，与文生图兼容
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