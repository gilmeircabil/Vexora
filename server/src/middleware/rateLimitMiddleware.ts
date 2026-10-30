import type { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 60000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();
    let record = store.get(ip);

    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + options.windowMs,
      };
      store.set(ip, record);
      next();
      return;
    }

    record.count += 1;

    if (record.count > options.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.status(429).json({
        success: false,
        error: options.message || 'Too many requests. Please slow down and try again later.',
        retryAfter: retryAfterSec,
      });
      return;
    }

    next();
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 30, // 30 attempts per 15 min
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 AI operations per minute
  message: 'AI generation rate limit exceeded. Please wait a moment before trying again.',
});
