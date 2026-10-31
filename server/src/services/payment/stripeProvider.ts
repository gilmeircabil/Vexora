import crypto from 'node:crypto';
import type {
  IPaymentProvider,
  CreateCheckoutParams,
  CheckoutSessionResult,
  WebhookEventPayload,
} from './paymentProvider.js';
import { PLANS_CONFIG } from '../../config/plans.js';

export class StripeProvider implements IPaymentProvider {
  name = 'stripe';
  private secretKey: string;
  private webhookSecret: string;

  constructor(secretKey: string, webhookSecret: string) {
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    if (!this.secretKey) {
      throw new Error('Stripe secret key is not configured.');
    }

    const planConfig = PLANS_CONFIG[params.plan];
    if (!planConfig || params.plan === 'free') {
      throw new Error(`Cannot checkout for plan: ${params.plan}`);
    }

    const price = params.interval === 'yearly' ? planConfig.price.yearly : planConfig.price.monthly;
    const amountInCents = Math.round(price * 100);

    const body = new URLSearchParams({
      mode: 'subscription',
      customer_email: params.userEmail,
      client_reference_id: params.userId,
      'metadata[userId]': params.userId,
      'metadata[plan]': params.plan,
      'metadata[interval]': params.interval,
      success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl,
      'line_items[0][price_data][currency]': 'php',
      'line_items[0][price_data][product_data][name]': `VexoraMods ${planConfig.name} Plan`,
      'line_items[0][price_data][product_data][description]': `${planConfig.monthlyCredits} AI Credits per month`,
      'line_items[0][price_data][unit_amount]': amountInCents.toString(),
      'line_items[0][price_data][recurring][interval]':
        params.interval === 'yearly' ? 'year' : 'month',
      'line_items[0][quantity]': '1',
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Stripe API error: ${errText}`);
    }

    const session = (await response.json()) as { id: string; url: string };
    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string): boolean {
    if (!this.webhookSecret || !signatureHeader) return false;

    try {
      const parts = signatureHeader.split(',');
      const timestampPart = parts.find((p) => p.startsWith('t='));
      const sigPart = parts.find((p) => p.startsWith('v1='));

      if (!timestampPart || !sigPart) return false;

      const timestamp = timestampPart.split('=')[1];
      const signature = sigPart.split('=')[1];

      const payload = `${timestamp}.${typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature ?? '', 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  parseWebhookEvent(body: any): WebhookEventPayload | null {
    if (!body || !body.id || !body.type) return null;

    const event = body;
    const obj = event.data?.object || {};

    const userId = obj.metadata?.userId || obj.client_reference_id;
    const plan = obj.metadata?.plan;
    const interval = obj.metadata?.interval;

    return {
      eventId: event.id,
      eventType: event.type,
      userId,
      plan,
      interval,
      providerCustomerId: obj.customer,
      providerSubscriptionId: obj.subscription,
      providerPaymentId: obj.payment_intent || obj.id,
      amount: obj.amount_total ? obj.amount_total / 100 : undefined,
      currency: obj.currency?.toUpperCase(),
      status: obj.status,
      rawPayload: event,
    };
  }

  async cancelSubscription(providerSubscriptionId: string): Promise<boolean> {
    if (!this.secretKey) return false;
    try {
      const response = await fetch(
        `https://api.stripe.com/v1/subscriptions/${providerSubscriptionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}
