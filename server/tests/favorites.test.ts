import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { UserFavorite } from '../src/models/UserFavorite.js';
import { FavoriteController } from '../src/controllers/favoriteController.js';

describe('VexoraMods Backend Favorites Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. UserFavorite Mongoose Model Schema & Indexes', () => {
    it('defines UserFavorite schema with userId, toolId, and createdAt fields', () => {
      const paths = UserFavorite.schema.paths;
      expect(paths.userId).toBeDefined();
      expect(paths.toolId).toBeDefined();
      expect(paths.createdAt).toBeDefined();
    });

    it('has indexes configured for compound uniqueness and recency sorting', () => {
      const indexes = UserFavorite.schema.indexes();
      // Check compound index { userId: 1, toolId: 1 } with unique: true
      const compoundIndex = indexes.find(
        ([idx, opts]: any) => idx.userId === 1 && idx.toolId === 1 && opts?.unique === true,
      );
      expect(compoundIndex).toBeDefined();

      // Check recency index { userId: 1, createdAt: -1 }
      const recencyIndex = indexes.find(([idx]: any) => idx.userId === 1 && idx.createdAt === -1);
      expect(recencyIndex).toBeDefined();
    });
  });

  describe('2. FavoriteController Endpoints & Authorization', () => {
    const mockUserId = new Types.ObjectId();

    it('rejects getFavorites when user is not authenticated', async () => {
      const req: any = {};
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await FavoriteController.getFavorites(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'Authentication required' }),
      );
    });

    it('fetches ordered favorites for authenticated user', async () => {
      const req: any = {
        user: { userId: mockUserId.toString(), email: 'user@example.com', role: 'user' },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      vi.spyOn(UserFavorite, 'find').mockReturnValueOnce({
        sort: () => ({
          lean: async () => [
            { toolId: 'word-counter', createdAt: new Date() },
            { toolId: 'image-compressor', createdAt: new Date() },
          ],
        }),
      } as any);

      await FavoriteController.getFavorites(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: ['word-counter', 'image-compressor'],
      });
    });

    it('validates tool ID and adds favorite via upsert', async () => {
      const req: any = {
        user: { userId: mockUserId.toString(), email: 'user@example.com', role: 'user' },
        params: { toolId: 'smart-image-studio' },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const updateSpy = vi.spyOn(UserFavorite, 'updateOne').mockResolvedValueOnce({} as any);

      await FavoriteController.addFavorite(req, res);
      expect(updateSpy).toHaveBeenCalledWith(
        { userId: mockUserId, toolId: 'smart-image-studio' },
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({
            userId: mockUserId,
            toolId: 'smart-image-studio',
          }),
        }),
        { upsert: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { toolId: 'smart-image-studio', favorited: true },
      });
    });

    it('rejects invalid or malformed tool IDs', async () => {
      const req: any = {
        user: { userId: mockUserId.toString(), email: 'user@example.com', role: 'user' },
        params: { toolId: '   ' },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await FavoriteController.addFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'Invalid tool ID' }),
      );
    });

    it('removes favorite for authenticated user', async () => {
      const req: any = {
        user: { userId: mockUserId.toString(), email: 'user@example.com', role: 'user' },
        params: { toolId: 'smart-image-studio' },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const deleteSpy = vi.spyOn(UserFavorite, 'deleteOne').mockResolvedValueOnce({} as any);

      await FavoriteController.removeFavorite(req, res);
      expect(deleteSpy).toHaveBeenCalledWith({ userId: mockUserId, toolId: 'smart-image-studio' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { toolId: 'smart-image-studio', favorited: false },
      });
    });

    it('synchronizes and merges guest favorites without duplicates', async () => {
      const req: any = {
        user: { userId: mockUserId.toString(), email: 'user@example.com', role: 'user' },
        body: { toolIds: ['image-compressor', 'image-compressor', 'word-counter', 'invalid!@#'] },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      const updateSpy = vi.spyOn(UserFavorite, 'updateOne').mockResolvedValue({} as any);
      vi.spyOn(UserFavorite, 'find').mockReturnValueOnce({
        sort: () => ({
          lean: async () => [
            { toolId: 'word-counter' },
            { toolId: 'image-compressor' },
            { toolId: 'existing-fav' },
          ],
        }),
      } as any);

      await FavoriteController.syncFavorites(req, res);

      // Only valid deduplicated tool IDs ('image-compressor', 'word-counter') are upserted
      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: ['word-counter', 'image-compressor', 'existing-fav'],
      });
    });
  });
});
