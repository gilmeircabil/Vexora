import type { Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Payment } from '../models/Payment.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { AIJob } from '../models/AIJob.js';
import { WebhookEvent } from '../models/WebhookEvent.js';
import { AIToolConfig } from '../models/AIToolConfig.js';
import { CreditService } from '../services/creditService.js';
import { DEFAULT_TOOL_COSTS } from '../config/plans.js';

const adjustCreditSchema = z.object({
  userId: z.string(),
  amount: z.number().int(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

const updateToolSchema = z.object({
  creditCost: z.number().int().min(1).optional(),
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
    try {
      const subscriptions = await Subscription.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      res.status(200).json({ success: true, data: { subscriptions } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getPayments(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const payments = await Payment.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      res.status(200).json({ success: true, data: { payments } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getUsage(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [totalUsers, activeSubs, totalJobs, failedJobs, totalCreditsConsumed] =
        await Promise.all([
          User.countDocuments(),
          Subscription.countDocuments({ status: 'active', plan: { $ne: 'free' } }),
          AIJob.countDocuments(),
          AIJob.countDocuments({ status: 'failed' }),
          CreditTransaction.aggregate([
            { $match: { type: 'consumption', status: 'committed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
        ]);

      const recentFailedJobs = await AIJob.find({ status: 'failed' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const webhookEvents = await WebhookEvent.find().sort({ receivedAt: -1 }).limit(20).lean();

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalUsers,
            activePaidSubscriptions: activeSubs,
            totalAIJobs: totalJobs,
            failedAIJobs: failedJobs,
            totalCreditsConsumed: totalCreditsConsumed[0]?.total || 0,
          },
          recentFailedJobs,
          webhookEvents,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async adjustCredits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const parsed = adjustCreditSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Validation error',
        });
        return;
      }

      const adminId = req.user!.userId;
      const result = await CreditService.adjustCreditsAdmin({
        userId: parsed.data.userId,
        adminId,
        amount: parsed.data.amount,
        reason: parsed.data.reason,
      });

      res.status(200).json({
        success: true,
        message: `Successfully adjusted credits by ${parsed.data.amount}`,
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
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
          creditCost: fromDb ? fromDb.creditCost : defaultTool.creditCost,
          minPlan: fromDb ? fromDb.minPlan : defaultTool.minPlan,
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
            creditCost: parsed.data.creditCost ?? defaultTool.creditCost,
            isEnabled: parsed.data.isEnabled ?? defaultTool.isEnabled,
            minPlan: defaultTool.minPlan,
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
}
