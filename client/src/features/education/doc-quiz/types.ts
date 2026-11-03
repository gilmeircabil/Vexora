export type SupportedDocumentType = 'pdf' | 'docx' | 'pptx' | 'txt' | 'md';

export interface DocumentSection {
  id: string;
  title: string;
  pageNumber?: number;
  slideNumber?: number;
  content: string;
  wordCount: number;
  detectedTerms: string[];
}

export interface ExtractedDocument {
  name: string;
  fileType: SupportedDocumentType;
  fileSize: number;
  totalWords: number;
  totalPages?: number;
  totalSlides?: number;
  sections: DocumentSection[];
  rawText: string;
  isScanned?: boolean;
  warnings?: string[];
}

export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export type GeneratorQuestionType =
  'multiple_choice' | 'true_false' | 'identification' | 'fill_in_the_blank';

export interface QuizConfig {
  title: string;
  subject: string;
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: GeneratorQuestionType[];
  selectedSectionIds?: string[];
  includeExplanations: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface SourceReference {
  documentName: string;
  pageNumber?: number;
  slideNumber?: number;
  sectionTitle?: string;
  excerpt: string;
}

export interface GeneratedQuestion {
  id: string;
  type: GeneratorQuestionType;
  prompt: string;
  options?: string[]; // for multiple choice
  correctAnswer: string;
  acceptableAlternatives?: string[]; // for identification and fill-in-the-blank
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  sourceReference: SourceReference;
}

export interface QuizResultAttempt {
  id: string;
  quizTitle: string;
  documentName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  answers: {
    questionId: string;
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    sourceReference: SourceReference;
  }[];
}
