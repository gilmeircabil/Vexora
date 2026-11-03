import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

const reviewSubmitLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many review submissions. Please wait a few minutes and try again.',
});

router.get('/summary', ReviewController.getSummary);
router.get('/', ReviewController.listReviews);
router.post('/', authenticate, reviewSubmitLimiter, ReviewController.submitReview);
router.delete('/:id', authenticate, ReviewController.deleteOwnReview);

export default router;
