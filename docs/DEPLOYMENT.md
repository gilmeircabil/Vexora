# Deployment Guide

ToolNest is a client-side Single Page Application (SPA). It can be deployed to any static web host, CDN, or object storage service with zero backend dependencies.

## Production Build

Build the static output into the `dist/` directory:

```bash
npm run build
```

The resulting `dist/` directory contains:

- `index.html`
- Code-split JavaScript bundles (`dist/assets/*.js`)
- CSS stylesheets (`dist/assets/*.css`)
- Web Worker modules (`pdf.worker.min.mjs`)

## Recommended Hosting Platforms

### 1. Cloudflare Pages

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/`

### 2. Vercel

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3. Netlify

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Create a `public/_redirects` file with: `/* /index.html 200` to support direct deep linking.

### 4. GitHub Pages

- Use GitHub Actions with the official `actions/upload-pages-artifact` pointing to `dist`.
- Configure SPA fallback (e.g. `404.html` copying `index.html`).

## Security Headers

When serving the `dist/` folder via Nginx, Apache, or edge functions, ensure the following HTTP headers are configured:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob: data:; worker-src 'self' blob:; object-src 'none'; frame-src 'self' blob:;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```
