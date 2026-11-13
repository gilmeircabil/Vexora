import { Router } from 'express';
import { LoveLinkController } from '../controllers/loveLinkController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Authenticated letter management
router.post('/', authenticate, LoveLinkController.createLetter);
router.get('/my', authenticate, LoveLinkController.getUserLetters);
router.put('/:id', authenticate, LoveLinkController.updateLetter);
router.post('/:id/publish', authenticate, LoveLinkController.publishLetter);
router.post('/:id/revoke', authenticate, LoveLinkController.revokeLetter);
router.delete('/:id', authenticate, LoveLinkController.deleteLetter);

// Public letter viewing & interaction (No authentication required)
router.get('/public/:token', LoveLinkController.getPublicLetter);
router.post('/public/:token/verify-password', LoveLinkController.verifyPassword);
router.post('/public/:token/open', LoveLinkController.recordOpen);

export default router;
