import { detectKind, type DetectedKind, KIND_INFO } from './signatures.js';
import { Result, ok, err } from '../result.js';

const activeUrls = new Set<string>();

/**
 * Creates an Object URL for a Blob and tracks it for batch cleanup.
 */
export function createTrackedBlobUrl(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  activeUrls.add(url);
  return url;
}

/**
 * Revokes a tracked URL.
 */
export function revokeTrackedBlobUrl(url: string | null | undefined): void {
  if (!url) return;
  if (activeUrls.has(url)) {
    activeUrls.delete(url);
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignored if already revoked
    }
  }
}

/**
 * Revokes all tracked URLs (e.g. on unmount or navigation).
 */
export function revokeAllTrackedUrls(): void {
  for (const url of activeUrls) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
  activeUrls.clear();
}

/**
 * Initiates an accessible file download in the browser without leaving the page.
 */
export function triggerFileDownload(blobOrUrl: Blob | string, filename: string): void {
  const isBlob = typeof blobOrUrl !== 'string';
  const url = isBlob ? URL.createObjectURL(blobOrUrl) : blobOrUrl;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (isBlob) {
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}

/**
 * Verifies that the produced Blob really matches the target format by sniffing magic bytes.
 * Never labels an unchanged or failed conversion as successful.
 */
export async function verifyOutputBlob(
  blob: Blob,
  expectedKind: DetectedKind,
): Promise<Result<Blob, string>> {
  if (!blob || blob.size === 0) {
    return err('Processing produced an empty output file.');
  }

  const slice = await blob.slice(0, 1024).arrayBuffer();
  const detected = detectKind(new Uint8Array(slice));

  if (!detected) {
    return err('The generated output could not be verified as a valid format.');
  }

  if (detected !== expectedKind) {
    return err(
      `Conversion error: expected ${KIND_INFO[expectedKind].label}, but output was detected as ${KIND_INFO[detected].label}.`,
    );
  }

  return ok(blob);
}
