import type {
  ExtractedDocument,
  DocumentSection,
  QuizConfig,
  GeneratedQuestion,
  GeneratorQuestionType,
  SourceReference,
} from './types.js';

interface ExtractedFact {
  type: 'definition' | 'function' | 'enumeration' | 'statement';
  subject: string;
  predicate: string;
  fullSentence: string;
  sourceReference: SourceReference;
  difficulty: 'easy' | 'medium' | 'hard';
}

export class QuizEngine {
  /**
   * Generates a practice quiz from the extracted document using rule-based algorithms
   */
  public static generateQuiz(doc: ExtractedDocument, config: QuizConfig): GeneratedQuestion[] {
    const targetSections = this.getTargetSections(doc, config.selectedSectionIds);

    // 1. Mine all facts and candidate sentences across target sections
    const facts = this.mineFacts(doc.name, targetSections);

    // 2. Build global pool of distinct domain terms for realistic distractors
    const termPool = this.collectTermPool(facts, targetSections);

    if (facts.length === 0) {
      throw new Error(
        'Insufficient text or factual content found in the document to generate quiz questions. Please upload a document with explanatory text, definitions, or bullet points.',
      );
    }

    // 3. Generate candidate questions
    const candidateQuestions: GeneratedQuestion[] = [];
    const usedSentences = new Set<string>();

    const types =
      config.questionTypes.length > 0
        ? config.questionTypes
        : ([
            'multiple_choice',
            'true_false',
            'identification',
            'fill_in_the_blank',
          ] as GeneratorQuestionType[]);

    // Distribute question generation across facts
    let typeIndex = 0;
    for (const fact of facts) {
      if (usedSentences.has(fact.fullSentence.toLowerCase())) continue;

      const qType = types[typeIndex % types.length]!;
      typeIndex++;

      const question = this.generateQuestionFromFact(fact, qType, termPool, config);
      if (question) {
        candidateQuestions.push(question);
        usedSentences.add(fact.fullSentence.toLowerCase());
      }

      if (candidateQuestions.length >= config.questionCount * 2) {
        break;
      }
    }

    // 4. Fallback: if we need more questions, try generating other allowed types from facts
    if (candidateQuestions.length < config.questionCount) {
      for (const fact of facts) {
        for (const qType of types) {
          if (candidateQuestions.length >= config.questionCount) break;
          const key = `${fact.fullSentence.toLowerCase()}__${qType}`;
          if (usedSentences.has(key)) continue;

          const question = this.generateQuestionFromFact(fact, qType, termPool, config);
          if (question) {
            candidateQuestions.push(question);
            usedSentences.add(key);
          }
        }
      }
    }

    // 5. Filter by requested difficulty if not 'mixed'
    let finalQuestions = candidateQuestions;
    if (config.difficulty !== 'mixed') {
      const matchingDiff = candidateQuestions.filter((q) => q.difficulty === config.difficulty);
      if (matchingDiff.length >= Math.min(5, config.questionCount)) {
        finalQuestions = matchingDiff;
      }
    }

    // 6. Slice to requested question count
    finalQuestions = finalQuestions.slice(0, config.questionCount);

    // 7. Shuffle questions if requested
    if (config.shuffleQuestions) {
      finalQuestions = this.shuffleArray(finalQuestions);
    }

    // 8. Shuffle answer options if requested
    if (config.shuffleOptions) {
      finalQuestions = finalQuestions.map((q) => {
        if (q.type === 'multiple_choice' && q.options) {
          return {
            ...q,
            options: this.shuffleArray([...q.options]),
          };
        }
        return q;
      });
    }

    return finalQuestions;
  }

  private static getTargetSections(
    doc: ExtractedDocument,
    selectedIds?: string[],
  ): DocumentSection[] {
    if (!selectedIds || selectedIds.length === 0) {
      return doc.sections.filter((s) => s.content.trim().length > 0);
    }
    const filtered = doc.sections.filter((s) => selectedIds.includes(s.id));
    return filtered.length > 0 ? filtered : doc.sections;
  }

  /**
   * Mines definition sentences, function statements, and verifiable claims
   */
  private static mineFacts(docName: string, sections: DocumentSection[]): ExtractedFact[] {
    const facts: ExtractedFact[] = [];

    for (const section of sections) {
      const sentences = this.splitIntoSentences(section.content);

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (this.isBoilerplateOrInvalid(trimmed)) continue;

        const sourceReference: SourceReference = {
          documentName: docName,
          pageNumber: section.pageNumber,
          slideNumber: section.slideNumber,
          sectionTitle: section.title,
          excerpt: trimmed,
        };

        // Pattern 1: Definitions ("X is defined as Y", "X refers to Y", "X is a Y that...")
        const defMatch = trimmed.match(
          /^([A-Z][a-zA-Z0-9\s-]{2,35})\s+(?:is defined as|refers to|means|is the process of|is known as|is described as|is an?)\s+([^.!?]+)/i,
        );
        if (defMatch && defMatch[1] && defMatch[2]) {
          const subject = defMatch[1].trim();
          const predicate = defMatch[2].trim();
          if (this.isValidConcept(subject) && predicate.length > 8) {
            facts.push({
              type: 'definition',
              subject,
              predicate,
              fullSentence: trimmed,
              sourceReference,
              difficulty: 'easy',
            });
            continue;
          }
        }

        // Pattern 2: Term with colon ("Photosynthesis: The process by which...")
        const colonMatch = trimmed.match(/^([A-Z][a-zA-Z0-9\s-]{2,35}):\s+([A-Z][^.!?]+)/);
        if (colonMatch && colonMatch[1] && colonMatch[2]) {
          const subject = colonMatch[1].trim();
          const predicate = colonMatch[2].trim();
          if (this.isValidConcept(subject) && predicate.length > 10) {
            facts.push({
              type: 'definition',
              subject,
              predicate,
              fullSentence: trimmed,
              sourceReference,
              difficulty: 'easy',
            });
            continue;
          }
        }

        // Pattern 3: Functional sentences ("X is used to Y", "X functions to Y", "X enables Y")
        const funcMatch = trimmed.match(
          /^([A-Z][a-zA-Z0-9\s-]{2,35})\s+(?:is responsible for|functions to|is used to|enables|allows|acts as|serves as|helps to|provides)\s+([^.!?]+)/i,
        );
        if (funcMatch && funcMatch[1] && funcMatch[2]) {
          const subject = funcMatch[1].trim();
          const predicate = funcMatch[2].trim();
          if (this.isValidConcept(subject) && predicate.length > 10) {
            facts.push({
              type: 'function',
              subject,
              predicate,
              fullSentence: trimmed,
              sourceReference,
              difficulty: 'medium',
            });
            continue;
          }
        }

        // Pattern 4: Significant statements with quantifiable or structured concepts
        if (trimmed.length > 40 && trimmed.length < 200 && /^[A-Z]/.test(trimmed)) {
          const words = trimmed.split(/\s+/);
          if (words.length >= 8 && words.length <= 35) {
            // Find leading noun phrase or subject
            const subjectMatch = trimmed.match(
              /^([A-Z][a-zA-Z0-9\s-]{2,30})\s+(has|have|contains|includes|consists of|requires|leads to|results in)\s+([^.!?]+)/i,
            );
            if (subjectMatch && subjectMatch[1] && subjectMatch[3]) {
              facts.push({
                type: 'enumeration',
                subject: subjectMatch[1].trim(),
                predicate: subjectMatch[3].trim(),
                fullSentence: trimmed,
                sourceReference,
                difficulty: 'medium',
              });
            } else {
              facts.push({
                type: 'statement',
                subject: words.slice(0, 3).join(' '),
                predicate: words.slice(3).join(' '),
                fullSentence: trimmed,
                sourceReference,
                difficulty: 'hard',
              });
            }
          }
        }
      }
    }

    return facts;
  }

  /**
   * Generates a question of the specified type based on the extracted fact
   */
  private static generateQuestionFromFact(
    fact: ExtractedFact,
    type: GeneratorQuestionType,
    termPool: string[],
    config: QuizConfig,
  ): GeneratedQuestion | null {
    const id = `q-${Math.random().toString(36).substring(2, 9)}`;
    const locationStr = fact.sourceReference.pageNumber
      ? `Page ${fact.sourceReference.pageNumber}`
      : fact.sourceReference.slideNumber
        ? `Slide ${fact.sourceReference.slideNumber}`
        : fact.sourceReference.sectionTitle || 'Document';

    const sourceCite = `Source: ${fact.sourceReference.documentName} (${locationStr}). "${fact.fullSentence}"`;

    switch (type) {
      case 'multiple_choice': {
        const distractors = this.selectDistractors(fact.subject, termPool, 3);
        if (distractors.length < 2) return null; // Ensure plausible options

        const prompt =
          fact.type === 'definition'
            ? `Which concept or term is described as: "${fact.predicate}"?`
            : fact.type === 'function'
              ? `What is the primary function or role of ${fact.subject}?`
              : `According to the document, which statement correctly relates to ${fact.subject}?`;

        let correctAnswer = fact.subject;
        let options: string[] = [correctAnswer, ...distractors];

        // If function question, options can be predicates
        if (fact.type === 'function' && fact.predicate.length < 80) {
          const otherFacts = termPool.filter((t) => t !== fact.subject).slice(0, 3);
          if (otherFacts.length >= 2) {
            correctAnswer = fact.predicate;
            options = [
              fact.predicate,
              `Provides opposite behavior to ${otherFacts[0]}`,
              `Prevents the execution of ${otherFacts[1] || 'primary systems'}`,
              `Functions strictly as an external data store`,
            ];
          }
        }

        return {
          id,
          type: 'multiple_choice',
          prompt,
          options,
          correctAnswer,
          explanation: config.includeExplanations
            ? `${correctAnswer} is correct. ${sourceCite}`
            : '',
          points: 1,
          difficulty: fact.difficulty,
          sourceReference: fact.sourceReference,
        };
      }

      case 'true_false': {
        const isTrue = Math.random() >= 0.5;
        let statement = fact.fullSentence;
        let explanation = '';

        if (isTrue) {
          explanation = `True. According to ${locationStr}: "${fact.fullSentence}"`;
        } else {
          // Create plausible false statement by swapping subject with a distractor
          const distractor = this.selectDistractors(fact.subject, termPool, 1)[0];
          if (distractor && fact.fullSentence.includes(fact.subject)) {
            statement = fact.fullSentence.replace(
              new RegExp(`\\b${this.escapeRegex(fact.subject)}\\b`, 'g'),
              distractor,
            );
            explanation = `False. In fact, ${fact.subject} (not ${distractor}) is responsible. ${sourceCite}`;
          } else {
            // Negate predicate safely
            statement = fact.fullSentence.replace(
              /\b(is|are|enables|allows|functions to|provides)\b/i,
              (m) =>
                m.toLowerCase() === 'is'
                  ? 'is not'
                  : m.toLowerCase() === 'are'
                    ? 'are not'
                    : 'does not ' + m,
            );
            explanation = `False. The document states: "${fact.fullSentence}"`;
          }
        }

        return {
          id,
          type: 'true_false',
          prompt: `True or False: "${statement}"`,
          options: ['True', 'False'],
          correctAnswer: isTrue ? 'True' : 'False',
          explanation: config.includeExplanations ? explanation : '',
          points: 1,
          difficulty: fact.difficulty === 'hard' ? 'medium' : fact.difficulty,
          sourceReference: fact.sourceReference,
        };
      }

      case 'identification': {
        const prompt =
          fact.type === 'definition'
            ? `Identify the concept, term, or definition described: "${fact.predicate}"`
            : `Identify the entity responsible for the following in ${locationStr}: "${fact.predicate}"`;

        const acceptable = [
          fact.subject.toLowerCase(),
          fact.subject.trim(),
          this.removeArticles(fact.subject).toLowerCase(),
        ];

        return {
          id,
          type: 'identification',
          prompt,
          correctAnswer: fact.subject,
          acceptableAlternatives: Array.from(new Set(acceptable)),
          explanation: config.includeExplanations
            ? `The correct answer is "${fact.subject}". ${sourceCite}`
            : '',
          points: 1,
          difficulty: 'medium',
          sourceReference: fact.sourceReference,
        };
      }

      case 'fill_in_the_blank': {
        let sentenceWithBlank = '';
        let targetWord = fact.subject;

        if (fact.fullSentence.includes(fact.subject)) {
          sentenceWithBlank = fact.fullSentence.replace(
            new RegExp(`\\b${this.escapeRegex(fact.subject)}\\b`, 'i'),
            '__________',
          );
        } else {
          // Blank out prominent word
          const words = fact.fullSentence.split(/\s+/);
          const candidate = words.find((w) => w.length > 5 && !this.isCommonStopWord(w));
          if (!candidate) return null;
          targetWord = candidate.replace(/[^a-zA-Z0-9-]/g, '');
          sentenceWithBlank = fact.fullSentence.replace(
            new RegExp(`\\b${this.escapeRegex(targetWord)}\\b`, 'i'),
            '__________',
          );
        }

        const acceptable = [
          targetWord.toLowerCase(),
          targetWord.trim(),
          this.removeArticles(targetWord).toLowerCase(),
        ];

        return {
          id,
          type: 'fill_in_the_blank',
          prompt: `Fill in the blank: "${sentenceWithBlank}"`,
          correctAnswer: targetWord,
          acceptableAlternatives: Array.from(new Set(acceptable)),
          explanation: config.includeExplanations
            ? `The missing term is "${targetWord}". ${sourceCite}`
            : '',
          points: 1,
          difficulty: 'hard',
          sourceReference: fact.sourceReference,
        };
      }

      default:
        return null;
    }
  }

  private static collectTermPool(facts: ExtractedFact[], sections: DocumentSection[]): string[] {
    const pool = new Set<string>();

    for (const fact of facts) {
      if (fact.subject && this.isValidConcept(fact.subject)) {
        pool.add(fact.subject);
      }
    }

    for (const sec of sections) {
      for (const term of sec.detectedTerms) {
        if (this.isValidConcept(term)) {
          pool.add(term);
        }
      }
    }

    // Include academic / structural fallback terms if pool is very small
    if (pool.size < 4) {
      ['Abstraction', 'Modularity', 'Encapsulation', 'Polymorphism', 'Hierarchy'].forEach((t) =>
        pool.add(t),
      );
    }

    return Array.from(pool);
  }

  private static selectDistractors(correctTerm: string, pool: string[], count: number): string[] {
    const filtered = pool.filter((t) => t.toLowerCase() !== correctTerm.toLowerCase());
    const shuffled = this.shuffleArray(filtered);
    return shuffled.slice(0, count);
  }

  private static splitIntoSentences(text: string): string[] {
    return text
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 20);
  }

  private static isBoilerplateOrInvalid(text: string): boolean {
    if (text.length < 25) return true;
    if (text.length > 400) return true;
    const lower = text.toLowerCase();
    if (lower.includes('all rights reserved')) return true;
    if (lower.includes('table of contents')) return true;
    if (lower.includes('copyright') || lower.includes('©')) return true;
    if (lower.startsWith('http://') || lower.startsWith('https://')) return true;
    if (/^page \d+( of \d+)?$/i.test(text)) return true;
    if (/^slide \d+$/i.test(text)) return true;
    return false;
  }

  private static isValidConcept(term: string): boolean {
    if (!term || term.length < 3 || term.length > 35) return false;
    const lower = term.toLowerCase();
    const stopWords = [
      'the',
      'this',
      'that',
      'these',
      'those',
      'there',
      'here',
      'note',
      'figure',
      'table',
    ];
    return !stopWords.includes(lower);
  }

  private static removeArticles(str: string): string {
    return str.replace(/^(the|a|an)\s+/i, '').trim();
  }

  private static isCommonStopWord(word: string): boolean {
    const stops = [
      'about',
      'above',
      'across',
      'after',
      'again',
      'against',
      'almost',
      'along',
      'already',
      'because',
      'before',
      'behind',
      'between',
      'during',
      'further',
      'however',
      'indeed',
      'instead',
      'meanwhile',
      'moreover',
      'nevertheless',
      'perhaps',
      'therefore',
      'without',
    ];
    return stops.includes(word.toLowerCase());
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j] as T;
      copy[j] = temp as T;
    }
    return copy;
  }
}
