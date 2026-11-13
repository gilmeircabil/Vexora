import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Readable } from 'node:stream';
import sharp from 'sharp';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { DesignAsset } from '../models/DesignAsset.js';

export interface SavedAssetResult {
  storageKey: string;
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  size: number;
}

export interface AssetStreamResult {
  stream: Readable;
  contentType: string;
  contentLength?: number;
}

export class StorageService {
  private static baseDir = path.resolve(process.cwd(), 'server', 'uploads');
  private static assetsDir = path.resolve(process.cwd(), 'server', 'uploads', 'assets');
  private static thumbsDir = path.resolve(process.cwd(), 'server', 'uploads', 'assets', 'thumbs');

  private static s3ClientInstance: S3Client | null = null;

  /**
   * Determine whether S3 / Cloudflare R2 storage is actively enabled.
   */
  static isS3Enabled(): boolean {
    return env.STORAGE_PROVIDER === 's3' && Boolean(env.S3_BUCKET);
  }

  /**
   * Get or instantiate the S3 client for Cloudflare R2 / AWS S3.
   */
  static getS3Client(): S3Client {
    if (!this.s3ClientInstance) {
      this.s3ClientInstance = new S3Client({
        region: env.S3_REGION || 'auto',
        endpoint: env.S3_ENDPOINT || undefined,
        forcePathStyle: true,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY || '',
          secretAccessKey: env.S3_SECRET_KEY || '',
        },
      });
    }
    return this.s3ClientInstance;
  }

  static async init(): Promise<void> {
    if (!this.isS3Enabled()) {
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.mkdir(this.assetsDir, { recursive: true });
      await fs.mkdir(this.thumbsDir, { recursive: true });
    }
  }

  /**
   * 9.5 GB Automatic Safety Guard (Hard Stop):
   * Aggregates total stored bytes and enforces a ceiling below 10 GB so
   * Cloudflare R2 never exceeds the 10 GB free tier.
   */
  static async checkQuota(incomingBytes = 0): Promise<void> {
    const maxStorageBytes = (env.STORAGE_MAX_GB || 9.5) * 1024 * 1024 * 1024;

    try {
      const result = await DesignAsset.aggregate([
        {
          $group: {
            _id: null,
            totalSize: { $sum: '$size' },
          },
        },
      ]);

      const currentTotal = result[0]?.totalSize ?? result[0]?.total ?? 0;
      if (currentTotal + incomingBytes > maxStorageBytes) {
        throw new Error(
          `Storage limit reached (${env.STORAGE_MAX_GB || 9.5} GB safety cap). Upload rejected to prevent cloud overage fees. Please remove older assets to free up space.`,
        );
      }
    } catch (err: any) {
      if (err.message && err.message.includes('safety cap')) {
        throw err;
      }
      // If database is unreachable or table empty, log warning but don't crash
      console.warn('Could not query current storage quota from database:', err.message);
    }
  }

  /**
   * Save an uploaded file buffer, optimize, and generate thumbnail.
   * Streams to Cloudflare R2 when STORAGE_PROVIDER=s3, otherwise writes to local disk.
   */
  static async saveAsset(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    userId: string;
  }): Promise<SavedAssetResult> {
    // 1. Enforce 9.5 GB safety cap before saving
    await this.checkQuota(params.buffer.length);

    await this.init();

    const ext = path.extname(params.originalName) || '.png';
    const cleanExt = ext.toLowerCase();
    const randomId = crypto.randomBytes(16).toString('hex');
    const storageKey = `asset_${params.userId}_${randomId}${cleanExt}`;
    const thumbKey = `thumb_${params.userId}_${randomId}.webp`;

    let width: number | undefined;
    let height: number | undefined;
    let thumbBuffer: Buffer | null = null;

    try {
      const metadata = await sharp(params.buffer).metadata();
      width = metadata.width;
      height = metadata.height;

      // Generate optimized WebP thumbnail
      thumbBuffer = await sharp(params.buffer)
        .resize(320, 320, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (err) {
      console.warn('Could not generate thumbnail for asset:', err);
    }

    if (this.isS3Enabled()) {
      try {
        const s3 = this.getS3Client();

        // Upload primary asset to Cloudflare R2
        await s3.send(
          new PutObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: `assets/${storageKey}`,
            Body: params.buffer,
            ContentType: params.mimeType,
          }),
        );

        // Upload thumbnail if generated
        if (thumbBuffer) {
          await s3.send(
            new PutObjectCommand({
              Bucket: env.S3_BUCKET,
              Key: `thumbs/${thumbKey}`,
              Body: thumbBuffer,
              ContentType: 'image/webp',
            }),
          );
        }

        // Generate public or proxy URLs
        // Note: r2.dev dev domains are rate-limited and often fail DNS resolution (ENOTFOUND).
        // Only use publicBase directly if configured with a custom domain, otherwise use the reliable streaming proxy.
        const isR2DevDomain = Boolean(env.S3_PUBLIC_URL && env.S3_PUBLIC_URL.includes('.r2.dev'));
        const publicBase = (!isR2DevDomain && env.S3_PUBLIC_URL) ? env.S3_PUBLIC_URL.replace(/\/+$/, '') : '';
        const url = publicBase
          ? `${publicBase}/assets/${storageKey}`
          : `/api/design-assets/files/${storageKey}`;
        const thumbnailUrl = publicBase
          ? `${publicBase}/thumbs/${thumbKey}`
          : `/api/design-assets/files/thumbs/${thumbKey}`;

        return {
          storageKey,
          url,
          thumbnailUrl,
          width,
          height,
          size: params.buffer.length,
        };
      } catch (s3Err: any) {
        console.error(
          'Cloudflare R2 storage error, falling back to local file storage:',
          s3Err?.message || s3Err,
        );
      }
    }

    // Local file storage fallback
    const filePath = path.join(this.assetsDir, storageKey);
    const thumbPath = path.join(this.thumbsDir, thumbKey);

    await fs.writeFile(filePath, params.buffer);
    if (thumbBuffer) {
      await fs.writeFile(thumbPath, thumbBuffer);
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
   * Get file path safely preventing path traversal (for local disk).
   */
  static getAssetFilePath(storageKey: string, isThumb = false): string | null {
    if (
      !storageKey ||
      storageKey.includes('..') ||
      storageKey.includes('/') ||
      storageKey.includes('\\')
    ) {
      return null;
    }
    const targetDir = isThumb ? this.thumbsDir : this.assetsDir;
    return path.join(targetDir, storageKey);
  }

  /**
   * Retrieve asset stream for serving directly (from S3 or local disk).
   */
  static async getAssetStream(
    storageKey: string,
    isThumb = false,
  ): Promise<AssetStreamResult | null> {
    if (
      !storageKey ||
      storageKey.includes('..') ||
      storageKey.includes('/') ||
      storageKey.includes('\\')
    ) {
      return null;
    }

    const candidateKeys = [storageKey];
    if (isThumb && storageKey.startsWith('asset_')) {
      candidateKeys.unshift(
        storageKey.replace(/^asset_/, 'thumb_').replace(/\.[^.]+$/, '.webp'),
      );
    }

    if (this.isS3Enabled()) {
      try {
        const s3 = this.getS3Client();

        for (const key of candidateKeys) {
          const s3Key = isThumb ? `thumbs/${key}` : `assets/${key}`;
          try {
            const response = await s3.send(
              new GetObjectCommand({
                Bucket: env.S3_BUCKET,
                Key: s3Key,
              }),
            );

            if (response.Body) {
              return {
                stream: response.Body as Readable,
                contentType:
                  response.ContentType || (isThumb ? 'image/webp' : 'application/octet-stream'),
                contentLength: response.ContentLength,
              };
            }
          } catch (err: any) {
            if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
              continue;
            }
            console.error('S3 GetObject error:', err);
          }
        }
      } catch (err: any) {
        console.error('S3 client error:', err);
      }
    }

    // Local disk stream fallback
    for (const key of candidateKeys) {
      const filePath = this.getAssetFilePath(key, isThumb);
      if (filePath && fsSync.existsSync(filePath)) {
        let contentType = 'application/octet-stream';
        if (isThumb || key.endsWith('.webp')) {
          contentType = 'image/webp';
        } else if (key.endsWith('.png')) {
          contentType = 'image/png';
        } else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) {
          contentType = 'image/jpeg';
        }

        return {
          stream: fsSync.createReadStream(filePath),
          contentType,
        };
      }
    }

    return null;
  }

  /**
   * Delete asset files from Cloudflare R2 or local disk.
   */
  static async deleteAsset(storageKey: string): Promise<void> {
    if (
      !storageKey ||
      storageKey.includes('..') ||
      storageKey.includes('/') ||
      storageKey.includes('\\')
    ) {
      return;
    }

    const thumbKey = storageKey.replace(/^asset_/, 'thumb_').replace(/\.[^.]+$/, '.webp');

    if (this.isS3Enabled()) {
      try {
        const s3 = this.getS3Client();
        await Promise.allSettled([
          s3.send(
            new DeleteObjectCommand({
              Bucket: env.S3_BUCKET,
              Key: `assets/${storageKey}`,
            }),
          ),
          s3.send(
            new DeleteObjectCommand({
              Bucket: env.S3_BUCKET,
              Key: `thumbs/${thumbKey}`,
            }),
          ),
        ]);
      } catch (err) {
        console.warn('Could not delete asset from S3:', err);
      }
      return;
    }

    // Local deletion
    const mainPath = this.getAssetFilePath(storageKey, false);
    if (mainPath) {
      await fs.unlink(mainPath).catch(() => {});
    }

    const thumbPath = this.getAssetFilePath(thumbKey, true);
    if (thumbPath) {
      await fs.unlink(thumbPath).catch(() => {});
    }
  }

  /**
   * Normalize an asset URL to prevent broken r2.dev links by routing through the internal streaming proxy.
   */
  static normalizeAssetUrl(url?: string | null): string {
    if (!url) return '';
    return url
      .replace(/^https:\/\/pub-[^/]+\.r2\.dev\/assets\//, '/api/design-assets/files/')
      .replace(/^https:\/\/pub-[^/]+\.r2\.dev\/thumbs\//, '/api/design-assets/files/thumbs/');
  }
}
