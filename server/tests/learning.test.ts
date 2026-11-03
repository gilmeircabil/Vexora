import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import {
  LearningPost,
  LEARNING_CATEGORIES,
  OPEN_LEARNING_TOPICS,
  LEARNING_CONTENT_TYPES,
} from '../src/models/LearningPost.js';
import { LearningLike } from '../src/models/LearningLike.js';
import { LearningBookmark } from '../src/models/LearningBookmark.js';
import {
  LearningPurchase,
  LearningEntitlement,
  LearningProgress,
  LearningReview,
  CreatorProfile,
  CreatorPayout,
} from '../src/models/LearningMarketplace.js';
import { User } from '../src/models/User.js';
import { DeveloperProfile } from '../src/models/DeveloperProfile.js';
import { WebhookEvent } from '../src/models/WebhookEvent.js';
import { LearningService } from '../src/services/learningService.js';
import { env } from '../src/config/env.js';

describe('Learning Hub Open Community & Creator Marketplace Suite', () => {
  const creatorId = new Types.ObjectId().toString();
  const learnerId = new Types.ObjectId().toString();
  const adminId = new Types.ObjectId().toString();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('defines all 13 core categories, open multidisciplinary topics, and all 8 content types', () => {
    expect(LEARNING_CATEGORIES).toContain('Web Development');
    expect(LEARNING_CATEGORIES).toContain('AI and Machine Learning');
    expect(LEARNING_CATEGORIES).toContain('Cybersecurity');
    expect(LEARNING_CATEGORIES).toContain('General Discussion');
    expect(LEARNING_CATEGORIES.length).toBe(13);

    // Phase 1: Open topics include non-programming fields
    expect(OPEN_LEARNING_TOPICS).toContain('Business');
    expect(OPEN_LEARNING_TOPICS).toContain('Entrepreneurship');
    expect(OPEN_LEARNING_TOPICS).toContain('Finance');
    expect(OPEN_LEARNING_TOPICS).toContain('Photography');
    expect(OPEN_LEARNING_TOPICS).toContain('Cooking');
    expect(OPEN_LEARNING_TOPICS).toContain('Music');
    expect(OPEN_LEARNING_TOPICS).toContain('Languages');

    // Phase 2: All 8 content types
    expect(LEARNING_CONTENT_TYPES).toEqual([
      'article',
      'video',
      'pdf',
      'file',
      'course',
      'guide',
      'code',
      'discussion',
    ]);
  });

  it('sanitizes XSS payloads and permits open/custom categories across non-programming topics', async () => {
    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: new Types.ObjectId(creatorId),
      name: 'Chef Elena',
      avatar: '',
      isSuspended: false,
    } as any);
    vi.spyOn(DeveloperProfile, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(CreatorProfile, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(LearningPost, 'findOne').mockResolvedValue(null);

    const createSpy = vi.spyOn(LearningPost, 'create').mockImplementation(async (doc: any) => ({
      _id: new Types.ObjectId(),
      ...doc,
    }));

    const post = await LearningService.createPost(creatorId, {
      title: 'Artisanal Sourdough Bread Baking <script>alert(1)</script>',
      content:
        'Learn fermentation, hydration ratios, and oven spring techniques.<script>evil()</script>',
      category: 'Culinary Arts & Baking',
      contentType: 'guide',
      pricingType: 'free',
      tags: ['Cooking', 'Sourdough', 'Fermentation'],
      steps: [
        { stepNumber: 1, title: 'Starter Feeding', content: 'Mix equal weights flour and water.' },
        { stepNumber: 2, title: 'Bulk Fermentation', content: 'Fold every 30 minutes.' },
      ],
    });

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(post.title).toBe('Artisanal Sourdough Bread Baking');
    expect(post.content).not.toContain('<script>');
    expect(post.category).toBe('Culinary Arts & Baking');
    expect(post.contentType).toBe('guide');
    expect(post.pricingType).toBe('free');
    expect(post.price).toBe(0);
    expect(post.steps.length).toBe(2);
    expect(post.tags).toEqual(['cooking', 'sourdough', 'fermentation']);
  });

  it('publishes a PAID course with chapters, ordered lessons, and free preview lessons, and enforces price > 0', async () => {
    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: new Types.ObjectId(creatorId),
      name: 'Prof. Mateo',
      isSuspended: false,
    } as any);
    vi.spyOn(DeveloperProfile, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(CreatorProfile, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(LearningPost, 'findOne').mockResolvedValue(null);
    vi.spyOn(LearningPost, 'create').mockImplementation(async (doc: any) => ({
      _id: new Types.ObjectId(),
      ...doc,
    }));

    // Rejects paid content with price 0
    await expect(
      LearningService.createPost(creatorId, {
        title: 'Invalid Paid Course',
        content: 'Detailed content for paid course.',
        pricingType: 'paid',
        price: 0,
      }),
    ).rejects.toThrow(/valid selling price greater than 0/i);

    // Rejects when rightsConfirmed is explicitly false
    await expect(
      LearningService.createPost(creatorId, {
        title: 'Unconfirmed Rights Course',
        content: 'Detailed content for paid course.',
        pricingType: 'paid',
        price: 499,
        rightsConfirmed: false,
      }),
    ).rejects.toThrow(/confirm that you own the rights/i);

    const course = await LearningService.createPost(creatorId, {
      title: 'Personal Finance & Index Investing Masterclass',
      content: 'Full curriculum covering emergency funds, ETFs, and tax efficiency.',
      previewContent: 'Public preview: Learn how to build a resilient investment portfolio.',
      category: 'Finance',
      contentType: 'course',
      pricingType: 'paid',
      price: 750,
      currency: 'PHP',
      learningOutcomes: ['Build a 6-month emergency fund', 'Understand global index funds'],
      chapters: [
        {
          chapterId: 'ch_1',
          title: 'Chapter 1: Foundations',
          order: 1,
          lessons: [
            {
              lessonId: 'les_1',
              title: 'Welcome & Mindset',
              content: 'Free preview lesson content',
              durationMinutes: 10,
              isFreePreview: true,
              order: 1,
            },
            {
              lessonId: 'les_2',
              title: 'Asset Allocation Deep Dive',
              content: 'Secret paid lesson formula and spreadsheet breakdown',
              durationMinutes: 25,
              isFreePreview: false,
              order: 2,
            },
          ],
        },
      ],
      rightsConfirmed: true,
    });

    expect(course.pricingType).toBe('paid');
    expect(course.price).toBe(750);
    expect(course.contentType).toBe('course');
    expect(course.chapters.length).toBe(1);
    expect(course.chapters[0]?.lessons.length).toBe(2);
    expect(course.readTimeMinutes).toBe(35);
  });

  it('redacts paid content, non-preview course lessons, and protected files for unentitled viewers on the backend', async () => {
    const postId = new Types.ObjectId();
    const mockPaidCourse = {
      _id: postId,
      authorId: new Types.ObjectId(creatorId),
      authorName: 'Prof. Mateo',
      title: 'Paid Photography Lighting Course',
      slug: 'paid-photography-lighting-course',
      excerpt: 'Short excerpt',
      content: 'SECRET FULL COURSE BODY THAT MUST NOT LEAK',
      previewContent: 'Public preview only: Welcome to studio lighting.',
      contentType: 'course',
      category: 'Photography',
      pricingType: 'paid',
      price: 500,
      currency: 'PHP',
      status: 'published',
      videoUrl: 'https://example.com/private-stream.mp4',
      chapters: [
        {
          chapterId: 'ch_1',
          title: 'Lighting Setups',
          order: 1,
          lessons: [
            {
              lessonId: 'l_free',
              title: 'Natural Light Intro',
              contentType: 'text',
              content: 'Public free preview lesson text',
              isFreePreview: true,
              order: 1,
            },
            {
              lessonId: 'l_paid',
              title: 'Three-Point Strobe Mastery',
              contentType: 'video',
              content: 'CONFIDENTIAL STROBE DIAGRAM & NOTES',
              videoUrl: 'https://example.com/secret-strobe.mp4',
              isFreePreview: false,
              order: 2,
            },
          ],
        },
      ],
      protectedFiles: [
        {
          fileId: 'lf_101',
          originalName: 'lighting-cheatsheet.pdf',
          mimeType: 'application/pdf',
          size: 20480,
          storageKey: 'lf_101_secret_path.pdf',
          isPreview: false,
        },
      ],
    };

    vi.spyOn(LearningPost, 'findOneAndUpdate').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockPaidCourse),
    } as any);
    vi.spyOn(LearningEntitlement, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(LearningPurchase, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(LearningLike, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(LearningBookmark, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(LearningProgress, 'findOneAndUpdate').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(LearningPost, 'find').mockReturnValue({
      select: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as any);

    // 1. Unentitled learner views the paid course
    const unentitledView = await LearningService.getPostBySlug(
      'paid-photography-lighting-course',
      learnerId,
      false,
    );

    expect(unentitledView.hasAccess).toBe(false);
    expect(unentitledView.content).toBe('Public preview only: Welcome to studio lighting.');
    expect(unentitledView.content).not.toContain('SECRET FULL COURSE BODY');
    expect(unentitledView.videoUrl).toBe('');
    expect(unentitledView.chapters[0].lessons[0].content).toBe('Public free preview lesson text');
    expect(unentitledView.chapters[0].lessons[0].isLocked).toBe(false);
    expect(unentitledView.chapters[0].lessons[1].content).toBe('');
    expect(unentitledView.chapters[0].lessons[1].videoUrl).toBe('');
    expect(unentitledView.chapters[0].lessons[1].isLocked).toBe(true);
    expect(unentitledView.protectedFiles[0].isLocked).toBe(true);
    expect(unentitledView.protectedFiles[0].downloadUrl).toBeNull();
    expect(unentitledView.protectedFiles[0].storageKey).toBeUndefined();

    // 2. Blocking direct protected file download for unentitled user
    vi.spyOn(LearningPost, 'findById').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockPaidCourse),
    } as any);

    await expect(
      LearningService.getProtectedFileForDownload(String(postId), 'lf_101', learnerId, false),
    ).rejects.toThrow(/Purchase required/i);
  });

  it('rejects malware/executable file signatures (MZ, ELF, <script>) during upload validation', () => {
    // Windows MZ executable header
    expect(() =>
      LearningService.validateFileSecurity({
        originalname: ' disguised.pdf',
        mimetype: 'application/pdf',
        size: 128,
        buffer: Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03]),
      }),
    ).toThrow(/Windows PE\/MZ executable signature/i);

    // Linux ELF binary header
    expect(() =>
      LearningService.validateFileSecurity({
        originalname: 'binary.pdf',
        mimetype: 'application/pdf',
        size: 128,
        buffer: Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02]),
      }),
    ).toThrow(/ELF executable binary signature/i);

    // Embedded script payload
    expect(() =>
      LearningService.validateFileSecurity({
        originalname: 'notes.txt',
        mimetype: 'text/plain',
        size: 128,
        buffer: Buffer.from('<script>fetch("http://attacker.tld")</script>', 'utf8'),
      }),
    ).toThrow(/embedded <script> payload/i);

    // Valid PDF magic bytes pass
    expect(() =>
      LearningService.validateFileSecurity({
        originalname: 'workbook.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj', 'utf8'),
      }),
    ).not.toThrow();
  });

  it('processes purchase checkout, HMAC webhook verification, idempotency, entitlement unlock, and refund revocation', async () => {
    const postId = new Types.ObjectId();
    const purchaseId = new Types.ObjectId();

    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: new Types.ObjectId(learnerId),
      name: 'Buyer Sam',
      isSuspended: false,
    } as any);

    vi.spyOn(LearningPost, 'findById').mockResolvedValue({
      _id: postId,
      authorId: new Types.ObjectId(creatorId),
      title: 'Advanced Music Production Course',
      slug: 'advanced-music-production',
      pricingType: 'paid',
      price: 1000,
      currency: 'PHP',
      status: 'published',
    } as any);

    vi.spyOn(LearningEntitlement, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(LearningPurchase, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    let savedPurchaseDoc: any = null;
    vi.spyOn(LearningPurchase, 'create').mockImplementation(async (doc: any) => {
      savedPurchaseDoc = {
        _id: purchaseId,
        ...doc,
        save: vi.fn().mockResolvedValue(true),
      };
      return savedPurchaseDoc;
    });

    // Step 1: Create checkout session (status is 'pending', does NOT unlock content yet)
    const checkout = await LearningService.createPurchaseCheckout(learnerId, String(postId), {
      paymentProvider: 'sandbox',
    });

    expect(checkout.status).toBe('pending');
    expect(checkout.amount).toBe(1000);
    expect(checkout.requiresWebhookVerification).toBe(true);
    expect(savedPurchaseDoc.creatorNetEarnings).toBeGreaterThan(0);
    expect(savedPurchaseDoc.creatorNetEarnings).toBeLessThanOrEqual(1000);

    // Step 2: Reject webhook with invalid signature
    const payloadObj = {
      eventId: 'evt_learn_001',
      eventType: 'payment.paid' as const,
      purchaseId: String(purchaseId),
      providerSessionId: checkout.providerSessionId,
      providerPaymentId: 'pay_verified_999',
    };
    const rawBody = JSON.stringify(payloadObj);

    await expect(
      LearningService.handleLearningPaymentWebhook({
        provider: 'sandbox',
        rawBody,
        signatureHeader: 'invalid_signature',
        payload: payloadObj,
      }),
    ).rejects.toThrow(/Invalid webhook signature/i);

    // Step 3: Valid HMAC webhook unlocks purchase and grants LearningEntitlement
    const validSignature = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(rawBody, 'utf8')
      .digest('hex');

    let webhookProcessed = false;
    vi.spyOn(WebhookEvent, 'findOne').mockImplementation((() => ({
      lean: vi.fn().mockResolvedValue(webhookProcessed ? { processingStatus: 'processed' } : null),
    })) as any);
    vi.spyOn(WebhookEvent, 'findOneAndUpdate').mockResolvedValue({
      eventId: 'evt_learn_001',
      processingStatus: 'received',
      save: vi.fn().mockImplementation(async () => {
        webhookProcessed = true;
      }),
    } as any);

    vi.spyOn(LearningPurchase, 'findOne').mockResolvedValue(savedPurchaseDoc);
    const entitlementUpsertSpy = vi
      .spyOn(LearningEntitlement, 'findOneAndUpdate')
      .mockResolvedValue({ isActive: true } as any);
    vi.spyOn(LearningProgress, 'findOneAndUpdate').mockResolvedValue({} as any);
    vi.spyOn(LearningPost, 'updateOne').mockResolvedValue({} as any);

    const webhookRes = await LearningService.handleLearningPaymentWebhook({
      provider: 'sandbox',
      rawBody,
      signatureHeader: validSignature,
      payload: payloadObj,
    });

    expect(webhookRes.duplicate).toBe(false);
    expect(webhookRes.status).toBe('succeeded');
    expect(savedPurchaseDoc.status).toBe('succeeded');
    expect(entitlementUpsertSpy).toHaveBeenCalledTimes(1);

    // Step 4: Duplicate webhook with same eventId is ignored idempotently
    const duplicateRes = await LearningService.handleLearningPaymentWebhook({
      provider: 'sandbox',
      rawBody,
      signatureHeader: validSignature,
      payload: payloadObj,
    });
    expect(duplicateRes.duplicate).toBe(true);

    // Step 5: Refund revokes buyer entitlement
    vi.spyOn(LearningPurchase, 'findById').mockResolvedValue(savedPurchaseDoc);
    const revokeSpy = vi.spyOn(LearningEntitlement, 'updateOne').mockResolvedValue({} as any);

    const refunded = await LearningService.refundPurchase(
      String(purchaseId),
      creatorId,
      false,
      'Customer requested refund',
    );
    expect(refunded.status).toBe('refunded');
    expect(revokeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: savedPurchaseDoc.buyerId,
        postId: savedPurchaseDoc.postId,
      }),
      expect.objectContaining({
        $set: expect.objectContaining({ isActive: false }),
      }),
    );
  });

  it('tracks course lesson completion and calculates accurate course progress', async () => {
    const postId = new Types.ObjectId();
    vi.spyOn(LearningPost, 'findById').mockResolvedValue({
      _id: postId,
      authorId: new Types.ObjectId(creatorId),
      pricingType: 'free',
      price: 0,
      chapters: [
        {
          chapterId: 'ch_1',
          title: 'Chapter 1',
          order: 1,
          lessons: [
            { lessonId: 'l1', title: 'Lesson 1', order: 1, contentType: 'text', content: 'A' },
            { lessonId: 'l2', title: 'Lesson 2', order: 2, contentType: 'text', content: 'B' },
          ],
        },
      ],
    } as any);

    const progressState: any = {
      userId: new Types.ObjectId(learnerId),
      postId,
      completedLessonIds: [],
      progressPercent: 0,
      isCompleted: false,
      save: vi.fn().mockResolvedValue(true),
    };
    vi.spyOn(LearningProgress, 'findOne').mockResolvedValue(progressState);

    // Complete Lesson 1 -> 50%
    const afterL1 = await LearningService.updateCourseProgress(learnerId, String(postId), {
      lessonId: 'l1',
      completed: true,
    });
    expect(afterL1.progressPercent).toBe(50);
    expect(afterL1.isCompleted).toBe(false);

    // Complete Lesson 2 -> 100% and isCompleted = true
    const afterL2 = await LearningService.updateCourseProgress(learnerId, String(postId), {
      lessonId: 'l2',
      completed: true,
    });
    expect(afterL2.progressPercent).toBe(100);
    expect(afterL2.isCompleted).toBe(true);
  });

  it('marks verified purchase reviews accurately and recalculates average rating from approved reviews only', async () => {
    const postId = new Types.ObjectId();
    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: new Types.ObjectId(learnerId),
      name: 'Verified Buyer Nina',
      avatar: '',
      isSuspended: false,
    } as any);
    vi.spyOn(LearningPost, 'findById').mockResolvedValue({
      _id: postId,
      authorId: new Types.ObjectId(creatorId),
      pricingType: 'paid',
      price: 450,
      status: 'published',
    } as any);

    // Buyer has a succeeded purchase record
    vi.spyOn(LearningPurchase, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        status: 'succeeded',
      }),
    } as any);
    vi.spyOn(LearningEntitlement, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({ isActive: true }),
    } as any);

    const upsertSpy = vi.spyOn(LearningReview, 'findOneAndUpdate').mockResolvedValue({
      _id: new Types.ObjectId(),
      postId,
      userId: new Types.ObjectId(learnerId),
      rating: 5,
      comment: 'Incredible depth and practical exercises!',
      isVerifiedPurchase: true,
      status: 'approved',
    } as any);

    vi.spyOn(LearningReview, 'aggregate').mockResolvedValue([
      { _id: postId, avgRating: 4.8, count: 5 },
    ]);
    vi.spyOn(LearningPost, 'updateOne').mockResolvedValue({} as any);

    const res = await LearningService.upsertReview(learnerId, String(postId), {
      rating: 5,
      comment: 'Incredible depth and practical exercises!',
    });

    expect(upsertSpy).toHaveBeenCalledWith(
      { postId, userId: new Types.ObjectId(learnerId) },
      expect.objectContaining({
        $set: expect.objectContaining({
          rating: 5,
          isVerifiedPurchase: true,
          status: 'approved',
        }),
      }),
      expect.any(Object),
    );
    expect(res.averageRating).toBe(4.8);
    expect(res.reviewCount).toBe(5);
  });

  it('computes real DB-backed creator dashboard earnings and blocks payout requests exceeding available balance', async () => {
    vi.spyOn(LearningPost, 'find').mockReturnValue({
      select: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: new Types.ObjectId(),
              title: 'Course A',
              slug: 'course-a',
              pricingType: 'paid',
              price: 1000,
              status: 'published',
              viewsCount: 150,
              likesCount: 25,
              enrollmentCount: 2,
            },
          ]),
        }),
      }),
    } as any);

    vi.spyOn(LearningPurchase, 'find').mockReturnValue({
      populate: vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              {
                _id: new Types.ObjectId(),
                postId: new Types.ObjectId(),
                amount: 1000,
                platformFee: 0,
                processingFee: 29,
                creatorNetEarnings: 971,
                status: 'succeeded',
              },
              {
                _id: new Types.ObjectId(),
                postId: new Types.ObjectId(),
                amount: 1000,
                platformFee: 0,
                processingFee: 29,
                creatorNetEarnings: 971,
                status: 'refunded',
              },
            ]),
          }),
        }),
      }),
    } as any);

    vi.spyOn(CreatorPayout, 'find').mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: new Types.ObjectId(),
            amount: 400,
            status: 'pending',
          },
        ]),
      }),
    } as any);

    vi.spyOn(CreatorProfile, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const dashboard = await LearningService.getCreatorDashboard(creatorId);

    expect(dashboard.overview.verifiedPurchases).toBe(1);
    expect(dashboard.overview.refundsCount).toBe(1);
    expect(dashboard.overview.grossSales).toBe(1000);
    expect(dashboard.overview.netCreatorEarnings).toBe(971);
    expect(dashboard.overview.pendingPayouts).toBe(400);
    // Available balance = 971 net earnings - 400 pending payout = 571
    expect(dashboard.overview.availableEarnings).toBe(571);

    // Rejects payout request higher than 571
    await expect(
      LearningService.requestPayout(creatorId, {
        amount: 600,
        payoutMethod: 'gcash',
        payoutAccountInfo: '09171234567',
      }),
    ).rejects.toThrow(/exceeds your available verified balance/i);
  });

  it('toggles post likes and recalculates accurate like count', async () => {
    const postId = new Types.ObjectId().toString();
    const saveMock = vi.fn().mockResolvedValue(true);

    vi.spyOn(LearningPost, 'findById').mockResolvedValue({
      _id: new Types.ObjectId(postId),
      status: 'published',
      likesCount: 0,
      save: saveMock,
    } as any);

    vi.spyOn(LearningLike, 'findOne').mockResolvedValue(null);
    vi.spyOn(LearningLike, 'create').mockResolvedValue({} as any);
    vi.spyOn(LearningLike, 'countDocuments').mockResolvedValue(1);

    const res = await LearningService.togglePostLike(learnerId, postId);
    expect(res).toEqual({ liked: true, likesCount: 1 });
    expect(saveMock).toHaveBeenCalled();
  });

  it('allows admins to moderate post visibility, featured flag, reviews, and creator payouts', async () => {
    const postId = new Types.ObjectId().toString();
    const saveMock = vi.fn().mockResolvedValue(true);
    const mockPost: any = {
      _id: new Types.ObjectId(postId),
      status: 'published',
      isFeatured: false,
      save: saveMock,
    };

    vi.spyOn(LearningPost, 'findById').mockResolvedValue(mockPost);

    const updated = await LearningService.adminModeratePost(postId, {
      status: 'hidden',
      isFeatured: true,
    });

    expect(updated.status).toBe('hidden');
    expect(updated.isFeatured).toBe(true);
    expect(saveMock).toHaveBeenCalled();

    const payoutId = new Types.ObjectId().toString();
    const payoutSaveMock = vi.fn().mockResolvedValue(true);
    vi.spyOn(CreatorPayout, 'findById').mockResolvedValue({
      _id: new Types.ObjectId(payoutId),
      status: 'pending',
      save: payoutSaveMock,
    } as any);

    const processedPayout = await LearningService.adminProcessPayout(payoutId, adminId, {
      status: 'paid',
      adminNotes: 'Transferred via GCash ref #8821',
    });
    expect(processedPayout.status).toBe('paid');
    expect(processedPayout.adminNotes).toBe('Transferred via GCash ref #8821');
    expect(payoutSaveMock).toHaveBeenCalled();
  });
});
