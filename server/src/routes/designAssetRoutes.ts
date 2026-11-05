import { Router } from 'express';
import { DesignAssetController } from '../controllers/designAssetController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadImage, validateImageMagicBytes } from '../middleware/uploadMiddleware.js';
import { enforceLimits, checkStorageQuota } from '../middleware/limitMiddleware.js';
import { defaultLimits } from '../config/limits.js';

const router = Router();

// Public asset file serving (safe files)
router.get('/files/:storageKey', DesignAssetController.serveFile);
router.get('/files/thumbs/:storageKey', DesignAssetController.serveFile);

// User asset management routes (require authentication)
router.post(
  '/upload',
  authenticate,
  enforceLimits({
    category: 'upload',
    action: 'assetUpload',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: defaultLimits.api.uploadPerHour,
  }),
  checkStorageQuota(),
  uploadImage.single('file'),
  validateImageMagicBytes,
  DesignAssetController.upload,
);
router.get('/', authenticate, DesignAssetController.list);
router.delete('/:assetId', authenticate, DesignAssetController.delete);

export default router;
