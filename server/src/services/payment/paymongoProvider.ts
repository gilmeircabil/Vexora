import crypto from 'node:crypto';
import type {
  IPaymentProvider,
  CreateCheckoutParams,
  CheckoutSessionResult,
  WebhookEventPayload,
} from './paymentProvider.js';
import { PLANS_CONFIG } from '../../config/plans.js';

export class PayMongoProvider implements IPaymentProvider {
  name = 'paymongo';
  private secretKey: string;
  private webhookSecret: string;

  constructor(secretKey: string, webhookSecret: string) {
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    if (!this.secretKey) {
      throw new Error('PayMongo secret key is not configured.');
    }

    const planConfig = PLANS_CONFIG[params.plan];
    if (!planConfig || params.plan === 'free') {
      throw new Error(`Cannot checkout for plan: ${params.plan}`);
    }

    const price = params.interval === 'yearly' ? planConfig.price.yearly : planConfig.price.monthly;
    // PayMongo amounts are in Philippine Centavos or Cents (e.g., PHP or USD)
    const amountInCentavos = Math.round(price * 100);

    const payload = {
      data: {
        attributes: {
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          description: `VexoraMods ${planConfig.name} Plan (${params.interval})`,
          line_items: [
            {
              currency: 'PHP',
              amount: amountInCentavos,
              name: `VexoraMods ${planConfig.name} Subscription`,
              quantity: 1,
              description: `${planConfig.monthlyCredits} AI Credits per month`,
            },
          ],
          payment_method_types: ['card', 'paymaya', 'gcash', 'grab_pay'],
          success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: params.cancelUrl,
          metadata: {
            userId: params.userId,
            plan: params.plan,
            interval: params.interval,
          },
        },
      },
    };

    const authHeader = Buffer.from(`${this.secretKey}:`).toString('base64');
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
      throw new Error(`PayMongo API error: ${errText}`);
    }

    const data = (await response.json()) as any;
    const checkoutSession = data.data;

    return {
      checkoutUrl: checkoutSession.attributes.checkout_url,
      sessionId: checkoutSession.id,
    };
  }

  verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string): boolean {
    if (!this.webhookSecret || !signatureHeader) return false;

    try {
      // PayMongo format: t=timestamp,te=test_signature,li=live_signature
      const parts = signatureHeader.split(',');
      const tPart = parts.find((p) => p.startsWith('t='));
      const tePart = parts.find((p) => p.startsWith('te='));
      const liPart = parts.find((p) => p.startsWith('li='));

      if (!tPart || (!tePart && !liPart)) return false;

      const timestamp = tPart.split('=')[1];
      const signature = (liPart || tePart)!.split('=')[1];

      const raw = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
      const payload = `${timestamp}.${raw}`;
      const expected = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature ?? '', 'hex'),
        Buffer.from(expected, 'hex'),
      );
    } catch {
      return false;
    }
  }

  parseWebhookEvent(body: any): WebhookEventPayload | null {
    if (!body || !body.data || !body.data.id) return null;

    const event = body.data;
    const eventType = event.attributes?.type;
    const resource = event.attributes?.data?.attributes || {};

    const metadata = resource.metadata || {};

    return {
      eventId: event.id,
      eventType: eventType || 'payment.paid',
      userId: metadata.userId,
      plan: metadata.plan,
      interval: metadata.interval,
      providerPaymentId: resource.payments?.[0]?.id || event.id,
      amount: resource.amount ? resource.amount / 100 : undefined,
      currency: resource.currency || 'PHP',
      status: resource.status,
      rawPayload: body,
    };
  }

  async cancelSubscription(_providerSubscriptionId: string): Promise<boolean> {
    // PayMongo checkout session subscriptions are handled via customer webhook lifecycle
    return true;
  }
}
