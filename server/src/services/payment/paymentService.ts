import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { env } from '../../config/env.js';
import type { IPaymentProvider, CreateCheckoutParams } from './paymentProvider.js';
import { StripeProvider } from './stripeProvider.js';
import { PayMongoProvider } from './paymongoProvider.js';
import { SandboxProvider } from './sandboxProvider.js';
import { WebhookEvent } from '../../models/WebhookEvent.js';
import { Subscription } from '../../models/Subscription.js';
import { User } from '../../models/User.js';
import { Payment } from '../../models/Payment.js';
import { CreditService } from '../creditService.js';
import type { PlanTier } from '../../config/plans.js';

export class PaymentService {
  private static providerInstance: IPaymentProvider | null = null;

  static getProvider(): IPaymentProvider {
    if (this.providerInstance) {
      return this.providerInstance;
    }

    if (env.PAYMENT_PROVIDER === 'stripe') {
      this.providerInstance = new StripeProvider(env.STRIPE_SECRET_KEY, env.STRIPE_WEBHOOK_SECRET);
    } else if (env.PAYMENT_PROVIDER === 'paymongo') {
      this.providerInstance = new PayMongoProvider(
        env.PAYMONGO_SECRET_KEY,
        env.PAYMONGO_WEBHOOK_SECRET,
      );
    } else {
      this.providerInstance = new SandboxProvider();
    }

    return this.providerInstance;
  }

  static async createCheckout(params: CreateCheckoutParams) {
    const provider = this.getProvider();
    return provider.createCheckoutSession(params);
  }

  static async handleWebhook(params: {
    rawBody: string | Buffer;
    signatureHeader: string;
    parsedBody: any;
  }): Promise<{ success: boolean; message: string; eventId?: string }> {
    const provider = this.getProvider();

    // 1. Verify signature
    const isValid = provider.verifyWebhookSignature(params.rawBody, params.signatureHeader);
    if (!isValid) {
      return { success: false, message: 'Invalid webhook signature.' };
    }

    // 2. Parse event payload
    const event = provider.parseWebhookEvent(params.parsedBody);
    if (!event || !event.eventId) {
      return { success: false, message: 'Unrecognized webhook event format.' };
    }

    // 3. Webhook idempotency check
    const existing = await WebhookEvent.findOne({ eventId: event.eventId });
    if (existing) {
      if (existing.processingStatus === 'processed') {
        return {
          success: true,
          message: 'Webhook event was already processed (idempotent duplicate skipped).',
          eventId: event.eventId,
        };
      }
    }

    const rawString =
      typeof params.rawBody === 'string' ? params.rawBody : params.rawBody.toString('utf8');
    const payloadHash = crypto.createHash('sha256').update(rawString).digest('hex');

    const webhookLog =
      existing ||
      (await WebhookEvent.create({
        provider: provider.name,
        eventId: event.eventId,
        eventType: event.eventType,
        processingStatus: 'received',
        payloadHash,
        receivedAt: new Date(),
      }));

    try {
      // 4. Handle event types
      const isActivationEvent =
        event.eventType === 'checkout.session.completed' ||
        event.eventType === 'payment.paid' ||
        event.eventType === 'invoice.paid' ||
        event.eventType === 'subscription.created';

      if (isActivationEvent && event.userId && event.plan) {
        const uid = new Types.ObjectId(event.userId);
        const user = await User.findById(uid);
        if (user) {
          const now = new Date();
          const periodEnd = new Date(now);
          if (event.interval === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          }

          // Create or update subscription
          let sub = await Subscription.findOne({ userId: uid });
          if (!sub) {
            sub = await Subscription.create({
              userId: uid,
              plan: event.plan,
              billingInterval: event.interval || 'monthly',
              provider: provider.name,
              providerCustomerId: event.providerCustomerId,
              providerSubscriptionId: event.providerSubscriptionId,
              status: 'active',
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
            });
          } else {
            sub.plan = event.plan;
            sub.billingInterval = event.interval || 'monthly';
            sub.status = 'active';
            sub.currentPeriodStart = now;
            sub.currentPeriodEnd = periodEnd;
            sub.cancelAtPeriodEnd = false;
            if (event.providerSubscriptionId) {
              sub.providerSubscriptionId = event.providerSubscriptionId;
            }
            await sub.save();
          }

          user.subscriptionId = sub._id as Types.ObjectId;
          await user.save();

          // Record payment
          await Payment.create({
            userId: uid,
            provider: provider.name,
            providerPaymentId: event.providerPaymentId || event.eventId,
            amount: event.amount ?? 0,
            currency: event.currency || 'USD',
            status: 'succeeded',
            subscriptionId: sub._id,
            metadata: { eventId: event.eventId, eventType: event.eventType },
          });

          // Replenish credit allowance
          await CreditService.applySubscriptionAllowance(uid, event.plan as PlanTier);
        }
      } else if (
        event.eventType === 'customer.subscription.deleted' ||
        event.eventType === 'subscription.canceled'
      ) {
        if (event.providerSubscriptionId) {
          await Subscription.findOneAndUpdate(
            { providerSubscriptionId: event.providerSubscriptionId },
            { status: 'canceled', cancelAtPeriodEnd: true },
          );
        }
      } else if (event.eventType === 'payment.failed') {
        if (event.providerSubscriptionId) {
          await Subscription.findOneAndUpdate(
            { providerSubscriptionId: event.providerSubscriptionId },
            { status: 'past_due' },
          );
        }
      }

      webhookLog.processingStatus = 'processed';
      webhookLog.processedAt = new Date();
      await webhookLog.save();

      return {
        success: true,
        message: 'Webhook processed successfully.',
        eventId: event.eventId,
      };
    } catch (err: any) {
      webhookLog.processingStatus = 'failed';
      webhookLog.error = err.message || 'Error processing webhook event';
      await webhookLog.save();
      return { success: false, message: `Webhook error: ${err.message}` };
    }
  }
}
