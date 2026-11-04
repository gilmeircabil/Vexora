export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy all /api/* requests directly to your Render backend
    if (url.pathname.startsWith('/api')) {
      const targetUrl = new URL(
        url.pathname + url.search,
        'https://vexora-backend-ilhn.onrender.com',
      );

      // Clone original headers and forward to backend
      const headers = new Headers(request.headers);
      headers.set('Host', 'vexora-backend-ilhn.onrender.com');

      const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

      try {
        const backendRequest = new Request(targetUrl.toString(), {
          method: request.method,
          headers,
          body: hasBody ? request.body : undefined,
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

    // Serve static client assets with SPA fallback
    return env.ASSETS.fetch(request);
  },
};
