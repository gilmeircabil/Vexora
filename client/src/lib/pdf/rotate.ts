import { PDFDocument, degrees } from 'pdf-lib';
import { Result, ok, err } from '../result.js';

export async function rotatePdfPages(
  sourceBuffer: ArrayBuffer,
  rotationAngle: 90 | 180 | 270,
  pageIndices?: number[], // if undefined, rotate all pages
): Promise<Result<Uint8Array, string>> {
  try {
    const pdfDoc = await PDFDocument.load(sourceBuffer, { ignoreEncryption: true });
    const totalPages = pdfDoc.getPageCount();

    const targets = pageIndices || Array.from({ length: totalPages }, (_, i) => i);

    for (const idx of targets) {
      if (idx >= 0 && idx < totalPages) {
        const page = pdfDoc.getPage(idx);
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationAngle) % 360));
      }
    }

    const outputBytes = await pdfDoc.save();
    return ok(outputBytes);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Failed to rotate PDF pages.');
  }
}
