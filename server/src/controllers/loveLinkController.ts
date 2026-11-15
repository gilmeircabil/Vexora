import type { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { LoveLetter } from '../models/LoveLetter.js';
import { DesignAsset } from '../models/DesignAsset.js';
import { StorageService } from '../services/storageService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const MIME_EXT_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/webm': '.webm',
};

async function persistDataUriIfNeeded(val: string | undefined, userId: string): Promise<string> {
  if (!val || typeof val !== 'string' || !val.startsWith('data:')) return val || '';
  const match = val.match(/^data:((?:image|audio)\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return val;
  const mimeType = match[1]!;
  const buffer = Buffer.from(match[2]!, 'base64');
  const ext = MIME_EXT_MAP[mimeType] || (mimeType.startsWith('audio/') ? '.mp3' : '.jpg');
  const originalName = `lovelink_${Date.now()}${ext}`;
  const saved = await StorageService.saveAsset({
    buffer,
    originalName,
    mimeType,
    userId,
  });
  if (Types.ObjectId.isValid(userId)) {
    await DesignAsset.create({
      userId: new Types.ObjectId(userId),
      originalName,
      mimeType,
      size: saved.size,
      storageKey: saved.storageKey,
      url: saved.url,
      thumbnailUrl: saved.thumbnailUrl,
      width: saved.width,
      height: saved.height,
    }).catch(() => {});
  }
  return saved.url;
}

export class LoveLinkController {
  static async uploadMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const file = req.file;
      if (!file || !file.buffer) {
        res.status(400).json({ success: false, error: 'No media file uploaded' });
        return;
      }

      const saved = await StorageService.saveAsset({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        userId,
      });

      if (Types.ObjectId.isValid(userId)) {
        await DesignAsset.create({
          userId: new Types.ObjectId(userId),
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: saved.size,
          storageKey: saved.storageKey,
          url: saved.url,
          thumbnailUrl: saved.thumbnailUrl,
          width: saved.width,
          height: saved.height,
        }).catch(() => {});
      }

      res.status(201).json({
        success: true,
        url: saved.url,
        storageKey: saved.storageKey,
        size: saved.size,
      });
    } catch (err: any) {
      const isQuotaError = err.message && err.message.includes('safety cap');
      res.status(isQuotaError ? 413 : 500).json({
        success: false,
        error: err.message || 'Failed to upload media to R2',
      });
    }
  }
  static async createLetter(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const {
      recipientName,
      senderName,
      isAnonymous,
      title,
      message,
      template,
      customization,
      attachments,
      password,
      isPasswordProtected,
      scheduledRevealAt,
      expiresAt,
    } = req.body;

    if (!recipientName?.trim()) {
      res.status(400).json({ success: false, error: 'Recipient name is required' });
      return;
    }

    let passwordHash: string | null = null;
    if (isPasswordProtected && password?.trim()) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const resolvedAttachments = Array.isArray(attachments)
      ? await Promise.all(attachments.map((item: string) => persistDataUriIfNeeded(item, userId)))
      : [];
    const resolvedCustomization = { ...(customization || {}) };
    if (resolvedCustomization.customMusicUrl) {
      resolvedCustomization.customMusicUrl = await persistDataUriIfNeeded(
        resolvedCustomization.customMusicUrl,
        userId,
      );
    }

    const letter = new LoveLetter({
      userId,
      recipientName: recipientName.trim(),
      senderName: senderName?.trim() || '',
      isAnonymous: Boolean(isAnonymous),
      title: title?.trim() || '',
      message: message || '',
      template: template || 'classic',
      customization: resolvedCustomization,
      attachments: resolvedAttachments,
      status: 'draft',
      isPasswordProtected: Boolean(isPasswordProtected && passwordHash),
      passwordHash,
      scheduledRevealAt: scheduledRevealAt ? new Date(scheduledRevealAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    const saved = await letter.save();
    res.status(201).json({ success: true, letter: saved });
  }

  static async updateLetter(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const letter = await LoveLetter.findOne({ _id: id, userId });
    if (!letter) {
      res.status(404).json({ success: false, error: 'Letter not found' });
      return;
    }

    const {
      recipientName,
      senderName,
      isAnonymous,
      title,
      message,
      template,
      customization,
      attachments,
      password,
      isPasswordProtected,
      scheduledRevealAt,
      expiresAt,
    } = req.body;

    if (recipientName !== undefined) letter.recipientName = recipientName.trim();
    if (senderName !== undefined) letter.senderName = senderName.trim();
    if (isAnonymous !== undefined) letter.isAnonymous = Boolean(isAnonymous);
    if (title !== undefined) letter.title = title.trim();
    if (message !== undefined) letter.message = message;
    if (template !== undefined) letter.template = template;
    if (customization !== undefined) {
      const prevMusicUrl = (letter.customization as any)?.customMusicUrl;
      const nextCust = { ...letter.customization, ...customization } as any;
      if (nextCust.customMusicUrl) {
        nextCust.customMusicUrl = await persistDataUriIfNeeded(nextCust.customMusicUrl, userId);
      }
      if (prevMusicUrl && prevMusicUrl !== nextCust.customMusicUrl) {
        await StorageService.deleteAssetByUrl(prevMusicUrl);
      }
      letter.customization = nextCust;
    }
    if (attachments !== undefined && Array.isArray(attachments)) {
      const prevAttachments = Array.isArray(letter.attachments) ? letter.attachments : [];
      const nextAttachments = await Promise.all(
        attachments.map((item: string) => persistDataUriIfNeeded(item, userId)),
      );
      for (const oldUrl of prevAttachments) {
        if (!nextAttachments.includes(oldUrl)) {
          await StorageService.deleteAssetByUrl(oldUrl);
        }
      }
      letter.attachments = nextAttachments;
    }
    if (scheduledRevealAt !== undefined) letter.scheduledRevealAt = scheduledRevealAt ? new Date(scheduledRevealAt) : null;
    if (expiresAt !== undefined) letter.expiresAt = expiresAt ? new Date(expiresAt) : null;

    if (isPasswordProtected !== undefined) {
      letter.isPasswordProtected = Boolean(isPasswordProtected);
      if (letter.isPasswordProtected && password?.trim()) {
        letter.passwordHash = await bcrypt.hash(password.trim(), 10);
      } else if (!letter.isPasswordProtected) {
        letter.passwordHash = null;
      }
    }

    const updated = await letter.save();
    res.json({ success: true, letter: updated });
  }

  static async publishLetter(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const letter = await LoveLetter.findOne({ _id: id, userId });
    if (!letter) {
      res.status(404).json({ success: false, error: 'Letter not found' });
      return;
    }

    if (!letter.publicToken) {
      letter.publicToken = crypto.randomBytes(16).toString('hex');
    }
    letter.status = 'published';
    await letter.save();

    const publicUrl = `/lovelink/open/${letter.publicToken}`;
    res.json({ success: true, letter, publicToken: letter.publicToken, publicUrl });
  }

  static async getUserLetters(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { status, search, sort } = req.query;
    const filter: Record<string, any> = { userId };
    if (status && status !== 'all') filter.status = status;
    if (search && typeof search === 'string') {
      filter.$or = [
        { recipientName: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption: Record<string, any> = sort === 'opened' ? { firstOpenedAt: -1 } : { createdAt: -1 };
    const letters = await LoveLetter.find(filter).sort(sortOption);

    const hasFilter = (status && status !== 'all') || (search && typeof search === 'string');
    const metricSource = hasFilter ? await LoveLetter.find({ userId }) : letters;

    const metrics = {
      total: metricSource.length,
      published: metricSource.filter((l) => l.status === 'published').length,
      drafts: metricSource.filter((l) => l.status === 'draft').length,
      opened: metricSource.filter((l) => Boolean(l.firstOpenedAt)).length,
    };

    res.json({ success: true, letters, metrics });
  }

  static async getPublicLetter(req: Request, res: Response): Promise<void> {
    const { token } = req.params;
    const letter = await LoveLetter.findOne({ publicToken: token, status: 'published' });
    if (!letter) {
      res.status(404).json({ success: false, error: 'Letter not found or access revoked.' });
      return;
    }

    const now = new Date();
    if (letter.expiresAt && new Date(letter.expiresAt) < now) {
      res.status(410).json({ success: false, error: 'This letter has expired and is no longer available.' });
      return;
    }

    if (letter.scheduledRevealAt && new Date(letter.scheduledRevealAt) > now) {
      res.json({
        success: true,
        letter: {
          publicToken: letter.publicToken,
          recipientName: letter.recipientName,
          senderName: letter.isAnonymous ? 'A Secret Admirer' : letter.senderName,
          template: letter.template,
          customization: letter.customization,
          isScheduled: true,
          scheduledRevealAt: letter.scheduledRevealAt,
        },
      });
      return;
    }

    if (letter.isPasswordProtected) {
      res.json({
        success: true,
        letter: {
          publicToken: letter.publicToken,
          recipientName: letter.recipientName,
          senderName: letter.isAnonymous ? 'A Secret Admirer' : letter.senderName,
          template: letter.template,
          customization: letter.customization,
          isPasswordProtected: true,
          isLocked: true,
        },
      });
      return;
    }

    res.json({
      success: true,
      letter: {
        publicToken: letter.publicToken,
        recipientName: letter.recipientName,
        senderName: letter.isAnonymous ? 'A Secret Admirer' : letter.senderName,
        isAnonymous: letter.isAnonymous,
        title: letter.title,
        message: letter.message,
        template: letter.template,
        customization: letter.customization,
        attachments: letter.attachments,
        isPasswordProtected: false,
        isLocked: false,
        scheduledRevealAt: letter.scheduledRevealAt,
        expiresAt: letter.expiresAt,
        firstOpenedAt: letter.firstOpenedAt,
        recipientReaction: letter.recipientReaction || null,
        recipientReply: letter.recipientReply || '',
        recipientRepliedAt: letter.recipientRepliedAt || null,
        createdAt: letter.createdAt,
      },
    });
  }

  static async verifyPassword(req: Request, res: Response): Promise<void> {
    const { token } = req.params;
    const { password } = req.body;

    const letter = await LoveLetter.findOne({ publicToken: token, status: 'published' });
    if (!letter || !letter.isPasswordProtected || !letter.passwordHash) {
      res.status(404).json({ success: false, error: 'Letter not found or not password protected.' });
      return;
    }

    const now = new Date();
    if (letter.expiresAt && new Date(letter.expiresAt) < now) {
      res.status(410).json({ success: false, error: 'This letter has expired and is no longer available.' });
      return;
    }
    if (letter.scheduledRevealAt && new Date(letter.scheduledRevealAt) > now) {
      res.status(403).json({ success: false, error: 'This letter is still scheduled for a future reveal.' });
      return;
    }

    const isValid = await bcrypt.compare(password || '', letter.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
      return;
    }

    if (!letter.firstOpenedAt) letter.firstOpenedAt = new Date();
    letter.openCount = (letter.openCount || 0) + 1;
    await letter.save();

    res.json({
      success: true,
      letter: {
        publicToken: letter.publicToken,
        recipientName: letter.recipientName,
        senderName: letter.isAnonymous ? 'A Secret Admirer' : letter.senderName,
        isAnonymous: letter.isAnonymous,
        title: letter.title,
        message: letter.message,
        template: letter.template,
        customization: letter.customization,
        attachments: letter.attachments,
        isPasswordProtected: true,
        isLocked: false,
        firstOpenedAt: letter.firstOpenedAt,
        recipientReaction: letter.recipientReaction || null,
        recipientReply: letter.recipientReply || '',
        recipientRepliedAt: letter.recipientRepliedAt || null,
        createdAt: letter.createdAt,
      },
    });
  }

  static async submitReaction(req: Request, res: Response): Promise<void> {
    const { token } = req.params;
    const { reaction, reply } = req.body || {};

    const letter = await LoveLetter.findOne({ publicToken: token, status: 'published' });
    if (!letter) {
      res.status(404).json({ success: false, error: 'Letter not found' });
      return;
    }

    if (reaction !== undefined) {
      letter.recipientReaction = typeof reaction === 'string' ? reaction.slice(0, 32) : null;
    }
    if (reply !== undefined) {
      letter.recipientReply = typeof reply === 'string' ? reply.trim().slice(0, 500) : '';
    }
    letter.recipientRepliedAt = new Date();
    await letter.save();

    res.json({
      success: true,
      recipientReaction: letter.recipientReaction,
      recipientReply: letter.recipientReply,
      recipientRepliedAt: letter.recipientRepliedAt,
    });
  }

  static async recordOpen(req: Request, res: Response): Promise<void> {
    const { token } = req.params;
    const letter = await LoveLetter.findOne({ publicToken: token, status: 'published' });
    if (!letter) {
      res.status(404).json({ success: false, error: 'Letter not found' });
      return;
    }

    if (!letter.firstOpenedAt) letter.firstOpenedAt = new Date();
    letter.openCount = (letter.openCount || 0) + 1;
    await letter.save();

    res.json({ success: true, firstOpenedAt: letter.firstOpenedAt, openCount: letter.openCount });
  }

  static async revokeLetter(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const letter = await LoveLetter.findOne({ _id: id, userId });
    if (!letter) {
      res.status(404).json({ success: false, error: 'Letter not found' });
      return;
    }

    letter.status = 'revoked';
    await letter.save();
    res.json({ success: true, message: 'Letter access revoked' });
  }

  static async deleteLetter(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const deleted = await LoveLetter.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Letter not found' });
      return;
    }

    const urlsToClean = [
      ...(Array.isArray(deleted.attachments) ? deleted.attachments : []),
      (deleted.customization as any)?.customMusicUrl,
    ].filter(Boolean);
    await Promise.allSettled(urlsToClean.map((u) => StorageService.deleteAssetByUrl(u)));

    res.json({ success: true, message: 'Letter deleted' });
  }
}
