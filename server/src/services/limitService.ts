import {Types} from 'mongoose';
import {UsageLimit, IUsageLimit, LimitCategory, LimitAction} from '../models/UsageLimit.js';
import {limits, defaultLimits} from '../config/limits.js';

export interface LimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
  current: number;
}

export interface StorageQuotaResult {
  withinQuota: boolean;
  remainingBytes: number;
  currentUsage: number;
  quota: number;
}

export class LimitService {
  /**
   * Helper to normalize userId to Types.ObjectId or null
   */
  private static normalizeUserId(userId?: Types.ObjectId | string): Types.ObjectId | null {
    if (!userId) return null;
    try {
      return typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    } catch {
      return null;
    }
  }

  /**
   * Get the current usage count for a specific limit
   */
  static async getCurrentCount(
    userId?: Types.ObjectId | string,
    ipAddress?: string,
    category?: LimitCategory,
    action?: LimitAction,
    windowMs?: number,
  ): Promise<{count: number; limit: number; resetAt: Date}> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (windowMs || 60000));

    const query: any = {
      category,
      action,
      windowStart: {$gte: windowStart},
    };

    const normalizedUserId = this.normalizeUserId(userId);
    if (normalizedUserId) {
      query.userId = normalizedUserId;
    } else if (ipAddress) {
      query.ipAddress = ipAddress;
    }

    const record = await UsageLimit.findOne(query).sort({windowStart: -1}).lean();

    if (record) {
      return {
        count: record.count,
        limit: record.limit,
        resetAt: record.resetAt,
      };
    }

    // Return default values if no record exists
    return {
      count: 0,
      limit: normalizedUserId ? defaultLimits.api.authenticatedPerMinute : defaultLimits.api.guestPerMinute,
      resetAt: new Date(now.getTime() + 60000), // Reset in 1 minute
    };
  }

  /**
   * Check if a request is allowed under the rate limit
   */
  static async checkLimit(
    userId?: Types.ObjectId | string,
    ipAddress?: string,
    category: LimitCategory = 'api',
    action: LimitAction = 'apiRequest',
    windowMs: number = 60000, // 1 minute default
  ): Promise<LimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    const normalizedUserId = this.normalizeUserId(userId);

    const defaultLimit = normalizedUserId ? defaultLimits.api.authenticatedPerMinute : defaultLimits.api.guestPerMinute;

    // Find existing record within the window
    const query: any = {
      category,
      action,
      windowStart: {$gte: windowStart},
      resetAt: {$gte: now},
    };

    if (normalizedUserId) {
      query.userId = normalizedUserId;
    } else if (ipAddress) {
      query.ipAddress = ipAddress;
    }

    const existingRecord = await UsageLimit.findOne(query);

    if (existingRecord) {
      const allowed = existingRecord.count < existingRecord.limit;
      return {
        allowed,
        remaining: Math.max(0, existingRecord.limit - existingRecord.count),
        resetAt: existingRecord.resetAt,
        limit: existingRecord.limit,
        current: existingRecord.count,
      };
    }

    // Create new record
    const newRecord = new UsageLimit({
      userId: normalizedUserId || undefined,
      ipAddress,
      category,
      action,
      count: 1,
      limit: defaultLimit,
      windowStart,
      resetAt: new Date(now.getTime() + windowMs),
    });

    await newRecord.save();

    return {
      allowed: true,
      remaining: defaultLimit - 1,
      resetAt: new Date(now.getTime() + windowMs),
      limit: defaultLimit,
      current: 1,
    };
  }

  /**
   * Increment the usage count for a limit
   */
  static async incrementUsage(
    userId?: Types.ObjectId | string,
    ipAddress?: string,
    category: LimitCategory = 'api',
    action: LimitAction = 'apiRequest',
    windowMs: number = 60000,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    const normalizedUserId = this.normalizeUserId(userId);

    const defaultLimit = normalizedUserId ? defaultLimits.api.authenticatedPerMinute : defaultLimits.api.guestPerMinute;

    // Try to find and update existing record
    const query: any = {
      category,
      action,
      windowStart: {$gte: windowStart},
      resetAt: {$gte: now},
    };

    if (normalizedUserId) {
      query.userId = normalizedUserId;
    } else if (ipAddress) {
      query.ipAddress = ipAddress;
    }

    // First check if record exists
    const existing = await UsageLimit.findOne(query);

    if (existing) {
      // Increment existing record
      await UsageLimit.updateOne(
        { _id: existing._id },
        {
          $inc: { count: 1 },
          $set: { metadata },
        },
      );
    } else {
      // Create new record
      await UsageLimit.create({
        userId: normalizedUserId || undefined,
        ipAddress,
        category,
        action,
        windowStart,
        count: 1,
        limit: defaultLimit,
        resetAt: new Date(now.getTime() + windowMs),
        metadata,
      });
    }
  }

  /**
   * Check storage quota for a user
   */
  static async checkStorageQuota(
    userId: Types.ObjectId | string,
    additionalBytes: number = 0,
  ): Promise<StorageQuotaResult> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const quota = limits.config.storage.authenticatedUserQuota;

    // Calculate total storage for user across relevant collections
    // This queries DesignAsset and LearningPost collections
    const [assetTotal, postTotal] = await Promise.all([
      // Import dynamically to avoid circular dependency
      (await import('../models/DesignAsset.js')).DesignAsset.aggregate([
        {$group: {_id: null, total: {$sum: '$size'}}}
      ]).then(r => r[0]?.total || 0),
      (await import('../models/LearningPost.js')).LearningPost.aggregate([
        {$group: {_id: null, total: {$sum: '$size'}}}
      ]).then(r => r[0]?.total || 0),
    ]);

    const currentUsage = assetTotal + postTotal;
    const remainingBytes = quota - currentUsage - additionalBytes;

    return {
      withinQuota: remainingBytes >= 0,
      remainingBytes,
      currentUsage,
      quota,
    };
  }

  /**
   * Clean up expired usage records (runs periodically)
   */
  static async cleanupExpiredRecords(): Promise<number> {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const result = await UsageLimit.deleteMany({createdAt: {$lt: cutoff}});
    return result.deletedCount;
  }

  /**
   * Get platform-wide usage statistics
   */
  static async getUsageStatistics(hours: number = 24): Promise<{
    totalApiRequests: number;
    totalUploads: number;
    activeUsers: number;
    violations: number;
  }> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [apiCount, uploadCount, activeUsers, violations] = await Promise.all([
      UsageLimit.countDocuments({category: 'api', createdAt: {$gte: since}}),
      UsageLimit.countDocuments({category: 'upload', createdAt: {$gte: since}}),
      UsageLimit.countDocuments({userId: {$ne: null}, createdAt: {$gte: since}}),
      UsageLimit.countDocuments({count: {$gt: 100}, createdAt: {$gte: since}}), // Arbitrary threshold
    ]);

    return {
      totalApiRequests: apiCount,
      totalUploads: uploadCount,
      activeUsers,
      violations,
    };
  }

  /**
   * Get user's current limit status
   */
  static async getUserLimitStatus(
    userId: Types.ObjectId | string,
    category: LimitCategory,
  ): Promise<Array<{action: string; count: number; limit: number; resetAt: Date}>> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const now = new Date();

    const records = await UsageLimit.find({
      userId: userObjId,
      category,
      resetAt: {$gte: now},
    }).sort({action: 1});

    return records.map(r => ({
      action: r.action,
      count: r.count,
      limit: r.limit,
      resetAt: r.resetAt,
    }));
  }
}