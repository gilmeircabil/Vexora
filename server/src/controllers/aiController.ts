import path from 'node:path';
import fs from 'node:fs';
import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AIService } from '../services/ai/aiService.js';
import { AIJob } from '../models/AIJob.js';

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
      res.status(500).json({ success: false, error: err.message || 'Failed to retrieve job status' });
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
      res.status(500).json({ success: false, error: err.message || 'Failed to retrieve AI history' });
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
}
