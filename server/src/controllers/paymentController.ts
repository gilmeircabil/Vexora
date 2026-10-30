import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { PaymentService } from '../services/payment/paymentService.js';
import { Payment } from '../models/Payment.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class PaymentController {
  static async webhook(req: Request, res: Response): Promise<void> {
    try {
      const signatureHeader =
        (req.headers['stripe-signature'] as string) ||
        (req.headers['paymongo-signature'] as string) ||
        (req.headers['x-webhook-signature'] as string) ||
        '';

      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const result = await PaymentService.handleWebhook({
        rawBody,
        signatureHeader,
        parsedBody: req.body,
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Webhook processing failed',
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
      const payments = await Payment.find({ userId: uid }).sort({ createdAt: -1 }).lean();

      res.status(200).json({
        success: true,
        data: {
          payments,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to retrieve payment records',
      });
    }
  }
}
