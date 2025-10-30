/**
 * Cloudflare Pages Functions Middleware
 * Handles common concerns for all API routes
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Add CORS headers to all responses
  const response = await context.next();
  
  // Clone response to modify headers
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return newResponse;
}

