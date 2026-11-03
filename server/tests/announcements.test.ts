import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { AnnouncementService } from '../src/services/announcementService.js';
import { Announcement } from '../src/models/Announcement.js';
import { AnnouncementDismissal } from '../src/models/AnnouncementDismissal.js';

describe('VexoraMods Admin Broadcast Announcement System Suite', () => {
  const announcementsDb = new Map<string, any>();
  const dismissalsDb = new Map<string, any>();

  beforeEach(() => {
    announcementsDb.clear();
    dismissalsDb.clear();
    AnnouncementService.resetTestState();
    vi.restoreAllMocks();

    vi.spyOn(Announcement, 'create').mockImplementation((async (doc: any) => {
      const _id = new Types.ObjectId();
      const record: any = {
        _id,
        title: doc.title,
        message: doc.message,
        type: doc.type || 'info',
        status: doc.status || 'active',
        createdBy: doc.createdBy,
        createdByName: doc.createdByName,
        publishedAt: doc.publishedAt || new Date(),
        expiresAt: doc.expiresAt || null,
        dismissedCount: doc.dismissedCount || 0,
        viewCount: doc.viewCount || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        async save() {
          announcementsDb.set(this._id.toString(), this);
          return this;
        },
      };
      announcementsDb.set(_id.toString(), record);
      return record;
    }) as any);

    vi.spyOn(Announcement, 'find').mockImplementation(((query?: any) => {
      let results = Array.from(announcementsDb.values());
      if (query?.status) {
        results = results.filter((a) => a.status === query.status);
      }
      if (query?._id?.$nin) {
        const excludedIds = query._id.$nin.map((id: any) => id.toString());
        results = results.filter((a) => !excludedIds.includes(a._id.toString()));
      }
      if (query?.$or) {
        results = results.filter((a) => {
          if (!a.expiresAt) return true;
          return new Date(a.expiresAt) > new Date();
        });
      }
      const chain: any = {
        sort: () => chain,
        limit: () => results,
        then: (resolve: any) => resolve(results),
      };
      return chain;
    }) as any);

    vi.spyOn(Announcement, 'findById').mockImplementation(((id: any) => {
      const record = announcementsDb.get(id.toString()) || null;
      return Promise.resolve(record) as any;
    }) as any);

    vi.spyOn(Announcement, 'findByIdAndUpdate').mockImplementation(((id: any, update: any) => {
      const record = announcementsDb.get(id.toString());
      if (!record) return Promise.resolve(null) as any;
      if (update.$inc) {
        if (update.$inc.dismissedCount) record.dismissedCount += update.$inc.dismissedCount;
        if (update.$inc.viewCount) record.viewCount += update.$inc.viewCount;
      }
      if (update.status) {
        record.status = update.status;
      }
      return Promise.resolve(record) as any;
    }) as any);

    vi.spyOn(Announcement, 'findByIdAndDelete').mockImplementation(((id: any) => {
      const record = announcementsDb.get(id.toString());
      if (record) {
        announcementsDb.delete(id.toString());
        return Promise.resolve(record) as any;
      }
      return Promise.resolve(null) as any;
    }) as any);

    vi.spyOn(AnnouncementDismissal, 'find').mockImplementation(((query: any) => {
      const results: any[] = [];
      for (const d of dismissalsDb.values()) {
        if (d.userId.toString() === query.userId.toString()) {
          results.push(d);
        }
      }
      const chain: any = {
        select: () => results,
        then: (resolve: any) => resolve(results),
      };
      return chain;
    }) as any);

    vi.spyOn(AnnouncementDismissal, 'updateOne').mockImplementation((async (filter: any, update: any) => {
      const key = `${filter.announcementId.toString()}_${filter.userId.toString()}`;
      if (!dismissalsDb.has(key)) {
        dismissalsDb.set(key, {
          _id: new Types.ObjectId(),
          announcementId: filter.announcementId,
          userId: filter.userId,
          dismissedAt: update.$setOnInsert?.dismissedAt || new Date(),
        });
      }
      return { acknowledged: true };
    }) as any);

    vi.spyOn(AnnouncementDismissal, 'deleteMany').mockImplementation((async (filter: any) => {
      let count = 0;
      for (const [key, val] of dismissalsDb.entries()) {
        if (val.announcementId.toString() === filter.announcementId.toString()) {
          dismissalsDb.delete(key);
          count++;
        }
      }
      return { deletedCount: count };
    }) as any);
  });

  afterEach(() => {
    AnnouncementService.resetTestState();
  });

  it('1. Admin can create and broadcast an announcement with type, title, and message', async () => {
    const adminId = new Types.ObjectId().toString();
    const created = await AnnouncementService.createAndBroadcast({
      title: 'Scheduled System Maintenance',
      message: 'VexoraMods will undergo brief database upgrades on Sunday at 2:00 AM UTC.',
      type: 'warning',
      createdBy: adminId,
      createdByName: 'Lead Admin',
    });

    expect(created._id).toBeDefined();
    expect(created.title).toBe('Scheduled System Maintenance');
    expect(created.type).toBe('warning');
    expect(created.status).toBe('active');
    expect(created.createdByName).toBe('Lead Admin');
    expect(created.dismissedCount).toBe(0);
    expect(created.viewCount).toBe(0);
  });

  it('2. Active announcements are retrieved and eligible for unauthenticated or new users', async () => {
    const adminId = new Types.ObjectId().toString();
    await AnnouncementService.createAndBroadcast({
      title: 'Welcome to VexoraMods v2.5',
      message: 'Explore our latest free studio presets and OCR image tools!',
      type: 'info',
      createdBy: adminId,
      createdByName: 'Admin',
    });

    const activeList = await AnnouncementService.getActiveAnnouncements();
    expect(activeList).toHaveLength(1);
    expect(activeList[0]?.title).toBe('Welcome to VexoraMods v2.5');
  });

  it('3. Dismissing an announcement increments dismissal count and hides it from the user on subsequent fetches', async () => {
    const adminId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();

    const announcement = await AnnouncementService.createAndBroadcast({
      title: 'New Quiz Generator Live',
      message: 'Upload study notes and instantly generate practice quizzes.',
      type: 'success',
      createdBy: adminId,
      createdByName: 'Admin',
    });

    // Initial check: visible
    const initialList = await AnnouncementService.getActiveAnnouncements(userId);
    expect(initialList).toHaveLength(1);

    // Dismiss announcement
    const dismissed = await AnnouncementService.dismissAnnouncement(announcement._id.toString(), userId);
    expect(dismissed).toBe(true);

    const updatedDoc = await Announcement.findById(announcement._id);
    expect(updatedDoc?.dismissedCount).toBe(1);

    // After dismissal: filtered out for this user
    const subsequentList = await AnnouncementService.getActiveAnnouncements(userId);
    expect(subsequentList).toHaveLength(0);

    // Different user still sees the announcement
    const otherUserList = await AnnouncementService.getActiveAnnouncements(new Types.ObjectId().toString());
    expect(otherUserList).toHaveLength(1);
  });

  it('4. Expired announcements are excluded from active list', async () => {
    const adminId = new Types.ObjectId().toString();
    await AnnouncementService.createAndBroadcast({
      title: 'Flash Study Session',
      message: 'Join live collaborative quizzing in the community.',
      type: 'important',
      createdBy: adminId,
      createdByName: 'Admin',
      expiresAt: new Date(Date.now() - 60_000), // Expired 1 minute ago
    });

    const activeList = await AnnouncementService.getActiveAnnouncements();
    expect(activeList).toHaveLength(0);
  });

  it('5. Real-time Server-Sent Events (SSE) pushes announcements directly to connected client streams', async () => {
    const writtenMessages: string[] = [];
    const mockRes: any = {
      setHeader: vi.fn(),
      flushHeaders: vi.fn(),
      write: vi.fn((data: string) => {
        writtenMessages.push(data);
        return true;
      }),
      on: vi.fn(),
    };

    AnnouncementService.addSSEClient(mockRes);
    expect(AnnouncementService.getConnectedClientsCount()).toBe(1);
    expect(writtenMessages[0]).toContain('"type":"connected"');

    // Admin broadcasts announcement
    const adminId = new Types.ObjectId().toString();
    await AnnouncementService.createAndBroadcast({
      title: 'Critical Security Notice',
      message: 'Please review your emergency recovery codes in account settings.',
      type: 'important',
      createdBy: adminId,
      createdByName: 'Security Team',
    });

    expect(writtenMessages).toHaveLength(2);
    expect(writtenMessages[1]).toContain('"type":"new_announcement"');
    expect(writtenMessages[1]).toContain('Critical Security Notice');
  });

  it('6. Admin can manage status and delete announcements with associated dismissals', async () => {
    const adminId = new Types.ObjectId().toString();
    const announcement = await AnnouncementService.createAndBroadcast({
      title: 'Weekly Community Meetup',
      message: 'Join us on Discord this Friday.',
      type: 'info',
      createdBy: adminId,
      createdByName: 'Admin',
    });

    // Deactivate
    const updated = await AnnouncementService.updateStatus(announcement._id.toString(), 'inactive');
    expect(updated?.status).toBe('inactive');

    // Delete
    const deleted = await AnnouncementService.deleteAnnouncement(announcement._id.toString());
    expect(deleted).toBe(true);
    expect(await Announcement.findById(announcement._id)).toBeNull();
  });
});
