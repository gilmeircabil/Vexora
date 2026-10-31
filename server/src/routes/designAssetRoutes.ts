import { Router } from 'express';
import { DesignAssetController } from '../controllers/designAssetController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadImage, validateImageMagicBytes } from '../middleware/uploadMiddleware.js';

const router = Router();

// Public asset file serving (safe files)
router.get('/files/:storageKey', DesignAssetController.serveFile);
router.get('/files/thumbs/:storageKey', DesignAssetController.serveFile);

// User asset management routes (require authentication)
router.post(
  '/upload',
  authenticate,
  uploadImage.single('file'),
  validateImageMagicBytes,
  DesignAssetController.upload,
);
router.get('/', authenticate, DesignAssetController.list);
router.delete('/:assetId', authenticate, DesignAssetController.delete);

export default router;
