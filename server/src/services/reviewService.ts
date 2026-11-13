import mongoose from 'mongoose';
import { Review, type IReview, type ReviewStatus } from '../models/Review.js';
import { User } from '../models/User.js';

export interface ReviewDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ReviewSummaryPayload {
  averageRating: number;
  totalApproved: number;
  distribution: ReviewDistribution;
  recentReviews: Array<{
    _id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

let cachedSummary: {
  timestamp: number;
  limit: number;
  data: ReviewSummaryPayload;
} | null = null;

const SUMMARY_CACHE_TTL_MS = 10 * 1000;

export class ReviewService {
  static clearCache(): void {
    cachedSummary = null;
  }

  static sanitizeText(text: unknown, maxLength = 1500): string {
    if (typeof text !== 'string') return '';
    return text
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);
  }

  /**
   * Computes real database-backed average rating, total approved reviews,
   * 5-star rating distribution, and recent approved reviews.
   * Hidden and pending reviews are strictly excluded.
   */
  static async getReviewsSummary(recentLimit = 4): Promise<ReviewSummaryPayload> {
    const safeLimit = Math.min(Math.max(Number(recentLimit) || 4, 1), 12);
    const now = Date.now();

    if (
      cachedSummary &&
      cachedSummary.limit === safeLimit &&
      now - cachedSummary.timestamp < SUMMARY_CACHE_TTL_MS
    ) {
      return cachedSummary.data;
    }

    const [ratingBuckets, recentDocs] = await Promise.all([
      Review.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
      ]),
      Review.find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .select('userId userName userAvatar rating comment createdAt updatedAt')
        .lean(),
    ]);

    const distribution: ReviewDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let totalApproved = 0;
    let weightedSum = 0;

    for (const bucket of ratingBuckets) {
      const star = Number(bucket._id) as 1 | 2 | 3 | 4 | 5;
      const count = Number(bucket.count) || 0;
      if (star >= 1 && star <= 5) {
        distribution[star] = count;
        totalApproved += count;
        weightedSum += star * count;
      }
    }

    const averageRating =
      totalApproved > 0 ? Math.round((weightedSum / totalApproved) * 10) / 10 : 0;

    const payload: ReviewSummaryPayload = {
      averageRating,
      totalApproved,
      distribution,
      recentReviews: recentDocs.map((doc: any) => ({
        _id: String(doc._id),
        userId: String(doc.userId),
        userName: doc.userName,
        userAvatar: doc.userAvatar || '',
        rating: doc.rating,
        comment: doc.comment,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    };

    cachedSummary = {
      timestamp: now,
      limit: safeLimit,
      data: payload,
    };

    return payload;
  }

  /**
   * Lists paginated approved public reviews with optional star rating filter & sort.
   */
  static async listApprovedReviews(params: {
    page?: number;
    limit?: number;
    rating?: number;
    sort?: 'newest' | 'highest' | 'lowest';
  }) {
    const page = Math.max(Number(params.page) || 1, 1);
    const limit = Math.min(Math.max(Number(params.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { status: 'approved' };
    if (params.rating && params.rating >= 1 && params.rating <= 5) {
      filter.rating = Math.floor(Number(params.rating));
    }

    let sortSpec: Record<string, 1 | -1> = { createdAt: -1 };
    if (params.sort === 'highest') {
      sortSpec = { rating: -1, createdAt: -1 };
    } else if (params.sort === 'lowest') {
      sortSpec = { rating: 1, createdAt: -1 };
    }

    const [reviews, totalMatching, summary] = await Promise.all([
      Review.find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .select('userId userName userAvatar rating comment createdAt updatedAt')
        .lean(),
      Review.countDocuments(filter),
      this.getReviewsSummary(4),
    ]);

    return {
      reviews: reviews.map((doc: any) => ({
        _id: String(doc._id),
        userId: String(doc.userId),
        userName: doc.userName,
        userAvatar: doc.userAvatar || '',
        rating: doc.rating,
        comment: doc.comment,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total: totalMatching,
        totalPages: Math.max(Math.ceil(totalMatching / limit), 1),
      },
      summary: {
        averageRating: summary.averageRating,
        totalApproved: summary.totalApproved,
        distribution: summary.distribution,
      },
    };
  }

  /**
   * Submits a new review or updates an existing review by an authenticated user.
   */
  static async submitReview(
    userId: string,
    input: { rating: unknown; comment: unknown; userAvatar?: unknown },
  ): Promise<IReview> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user account.');
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error('Authentication required to submit a review.');
    }
    if ((user as any).isSuspended) {
      throw new Error('Suspended accounts cannot submit reviews.');
    }

    const ratingNum = Number(input.rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new Error('Please select a star rating between 1 and 5.');
    }

    const comment = this.sanitizeText(input.comment, 1500);
    if (comment.length < 3) {
      throw new Error('Please write a review comment of at least 3 characters.');
    }

    const avatarUrl = this.sanitizeText((user as any).avatarUrl || input.userAvatar, 500);

    const displayName = this.sanitizeText(user.name, 100) || 'VexoraMods Member';

    let review = await Review.findOne({ userId: user._id });
    if (review) {
      review.userName = displayName;
      if (avatarUrl) review.userAvatar = avatarUrl;
      review.rating = ratingNum;
      review.comment = comment;
      if (review.status === 'pending') {
        review.status = 'approved';
      }
      await review.save();
    } else {
      review = await Review.create({
        userId: user._id,
        userName: displayName,
        userAvatar: avatarUrl,
        rating: ratingNum,
        comment,
        status: 'approved',
      });
    }

    this.clearCache();
    return review;
  }

  /**
   * Deletes a review owned by the authenticated user.
   */
  static async deleteOwnReview(userId: string, reviewId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw new Error('Invalid review ID.');
    }
    const deleted = await Review.findOneAndDelete({
      _id: reviewId,
      userId,
    });
    if (!deleted) {
      throw new Error('Review not found or unauthorized.');
    }
    this.clearCache();
  }

  /**
   * Admin moderation helpers
   */
  static async listAllReviewsAdmin(status?: ReviewStatus) {
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    return Review.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  }

  static async updateReviewStatusAdmin(reviewId: string, status: ReviewStatus) {
    if (!['approved', 'hidden', 'pending'].includes(status)) {
      throw new Error('Invalid review status.');
    }
    const updated = await Review.findByIdAndUpdate(reviewId, { $set: { status } }, { new: true });
    if (!updated) throw new Error('Review not found.');
    this.clearCache();
    return updated;
  }
}
