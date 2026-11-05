import {Request, Response, NextFunction} from 'express';
import type {AuthenticatedRequest} from './authMiddleware.js';
import {LimitService, LimitResult, StorageQuotaResult} from '../services/limitService.js';

export interface LimitOptions {
  category: string;
  action: string;
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: Request) => string;
  onLimitExceeded?: (req: Request, res: Response, next: NextFunction) => void;
  trackAfterRequest?: boolean;
}

/**
 * Middleware to enforce rate limits on API endpoints
 */
export function enforceLimits(options: LimitOptions) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const windowMs = options.windowMs || 60000;

      // Check the limit
      const result: LimitResult = await LimitService.checkLimit(
        userId,
        ipAddress,
        options.category as any,
        options.action as any,
        windowMs
      );

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000).toString());

      if (!result.allowed) {
        // Store reset time for error response
        (res as any).rateLimitReset = result.resetAt;
        (res as any).rateLimitRemaining = result.remaining;

        if (options.onLimitExceeded) {
          return options.onLimitExceeded(req, res, next);
        }

        return res.status(429).json({
          success: false,
          error: `Rate limit exceeded. Try again in ${Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)} seconds.`,
          rateLimit: {
            limit: result.limit,
            remaining: result.remaining,
            resetAt: result.resetAt,
          },
        });
      }

      // Track usage after request (if configured)
      if (options.trackAfterRequest) {
        res.on('finish', async () => {
          try {
            const additionalMetadata: Record<string, any> = {};
            if (res.statusCode >= 200 && res.statusCode < 400) {
              additionalMetadata.statusCode = res.statusCode;
              additionalMetadata.responseSize = parseInt(res.getHeader('Content-Length')?.toString() || '0');
            }
            await LimitService.incrementUsage(userId, ipAddress, options.category as any, options.action as any, windowMs, additionalMetadata);
          } catch (err) {
            console.error('Error tracking usage:', err);
          }
        });
      }

      next();
    } catch (err) {
      console.error('Error in enforceLimits middleware:', err);
      next();
    }
  };
}

/**
 * Check storage quota before allowing an upload
 */
export function checkStorageQuota(maxBytes: number = 0) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required for file uploads.',
        });
      }

      // Check if file was uploaded (multer gives us access to the file)
      const fileSize = req.file?.size || req.body?.size || maxBytes;

      const result: StorageQuotaResult = await LimitService.checkStorageQuota(userId, fileSize);

      if (!result.withinQuota) {
        return res.status(413).json({
          success: false,
          error: `Storage quota exceeded. Current usage: ${(result.currentUsage / 1024 / 1024).toFixed(1)} MB / ${(result.quota / 1024 / 1024).toFixed(1)} MB. Delete some files to free up space.`,
          storage: {
            used: result.currentUsage,
            quota: result.quota,
            remaining: result.remainingBytes,
          },
        });
      }

      // Update user's storage counter on successful upload (done in controller)
      (req as any).storageQuota = result;
      next();
    } catch (err) {
      console.error('Error checking storage quota:', err);
      next();
    }
  };
}

/**
 * Middleware to handle concurrent job limits
 */
export function limitConcurrentJobs(maxConcurrent: number = 1) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required.',
        });
      }

      // Check for active jobs
      const {AIJob} = await import('../models/AIJob.js');

      const activeJobCount = await AIJob.countDocuments({
        userId,
        status: {$in: ['queued', 'processing']},
      });

      if (activeJobCount >= maxConcurrent) {
        return res.status(429).json({
          success: false,
          error: `You have reached the maximum number of ${maxConcurrent} concurrent job(s). Please wait for your current job to complete before submitting another.`,
        });
      }

      next();
    } catch (err) {
      console.error('Error checking concurrent jobs:', err);
      next();
    }
  };
}

/**
 * Cleanup old usage records periodically
 */
export async function cleanupUsageRecords(): Promise<void> {
  try {
    const deleted = await LimitService.cleanupExpiredRecords();
    if (deleted > 0) {
      console.log(`Cleaned up ${deleted} expired usage records`);
    }
  } catch (err) {
    console.error('Error cleaning up usage records:', err);
  }
}