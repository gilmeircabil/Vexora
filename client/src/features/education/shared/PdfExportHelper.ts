import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface CertificateData {
  recipientName: string;
  courseTitle: string;
  achievementDescription?: string;
  date: string;
  instructorName: string;
  institutionName?: string;
  templateStyle?: 'classic' | 'modern' | 'excellence';
}

export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  // Create a new landscape document (Letter landscape: 792 x 612 pt)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([792, 612]);
  const { width, height } = page.getSize();

  const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontBody = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Outer Border (Neo-Brutalism thick black border + yellow accent)
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.067, 0.067, 0.067),
    borderWidth: 4,
    color: rgb(0.98, 0.968, 0.949), // Warm background #FAF7F2
  });

  // Inner Accent Frame
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: rgb(1, 0.824, 0.102), // Yellow #FFD21A
    borderWidth: 2,
  });

  // Institution / Header
  const institution = (data.institutionName || 'VEXORAMODS LEARNING ACADEMY').toUpperCase();
  const instWidth = fontTitle.widthOfTextAtSize(institution, 14);
  page.drawText(institution, {
    x: (width - instWidth) / 2,
    y: height - 80,
    size: 14,
    font: fontTitle,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Title: "CERTIFICATE OF ACHIEVEMENT"
  const title = 'CERTIFICATE OF ACHIEVEMENT';
  const titleWidth = fontTitle.widthOfTextAtSize(title, 28);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 125,
    size: 28,
    font: fontTitle,
    color: rgb(0.07, 0.07, 0.07),
  });

  // Presentation text
  const presentedTo = 'PROUDLY PRESENTED TO';
  const presentedWidth = fontBody.widthOfTextAtSize(presentedTo, 11);
  page.drawText(presentedTo, {
    x: (width - presentedWidth) / 2,
    y: height - 175,
    size: 11,
    font: fontBody,
    color: rgb(0.45, 0.45, 0.45),
  });

  // Recipient Name (Prominent & underlined)
  const recipient = data.recipientName || 'Student Name';
  const recSize = 32;
  const recWidth = fontTitle.widthOfTextAtSize(recipient, recSize);
  page.drawText(recipient, {
    x: (width - recWidth) / 2,
    y: height - 225,
    size: recSize,
    font: fontTitle,
    color: rgb(0.07, 0.07, 0.07),
  });

  page.drawLine({
    start: { x: (width - recWidth) / 2 - 20, y: height - 235 },
    end: { x: (width + recWidth) / 2 + 20, y: height - 235 },
    thickness: 2,
    color: rgb(1, 0.824, 0.102),
  });

  // Course / Achievement
  const courseText = `For outstanding completion and excellence in`;
  const courseTextWidth = fontBody.widthOfTextAtSize(courseText, 13);
  page.drawText(courseText, {
    x: (width - courseTextWidth) / 2,
    y: height - 275,
    size: 13,
    font: fontBody,
    color: rgb(0.3, 0.3, 0.3),
  });

  const courseTitle = data.courseTitle || 'Advanced Studies Program';
  const courseTitleWidth = fontTitle.widthOfTextAtSize(courseTitle, 18);
  page.drawText(courseTitle, {
    x: (width - courseTitleWidth) / 2,
    y: height - 305,
    size: 18,
    font: fontTitle,
    color: rgb(0.07, 0.07, 0.07),
  });

  if (data.achievementDescription) {
    const desc = data.achievementDescription;
    const descWidth = fontItalic.widthOfTextAtSize(desc, 11);
    page.drawText(desc, {
      x: (width - descWidth) / 2,
      y: height - 335,
      size: 11,
      font: fontItalic,
      color: rgb(0.45, 0.45, 0.45),
    });
  }

  // Signatures and Date lines (left and right)
  const leftX = 120;
  const rightX = width - 260;
  const lineY = 120;

  // Date Column
  page.drawLine({
    start: { x: leftX, y: lineY },
    end: { x: leftX + 160, y: lineY },
    thickness: 1.5,
    color: rgb(0.1, 0.1, 0.1),
  });
  const dateStr = data.date || new Date().toLocaleDateString();
  const dateWidth = fontBody.widthOfTextAtSize(dateStr, 11);
  page.drawText(dateStr, {
    x: leftX + (160 - dateWidth) / 2,
    y: lineY + 6,
    size: 11,
    font: fontBody,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText('DATE ISSUED', {
    x: leftX + (160 - fontTitle.widthOfTextAtSize('DATE ISSUED', 9)) / 2,
    y: lineY - 14,
    size: 9,
    font: fontTitle,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Instructor Column
  page.drawLine({
    start: { x: rightX, y: lineY },
    end: { x: rightX + 160, y: lineY },
    thickness: 1.5,
    color: rgb(0.1, 0.1, 0.1),
  });
  const instructor = data.instructorName || 'Instructor';
  const instNameWidth = fontBody.widthOfTextAtSize(instructor, 11);
  page.drawText(instructor, {
    x: rightX + (160 - instNameWidth) / 2,
    y: lineY + 6,
    size: 11,
    font: fontBody,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText('INSTRUCTOR / VERIFIER', {
    x: rightX + (160 - fontTitle.widthOfTextAtSize('INSTRUCTOR / VERIFIER', 9)) / 2,
    y: lineY - 14,
    size: 9,
    font: fontTitle,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Disclaimer at bottom
  const disclaimer =
    'Notice: This certificate is issued for educational recognition and is not an officially accredited credential.';
  const disWidth = fontItalic.widthOfTextAtSize(disclaimer, 8);
  page.drawText(disclaimer, {
    x: (width - disWidth) / 2,
    y: 45,
    size: 8,
    font: fontItalic,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
