import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { optionalAuthenticate, authenticate } from '../middleware/authMiddleware.js';
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

// 6. AI Code Explainer & Error Debugger
router.post('/code-assist', optionalAuthenticate, aiRateLimiter, AIController.explainCode);

// 7. AI Document Summarizer & Q&A
router.post(
  '/document-assist',
  optionalAuthenticate,
  aiRateLimiter,
  AIController.summarizeDocument,
);

// 8. AI Writing Assistant & ATS Resume Builder
router.post('/writing-assist', optionalAuthenticate, aiRateLimiter, AIController.assistWriting);

// 9. Vexora AI Chat & Real-Time Streaming
router.post('/chat', optionalAuthenticate, aiRateLimiter, AIController.chat);
router.post('/chat/stream', optionalAuthenticate, aiRateLimiter, AIController.streamChat);

// 10. AI Chat Cloud Sessions (Per User Account)
router.get('/chat/sessions', authenticate, AIController.listChatSessions);
router.get('/chat/sessions/:sessionId', authenticate, AIController.getChatSession);
router.post('/chat/sessions', authenticate, AIController.createChatSession);
router.put('/chat/sessions/:sessionId', authenticate, AIController.updateChatSession);
router.delete('/chat/sessions/:sessionId', authenticate, AIController.deleteChatSession);
router.delete('/chat/sessions', authenticate, AIController.clearChatSessions);

// Jobs, history & downloads
router.get('/jobs/:jobId', optionalAuthenticate, AIController.getJob);
router.get('/history', optionalAuthenticate, AIController.getHistory);
router.get('/download/:filename', AIController.downloadResult);

export default router;
