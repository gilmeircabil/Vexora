import { describe, it, expect } from 'vitest';
import { getUtcMidnight, CreditService } from '../src/services/creditService.js';
import { StripeProvider } from '../src/services/payment/stripeProvider.js';
import { PayMongoProvider } from '../src/services/payment/paymongoProvider.js';
import { SandboxProvider } from '../src/services/payment/sandboxProvider.js';
import { AuthService } from '../src/services/authService.js';
import { PLANS_CONFIG } from '../src/config/plans.js';
import crypto from 'node:crypto';

describe('Credit System & Timezone Logic', () => {
  it('should accurately calculate UTC midnight without local timezone skew', () => {
    const testDate = new Date('2026-10-30T15:45:30.123Z');
    const midnight = getUtcMidnight(testDate);

    expect(midnight.getUTCFullYear()).toBe(2026);
    expect(midnight.getUTCMonth()).toBe(9); // 0-indexed October
    expect(midnight.getUTCDate()).toBe(30);
    expect(midnight.getUTCHours()).toBe(0);
    expect(midnight.getUTCMinutes()).toBe(0);
    expect(midnight.getUTCSeconds()).toBe(0);
    expect(midnight.getUTCMilliseconds()).toBe(0);
  });

  it('should calculate available credits correctly', () => {
    const mockAccount: any = {
      dailyAllowance: 3,
      dailyUsed: 1,
      monthlyAllowance: 300,
      monthlyUsed: 50,
      reservedCredits: 2,
      dailyResetAt: new Date('2026-10-30T00:00:00.000Z'),
    };

    const balance = CreditService.calculateBalance(mockAccount);

    expect(balance.dailyAllowance).toBe(3);
    expect(balance.dailyUsed).toBe(1);
    expect(balance.dailyRemaining).toBe(2); // 3 - 1
    expect(balance.monthlyAllowance).toBe(300);
    expect(balance.monthlyUsed).toBe(50);
    expect(balance.monthlyRemaining).toBe(250); // 300 - 50
    // Total available = (dailyRemaining + monthlyRemaining) - reservedCredits
    // = (2 + 250) - 2 = 250
    expect(balance.totalAvailable).toBe(250);
  });

  it('should prevent negative credit values if usage exceeds allowance', () => {
    const mockAccount: any = {
      dailyAllowance: 3,
      dailyUsed: 5,
      monthlyAllowance: 0,
      monthlyUsed: 10,
      reservedCredits: 0,
      dailyResetAt: new Date(),
    };

    const balance = CreditService.calculateBalance(mockAccount);
    expect(balance.dailyRemaining).toBe(0);
    expect(balance.monthlyRemaining).toBe(0);
    expect(balance.totalAvailable).toBe(0);
  });
});

describe('Subscription Plans Configuration', () => {
  it('should declare correct default plan quotas', () => {
    expect(PLANS_CONFIG.free.dailyCredits).toBe(3);
    expect(PLANS_CONFIG.free.monthlyCredits).toBe(0);

    expect(PLANS_CONFIG.pro.dailyCredits).toBe(0);
    expect(PLANS_CONFIG.pro.monthlyCredits).toBe(300);

    expect(PLANS_CONFIG.premium.dailyCredits).toBe(0);
    expect(PLANS_CONFIG.premium.monthlyCredits).toBe(1000);
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
      email: 'test@toolnest.local',
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
