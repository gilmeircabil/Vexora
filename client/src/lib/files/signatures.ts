/**
 * Content-based file type detection ("magic bytes").
 * Browser-supplied MIME types and file extensions are treated as untrusted;
 * these signatures are the authoritative check.
 */

export type DetectedKind = 'png' | 'jpeg' | 'gif' | 'webp' | 'bmp' | 'avif' | 'pdf';
export type ImageKind = Exclude<DetectedKind, 'pdf'>;

export const IMAGE_KINDS: readonly ImageKind[] = ['png', 'jpeg', 'gif', 'webp', 'bmp', 'avif'];

export const KIND_INFO: Record<
  DetectedKind,
  { mime: string; extensions: readonly string[]; label: string }
> = {
  png: { mime: 'image/png', extensions: ['png'], label: 'PNG' },
  jpeg: { mime: 'image/jpeg', extensions: ['jpg', 'jpeg', 'jfif', 'jpe'], label: 'JPEG' },
  gif: { mime: 'image/gif', extensions: ['gif'], label: 'GIF' },
  webp: { mime: 'image/webp', extensions: ['webp'], label: 'WebP' },
  bmp: { mime: 'image/bmp', extensions: ['bmp', 'dib'], label: 'BMP' },
  avif: { mime: 'image/avif', extensions: ['avif'], label: 'AVIF' },
  pdf: { mime: 'application/pdf', extensions: ['pdf'], label: 'PDF' },
};

/** Number of leading bytes needed for signature detection. */
export const SIGNATURE_BYTES = 1024;

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  let out = '';
  for (let i = offset; i < offset + length && i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i] ?? 0);
  }
  return out;
}

function startsWith(bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((value, index) => bytes[offset + index] === value);
}

/** Detects the real file type from its leading bytes, or null if unknown. */
export function detectKind(bytes: Uint8Array): DetectedKind | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
  const head6 = ascii(bytes, 0, 6);
  if (head6 === 'GIF87a' || head6 === 'GIF89a') return 'gif';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  if (ascii(bytes, 0, 2) === 'BM' && bytes.length >= 26) return 'bmp';
  if (ascii(bytes, 4, 4) === 'ftyp') {
    const brand = ascii(bytes, 8, 4);
    if (brand === 'avif' || brand === 'avis') return 'avif';
    // Compatible brands list may contain avif (e.g. "mif1" major brand).
    const boxSize =
      ((bytes[0] ?? 0) << 24) | ((bytes[1] ?? 0) << 16) | ((bytes[2] ?? 0) << 8) | (bytes[3] ?? 0);
    for (let i = 16; i + 4 <= Math.min(boxSize, bytes.length); i += 4) {
      const compat = ascii(bytes, i, 4);
      if (compat === 'avif' || compat === 'avis') return 'avif';
    }
  }
  // The PDF header may legally be preceded by junk within the first 1024 bytes.
  const head = ascii(bytes, 0, Math.min(bytes.length, SIGNATURE_BYTES));
  if (head.includes('%PDF-')) return 'pdf';
  return null;
}

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0 || dot === filename.length - 1) return '';
  return filename.slice(dot + 1).toLowerCase();
}

/** Returns the base name without extension, sanitised for use as a download name. */
export function baseName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const raw = dot > 0 ? filename.slice(0, dot) : filename;
  const cleaned = raw.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim();
  return cleaned || 'file';
}

export function kindFromMime(mime: string): DetectedKind | null {
  const entry = (
    Object.entries(KIND_INFO) as Array<[DetectedKind, (typeof KIND_INFO)[DetectedKind]]>
  ).find(([, info]) => info.mime === mime);
  return entry ? entry[0] : null;
}

/** Builds an output filename such as "photo-compressed.webp". */
export function outputFileName(original: string, suffix: string, kind: DetectedKind): string {
  const ext = KIND_INFO[kind].extensions[0] ?? kind;
  return `${baseName(original)}${suffix ? `-${suffix}` : ''}.${ext}`;
}
