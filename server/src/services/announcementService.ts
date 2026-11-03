import { Types } from 'mongoose';
import type { Response } from 'express';
import {
  Announcement,
  type AnnouncementType,
  type AnnouncementStatus,
  type IAnnouncement,
} from '../models/Announcement.js';
import { AnnouncementDismissal } from '../models/AnnouncementDismissal.js';

export interface CreateAnnouncementInput {
  title: string;
  message: string;
  type?: AnnouncementType;
  expiresAt?: Date | null;
  createdBy: string;
  createdByName: string;
}

export class AnnouncementService {
  // Connected Server-Sent Events (SSE) clients for real-time announcements
  private static sseClients: Set<Response> = new Set();
  private static heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Register a new client for Server-Sent Events real-time broadcast
   */
  static addSSEClient(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (Nginx, etc.)
    res.flushHeaders?.();

    // Send initial connection event
    res.write(
      `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`,
    );

    this.sseClients.add(res);

    // Start keepalive heartbeat if not running
    if (!this.heartbeatInterval) {
      this.heartbeatInterval = setInterval(() => {
        this.broadcastHeartbeat();
      }, 30000);
    }

    res.on('close', () => {
      this.sseClients.delete(res);
      if (this.sseClients.size === 0 && this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
    });
  }

  /**
   * Send keep-alive heartbeat comment to all active SSE streams
   */
  private static broadcastHeartbeat(): void {
    for (const client of this.sseClients) {
      try {
        client.write(`: keepalive ${Date.now()}\n\n`);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  /**
   * Broadcast payload to all connected SSE clients
   */
  static broadcastToClients(announcement: IAnnouncement): void {
    const payload = JSON.stringify({
      type: 'new_announcement',
      announcement: {
        _id: announcement._id.toString(),
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        publishedAt: announcement.publishedAt,
        expiresAt: announcement.expiresAt,
        createdByName: announcement.createdByName,
      },
    });

    for (const client of this.sseClients) {
      try {
        client.write(`data: ${payload}\n\n`);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  /**
   * Create and immediately broadcast a new announcement to all users
   */
  static async createAndBroadcast(input: CreateAnnouncementInput): Promise<IAnnouncement> {
    const announcement = await Announcement.create({
      title: input.title.trim(),
      message: input.message.trim(),
      type: input.type || 'info',
      status: 'active',
      createdBy: new Types.ObjectId(input.createdBy),
      createdByName: input.createdByName.trim() || 'Administrator',
      publishedAt: new Date(),
      expiresAt: input.expiresAt || null,
      dismissedCount: 0,
      viewCount: 0,
    });

    // Real-time instant delivery to all connected tabs
    this.broadcastToClients(announcement);

    return announcement;
  }

  /**
   * Fetch active, eligible announcements for a user/session.
   * Excludes dismissed announcements, expired announcements, or announcements older than 7 days.
   */
  static async getActiveAnnouncements(userId?: string): Promise<IAnnouncement[]> {
    const now = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Query active announcements within publication window
    const query: any = {
      status: 'active',
      publishedAt: { $gte: sevenDaysAgo, $lte: now },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    let dismissedIds: string[] = [];
    if (userId && Types.ObjectId.isValid(userId)) {
      const dismissals = await AnnouncementDismissal.find({
        userId: new Types.ObjectId(userId),
      }).select('announcementId');
      dismissedIds = dismissals.map((d) => d.announcementId.toString());
    }

    if (dismissedIds.length > 0) {
      query._id = { $nin: dismissedIds.map((id) => new Types.ObjectId(id)) };
    }

    return Announcement.find(query).sort({ publishedAt: -1 }).limit(10);
  }

  /**
   * Mark an announcement as dismissed by a user.
   * Increments dismissed count and creates user dismissal record if authenticated.
   */
  static async dismissAnnouncement(announcementId: string, userId?: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(announcementId)) {
      return false;
    }

    await Announcement.findByIdAndUpdate(announcementId, {
      $inc: { dismissedCount: 1 },
    });

    if (userId && Types.ObjectId.isValid(userId)) {
      try {
        await AnnouncementDismissal.updateOne(
          {
            announcementId: new Types.ObjectId(announcementId),
            userId: new Types.ObjectId(userId),
          },
          {
            $setOnInsert: {
              announcementId: new Types.ObjectId(announcementId),
              userId: new Types.ObjectId(userId),
              dismissedAt: new Date(),
            },
          },
          { upsert: true },
        );
      } catch {
        // Ignore duplicate key race conditions
      }
    }

    return true;
  }

  /**
   * Record that an announcement was viewed/displayed on screen
   */
  static async recordView(announcementId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(announcementId)) {
      return false;
    }

    await Announcement.findByIdAndUpdate(announcementId, {
      $inc: { viewCount: 1 },
    });

    return true;
  }

  /**
   * Fetch all announcements for administrative management
   */
  static async getAllAnnouncements(): Promise<IAnnouncement[]> {
    return Announcement.find().sort({ createdAt: -1 });
  }

  /**
   * Update announcement status (active/inactive/archived)
   */
  static async updateStatus(
    announcementId: string,
    status: AnnouncementStatus,
  ): Promise<IAnnouncement | null> {
    if (!Types.ObjectId.isValid(announcementId)) {
      return null;
    }

    return Announcement.findByIdAndUpdate(announcementId, { status }, { new: true });
  }

  /**
   * Delete an announcement and its dismissal records
   */
  static async deleteAnnouncement(announcementId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(announcementId)) {
      return false;
    }

    const res = await Announcement.findByIdAndDelete(announcementId);
    if (res) {
      await AnnouncementDismissal.deleteMany({
        announcementId: new Types.ObjectId(announcementId),
      });
      return true;
    }

    return false;
  }

  /**
   * Get connected SSE clients count (for stats/diagnostics)
   */
  static getConnectedClientsCount(): number {
    return this.sseClients.size;
  }

  /**
   * Reset test state (for Vitest test suites)
   */
  static resetTestState(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.sseClients.clear();
  }
}
