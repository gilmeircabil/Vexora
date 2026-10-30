import { Result, ok, err } from '../result.js';
import { type ImageKind, KIND_INFO } from '../files/signatures.js';
import { verifyOutputBlob } from '../files/blob.js';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TransformImageOptions {
  crop?: CropRect;
  rotateDegrees?: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  resizeWidth?: number;
  resizeHeight?: number;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number; // 0.0 to 1.0 (for jpeg and webp)
}

/**
 * Loads an image from a Blob or ObjectURL into an HTMLImageElement safely.
 */
export function loadImageElement(source: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const isBlob = typeof source !== 'string';
    const url = isBlob ? URL.createObjectURL(source) : source;

    img.onload = () => {
      if (isBlob) URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      if (isBlob) URL.revokeObjectURL(url);
      reject(new Error('Failed to load image. The file may be corrupt or an unsupported format.'));
    };

    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/**
 * Executes an image transformation pipeline (Crop -> Rotate -> Flip -> Resize -> Encode)
 * completely in the browser via HTML5 Canvas.
 */
export async function transformImage(
  source: Blob | HTMLImageElement,
  options: TransformImageOptions = {},
): Promise<Result<{ blob: Blob; width: number; height: number }, string>> {
  try {
    const img = source instanceof HTMLImageElement ? source : await loadImageElement(source);

    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    if (origWidth <= 0 || origHeight <= 0) {
      return err('Invalid image dimensions.');
    }

    // Step 1: Calculate crop area
    const cropX = Math.max(0, options.crop?.x ?? 0);
    const cropY = Math.max(0, options.crop?.y ?? 0);
    const cropW = Math.min(origWidth - cropX, options.crop?.width ?? origWidth);
    const cropH = Math.min(origHeight - cropY, options.crop?.height ?? origHeight);

    if (cropW <= 0 || cropH <= 0) {
      return err('Invalid crop boundaries specified.');
    }

    // Step 2: Calculate rotation & flip
    const rotate = options.rotateDegrees ?? 0;
    const isTransposed = rotate === 90 || rotate === 270;

    const rotatedW = isTransposed ? cropH : cropW;
    const rotatedH = isTransposed ? cropW : cropH;

    // Step 3: Calculate target resize dimensions
    let targetW = options.resizeWidth ?? rotatedW;
    let targetH = options.resizeHeight ?? rotatedH;

    // Sanity checks on target dimensions
    targetW = Math.max(1, Math.min(16000, Math.round(targetW)));
    targetH = Math.max(1, Math.min(16000, Math.round(targetH)));

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: true });

    if (!ctx) {
      return err('Unable to obtain 2D canvas rendering context.');
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Transformations
    ctx.save();

    // Move to center of canvas for rotation/flip
    ctx.translate(targetW / 2, targetH / 2);

    if (options.flipHorizontal) {
      ctx.scale(-1, 1);
    }
    if (options.flipVertical) {
      ctx.scale(1, -1);
    }

    if (rotate !== 0) {
      ctx.rotate((rotate * Math.PI) / 180);
    }

    // Determine scale between rotated crop source and canvas target
    const drawW = isTransposed ? targetH : targetW;
    const drawH = isTransposed ? targetW : targetH;

    // Draw the cropped portion centered
    ctx.drawImage(img, cropX, cropY, cropW, cropH, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    // Target MIME type and quality
    const format = options.format ?? 'png';
    const mime = KIND_INFO[format].mime;
    const quality =
      options.quality !== undefined ? Math.max(0.01, Math.min(1.0, options.quality)) : 0.85;

    // Convert canvas to Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mime, quality);
    });

    if (!blob) {
      return err('Failed to encode image to output format.');
    }

    // Verify blob matches target format
    const verification = await verifyOutputBlob(blob, format);
    if (!verification.ok) {
      return err(verification.error);
    }

    return ok({
      blob,
      width: targetW,
      height: targetH,
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Image transformation failed.');
  }
}
