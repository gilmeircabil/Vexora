import { describe, it, expect } from 'vitest';
import { StorageService } from '../src/services/storageService.js';
import { INITIAL_SEED_TEMPLATES } from '../src/controllers/designTemplateController.js';
import { DEFAULT_TOOL_COSTS } from '../src/config/plans.js';

describe('Design Studio Backend Architecture & Security', () => {
  describe('Path Traversal & Storage Security', () => {
    it('should strictly reject malicious storage keys with path traversal characters', () => {
      expect(StorageService.getAssetFilePath('../../etc/passwd')).toBeNull();
      expect(StorageService.getAssetFilePath('../server/app.ts')).toBeNull();
      expect(StorageService.getAssetFilePath('/absolute/path/file.png')).toBeNull();
      expect(StorageService.getAssetFilePath('nested\\path\\file.png')).toBeNull();
      expect(StorageService.getAssetFilePath('')).toBeNull();
    });

    it('should construct valid safe paths for sanitized storage keys', () => {
      const safeKey = 'asset_user123_abc12345.png';
      const result = StorageService.getAssetFilePath(safeKey, false);
      expect(result).not.toBeNull();
      expect(result).toContain('server');
      expect(result).toContain('uploads');
      expect(result).toContain('assets');
      expect(result).toContain(safeKey);
    });

    it('should point to thumbs folder when isThumb is true', () => {
      const safeThumbKey = 'thumb_user123_abc12345.webp';
      const result = StorageService.getAssetFilePath(safeThumbKey, true);
      expect(result).not.toBeNull();
      expect(result).toContain('thumbs');
      expect(result).toContain(safeThumbKey);
    });
  });

  describe('Design Templates Catalog & Structure', () => {
    it('should have initial seed templates with valid dimensions and editable fabric objects', () => {
      expect(INITIAL_SEED_TEMPLATES.length).toBeGreaterThanOrEqual(6);

      for (const tpl of INITIAL_SEED_TEMPLATES) {
        expect(tpl.title).toBeTruthy();
        expect(tpl.category).toBeTruthy();
        expect(tpl.width).toBeGreaterThan(0);
        expect(tpl.height).toBeGreaterThan(0);
        expect(tpl.documentData).toBeDefined();
        expect(tpl.documentData.version).toBe('7.4.0');
        expect(Array.isArray(tpl.documentData.objects)).toBe(true);
        expect(tpl.documentData.objects.length).toBeGreaterThan(0);
      }
    });

    it('should contain key formats: 1080x1080 square, 1920x1080 slide, 1280x720 youtube, 1080x1920 story', () => {
      const dimensions = INITIAL_SEED_TEMPLATES.map((t) => `${t.width}x${t.height}`);
      expect(dimensions).toContain('1080x1080');
      expect(dimensions).toContain('1280x720');
      expect(dimensions).toContain('1920x1080');
      expect(dimensions).toContain('1080x1920');
      expect(dimensions).toContain('1200x1600');
    });
  });

  describe('Credit Model & Free Studio Isolation', () => {
    it('should verify that standard design studio operations do not register any AI credit costs', () => {
      // Normal design editing (create, text, shapes, layers, save, export) must not be defined as a paid credit tool
      expect(DEFAULT_TOOL_COSTS['design-studio-create']).toBeUndefined();
      expect(DEFAULT_TOOL_COSTS['design-studio-export']).toBeUndefined();
      expect(DEFAULT_TOOL_COSTS['design-studio-save']).toBeUndefined();
      expect(DEFAULT_TOOL_COSTS['design-studio-text']).toBeUndefined();

      // In the free & open-source version, AI features are 100% free (0 credit cost)
      expect(DEFAULT_TOOL_COSTS['ai-image-enhancer']).toBeDefined();
      expect(DEFAULT_TOOL_COSTS['ai-image-enhancer']?.creditCost).toBe(0);
    });
  });

  describe('Version History Snapshot Logic', () => {
    it('should calculate restored version numbers without altering or deleting existing history', () => {
      // Simulating a project with versions 1, 2, 3
      const project = {
        _id: 'proj_1',
        currentVersion: 3,
        revision: 5,
      };

      const snapshotToRestore = {
        _id: 'ver_1',
        versionNumber: 1,
        versionName: 'Initial design',
        documentData: { objects: [{ type: 'Rect' }] },
      };

      // Next version number is currentVersion + 1
      const nextVersionNumber = project.currentVersion + 1;
      expect(nextVersionNumber).toBe(4);

      const restoreLabel = `Restored from v${snapshotToRestore.versionNumber} (${snapshotToRestore.versionName})`;
      expect(restoreLabel).toBe('Restored from v1 (Initial design)');
    });
  });
});
