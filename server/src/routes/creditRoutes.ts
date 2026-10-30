import { Router } from 'express';
import { CreditController } from '../controllers/creditController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/balance', authenticate, CreditController.getBalance);
router.get('/history', authenticate, CreditController.getHistory);
router.get('/usage', authenticate, CreditController.getUsage);

export default router;
