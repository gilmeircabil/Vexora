import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { Donation, type IDonation } from '../models/Donation.js';
import { WebhookEvent } from '../models/WebhookEvent.js';

export interface CreateDonationInput {
  amount: number;
  displayName?: string;
  isAnonymous?: boolean;
  message?: string;
  donorEmail?: string;
  donorUserId?: string | Types.ObjectId;
  successUrl?: string;
  cancelUrl?: string;
}

export class DonationService {
  /**
   * Validates custom donation amount against configurable platform limits.
   */
  static validateAmount(amount: number): { valid: boolean; error?: string } {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return { valid: false, error: 'Please enter a valid numeric donation amount.' };
    }

    if (amount < env.DONATION_MIN_AMOUNT) {
      return {
        valid: false,
        error: `Minimum donation amount is ${env.DONATION_CURRENCY} ₱${env.DONATION_MIN_AMOUNT}.`,
      };
    }

    if (amount > env.DONATION_MAX_AMOUNT) {
      return {
        valid: false,
        error: `Maximum donation amount is ${env.DONATION_CURRENCY} ₱${env.DONATION_MAX_AMOUNT.toLocaleString()}.`,
      };
    }

    return { valid: true };
  }

  /**
   * Sanitize text input to prevent XSS payloads and strip unwanted characters.
   */
  private static sanitizeText(str?: string): string {
    if (!str) return '';
    return str
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .trim();
  }

  /**
   * Creates a voluntary donation checkout session.
   */
  static async createCheckoutSession(input: CreateDonationInput): Promise<{
    donation: IDonation;
    checkoutUrl: string;
    sessionId: string;
    isSandbox: boolean;
  }> {
    const amountVal = this.validateAmount(input.amount);
    if (!amountVal.valid) {
      throw new Error(amountVal.error);
    }

    const cleanAmount = Math.round(input.amount * 100) / 100;
    const isAnonymous = Boolean(input.isAnonymous);
    const rawDisplayName = this.sanitizeText(input.displayName);
    const displayName = isAnonymous ? 'Anonymous Supporter' : rawDisplayName || 'Supporter';
    const cleanMessage = this.sanitizeText(input.message).slice(0, 280);

    const clientOrigin = input.successUrl ? new URL(input.successUrl).origin : env.CLIENT_URL;
    const providerTxId = `don_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Create pending donation document in MongoDB
    const donation = await Donation.create({
      donorUserId: input.donorUserId ? new Types.ObjectId(input.donorUserId) : undefined,
      displayName,
      donorEmail: input.donorEmail?.trim().toLowerCase(),
      isAnonymous,
      message: cleanMessage,
      amount: cleanAmount,
      currency: env.DONATION_CURRENCY,
      paymentProvider: env.PAYMONGO_SECRET_KEY ? 'paymongo' : 'sandbox',
      providerTransactionId: providerTxId,
      paymentStatus: 'pending',
    });

    // 1. If PayMongo is configured, call PayMongo Checkout API
    if (env.PAYMONGO_SECRET_KEY) {
      const amountInCentavos = Math.round(cleanAmount * 100);
      const authHeader = Buffer.from(`${env.PAYMONGO_SECRET_KEY}:`).toString('base64');

      const payload = {
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            description: `VexoraMods Voluntary Contribution (${env.DONATION_CURRENCY} ₱${cleanAmount.toFixed(2)})`,
            line_items: [
              {
                currency: 'PHP',
                amount: amountInCentavos,
                name: 'VexoraMods Voluntary Support',
                quantity: 1,
                description: 'Voluntary donation to keep VexoraMods free and open source',
              },
            ],
            payment_method_types: ['gcash', 'paymaya', 'card', 'grab_pay'],
            success_url: `${clientOrigin}/community?status=success&session_id={CHECKOUT_SESSION_ID}&donation_id=${donation._id}`,
            cancel_url: `${clientOrigin}/community?status=canceled`,
            metadata: {
              donationId: donation._id.toString(),
              providerTransactionId: providerTxId,
              isDonation: 'true',
            },
          },
        },
      };

      const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PayMongo Checkout Error: ${errText}`);
      }

      const resData = (await response.json()) as any;
      const checkoutSession = resData.data;

      donation.providerTransactionId = checkoutSession.id;
      donation.checkoutUrl = checkoutSession.attributes.checkout_url;
      await donation.save();

      return {
        donation,
        checkoutUrl: checkoutSession.attributes.checkout_url,
        sessionId: checkoutSession.id,
        isSandbox: false,
      };
    }

    // 2. Local sandbox / testing environment flow
    const sandboxSessionId = `sbx_sess_${providerTxId}`;
    const sandboxCheckoutUrl = `${clientOrigin}/community?status=sandbox&session_id=${sandboxSessionId}&donation_id=${donation._id}`;

    donation.providerTransactionId = sandboxSessionId;
    donation.checkoutUrl = sandboxCheckoutUrl;
    await donation.save();

    return {
      donation,
      checkoutUrl: sandboxCheckoutUrl,
      sessionId: sandboxSessionId,
      isSandbox: true,
    };
  }

  /**
   * Verify donation status server-side (never trusts frontend status).
   */
  static async verifyDonation(donationIdOrSessionId: string): Promise<IDonation | null> {
    let query: any = {};
    if (Types.ObjectId.isValid(donationIdOrSessionId)) {
      query = { _id: new Types.ObjectId(donationIdOrSessionId) };
    } else {
      query = { providerTransactionId: donationIdOrSessionId };
    }

    const donation = await Donation.findOne(query);
    if (!donation) return null;

    // If already verified, return immediately
    if (donation.paymentStatus === 'succeeded') {
      return donation;
    }

    // If sandbox provider and status is pending, confirm in development
    if (
      donation.paymentProvider === 'sandbox' &&
      donation.providerTransactionId.startsWith('sbx_sess_')
    ) {
      donation.paymentStatus = 'succeeded';
      donation.verifiedAt = new Date();
      await donation.save();
      return donation;
    }

    // If PayMongo, verify against PayMongo Checkout Session API
    if (donation.paymentProvider === 'paymongo' && env.PAYMONGO_SECRET_KEY) {
      try {
        const authHeader = Buffer.from(`${env.PAYMONGO_SECRET_KEY}:`).toString('base64');
        const response = await fetch(
          `https://api.paymongo.com/v1/checkout_sessions/${donation.providerTransactionId}`,
          {
            headers: {
              Authorization: `Basic ${authHeader}`,
            },
          },
        );

        if (response.ok) {
          const data = (await response.json()) as any;
          const session = data.data;
          const payments = session.attributes.payments || [];
          const paidPayment = payments.find((p: any) => p.attributes?.status === 'paid');

          if (paidPayment || session.attributes.status === 'paid') {
            donation.paymentStatus = 'succeeded';
            donation.verifiedAt = new Date();
            await donation.save();
          }
        }
      } catch {
        // Leave pending if unreachable
      }
    }

    return donation;
  }

  /**
   * Handles incoming payment provider webhooks with signature verification & idempotency.
   */
  static async handleWebhook(params: {
    rawBody: string | Buffer;
    signatureHeader?: string;
    body: any;
  }): Promise<{ status: 'processed' | 'ignored' | 'already_processed'; error?: string }> {
    const { rawBody, signatureHeader, body } = params;

    // PayMongo webhook signature verification
    if (env.PAYMONGO_WEBHOOK_SECRET) {
      if (!signatureHeader) {
        return { status: 'ignored', error: 'Missing webhook signature header' };
      }

      const isValid = this.verifyPayMongoSignature(
        rawBody,
        signatureHeader,
        env.PAYMONGO_WEBHOOK_SECRET,
      );
      if (!isValid) {
        return { status: 'ignored', error: 'Invalid webhook signature' };
      }
    }

    const event = body?.data;
    if (!event || !event.id) {
      return { status: 'ignored', error: 'Invalid webhook payload structure' };
    }

    const eventId = event.id;
    const eventType = event.attributes?.type;
    const resource = event.attributes?.data?.attributes || {};
    const metadata = resource.metadata || {};

    // Webhook Idempotency Check
    const existingEvent = await WebhookEvent.findOne({
      provider: 'paymongo',
      eventId,
    });

    if (existingEvent && existingEvent.processingStatus === 'processed') {
      return { status: 'already_processed' };
    }

    // Record webhook event receipt
    const webhookDoc =
      existingEvent ||
      (await WebhookEvent.create({
        provider: 'paymongo',
        eventId,
        eventType: eventType || 'unknown',
        processingStatus: 'received',
      }));

    try {
      // Find matching donation by transaction ID or donationId in metadata
      let donation: IDonation | null = null;
      if (metadata.donationId && Types.ObjectId.isValid(metadata.donationId)) {
        donation = await Donation.findById(new Types.ObjectId(metadata.donationId));
      }

      if (!donation && resource.id) {
        donation = await Donation.findOne({ providerTransactionId: resource.id });
      }

      if (donation) {
        if (eventType === 'checkout_session.payment.paid' || eventType === 'payment.paid') {
          donation.paymentStatus = 'succeeded';
          donation.verifiedAt = new Date();
          await donation.save();
        } else if (eventType === 'payment.failed') {
          donation.paymentStatus = 'failed';
          await donation.save();
        } else if (eventType === 'payment.refunded') {
          donation.paymentStatus = 'refunded';
          donation.refundedAt = new Date();
          await donation.save();
        }
      }

      webhookDoc.processingStatus = 'processed';
      webhookDoc.processedAt = new Date();
      await webhookDoc.save();

      return { status: 'processed' };
    } catch (err: any) {
      webhookDoc.processingStatus = 'failed';
      webhookDoc.error = err.message;
      await webhookDoc.save();
      throw err;
    }
  }

  /**
   * PayMongo HMAC-SHA256 signature verification.
   */
  public static verifyPayMongoSignature(
    rawBody: string | Buffer,
    signatureHeader: string,
    secret: string,
  ): boolean {
    try {
      const parts = signatureHeader.split(',');
      const tPart = parts.find((p) => p.startsWith('t='));
      const tePart = parts.find((p) => p.startsWith('te='));
      const liPart = parts.find((p) => p.startsWith('li='));

      if (!tPart || (!tePart && !liPart)) return false;

      const timestamp = tPart.split('=')[1];
      const signature = (liPart || tePart)!.split('=')[1];

      const raw = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const payload = `${timestamp}.${raw}`;
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature ?? '', 'hex'),
        Buffer.from(expected, 'hex'),
      );
    } catch {
      return false;
    }
  }

  /**
   * Public statistics: total raised, count, unique donors, and monthly metrics.
   */
  static async getSummary() {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const [allTimeStats, monthlyStats, uniqueDonors] = await Promise.all([
      Donation.aggregate([
        { $match: { paymentStatus: 'succeeded' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalCount: { $sum: 1 },
          },
        },
      ]),
      Donation.aggregate([
        { $match: { paymentStatus: 'succeeded', verifiedAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalCount: { $sum: 1 },
          },
        },
      ]),
      Donation.distinct('displayName', { paymentStatus: 'succeeded', isAnonymous: false }),
    ]);

    const totalAmount = allTimeStats[0]?.totalAmount || 0;
    const totalDonations = allTimeStats[0]?.totalCount || 0;
    const monthAmount = monthlyStats[0]?.totalAmount || 0;
    const monthDonations = monthlyStats[0]?.totalCount || 0;

    // Add 1 for the collective anonymous pool if anonymous donations exist
    const hasAnonymous = await Donation.exists({ paymentStatus: 'succeeded', isAnonymous: true });
    const uniqueSupporters = uniqueDonors.length + (hasAnonymous ? 1 : 0);

    return {
      currency: env.DONATION_CURRENCY,
      totalAmount,
      totalDonations,
      uniqueSupporters,
      monthAmount,
      monthDonations,
      currentMonth: startOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    };
  }

  /**
   * Retrieves all-time and monthly leaderboards with aggregation and pagination.
   */
  static async getLeaderboard(limit = 20) {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const [allTimeAgg, monthlyAgg, recentDonations] = await Promise.all([
      // All-time top supporters (group by public identity)
      Donation.aggregate([
        { $match: { paymentStatus: 'succeeded' } },
        {
          $group: {
            _id: {
              $cond: [
                '$isAnonymous',
                'Anonymous Supporter',
                { $ifNull: ['$moderatedDisplayName', '$displayName'] },
              ],
            },
            totalAmount: { $sum: '$amount' },
            donationCount: { $sum: 1 },
            latestVerifiedAt: { $max: '$verifiedAt' },
            isAnonymous: { $first: '$isAnonymous' },
          },
        },
        { $sort: { totalAmount: -1, donationCount: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            displayName: '$_id',
            totalAmount: 1,
            donationCount: 1,
            latestVerifiedAt: 1,
            isAnonymous: 1,
          },
        },
      ]),

      // Monthly top supporters
      Donation.aggregate([
        { $match: { paymentStatus: 'succeeded', verifiedAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: {
              $cond: [
                '$isAnonymous',
                'Anonymous Supporter',
                { $ifNull: ['$moderatedDisplayName', '$displayName'] },
              ],
            },
            totalAmount: { $sum: '$amount' },
            donationCount: { $sum: 1 },
            latestVerifiedAt: { $max: '$verifiedAt' },
            isAnonymous: { $first: '$isAnonymous' },
          },
        },
        { $sort: { totalAmount: -1, donationCount: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            displayName: '$_id',
            totalAmount: 1,
            donationCount: 1,
            latestVerifiedAt: 1,
            isAnonymous: 1,
          },
        },
      ]),

      // Recent supporter activity
      Donation.find({ paymentStatus: 'succeeded' })
        .sort({ verifiedAt: -1 })
        .limit(10)
        .select('displayName isAnonymous message amount currency verifiedAt moderatedDisplayName')
        .lean(),
    ]);

    const formattedRecent = recentDonations.map((d: any) => ({
      displayName: d.isAnonymous
        ? 'Anonymous Supporter'
        : d.moderatedDisplayName || d.displayName || 'Supporter',
      amount: d.amount,
      currency: d.currency || 'PHP',
      message: d.message || '',
      verifiedAt: d.verifiedAt || d.createdAt,
      isAnonymous: Boolean(d.isAnonymous),
    }));

    return {
      allTime: allTimeAgg,
      monthly: monthlyAgg,
      recent: formattedRecent,
      calendarMonth: startOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    };
  }
}
