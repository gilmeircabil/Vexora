import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ZipReader } from './zipReader.js';
import type { ExtractedDocument, DocumentSection, SupportedDocumentType } from './types.js';

// Configure pdfjs worker once
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB limit
export const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.txt', '.md'] as const;

export class DocumentParser {
  /**
   * Validate and parse an uploaded document into structured sections
   */
  public static async parseFile(file: File): Promise<ExtractedDocument> {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 25MB.`,
      );
    }

    const ext = this.getFileExtension(file.name);
    if (!ext) {
      throw new Error(
        'Unsupported file format. Please upload a PDF (.pdf), Word (.docx), PowerPoint (.pptx), Plain Text (.txt), or Markdown (.md) file.',
      );
    }

    const buffer = await this.readFileBuffer(file);

    // Verify signatures
    this.verifyFileSignature(buffer, ext);

    switch (ext) {
      case 'pdf':
        return this.parsePdf(file.name, file.size, buffer);
      case 'docx':
        return this.parseDocx(file.name, file.size, buffer);
      case 'pptx':
        return this.parsePptx(file.name, file.size, buffer);
      case 'txt':
      case 'md':
        return this.parseTextOrMarkdown(file.name, file.size, buffer, ext);
      default:
        throw new Error(`Unsupported document extension: .${ext}`);
    }
  }

  public static async readFileBuffer(file: File | Blob): Promise<ArrayBuffer> {
    if (typeof file.arrayBuffer === 'function') {
      try {
        return await file.arrayBuffer();
      } catch {
        // Fallback to FileReader below
      }
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file into buffer'));
      reader.readAsArrayBuffer(file);
    });
  }

  public static getFileExtension(filename: string): SupportedDocumentType | null {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    if (lower.endsWith('.docx')) return 'docx';
    if (lower.endsWith('.pptx')) return 'pptx';
    if (lower.endsWith('.txt')) return 'txt';
    if (lower.endsWith('.md')) return 'md';
    return null;
  }

  private static verifyFileSignature(buffer: ArrayBuffer, type: SupportedDocumentType): void {
    if (buffer.byteLength < 4) {
      throw new Error('File is empty or corrupted.');
    }

    const bytes = new Uint8Array(buffer, 0, 4);

    if (type === 'pdf') {
      // PDF magic: %PDF (0x25 0x50 0x44 0x46)
      if (bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) {
        throw new Error(
          'File extension is .pdf, but file content does not have a valid PDF signature.',
        );
      }
    } else if (type === 'docx' || type === 'pptx') {
      // ZIP magic: PK\x03\x04 (0x50 0x4B 0x03 0x04)
      if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
        throw new Error(
          `File is not a valid modern Office XML package (missing standard ZIP header). Legacy .doc or .ppt binary files are not supported.`,
        );
      }
    }
  }

  /**
   * PDF Parser using pdfjs-dist
   */
  private static async parsePdf(
    name: string,
    fileSize: number,
    buffer: ArrayBuffer,
  ): Promise<ExtractedDocument> {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const sections: DocumentSection[] = [];
      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .filter(Boolean);

        const pageText = this.cleanExtractedText(pageStrings.join(' '));
        fullText += (fullText ? '\n\n' : '') + pageText;

        const words = pageText ? pageText.split(/\s+/).filter(Boolean).length : 0;
        const detectedTerms = this.extractCandidateTerms(pageText);

        sections.push({
          id: `page-${i}`,
          title: `Page ${i}`,
          pageNumber: i,
          content: pageText,
          wordCount: words,
          detectedTerms,
        });
      }

      const totalWords = fullText.split(/\s+/).filter(Boolean).length;
      const isScanned = numPages > 0 && totalWords < 30;

      const warnings: string[] = [];
      if (isScanned) {
        warnings.push(
          'This PDF appears to contain scanned images or minimal selectable text. Question generation requires readable text content.',
        );
      }

      return {
        name,
        fileType: 'pdf',
        fileSize,
        totalPages: numPages,
        totalWords,
        sections,
        rawText: fullText,
        isScanned,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (err: any) {
      throw new Error(
        `Failed to parse PDF document: ${err.message || 'Corrupt or protected file'}`,
      );
    }
  }

  /**
   * DOCX Parser using ZipReader and DOMParser on word/document.xml
   */
  private static async parseDocx(
    name: string,
    fileSize: number,
    buffer: ArrayBuffer,
  ): Promise<ExtractedDocument> {
    try {
      const zip = new ZipReader(buffer);
      const entries = await zip.parse();

      const docXmlEntry = entries.get('word/document.xml');
      if (!docXmlEntry) {
        throw new Error('Invalid Word document: word/document.xml not found inside package.');
      }

      const xmlText = await docXmlEntry.readText();
      const dom = new DOMParser().parseFromString(xmlText, 'application/xml');

      const body = dom.getElementsByTagName('w:body')[0];
      if (!body) {
        throw new Error('Invalid Word document structure: w:body element missing.');
      }

      const sections: DocumentSection[] = [];
      let currentSectionTitle = 'Introduction';
      let currentSectionText: string[] = [];
      let fullText = '';
      let sectionIndex = 1;

      const flushSection = () => {
        const text = this.cleanExtractedText(currentSectionText.join('\n'));
        if (text) {
          fullText += (fullText ? '\n\n' : '') + text;
          const words = text.split(/\s+/).filter(Boolean).length;
          sections.push({
            id: `sec-${sectionIndex++}`,
            title: currentSectionTitle,
            content: text,
            wordCount: words,
            detectedTerms: this.extractCandidateTerms(text),
          });
        }
        currentSectionText = [];
      };

      const paragraphs = Array.from(dom.getElementsByTagName('*')).filter(
        (el) => el.localName === 'p',
      );
      paragraphs.forEach((p) => {
        const textNodes = Array.from(p.getElementsByTagName('*')).filter(
          (el) => el.localName === 't',
        );
        let pText = '';
        textNodes.forEach((t) => {
          pText += t.textContent || '';
        });
        pText = pText.trim();
        if (!pText) return;

        // Check if heading
        const pStyle = Array.from(p.getElementsByTagName('*')).find(
          (el) => el.localName === 'pStyle',
        );
        const styleVal = pStyle?.getAttribute('w:val') || pStyle?.getAttribute('val') || '';
        const isHeading =
          /heading/i.test(styleVal) || (pText.length < 80 && /^[A-Z0-9\s:.-]+$/.test(pText));

        if (isHeading && currentSectionText.length > 0) {
          flushSection();
          currentSectionTitle = pText;
        } else {
          currentSectionText.push(pText);
        }
      });

      // Flush remaining
      flushSection();

      if (sections.length === 0) {
        sections.push({
          id: 'sec-1',
          title: 'Document Content',
          content: fullText,
          wordCount: fullText.split(/\s+/).filter(Boolean).length,
          detectedTerms: this.extractCandidateTerms(fullText),
        });
      }

      const totalWords = fullText.split(/\s+/).filter(Boolean).length;

      return {
        name,
        fileType: 'docx',
        fileSize,
        totalWords,
        sections,
        rawText: fullText,
        warnings:
          totalWords < 20 ? ['This Word document has very little text content.'] : undefined,
      };
    } catch (err: any) {
      throw new Error(`Failed to parse Word document: ${err.message || 'Corrupt or invalid DOCX'}`);
    }
  }

  /**
   * PPTX Parser using ZipReader and DOMParser on ppt/slides/slide*.xml
   */
  private static async parsePptx(
    name: string,
    fileSize: number,
    buffer: ArrayBuffer,
  ): Promise<ExtractedDocument> {
    try {
      const zip = new ZipReader(buffer);
      const entries = await zip.parse();

      // Find slide files: ppt/slides/slide1.xml, slide2.xml, etc.
      const slideFilenames: string[] = [];
      for (const fname of entries.keys()) {
        if (/^ppt\/slides\/slide\d+\.xml$/i.test(fname)) {
          slideFilenames.push(fname);
        }
      }

      if (slideFilenames.length === 0) {
        throw new Error('No presentation slides found in PPTX package.');
      }

      // Sort slides in natural numerical order
      slideFilenames.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      const sections: DocumentSection[] = [];
      let fullText = '';

      for (let i = 0; i < slideFilenames.length; i++) {
        const fname = slideFilenames[i];
        if (!fname) continue;
        const slideNumber = i + 1;
        const entry = entries.get(fname);
        if (!entry) continue;
        const xmlText = await entry.readText();
        const dom = new DOMParser().parseFromString(xmlText, 'application/xml');

        // Extract slide text shapes
        const textElements = Array.from(dom.getElementsByTagName('*')).filter(
          (el) => el.localName === 'p',
        );
        let slideTitle = `Slide ${slideNumber}`;
        const slideLines: string[] = [];

        textElements.forEach((pElem) => {
          const tNodes = Array.from(pElem.getElementsByTagName('*')).filter(
            (el) => el.localName === 't',
          );
          let lineText = '';
          tNodes.forEach((t) => {
            lineText += t.textContent || '';
          });
          lineText = lineText.trim();
          if (!lineText) return;

          // If first substantial text and slideTitle is still default, use as slide title
          if (slideTitle === `Slide ${slideNumber}` && lineText.length < 90) {
            slideTitle = lineText;
          } else {
            slideLines.push(lineText);
          }
        });

        const slideBody = this.cleanExtractedText(slideLines.join('\n'));
        const combined = `${slideTitle}\n${slideBody}`.trim();
        fullText += (fullText ? '\n\n' : '') + combined;

        const words = combined.split(/\s+/).filter(Boolean).length;
        sections.push({
          id: `slide-${slideNumber}`,
          title: slideTitle,
          slideNumber,
          content: combined,
          wordCount: words,
          detectedTerms: this.extractCandidateTerms(combined),
        });
      }

      const totalWords = fullText.split(/\s+/).filter(Boolean).length;

      return {
        name,
        fileType: 'pptx',
        fileSize,
        totalSlides: slideFilenames.length,
        totalWords,
        sections,
        rawText: fullText,
        warnings:
          totalWords < 20 ? ['This presentation contains very little text content.'] : undefined,
      };
    } catch (err: any) {
      throw new Error(
        `Failed to parse PowerPoint presentation: ${err.message || 'Corrupt or invalid PPTX'}`,
      );
    }
  }

  /**
   * Plain Text & Markdown Parser
   */
  private static parseTextOrMarkdown(
    name: string,
    fileSize: number,
    buffer: ArrayBuffer,
    type: 'txt' | 'md',
  ): ExtractedDocument {
    const textDecoder = new TextDecoder('utf-8');
    const rawContent = textDecoder.decode(buffer);
    const cleaned = this.cleanExtractedText(rawContent);

    if (!cleaned) {
      throw new Error('The text file is empty.');
    }

    const lines = cleaned.split(/\r?\n/);
    const sections: DocumentSection[] = [];
    let currentTitle = type === 'md' ? 'Introduction' : 'Section 1';
    let currentLines: string[] = [];
    let sectionIdx = 1;

    const flush = () => {
      const sectionText = currentLines.join('\n').trim();
      if (sectionText) {
        sections.push({
          id: `sec-${sectionIdx++}`,
          title: currentTitle,
          content: sectionText,
          wordCount: sectionText.split(/\s+/).filter(Boolean).length,
          detectedTerms: this.extractCandidateTerms(sectionText),
        });
      }
      currentLines = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        currentLines.push('');
        return;
      }

      // Markdown header: # Heading or ## Heading
      const isMdHeading = type === 'md' && /^#{1,4}\s+(.+)$/.test(trimmed);
      // TXT section: ALL CAPS line under 60 chars or "Chapter N"
      const isTxtSection =
        type === 'txt' &&
        trimmed.length > 3 &&
        trimmed.length < 60 &&
        (/^(Chapter|Section|Part|Unit|\d+\.)/i.test(trimmed) ||
          /^[A-Z0-9\s:.-]{4,}$/.test(trimmed));

      if (isMdHeading) {
        flush();
        const match = trimmed.match(/^#{1,4}\s+(.+)$/);
        currentTitle = match && match[1] ? match[1].trim() : trimmed;
      } else if (isTxtSection) {
        if (currentLines.some((l) => l.trim().length > 0)) {
          flush();
        }
        currentTitle = trimmed;
      } else {
        currentLines.push(line);
      }
    });

    flush();

    if (sections.length === 0) {
      sections.push({
        id: 'sec-1',
        title: 'Document Content',
        content: cleaned,
        wordCount: cleaned.split(/\s+/).filter(Boolean).length,
        detectedTerms: this.extractCandidateTerms(cleaned),
      });
    }

    const totalWords = cleaned.split(/\s+/).filter(Boolean).length;

    return {
      name,
      fileType: type,
      fileSize,
      totalWords,
      sections,
      rawText: cleaned,
      warnings: totalWords < 20 ? ['The document contains very little text content.'] : undefined,
    };
  }

  /**
   * Cleans text: removes non-printable chars, excessive whitespace, header/footer boilerplate
   */
  private static cleanExtractedText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove non-printable ASCII
      .replace(/[ \t]{2,}/g, ' ') // collapse multi-spaces
      .replace(/\n{3,}/g, '\n\n') // collapse multiple blank lines
      .trim();
  }

  /**
   * Extract prominent technical or domain terms from text
   */
  public static extractCandidateTerms(text: string): string[] {
    const terms = new Set<string>();

    // 1. Definition patterns: "X is defined as...", "X refers to..."
    const defRegex =
      /\b([A-Z][a-zA-Z0-9\s-]{2,35})\s+(?:is defined as|refers to|means|is the process of|is known as|is a type of|is an?|acts as|functions to)\b/g;
    let match: RegExpExecArray | null;
    while ((match = defRegex.exec(text)) !== null) {
      if (match[1]) {
        const term = match[1].trim();
        if (this.isValidTerm(term)) terms.add(term);
      }
    }

    // 2. Colons following capitalized terms: "Mitochondria: The powerhouse..."
    const colonRegex = /\b([A-Z][a-zA-Z0-9\s-]{2,35}):\s+[A-Z]/g;
    while ((match = colonRegex.exec(text)) !== null) {
      if (match[1]) {
        const term = match[1].trim();
        if (this.isValidTerm(term)) terms.add(term);
      }
    }

    // 3. Quoted terms or acronyms: "DNS", "Photosynthesis"
    const acronymRegex = /\b[A-Z]{2,6}\b/g;
    while ((match = acronymRegex.exec(text)) !== null) {
      if (match[0]) {
        const term = match[0].trim();
        if (this.isValidTerm(term)) terms.add(term);
      }
    }

    return Array.from(terms).slice(0, 15);
  }

  private static isValidTerm(term: string): boolean {
    if (!term || term.length < 3 || term.length > 40) return false;
    const lower = term.toLowerCase();
    const stopWords = [
      'the',
      'this',
      'that',
      'these',
      'those',
      'there',
      'here',
      'page',
      'chapter',
      'figure',
      'table',
      'section',
      'note',
      'example',
      'all rights reserved',
      'copyright',
    ];
    if (stopWords.includes(lower)) return false;
    return true;
  }
}
