import {
  detectKind,
  type DetectedKind,
  type ImageKind,
  KIND_INFO,
  SIGNATURE_BYTES,
} from './signatures.js';
import { parseImageDimensions, type ImageDimensions } from './dimensions.js';
import { Result, ok, err } from '../result.js';

export interface FileValidationOptions {
  allowedKinds?: readonly DetectedKind[];
  maxBytes?: number;
  maxDimension?: number;
  maxMegapixels?: number;
}

export interface ValidatedFile {
  file: File;
  kind: DetectedKind;
  bytes: Uint8Array;
  size: number;
  name: string;
  dimensions?: ImageDimensions;
}

export const DEFAULT_MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
export const DEFAULT_MAX_DIMENSION = 12000; // 12,000 px on any edge
export const DEFAULT_MAX_MEGAPIXELS = 100; // 100 MP to prevent memory crash

/**
 * Validates an uploaded File by reading its leading magic bytes.
 * Untrusted MIME types from browsers are inspected and validated.
 */
export async function validateUploadedFile(
  file: File,
  options: FileValidationOptions = {},
): Promise<Result<ValidatedFile, string>> {
  if (!file) {
    return err('No file provided.');
  }

  const maxBytes = options.maxBytes ?? DEFAULT_MAX_FILE_BYTES;
  if (file.size > maxBytes) {
    const mbLimit = Math.round(maxBytes / (1024 * 1024));
    return err(`File "${file.name}" exceeds the maximum allowed size of ${mbLimit} MB.`);
  }

  if (file.size === 0) {
    return err(`File "${file.name}" is empty (0 bytes).`);
  }

  // Read header for signature check and dimension parsing
  let headerBuffer: ArrayBuffer;
  try {
    const slice = file.slice(0, Math.min(file.size, 65536)); // Read first 64KB for full JPEG/PNG/WebP headers
    headerBuffer = await slice.arrayBuffer();
  } catch (e) {
    return err(`Could not read file "${file.name}".`);
  }

  const headerBytes = new Uint8Array(headerBuffer);
  const detected = detectKind(headerBytes);

  if (!detected) {
    return err(
      `File "${file.name}" has an unrecognized or unsupported format. Please supply a valid image or PDF.`,
    );
  }

  if (options.allowedKinds && !options.allowedKinds.includes(detected)) {
    const allowedLabels = options.allowedKinds.map((k) => KIND_INFO[k].label).join(', ');
    return err(
      `File "${file.name}" is a ${KIND_INFO[detected].label}, but this tool expects: ${allowedLabels}.`,
    );
  }

  // If it's an image, inspect dimensions to protect against decompression bombs
  let dimensions: ImageDimensions | undefined;
  if (detected !== 'pdf') {
    const dims = parseImageDimensions(headerBytes);
    if (dims) {
      dimensions = dims;
      const maxDim = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
      if (dims.width > maxDim || dims.height > maxDim) {
        return err(
          `Image dimensions (${dims.width} × ${dims.height}) exceed the safety limit of ${maxDim}px.`,
        );
      }
      const mp = (dims.width * dims.height) / 1_000_000;
      const maxMp = options.maxMegapixels ?? DEFAULT_MAX_MEGAPIXELS;
      if (mp > maxMp) {
        return err(
          `Image resolution (${mp.toFixed(1)} MP) exceeds the safety limit of ${maxMp} MP.`,
        );
      }
    }
  }

  return ok({
    file,
    kind: detected,
    bytes: headerBytes,
    size: file.size,
    name: file.name,
    dimensions,
  });
}
