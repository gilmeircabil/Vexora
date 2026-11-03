import { removeBackground } from '@imgly/background-removal';

export interface BackgroundRemovalOptions {
  bgColor?: string;
  onProgress?: (status: string, percent?: number) => void;
}

export interface BackgroundRemovalResult {
  blob: Blob;
  url: string;
}

/**
 * Composites a transparent image Blob over a solid color background.
 */
async function compositeWithBackgroundColor(transparentBlob: Blob, color: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(transparentBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(transparentBlob);
        return;
      }

      // Draw solid background color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the isolated foreground on top
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (outputBlob) => {
          if (outputBlob) {
            resolve(outputBlob);
          } else {
            resolve(transparentBlob);
          }
        },
        'image/png',
        1.0,
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

/**
 * High-performance, client-side neural background removal using WebAssembly & ONNX.
 * Runs 100% in the user's browser with zero server dependencies.
 */
export async function removeImageBackground(
  imageSource: Blob | File | string,
  options: BackgroundRemovalOptions = {},
): Promise<BackgroundRemovalResult> {
  const { bgColor = 'transparent', onProgress } = options;

  if (onProgress) {
    onProgress('Initializing neural vision model...');
  }

  // Execute in-browser segmentation
  const cutoutBlob = await removeBackground(imageSource, {
    progress: (key: string, current: number, total: number) => {
      if (onProgress) {
        if (total > 0) {
          const percent = Math.min(100, Math.round((current / total) * 100));
          onProgress(`Processing image segmentation (${percent}%)...`, percent);
        } else {
          onProgress(`Processing ${key}...`);
        }
      }
    },
  });

  // If a solid background color was requested (e.g. white, black, custom hex)
  let finalBlob = cutoutBlob;
  if (bgColor && bgColor !== 'transparent') {
    if (onProgress) {
      onProgress('Applying background color...');
    }
    finalBlob = await compositeWithBackgroundColor(cutoutBlob, bgColor);
  }

  const resultUrl = URL.createObjectURL(finalBlob);
  return {
    blob: finalBlob,
    url: resultUrl,
  };
}
