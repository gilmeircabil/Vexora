import type { Request, Response } from 'express';
import { DonationService } from '../services/donationService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class DonationController {
  static async createCheckout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { amount, displayName, isAnonymous, message, donorEmail, successUrl, cancelUrl } =
        req.body;

      if (!amount) {
        res.status(400).json({ success: false, error: 'Please enter a donation amount.' });
        return;
      }

      const numAmount = parseFloat(amount);
      const validation = DonationService.validateAmount(numAmount);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: validation.error });
        return;
      }

      const result = await DonationService.createCheckoutSession({
        amount: numAmount,
        displayName,
        isAnonymous: Boolean(isAnonymous),
        message,
        donorEmail: donorEmail || req.user?.email,
        donorUserId: req.user?.userId,
        successUrl,
        cancelUrl,
      });

      res.status(200).json({
        success: true,
        data: {
          donationId: result.donation._id,
          checkoutUrl: result.checkoutUrl,
          sessionId: result.sessionId,
          amount: result.donation.amount,
          currency: result.donation.currency,
          displayName: result.donation.displayName,
          isAnonymous: result.donation.isAnonymous,
          isSandbox: result.isSandbox,
        },
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to initialize donation' });
    }
  }

  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ success: false, error: 'Donation or Session ID is required.' });
        return;
      }

      const donation = await DonationService.verifyDonation(id);
      if (!donation) {
        res.status(404).json({ success: false, error: 'Donation record not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          donationId: donation._id,
          amount: donation.amount,
          currency: donation.currency,
          displayName: donation.displayName,
          isAnonymous: donation.isAnonymous,
          paymentStatus: donation.paymentStatus,
          verifiedAt: donation.verifiedAt,
          message: donation.message,
        },
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to fetch donation status' });
    }
  }

  static async getSummary(_req: Request, res: Response): Promise<void> {
    try {
      const summary = await DonationService.getSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (err: any) {
      res
        .status(500)
        .json({ success: false, error: err.message || 'Failed to load donation metrics' });
    }
  }

  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(50, Math.max(5, parseInt(req.query.limit as string, 10) || 20));
      const leaderboard = await DonationService.getLeaderboard(limit);
      res.status(200).json({ success: true, data: leaderboard });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to load leaderboard' });
    }
  }

  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signatureHeader =
        (req.headers['paymongo-signature'] as string) ||
        (req.headers['x-paymongo-signature'] as string);

      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const outcome = await DonationService.handleWebhook({
        rawBody,
        signatureHeader,
        body: req.body,
      });

      res.status(200).json({ success: true, outcome });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Webhook processing failed' });
    }
  }
}
