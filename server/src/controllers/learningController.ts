import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { LearningService } from '../services/learningService.js';

export class LearningController {
  // --------------------------------------------------------------------------
  // Discovery & Posts
  // --------------------------------------------------------------------------

  static async listPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        q,
        category,
        tag,
        difficulty,
        contentType,
        pricingType,
        minPrice,
        maxPrice,
        authorId,
        sort,
        page,
        limit,
      } = req.query;
      const result = await LearningService.listPosts({
        q: q as string,
        category: category as string,
        tag: tag as string,
        difficulty: difficulty as string,
        contentType: contentType as string,
        pricingType: pricingType as string,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
        authorId: authorId as string,
        sort: sort as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
        viewerUserId: req.user?.userId,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getDiscoveryOverview(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const overview = await LearningService.getDiscoveryOverview();
      res.status(200).json({ success: true, data: overview });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getPostBySlug(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const slug = req.params.slug as string;
      const isAdmin = req.user?.role === 'admin';
      const skipView = req.query.skipView === 'true' || req.headers['x-skip-view'] === 'true';
      const post = await LearningService.getPostBySlug(slug, req.user?.userId, isAdmin, skipView);
      res.status(200).json({ success: true, data: post });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  static async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const post = await LearningService.createPost(req.user.userId, req.body);
      res.status(201).json({ success: true, data: post });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const postId = req.params.id as string;
      const isAdmin = req.user.role === 'admin';
      const post = await LearningService.updatePost(req.user.userId, postId, req.body, isAdmin);
      res.status(200).json({ success: true, data: post });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const postId = req.params.id as string;
      const isAdmin = req.user.role === 'admin';
      const result = await LearningService.deletePost(req.user.userId, postId, isAdmin);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Protected File Upload & Download (Phase 2, 3, 12)
  // --------------------------------------------------------------------------

  static async uploadLearningFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No learning file uploaded' });
        return;
      }

      const isPreview = req.body?.isPreview === 'true' || req.body?.isPreview === true;
      const uploaded = await LearningService.uploadProtectedLearningFile(
        req.user.userId,
        req.file,
        isPreview,
      );

      res.status(201).json({
        success: true,
        data: {
          fileId: uploaded.fileId,
          originalName: uploaded.originalName,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
          storageKey: uploaded.storageKey,
          isPreview: uploaded.isPreview,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async downloadProtectedFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const fileId = req.params.fileId as string;
      const isAdmin = req.user?.role === 'admin';

      const fileInfo = await LearningService.getProtectedFileForDownload(
        postId,
        fileId,
        req.user?.userId,
        isAdmin,
      );

      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(fileInfo.originalName)}"`,
      );
      res.sendFile(fileInfo.filePath);
    } catch (err: any) {
      const status = /Purchase required|Unauthorized/i.test(err.message) ? 403 : 404;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Likes, Bookmarks & Comments (Phase 9)
  // --------------------------------------------------------------------------

  static async toggleLike(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const postId = req.params.id as string;
      const result = await LearningService.togglePostLike(req.user.userId, postId);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async toggleBookmark(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const postId = req.params.id as string;
      const result = await LearningService.toggleBookmark(req.user.userId, postId);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getUserBookmarks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const bookmarks = await LearningService.getUserBookmarks(req.user.userId);
      res.status(200).json({ success: true, data: { items: bookmarks } });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getComments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const comments = await LearningService.getPostComments(postId);
      res.status(200).json({ success: true, data: { comments } });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async addComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const postId = req.params.id as string;
      const { content, parentCommentId } = req.body;
      const comment = await LearningService.addComment(
        req.user.userId,
        postId,
        content,
        parentCommentId,
      );
      res.status(201).json({ success: true, data: comment });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updateComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const commentId = req.params.commentId as string;
      const comment = await LearningService.updateComment(
        req.user.userId,
        commentId,
        req.body.content,
      );
      res.status(200).json({ success: true, data: comment });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const commentId = req.params.commentId as string;
      const isAdmin = req.user.role === 'admin';
      const result = await LearningService.deleteComment(req.user.userId, commentId, isAdmin);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Phase 8: Ratings & Reviews
  // --------------------------------------------------------------------------

  static async getReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await LearningService.listReviews(postId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async upsertReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const postId = req.params.id as string;
      const { rating, comment } = req.body;
      const result = await LearningService.upsertReview(req.user.userId, postId, {
        rating,
        comment,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const reviewId = req.params.reviewId as string;
      const isAdmin = req.user.role === 'admin';
      const result = await LearningService.deleteReview(req.user.userId, reviewId, isAdmin);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Phase 5 & 9: Creator Profiles & Following
  // --------------------------------------------------------------------------

  static async getCreatorProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usernameOrId = req.params.usernameOrId as string;
      const profile = await LearningService.getCreatorProfile(usernameOrId, req.user?.userId);
      res.status(200).json({ success: true, data: profile });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  }

  static async updateCreatorProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const updated = await LearningService.updateCreatorProfile(req.user.userId, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async toggleFollowCreator(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const creatorId = req.params.creatorId as string;
      const result = await LearningService.toggleFollowCreator(req.user.userId, creatorId);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Phase 6 & 11: Creator Dashboard, Earnings & Payouts
  // --------------------------------------------------------------------------

  static async getCreatorDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const dashboard = await LearningService.getCreatorDashboard(req.user.userId);
      res.status(200).json({ success: true, data: dashboard });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async requestPayout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const payout = await LearningService.requestPayout(req.user.userId, req.body);
      res.status(201).json({ success: true, data: payout });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Phase 10: Payment & Purchase Checkout, Webhook, Sandbox Verification & Refund
  // --------------------------------------------------------------------------

  static async createPurchaseCheckout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const postId = req.params.id as string;
      const session = await LearningService.createPurchaseCheckout(req.user.userId, postId, {
        paymentProvider: req.body?.paymentProvider,
      });
      res.status(201).json({ success: true, data: session });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async handlePaymentWebhook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const provider = ((req.params.provider as string) || 'sandbox') as
        'paymongo' | 'stripe' | 'sandbox';
      const signature =
        (req.headers['x-learning-webhook-signature'] as string) ||
        (req.headers['paymongo-signature'] as string) ||
        (req.headers['stripe-signature'] as string) ||
        '';

      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      const result = await LearningService.handleLearningPaymentWebhook({
        provider,
        rawBody,
        signatureHeader: signature,
        payload,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async verifySandboxPurchase(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const purchaseId = req.params.purchaseId as string;
      const purchase = await LearningService.verifySandboxPurchaseForDev(
        req.user.userId,
        purchaseId,
      );
      res.status(200).json({ success: true, data: purchase });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async refundPurchase(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const purchaseId = req.params.purchaseId as string;
      const isAdmin = req.user.role === 'admin';
      const purchase = await LearningService.refundPurchase(
        purchaseId,
        req.user.userId,
        isAdmin,
        req.body?.reason,
      );
      res.status(200).json({ success: true, data: purchase });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Phase 7: Learner Library & Course Progress
  // --------------------------------------------------------------------------

  static async getLearnerLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const library = await LearningService.getLearnerLibrary(req.user.userId);
      res.status(200).json({ success: true, data: library });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async saveFreeToLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const postId = req.params.id as string;
      const progress = await LearningService.saveFreeMaterialToLibrary(req.user.userId, postId);
      res.status(200).json({ success: true, data: progress });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updateCourseProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }
      const postId = req.params.id as string;
      const progress = await LearningService.updateCourseProgress(
        req.user.userId,
        postId,
        req.body,
      );
      res.status(200).json({ success: true, data: progress });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Phase 12: Reporting
  // --------------------------------------------------------------------------

  static async createReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { targetType, targetId, reason, category } = req.body;
      if (!['post', 'comment', 'review', 'creator'].includes(targetType)) {
        res.status(400).json({ success: false, error: 'Invalid report target type' });
        return;
      }

      const report = await LearningService.createReport(
        req.user.userId,
        targetType,
        targetId,
        reason,
        category,
      );
      res.status(201).json({ success: true, data: report });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
