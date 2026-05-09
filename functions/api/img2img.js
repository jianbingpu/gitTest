export async function onRequestPost(context) {
const { request, env } = context;
try {
const { prompt, image } = await request.json();
if (!prompt) return jsonResponse({ error: 'prompt is required' }, 400);
if (!image) return jsonResponse({ error: 'image is required' }, 400);

const cleanImage = image.replace(/^data:[^;]+;base64,/, '');
const result = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
  prompt,
  image: [cleanImage]
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