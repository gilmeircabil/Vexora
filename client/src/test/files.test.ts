import { describe, it, expect } from 'vitest';
import {
  detectKind,
  KIND_INFO,
  baseName,
  extensionOf,
  outputFileName,
} from '../lib/files/signatures.js';
import { parseImageDimensions } from '../lib/files/dimensions.js';
import { validateUploadedFile } from '../lib/files/validator.js';

describe('File Signatures and Kind Detection', () => {
  it('detects PNG magic bytes correctly', () => {
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    expect(detectKind(pngHeader)).toBe('png');
  });

  it('detects JPEG magic bytes correctly', () => {
    const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(detectKind(jpegHeader)).toBe('jpeg');
  });

  it('detects GIF89a and GIF87a correctly', () => {
    const gif89 = new TextEncoder().encode('GIF89a...');
    const gif87 = new TextEncoder().encode('GIF87a...');
    expect(detectKind(gif89)).toBe('gif');
    expect(detectKind(gif87)).toBe('gif');
  });

  it('detects WebP RIFF header correctly', () => {
    const webpHeader = new Uint8Array(16);
    webpHeader.set(new TextEncoder().encode('RIFF'), 0);
    webpHeader.set(new TextEncoder().encode('WEBP'), 8);
    expect(detectKind(webpHeader)).toBe('webp');
  });

  it('detects PDF document signature even if preceded by bytes', () => {
    const pdfHeader = new TextEncoder().encode('%PDF-1.7\n1 0 obj');
    expect(detectKind(pdfHeader)).toBe('pdf');
  });

  it('returns null for unknown byte streams', () => {
    const random = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    expect(detectKind(random)).toBeNull();
  });
});

describe('Filename and Extension Helpers', () => {
  it('extracts extension in lowercase', () => {
    expect(extensionOf('photo.JPEG')).toBe('jpeg');
    expect(extensionOf('archive.tar.gz')).toBe('gz');
    expect(extensionOf('README')).toBe('');
  });

  it('sanitizes base name', () => {
    expect(baseName('my:photo?.png')).toBe('my_photo_');
    expect(baseName('document.pdf')).toBe('document');
  });

  it('constructs predictable output filenames', () => {
    expect(outputFileName('scan.pdf', 'merged', 'pdf')).toBe('scan-merged.pdf');
    expect(outputFileName('photo.png', 'compressed', 'webp')).toBe('photo-compressed.webp');
  });
});

describe('Header Dimension Parser', () => {
  it('parses PNG dimensions from IHDR chunk', () => {
    const buffer = new Uint8Array(24);
    // PNG signature
    buffer.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
    // Width: 800 (0x0320) at index 16
    buffer[16] = 0x00;
    buffer[17] = 0x00;
    buffer[18] = 0x03;
    buffer[19] = 0x20;
    // Height: 600 (0x0258) at index 20
    buffer[20] = 0x00;
    buffer[21] = 0x00;
    buffer[22] = 0x02;
    buffer[23] = 0x58;

    const dims = parseImageDimensions(buffer);
    expect(dims).toEqual({ width: 800, height: 600 });
  });

  it('parses GIF dimensions', () => {
    const buffer = new Uint8Array(10);
    buffer.set(new TextEncoder().encode('GIF89a'), 0);
    // Width (little endian): 320 (0x0140)
    buffer[6] = 0x40;
    buffer[7] = 0x01;
    // Height (little endian): 240 (0x00f0)
    buffer[8] = 0xf0;
    buffer[9] = 0x00;

    const dims = parseImageDimensions(buffer);
    expect(dims).toEqual({ width: 320, height: 240 });
  });
});

describe('File Upload Validation', () => {
  it('rejects empty 0-byte file', async () => {
    const emptyFile = new File([], 'empty.png', { type: 'image/png' });
    const res = await validateUploadedFile(emptyFile);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('is empty');
    }
  });

  it('rejects files exceeding size limits', async () => {
    // 100 KB file with limit of 50 KB
    const data = new Uint8Array(100 * 1024);
    const file = new File([data], 'large.png', { type: 'image/png' });
    const res = await validateUploadedFile(file, { maxBytes: 50 * 1024 });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('exceeds the maximum allowed size');
    }
  });
});
