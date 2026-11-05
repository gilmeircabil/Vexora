import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { optionalAuthenticate, authenticate } from '../middleware/authMiddleware.js';
import {
  uploadImage,
  uploadImageAndMask,
  uploadDocument,
  validateImageMagicBytes,
  validateDocMagicBytes,
} from '../middleware/uploadMiddleware.js';
import { enforceLimits, limitConcurrentJobs } from '../middleware/limitMiddleware.js';
import { defaultLimits } from '../config/limits.js';

const router = Router();

// Live model readiness
router.get('/status', AIController.getModelStatus);

// 1. AI Image Enhancer (Sharp & Computer Vision)
router.post(
  '/enhance',
  optionalAuthenticate,
  enforceLimits({
    category: 'ai',
    action: 'enhance',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: defaultLimits.ai.enhancePerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
  uploadImage.single('image'),
  validateImageMagicBytes,
  AIController.enhance,
);

// 2. AI Background Remover
router.post(
  '/remove-background',
  optionalAuthenticate,
  enforceLimits({
    category: 'ai',
    action: 'backgroundRemover',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.ai.backgroundRemoverPerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
  uploadImage.single('image'),
  validateImageMagicBytes,
  AIController.removeBackground,
);

// 3. AI Object Remover
router.post(
  '/remove-object',
  optionalAuthenticate,
  enforceLimits({
    category: 'ai',
    action: 'objectRemover',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.ai.backgroundRemoverPerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
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
  enforceLimits({
    category: 'ai',
    action: 'photoRestoration',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.ai.enhancePerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
  uploadImage.single('image'),
  validateImageMagicBytes,
  AIController.restorePhoto,
);

// 5. AI OCR Document Extraction
router.post(
  '/ocr',
  optionalAuthenticate,
  enforceLimits({
    category: 'ai',
    action: 'ocr',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.ai.ocrPerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
  uploadDocument.single('file'),
  validateDocMagicBytes,
  AIController.ocr,
);

// 6. AI Code Explainer & Error Debugger
router.post(
  '/code-assist',
  optionalAuthenticate,
  enforceLimits({
    category: 'ai',
    action: 'codeAssistant',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.ai.codeAssistantPerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
  AIController.explainCode,
);

// 7. AI Document Summarizer & Q&A
router.post(
  '/document-assist',
  optionalAuthenticate,
  enforceLimits({
    category: 'ai',
    action: 'documentAssistant',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.ai.documentAssistantPerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
  AIController.summarizeDocument,
);

// 8. AI Writing Assistant & ATS Resume Builder
router.post(
  '/writing-assist',
  optionalAuthenticate,
  enforceLimits({
    category: 'ai',
    action: 'writingAssistant',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.ai.writingAssistantPerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
  AIController.assistWriting,
);

// 9. Vexora AI Chat & Real-Time Streaming
router.post(
  '/chat',
  optionalAuthenticate,
  enforceLimits({
    category: 'ai',
    action: 'chat',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.ai.chatPerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
  AIController.chat,
);
router.post(
  '/chat/stream',
  optionalAuthenticate,
  enforceLimits({
    category: 'ai',
    action: 'chat',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.ai.chatPerHour,
    trackAfterRequest: true,
  }),
  limitConcurrentJobs(defaultLimits.ai.maxConcurrentJobs),
  AIController.streamChat,
);

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
