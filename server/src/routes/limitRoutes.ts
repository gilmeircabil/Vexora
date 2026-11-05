import { Router, Request, Response, NextFunction } from 'express';
import { LimitService } from '../services/limitService.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Types } from 'mongoose';

const router = Router();

/**
 * GET /api/limits/status
 * Get current user's limit status
 */
router.get('/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    const categories = ['api', 'ai', 'learning', 'studio', 'auth'] as const;
    const status = {} as Record<string, any>;

    for (const category of categories) {
      const usage = await LimitService.getUserLimitStatus(userId, category);
      status[category] = usage;
    }

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to get limit status',
    });
  }
});

/**
 * GET /api/limits/storage
 * Get storage usage details
 */
router.get('/storage', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    const quotaResult = await LimitService.checkStorageQuota(userId);

    res.status(200).json({
      success: true,
      data: {
        usedBytes: quotaResult.currentUsage,
        quotaBytes: quotaResult.quota,
        remainingBytes: quotaResult.remainingBytes,
        percentageUsed: (quotaResult.currentUsage / quotaResult.quota) * 100,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to get storage status',
    });
  }
});

/**
 * GET /api/limits/usage
 * Get platform-wide usage statistics (admin only)
 */
router.get('/usage', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const stats = await LimitService.getUsageStatistics(hours);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to get usage statistics',
    });
  }
});

/**
 * GET /api/limits/storage/breakdown
 * Get storage usage breakdown by feature (admin only)
 */
router.get('/storage/breakdown', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Import models lazily to avoid circular dependencies
    const { DesignAsset } = await import('../models/DesignAsset.js');
    const { LearningPost } = await import('../models/LearningPost.js');

    // Get storage breakdown by asset type
    const [designAssets, learningPosts, avatarUploads] = await Promise.all([
      DesignAsset.aggregate([
        {
          $group: {
            _id: null,
            total: {$sum: '$size'},
          },
        },
      ]).then(r => r[0]?.total || 0),
      LearningPost.aggregate([
        {
          $group: {
            _id: null,
            total: {$sum: '$size'},
          },
        },
      ]).then(r => r[0]?.total || 0),
      0, // Avatar uploads are stored separately, not tracked in DB
    ]);

    const breakdown = {
      designAssets: {
        size: designAssets,
        percentageOfTotal: 0,
      },
      learningPosts: {
        size: learningPosts,
        percentageOfTotal: 0,
      },
      avatarUploads: {
        size: avatarUploads,
        percentageOfTotal: 0,
      },
    };

    const total = breakdown.designAssets.size + breakdown.learningPosts.size + breakdown.avatarUploads.size;

    if (total > 0) {
      breakdown.designAssets.percentageOfTotal = (designAssets / total) * 100;
      breakdown.learningPosts.percentageOfTotal = (learningPosts / total) * 100;
    }

    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to get storage breakdown',
    });
  }
});

/**
 * GET /api/limits/violation-log
 * Get recent rate limit violations (admin only)
 */
router.get('/violation-log', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Placeholder for getting violations - would need a separate method in LimitService
    const violations: Record<string, unknown>[] = [];

    res.status(200).json({
      success: true,
      data: violations,
      pagination: {
        page,
        limit,
        hasNext: violations.length === limit,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to get violation log',
    });
  }
});

export default router;