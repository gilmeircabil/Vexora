import { Result, ok, err } from '../result.js';
import { verifyOutputBlob } from '../files/blob.js';

export interface RemoveBackgroundOptions {
  targetColor: { r: number; g: number; b: number };
  tolerance: number; // 0 to 100
  feathering: number; // 0 to 10 (edge smoothness)
  contiguous: boolean; // true = flood fill from edges, false = match all pixels
  seedPoint?: { x: number; y: number }; // optional starting point for contiguous fill
}

function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  // Weighted Euclidean distance (human perception: green > red > blue)
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
}

/**
 * Removes background color from an image using color thresholding and flood-fill,
 * outputting a clean transparent PNG entirely client-side.
 */
export async function removeImageBackground(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  options: RemoveBackgroundOptions,
): Promise<Result<{ blob: Blob; width: number; height: number }, string>> {
  try {
    const width = 'naturalWidth' in imageSource ? imageSource.naturalWidth : imageSource.width;
    const height = 'naturalHeight' in imageSource ? imageSource.naturalHeight : imageSource.height;

    if (width <= 0 || height <= 0) {
      return err('Invalid image dimensions.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      return err('Unable to obtain 2D canvas context.');
    }

    ctx.drawImage(imageSource, 0, 0);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const { targetColor, tolerance, feathering, contiguous, seedPoint } = options;
    // Map tolerance 0..100 to max distance (0..255)
    const maxDist = (tolerance / 100) * 255;
    const featherDist = Math.max(1, (feathering / 100) * 50);

    const totalPixels = width * height;
    const mask = new Uint8Array(totalPixels); // 0 = keep, 255 = remove

    if (contiguous) {
      // Flood fill from edges or designated seed point
      const queue: number[] = [];
      const visited = new Uint8Array(totalPixels);

      const checkAndEnqueue = (px: number, py: number) => {
        if (px < 0 || px >= width || py < 0 || py >= height) return;
        const idx = py * width + px;
        if (visited[idx]) return;
        visited[idx] = 1;

        const offset = idx * 4;
        const r = data[offset]!;
        const g = data[offset + 1]!;
        const b = data[offset + 2]!;

        const dist = colorDistance(r, g, b, targetColor.r, targetColor.g, targetColor.b);
        if (dist <= maxDist) {
          mask[idx] = 255;
          queue.push(idx);
        }
      };

      if (seedPoint) {
        checkAndEnqueue(seedPoint.x, seedPoint.y);
      } else {
        // Enqueue border pixels (top, bottom, left, right)
        for (let x = 0; x < width; x++) {
          checkAndEnqueue(x, 0);
          checkAndEnqueue(x, height - 1);
        }
        for (let y = 0; y < height; y++) {
          checkAndEnqueue(0, y);
          checkAndEnqueue(width - 1, y);
        }
      }

      // Process flood fill queue
      let qHead = 0;
      while (qHead < queue.length) {
        const curIdx = queue[qHead++]!;
        const cx = curIdx % width;
        const cy = Math.floor(curIdx / width);

        // 4-neighborhood
        if (cx > 0) checkAndEnqueue(cx - 1, cy);
        if (cx < width - 1) checkAndEnqueue(cx + 1, cy);
        if (cy > 0) checkAndEnqueue(cx, cy - 1);
        if (cy < height - 1) checkAndEnqueue(cx, cy + 1);
      }
    } else {
      // Global thresholding: examine every pixel
      for (let i = 0; i < totalPixels; i++) {
        const offset = i * 4;
        const r = data[offset]!;
        const g = data[offset + 1]!;
        const b = data[offset + 2]!;

        const dist = colorDistance(r, g, b, targetColor.r, targetColor.g, targetColor.b);
        if (dist <= maxDist) {
          mask[i] = 255;
        } else if (dist < maxDist + featherDist) {
          // Feather transition
          const factor = (dist - maxDist) / featherDist;
          mask[i] = Math.round(255 * (1 - factor));
        }
      }
    }

    // Apply alpha mask to image data
    for (let i = 0; i < totalPixels; i++) {
      const removeAmount = mask[i]!;
      if (removeAmount > 0) {
        const offset = i * 4 + 3; // alpha channel
        if (removeAmount >= 255) {
          data[offset] = 0; // completely transparent
        } else {
          // partial transparency for smooth edges
          const currentAlpha = data[offset]!;
          data[offset] = Math.round(currentAlpha * (1 - removeAmount / 255));
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (!blob) {
      return err('Failed to create transparent PNG output.');
    }

    const verification = await verifyOutputBlob(blob, 'png');
    if (!verification.ok) {
      return err(verification.error);
    }

    return ok({
      blob,
      width,
      height,
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Background removal failed.');
  }
}
