import type { Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { PLANS_CONFIG, type PlanTier, type BillingInterval } from '../config/plans.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { PaymentService } from '../services/payment/paymentService.js';
import { env } from '../config/env.js';

const checkoutSchema = z.object({
  plan: z.enum(['pro', 'premium']),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
});

export class SubscriptionController {
  static async getPlans(_req: any, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        plans: Object.values(PLANS_CONFIG),
      },
    });
  }

  static async getCurrent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const uid = new Types.ObjectId(req.user.userId);
      const subscription = await Subscription.findOne({ userId: uid });

      res.status(200).json({
        success: true,
        data: subscription || {
          plan: 'free',
          status: 'active',
          billingInterval: 'monthly',
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve subscription',
      });
    }
  }

  static async createCheckout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const parsed = checkoutSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid plan selection',
        });
        return;
      }

      const uid = new Types.ObjectId(req.user.userId);
      const user = await User.findById(uid);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const successUrl = `${env.CLIENT_URL}/dashboard?checkout=success`;
      const cancelUrl = `${env.CLIENT_URL}/pricing?checkout=canceled`;

      const result = await PaymentService.createCheckout({
        userId: (user._id as Types.ObjectId).toString(),
        userEmail: user.email,
        userName: user.name,
        plan: parsed.data.plan as PlanTier,
        interval: parsed.data.interval as BillingInterval,
        successUrl,
        cancelUrl,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to initialize checkout session',
      });
    }
  }

  static async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const uid = new Types.ObjectId(req.user.userId);
      const subscription = await Subscription.findOne({ userId: uid });

      if (!subscription || subscription.plan === 'free') {
        res.status(400).json({
          success: false,
          error: 'No active paid subscription to cancel.',
        });
        return;
      }

      subscription.cancelAtPeriodEnd = true;
      await subscription.save();

      res.status(200).json({
        success: true,
        message: 'Your subscription will not renew after the current billing period.',
        data: subscription,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to cancel subscription',
      });
    }
  }
}
