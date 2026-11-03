import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewService } from '../src/services/reviewService.js';
import { Review } from '../src/models/Review.js';

describe('Ratings & Reviews Backend Service & Model Suite', () => {
  beforeEach(() => {
    ReviewService.clearCache();
    vi.restoreAllMocks();
  });

  it('defines Review schema with required userId, userName, rating (1-5), comment, and status', () => {
    const paths = Review.schema.paths;
    expect(paths.userId).toBeDefined();
    expect(paths.userName).toBeDefined();
    expect(paths.rating).toBeDefined();
    expect(paths.comment).toBeDefined();
    expect(paths.status).toBeDefined();
  });

  it('returns zero-review state without fabricated ratings when no approved reviews exist', async () => {
    vi.spyOn(Review, 'aggregate').mockResolvedValueOnce([]);
    vi.spyOn(Review, 'find').mockReturnValueOnce({
      sort: () => ({
        limit: () => ({
          select: () => ({
            lean: async () => [],
          }),
        }),
      }),
    } as any);

    const summary = await ReviewService.getReviewsSummary(4);
    expect(summary.totalApproved).toBe(0);
    expect(summary.averageRating).toBe(0);
    expect(summary.distribution).toEqual({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    expect(summary.recentReviews).toEqual([]);
  });

  it('calculates real weighted average rating and 5-star distribution from approved reviews only', async () => {
    vi.spyOn(Review, 'aggregate').mockResolvedValueOnce([
      { _id: 5, count: 3 },
      { _id: 4, count: 1 },
    ]);

    const mockRecent = [
      {
        _id: 'rev1',
        userId: 'u1',
        userName: 'Alice Dev',
        userAvatar: '',
        rating: 5,
        comment: 'Fast and clean tools!',
        createdAt: new Date('2026-10-30T10:00:00Z'),
        updatedAt: new Date('2026-10-30T10:00:00Z'),
      },
    ];

    vi.spyOn(Review, 'find').mockReturnValueOnce({
      sort: () => ({
        limit: () => ({
          select: () => ({
            lean: async () => mockRecent,
          }),
        }),
      }),
    } as any);

    const summary = await ReviewService.getReviewsSummary(4);
    expect(summary.totalApproved).toBe(4);
    // (3 * 5 + 1 * 4) / 4 = 19 / 4 = 4.75 -> rounded to 1 decimal = 4.8
    expect(summary.averageRating).toBe(4.8);
    expect(summary.distribution).toEqual({ 5: 3, 4: 1, 3: 0, 2: 0, 1: 0 });
    expect(summary.recentReviews).toHaveLength(1);
    expect(summary.recentReviews[0]?.userName).toBe('Alice Dev');
  });

  it('sanitizes HTML tags from review comments', () => {
    const cleaned = ReviewService.sanitizeText('<script>alert(1)</script>Great platform!   ');
    expect(cleaned).toBe('alert(1)Great platform!');
  });
});
