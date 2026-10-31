import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { DonationService } from '../src/services/donationService.js';
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
      expect(result.error).toContain(`Minimum donation amount is ${env.DONATION_CURRENCY} ₱${env.DONATION_MIN_AMOUNT}`);
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
      expect(DonationService.verifyPayMongoSignature(rawPayload, 'invalid_header', testSecret)).toBe(false);
      expect(DonationService.verifyPayMongoSignature(rawPayload, '', testSecret)).toBe(false);
    });
  });
});
