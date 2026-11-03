import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlatformController } from '../src/controllers/platformController.js';
import { AdminController } from '../src/controllers/adminController.js';
import { PlatformConfig, DEFAULT_MAINTENANCE_CONFIG } from '../src/models/PlatformConfig.js';

describe('Maintenance Mode Backend Suite', () => {
  let mockPlatformDoc: any = null;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockPlatformDoc = {
      key: 'default',
      maintenance: JSON.parse(JSON.stringify(DEFAULT_MAINTENANCE_CONFIG)),
    };

    vi.spyOn(PlatformConfig, 'findOne').mockImplementation((() => {
      const chain: any = {
        select: () => chain,
        lean: () => Promise.resolve(mockPlatformDoc),
      };
      return chain;
    }) as any);

    vi.spyOn(PlatformConfig, 'findOneAndUpdate').mockImplementation(((_query: any, update: any) => {
      const setOps = update.$set || {};
      for (const [key, value] of Object.entries(setOps)) {
        if (key.startsWith('maintenance.pages.')) {
          const pageKey = key.replace('maintenance.pages.', '');
          mockPlatformDoc.maintenance.pages[pageKey] = value;
        } else if (key === 'maintenance.global') {
          mockPlatformDoc.maintenance.global = value;
        } else if (key === 'maintenance.title') {
          mockPlatformDoc.maintenance.title = value;
        } else if (key === 'maintenance.message') {
          mockPlatformDoc.maintenance.message = value;
        } else if (key === 'maintenance.estimatedReturn') {
          mockPlatformDoc.maintenance.estimatedReturn = value;
        }
      }

      const chain: any = {
        select: () => chain,
        lean: () => Promise.resolve(mockPlatformDoc),
      };
      return chain;
    }) as any);
  });

  describe('GET /api/platform/maintenance', () => {
    it('returns default maintenance configuration when no custom settings exist', async () => {
      mockPlatformDoc = null;

      const req: any = {};
      let responseData: any = null;
      let statusCode = 0;

      const res: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(payload: any) {
          responseData = payload;
          return this;
        },
      };

      await PlatformController.getMaintenanceConfig(req, res);

      expect(statusCode).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.global).toBe(false);
      expect(responseData.data.title).toBe('Scheduled Maintenance');
      expect(responseData.data.pages.HOME).toBe(false);
      expect(responseData.data.pages.STUDIO).toBe(false);
    });

    it('returns stored maintenance configuration when document exists', async () => {
      mockPlatformDoc.maintenance.global = true;
      mockPlatformDoc.maintenance.title = 'System Upgrades';
      mockPlatformDoc.maintenance.pages.STUDIO = true;

      const req: any = {};
      let responseData: any = null;
      let statusCode = 0;

      const res: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(payload: any) {
          responseData = payload;
          return this;
        },
      };

      await PlatformController.getMaintenanceConfig(req, res);

      expect(statusCode).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.global).toBe(true);
      expect(responseData.data.title).toBe('System Upgrades');
      expect(responseData.data.pages.STUDIO).toBe(true);
    });
  });

  describe('PATCH /api/admin/maintenance', () => {
    it('successfully updates global switch, custom message, and per-page toggles', async () => {
      const req: any = {
        user: { userId: '507f1f77bcf86cd799439011', role: 'admin' },
        body: {
          global: true,
          title: 'Emergency Server Maintenance',
          message: 'We are performing critical database optimizations.',
          estimatedReturn: '11:00 PM UTC',
          pages: {
            STUDIO: true,
            COMMUNITY: true,
            TOOLS: false,
          },
        },
      };

      let responseData: any = null;
      let statusCode = 0;
      const res: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(payload: any) {
          responseData = payload;
          return this;
        },
      };

      await AdminController.updateMaintenanceConfig(req, res);

      expect(statusCode).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.global).toBe(true);
      expect(responseData.data.title).toBe('Emergency Server Maintenance');
      expect(responseData.data.message).toBe('We are performing critical database optimizations.');
      expect(responseData.data.estimatedReturn).toBe('11:00 PM UTC');
      expect(responseData.data.pages.STUDIO).toBe(true);
      expect(responseData.data.pages.COMMUNITY).toBe(true);
    });

    it('sanitizes malicious script tags in title and message', async () => {
      const req: any = {
        user: { userId: '507f1f77bcf86cd799439011', role: 'admin' },
        body: {
          title: '<script>alert("xss")</script>Routine Updates',
          message: '<b>Notice:</b> <script>stealCookies()</script>Down for 15 mins.',
        },
      };

      let responseData: any = null;
      const res: any = {
        status() {
          return this;
        },
        json(payload: any) {
          responseData = payload;
          return this;
        },
      };

      await AdminController.updateMaintenanceConfig(req, res);

      expect(responseData.success).toBe(true);
      expect(responseData.data.title).not.toContain('<script>');
      expect(responseData.data.message).not.toContain('<script>');
    });

    it('rejects invalid payload types', async () => {
      const req: any = {
        user: { userId: '507f1f77bcf86cd799439011', role: 'admin' },
        body: {
          global: 'invalid_boolean',
        },
      };

      let responseData: any = null;
      let statusCode = 0;
      const res: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(payload: any) {
          responseData = payload;
          return this;
        },
      };

      await AdminController.updateMaintenanceConfig(req, res);

      expect(statusCode).toBe(400);
      expect(responseData.success).toBe(false);
    });
  });
});
