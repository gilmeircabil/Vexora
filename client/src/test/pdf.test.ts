import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { parsePageRange, extractPdfPages } from '../lib/pdf/split.js';
import { mergePdfFiles } from '../lib/pdf/merge.js';
import { rotatePdfPages } from '../lib/pdf/rotate.js';

describe('PDF Page Range Parser', () => {
  it('parses single pages and ranges into sorted 0-based indices', () => {
    const res = parsePageRange('1-3, 5, 8-9', 10);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toEqual([0, 1, 2, 4, 7, 8]);
    }
  });

  it('rejects ranges exceeding total page bounds', () => {
    const res = parsePageRange('1-12', 10);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('exceeds total page count');
    }
  });

  it('rejects inverted or negative ranges', () => {
    const res = parsePageRange('5-2', 10);
    expect(res.ok).toBe(false);
  });
});

describe('PDF Document Operations with Test Fixtures', () => {
  async function createTestPdf(pageCount: number): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      doc.addPage([200, 200]);
    }
    return doc.save();
  }

  it('merges multiple PDF documents into one', async () => {
    const pdf1 = await createTestPdf(2);
    const pdf2 = await createTestPdf(3);

    const merged = await mergePdfFiles([pdf1.buffer as ArrayBuffer, pdf2.buffer as ArrayBuffer]);
    expect(merged.ok).toBe(true);

    if (merged.ok) {
      const resultDoc = await PDFDocument.load(merged.value);
      expect(resultDoc.getPageCount()).toBe(5);
    }
  });

  it('extracts specific pages into a new PDF', async () => {
    const sourcePdf = await createTestPdf(5);
    // Extract pages 1 and 3 (0-based indices 0 and 2)
    const extracted = await extractPdfPages(sourcePdf.buffer as ArrayBuffer, [0, 2]);
    expect(extracted.ok).toBe(true);

    if (extracted.ok) {
      const resultDoc = await PDFDocument.load(extracted.value);
      expect(resultDoc.getPageCount()).toBe(2);
    }
  });

  it('rotates pages in a PDF document', async () => {
    const sourcePdf = await createTestPdf(1);
    const rotated = await rotatePdfPages(sourcePdf.buffer as ArrayBuffer, 90, [0]);
    expect(rotated.ok).toBe(true);

    if (rotated.ok) {
      const resultDoc = await PDFDocument.load(rotated.value);
      const page = resultDoc.getPage(0);
      expect(page.getRotation().angle).toBe(90);
    }
  });
});
