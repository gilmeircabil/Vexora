/**
 * Cloudflare Pages Functions - API Reverse Proxy
 * Catches all requests to /api/* and proxies them to the Render backend.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Read backend URL from Cloudflare Pages Environment Variable or fallback
  const backendBase = (
    context.env?.BACKEND_URL || 'https://vexora-backend-ilhn.onrender.com'
  ).replace(/\/+$/, '');

  const targetUrl = new URL(url.pathname + url.search, backendBase);

  // Clone headers and overwrite host to match Render backend
  const headers = new Headers(context.request.headers);
  const targetHost = new URL(backendBase).host;
  headers.set('Host', targetHost);

  const hasBody = context.request.method !== 'GET' && context.request.method !== 'HEAD';

  try {
    const backendRequest = new Request(targetUrl.toString(), {
      method: context.request.method,
      headers,
      body: hasBody ? context.request.body : undefined,
      redirect: 'follow',
      duplex: 'half',
    });

    return await fetch(backendRequest);
  } catch (proxyErr) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Backend proxy error: ' + (proxyErr?.message || 'Failed to reach origin server'),
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
