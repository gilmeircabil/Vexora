import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/plans', SubscriptionController.getPlans);
router.get('/current', authenticate, SubscriptionController.getCurrent);
router.post('/checkout', authenticate, SubscriptionController.createCheckout);
router.post('/cancel', authenticate, SubscriptionController.cancel);

export default router;
