import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { LoveLetter } from '../src/models/LoveLetter.js';
import { DesignAsset } from '../src/models/DesignAsset.js';
import { StorageService } from '../src/services/storageService.js';
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
          recipientName: 'Someone Special',
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
        recipientName: 'Someone Special',
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
        recipientName: 'Someone Special',
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
      expect(callArg.letter.recipientName).toBe('Someone Special');
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
        recipientName: 'Someone Special',
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
        recipientName: 'Someone Special',
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

    it('blocks verifyPassword when letter is expired or still scheduled in the future', async () => {
      const expiredLetter: any = {
        publicToken: 'exp-pw-token',
        status: 'published',
        isPasswordProtected: true,
        passwordHash: 'hash',
        expiresAt: new Date(Date.now() - 60000),
      };
      const reqExp: any = { params: { token: 'exp-pw-token' }, body: { password: '123' } };
      const resExp: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      vi.spyOn(LoveLetter, 'findOne').mockResolvedValueOnce(expiredLetter);

      await LoveLinkController.verifyPassword(reqExp, resExp);
      expect(resExp.status).toHaveBeenCalledWith(410);

      const schedLetter: any = {
        publicToken: 'sched-pw-token',
        status: 'published',
        isPasswordProtected: true,
        passwordHash: 'hash',
        scheduledRevealAt: new Date(Date.now() + 60000),
      };
      const reqSched: any = { params: { token: 'sched-pw-token' }, body: { password: '123' } };
      const resSched: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      vi.spyOn(LoveLetter, 'findOne').mockResolvedValueOnce(schedLetter);

      await LoveLinkController.verifyPassword(reqSched, resSched);
      expect(resSched.status).toHaveBeenCalledWith(403);
    });

    it('allows recipient to submit reaction and reply note via submitReaction', async () => {
      const token = 'react-token';
      const mockLetter: any = {
        publicToken: token,
        status: 'published',
        recipientReaction: null,
        recipientReply: '',
        recipientRepliedAt: null,
        save: vi.fn().mockResolvedValue(true),
      };

      const req: any = {
        params: { token },
        body: { reaction: 'love', reply: 'Thank you so much, I love you too!' },
      };
      const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      vi.spyOn(LoveLetter, 'findOne').mockResolvedValueOnce(mockLetter);

      await LoveLinkController.submitReaction(req, res);
      expect(mockLetter.recipientReaction).toBe('love');
      expect(mockLetter.recipientReply).toBe('Thank you so much, I love you too!');
      expect(mockLetter.recipientRepliedAt).toBeInstanceOf(Date);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          recipientReaction: 'love',
          recipientReply: 'Thank you so much, I love you too!',
        }),
      );
    });

    it('uploads LoveLink photo or audio to R2 via StorageService.saveAsset and cleans up R2 on deleteLetter', async () => {
      const saveSpy = vi.spyOn(StorageService, 'saveAsset').mockResolvedValueOnce({
        storageKey: 'asset_user123_abc123.jpg',
        url: '/api/design-assets/files/asset_user123_abc123.jpg',
        thumbnailUrl: '/api/design-assets/files/thumbs/thumb_user123_abc123.webp',
        size: 4096,
      });
      vi.spyOn(DesignAsset, 'create').mockResolvedValueOnce({} as any);

      const uploadReq: any = {
        user: { userId: mockUserId.toString() },
        file: {
          buffer: Buffer.from('fake-jpeg'),
          originalname: 'memory.jpg',
          mimetype: 'image/jpeg',
        },
      };
      const uploadRes: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await (LoveLinkController as any).uploadMedia(uploadReq, uploadRes);
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          originalName: 'memory.jpg',
          mimeType: 'image/jpeg',
          userId: mockUserId.toString(),
        }),
      );
      expect(uploadRes.status).toHaveBeenCalledWith(201);
      expect(uploadRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          url: '/api/design-assets/files/asset_user123_abc123.jpg',
          storageKey: 'asset_user123_abc123.jpg',
        }),
      );

      // Verify deleteLetter cleans up R2 attachments and customMusicUrl
      const deleteR2Spy = vi.spyOn(StorageService, 'deleteAssetByUrl').mockResolvedValue();
      const letterId = new Types.ObjectId();
      vi.spyOn(LoveLetter, 'findOneAndDelete').mockResolvedValueOnce({
        _id: letterId,
        userId: mockUserId,
        attachments: ['/api/design-assets/files/asset_user123_abc123.jpg'],
        customization: { customMusicUrl: '/api/design-assets/files/asset_user123_song999.mp3' },
      } as any);

      const delReq: any = {
        user: { userId: mockUserId.toString() },
        params: { id: letterId.toString() },
      };
      const delRes: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await LoveLinkController.deleteLetter(delReq, delRes);
      expect(deleteR2Spy).toHaveBeenCalledWith('/api/design-assets/files/asset_user123_abc123.jpg');
      expect(deleteR2Spy).toHaveBeenCalledWith('/api/design-assets/files/asset_user123_song999.mp3');
    });
  });
});
