import type { Response } from 'express';
import { Types } from 'mongoose';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { CreditService } from '../services/creditService.js';
import { CreditTransaction } from '../models/CreditTransaction.js';

export class CreditController {
  static async getBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const account = await CreditService.getOrCreateAccount(req.user.userId);
      const balance = CreditService.calculateBalance(account);

      res.status(200).json({
        success: true,
        data: balance,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve credit balance',
      });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const uid = new Types.ObjectId(req.user.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        CreditTransaction.find({ userId: uid })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CreditTransaction.countDocuments({ userId: uid }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve transaction history',
      });
    }
  }

  static async getUsage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const uid = new Types.ObjectId(req.user.userId);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const usageByTool = await CreditTransaction.aggregate([
        {
          $match: {
            userId: uid,
            type: 'consumption',
            status: 'committed',
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: '$tool',
            totalCredits: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]);

      res.status(200).json({
        success: true,
        data: {
          usageByTool,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve credit usage',
      });
    }
  }
}
