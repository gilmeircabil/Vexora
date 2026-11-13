import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from '../src/services/storageService.js';
import { AuthService } from '../src/services/authService.js';
import { User } from '../src/models/User.js';
import { env } from '../src/config/env.js';
import { DesignAsset } from '../src/models/DesignAsset.js';

describe('StorageService & Cloudflare R2 Safety Cap', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Storage Quota & 9.5 GB Safety Cap', () => {
    it('should allow upload when current storage plus incoming file is under the safety limit', async () => {
      // Mock DesignAsset.aggregate to return 5 GB of total stored files
      const fiveGB = 5 * 1024 * 1024 * 1024;
      vi.spyOn(DesignAsset, 'aggregate').mockResolvedValue([{ _id: null, total: fiveGB }] as any);

      const incomingBytes = 10 * 1024 * 1024; // 10MB
      await expect(StorageService.checkQuota(incomingBytes)).resolves.not.toThrow();
    });

    it('should reject upload with a clear safety cap error when incoming file exceeds 9.5 GB limit', async () => {
      // Mock DesignAsset.aggregate to return 9.49 GB
      const nearLimit = 9.49 * 1024 * 1024 * 1024;
      vi.spyOn(DesignAsset, 'aggregate').mockResolvedValue([
        { _id: null, total: nearLimit },
      ] as any);

      // Incoming 20MB file will push it past 9.5GB
      const incomingBytes = 20 * 1024 * 1024;
      await expect(StorageService.checkQuota(incomingBytes)).rejects.toThrow(
        /Storage limit reached \(9\.5 GB safety cap\)/i,
      );
    });

    it('should treat empty aggregate as 0 bytes used', async () => {
      vi.spyOn(DesignAsset, 'aggregate').mockResolvedValue([] as any);

      const incomingBytes = 5 * 1024 * 1024; // 5MB
      await expect(StorageService.checkQuota(incomingBytes)).resolves.not.toThrow();
    });
  });

  describe('S3 Client Initialization', () => {
    it('should identify whether S3 is enabled based on env config', () => {
      if (env.STORAGE_PROVIDER === 's3' && env.S3_BUCKET) {
        expect(StorageService.isS3Enabled()).toBe(true);
      } else {
        expect(StorageService.isS3Enabled()).toBe(false);
      }
    });

    it('should fall back to local disk storage if S3 upload throws an error', async () => {
      vi.spyOn(StorageService, 'isS3Enabled').mockReturnValue(true);
      const mockS3 = {
        send: vi.fn().mockRejectedValue(new Error('S3 access denied or network down')),
      };
      vi.spyOn(StorageService, 'getS3Client').mockReturnValue(mockS3 as any);
      vi.spyOn(StorageService, 'checkQuota').mockResolvedValue(undefined);

      const fakeBuffer = Buffer.from('test image data');
      const result = await StorageService.saveAsset({
        buffer: fakeBuffer,
        originalName: 'avatar.png',
        mimeType: 'image/png',
        userId: 'user123',
      });

      expect(result).toBeDefined();
      expect(result.url).toContain('/api/design-assets/files/asset_user123_');
    });
  });

  describe('Asset Streaming & Security', () => {
    it('should reject path traversal storage keys when getting asset stream', async () => {
      expect(await StorageService.getAssetStream('../../secret.env')).toBeNull();
      expect(await StorageService.getAssetStream('/etc/passwd')).toBeNull();
      expect(await StorageService.getAssetStream('folder\\file.png')).toBeNull();
      expect(await StorageService.getAssetStream('')).toBeNull();
    });

    it('should fall through to local disk when S3 throws NoSuchKey or 404', async () => {
      vi.spyOn(StorageService, 'isS3Enabled').mockReturnValue(true);
      const mockS3 = {
        send: vi.fn().mockRejectedValue({ name: 'NoSuchKey', $metadata: { httpStatusCode: 404 } }),
      };
      vi.spyOn(StorageService, 'getS3Client').mockReturnValue(mockS3 as any);
      vi.spyOn(StorageService, 'getAssetFilePath').mockReturnValue(null);

      const stream = await StorageService.getAssetStream('asset_nonexistent_123.jpg');
      expect(stream).toBeNull();
      expect(mockS3.send).toHaveBeenCalled();
    });
  });

  describe('Automatic Old Picture Deletion in R2 Storage', () => {
    it('extracts storageKey from proxy and R2 URLs and ignores external OAuth URLs', () => {
      expect(
        StorageService.extractStorageKeyFromUrl(
          '/api/design-assets/files/asset_u1_abcdef123456.png',
        ),
      ).toBe('asset_u1_abcdef123456.png');

      expect(
        StorageService.extractStorageKeyFromUrl(
          'https://cdn.vexoramods.com/assets/asset_u1_abcdef123456.jpg',
        ),
      ).toBe('asset_u1_abcdef123456.jpg');

      expect(
        StorageService.extractStorageKeyFromUrl('https://lh3.googleusercontent.com/a/avatar123'),
      ).toBeNull();
      expect(StorageService.extractStorageKeyFromUrl('')).toBeNull();
    });

    it('deletes the old picture and thumbnail from R2 storage when user changes or removes avatarUrl', async () => {
      vi.spyOn(StorageService, 'isS3Enabled').mockReturnValue(true);
      const mockS3 = {
        send: vi.fn().mockResolvedValue({}),
      };
      vi.spyOn(StorageService, 'getS3Client').mockReturnValue(mockS3 as any);
      vi.spyOn(DesignAsset, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as any);

      const mockUserDoc: any = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Alex',
        avatarUrl: '/api/design-assets/files/asset_507f1f77bcf86cd799439011_oldpic123.png',
        save: vi.fn().mockResolvedValue(true),
      };
      vi.spyOn(User, 'findById').mockResolvedValue(mockUserDoc);
      vi.spyOn(AuthService, 'getCurrentUser').mockResolvedValue({
        id: '507f1f77bcf86cd799439011',
        username: 'alex',
        name: 'Alex',
        avatarUrl: '/api/design-assets/files/asset_507f1f77bcf86cd799439011_newpic456.png',
        role: 'user',
      } as any);

      await AuthService.updateProfile('507f1f77bcf86cd799439011', {
        avatarUrl: '/api/design-assets/files/asset_507f1f77bcf86cd799439011_newpic456.png',
      });

      // Verify both the primary asset and thumbnail of the old picture were deleted from R2
      expect(mockS3.send).toHaveBeenCalledTimes(2);
      const sentCommands = mockS3.send.mock.calls.map((c) => c[0].input);
      expect(sentCommands).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            Key: 'assets/asset_507f1f77bcf86cd799439011_oldpic123.png',
          }),
          expect.objectContaining({
            Key: 'thumbs/thumb_507f1f77bcf86cd799439011_oldpic123.webp',
          }),
        ]),
      );
      expect(DesignAsset.deleteOne).toHaveBeenCalledWith({
        storageKey: 'asset_507f1f77bcf86cd799439011_oldpic123.png',
      });
    });
  });
});
