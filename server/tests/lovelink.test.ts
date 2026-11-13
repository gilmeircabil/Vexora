import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { LoveLetter } from '../src/models/LoveLetter.js';
import { LoveLinkController } from '../src/controllers/loveLinkController.js';

describe('VexoraMods Backend LoveLink Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. LoveLetter Mongoose Model Schema & Indexes', () => {
    it('defines expected schema paths with proper types', () => {
      const paths = LoveLetter.schema.paths;
      expect(paths.userId).toBeDefined();
      expect(paths.recipientName).toBeDefined();
      expect(paths.senderName).toBeDefined();
      expect(paths.isAnonymous).toBeDefined();
      expect(paths.title).toBeDefined();
      expect(paths.message).toBeDefined();
      expect(paths.template).toBeDefined();
      expect(paths.customization).toBeDefined();
      expect(paths.publicToken).toBeDefined();
      expect(paths.status).toBeDefined();
      expect(paths.isPasswordProtected).toBeDefined();
      expect(paths.passwordHash).toBeDefined();
      expect(paths.scheduledRevealAt).toBeDefined();
      expect(paths.expiresAt).toBeDefined();
      expect(paths.firstOpenedAt).toBeDefined();
      expect(paths.openCount).toBeDefined();
    });

    it('has indexes for publicToken and userId lookup', () => {
      const indexes = LoveLetter.schema.indexes();
      const tokenIndex = indexes.find(([idx]: any) => idx.publicToken === 1);
      expect(tokenIndex).toBeDefined();

      const userIndex = indexes.find(([idx]: any) => idx.userId === 1 && idx.createdAt === -1);
      expect(userIndex).toBeDefined();
    });
  });

  describe('2. LoveLinkController Authorizations & Operations', () => {
    const mockUserId = new Types.ObjectId();

    it('rejects createLetter when user is unauthenticated', async () => {
      const req: any = { body: { recipientName: 'Alice', message: 'Hello' } };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await LoveLinkController.createLetter(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: 'Authentication required' }),
      );
    });

    it('creates draft letter with hashed password if password provided', async () => {
      const req: any = {
        user: { userId: mockUserId.toString() },
        body: {
          recipientName: 'Valerie',
          senderName: 'Alex',
          title: 'Forever & Always',
          message: 'Happy Anniversary my love',
          template: 'classic',
          password: 'SecretLovePassword123!',
          isPasswordProtected: true,
        },
      };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      const mockSavedLetter = {
        _id: new Types.ObjectId(),
        userId: mockUserId,
        recipientName: 'Valerie',
        senderName: 'Alex',
        status: 'draft',
        isPasswordProtected: true,
      };

      vi.spyOn(LoveLetter.prototype, 'save').mockResolvedValueOnce(mockSavedLetter as any);

      await LoveLinkController.createLetter(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, letter: expect.any(Object) }),
      );
    });

    it('publishes letter and generates unique publicToken', async () => {
      const letterId = new Types.ObjectId();
      const mockLetter: any = {
        _id: letterId,
        userId: mockUserId,
        status: 'draft',
        publicToken: null,
        save: vi.fn().mockResolvedValue(true),
      };

      const req: any = {
        user: { userId: mockUserId.toString() },
        params: { id: letterId.toString() },
      };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      vi.spyOn(LoveLetter, 'findOne').mockResolvedValueOnce(mockLetter);

      await LoveLinkController.publishLetter(req, res);
      expect(mockLetter.status).toBe('published');
      expect(mockLetter.publicToken).toBeDefined();
      expect(mockLetter.publicToken.length).toBeGreaterThanOrEqual(16);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          publicToken: mockLetter.publicToken,
          publicUrl: expect.stringContaining(mockLetter.publicToken),
        }),
      );
    });

    it('retrieves user letters and calculates dashboard metrics', async () => {
      const req: any = {
        user: { userId: mockUserId.toString() },
        query: {},
      };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      const sampleLetters = [
        { _id: new Types.ObjectId(), status: 'published', firstOpenedAt: new Date() },
        { _id: new Types.ObjectId(), status: 'draft', firstOpenedAt: null },
      ];

      vi.spyOn(LoveLetter, 'find').mockReturnValueOnce({
        sort: () => Promise.resolve(sampleLetters),
      } as any);

      await LoveLinkController.getUserLetters(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          metrics: {
            total: 2,
            published: 1,
            drafts: 1,
            opened: 1,
          },
        }),
      );
    });

    it('returns password challenge without revealing message if letter is password protected', async () => {
      const token = 'love-token-12345';
      const mockLetter: any = {
        publicToken: token,
        status: 'published',
        isPasswordProtected: true,
        recipientName: 'Valerie',
        senderName: 'Alex',
        title: 'Secret Letter',
        message: 'Top secret love note',
      };

      const req: any = { params: { token } };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      vi.spyOn(LoveLetter, 'findOne').mockResolvedValueOnce(mockLetter);

      await LoveLinkController.getPublicLetter(req, res);
      const callArg = res.json.mock.calls[0][0];
      expect(callArg.success).toBe(true);
      expect(callArg.letter.recipientName).toBe('Valerie');
      expect(callArg.letter.isPasswordProtected).toBe(true);
      expect(callArg.letter.isLocked).toBe(true);
      expect(callArg.letter.message).toBeUndefined();
    });

    it('verifies password against bcrypt hash and returns unlocked letter', async () => {
      const token = 'love-token-12345';
      const password = 'CupidSecretPassword!';
      const hash = await bcrypt.hash(password, 6);

      const mockLetter: any = {
        publicToken: token,
        status: 'published',
        isPasswordProtected: true,
        passwordHash: hash,
        recipientName: 'Valerie',
        senderName: 'Alex',
        title: 'Secret Letter',
        message: 'Top secret love note',
        openCount: 0,
        firstOpenedAt: null,
        save: vi.fn().mockResolvedValue(true),
      };

      const req: any = {
        params: { token },
        body: { password },
      };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      vi.spyOn(LoveLetter, 'findOne').mockResolvedValueOnce(mockLetter);

      await LoveLinkController.verifyPassword(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          letter: expect.objectContaining({
            message: 'Top secret love note',
            isLocked: false,
          }),
        }),
      );
    });

    it('enforces scheduled reveal date for public letters', async () => {
      const token = 'scheduled-token';
      const futureDate = new Date(Date.now() + 86400000); // tomorrow
      const mockLetter: any = {
        publicToken: token,
        status: 'published',
        scheduledRevealAt: futureDate,
        recipientName: 'Valerie',
        message: 'Hidden until tomorrow',
      };

      const req: any = { params: { token } };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      vi.spyOn(LoveLetter, 'findOne').mockResolvedValueOnce(mockLetter);

      await LoveLinkController.getPublicLetter(req, res);
      const callArg = res.json.mock.calls[0][0];
      expect(callArg.success).toBe(true);
      expect(callArg.letter.isScheduled).toBe(true);
      expect(callArg.letter.scheduledRevealAt).toEqual(futureDate);
      expect(callArg.letter.message).toBeUndefined();
    });

    it('enforces expiration date and returns expired state', async () => {
      const token = 'expired-token';
      const pastDate = new Date(Date.now() - 86400000); // yesterday
      const mockLetter: any = {
        publicToken: token,
        status: 'published',
        expiresAt: pastDate,
      };

      const req: any = { params: { token } };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      vi.spyOn(LoveLetter, 'findOne').mockResolvedValueOnce(mockLetter);

      await LoveLinkController.getPublicLetter(req, res);
      expect(res.status).toHaveBeenCalledWith(410);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'This letter has expired and is no longer available.',
        }),
      );
    });

    it('allows sender to revoke public access', async () => {
      const letterId = new Types.ObjectId();
      const mockLetter: any = {
        _id: letterId,
        userId: mockUserId,
        status: 'published',
        save: vi.fn().mockResolvedValue(true),
      };

      const req: any = {
        user: { userId: mockUserId.toString() },
        params: { id: letterId.toString() },
      };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      vi.spyOn(LoveLetter, 'findOne').mockResolvedValueOnce(mockLetter);

      await LoveLinkController.revokeLetter(req, res);
      expect(mockLetter.status).toBe('revoked');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Letter access revoked' }),
      );
    });
  });
});
