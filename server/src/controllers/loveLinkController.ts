import type { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { LoveLetter } from '../models/LoveLetter.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class LoveLinkController {
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

    const letter = new LoveLetter({
      userId,
      recipientName: recipientName.trim(),
      senderName: senderName?.trim() || '',
      isAnonymous: Boolean(isAnonymous),
      title: title?.trim() || '',
      message: message || '',
      template: template || 'classic',
      customization: customization || {},
      attachments: Array.isArray(attachments) ? attachments : [],
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
    if (customization !== undefined) letter.customization = { ...letter.customization, ...customization };
    if (attachments !== undefined) letter.attachments = attachments;
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

    const metrics = {
      total: letters.length,
      published: letters.filter((l) => l.status === 'published').length,
      drafts: letters.filter((l) => l.status === 'draft').length,
      opened: letters.filter((l) => Boolean(l.firstOpenedAt)).length,
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
        createdAt: letter.createdAt,
      },
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

    res.json({ success: true, message: 'Letter deleted' });
  }
}
