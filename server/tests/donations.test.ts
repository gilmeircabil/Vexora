import { describe, it, expect, vi, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { DonationService } from '../src/services/donationService.js';
import { Donation } from '../src/models/Donation.js';
import { env } from '../src/config/env.js';

describe('VexoraMods Support & Voluntary Donation System', () => {
  describe('Custom Donation Amount Validation', () => {
    it('should accept valid custom PHP donation amounts including decimals', () => {
      const validAmounts = [20, 25.5, 100, 250.75, 5000, 500000];
      for (const amount of validAmounts) {
        const result = DonationService.validateAmount(amount);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });

    it('should reject amounts below the minimum threshold (₱20)', () => {
      const result = DonationService.validateAmount(19.99);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(
        `Minimum donation amount is ${env.DONATION_CURRENCY} ₱${env.DONATION_MIN_AMOUNT}`,
      );
    });

    it('should reject amounts above the maximum allowed threshold (₱500,000)', () => {
      const result = DonationService.validateAmount(500001);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum donation amount is');
    });

    it('should reject zero, negative, or invalid amounts', () => {
      expect(DonationService.validateAmount(0).valid).toBe(false);
      expect(DonationService.validateAmount(-50).valid).toBe(false);
      expect(DonationService.validateAmount(NaN).valid).toBe(false);
      expect(DonationService.validateAmount(Number.POSITIVE_INFINITY).valid).toBe(false);
      // @ts-expect-error test invalid string input
      expect(DonationService.validateAmount('100').valid).toBe(false);
    });
  });

  describe('PayMongo Webhook HMAC-SHA256 Signature Verification', () => {
    const testSecret = 'whsec_test_secret_key_12345';
    const rawPayload = JSON.stringify({
      data: {
        id: 'evt_test_123',
        type: 'event',
        attributes: {
          type: 'checkout_session.payment.paid',
          data: {
            id: 'cs_test_session_abc',
            attributes: {
              status: 'paid',
            },
          },
        },
      },
    });

    it('should accurately verify authentic HMAC-SHA256 PayMongo signature headers', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signaturePayload = `${timestamp}.${rawPayload}`;
      const signature = crypto
        .createHmac('sha256', testSecret)
        .update(signaturePayload)
        .digest('hex');

      const header = `t=${timestamp},te=${signature}`;
      const isValid = DonationService.verifyPayMongoSignature(rawPayload, header, testSecret);
      expect(isValid).toBe(true);
    });

    it('should reject tampered payload or forged signature header', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const forgedHeader = `t=${timestamp},te=deadbeef1234567890abcdef`;
      const isValid = DonationService.verifyPayMongoSignature(rawPayload, forgedHeader, testSecret);
      expect(isValid).toBe(false);
    });

    it('should reject malformed or missing signature parts', () => {
      expect(
        DonationService.verifyPayMongoSignature(rawPayload, 'invalid_header', testSecret),
      ).toBe(false);
      expect(DonationService.verifyPayMongoSignature(rawPayload, '', testSecret)).toBe(false);
    });

    it('should accept test-mode headers where li= is empty', () => {
      const t = Math.floor(Date.now() / 1000);
      const sig = crypto.createHmac('sha256', testSecret).update(`${t}.${rawPayload}`).digest('hex');
      expect(
        DonationService.verifyPayMongoSignature(rawPayload, `t=${t},te=${sig},li=`, testSecret),
      ).toBe(true);
    });
  });

  describe('Production safety & checkout URLs', () => {
    const saved = { ...env };
    afterEach(() => {
      Object.assign(env, saved);
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it('rejects webhooks in production when no webhook secret is configured', async () => {
      Object.assign(env, { NODE_ENV: 'production', PAYMONGO_WEBHOOK_SECRET: '' });
      const out = await DonationService.handleWebhook({
        rawBody: '{}',
        body: { data: { id: 'evt_x', attributes: { type: 'payment.paid' } } },
      });
      expect(out.status).toBe('ignored');
    });

    it('does not auto-confirm sandbox donations in production', async () => {
      env.NODE_ENV = 'production';
      const doc: any = {
        paymentStatus: 'pending',
        paymentProvider: 'sandbox',
        providerTransactionId: 'sbx_sess_x',
        save: vi.fn(),
      };
      vi.spyOn(Donation, 'findOne').mockResolvedValue(doc);
      await DonationService.verifyDonation('sbx_sess_x');
      expect(doc.paymentStatus).toBe('pending');
    });

    it('builds PayMongo success_url with donation_id and no Stripe placeholder', async () => {
      env.PAYMONGO_SECRET_KEY = 'sk_test_x';
      vi.spyOn(Donation, 'create').mockResolvedValue({ _id: 'd123', save: vi.fn() } as any);
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'cs_1', attributes: { checkout_url: 'https://pm' } } }),
      });
      vi.stubGlobal('fetch', fetchMock);
      await DonationService.createCheckoutSession({ amount: 100 });
      const url = JSON.parse((fetchMock.mock.calls[0] as any[])[1].body).data.attributes.success_url;
      expect(url).toContain('donation_id=d123');
      expect(url).not.toContain('{CHECKOUT_SESSION_ID}');
    });
  });
});
