import type { Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { AIJob } from '../models/AIJob.js';
import { AIToolConfig } from '../models/AIToolConfig.js';
import { Donation } from '../models/Donation.js';
import { WebhookEvent } from '../models/WebhookEvent.js';
import { DeveloperService } from '../services/developerService.js';
import { DEFAULT_TOOL_COSTS } from '../config/plans.js';

const updateToolSchema = z.object({
  isEnabled: z.boolean().optional(),
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
      const [totalUsers, totalJobs, failedJobs, completedJobs] =
        await Promise.all([
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
      message: 'VexoraMods is 100% free and open-source. Credits are unlimited and no longer deducted.',
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
      const { moderatedDisplayName, isModerated } = req.body;

      const donation = await Donation.findById(new Types.ObjectId(donationId));
      if (!donation) {
        res.status(404).json({ success: false, error: 'Donation not found' });
        return;
      }

      if (moderatedDisplayName !== undefined) {
        donation.moderatedDisplayName = moderatedDisplayName;
        donation.isModerated = true;
      }
      if (isModerated !== undefined) {
        donation.isModerated = Boolean(isModerated);
      }

      await donation.save();
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

      res.status(200).json({ success: true, data: { events, total, page, totalPages: Math.ceil(total / limit) || 1 } });
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
}
