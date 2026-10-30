import crypto from 'node:crypto';
import type {
  IPaymentProvider,
  CreateCheckoutParams,
  CheckoutSessionResult,
  WebhookEventPayload,
} from './paymentProvider.js';

export class SandboxProvider implements IPaymentProvider {
  name = 'sandbox';
  private secretKey: string;
  private webhookSecret: string;

  constructor(secretKey = 'sandbox_secret_key', webhookSecret = 'sandbox_webhook_secret') {
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    const sessionId = `sandbox_cs_${crypto.randomBytes(12).toString('hex')}`;
    // In sandbox mode, redirect to the frontend checkout confirmation preview
    const checkoutUrl = `${params.successUrl}?session_id=${sessionId}&provider=sandbox&plan=${params.plan}&interval=${params.interval}`;

    return {
      checkoutUrl,
      sessionId,
    };
  }

  verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string): boolean {
    if (!signatureHeader) return false;
    try {
      const raw = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const expected = crypto.createHmac('sha256', this.webhookSecret).update(raw).digest('hex');

      return signatureHeader === expected || signatureHeader === 'sandbox_test_signature';
    } catch {
      return false;
    }
  }

  parseWebhookEvent(body: any): WebhookEventPayload | null {
    if (!body || !body.eventId) return null;

    return {
      eventId: body.eventId,
      eventType: body.eventType || 'checkout.session.completed',
      userId: body.userId,
      plan: body.plan,
      interval: body.interval || 'monthly',
      providerCustomerId: body.providerCustomerId || `sandbox_cus_${Date.now()}`,
      providerSubscriptionId: body.providerSubscriptionId || `sandbox_sub_${Date.now()}`,
      providerPaymentId: body.providerPaymentId || `sandbox_pay_${Date.now()}`,
      amount: body.amount ?? 9.99,
      currency: body.currency || 'USD',
      status: 'succeeded',
      rawPayload: body,
    };
  }

  async cancelSubscription(_providerSubscriptionId: string): Promise<boolean> {
    return true;
  }
}
