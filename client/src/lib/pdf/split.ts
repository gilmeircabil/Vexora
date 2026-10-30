import { PDFDocument } from 'pdf-lib';
import { Result, ok, err } from '../result.js';

/**
 * Parses a page range string such as "1-3, 5, 8-10" into zero-based page indices.
 */
export function parsePageRange(rangeStr: string, totalPages: number): Result<number[], string> {
  const trimmed = rangeStr.trim();
  if (!trimmed) {
    return err('Please enter one or more page numbers or ranges (e.g. 1-3, 5).');
  }

  const parts = trimmed.split(/[,;\s]+/);
  const indices = new Set<number>();

  for (const part of parts) {
    if (!part) continue;

    // Check for range "A-B"
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr || '', 10);
      const end = parseInt(endStr || '', 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        return err(`Invalid range "${part}". Must be in format "start-end" with positive numbers.`);
      }

      if (start > totalPages || end > totalPages) {
        return err(`Page range "${part}" exceeds total page count (${totalPages}).`);
      }

      for (let p = start; p <= end; p++) {
        indices.add(p - 1);
      }
    } else {
      // Single page "N"
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return err(`Invalid page number "${part}".`);
      }
      if (pageNum > totalPages) {
        return err(`Page number ${pageNum} exceeds total page count (${totalPages}).`);
      }
      indices.add(pageNum - 1);
    }
  }

  if (indices.size === 0) {
    return err('No valid pages found in the specified range.');
  }

  return ok(Array.from(indices).sort((a, b) => a - b));
}

/**
 * Extracts specified zero-based page indices into a new PDF document.
 */
export async function extractPdfPages(
  sourceBuffer: ArrayBuffer,
  pageIndices: number[],
): Promise<Result<Uint8Array, string>> {
  try {
    const srcDoc = await PDFDocument.load(sourceBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    for (const idx of pageIndices) {
      if (idx < 0 || idx >= totalPages) {
        return err(`Page index ${idx + 1} is out of bounds (1 to ${totalPages}).`);
      }
    }

    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    const outputBytes = await newDoc.save();
    return ok(outputBytes);
  } catch (error) {
    return err(error instanceof Error ? error.message : 'Failed to extract PDF pages.');
  }
}
