import type { PlanTier, BillingInterval } from '../../config/plans.js';

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  userName: string;
  plan: PlanTier;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  checkoutUrl: string;
  sessionId: string;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: string;
  userId?: string;
  plan?: PlanTier;
  interval?: BillingInterval;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  rawPayload: any;
}

export interface IPaymentProvider {
  name: string;
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult>;
  verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string): boolean;
  parseWebhookEvent(body: any): WebhookEventPayload | null;
  cancelSubscription(providerSubscriptionId: string): Promise<boolean>;
}
