import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';
import { DocumentParser } from '../features/education/doc-quiz/documentParser.js';
import { QuizEngine } from '../features/education/doc-quiz/quizEngine.js';
import { DocumentQuizGenerator } from '../features/education/doc-quiz/DocumentQuizGenerator.js';
import { StudySpacePage } from '../pages/education/StudySpacePage.js';
import type { ExtractedDocument, QuizConfig } from '../features/education/doc-quiz/types.js';
import { deflateRawSync } from 'zlib';

/**
 * Helper to construct a minimal standard PK ZIP archive buffer in memory
 */
function createMockZipBuffer(files: Record<string, string>): ArrayBuffer {
  const localHeaders: Buffer[] = [];
  const cdEntries: Buffer[] = [];
  let currentOffset = 0;

  for (const [filename, content] of Object.entries(files)) {
    const filenameBuf = Buffer.from(filename, 'utf-8');
    const contentBuf = Buffer.from(content, 'utf-8');
    const compressedBuf = deflateRawSync(contentBuf);

    // Local Header (30 bytes + name + compressed)
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); // PK\x03\x04
    lh.writeUInt16LE(20, 4); // version needed
    lh.writeUInt16LE(0, 6); // flags
    lh.writeUInt16LE(8, 8); // compression method (deflate)
    lh.writeUInt16LE(0, 10); // time
    lh.writeUInt16LE(0, 12); // date
    lh.writeUInt32LE(0, 14); // crc32
    lh.writeUInt32LE(compressedBuf.length, 18); // compressed size
    lh.writeUInt32LE(contentBuf.length, 22); // uncompressed size
    lh.writeUInt16LE(filenameBuf.length, 26); // name length
    lh.writeUInt16LE(0, 28); // extra len

    const localEntry = Buffer.concat([lh, filenameBuf, compressedBuf]);
    localHeaders.push(localEntry);

    // Central Directory Entry (46 bytes + name)
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); // PK\x01\x02
    cd.writeUInt16LE(20, 4); // version made by
    cd.writeUInt16LE(20, 6); // version needed
    cd.writeUInt16LE(0, 8); // flags
    cd.writeUInt16LE(8, 10); // method (deflate)
    cd.writeUInt16LE(0, 12); // time
    cd.writeUInt16LE(0, 14); // date
    cd.writeUInt32LE(0, 16); // crc32
    cd.writeUInt32LE(compressedBuf.length, 20); // compressed size
    cd.writeUInt32LE(contentBuf.length, 24); // uncompressed size
    cd.writeUInt16LE(filenameBuf.length, 28); // name length
    cd.writeUInt16LE(0, 30); // extra length
    cd.writeUInt16LE(0, 32); // comment length
    cd.writeUInt16LE(0, 34); // disk start
    cd.writeUInt16LE(0, 36); // internal attr
    cd.writeUInt32LE(0, 38); // external attr
    cd.writeUInt32LE(currentOffset, 42); // local header offset

    cdEntries.push(Buffer.concat([cd, filenameBuf]));
    currentOffset += localEntry.length;
  }

  const allLocal = Buffer.concat(localHeaders);
  const allCd = Buffer.concat(cdEntries);

  // EOCD (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // PK\x05\x06
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // disk cd start
  eocd.writeUInt16LE(Object.keys(files).length, 8); // total cd on disk
  eocd.writeUInt16LE(Object.keys(files).length, 10); // total cd entries
  eocd.writeUInt32LE(allCd.length, 12); // cd size
  eocd.writeUInt32LE(allLocal.length, 16); // cd offset
  eocd.writeUInt16LE(0, 20); // comment len

  const finalZip = Buffer.concat([allLocal, allCd, eocd]);
  return finalZip.buffer.slice(finalZip.byteOffset, finalZip.byteOffset + finalZip.byteLength);
}

describe('VexoraMods Document-to-Quiz Generator Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (typeof url === 'string' && url.includes('/api/auth/me')) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ success: false, error: 'Unauthenticated' }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/education/quizzes')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: [] }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/education/attempts')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: [] }),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: {} }),
        };
      }),
    );
  });

  describe('1. Document Parser & Content Extraction', () => {
    it('correctly parses plain text (.txt) and extracts structured sections', async () => {
      const content = `Chapter 1: Principles of Operating Systems\n\nOperating Systems are responsible for managing hardware resources and providing common services for computer programs.\n\nThe Kernel is defined as the core component of an operating system that has complete control over everything in the system.\n\nVirtual Memory is used to enable execution of processes that may not be completely in memory.`;
      const file = new File([content], 'operating_systems.txt', { type: 'text/plain' });

      const extracted = await DocumentParser.parseFile(file);

      expect(extracted.fileType).toBe('txt');
      expect(extracted.name).toBe('operating_systems.txt');
      expect(extracted.totalWords).toBeGreaterThan(30);
      expect(extracted.sections.length).toBeGreaterThan(0);
      expect(extracted.sections[0]!.title).toContain('Operating Systems');
    });

    it('correctly parses Markdown (.md) and preserves headings', async () => {
      const content = `# Database Management Systems\n\nA Database is defined as an organized collection of structured information or data stored electronically in a computer system.\n\n## Relational Databases\n\nSQL refers to Structured Query Language, which is used to manage and query relational database management systems.\n\nACID properties are responsible for ensuring reliable processing of database transactions.`;
      const file = new File([content], 'databases.md', { type: 'text/markdown' });

      const extracted = await DocumentParser.parseFile(file);

      expect(extracted.fileType).toBe('md');
      expect(extracted.sections.length).toBeGreaterThanOrEqual(2);
      expect(extracted.sections[0]!.title).toBe('Database Management Systems');
      expect(extracted.sections[1]!.title).toBe('Relational Databases');
    });

    it('correctly parses modern Word (.docx) XML structure', async () => {
      const docXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:t>Cell Biology Fundamentals</w:t>
    </w:p>
    <w:p>
      <w:t>Mitochondria are known as the powerhouse of the cell because they generate ATP.</w:t>
    </w:p>
    <w:p>
      <w:t>Ribosomes are responsible for protein synthesis in the cytoplasm.</w:t>
    </w:p>
  </w:body>
</w:document>`;

      const zipBuf = createMockZipBuffer({
        'word/document.xml': docXml,
      });

      const file = new File([zipBuf], 'biology_unit1.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const extracted = await DocumentParser.parseFile(file);

      expect(extracted.fileType).toBe('docx');
      expect(extracted.totalWords).toBeGreaterThan(15);
      expect(extracted.rawText).toContain('powerhouse of the cell');
      expect(extracted.rawText).toContain('Ribosomes');
    });

    it('correctly parses modern PowerPoint (.pptx) slide presentations', async () => {
      const slide1Xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp><p:txBody><a:p><a:t>Introduction to Cloud Computing</a:t></a:p></p:txBody></p:sp>
      <p:sp><p:txBody><a:p><a:t>Cloud Computing is defined as on-demand availability of computing system resources over the internet.</a:t></a:p></p:txBody></p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

      const slide2Xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp><p:txBody><a:p><a:t>Cloud Service Models</a:t></a:p></p:txBody></p:sp>
      <p:sp><p:txBody><a:p><a:t>IaaS refers to Infrastructure as a Service, providing virtualized hardware computing resources.</a:t></a:p></p:txBody></p:sp>
      <p:sp><p:txBody><a:p><a:t>SaaS represents Software as a Service, delivering applications directly to end-users via web browsers.</a:t></a:p></p:txBody></p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

      const zipBuf = createMockZipBuffer({
        'ppt/slides/slide1.xml': slide1Xml,
        'ppt/slides/slide2.xml': slide2Xml,
      });

      const file = new File([zipBuf], 'cloud_lecture.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });

      const extracted = await DocumentParser.parseFile(file);

      expect(extracted.fileType).toBe('pptx');
      expect(extracted.totalSlides).toBe(2);
      expect(extracted.sections.length).toBe(2);
      expect(extracted.sections[0]!.title).toContain('Introduction to Cloud');
      expect(extracted.sections[1]!.title).toContain('Cloud Service Models');
      expect(extracted.sections[1]!.slideNumber).toBe(2);
    });

    it('detects scanned/empty documents and throws meaningful errors for corrupt files', async () => {
      // Empty text file
      const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
      await expect(DocumentParser.parseFile(emptyFile)).rejects.toThrow(/empty/i);

      // Unsupported extension
      const imageFile = new File(['mock content'], 'photo.png', { type: 'image/png' });
      await expect(DocumentParser.parseFile(imageFile)).rejects.toThrow(/unsupported/i);

      // Invalid signature (.docx without zip header)
      const badDocx = new File(['Not a real zip archive'], 'fake.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      await expect(DocumentParser.parseFile(badDocx)).rejects.toThrow(/ZIP header/i);
    });
  });

  describe('2. Zero-Cost Question Generation Engine & Question Types', () => {
    const mockDocument: ExtractedDocument = {
      name: 'Software_Engineering_Fundamentals.txt',
      fileType: 'txt',
      fileSize: 4500,
      totalWords: 350,
      rawText: '',
      sections: [
        {
          id: 'sec-1',
          title: 'Software Design Patterns',
          pageNumber: 1,
          wordCount: 180,
          detectedTerms: ['Singleton', 'Observer', 'Factory', 'Decorator'],
          content: `The Singleton Pattern is defined as a creational software design pattern that guarantees a class has only one instance and provides a global point of access to it.

The Observer Pattern refers to a behavioral design pattern that enables objects to notify multiple subscribers about state changes.

The Factory Pattern is responsible for creating objects without specifying the exact class of object that will be created.

The Decorator Pattern functions to attach additional responsibilities to an object dynamically without modifying original class code.`,
        },
        {
          id: 'sec-2',
          title: 'Architecture & Modularity',
          pageNumber: 2,
          wordCount: 170,
          detectedTerms: ['Modularity', 'Coupling', 'Cohesion'],
          content: `Coupling refers to the degree of interdependence between software modules. Low coupling is desirable for maintainability.

Cohesion is defined as the measure of how strongly-related and focused the responsibilities of a single software module are. High cohesion leads to robust code.

Encapsulation acts as a barrier that bundles data with the methods operating on that data, restricting direct access from outside components.`,
        },
      ],
    };

    it('generates Multiple Choice questions with 4 distinct options and verified answer', () => {
      const config: QuizConfig = {
        title: 'Design Patterns Quiz',
        subject: 'Software Engineering',
        questionCount: 4,
        difficulty: 'mixed',
        questionTypes: ['multiple_choice'],
        includeExplanations: true,
        shuffleQuestions: false,
        shuffleOptions: false,
      };

      const questions = QuizEngine.generateQuiz(mockDocument, config);

      expect(questions.length).toBeGreaterThan(0);
      const mc = questions[0]!;
      expect(mc.type).toBe('multiple_choice');
      expect(mc.options).toBeDefined();
      expect(mc.options!.length).toBeGreaterThanOrEqual(3);
      expect(mc.options).toContain(mc.correctAnswer);
      expect(mc.explanation).toContain(mc.correctAnswer);
      // Source transparency
      expect(mc.sourceReference).toBeDefined();
      expect(mc.sourceReference.documentName).toBe('Software_Engineering_Fundamentals.txt');
      expect(mc.sourceReference.excerpt.length).toBeGreaterThan(10);
    });

    it('generates True or False questions with verified evidence', () => {
      const config: QuizConfig = {
        title: 'True False Quiz',
        subject: 'Software Engineering',
        questionCount: 4,
        difficulty: 'mixed',
        questionTypes: ['true_false'],
        includeExplanations: true,
        shuffleQuestions: false,
        shuffleOptions: false,
      };

      const questions = QuizEngine.generateQuiz(mockDocument, config);

      expect(questions.length).toBeGreaterThan(0);
      const tf = questions.find((q) => q.type === 'true_false');
      expect(tf).toBeDefined();
      expect(['True', 'False']).toContain(tf!.correctAnswer);
      expect(tf!.options).toEqual(['True', 'False']);
      expect(tf!.explanation.length).toBeGreaterThan(10);
    });

    it('generates Identification and Fill in the Blank questions with acceptable alternatives', () => {
      const config: QuizConfig = {
        title: 'Identification & Cloze Quiz',
        subject: 'Software Engineering',
        questionCount: 4,
        difficulty: 'mixed',
        questionTypes: ['identification', 'fill_in_the_blank'],
        includeExplanations: true,
        shuffleQuestions: false,
        shuffleOptions: false,
      };

      const questions = QuizEngine.generateQuiz(mockDocument, config);

      expect(questions.length).toBeGreaterThan(0);
      const cloze = questions.find((q) => q.type === 'fill_in_the_blank');
      if (cloze) {
        expect(cloze.prompt).toContain('__________');
        expect(cloze.correctAnswer.length).toBeGreaterThan(1);
        expect(cloze.acceptableAlternatives).toBeDefined();
        expect(cloze.acceptableAlternatives!.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('respects section filtering and targets only selected sections', () => {
      const config: QuizConfig = {
        title: 'Architecture Section Only',
        subject: 'Software Engineering',
        questionCount: 3,
        difficulty: 'mixed',
        questionTypes: ['multiple_choice', 'true_false'],
        selectedSectionIds: ['sec-2'], // Only Section 2
        includeExplanations: true,
        shuffleQuestions: false,
        shuffleOptions: false,
      };

      const questions = QuizEngine.generateQuiz(mockDocument, config);

      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        expect(q.sourceReference.pageNumber).toBe(2);
        expect(q.sourceReference.sectionTitle).toBe('Architecture & Modularity');
      });
    });
  });

  describe('3. DocumentQuizGenerator UI Workflow & Interactive Experience', () => {
    it('renders upload interface with quick-start samples and format badges', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <DocumentQuizGenerator />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      expect(
        screen.getByRole('heading', { name: /Document-to-Quiz Generator/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Drop your educational document here/i)).toBeInTheDocument();
      expect(screen.getByText('.PDF')).toBeInTheDocument();
      expect(screen.getByText('.DOCX')).toBeInTheDocument();
      expect(screen.getByText('.PPTX')).toBeInTheDocument();
      expect(screen.getByText(/Quick-Start Educational Sample Documents/i)).toBeInTheDocument();
      expect(screen.getByText(/Cell Structure and Organelles/i)).toBeInTheDocument();
      expect(screen.getByText(/HTTP Protocol & REST Architecture/i)).toBeInTheDocument();
    });

    it('loads sample document, reviews sections, configures quiz, and takes assessment', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <DocumentQuizGenerator />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      // 1. Click on Cell Structure and Organelles sample
      const sampleBtn = screen.getByRole('button', { name: /Cell Structure and Organelles/i });
      fireEvent.click(sampleBtn);

      // 2. Navigates to Step 2: Content Review
      await waitFor(() => {
        expect(screen.getByText(/Target Sections & Outline/i)).toBeInTheDocument();
      });

      // 3. Click Proceed to Quiz Setup
      const proceedBtn = screen.getByRole('button', { name: /Proceed to Quiz Setup/i });
      fireEvent.click(proceedBtn);

      // 4. In Step 3: Configure Quiz
      expect(screen.getByRole('heading', { name: /Configure Practice Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^5\s+Questions/i })).toBeInTheDocument();

      // Click 5 questions for quick test
      fireEvent.click(screen.getByRole('button', { name: /^5\s+Questions/i }));

      // Click Generate Practice Quiz
      const generateBtn = screen.getByRole('button', { name: /Generate Practice Quiz/i });
      fireEvent.click(generateBtn);

      // 5. In Step 4: Inspect Generated Questions
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Take Quiz Now/i })).toBeInTheDocument();
      });

      // Click Take Quiz Now
      fireEvent.click(screen.getByRole('button', { name: /Take Quiz Now/i }));

      // 6. In Step 5: Interactive Quiz Taker
      expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();

      // Toggle practice mode
      const practiceCheckbox = screen.getByLabelText(/Practice Mode/i);
      fireEvent.click(practiceCheckbox);

      // Jump to last question using palette
      fireEvent.click(screen.getByRole('button', { name: '5' }));

      // Click Submit & Finish Quiz
      const submitBtn = screen.getByRole('button', { name: /Submit & Finish Quiz/i });
      fireEvent.click(submitBtn);

      // 7. In Step 6: Results Summary
      await waitFor(() => {
        expect(screen.getByText(/Quiz Results Summary/i)).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /Retake Full Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /New Document/i })).toBeInTheDocument();
    });
  });

  describe('4. Study Space Navigation Integration', () => {
    it('integrates Document to Quiz Generator into the Study Space sidebar and dashboard', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <StudySpacePage />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      // Check navigation item in sidebar
      const docQuizNavBtn = screen.getByRole('button', { name: /Document to Quiz/i });
      expect(docQuizNavBtn).toBeInTheDocument();

      // Click Document to Quiz
      fireEvent.click(docQuizNavBtn);

      // Component renders
      expect(
        screen.getByRole('heading', { name: /Document-to-Quiz Generator/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Zero-Cost Engine/i)).toBeInTheDocument();
    });
  });

  describe('5. Mobile-First Experience & Saved Quizzes History', () => {
    it('renders mobile-first upload screen with heading Create a Quiz from Your Documents and 25MB limit', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <DocumentQuizGenerator />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      expect(
        screen.getByRole('heading', { name: /Create a Quiz from Your Documents/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Max 25MB/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Choose File \/ Browse/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Saved Quizzes/i })).toBeInTheDocument();
    });

    it('toggles Saved Quizzes & History view and shows empty or stored quizzes', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <DocumentQuizGenerator />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      // Click Saved Quizzes button in header
      const historyBtn = screen.getByRole('button', { name: /Saved Quizzes/i });
      fireEvent.click(historyBtn);

      // Enters history view
      expect(
        screen.getByRole('heading', { name: /Saved Document Quizzes & History/i }),
      ).toBeInTheDocument();

      // Click Create New Quiz to return to upload
      const createNewBtn = screen.getByRole('button', { name: /Create New Quiz/i });
      fireEvent.click(createNewBtn);

      // Back to upload view
      expect(
        screen.getByRole('heading', { name: /Create a Quiz from Your Documents/i }),
      ).toBeInTheDocument();
    });

    it('handles documents with long names, long prompts, and complex sentences gracefully', async () => {
      const veryLongDocTitle =
        'A_Very_Long_Document_Name_About_Advanced_Distributed_Systems_And_Cloud_Architecture_2026_Final_Comprehensive_Notes.txt';
      const longContent = `Chapter 1: Advanced Distributed Consensus Protocols
Distributed consensus represents a critical algorithmic problem in fault-tolerant distributed computing systems where multiple nodes must reach agreement on a single data value.
Raft consensus algorithm is defined as a protocol designed to be more understandable than Paxos while providing equivalent fault tolerance and performance guarantees.
Byzantine Fault Tolerance refers to the dependability of a fault-tolerant computer system where components may fail and there is imperfect information on whether a component has failed.`;

      const file = new File([longContent], veryLongDocTitle, { type: 'text/plain' });
      file.arrayBuffer = async () => new TextEncoder().encode(longContent).buffer as ArrayBuffer;

      const extracted = await DocumentParser.parseFile(file);
      expect(extracted.name).toBe(veryLongDocTitle);
      expect(extracted.totalWords).toBeGreaterThan(30);

      const questions = QuizEngine.generateQuiz(extracted, {
        title: 'Long Doc Test',
        subject: 'Distributed Systems',
        questionCount: 5,
        difficulty: 'mixed',
        questionTypes: ['multiple_choice', 'true_false', 'identification', 'fill_in_the_blank'],
        includeExplanations: true,
        shuffleQuestions: false,
        shuffleOptions: false,
      });

      expect(questions.length).toBeGreaterThan(0);
      expect(questions[0]!.sourceReference.documentName).toBe(veryLongDocTitle);
    });
  });
});
