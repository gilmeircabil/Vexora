import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimitMiddleware.js';
import {
  uploadImage,
  uploadImageAndMask,
  uploadDocument,
  validateImageMagicBytes,
  validateDocMagicBytes,
} from '../middleware/uploadMiddleware.js';

const router = Router();

// Live model readiness
router.get('/status', AIController.getModelStatus);

// 1. AI Image Enhancer (Sharp & Computer Vision)
router.post(
  '/enhance',
  optionalAuthenticate,
  aiRateLimiter,
  uploadImage.single('image'),
  validateImageMagicBytes,
  AIController.enhance,
);

// 2. AI Background Remover
router.post(
  '/remove-background',
  optionalAuthenticate,
  aiRateLimiter,
  uploadImage.single('image'),
  validateImageMagicBytes,
  AIController.removeBackground,
);

// 3. AI Object Remover
router.post(
  '/remove-object',
  optionalAuthenticate,
  aiRateLimiter,
  uploadImageAndMask.fields([
    { name: 'image', maxCount: 1 },
    { name: 'mask', maxCount: 1 },
  ]),
  AIController.removeObject,
);

// 4. AI Photo Restoration
router.post(
  '/restore-photo',
  optionalAuthenticate,
  aiRateLimiter,
  uploadImage.single('image'),
  validateImageMagicBytes,
  AIController.restorePhoto,
);

// 5. AI OCR Document Extraction
router.post(
  '/ocr',
  optionalAuthenticate,
  aiRateLimiter,
  uploadDocument.single('file'),
  validateDocMagicBytes,
  AIController.ocr,
);

// Jobs, history & downloads
router.get('/jobs/:jobId', optionalAuthenticate, AIController.getJob);
router.get('/history', optionalAuthenticate, AIController.getHistory);
router.get('/download/:filename', AIController.downloadResult);

export default router;
