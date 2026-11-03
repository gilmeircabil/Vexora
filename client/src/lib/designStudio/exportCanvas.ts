import type { Canvas } from 'fabric';
import { PDFDocument } from 'pdf-lib';

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp' | 'pdf';
  quality?: number; // 0.1 to 1.0 (for JPEG/WebP)
  multiplier?: number; // 1, 2, 3
  transparent?: boolean; // For PNG/WebP
  fileName?: string;
}

/**
 * Triggers browser download of a Blob
 */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports a Fabric.js canvas to the specified format without selection controls or guides
 */
export async function exportCanvas(
  canvas: Canvas,
  originalBgColor: string,
  options: ExportOptions,
): Promise<void> {
  const {
    format = 'png',
    quality = 0.92,
    multiplier = 1,
    transparent = false,
    fileName = 'vexoramods-design',
  } = options;

  // 1. Temporarily deselect any active object to remove bounding boxes
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.discardActiveObject();
  }

  // 2. Adjust background for transparency if requested
  const prevBg = canvas.backgroundColor;
  if (transparent && (format === 'png' || format === 'webp')) {
    canvas.backgroundColor = '';
  } else if (!transparent && !canvas.backgroundColor) {
    canvas.backgroundColor = originalBgColor || '#ffffff';
  }

  canvas.requestRenderAll();

  try {
    if (format === 'pdf') {
      // For PDF, generate a high-res PNG and embed into PDF using pdf-lib
      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: Math.max(multiplier, 2),
      });

      const pngImageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.create();
      // Dimensions in points (72 pt / inch vs 96 px / inch: 1px = 0.75pt)
      const widthInPoints = (canvas.getWidth() || 1080) * 0.75;
      const heightInPoints = (canvas.getHeight() || 1080) * 0.75;

      const page = pdfDoc.addPage([widthInPoints, heightInPoints]);
      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: widthInPoints,
        height: heightInPoints,
      });

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      triggerDownload(pdfBlob, `${fileName}.pdf`);
    } else {
      // Raster formats (png, jpeg, webp)
      const mimeType =
        format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
      const dataUrl = canvas.toDataURL({
        format: format === 'jpeg' ? 'jpeg' : 'png',
        quality: Math.min(Math.max(quality, 0.1), 1),
        multiplier: multiplier || 1,
      });

      // Convert to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const ext = format === 'jpeg' ? 'jpg' : format;
      triggerDownload(blob, `${fileName}.${ext}`);
    }
  } finally {
    // Restore previous canvas background & active selection
    canvas.backgroundColor = prevBg;
    if (activeObject) {
      canvas.setActiveObject(activeObject);
    }
    canvas.requestRenderAll();
  }
}
