import { Router } from 'express';
import { PlatformController } from '../controllers/platformController.js';
import { createRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many contact inquiries sent recently. Please try again later.',
});

router.get('/home', PlatformController.getHomeOverview);
router.get('/maintenance', PlatformController.getMaintenanceConfig);
router.post('/contact', contactLimiter, PlatformController.submitContactInquiry);

export default router;
