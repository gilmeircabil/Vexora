import { PDFDocument } from 'pdf-lib';
import { Result, ok, err } from '../result.js';

export async function mergePdfFiles(
  pdfBuffers: ArrayBuffer[],
): Promise<Result<Uint8Array, string>> {
  if (pdfBuffers.length < 2) {
    return err('At least two PDF files are required for merging.');
  }

  try {
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < pdfBuffers.length; i++) {
      const buffer = pdfBuffers[i]!;
      let srcDoc: PDFDocument;
      try {
        srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      } catch (loadError) {
        return err(
          `Document #${i + 1} could not be parsed. It may be password protected or damaged.`,
        );
      }

      const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    const mergedBytes = await mergedPdf.save();
    return ok(mergedBytes);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Failed to merge PDF documents.');
  }
}
