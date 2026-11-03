import type { Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { AIJob } from '../models/AIJob.js';
import { AIToolConfig } from '../models/AIToolConfig.js';
import { Donation } from '../models/Donation.js';
import { WebhookEvent } from '../models/WebhookEvent.js';
import {
  PlatformConfig,
  ContactInquiry,
  DEFAULT_MAINTENANCE_CONFIG,
} from '../models/PlatformConfig.js';
import { DeveloperService } from '../services/developerService.js';
import { LearningService } from '../services/learningService.js';
import { PlatformController } from './platformController.js';
import { DEFAULT_TOOL_COSTS } from '../config/plans.js';

const updateToolSchema = z.object({
  isEnabled: z.boolean().optional(),
});

const updateMaintenanceSchema = z.object({
  global: z.boolean().optional(),
  title: z.string().max(120).optional(),
  message: z.string().max(1000).optional(),
  estimatedReturn: z.string().max(100).optional(),
  pages: z.record(z.string(), z.boolean()).optional(),
});

export class AdminController {
  static async getUsers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const users = await User.find()
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      res.status(200).json({ success: true, data: { users } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getSubscriptions(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({ success: true, data: { subscriptions: [] } });
  }

  static async getPayments(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({ success: true, data: { payments: [] } });
  }

  static async getUsage(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [totalUsers, totalJobs, failedJobs, completedJobs] = await Promise.all([
        User.countDocuments(),
        AIJob.countDocuments(),
        AIJob.countDocuments({ status: 'failed' }),
        AIJob.countDocuments({ status: 'completed' }),
      ]);

      const recentFailedJobs = await AIJob.find({ status: 'failed' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalUsers,
            activePaidSubscriptions: 0,
            totalAIJobs: totalJobs,
            failedAIJobs: failedJobs,
            completedAIJobs: completedJobs,
            totalCreditsConsumed: 0,
          },
          recentFailedJobs,
          webhookEvents: [],
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async adjustCredits(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message:
        'VexoraMods is 100% free and open-source. Credits are unlimited and no longer deducted.',
      data: { balance: 999999 },
    });
  }

  static async getTools(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const toolsFromDb = await AIToolConfig.find().lean();
      const dbMap = new Map(toolsFromDb.map((t) => [t.toolId, t]));

      const combined = Object.values(DEFAULT_TOOL_COSTS).map((defaultTool) => {
        const fromDb = dbMap.get(defaultTool.toolId);
        return {
          toolId: defaultTool.toolId,
          name: defaultTool.name,
          creditCost: 0,
          minPlan: 'free',
          isEnabled: fromDb ? fromDb.isEnabled : defaultTool.isEnabled,
        };
      });

      res.status(200).json({ success: true, data: { tools: combined } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateTool(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const toolId = req.params.toolId as string;
      const parsed = updateToolSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, error: parsed.error.issues[0]?.message });
        return;
      }

      const defaultTool = DEFAULT_TOOL_COSTS[toolId];
      if (!defaultTool) {
        res.status(404).json({ success: false, error: 'Unknown tool ID' });
        return;
      }

      const updated = await AIToolConfig.findOneAndUpdate(
        { toolId },
        {
          $set: {
            name: defaultTool.name,
            creditCost: 0,
            isEnabled: parsed.data.isEnabled ?? defaultTool.isEnabled,
            minPlan: 'free',
          },
        },
        { upsert: true, new: true },
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Admin Donation Management
  // --------------------------------------------------------------------------

  static async getDonations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q, status, page, limit } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const query: any = {};
      if (status) query.paymentStatus = status;
      if (q) {
        query.$or = [
          { displayName: { $regex: q, $options: 'i' } },
          { providerTransactionId: { $regex: q, $options: 'i' } },
          { message: { $regex: q, $options: 'i' } },
        ];
      }

      const [donations, total, stats] = await Promise.all([
        Donation.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        Donation.countDocuments(query),
        Donation.aggregate([
          {
            $group: {
              _id: '$paymentStatus',
              totalAmount: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          donations,
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          stats,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateDonation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const donationId = req.params.id as string;
      const { moderatedDisplayName, message, isModerated } = req.body;

      const donation = await Donation.findById(new Types.ObjectId(donationId));
      if (!donation) {
        res.status(404).json({ success: false, error: 'Donation not found' });
        return;
      }

      if (moderatedDisplayName !== undefined) {
        donation.moderatedDisplayName = LearningService.sanitizePlain(moderatedDisplayName);
        donation.isModerated = true;
      }
      if (message !== undefined) {
        donation.message = LearningService.sanitizePlain(message).slice(0, 280);
        donation.isModerated = true;
      }
      if (isModerated !== undefined) {
        donation.isModerated = Boolean(isModerated);
      }

      await donation.save();
      PlatformController.clearCache();
      res.status(200).json({ success: true, data: donation });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getDonationWebhooks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const skip = (page - 1) * limit;

      const [events, total] = await Promise.all([
        WebhookEvent.find().sort({ receivedAt: -1 }).skip(skip).limit(limit).lean(),
        WebhookEvent.countDocuments(),
      ]);

      res.status(200).json({
        success: true,
        data: { events, total, page, totalPages: Math.ceil(total / limit) || 1 },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Admin Developer Hub Management
  // --------------------------------------------------------------------------

  static async getDevelopers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q, page, limit } = req.query;
      const result = await DeveloperService.adminListDevelopers({
        q: q as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateDeveloper(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profileId = req.params.id as string;
      const { isFeatured, isSuspended, suspensionReason } = req.body;

      const updated = await DeveloperService.adminSetDeveloperStatus(profileId, {
        isFeatured,
        isSuspended,
        suspensionReason,
      });

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q, category, page, limit } = req.query;
      const result = await DeveloperService.adminListProjects({
        q: q as string,
        category: category as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = req.params.id as string;
      const { status, isFeatured } = req.body;

      const updated = await DeveloperService.adminSetProjectStatus(projectId, {
        status,
        isFeatured,
      });

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = req.params.id as string;
      const result = await DeveloperService.adminDeleteProject(projectId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, page, limit } = req.query;
      const result = await DeveloperService.adminListReports({
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async resolveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const reportId = req.params.id as string;
      const { status, actionTaken } = req.body;

      if (!req.user?.userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const updated = await DeveloperService.adminResolveReport(reportId, {
        status: status || 'resolved',
        actionTaken,
        adminUserId: req.user.userId,
      });

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Admin User Account Moderation
  // --------------------------------------------------------------------------

  static async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.id as string;
      const { isSuspended, suspensionReason } = req.body;

      const user = await User.findById(new Types.ObjectId(userId));
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      if (user.role === 'admin') {
        res.status(400).json({ success: false, error: 'Cannot suspend an administrator account' });
        return;
      }

      if (isSuspended !== undefined) user.isSuspended = Boolean(isSuspended);
      if (suspensionReason !== undefined) {
        user.suspensionReason = LearningService.sanitizePlain(suspensionReason);
      }

      await user.save();
      res.status(200).json({ success: true, data: user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Admin Learning Hub Management
  // --------------------------------------------------------------------------

  static async getLearningPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q, status, category, page, limit } = req.query;
      const result = await LearningService.adminListPosts({
        q: q as string,
        status: status as string,
        category: category as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async moderateLearningPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const { status, isFeatured } = req.body;
      const updated = await LearningService.adminModeratePost(postId, { status, isFeatured });
      PlatformController.clearCache();
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async deleteLearningPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id as string;
      const result = await LearningService.deletePost(req.user?.userId || '', postId, true);
      PlatformController.clearCache();
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getLearningComments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, page, limit } = req.query;
      const result = await LearningService.adminListComments({
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async moderateLearningComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const commentId = req.params.id as string;
      const { status } = req.body;
      const updated = await LearningService.adminModerateComment(commentId, status || 'hidden');
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getLearningReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, page, limit } = req.query;
      const result = await LearningService.adminListReports({
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async resolveLearningReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const reportId = req.params.id as string;
      const { status, actionTaken } = req.body;
      const updated = await LearningService.adminResolveReport(reportId, {
        status: status || 'resolved',
        actionTaken,
        adminUserId: req.user?.userId || '',
      });
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async moderateLearningReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const reviewId = req.params.id as string;
      const { status } = req.body;
      const updated = await LearningService.adminModerateReview(reviewId, status || 'hidden');
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getLearningPayouts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, page, limit } = req.query;
      const result = await LearningService.adminListPayouts({
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async processLearningPayout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const payoutId = req.params.id as string;
      const { status, adminNotes } = req.body;
      const updated = await LearningService.adminProcessPayout(payoutId, req.user?.userId || '', {
        status,
        adminNotes,
      });
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // --------------------------------------------------------------------------
  // Admin Homepage & Platform Config Management
  // --------------------------------------------------------------------------

  static async getPlatformConfig(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [configDoc, inquiries] = await Promise.all([
        PlatformConfig.findOne({ key: 'default' }).lean(),
        ContactInquiry.find().sort({ createdAt: -1 }).limit(30).lean(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          config: configDoc || {
            key: 'default',
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
          },
          inquiries,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updatePlatformConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        contactEmail,
        githubUrl,
        socialLinks,
        featuredToolIds,
        heroHeadline,
        heroDescription,
        aboutMission,
      } = req.body;

      const updateFields: Record<string, any> = {};
      if (contactEmail !== undefined) {
        updateFields.contactEmail = LearningService.sanitizePlain(contactEmail);
      }
      if (githubUrl !== undefined) {
        updateFields.githubUrl = LearningService.sanitizePlain(githubUrl);
      }
      if (socialLinks && typeof socialLinks === 'object') {
        updateFields.socialLinks = {
          github: LearningService.sanitizePlain(socialLinks.github),
          twitter: LearningService.sanitizePlain(socialLinks.twitter),
          discord: LearningService.sanitizePlain(socialLinks.discord),
          linkedin: LearningService.sanitizePlain(socialLinks.linkedin),
          youtube: LearningService.sanitizePlain(socialLinks.youtube),
        };
      }
      if (Array.isArray(featuredToolIds)) {
        updateFields.featuredToolIds = featuredToolIds
          .map((id: string) => LearningService.sanitizePlain(id))
          .filter(Boolean);
      }
      if (heroHeadline !== undefined) {
        updateFields.heroHeadline = LearningService.sanitizePlain(heroHeadline);
      }
      if (heroDescription !== undefined) {
        updateFields.heroDescription = LearningService.sanitizePlain(heroDescription);
      }
      if (aboutMission !== undefined) {
        updateFields.aboutMission = LearningService.sanitizePlain(aboutMission);
      }
      if (req.user?.userId && Types.ObjectId.isValid(req.user.userId)) {
        updateFields.updatedBy = new Types.ObjectId(req.user.userId);
      }

      const config = await PlatformConfig.findOneAndUpdate(
        { key: 'default' },
        { $set: updateFields },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      PlatformController.clearCache();
      res.status(200).json({ success: true, data: config });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateMaintenanceConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = updateMaintenanceSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error:
            parsed.error.issues.map((i) => i.message).join(', ') ||
            'Invalid maintenance configuration',
        });
        return;
      }

      const { global, title, message, estimatedReturn, pages } = parsed.data;
      const updateFields: Record<string, any> = {};

      if (global !== undefined) {
        updateFields['maintenance.global'] = global;
      }
      if (title !== undefined) {
        updateFields['maintenance.title'] = LearningService.sanitizePlain(title);
      }
      if (message !== undefined) {
        updateFields['maintenance.message'] = LearningService.sanitizePlain(message);
      }
      if (estimatedReturn !== undefined) {
        updateFields['maintenance.estimatedReturn'] =
          LearningService.sanitizePlain(estimatedReturn);
      }
      if (pages && typeof pages === 'object') {
        for (const [key, value] of Object.entries(pages)) {
          if (typeof value === 'boolean') {
            updateFields[`maintenance.pages.${key}`] = value;
          }
        }
      }

      if (req.user?.userId && Types.ObjectId.isValid(req.user.userId)) {
        updateFields.updatedBy = new Types.ObjectId(req.user.userId);
      }

      const updated = await PlatformConfig.findOneAndUpdate(
        { key: 'default' },
        { $set: updateFields },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
        .select('maintenance')
        .lean();

      PlatformController.clearCache();

      res.status(200).json({
        success: true,
        data: updated?.maintenance || DEFAULT_MAINTENANCE_CONFIG,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
