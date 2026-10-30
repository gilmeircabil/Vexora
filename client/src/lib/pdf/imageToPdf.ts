import { PDFDocument, PageSizes } from 'pdf-lib';
import { Result, ok, err } from '../result.js';

export interface ImageToPdfOptions {
  pageSize?: 'fit' | 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
}

export async function convertImagesToPdf(
  images: Array<{ bytes: Uint8Array; kind: 'png' | 'jpeg' | string }>,
  options: ImageToPdfOptions = {},
): Promise<Result<Uint8Array, string>> {
  if (images.length === 0) {
    return err('At least one image is required to build a PDF.');
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const margin = options.margin !== undefined ? options.margin : 20;

    for (let i = 0; i < images.length; i++) {
      const item = images[i]!;
      let embeddedImage;

      if (item.kind === 'png') {
        embeddedImage = await pdfDoc.embedPng(item.bytes);
      } else if (item.kind === 'jpeg' || item.kind === 'jpg') {
        embeddedImage = await pdfDoc.embedJpg(item.bytes);
      } else {
        // For other formats (e.g. webp/bmp), canvas transcoding to PNG in browser before embedding:
        // Assume png bytes supplied
        try {
          embeddedImage = await pdfDoc.embedPng(item.bytes);
        } catch {
          embeddedImage = await pdfDoc.embedJpg(item.bytes);
        }
      }

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      let pageWidth = imgWidth;
      let pageHeight = imgHeight;

      if (options.pageSize === 'a4' || options.pageSize === 'letter') {
        const baseSize = options.pageSize === 'a4' ? PageSizes.A4 : PageSizes.Letter;
        if (options.orientation === 'landscape') {
          pageWidth = baseSize[1];
          pageHeight = baseSize[0];
        } else {
          pageWidth = baseSize[0];
          pageHeight = baseSize[1];
        }
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      if (options.pageSize === 'fit') {
        // Fit exactly to image dimensions
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight,
        });
      } else {
        // Fit within page with margins
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        const x = margin + (availableWidth - scaledWidth) / 2;
        const y = margin + (availableHeight - scaledHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }
    }

    const outputBytes = await pdfDoc.save();
    return ok(outputBytes);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Failed to convert images to PDF.');
  }
}
