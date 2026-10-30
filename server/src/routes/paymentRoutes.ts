import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/webhook', PaymentController.webhook);
router.get('/history', authenticate, PaymentController.getHistory);

export default router;
