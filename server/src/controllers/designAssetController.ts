import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { DesignAsset } from '../models/DesignAsset.js';
import { StorageService } from '../services/storageService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

function getParam(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

export class DesignAssetController {
  /**
   * Upload an image asset
   * Route: POST /api/design-assets/upload
   */
  static async upload(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'No image file uploaded' });
        return;
      }

      const { projectId } = req.body;

      // Save via StorageService
      const saved = await StorageService.saveAsset({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        userId,
      });

      const asset = await DesignAsset.create({
        userId: new Types.ObjectId(userId),
        projectId:
          projectId && typeof projectId === 'string' && Types.ObjectId.isValid(projectId)
            ? new Types.ObjectId(projectId)
            : undefined,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: saved.size,
        storageKey: saved.storageKey,
        url: saved.url,
        thumbnailUrl: saved.thumbnailUrl,
        width: saved.width,
        height: saved.height,
      });

      res.status(201).json({
        success: true,
        asset,
      });
    } catch (err: any) {
      console.error('Upload asset error:', err);
      const isQuotaError = err.message && err.message.includes('safety cap');
      res.status(isQuotaError ? 413 : 500).json({
        success: false,
        error: err.message || 'Failed to upload asset',
      });
    }
  }

  /**
   * List user's assets
   * Route: GET /api/design-assets
   */
  static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { projectId } = req.query;
      const query: Record<string, any> = {
        userId: new Types.ObjectId(userId),
      };

      if (projectId && typeof projectId === 'string' && Types.ObjectId.isValid(projectId)) {
        query.projectId = new Types.ObjectId(projectId);
      }

      const assets = await DesignAsset.find(query).sort({ createdAt: -1 }).limit(100).lean();

      res.json({
        success: true,
        assets,
      });
    } catch (err: any) {
      console.error('List assets error:', err);
      res.status(500).json({ success: false, error: 'Failed to list assets' });
    }
  }

  /**
   * Delete an asset
   * Route: DELETE /api/design-assets/:assetId
   */
  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const assetId = getParam(req.params.assetId);

      if (!assetId || !Types.ObjectId.isValid(assetId)) {
        res.status(400).json({ success: false, error: 'Invalid asset ID' });
        return;
      }

      const asset = await DesignAsset.findOneAndDelete({
        _id: new Types.ObjectId(assetId),
        userId: new Types.ObjectId(userId),
      });

      if (!asset) {
        res.status(404).json({ success: false, error: 'Asset not found' });
        return;
      }

      await StorageService.deleteAsset(asset.storageKey);

      res.json({
        success: true,
        message: 'Asset deleted successfully',
      });
    } catch (err: any) {
      console.error('Delete asset error:', err);
      res.status(500).json({ success: false, error: 'Failed to delete asset' });
    }
  }

  /**
   * Serve raw asset or thumbnail safely with cache control (supports Cloudflare R2 and local disk)
   * Route: GET /api/design-assets/files/:storageKey
   * Route: GET /api/design-assets/files/thumbs/:storageKey
   */
  static async serveFile(req: Request, res: Response): Promise<void> {
    try {
      const storageKey = getParam(req.params.storageKey);
      const isThumb = req.path.includes('/thumbs/');

      if (!storageKey) {
        res.status(400).send('Bad request');
        return;
      }

      const assetStream = await StorageService.getAssetStream(storageKey, isThumb);
      if (!assetStream) {
        res.status(404).send('File not found');
        return;
      }

      // Safe cache headers
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Type', assetStream.contentType);
      if (assetStream.contentLength) {
        res.setHeader('Content-Length', assetStream.contentLength);
      }

      assetStream.stream.pipe(res);
    } catch (err: any) {
      console.error('Serve file error:', err);
      res.status(500).send('Error reading file');
    }
  }
}
