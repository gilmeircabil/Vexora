import type { Request, Response } from 'express';
import { z } from 'zod';
import { AnnouncementService } from '../services/announcementService.js';

const createAnnouncementSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  message: z
    .string()
    .min(2, 'Message must be at least 2 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
  type: z.enum(['info', 'success', 'warning', 'important']).default('info'),
  expiresAt: z.string().datetime().optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'archived']),
});

export class AnnouncementController {
  /**
   * Real-time Server-Sent Events stream for connected clients
   */
  static getSSEStream(_req: Request, res: Response): void {
    AnnouncementService.addSSEClient(res);
  }

  /**
   * Fetch active, eligible announcements for the current user/guest
   */
  static async getActiveAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const announcements = await AnnouncementService.getActiveAnnouncements(userId);
      res.json({
        success: true,
        data: announcements,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch active announcements',
      });
    }
  }

  /**
   * Mark an announcement as dismissed
   */
  static async dismissAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const success = await AnnouncementService.dismissAnnouncement(String(id), userId);
      res.json({
        success,
        message: success ? 'Announcement dismissed' : 'Invalid announcement ID',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to dismiss announcement',
      });
    }
  }

  /**
   * Record announcement view for delivery statistics
   */
  static async recordView(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await AnnouncementService.recordView(String(id));
      res.json({ success: true });
    } catch {
      res.json({ success: false });
    }
  }

  /**
   * (ADMIN) Create and publish a new announcement to all users
   */
  static async createAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createAnnouncementSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid announcement payload',
        });
        return;
      }

      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const announcement = await AnnouncementService.createAndBroadcast({
        title: parsed.data.title,
        message: parsed.data.message,
        type: parsed.data.type,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        createdBy: user.userId,
        createdByName: user.username || user.email || 'Administrator',
      });

      res.status(201).json({
        success: true,
        data: announcement,
        message: 'Announcement broadcasted successfully to all users.',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to broadcast announcement',
      });
    }
  }

  /**
   * (ADMIN) Fetch all announcements with delivery stats
   */
  static async getAllAnnouncements(_req: Request, res: Response): Promise<void> {
    try {
      const announcements = await AnnouncementService.getAllAnnouncements();
      res.json({
        success: true,
        data: {
          announcements,
          connectedLiveClients: AnnouncementService.getConnectedClientsCount(),
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to fetch announcements',
      });
    }
  }

  /**
   * (ADMIN) Activate, deactivate, or archive an announcement
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const parsed = updateStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid status',
        });
        return;
      }

      const updated = await AnnouncementService.updateStatus(String(id), parsed.data.status);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Announcement not found' });
        return;
      }

      res.json({
        success: true,
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to update announcement status',
      });
    }
  }

  /**
   * (ADMIN) Delete an announcement
   */
  static async deleteAnnouncement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await AnnouncementService.deleteAnnouncement(String(id));
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Announcement not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Announcement deleted successfully.',
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to delete announcement',
      });
    }
  }
}
