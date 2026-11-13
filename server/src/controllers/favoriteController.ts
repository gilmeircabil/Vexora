import type { Response } from 'express';
import { Types } from 'mongoose';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { UserFavorite } from '../models/UserFavorite.js';

function toObjectId(id: unknown): Types.ObjectId {
  if (id instanceof Types.ObjectId) {
    return id;
  }
  return new Types.ObjectId(String(id));
}

function sanitizeToolId(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 64) {
    return null;
  }
  if (!/^[a-z0-9_-]+$/i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export class FavoriteController {
  /**
   * GET /api/favorites
   * Returns ordered list of favorited tool IDs for the authenticated user.
   */
  static async getFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const userId = toObjectId(req.user.userId);
      const favs = await UserFavorite.find({ userId }).sort({ createdAt: -1 }).lean();
      
      const toolIds: string[] = [];
      for (const fav of favs) {
        toolIds.push(fav.toolId);
      }

      res.status(200).json({
        success: true,
        data: toolIds,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to fetch favorites' });
    }
  }

  /**
   * POST /api/favorites/:toolId
   * Adds a tool to favorites for the authenticated user.
   */
  static async addFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const toolId = sanitizeToolId(req.params.toolId);
      if (!toolId) {
        res.status(400).json({ success: false, error: 'Invalid tool ID' });
        return;
      }
      const userId = toObjectId(req.user.userId);
      await UserFavorite.updateOne(
        { userId, toolId },
        { $setOnInsert: { userId, toolId, createdAt: new Date() } },
        { upsert: true },
      );
      res.status(200).json({
        success: true,
        data: { toolId, favorited: true },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to add favorite' });
    }
  }

  /**
   * DELETE /api/favorites/:toolId
   * Removes a tool from favorites for the authenticated user.
   */
  static async removeFavorite(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const toolId = sanitizeToolId(req.params.toolId);
      if (!toolId) {
        res.status(400).json({ success: false, error: 'Invalid tool ID' });
        return;
      }
      const userId = toObjectId(req.user.userId);
      await UserFavorite.deleteOne({ userId, toolId });
      res.status(200).json({
        success: true,
        data: { toolId, favorited: false },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to remove favorite' });
    }
  }

  /**
   * POST /api/favorites/sync
   * Merges guest favorites array with existing account favorites.
   */
  static async syncFavorites(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const userId = toObjectId(req.user.userId);
      const rawToolIds = Array.isArray(req.body.toolIds) ? req.body.toolIds : [];
      
      const validToolIds: string[] = [];
      for (const raw of rawToolIds) {
        const sanitized = sanitizeToolId(raw);
        if (sanitized && !validToolIds.includes(sanitized)) {
          validToolIds.push(sanitized);
        }
      }

      for (const id of validToolIds) {
        await UserFavorite.updateOne(
          { userId, toolId: id },
          { $setOnInsert: { userId, toolId: id, createdAt: new Date() } },
          { upsert: true },
        );
      }

      // Return complete merged list of favorite IDs, sorted recently added first
      const allFavs = await UserFavorite.find({ userId }).sort({ createdAt: -1 }).lean();
      const resultToolIds: string[] = [];
      for (const fav of allFavs) {
        resultToolIds.push(fav.toolId);
      }

      res.status(200).json({
        success: true,
        data: resultToolIds,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to synchronize favorites',
      });
    }
  }
}
