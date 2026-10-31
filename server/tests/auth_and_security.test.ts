import { describe, it, expect } from 'vitest';
import { StripeProvider } from '../src/services/payment/stripeProvider.js';
import { PayMongoProvider } from '../src/services/payment/paymongoProvider.js';
import { SandboxProvider } from '../src/services/payment/sandboxProvider.js';
import { AuthService } from '../src/services/authService.js';
import { PLANS_CONFIG, DEFAULT_TOOL_COSTS } from '../src/config/plans.js';
import crypto from 'node:crypto';

describe('Open Source Plan & Free Quotas', () => {
  it('should declare free and zero credit costs for all tools', () => {
    expect(PLANS_CONFIG.free.id).toBe('free');
    expect(PLANS_CONFIG.free.price.monthly).toBe(0);
    expect(PLANS_CONFIG.free.dailyCredits).toBe(0);

    for (const [toolId, config] of Object.entries(DEFAULT_TOOL_COSTS)) {
      expect(config.creditCost, `Tool ${toolId} should cost 0 credits`).toBe(0);
      expect(config.minPlan).toBe('free');
    }
  });
});

describe('Payment Provider Signature Verification', () => {
  const webhookSecret = 'whsec_test_secret_key_12345';

  it('StripeProvider verifies genuine signatures and rejects forged ones', () => {
    const provider = new StripeProvider('sk_test_123', webhookSecret);
    const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed' });
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const hmac = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');

    const validHeader = `t=${timestamp},v1=${hmac}`;
    const forgedHeader = `t=${timestamp},v1=deadbeef0011223344`;

    expect(provider.verifyWebhookSignature(payload, validHeader)).toBe(true);
    expect(provider.verifyWebhookSignature(payload, forgedHeader)).toBe(false);
    expect(provider.verifyWebhookSignature(payload, '')).toBe(false);
  });

  it('PayMongoProvider verifies genuine signatures and rejects invalid ones', () => {
    const provider = new PayMongoProvider('sk_test_paymongo', webhookSecret);
    const payload = JSON.stringify({
      data: { id: 'evt_pm_123', attributes: { type: 'payment.paid' } },
    });
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const hmac = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');

    const validHeader = `t=${timestamp},te=${hmac}`;
    const forgedHeader = `t=${timestamp},te=fake_signature_hash`;

    expect(provider.verifyWebhookSignature(payload, validHeader)).toBe(true);
    expect(provider.verifyWebhookSignature(payload, forgedHeader)).toBe(false);
  });

  it('SandboxProvider correctly handles test sandbox verification', () => {
    const provider = new SandboxProvider();
    expect(provider.verifyWebhookSignature('{}', 'sandbox_test_signature')).toBe(true);
    expect(provider.verifyWebhookSignature('{}', 'invalid_sig')).toBe(false);
  });
});

describe('Authentication & Password Hashing', () => {
  it('hashes passwords securely and compares them accurately', async () => {
    const plain = 'SecurePass123!';
    const hash = await AuthService.hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix

    const isValid = await AuthService.comparePassword(plain, hash);
    const isInvalid = await AuthService.comparePassword('WrongPassword', hash);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it('generates verifiable JWT access and refresh tokens', () => {
    const payload = {
      userId: '652391028392102938475812',
      email: 'test@vexoramods.local',
      role: 'user' as const,
    };

    const tokens = AuthService.generateTokens(payload);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();

    const decodedAccess = AuthService.verifyAccessToken(tokens.accessToken);
    expect(decodedAccess?.userId).toBe(payload.userId);
    expect(decodedAccess?.email).toBe(payload.email);
    expect(decodedAccess?.role).toBe('user');

    const decodedRefresh = AuthService.verifyRefreshToken(tokens.refreshToken);
    expect(decodedRefresh?.userId).toBe(payload.userId);
  });
});
