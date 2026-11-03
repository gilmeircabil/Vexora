import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { AIChatSession } from '../src/models/AIChatSession.js';
import { AIController } from '../src/controllers/aiController.js';

describe('AI Chat Session Backend Model & Controller Suite', () => {
  const userId = new Types.ObjectId();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('AIChatSession Schema & TTL Index', () => {
    it('defines the 12-day TTL index and compound recency index', () => {
      const indexes = AIChatSession.schema.indexes();

      // Verify TTL index: expireAfterSeconds = 12 * 24 * 60 * 60 = 1,036,800
      const ttlIndex = indexes.find(
        ([fields, options]) => fields.updatedAt === 1 && options?.expireAfterSeconds === 1036800,
      );
      expect(ttlIndex).toBeDefined();

      // Verify compound index: { userId: 1, updatedAt: -1 }
      const compoundIndex = indexes.find(
        ([fields]) => fields.userId === 1 && fields.updatedAt === -1,
      );
      expect(compoundIndex).toBeDefined();
    });

    it('enforces schema defaults and max lengths', () => {
      const doc = new AIChatSession({
        userId,
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello AI',
            timestamp: Date.now(),
            attachment: {
              name: 'document.txt',
              mimeType: 'text/plain',
              size: 1024,
            },
          },
        ],
      });

      expect(doc.title).toBe('New Conversation');
      expect(doc.selectedModel).toBe('gemini-3.5-flash-lite');
      expect(doc.messages.length).toBe(1);
      expect(doc.messages[0]!.attachment?.name).toBe('document.txt');
    });
  });

  describe('AIController Session Endpoints', () => {
    it('listChatSessions rejects unauthenticated requests with 401', async () => {
      const req: any = { user: undefined };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await AIController.listChatSessions(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('listChatSessions returns formatted session summaries', async () => {
      const mockSessions = [
        {
          _id: new Types.ObjectId(),
          title: 'Project Discussion',
          selectedModel: 'gemini-3.5-flash-lite',
          messages: [{ id: '1', role: 'user', content: 'What is Vexora?' }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(AIChatSession, 'find').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockSessions),
      } as any);

      const req: any = { user: { userId: userId.toString() } };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await AIController.listChatSessions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          sessions: [
            expect.objectContaining({
              id: mockSessions[0]!._id.toString(),
              title: 'Project Discussion',
              messageCount: 1,
              lastMessagePreview: 'What is Vexora?',
            }),
          ],
        },
      });
    });

    it('createChatSession creates a session and strips raw base64 data', async () => {
      vi.spyOn(AIChatSession, 'countDocuments').mockResolvedValue(0);

      const createdDoc = {
        _id: new Types.ObjectId(),
        title: 'Image Analysis',
        selectedModel: 'gemini-3.5-flash-lite',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Check this image',
            timestamp: Date.now(),
            attachment: {
              name: 'screenshot.png',
              mimeType: 'image/png',
              size: 2048,
            },
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(AIChatSession, 'create').mockResolvedValue(createdDoc as any);

      const req: any = {
        user: { userId: userId.toString() },
        body: {
          title: 'Image Analysis',
          messages: [
            {
              id: 'msg-1',
              role: 'user',
              content: 'Check this image',
              timestamp: Date.now(),
              // Simulating client sending attachment with raw base64Data
              attachment: {
                name: 'screenshot.png',
                mimeType: 'image/png',
                size: 2048,
                base64Data:
                  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                previewUrl: 'blob:http://localhost/1234',
              },
            },
          ],
        },
      };

      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await AIController.createChatSession(req, res);
      expect(res.status).toHaveBeenCalledWith(201);

      // Verify that AIChatSession.create was called with stripped attachment (no base64Data or previewUrl)
      expect(AIChatSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            expect.objectContaining({
              attachment: {
                name: 'screenshot.png',
                mimeType: 'image/png',
                size: 2048,
              },
            }),
          ],
        }),
      );
    });

    it('createChatSession auto-prunes oldest session when quota (25) is reached', async () => {
      // 25 existing sessions
      vi.spyOn(AIChatSession, 'countDocuments').mockResolvedValue(25);

      const oldestId = new Types.ObjectId();
      vi.spyOn(AIChatSession, 'find').mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([{ _id: oldestId }]),
      } as any);

      const deleteManySpy = vi.spyOn(AIChatSession, 'deleteMany').mockResolvedValue({} as any);

      const createdDoc = {
        _id: new Types.ObjectId(),
        title: 'New Session 26',
        selectedModel: 'gemini-3.5-flash-lite',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.spyOn(AIChatSession, 'create').mockResolvedValue(createdDoc as any);

      const req: any = {
        user: { userId: userId.toString() },
        body: { title: 'New Session 26' },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await AIController.createChatSession(req, res);
      expect(deleteManySpy).toHaveBeenCalledWith({ _id: { $in: [oldestId] } });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('deleteChatSession deletes a session by ID', async () => {
      const sessionId = new Types.ObjectId().toString();
      vi.spyOn(AIChatSession, 'findOneAndDelete').mockResolvedValue({ _id: sessionId } as any);

      const req: any = {
        user: { userId: userId.toString() },
        params: { sessionId },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await AIController.deleteChatSession(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Chat conversation deleted' }),
      );
    });
  });
});
