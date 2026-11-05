import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRouter from './routes/index.js';
import { env } from './config/env.js';
import { defaultLimits } from './config/limits.js';

export function createApp() {
  const app = express();

  // Trust reverse proxy (e.g. Cloudflare, AWS ALB, Nginx, Render) for HTTPS detection
  app.set('trust proxy', 1);

  // Security headers: Apply FIRST so all responses (including 301 redirects, errors, 404s) include them
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    const csp = [
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
    res.setHeader('Content-Security-Policy', csp);
    next();
  });

  // HTTPS Transport Encryption enforcement: redirect insecure HTTP requests in production
  app.use((req, res, next) => {
    const isProd = env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production';
    if (isProd) {
      const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
      if (!isSecure && req.headers.host) {
        return res.redirect(301, `https://${req.headers.host}${req.originalUrl || req.url}`);
      }
    }
    next();
  });

  // CORS configuration
  app.use(
    cors({
      origin: [
        env.CLIENT_URL,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'x-webhook-signature'],
    }),
  );

  // Cookie parser
  app.use(cookieParser());

  // Capture raw body for webhook HMAC signature verification
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
      limit: '20mb',
    }),
  );

  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Centralized Rate Limit Headers - adds rate limit info to all responses
  // Note: Actual rate limiting is handled by dedicated middleware on specific routes
  app.use((req, res, next) => {
    const userId = (req as any).user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress;

    // Set default rate limit headers based on configuration
    res.setHeader('X-RateLimit-Limit', String(defaultLimits.api.authenticatedPerMinute));

    // These will be updated by the enforceLimits middleware when that's used
    if (userId) {
      res.setHeader('X-RateLimit-Remaining', String(defaultLimits.api.authenticatedPerMinute));
    } else {
      res.setHeader('X-RateLimit-Remaining', String(defaultLimits.api.guestPerMinute));
    }

    // Initialize with 1 minute window
    res.setHeader('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + 60));

    next();
  });

  // API router
  app.use('/api', apiRouter);

  // 404 handler for API routes
  app.use('/api', (_req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
    });
  });

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled API Error:', err);

    // Map Multer upload errors and file rejections to 400 Bad Request instead of 500
    if (err.name === 'MulterError' || err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error:
          err.code === 'LIMIT_FILE_SIZE'
            ? 'File size exceeds maximum allowed limit.'
            : err.message || 'File upload error',
      });
      return;
    }

    if (err.message && err.message.toLowerCase().includes('unsupported file format')) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
      return;
    }

    res.status(err.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'An internal error occurred' : err.message,
    });
  });

  return app;
}
