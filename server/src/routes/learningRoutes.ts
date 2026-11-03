import { Router } from 'express';
import multer from 'multer';
import { LearningController } from '../controllers/learningController.js';
import {
  authenticate,
  optionalAuthenticate as optionalAuth,
} from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

const writeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  message: 'Too many write requests to Learning Hub. Please wait a moment.',
});

const learningUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for learning PDFs/files/videos
  },
});

// Public / optional-auth Discovery & Content browsing
router.get('/discovery', optionalAuth, LearningController.getDiscoveryOverview);
router.get('/posts', optionalAuth, LearningController.listPosts);
router.get('/posts/:slug', optionalAuth, LearningController.getPostBySlug);
router.get('/posts/:id/comments', LearningController.getComments);
router.get('/posts/:id/reviews', LearningController.getReviews);

// Creator Profiles
router.get('/creators/:usernameOrId', optionalAuth, LearningController.getCreatorProfile);
router.put('/creator/profile', authenticate, writeLimiter, LearningController.updateCreatorProfile);
router.post(
  '/creators/:creatorId/follow',
  authenticate,
  writeLimiter,
  LearningController.toggleFollowCreator,
);

// Creator Dashboard, Earnings & Payouts
router.get('/creator/dashboard', authenticate, LearningController.getCreatorDashboard);
router.post('/creator/payouts', authenticate, writeLimiter, LearningController.requestPayout);

// Learner Library & Course Progress
router.get('/library', authenticate, LearningController.getLearnerLibrary);
router.post('/posts/:id/library', authenticate, writeLimiter, LearningController.saveFreeToLibrary);
router.post(
  '/posts/:id/progress',
  authenticate,
  writeLimiter,
  LearningController.updateCourseProgress,
);
router.get('/bookmarks', authenticate, LearningController.getUserBookmarks);

// Protected File Upload & Entitlement-Verified Download
router.post(
  '/files/upload',
  authenticate,
  writeLimiter,
  learningUpload.single('file'),
  LearningController.uploadLearningFile,
);
router.get(
  '/posts/:id/files/:fileId/download',
  optionalAuth,
  LearningController.downloadProtectedFile,
);

// Paid Content Checkout, Webhooks, Sandbox Verification & Refunds
router.post(
  '/posts/:id/checkout',
  authenticate,
  writeLimiter,
  LearningController.createPurchaseCheckout,
);
router.post('/webhooks/:provider', LearningController.handlePaymentWebhook);
router.post(
  '/purchases/:purchaseId/verify-sandbox',
  authenticate,
  writeLimiter,
  LearningController.verifySandboxPurchase,
);
router.post(
  '/purchases/:purchaseId/refund',
  authenticate,
  writeLimiter,
  LearningController.refundPurchase,
);

// Publishing & Content Management
router.post('/posts', authenticate, writeLimiter, LearningController.createPost);
router.put('/posts/:id', authenticate, writeLimiter, LearningController.updatePost);
router.delete('/posts/:id', authenticate, writeLimiter, LearningController.deletePost);

// Community Interactions (Likes, Bookmarks, Comments, Reviews, Reports)
router.post('/posts/:id/like', authenticate, writeLimiter, LearningController.toggleLike);
router.post('/posts/:id/bookmark', authenticate, writeLimiter, LearningController.toggleBookmark);
router.post('/posts/:id/comments', authenticate, writeLimiter, LearningController.addComment);
router.put('/comments/:commentId', authenticate, writeLimiter, LearningController.updateComment);
router.delete('/comments/:commentId', authenticate, writeLimiter, LearningController.deleteComment);

router.post('/posts/:id/reviews', authenticate, writeLimiter, LearningController.upsertReview);
router.delete('/reviews/:reviewId', authenticate, writeLimiter, LearningController.deleteReview);

router.post('/reports', authenticate, writeLimiter, LearningController.createReport);

export default router;
