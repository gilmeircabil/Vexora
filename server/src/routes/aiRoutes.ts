import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimitMiddleware.js';
import { uploadImage, validateImageMagicBytes } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post(
  '/enhance',
  authenticate,
  aiRateLimiter,
  uploadImage.single('image'),
  validateImageMagicBytes,
  AIController.enhance,
);

router.get('/jobs/:jobId', authenticate, AIController.getJob);
router.get('/history', authenticate, AIController.getHistory);
router.get('/download/:filename', AIController.downloadResult);

export default router;
