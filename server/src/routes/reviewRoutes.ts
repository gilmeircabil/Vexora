import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { enforceLimits } from '../middleware/limitMiddleware.js';
import { defaultLimits } from '../config/limits.js';

const router = Router();

// Reviews - limited to 3 per day per user (config-based)
router.get('/summary', ReviewController.getSummary);
router.get('/', ReviewController.listReviews);
router.post(
  '/',
  authenticate,
  enforceLimits({
    category: 'reviews',
    action: 'submitReview',
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: defaultLimits.reviews.reviewsPerDayPerUser,
  }),
  ReviewController.submitReview,
);
router.delete('/:id', authenticate, ReviewController.deleteOwnReview);

export default router;
