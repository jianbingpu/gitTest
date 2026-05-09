export async function onRequestPost(context) {
const { request, env } = context;
try {
const { prompt } = await request.json();
if (!prompt) return jsonResponse({ error: 'prompt is required' }, 400);

const result = await env.AI.run('@cf/black-forest-labs/flux-2-klein-9b', { prompt });
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