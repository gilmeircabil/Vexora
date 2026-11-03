import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from '../src/services/storageService.js';
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
      vi.spyOn(DesignAsset, 'aggregate').mockResolvedValue([{ _id: null, total: nearLimit }] as any);

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
  });

  describe('Asset Streaming & Security', () => {
    it('should reject path traversal storage keys when getting asset stream', async () => {
      expect(await StorageService.getAssetStream('../../secret.env')).toBeNull();
      expect(await StorageService.getAssetStream('/etc/passwd')).toBeNull();
      expect(await StorageService.getAssetStream('folder\\file.png')).toBeNull();
      expect(await StorageService.getAssetStream('')).toBeNull();
    });
  });
});
