import { Result, ok, err } from '../result.js';

/**
 * Encodes a UTF-8 string into Base64 safely without Latin1 overflow issues.
 */
export function encodeBase64Text(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string into a UTF-8 string safely.
 */
export function decodeBase64Text(base64: string): Result<string, string> {
  const cleaned = base64.trim().replace(/\s+/g, '');
  if (!cleaned) return ok('');

  try {
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return ok(decoder.decode(bytes));
  } catch (e) {
    return err('Invalid Base64 sequence or malformed UTF-8 characters. Please verify your input.');
  }
}

/**
 * Encodes an ArrayBuffer or Uint8Array into Base64.
 */
export function encodeBase64Bytes(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return btoa(binary);
}
