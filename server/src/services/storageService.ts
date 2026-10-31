import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { env } from '../config/env.js';

export interface SavedAssetResult {
  storageKey: string;
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  size: number;
}

export class StorageService {
  private static baseDir = path.resolve(process.cwd(), 'server', 'uploads');
  private static assetsDir = path.resolve(process.cwd(), 'server', 'uploads', 'assets');
  private static thumbsDir = path.resolve(process.cwd(), 'server', 'uploads', 'assets', 'thumbs');

  static async init(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    await fs.mkdir(this.assetsDir, { recursive: true });
    await fs.mkdir(this.thumbsDir, { recursive: true });
  }

  /**
   * Save an uploaded file buffer, optimize, and generate thumbnail.
   */
  static async saveAsset(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    userId: string;
  }): Promise<SavedAssetResult> {
    await this.init();

    const ext = path.extname(params.originalName) || '.png';
    const cleanExt = ext.toLowerCase();
    const randomId = crypto.randomBytes(16).toString('hex');
    const storageKey = `asset_${params.userId}_${randomId}${cleanExt}`;
    const thumbKey = `thumb_${params.userId}_${randomId}.webp`;

    const filePath = path.join(this.assetsDir, storageKey);
    const thumbPath = path.join(this.thumbsDir, thumbKey);

    // Save main asset
    await fs.writeFile(filePath, params.buffer);

    let width: number | undefined;
    let height: number | undefined;

    try {
      const metadata = await sharp(params.buffer).metadata();
      width = metadata.width;
      height = metadata.height;

      // Generate optimized WebP thumbnail
      await sharp(params.buffer)
        .resize(320, 320, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(thumbPath);
    } catch (err) {
      // In case image thumbnail generation fails, still keep main file
      console.warn('Could not generate thumbnail for asset:', err);
    }

    const url = `/api/design-assets/files/${storageKey}`;
    const thumbnailUrl = `/api/design-assets/files/thumbs/${thumbKey}`;

    return {
      storageKey,
      url,
      thumbnailUrl,
      width,
      height,
      size: params.buffer.length,
    };
  }

  /**
   * Get file path safely preventing path traversal
   */
  static getAssetFilePath(storageKey: string, isThumb = false): string | null {
    // Prevent directory traversal
    if (!storageKey || storageKey.includes('..') || storageKey.includes('/') || storageKey.includes('\\')) {
      return null;
    }
    const targetDir = isThumb ? this.thumbsDir : this.assetsDir;
    return path.join(targetDir, storageKey);
  }

  /**
   * Delete asset files from disk
   */
  static async deleteAsset(storageKey: string): Promise<void> {
    const mainPath = this.getAssetFilePath(storageKey, false);
    if (mainPath) {
      await fs.unlink(mainPath).catch(() => {});
    }

    // Attempt to delete thumb if exists
    const thumbKey = storageKey.replace(/^asset_/, 'thumb_').replace(/\.[^.]+$/, '.webp');
    const thumbPath = this.getAssetFilePath(thumbKey, true);
    if (thumbPath) {
      await fs.unlink(thumbPath).catch(() => {});
    }
  }
}
