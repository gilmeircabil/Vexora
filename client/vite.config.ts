import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://challenges.cloudflare.com https://accounts.google.com https://apis.google.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://* http://*",
  "media-src 'self' data: blob:",
  "connect-src 'self' blob: data: ws: wss: https://challenges.cloudflare.com https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://staticimgly.com https://cdn.jsdelivr.net https://unpkg.com https://huggingface.co https://*.r2.cloudflarestorage.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "frame-src 'self' blob: https://challenges.cloudflare.com https://accounts.google.com https://www.facebook.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, '..'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    headers: {
      'Content-Security-Policy': CSP_HEADER,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    headers: {
      'Content-Security-Policy': CSP_HEADER,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
