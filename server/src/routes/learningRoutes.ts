import { Router } from 'express';
import multer from 'multer';
import { LearningController } from '../controllers/learningController.js';
import {
  authenticate,
  optionalAuthenticate as optionalAuth,
} from '../middleware/authMiddleware.js';
import { enforceLimits, checkStorageQuota } from '../middleware/limitMiddleware.js';
import { defaultLimits } from '../config/limits.js';

const router = Router();

const learningUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: defaultLimits.upload.learningAttachmentMaxSize, // 25MB
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
router.put(
  '/creator/profile',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'updateProfile',
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: defaultLimits.api.authenticatedPerMinute,
  }),
  LearningController.updateCreatorProfile,
);
router.post(
  '/creators/:creatorId/follow',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'followCreator',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.learningHub.commentsPerHour,
  }),
  LearningController.toggleFollowCreator,
);

// Creator Dashboard, Earnings & Payouts
router.get('/creator/dashboard', authenticate, LearningController.getCreatorDashboard);
router.post(
  '/creator/payouts',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'payoutRequest',
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: defaultLimits.learningHub.payoutRequestsPerDay,
  }),
  LearningController.requestPayout,
);

// Learner Library & Course Progress
router.get('/library', authenticate, LearningController.getLearnerLibrary);
router.post(
  '/posts/:id/library',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'saveToLibrary',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.learningHub.postsPerDay,
  }),
  LearningController.saveFreeToLibrary,
);
router.post(
  '/posts/:id/progress',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'updateProgress',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.learningHub.commentsPerHour,
  }),
  LearningController.updateCourseProgress,
);
router.get('/bookmarks', authenticate, LearningController.getUserBookmarks);

// Protected File Upload & Entitlement-Verified Download
router.post(
  '/files/upload',
  authenticate,
  enforceLimits({
    category: 'upload',
    action: 'learningFile',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.api.uploadPerHour,
  }),
  enforceLimits({
    category: 'storage',
    action: 'storageUsage',
    windowMs: 1000,
    maxRequests: 1,
  }),
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
  enforceLimits({
    category: 'payment',
    action: 'checkout',
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  }),
  LearningController.createPurchaseCheckout,
);
router.post('/webhooks/:provider', LearningController.handlePaymentWebhook);
router.post(
  '/purchases/:purchaseId/verify-sandbox',
  authenticate,
  enforceLimits({
    category: 'payment',
    action: 'verifySandbox',
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
  }),
  LearningController.verifySandboxPurchase,
);
router.post(
  '/purchases/:purchaseId/refund',
  authenticate,
  enforceLimits({
    category: 'payment',
    action: 'refund',
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
  }),
  LearningController.refundPurchase,
);

// Publishing & Content Management
router.post(
  '/posts',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'createPost',
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: defaultLimits.learningHub.postsPerDay,
  }),
  LearningController.createPost,
);
router.put(
  '/posts/:id',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'updatePost',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.learningHub.commentsPerHour,
  }),
  LearningController.updatePost,
);
router.delete(
  '/posts/:id',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'deletePost',
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  }),
  LearningController.deletePost,
);

// Community Interactions (Likes, Bookmarks, Comments, Reviews, Reports)
router.post(
  '/posts/:id/like',
  authenticate,
  enforceLimits({
    category: 'community',
    action: 'reaction',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.community.reactionsPerHour,
  }),
  LearningController.toggleLike,
);
router.post(
  '/posts/:id/bookmark',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'bookmark',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.learningHub.commentsPerHour,
  }),
  LearningController.toggleBookmark,
);
router.post(
  '/posts/:id/comments',
  authenticate,
  enforceLimits({
    category: 'learning',
    action: 'comment',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.learningHub.commentsPerHour,
  }),
  LearningController.addComment,
);
router.put(
  '/comments/:commentId',
  authenticate,
  enforceLimits({
    category: 'community',
    action: 'comment',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.community.communityCommentsPerHour,
  }),
  LearningController.updateComment,
);
router.delete(
  '/comments/:commentId',
  authenticate,
  enforceLimits({
    category: 'community',
    action: 'comment',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.community.communityCommentsPerHour,
  }),
  LearningController.deleteComment,
);

router.post(
  '/posts/:id/reviews',
  authenticate,
  enforceLimits({
    category: 'reviews',
    action: 'submitReview',
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: defaultLimits.reviews.reviewsPerDayPerUser,
  }),
  LearningController.upsertReview,
);
router.delete(
  '/reviews/:reviewId',
  authenticate,
  enforceLimits({
    category: 'reviews',
    action: 'deleteReview',
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
  }),
  LearningController.deleteReview,
);

router.post(
  '/reports',
  authenticate,
  enforceLimits({
    category: 'community',
    action: 'report',
    windowMs: 60 * 60 * 1000,
    maxRequests: defaultLimits.community.reportsPerHour,
  }),
  LearningController.createReport,
);

export default router;
