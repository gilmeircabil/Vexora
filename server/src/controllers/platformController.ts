import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { LearningPost } from '../models/LearningPost.js';
import { DeveloperProject } from '../models/DeveloperProject.js';
import {
  PlatformConfig,
  ContactInquiry,
  DEFAULT_MAINTENANCE_CONFIG,
} from '../models/PlatformConfig.js';
import { DonationService } from '../services/donationService.js';
import { LearningService } from '../services/learningService.js';
import { ReviewService } from '../services/reviewService.js';

let cachedHomeStats: {
  timestamp: number;
  payload: any;
} | null = null;

const STATS_CACHE_TTL_MS = 15 * 1000; // 15-second lightweight cache for public homepage aggregations

export class PlatformController {
  static clearCache() {
    cachedHomeStats = null;
  }

  /**
   * Public endpoint returning real database-backed statistics, top supporter,
   * recent learning hub posts, and platform configuration.
   */
  static async getHomeOverview(_req: Request, res: Response): Promise<void> {
    try {
      const now = Date.now();
      if (cachedHomeStats && now - cachedHomeStats.timestamp < STATS_CACHE_TTL_MS) {
        res.status(200).json({ success: true, data: cachedHomeStats.payload });
        return;
      }

      const [
        totalMembers,
        learningPostsCount,
        legacyProjectsCount,
        donationSummary,
        leaderboard,
        recentPosts,
        configDoc,
        reviewsSummary,
      ] = await Promise.all([
        User.countDocuments(),
        LearningPost.countDocuments({ status: 'published' }),
        DeveloperProject.countDocuments({ status: 'published' }),
        DonationService.getSummary(),
        DonationService.getLeaderboard(5),
        LearningPost.find({ status: 'published' })
          .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
          .limit(6)
          .select(
            'title slug excerpt category tags authorName authorAvatar authorUsername likesCount commentsCount publishedAt createdAt',
          )
          .lean(),
        PlatformConfig.findOne({ key: 'default' }).lean(),
        ReviewService.getReviewsSummary(4),
      ]);

      // Respect anonymous donation preferences for top public supporter
      const topPublicSupporter =
        leaderboard.allTime.find((entry: any) => !entry.isAnonymous) ||
        leaderboard.allTime[0] ||
        null;

      const config = configDoc || {
        contactEmail: '',
        githubUrl: '',
        socialLinks: {},
        featuredToolIds: [
          'smart-image-studio',
          'ai-image-enhancer',
          'ai-background-remover',
          'pdf-merger',
          'json-formatter',
          'qr-code-generator',
        ],
        heroHeadline: 'Everything You Need. One Platform.',
        heroDescription:
          'Discover free online tools, explore AI-powered utilities, create designs, and learn with a growing community.',
        aboutMission:
          'VexoraMods exists to provide essential digital tools, AI-assisted utilities, an online design studio, and a collaborative learning community—100% free and open source for everyone.',
      };

      const payload = {
        statistics: {
          totalMembers,
          totalLearningPosts: learningPostsCount + legacyProjectsCount,
          publishedLearningPosts: learningPostsCount,
          totalSupporters: donationSummary.uniqueSupporters,
          totalVerifiedDonations: donationSummary.totalDonations,
          totalDonationsAmount: donationSummary.totalAmount,
          currency: donationSummary.currency,
        },
        topSupporter: topPublicSupporter,
        recentPosts,
        reviewsSummary,
        config,
      };

      cachedHomeStats = {
        timestamp: now,
        payload,
      };

      res.status(200).json({ success: true, data: payload });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Public feedback / inquiry submission endpoint for the Contact Section.
   */
  static async submitContactInquiry(req: Request, res: Response): Promise<void> {
    try {
      const name = LearningService.sanitizePlain(req.body.name);
      const email = LearningService.sanitizePlain(req.body.email).toLowerCase();
      const subject = LearningService.sanitizePlain(req.body.subject);
      const message = LearningService.sanitizePlain(req.body.message);

      if (!name || !email || !email.includes('@') || !subject || !message) {
        res.status(400).json({
          success: false,
          error: 'Please complete all fields (name, valid email, subject, and message).',
        });
        return;
      }

      const inquiry = await ContactInquiry.create({
        name: name.slice(0, 100),
        email: email.slice(0, 150),
        subject: subject.slice(0, 200),
        message: message.slice(0, 3000),
      });

      res.status(201).json({
        success: true,
        data: {
          id: inquiry._id,
          message: 'Your message has been received by the VexoraMods team.',
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Public lightweight endpoint returning active maintenance mode status.
   */
  static async getMaintenanceConfig(_req: Request, res: Response): Promise<void> {
    try {
      const configDoc = await PlatformConfig.findOne({ key: 'default' })
        .select('maintenance')
        .lean();
      const maintenance = configDoc?.maintenance || DEFAULT_MAINTENANCE_CONFIG;
      res.status(200).json({ success: true, data: maintenance });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
