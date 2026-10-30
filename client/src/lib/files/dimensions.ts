/**
 * Fast header-based dimension reader for common image formats.
 * Inspects only the first few KB of data, preventing decompression bombs
 * before attempting to decode huge images into a canvas.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    (((bytes[offset] ?? 0) << 24) |
      ((bytes[offset + 1] ?? 0) << 16) |
      ((bytes[offset + 2] ?? 0) << 8) |
      (bytes[offset + 3] ?? 0)) >>>
    0
  );
}

function readUint16LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) |
      ((bytes[offset + 1] ?? 0) << 8) |
      ((bytes[offset + 2] ?? 0) << 16) |
      ((bytes[offset + 3] ?? 0) << 24)) >>>
    0
  );
}

/**
 * Attempts to parse dimensions directly from image headers.
 * Returns null if the format is unsupported or bytes are insufficient.
 */
export function parseImageDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 10) return null;

  // PNG: Width at byte 16, Height at byte 20 (IHDR chunk)
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    if (bytes.length < 24) return null;
    return {
      width: readUint32BE(bytes, 16),
      height: readUint32BE(bytes, 20),
    };
  }

  // GIF: Width at byte 6, Height at byte 8 (little endian)
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    if (bytes.length < 10) return null;
    return {
      width: readUint16LE(bytes, 6),
      height: readUint16LE(bytes, 8),
    };
  }

  // BMP: Width at byte 18, Height at byte 22
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    if (bytes.length < 26) return null;
    const width = readUint32LE(bytes, 18);
    const height = Math.abs(readUint32LE(bytes, 22)); // height can be negative for top-down
    return { width, height };
  }

  // JPEG: Scan markers for SOF0 (0xFFC0) to SOF2 (0xFFC2)
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset < bytes.length - 8) {
      if (bytes[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = bytes[offset + 1] ?? 0;
      // Standalone markers without length
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      const len = readUint16BE(bytes, offset + 2);
      if (len < 2) break;

      // Baseline, Extended sequential, Progressive DCT markers
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb)
      ) {
        if (offset + 7 < bytes.length) {
          const height = readUint16BE(bytes, offset + 5);
          const width = readUint16BE(bytes, offset + 7);
          return { width, height };
        }
      }
      offset += 2 + len;
    }
  }

  // WebP: RIFF ... WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    const chunkHeader = String.fromCharCode(
      bytes[12] ?? 0,
      bytes[13] ?? 0,
      bytes[14] ?? 0,
      bytes[15] ?? 0,
    );
    // VP8 (lossy)
    if (chunkHeader === 'VP8 ' && bytes.length >= 30) {
      // Keyframe 0x9d012a at bytes 23..25
      if (bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
        const width = readUint16LE(bytes, 26) & 0x3fff;
        const height = readUint16LE(bytes, 28) & 0x3fff;
        return { width, height };
      }
    }
    // VP8L (lossless)
    if (chunkHeader === 'VP8L' && bytes.length >= 25) {
      if (bytes[20] === 0x2f) {
        const b1 = bytes[21] ?? 0;
        const b2 = bytes[22] ?? 0;
        const b3 = bytes[23] ?? 0;
        const b4 = bytes[24] ?? 0;
        const width = 1 + (((b2 & 0x3f) << 8) | b1);
        const height = 1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
        return { width, height };
      }
    }
    // VP8X (extended)
    if (chunkHeader === 'VP8X' && bytes.length >= 30) {
      const width = 1 + ((bytes[24] ?? 0) | ((bytes[25] ?? 0) << 8) | ((bytes[26] ?? 0) << 16));
      const height = 1 + ((bytes[27] ?? 0) | ((bytes[28] ?? 0) << 8) | ((bytes[29] ?? 0) << 16));
      return { width, height };
    }
  }

  return null;
}
