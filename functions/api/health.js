/**
 * Cloudflare Pages Function: Health Check
 * GET /api/health
 */

export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasOpenAIKey: !!context.env.OPENAI_API_KEY,
    platform: 'cloudflare-pages'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

