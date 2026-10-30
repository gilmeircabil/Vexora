import { Result, ok, err } from '../result.js';

export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512';

export interface JwtHeader {
  alg: JwtAlgorithm;
  typ: 'JWT';
  [key: string]: unknown;
}

export interface JwtClaims {
  sub?: string;
  name?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtClaims;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  isExpired: boolean;
  expiresInSeconds?: number;
}

/**
 * Base64URL encoding (RFC 7515).
 */
export function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64URL decoding (RFC 7515).
 */
export function base64UrlDecode(str: string): Result<string, string> {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return ok(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return err('Failed to decode Base64URL string.');
  }
}

function base64UrlDecodeBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getHashName(alg: JwtAlgorithm): string {
  switch (alg) {
    case 'HS256':
      return 'SHA-256';
    case 'HS384':
      return 'SHA-384';
    case 'HS512':
      return 'SHA-512';
  }
}

/**
 * Signs a JWT using Web Crypto HMAC.
 */
export async function signJwt(
  header: JwtHeader,
  payload: JwtClaims,
  secret: string,
): Promise<Result<string, string>> {
  if (!secret) {
    return err('Secret key is required to sign JWT.');
  }

  try {
    const headerJson = JSON.stringify(header);
    const payloadJson = JSON.stringify(payload);

    const encodedHeader = base64UrlEncode(headerJson);
    const encodedPayload = base64UrlEncode(payloadJson);
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const inputData = enc.encode(signingInput);

    const hashName = getHashName(header.alg);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: hashName } },
      false,
      ['sign'],
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, inputData);
    const signatureBytes = new Uint8Array(signatureBuffer);
    const encodedSignature = base64UrlEncode(signatureBytes);

    return ok(`${signingInput}.${encodedSignature}`);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Failed to sign JWT.');
  }
}

/**
 * Decodes a JWT token without verifying the signature.
 */
export function decodeJwt(token: string): Result<DecodedJwt, string> {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return err('Invalid JWT format. A valid token must contain 3 parts separated by dots.');
  }

  const [rawHeader, rawPayload, signature] = parts as [string, string, string];

  const headerRes = base64UrlDecode(rawHeader);
  if (!headerRes.ok) {
    return err('Failed to decode JWT Header.');
  }

  const payloadRes = base64UrlDecode(rawPayload);
  if (!payloadRes.ok) {
    return err('Failed to decode JWT Payload.');
  }

  let header: JwtHeader;
  let payload: JwtClaims;

  try {
    header = JSON.parse(headerRes.value);
  } catch {
    return err('JWT Header is not valid JSON.');
  }

  try {
    payload = JSON.parse(payloadRes.value);
  } catch {
    return err('JWT Payload is not valid JSON.');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  let isExpired = false;
  let expiresInSeconds: number | undefined;

  if (typeof payload.exp === 'number') {
    isExpired = payload.exp < nowSeconds;
    expiresInSeconds = payload.exp - nowSeconds;
  }

  return ok({
    header,
    payload,
    signature,
    rawHeader,
    rawPayload,
    isExpired,
    expiresInSeconds,
  });
}

/**
 * Verifies a JWT token's signature using Web Crypto HMAC.
 */
export async function verifyJwtSignature(
  token: string,
  secret: string,
): Promise<Result<boolean, string>> {
  const decoded = decodeJwt(token);
  if (!decoded.ok) return decoded;

  const { header, rawHeader, rawPayload, signature } = decoded.value;

  if (!secret) {
    return err('Secret key is required to verify JWT signature.');
  }

  if (header.alg !== 'HS256' && header.alg !== 'HS384' && header.alg !== 'HS512') {
    return err(`Unsupported signing algorithm: ${header.alg}`);
  }

  try {
    const signingInput = `${rawHeader}.${rawPayload}`;
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const inputData = enc.encode(signingInput);
    const signatureBytes = base64UrlDecodeBytes(signature);

    const hashName = getHashName(header.alg);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: hashName } },
      false,
      ['verify'],
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes as unknown as BufferSource,
      inputData,
    );

    return ok(isValid);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Verification failed.');
  }
}
