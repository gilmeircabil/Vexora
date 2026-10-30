export interface UuidOptions {
  uppercase?: boolean;
  hyphens?: boolean;
  braces?: boolean;
}

/**
 * Generates a cryptographically secure RFC 4122 version 4 UUID.
 * Uses Web Crypto API exclusively. Never Math.random.
 */
export function generateUuidV4(options: UuidOptions = {}): string {
  let uuid: string;

  const webCrypto =
    typeof window !== 'undefined'
      ? window.crypto
      : (globalThis as unknown as { crypto: Crypto }).crypto;

  if (webCrypto && typeof webCrypto.randomUUID === 'function') {
    uuid = webCrypto.randomUUID();
  } else if (webCrypto && typeof webCrypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    webCrypto.getRandomValues(bytes);
    // Set version 4 (0100)
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    // Set variant (10xx)
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } else {
    throw new Error('Web Crypto API is required for secure UUID generation.');
  }

  if (options.hyphens === false) {
    uuid = uuid.replace(/-/g, '');
  }

  if (options.uppercase) {
    uuid = uuid.toUpperCase();
  }

  if (options.braces) {
    uuid = `{${uuid}}`;
  }

  return uuid;
}

/**
 * Generates multiple UUIDs up to the safety limit.
 */
export function generateBulkUuids(count: number, options: UuidOptions = {}): string[] {
  const safeCount = Math.max(1, Math.min(500, count));
  const results: string[] = [];
  for (let i = 0; i < safeCount; i++) {
    results.push(generateUuidV4(options));
  }
  return results;
}
