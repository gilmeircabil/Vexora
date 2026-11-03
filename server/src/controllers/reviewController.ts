import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { ReviewService } from '../services/reviewService.js';
import { PlatformController } from './platformController.js';

export class ReviewController {
  /**
   * GET /api/reviews/summary
   * Returns average rating, total approved reviews, 5-star distribution, and recent approved reviews.
   */
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 4;
      const summary = await ReviewService.getReviewsSummary(limit);
      res.status(200).json({ success: true, data: summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/reviews
   * Returns paginated approved public reviews with optional star rating filter & sort.
   */
  static async listReviews(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 12;
      const rating = req.query.rating ? Number(req.query.rating) : undefined;
      const sort =
        req.query.sort === 'highest' || req.query.sort === 'lowest' ? req.query.sort : 'newest';

      const result = await ReviewService.listApprovedReviews({
        page,
        limit,
        rating,
        sort,
      });

      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/reviews
   * Requires authentication. Validates and sanitizes 1-5 star rating and review comment.
   */
  static async submitReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Please sign in to submit a review.',
        });
        return;
      }

      const review = await ReviewService.submitReview(userId, {
        rating: req.body?.rating,
        comment: req.body?.comment,
        userAvatar: req.body?.userAvatar,
      });

      PlatformController.clearCache();

      res.status(201).json({
        success: true,
        data: review,
        message: 'Thank you! Your review has been published.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * DELETE /api/reviews/:id
   * Allows a signed-in user to delete their own review.
   */
  static async deleteOwnReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required.' });
        return;
      }

      await ReviewService.deleteOwnReview(userId, String(req.params.id));
      PlatformController.clearCache();

      res.status(200).json({
        success: true,
        message: 'Review deleted.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
