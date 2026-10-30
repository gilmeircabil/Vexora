import path from 'node:path';
import fs from 'node:fs';
import type { Response } from 'express';
import { Types } from 'mongoose';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AIService } from '../services/ai/aiService.js';
import { AIJob } from '../models/AIJob.js';

export class AIController {
  static async enhance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'Please provide an image file to enhance.' });
        return;
      }

      const mode = (req.body.mode || 'enhance') as any;
      const scale = req.body.scale ? parseInt(req.body.scale, 10) : 2;
      const toolId = req.body.toolId || 'ai-image-enhancer';
      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

      const result = await AIService.processEnhancement({
        userId: req.user.userId,
        toolId,
        fileBuffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        options: {
          mode,
          scale,
        },
        idempotencyKey,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      const isInsufficient = err.message?.toLowerCase().includes('insufficient credits');
      res.status(isInsufficient ? 402 : 500).json({
        success: false,
        error: err.message || 'Image enhancement failed',
      });
    }
  }

  static async getJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const jobId = req.params.jobId as string;
      if (!jobId || !Types.ObjectId.isValid(jobId)) {
        res.status(400).json({ success: false, error: 'Invalid Job ID' });
        return;
      }

      const uid = new Types.ObjectId(req.user.userId);
      const job = await AIJob.findOne({ _id: new Types.ObjectId(jobId), userId: uid }).lean();

      if (!job) {
        res.status(404).json({ success: false, error: 'Job not found or access denied.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve job status',
      });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const uid = new Types.ObjectId(req.user.userId);
      const jobs = await AIJob.find({ userId: uid }).sort({ createdAt: -1 }).limit(30).lean();

      res.status(200).json({
        success: true,
        data: {
          jobs,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve AI history',
      });
    }
  }

  static async downloadResult(req: any, res: Response): Promise<void> {
    const filename = path.basename((req.params.filename as string) || '');
    const filepath = path.resolve(process.cwd(), 'server', 'uploads', 'processed', filename);

    if (!fs.existsSync(filepath)) {
      res.status(404).json({ success: false, error: 'File not found or expired.' });
      return;
    }

    res.sendFile(filepath);
  }
}
