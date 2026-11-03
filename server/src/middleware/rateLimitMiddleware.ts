import type { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const activeStores: Map<string, RateLimitRecord>[] = [];

export function resetAllRateLimiters(): void {
  for (const store of activeStores) {
    store.clear();
  }
}

export function extractClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const store = new Map<string, RateLimitRecord>();
  activeStores.push(store);

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
    const key = options.keyGenerator ? options.keyGenerator(req) : extractClientIp(req);

    const now = Date.now();
    let record = store.get(key);

    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + options.windowMs,
      };
      store.set(key, record);
      next();
      return;
    }

    record.count += 1;

    if (record.count > options.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.status(429).json({
        success: false,
        code: 'RATE_LIMITED',
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
  maxRequests: 30,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

export const registrationRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 6,
  message: 'Too many registration attempts from this IP address. Please try again later.',
});

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many login attempts. Please wait before trying again.',
});

export const resendVerificationRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 3,
  keyGenerator: (req) => {
    const ip = extractClientIp(req);
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    return email ? `${ip}:${email}` : ip;
  },
  message:
    'Too many verification email resend requests. Please wait 15 minutes before trying again.',
});

export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyGenerator: (req) => {
    const ip = extractClientIp(req);
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    return email ? `${ip}:${email}` : ip;
  },
  message: 'Too many password reset requests. Please wait 15 minutes before trying again.',
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'AI generation rate limit exceeded. Please wait a moment before trying again.',
});
