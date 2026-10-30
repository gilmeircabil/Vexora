import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson } from '../lib/dev/json.js';
import { encodeBase64Text, decodeBase64Text } from '../lib/dev/base64.js';
import { encodeUrl, decodeUrl } from '../lib/dev/url.js';
import { generateUuidV4, generateBulkUuids } from '../lib/dev/uuid.js';
import { generatePassword, calculatePasswordEntropy } from '../lib/dev/password.js';
import { encodeHtmlEntities, decodeHtmlEntities } from '../lib/dev/entities.js';
import {
  base64UrlEncode,
  base64UrlDecode,
  signJwt,
  decodeJwt,
  verifyJwtSignature,
} from '../lib/dev/jwt.js';

describe('JSON Formatter & Minifier', () => {
  it('formats valid JSON with custom indentation', () => {
    const raw = '{"b":2,"a":1}';
    const res = formatJson(raw, { indent: 2, sortKeys: true });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.output).toBe('{\n  "a": 1,\n  "b": 2\n}');
    }
  });

  it('minifies valid JSON cleanly', () => {
    const raw = '{\n  "title": "ToolNest",\n  "active": true\n}';
    const res = minifyJson(raw);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toBe('{"title":"ToolNest","active":true}');
    }
  });

  it('reports syntax error with line or column indicators on invalid JSON', () => {
    const invalid = '{\n  "unclosed": "string\n}';
    const res = formatJson(invalid);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toBeTruthy();
    }
  });
});

describe('Base64 Encoder & Decoder', () => {
  it('encodes and decodes UTF-8 strings accurately without truncation', () => {
    const text = 'ToolNest: 🚀 Multilingual 世界 / café / 100€';
    const b64 = encodeBase64Text(text);
    const decoded = decodeBase64Text(b64);

    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value).toBe(text);
    }
  });

  it('safely rejects corrupted Base64 strings', () => {
    const invalid = 'This is clearly not valid base64!!!';
    const res = decodeBase64Text(invalid);
    expect(res.ok).toBe(false);
  });
});

describe('URL Encoder & Decoder', () => {
  it('encodes and decodes URI components safely', () => {
    const input = 'hello world & param=value?';
    const encoded = encodeUrl(input, 'component');
    expect(encoded).toBe('hello%20world%20%26%20param%3Dvalue%3F');

    const decoded = decodeUrl(encoded, 'component');
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value).toBe(input);
    }
  });

  it('handles malformed URI sequences without throwing unhandled exceptions', () => {
    const malformed = 'https://example.com/%E0%A4%A';
    const res = decodeUrl(malformed, 'component');
    expect(res.ok).toBe(false);
  });
});

describe('UUID Generator', () => {
  it('generates standard RFC 4122 v4 UUID with correct hyphens and version bit', () => {
    const uuid = generateUuidV4();
    // v4 format: 8-4-4-4-12 hex with 4 at index 14 and [89ab] at index 19
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('supports options (uppercase, no hyphens, braces)', () => {
    const uuid = generateUuidV4({ uppercase: true, hyphens: false, braces: true });
    expect(uuid.startsWith('{')).toBe(true);
    expect(uuid.endsWith('}')).toBe(true);
    expect(uuid.includes('-')).toBe(false);
    expect(uuid).toBe(uuid.toUpperCase());
  });

  it('generates bulk unique UUIDs', () => {
    const list = generateBulkUuids(20);
    expect(list.length).toBe(20);
    const unique = new Set(list);
    expect(unique.size).toBe(20);
  });
});

describe('Password Generator', () => {
  it('generates passwords satisfying character class requirements', () => {
    const res = generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.password.length).toBe(16);
      expect(/[A-Z]/.test(res.value.password)).toBe(true);
      expect(/[a-z]/.test(res.value.password)).toBe(true);
      expect(/[0-9]/.test(res.value.password)).toBe(true);
      expect(res.value.entropyBits).toBeGreaterThan(60);
    }
  });

  it('rejects impossible configurations (e.g. length shorter than required sets)', () => {
    const res = generatePassword({
      length: 2,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    expect(res.ok).toBe(false);
  });

  it('calculates entropy correctly', () => {
    // 16 chars with pool of 94 (uppercase + lowercase + numbers + symbols)
    const entropy = calculatePasswordEntropy(16, 94);
    expect(entropy).toBe(105);
  });
});

describe('HTML Entity Encoder & Decoder', () => {
  it('escapes reserved HTML characters safely', () => {
    const raw = '<script>alert("XSS" & \'test\')</script>';
    const escaped = encodeHtmlEntities(raw);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&amp;');

    const decoded = decodeHtmlEntities(escaped);
    expect(decoded).toBe(raw);
  });
});

describe('JSON Web Token (JWT) Generator & Verifier', () => {
  it('encodes and decodes base64url strings', () => {
    const original = '{"alg":"HS256","typ":"JWT"}';
    const encoded = base64UrlEncode(original);
    const decoded = base64UrlDecode(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value).toBe(original);
    }
  });

  it('signs and verifies a valid JWT with secret key', async () => {
    const secret = 'super-secret-key-12345';
    const header = { alg: 'HS256' as const, typ: 'JWT' as const };
    const payload = { sub: 'user_42', role: 'admin', iat: 1700000000 };

    const tokenRes = await signJwt(header, payload, secret);
    expect(tokenRes.ok).toBe(true);
    if (!tokenRes.ok) return;

    const token = tokenRes.value;
    expect(token.split('.').length).toBe(3);

    // Decode token
    const decoded = decodeJwt(token);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value.payload.sub).toBe('user_42');
      expect(decoded.value.header.alg).toBe('HS256');
    }

    // Verify with correct secret
    const validRes = await verifyJwtSignature(token, secret);
    expect(validRes.ok).toBe(true);
    if (validRes.ok) {
      expect(validRes.value).toBe(true);
    }

    // Verify with wrong secret
    const invalidRes = await verifyJwtSignature(token, 'wrong-secret');
    expect(invalidRes.ok).toBe(true);
    if (invalidRes.ok) {
      expect(invalidRes.value).toBe(false);
    }
  });

  it('detects expired tokens correctly', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64UrlEncode(JSON.stringify({ sub: 'user_42', exp: pastExp }));
    const fakeToken = `${header}.${payload}.fakesig`;

    const decoded = decodeJwt(fakeToken);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value.isExpired).toBe(true);
      expect(decoded.value.expiresInSeconds).toBeLessThan(0);
    }
  });
});
