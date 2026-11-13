import path from 'node:path';
import fs from 'node:fs';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AIService } from '../services/ai/aiService.js';
import { GeminiTextService } from '../services/ai/geminiTextService.js';
import { AIJob } from '../models/AIJob.js';
import { StorageService } from '../services/storageService.js';
import {
  AIChatSession,
  type IChatMessageItem,
  type IChatAttachmentMeta,
} from '../models/AIChatSession.js';

const MAX_SESSIONS_PER_USER = 25;
const MAX_MESSAGES_PER_SESSION = 50;
const MAX_MESSAGE_CONTENT_LENGTH = 15000;

function sanitizeChatMessage(msg: any): IChatMessageItem {
  const id = typeof msg?.id === 'string' && msg.id.trim() ? msg.id.trim() : 'msg-' + Date.now();
  const role: 'user' | 'model' = msg?.role === 'user' ? 'user' : 'model';
  const content =
    typeof msg?.content === 'string' ? msg.content.slice(0, MAX_MESSAGE_CONTENT_LENGTH) : '';
  const timestamp = typeof msg?.timestamp === 'number' ? msg.timestamp : Date.now();

  let attachment: IChatAttachmentMeta | undefined = undefined;
  if (msg?.attachment && typeof msg.attachment === 'object') {
    const name =
      typeof msg.attachment.name === 'string' ? msg.attachment.name.slice(0, 255) : 'file';
    const mimeType =
      typeof msg.attachment.mimeType === 'string'
        ? msg.attachment.mimeType.slice(0, 100)
        : 'application/octet-stream';
    const size = typeof msg.attachment.size === 'number' ? msg.attachment.size : 0;
    // Raw base64 data and image previews are stripped to protect MongoDB free-tier storage
    attachment = { name, mimeType, size };
  }

  return { id, role, content, timestamp, attachment };
}

async function enforceUserSessionQuota(userId: Types.ObjectId): Promise<void> {
  const count = await AIChatSession.countDocuments({ userId });
  if (count >= MAX_SESSIONS_PER_USER) {
    const excess = count - MAX_SESSIONS_PER_USER + 1;
    const oldestSessions = await AIChatSession.find({ userId })
      .sort({ updatedAt: 1 })
      .limit(excess)
      .select('_id')
      .lean();
    if (oldestSessions.length > 0) {
      const idsToDelete = oldestSessions.map((s) => s._id);
      await AIChatSession.deleteMany({ _id: { $in: idsToDelete } });
    }
  }
}

export class AIController {
  // ---------------------------------------------
  // Live Model Health
  // ---------------------------------------------
  static async getModelStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await AIService.getModelStatus();
      res.status(200).json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // ---------------------------------------------
  // 1. AI Image Enhancer
  // ---------------------------------------------
  static async enhance(req: any, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'Please provide an image file to enhance.' });
        return;
      }

      const mode = (req.body.mode || 'enhance') as any;
      const scale = req.body.scale ? parseInt(req.body.scale, 10) : 2;
      const quality = req.body.quality || 'balanced';
      const toolId = req.body.toolId || 'ai-image-enhancer';
      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

      const result = await AIService.processEnhancement({
        userId: req.user?.userId,
        toolId,
        fileBuffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        options: { mode, scale, quality },
        idempotencyKey,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Image enhancement failed',
      });
    }
  }

  // ---------------------------------------------
  // 2. AI Background Remover
  // ---------------------------------------------
  static async removeBackground(req: any, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'Please upload an image file.' });
        return;
      }

      const bgColor = req.body.bgColor;
      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

      const result = await AIService.processBackgroundRemoval({
        userId: req.user?.userId,
        toolId: 'ai-background-remover',
        fileBuffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        bgColor,
        idempotencyKey,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Background removal failed',
      });
    }
  }

  // ---------------------------------------------
  // 3. AI Object Remover
  // ---------------------------------------------
  static async removeObject(req: any, res: Response): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFile = files?.image?.[0];
      const maskFile = files?.mask?.[0];

      if (!imageFile || !maskFile) {
        res.status(400).json({ success: false, error: 'Both image and mask files are required.' });
        return;
      }

      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

      const result = await AIService.processObjectRemoval({
        userId: req.user?.userId,
        toolId: 'ai-object-remover',
        imageBuffer: imageFile.buffer,
        maskBuffer: maskFile.buffer,
        imageName: imageFile.originalname,
        idempotencyKey,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Object removal failed',
      });
    }
  }

  // ---------------------------------------------
  // 4. AI Photo Restoration
  // ---------------------------------------------
  static async restorePhoto(req: any, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'Please upload an image to restore.' });
        return;
      }

      const denoiseStrength = req.body.denoiseStrength ? parseFloat(req.body.denoiseStrength) : 1.0;
      const colorize = req.body.colorize === 'true' || req.body.colorize === true;
      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

      const result = await AIService.processPhotoRestoration({
        userId: req.user?.userId,
        toolId: 'ai-photo-restoration',
        fileBuffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        denoiseStrength,
        colorize,
        idempotencyKey,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Photo restoration failed',
      });
    }
  }

  // ---------------------------------------------
  // 5. AI OCR
  // ---------------------------------------------
  static async ocr(req: any, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'Please upload a PDF or image file.' });
        return;
      }

      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

      const result = await AIService.processOcr({
        userId: req.user?.userId,
        toolId: 'ai-ocr',
        fileBuffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        idempotencyKey,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'OCR processing failed',
      });
    }
  }

  // ---------------------------------------------
  // 6. AI Code Explainer & Bug Debugger
  // ---------------------------------------------
  static async explainCode(req: any, res: Response): Promise<void> {
    try {
      const { code, language = 'javascript', mode = 'explain', context = '' } = req.body;
      if (!code || typeof code !== 'string') {
        res.status(400).json({ success: false, error: 'Please provide code to analyze.' });
        return;
      }

      let systemPrompt =
        'You are an expert software engineer and code reviewer. Provide clear, accurate, and structured markdown explanations with syntax highlighting.';
      let userPrompt = '';

      if (mode === 'debug') {
        systemPrompt =
          'You are an expert debugger. Analyze the provided code and error, identify the root cause, provide the exact fixed code, and explain why the fix works.';
        userPrompt = `Language: ${language}\n\nContext / Error Message:\n${context || 'Identify and fix any bugs in this snippet.'}\n\nCode to debug:\n\`\`\`${language}\n${code}\n\`\`\``;
      } else {
        userPrompt = `Language: ${language}\n\nContext:\n${context || 'General code walkthrough'}\n\nCode to explain:\n\`\`\`${language}\n${code}\n\`\`\`\n\nExplain: 1) What this code does high-level, 2) Step-by-step logic walkthrough, 3) Time/Space complexity, 4) Potential optimizations or edge cases.`;
      }

      const result = await GeminiTextService.generate({
        prompt: userPrompt,
        systemPrompt,
        temperature: 0.3,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Code explanation failed',
      });
    }
  }

  // ---------------------------------------------
  // 7. AI Document Summarizer & Q&A
  // ---------------------------------------------
  static async summarizeDocument(req: any, res: Response): Promise<void> {
    try {
      const { text, mode = 'summary', question = '' } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ success: false, error: 'Please provide document text.' });
        return;
      }

      let systemPrompt =
        'You are an expert research analyst and technical document summarizer. Respond with clean, well-formatted markdown.';
      let prompt = '';

      if (mode === 'qa' && question) {
        systemPrompt =
          'You are a precise document Q&A assistant. Answer user questions strictly based on the provided document content. If not mentioned in the document, state so clearly.';
        prompt = `Document Content:\n"""\n${text}\n"""\n\nQuestion: ${question}\n\nAnswer:`;
      } else {
        prompt = `Please summarize the following document:\n"""\n${text}\n"""\n\nFormat your response with: 1) Executive Summary (2-3 sentences), 2) Key Takeaways (bullet points), 3) Action Items or Notable Conclusions.`;
      }

      const result = await GeminiTextService.generate({
        prompt,
        systemPrompt,
        temperature: 0.4,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Document summarization failed',
      });
    }
  }

  // ---------------------------------------------
  // 8. AI Writing Assistant & ATS Resume Builder
  // ---------------------------------------------
  static async assistWriting(req: any, res: Response): Promise<void> {
    try {
      const { text, mode = 'rewrite', tone = 'professional', targetRole = '' } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ success: false, error: 'Please provide text to process.' });
        return;
      }

      let systemPrompt =
        'You are an expert editor and career coach. Return polished, impactful writing formatted in markdown.';
      let prompt = '';

      if (mode === 'resume') {
        systemPrompt =
          'You are an expert ATS (Applicant Tracking System) resume strategist. Rewrite experience, summaries, and achievements using strong action verbs, quantifiable metrics, and industry keywords.';
        prompt = `Target Role: ${targetRole || 'Not specified'}\n\nResume draft / experience bullets:\n"""\n${text}\n"""\n\nPlease provide: 1) Polished, high-impact ATS-optimized bullet points, 2) Keyword suggestions for this role, 3) Concise Professional Summary.`;
      } else {
        prompt = `Tone: ${tone}\n\nOriginal Text:\n"""\n${text}\n"""\n\nPlease rewrite this text to be clear, engaging, and grammatically flawless in the requested tone. Provide: 1) The polished version, 2) An alternative punchier version, 3) Key improvements made.`;
      }

      const result = await GeminiTextService.generate({
        prompt,
        systemPrompt,
        temperature: 0.6,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Writing assistance failed',
      });
    }
  }

  // ---------------------------------------------
  // 9. AI Chat & Real-Time Streaming
  // ---------------------------------------------
  static async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { messages, systemPrompt, temperature, maxTokens, model, provider, attachments } =
        req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ success: false, error: 'Please provide messages array.' });
        return;
      }

      const result = await GeminiTextService.chat({
        messages,
        systemPrompt,
        temperature,
        maxTokens,
        model,
        provider,
        attachments,
      });

      res.status(200).json({
        success: true,
        data: {
          message: result.text,
          provider: result.provider,
          model: result.model,
          tokensUsed: result.tokensUsed,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'AI Chat generation failed',
      });
    }
  }

  static async streamChat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { messages, systemPrompt, temperature, maxTokens, model, provider, attachments } =
        req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ success: false, error: 'Please provide messages array.' });
        return;
      }

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      const result = await GeminiTextService.streamChat(
        {
          messages,
          systemPrompt,
          temperature,
          maxTokens,
          model,
          provider,
          attachments,
        },
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          (res as any).flush?.();
        },
      );

      res.write(
        `data: ${JSON.stringify({ done: true, provider: result.provider, model: result.model })}\n\n`,
      );
      res.end();
    } catch (err: any) {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: err.message || 'AI streaming failed',
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error occurred' })}\n\n`);
        res.end();
      }
    }
  }

  // ---------------------------------------------
  // Jobs & History
  // ---------------------------------------------
  static async getJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const rawId = req.params.jobId;
      const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;
      const jobId = cleanId || '';

      if (!jobId || !Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ success: false, error: 'Invalid Job ID' });
        return;
      }

      const job = await AIJob.findById(new Types.ObjectId(jobId)).lean();

      if (!job) {
        res.status(404).json({ success: false, error: 'Job not found.' });
        return;
      }

      res.status(200).json({ success: true, data: job });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to retrieve job status' });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.userId ? new Types.ObjectId(req.user.userId) : undefined;
      const query = uid ? { userId: uid } : {};
      const jobs = await AIJob.find(query).sort({ createdAt: -1 }).limit(40).lean();

      res.status(200).json({
        success: true,
        data: { jobs },
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to retrieve AI history' });
    }
  }

  static async deleteHistoryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const rawJobId = req.params.id;
      const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
      if (!jobId || !Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ success: false, error: 'Valid job ID is required.' });
        return;
      }

      const uid = req.user?.userId ? new Types.ObjectId(req.user.userId) : undefined;
      const query: any = { _id: new Types.ObjectId(jobId) };
      if (uid) {
        query.userId = uid;
      }

      const job = await AIJob.findOne(query);
      if (!job) {
        res.status(404).json({ success: false, error: 'History item not found.' });
        return;
      }

      if (job.outputUrl) {
        if (job.outputUrl.includes('/api/ai/download/')) {
          const filename = path.basename(job.outputUrl);
          const filepath = path.resolve(process.cwd(), 'server', 'uploads', 'processed', filename);
          if (fs.existsSync(filepath)) {
            fs.unlink(filepath, () => {});
          }
        } else {
          await StorageService.deleteAssetByUrl(job.outputUrl);
        }
      }

      await AIJob.deleteOne({ _id: job._id });
      res.status(200).json({ success: true, message: 'History item deleted successfully.' });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to delete history item.' });
    }
  }

  static async clearHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.userId ? new Types.ObjectId(req.user.userId) : undefined;
      const query = uid ? { userId: uid } : {};
      const jobs = await AIJob.find(query);

      for (const job of jobs) {
        if (job.outputUrl) {
          if (job.outputUrl.includes('/api/ai/download/')) {
            const filename = path.basename(job.outputUrl);
            const filepath = path.resolve(process.cwd(), 'server', 'uploads', 'processed', filename);
            if (fs.existsSync(filepath)) {
              fs.unlink(filepath, () => {});
            }
          } else {
            await StorageService.deleteAssetByUrl(job.outputUrl);
          }
        }
      }

      await AIJob.deleteMany(query);
      res.status(200).json({ success: true, message: 'All processing history cleared.' });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to clear history.' });
    }
  }

  static async downloadResult(req: Request, res: Response): Promise<void> {
    const rawFilename = req.params.filename;
    const cleanFilename = Array.isArray(rawFilename) ? rawFilename[0] : rawFilename;
    const filename = path.basename(cleanFilename || '');

    if (!filename) {
      res.status(400).json({ success: false, error: 'Filename is required.' });
      return;
    }

    const filepath = path.resolve(process.cwd(), 'server', 'uploads', 'processed', filename);

    if (!fs.existsSync(filepath)) {
      res.status(404).json({ success: false, error: 'File not found or expired.' });
      return;
    }

    res.sendFile(filepath);
  }

  // ---------------------------------------------
  // 10. AI Chat Cloud Sessions (Per User Account)
  // ---------------------------------------------
  static async listChatSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const userId = new Types.ObjectId(req.user.userId);
      const rawSessions = await AIChatSession.find({ userId })
        .select('_id title selectedModel messages createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .lean();

      const sessions = rawSessions.map((s) => ({
        id: s._id.toString(),
        title: s.title,
        selectedModel: s.selectedModel,
        messageCount: s.messages?.length || 0,
        lastMessagePreview: s.messages?.[s.messages.length - 1]?.content?.slice(0, 80) || '',
        createdAt: s.createdAt ? new Date(s.createdAt).getTime() : Date.now(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt).getTime() : Date.now(),
      }));

      res.status(200).json({ success: true, data: { sessions } });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to list chat sessions' });
    }
  }

  static async getChatSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const rawId = req.params.sessionId;
      const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;
      const sessionId = cleanId || '';

      if (!sessionId || !Types.ObjectId.isValid(sessionId)) {
        res.status(400).json({ success: false, error: 'Invalid Session ID' });
        return;
      }

      const userId = new Types.ObjectId(req.user.userId);
      const session = await AIChatSession.findOne({
        _id: new Types.ObjectId(sessionId),
        userId,
      }).lean();

      if (!session) {
        res.status(404).json({ success: false, error: 'Chat conversation not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          session: {
            id: session._id.toString(),
            title: session.title,
            selectedModel: session.selectedModel,
            messages: session.messages || [],
            createdAt: session.createdAt ? new Date(session.createdAt).getTime() : Date.now(),
            updatedAt: session.updatedAt ? new Date(session.updatedAt).getTime() : Date.now(),
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to get chat session' });
    }
  }

  static async createChatSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const userId = new Types.ObjectId(req.user.userId);
      await enforceUserSessionQuota(userId);

      const { title, selectedModel, messages } = req.body;
      const rawMsgs = Array.isArray(messages) ? messages : [];
      const sanitizedMsgs = rawMsgs.slice(-MAX_MESSAGES_PER_SESSION).map(sanitizeChatMessage);

      let sessionTitle =
        typeof title === 'string' && title.trim() ? title.trim().slice(0, 120) : 'New Conversation';

      if (sessionTitle === 'New Conversation' && sanitizedMsgs.length > 0) {
        const firstUserMsg = sanitizedMsgs.find((m) => m.role === 'user');
        if (firstUserMsg && firstUserMsg.content.trim()) {
          sessionTitle =
            firstUserMsg.content.trim().slice(0, 36) +
            (firstUserMsg.content.length > 36 ? '...' : '');
        }
      }

      const session = await AIChatSession.create({
        userId,
        title: sessionTitle,
        selectedModel:
          typeof selectedModel === 'string' && selectedModel.trim()
            ? selectedModel.trim().slice(0, 100)
            : 'gemini-3.5-flash-lite',
        messages: sanitizedMsgs,
      });

      res.status(201).json({
        success: true,
        data: {
          session: {
            id: session._id.toString(),
            title: session.title,
            selectedModel: session.selectedModel,
            messages: session.messages,
            createdAt: session.createdAt.getTime(),
            updatedAt: session.updatedAt.getTime(),
          },
        },
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to create chat session' });
    }
  }

  static async updateChatSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const rawId = req.params.sessionId;
      const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;
      const sessionId = cleanId || '';

      if (!sessionId || !Types.ObjectId.isValid(sessionId)) {
        res.status(400).json({ success: false, error: 'Invalid Session ID' });
        return;
      }

      const userId = new Types.ObjectId(req.user.userId);
      const session = await AIChatSession.findOne({
        _id: new Types.ObjectId(sessionId),
        userId,
      });

      if (!session) {
        res.status(404).json({ success: false, error: 'Chat conversation not found' });
        return;
      }

      const { title, selectedModel, messages } = req.body;

      if (typeof title === 'string' && title.trim()) {
        session.title = title.trim().slice(0, 120);
      }
      if (typeof selectedModel === 'string' && selectedModel.trim()) {
        session.selectedModel = selectedModel.trim().slice(0, 100);
      }
      if (Array.isArray(messages)) {
        session.messages = messages.slice(-MAX_MESSAGES_PER_SESSION).map(sanitizeChatMessage);
        if (session.title === 'New Conversation' && session.messages.length > 0) {
          const firstUserMsg = session.messages.find((m) => m.role === 'user');
          if (firstUserMsg && firstUserMsg.content.trim()) {
            session.title =
              firstUserMsg.content.trim().slice(0, 36) +
              (firstUserMsg.content.length > 36 ? '...' : '');
          }
        }
      }

      session.updatedAt = new Date();
      await session.save();

      res.status(200).json({
        success: true,
        data: {
          session: {
            id: session._id.toString(),
            title: session.title,
            selectedModel: session.selectedModel,
            messages: session.messages,
            createdAt: session.createdAt.getTime(),
            updatedAt: session.updatedAt.getTime(),
          },
        },
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to update chat session' });
    }
  }

  static async deleteChatSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const rawId = req.params.sessionId;
      const cleanId = Array.isArray(rawId) ? rawId[0] : rawId;
      const sessionId = cleanId || '';

      if (!sessionId || !Types.ObjectId.isValid(sessionId)) {
        res.status(400).json({ success: false, error: 'Invalid Session ID' });
        return;
      }

      const userId = new Types.ObjectId(req.user.userId);
      const result = await AIChatSession.findOneAndDelete({
        _id: new Types.ObjectId(sessionId),
        userId,
      });

      if (!result) {
        res.status(404).json({ success: false, error: 'Chat conversation not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Chat conversation deleted' });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to delete chat session' });
    }
  }

  static async clearChatSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const userId = new Types.ObjectId(req.user.userId);
      await AIChatSession.deleteMany({ userId });
      res.status(200).json({ success: true, message: 'All chat conversations cleared' });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to clear chat sessions' });
    }
  }
}
