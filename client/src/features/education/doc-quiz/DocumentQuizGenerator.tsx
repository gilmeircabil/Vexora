import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  ChevronRight,
  Check,
  AlertTriangle,
  FileQuestion,
  Download,
  BookmarkPlus,
  Eye,
  Sliders,
  Award,
  History,
  Trash2,
  Play,
  ArrowLeft,
} from 'lucide-react';
import { DocumentParser } from './documentParser.js';
import { QuizEngine } from './quizEngine.js';
import type {
  ExtractedDocument,
  QuizConfig,
  GeneratedQuestion,
  GeneratorQuestionType,
  QuizDifficulty,
  QuizResultAttempt,
} from './types.js';
import { useAuth } from '../../../context/AuthContext.js';
import { useToast } from '../../../context/ToastContext.js';
import { educationApi } from '../../../services/educationApi.js';

interface DocumentQuizGeneratorProps {
  onBackToQuizzes?: () => void;
}

// Built-in verified sample educational documents for 1-click testing
const SAMPLE_DOCS = [
  {
    name: 'Biology_Cell_Biology_Notes.txt',
    title: 'Cell Structure and Organelles',
    subject: 'Biology',
    content: `# Cell Structure and Organelles

The cell is defined as the basic structural and functional unit of all living organisms.

Mitochondria are known as the powerhouse of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP). The inner membrane of mitochondria contains folds called cristae that expand the surface area for chemical reactions.

Ribosomes are responsible for protein synthesis by translating messenger RNA (mRNA) into polypeptide chains. Ribosomes can float freely in the cytoplasm or bind to the endoplasmic reticulum.

The nucleus is described as the repository of genetic information that coordinates cell activities such as growth, metabolism, and division. Within the nucleus, the nucleolus functions to produce and assemble ribosome components.

The cell membrane acts as a selective barrier that regulates the entry and exit of ions and organic molecules. It consists of a phospholipid bilayer with embedded transport proteins.

Endoplasmic Reticulum (ER) consists of two continuous sub-compartments: rough ER, which is studded with ribosomes for protein folding, and smooth ER, which is responsible for lipid synthesis and detoxification.

The Golgi apparatus functions to modify, sort, and package proteins for secretion or delivery to other organelles.

Chloroplasts are specialized organelles found in plant cells that conduct photosynthesis, absorbing sunlight to produce glucose and oxygen.`,
  },
  {
    name: 'Computer_Science_HTTP_Networking.md',
    title: 'HTTP Protocol & REST Architecture',
    subject: 'Computer Science',
    content: `# HTTP Protocol & Web Networking

HTTP refers to the Hypertext Transfer Protocol, an application-layer protocol for transmitting hypermedia documents.

HTTP is defined as a stateless request-response protocol where each transaction is treated independently by the server.

A Uniform Resource Identifier (URI) is used to identify a specific abstract or physical resource on the internet.

DNS is responsible for translating human-readable domain names into numerical IP addresses. Without DNS, users would have to memorize numerical addresses like 192.0.2.1.

HTTPS is known as HTTP Secure, which encrypts communications using Transport Layer Security (TLS) to protect confidentiality and integrity.

The GET method is used to retrieve data from a specified resource without altering server state.

The POST method is responsible for submitting data to be processed by a specified resource, often resulting in creation of a new database entry.

Status code 200 means OK and indicates that the client request has succeeded. Status code 404 indicates that the requested resource could not be found on the server. Status code 500 represents an internal server error.

REST refers to Representational State Transfer, an architectural style that relies on stateless communication and standard HTTP methods.`,
  },
  {
    name: 'History_Industrial_Revolution.txt',
    title: 'The Industrial Revolution in Britain',
    subject: 'World History',
    content: `# The Industrial Revolution

The Industrial Revolution is defined as the transition from agrarian, handicraft economies to machine-driven industrial production that began in Great Britain during the late 18th century.

The steam engine was invented by Thomas Newcomen and substantially improved by James Watt to provide continuous mechanical power independent of watermills.

The spinning jenny was invented by James Hargreaves in 1764, enabling a worker to spin multiple spools of thread simultaneously.

Coal was the primary fuel source that powered iron smelting furnaces and locomotives across Britain.

Urbanization refers to the mass migration of populations from rural farming communities to rapidly growing industrial cities such as Manchester and Birmingham.

The factory system represents a method of manufacturing where workers gather in a central facility to operate powered machinery under strict supervision.

The textile industry was the leading sector of the British Industrial Revolution, driving rapid export growth and technological innovation.`,
  },
];

interface SavedQuizHistoryItem {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  sourceDocument?: string;
  questionCount: number;
  createdAt: string;
  questions?: any[];
  lastAttempt?: {
    score: number;
    totalPoints: number;
    percentage: number;
    completedAt: string;
  };
}

export const DocumentQuizGenerator: React.FC<DocumentQuizGeneratorProps> = ({
  onBackToQuizzes,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Workflow state: 'upload' | 'review' | 'configure' | 'inspect' | 'take' | 'results' | 'history'
  const [step, setStep] = useState<
    'upload' | 'review' | 'configure' | 'inspect' | 'take' | 'results' | 'history'
  >('upload');
  const [previousStepBeforeHistory, setPreviousStepBeforeHistory] = useState<
    'upload' | 'review' | 'configure' | 'inspect' | 'take' | 'results'
  >('upload');

  // File & parsing state
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [extractedDoc, setExtractedDoc] = useState<ExtractedDocument | null>(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quiz config state
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    title: '',
    subject: '',
    questionCount: 10,
    difficulty: 'mixed',
    questionTypes: ['multiple_choice', 'true_false', 'identification', 'fill_in_the_blank'],
    includeExplanations: true,
    shuffleQuestions: true,
    shuffleOptions: true,
  });

  // Generated questions
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Active quiz taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);

  // Results state
  const [attemptResult, setAttemptResult] = useState<QuizResultAttempt | null>(null);
  const [showEvidenceId, setShowEvidenceId] = useState<string | null>(null);
  const [resultsFilter, setResultsFilter] = useState<'all' | 'incorrect'>('all');

  // History state
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuizHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deleteConfirmQuizId, setDeleteConfirmQuizId] = useState<string | null>(null);

  // Timer during taking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'take') {
      interval = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Load Saved Quizzes and History
  const loadHistoryData = async () => {
    setIsLoadingHistory(true);
    try {
      let items: SavedQuizHistoryItem[] = [];

      // Load cloud quizzes if authenticated
      if (user) {
        try {
          const [quizzesRes, attemptsRes] = await Promise.all([
            educationApi.getQuizzes('my'),
            educationApi.getQuizAttempts(),
          ]);

          const attemptsList: any[] =
            attemptsRes?.success && Array.isArray(attemptsRes.data) ? attemptsRes.data : [];

          if (quizzesRes?.success && Array.isArray(quizzesRes.data)) {
            items = quizzesRes.data.map((q: any) => {
              const matchingAttempts = attemptsList.filter(
                (a: any) => a.quizId === q._id || a.quizTitle === q.title,
              );
              const latestAttempt = matchingAttempts.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
              )[0];

              return {
                _id: q._id,
                title: q.title,
                subject: q.subject,
                description: q.description,
                sourceDocument: q.sourceDocument,
                questionCount: q.questions?.length || 0,
                createdAt: q.createdAt,
                questions: q.questions,
                lastAttempt: latestAttempt
                  ? {
                      score: latestAttempt.score,
                      totalPoints: latestAttempt.totalPoints,
                      percentage: latestAttempt.percentage,
                      completedAt: latestAttempt.createdAt,
                    }
                  : undefined,
              };
            });
          }
        } catch (err) {
          console.warn('Could not fetch cloud quiz history:', err);
        }
      }

      // Load local guest quizzes
      const guestKey = 'vexoramods_guest_saved_quizzes';
      const guestStored = JSON.parse(localStorage.getItem(guestKey) || '[]');
      if (Array.isArray(guestStored)) {
        const guestItems: SavedQuizHistoryItem[] = guestStored.map((g: any) => ({
          _id: g._id,
          title: g.title,
          subject: g.subject,
          description: g.description,
          sourceDocument: g.sourceDocument,
          questionCount: g.questions?.length || 0,
          createdAt: g.createdAt,
          questions: g.questions,
        }));
        // Merge guest items avoiding duplicates
        const existingIds = new Set(items.map((i) => i._id));
        guestItems.forEach((gi) => {
          if (!existingIds.has(gi._id)) items.push(gi);
        });
      }

      setSavedQuizzes(items);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, [user]);

  // Handle uploaded file
  const handleFileUpload = async (file: File) => {
    setParseError(null);
    setIsParsing(true);
    try {
      const parsed = await DocumentParser.parseFile(file);
      setExtractedDoc(parsed);
      setSelectedSectionIds(parsed.sections.map((s) => s.id));

      // Derive initial title and subject
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setQuizConfig((prev) => ({
        ...prev,
        title: `${cleanName} Practice Quiz`,
        subject: 'General Study',
        questionCount: Math.min(10, Math.max(5, Math.floor(parsed.totalWords / 25))),
      }));

      setStep('review');
      showToast(`Successfully extracted ${parsed.totalWords} words from ${parsed.name}`, 'success');
    } catch (err: any) {
      setParseError(err.message || 'Failed to process document');
      showToast(err.message || 'Document extraction failed', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  // Load verified educational sample
  const handleLoadSample = (sample: (typeof SAMPLE_DOCS)[0]) => {
    const blob = new Blob([sample.content], { type: 'text/plain' });
    const file = new File([blob], sample.name, { type: 'text/plain' });
    handleFileUpload(file);
    setQuizConfig((prev) => ({
      ...prev,
      title: sample.title,
      subject: sample.subject,
      questionCount: 8,
    }));
  };

  // Run Question Generation Engine
  const handleGenerateQuiz = () => {
    if (!extractedDoc) return;
    setIsGenerating(true);
    try {
      const questions = QuizEngine.generateQuiz(extractedDoc, {
        ...quizConfig,
        selectedSectionIds,
      });

      if (questions.length === 0) {
        showToast(
          'Could not find enough structured statements. Try selecting more sections or reducing question count.',
          'error',
        );
        return;
      }

      setGeneratedQuestions(questions);
      setStep('inspect');
      showToast(
        `Generated ${questions.length} practice questions with source citations!`,
        'success',
      );
    } catch (err: any) {
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Start taking the quiz
  const handleStartTaking = (questionsToTake?: GeneratedQuestion[]) => {
    const list = questionsToTake || generatedQuestions;
    if (list.length === 0) return;
    setGeneratedQuestions(list);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeSpentSeconds(0);
    setIsConfirmingSubmit(false);
    setStep('take');
  };

  // Resume or take a quiz from saved history
  const handleTakeSavedQuiz = (item: SavedQuizHistoryItem) => {
    if (!item.questions || item.questions.length === 0) {
      showToast('This saved quiz does not contain any questions.', 'error');
      return;
    }

    const converted: GeneratedQuestion[] = item.questions.map((q: any, idx: number) => ({
      id: q.id || `saved-q-${idx}`,
      type: q.type || 'multiple_choice',
      prompt: q.prompt,
      options: q.options || ['True', 'False'],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || 'Verified from saved document source.',
      points: q.points || 1,
      difficulty: 'medium',
      sourceReference: q.sourceReference || {
        documentName: item.sourceDocument || item.title,
        sectionTitle: 'Saved Section',
        excerpt: q.explanation || q.prompt,
      },
    }));

    setQuizConfig((prev) => ({
      ...prev,
      title: item.title,
      subject: item.subject,
      questionCount: converted.length,
    }));

    setGeneratedQuestions(converted);
    handleStartTaking(converted);
  };

  // Delete saved quiz
  const handleDeleteSavedQuiz = async (quizId: string) => {
    try {
      if (user) {
        try {
          await educationApi.deleteQuiz(quizId);
        } catch {
          // ignore
        }
      }

      // Also clean from localStorage
      const guestKey = 'vexoramods_guest_saved_quizzes';
      const existing = JSON.parse(localStorage.getItem(guestKey) || '[]');
      const filtered = existing.filter((g: any) => g._id !== quizId);
      localStorage.setItem(guestKey, JSON.stringify(filtered));

      setSavedQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      setDeleteConfirmQuizId(null);
      showToast('Saved quiz removed.', 'info');
    } catch {
      showToast('Could not delete quiz.', 'error');
    }
  };

  // Submit and grade quiz
  const handleSubmitQuiz = async () => {
    setIsConfirmingSubmit(false);
    let score = 0;
    const answersBreakdown = generatedQuestions.map((q) => {
      const userAns = (userAnswers[q.id] || '').trim();
      let isCorrect = false;

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        isCorrect = userAns.toLowerCase() === q.correctAnswer.toLowerCase();
      } else {
        // Identification or fill in the blank
        const cleanUser = userAns.toLowerCase();
        const cleanCorrect = q.correctAnswer.toLowerCase();
        const alternatives = (q.acceptableAlternatives || []).map((a) => a.toLowerCase());
        isCorrect = cleanUser === cleanCorrect || alternatives.includes(cleanUser);
      }

      if (isCorrect) score += q.points;

      return {
        questionId: q.id,
        prompt: q.prompt,
        userAnswer: userAns || '(No Answer)',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        sourceReference: q.sourceReference,
      };
    });

    const totalPoints = generatedQuestions.reduce((acc, q) => acc + q.points, 0);
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    const attempt: QuizResultAttempt = {
      id: `attempt-${Date.now()}`,
      quizTitle: quizConfig.title,
      documentName: extractedDoc?.name || 'Document',
      score,
      totalPoints,
      percentage,
      timeSpentSeconds,
      completedAt: new Date().toISOString(),
      answers: answersBreakdown,
    };

    setAttemptResult(attempt);
    setStep('results');
    showToast(`Quiz completed! Score: ${score}/${totalPoints} (${percentage}%)`, 'success');

    // If authenticated, persist attempt to backend
    if (user) {
      try {
        const quizRes = await educationApi.createQuiz({
          title: quizConfig.title,
          subject: quizConfig.subject,
          description: `Auto-generated from document: ${extractedDoc?.name}`,
          sourceDocument: extractedDoc?.name,
          durationMinutes: 0,
          isPublic: false,
          questions: generatedQuestions.map((q) => ({
            id: q.id,
            type: q.type === 'multiple_choice' || q.type === 'true_false' ? q.type : 'short_answer',
            prompt: q.prompt,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points,
            sourceReference: q.sourceReference,
          })),
        });

        if (quizRes?.success && quizRes.data?._id) {
          await educationApi.recordQuizAttempt(quizRes.data._id, {
            score,
            totalPoints,
            percentage,
            timeSpentSeconds,
            answers: answersBreakdown.map((a) => ({
              questionId: a.questionId,
              questionText: a.prompt,
              userAnswer: a.userAnswer,
              correctAnswer: a.correctAnswer,
              isCorrect: a.isCorrect,
              explanation: a.explanation,
              pointsEarned: a.isCorrect ? 1 : 0,
            })),
          });
          loadHistoryData();
        }
      } catch (err) {
        console.warn('Could not auto-save to cloud:', err);
      }
    }
  };

  // Save generated quiz to Study Space
  const handleSaveToStudySpace = async () => {
    if (!user) {
      // Guest localStorage save
      const guestKey = 'vexoramods_guest_saved_quizzes';
      const existing = JSON.parse(localStorage.getItem(guestKey) || '[]');
      const newEntry = {
        _id: `guest-${Date.now()}`,
        title: quizConfig.title,
        subject: quizConfig.subject,
        description: `Generated from ${extractedDoc?.name || 'Uploaded Document'}`,
        sourceDocument: extractedDoc?.name,
        questions: generatedQuestions,
        createdAt: new Date().toISOString(),
      };
      existing.unshift(newEntry);
      localStorage.setItem(guestKey, JSON.stringify(existing.slice(0, 30)));
      loadHistoryData();
      showToast('Quiz saved locally to your browser storage!', 'success');
      return;
    }

    setSavingQuiz(true);
    try {
      const res = await educationApi.createQuiz({
        title: quizConfig.title,
        subject: quizConfig.subject,
        description: `Generated from document: ${extractedDoc?.name}`,
        sourceDocument: extractedDoc?.name,
        durationMinutes: 0,
        isPublic: false,
        questions: generatedQuestions.map((q) => ({
          id: q.id,
          type: q.type === 'multiple_choice' || q.type === 'true_false' ? q.type : 'short_answer',
          prompt: q.prompt,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
          sourceReference: q.sourceReference,
        })),
      });

      if (res.success) {
        showToast('Practice quiz saved to your Study Space account!', 'success');
        loadHistoryData();
      } else {
        showToast(res.error || 'Failed to save quiz', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setSavingQuiz(false);
    }
  };

  // Export Quiz as JSON
  const handleExportJson = () => {
    const data = {
      title: quizConfig.title,
      subject: quizConfig.subject,
      sourceDocument: extractedDoc?.name,
      exportedAt: new Date().toISOString(),
      questions: generatedQuestions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quizConfig.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_quiz.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Quiz exported as JSON', 'info');
  };

  // Practice only incorrect questions
  const handleRetakeIncorrect = () => {
    if (!attemptResult) return;
    const incorrectIds = attemptResult.answers.filter((a) => !a.isCorrect).map((a) => a.questionId);
    const incorrectQuestions = generatedQuestions.filter((q) => incorrectIds.includes(q.id));
    if (incorrectQuestions.length === 0) {
      showToast('You scored 100%! Retaking full quiz instead.', 'success');
      handleStartTaking(generatedQuestions);
      return;
    }
    handleStartTaking(incorrectQuestions);
  };

  // Open / Close History view
  const toggleHistoryView = () => {
    if (step === 'history') {
      setStep(previousStepBeforeHistory);
    } else {
      setPreviousStepBeforeHistory(step);
      setStep('history');
    }
  };

  // Active step index calculation for progress indicator
  const currentStepNumber =
    step === 'upload'
      ? 1
      : step === 'review'
        ? 2
        : step === 'configure'
          ? 3
          : step === 'inspect' || step === 'take' || step === 'results'
            ? 4
            : 1;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Editorial Header - Fully Responsive */}
      <div className="bg-white rounded-2xl border-2 border-black p-4 sm:p-5 shadow-[3px_3px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#FFD21A] border border-black flex items-center justify-center shrink-0">
              <FileQuestion className="w-4 h-4 text-black" />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-black tracking-tight truncate">
              Document-to-Quiz Generator
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#4ADE80] border border-black shrink-0">
              Zero-Cost Engine
            </span>
          </div>
          <p className="text-xs text-neutral-600 font-medium line-clamp-2 sm:line-clamp-none">
            Upload PDF, Word, PowerPoint, or text notes to automatically generate practice tests
            with verified source evidence.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-black/10">
          <button
            type="button"
            onClick={toggleHistoryView}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              step === 'history'
                ? 'bg-[#FFD21A] text-black shadow-[2px_2px_0px_#000000]'
                : 'bg-white text-neutral-800 hover:bg-neutral-100 shadow-[1.5px_1.5px_0px_#000000]'
            }`}
          >
            <History className="w-3.5 h-3.5 text-black" />
            <span>Saved Quizzes</span>
            {savedQuizzes.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black text-white font-bold">
                {savedQuizzes.length}
              </span>
            )}
          </button>

          {onBackToQuizzes && (
            <button
              type="button"
              onClick={onBackToQuizzes}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 text-xs font-black text-neutral-800 flex items-center gap-1 cursor-pointer shadow-[1.5px_1.5px_0px_#000000]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive Step Ribbon */}
      {step !== 'take' && step !== 'results' && step !== 'history' && (
        <>
          {/* Mobile Step Compact Header (< 640px) */}
          <div className="sm:hidden bg-white rounded-xl border-2 border-black p-3 shadow-[2px_2px_0px_#000000] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#FFD21A] border border-black flex items-center justify-center font-mono font-black text-xs text-black">
                {currentStepNumber}
              </span>
              <span className="text-xs font-black text-black">
                {currentStepNumber === 1 && 'Step 1: Upload Document'}
                {currentStepNumber === 2 && 'Step 2: Review Content'}
                {currentStepNumber === 3 && 'Step 3: Quiz Settings'}
                {currentStepNumber === 4 && 'Step 4: Questions & Practice'}
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold text-neutral-500">
              {currentStepNumber} of 4
            </div>
          </div>

          {/* Desktop Step Ribbon (>= 640px) */}
          <div className="hidden sm:grid grid-cols-4 gap-2">
            {[
              { id: 'upload', label: '1. Upload Document', icon: Upload },
              { id: 'review', label: '2. Review Content', icon: BookOpen },
              { id: 'configure', label: '3. Quiz Settings', icon: Sliders },
              { id: 'inspect', label: '4. Questions & Practice', icon: Award },
            ].map((s) => {
              const isCurrent = step === s.id;
              const isDone =
                (s.id === 'upload' && step !== 'upload') ||
                (s.id === 'review' && (step === 'configure' || step === 'inspect')) ||
                (s.id === 'configure' && step === 'inspect');

              return (
                <div
                  key={s.id}
                  className={`p-2.5 rounded-xl border-2 border-black flex items-center gap-2 text-xs font-black transition-all ${
                    isCurrent
                      ? 'bg-[#FFD21A] shadow-[2px_2px_0px_#000000]'
                      : isDone
                        ? 'bg-neutral-100 text-neutral-800'
                        : 'bg-white text-neutral-400'
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW: SAVED QUIZZES & ATTEMPT HISTORY */}
      {/* ========================================================================= */}
      {step === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-black p-4 sm:p-6 shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black">
                Saved Document Quizzes & History
              </h2>
              <p className="text-xs text-neutral-600 font-medium">
                Access your previously generated tests, review your best attempts, or retake them
                anytime.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep('upload')}
              className="min-h-[44px] px-4 py-2 bg-[#FFD21A] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Create New Quiz</span>
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="p-8 text-center bg-white rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000000]">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-neutral-600">Loading saved quizzes...</p>
            </div>
          ) : savedQuizzes.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 border-2 border-black flex items-center justify-center mx-auto text-neutral-500">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-black">No saved document quizzes yet</h3>
              <p className="text-xs text-neutral-600 max-w-md mx-auto font-medium">
                Upload your study materials (PDF, Word, PPTX, or text notes) to automatically
                generate your first practice test.
              </p>
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="min-h-[44px] px-6 py-2.5 bg-[#FFD21A] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] cursor-pointer"
              >
                Upload Document Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white rounded-2xl border-2 border-black p-4 sm:p-5 shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-neutral-100 border border-black/30 font-mono">
                        {quiz.subject || 'General'}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-500">
                        {quiz.questionCount} Questions
                      </span>
                      {quiz.lastAttempt && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#4ADE80] border border-black text-black">
                          Score: {quiz.lastAttempt.percentage}%
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-black truncate break-words">
                      {quiz.title}
                    </h3>

                    <p className="text-xs text-neutral-600 flex items-center gap-1.5 flex-wrap font-medium">
                      <span>Source: {quiz.sourceDocument || 'Document Upload'}</span>
                      <span className="text-neutral-300">•</span>
                      <span className="font-mono text-[11px]">
                        {new Date(quiz.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10 justify-end shrink-0">
                    {deleteConfirmQuizId === quiz._id ? (
                      <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-500">
                        <span className="text-[10px] font-black text-red-700 px-1">Delete?</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedQuiz(quiz._id)}
                          className="px-2 py-1 bg-red-600 text-white font-black text-[10px] rounded-lg"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmQuizId(null)}
                          className="px-2 py-1 bg-white text-black font-bold text-[10px] rounded-lg border border-black"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmQuizId(quiz._id)}
                        className="min-h-[40px] min-w-[40px] p-2 bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-700 rounded-xl border-2 border-black flex items-center justify-center cursor-pointer transition-all"
                        aria-label={`Delete ${quiz.title}`}
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleTakeSavedQuiz(quiz)}
                      className="min-h-[40px] px-4 py-2 bg-[#4ADE80] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-y-[-1px] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Take Quiz</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: UPLOAD DOCUMENT */}
      {/* ========================================================================= */}
      {step === 'upload' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Dropzone Card - Mobile First */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="bg-white rounded-2xl border-2 border-dashed border-black p-5 sm:p-10 text-center shadow-[4px_4px_0px_#000000] hover:border-solid hover:bg-amber-50/20 transition-all space-y-4"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-[#38BDF8] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000000]">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-black" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-xl font-black text-black">
                Create a Quiz from Your Documents
              </h2>
              <p className="text-xs text-neutral-600 font-medium max-w-md mx-auto leading-relaxed">
                Drop your educational document here or tap choose file. Supports PDF (.pdf), Word
                (.docx), PowerPoint (.pptx), Plain Text (.txt), and Markdown (.md) up to 25MB.
              </p>
            </div>

            {/* Supported Format Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1">
              {['.PDF', '.DOCX', '.PPTX', '.TXT', '.MD'].map((ext) => (
                <span
                  key={ext}
                  className="px-2 sm:px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-black text-[10px] sm:text-[11px] font-black text-black font-mono shadow-[1px_1px_0px_#000000]"
                >
                  {ext}
                </span>
              ))}
              <span className="text-[10px] font-mono font-bold text-neutral-500 self-center pl-1">
                Max 25MB
              </span>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {/* Primary Action Button - Touch Target >= 48px */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isParsing}
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3 bg-[#FFD21A] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 stroke-[2.5]" />
                <span>{isParsing ? 'Extracting Content...' : 'Choose File / Browse'}</span>
              </button>
            </div>

            {isParsing && (
              <div className="max-w-xs mx-auto space-y-2 pt-3">
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden border border-black">
                  <div className="bg-[#38BDF8] h-full animate-pulse w-3/4" />
                </div>
                <p className="text-[11px] font-bold text-neutral-600">
                  Parsing structure, slides, and sentences...
                </p>
              </div>
            )}

            {parseError && (
              <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2 justify-center max-w-md mx-auto text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="break-words">{parseError}</span>
              </div>
            )}
          </div>

          {/* Quick-Start Sample Documents */}
          <div className="bg-white rounded-2xl border-2 border-black p-4 sm:p-5 shadow-[3px_3px_0px_#000000] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-black/10">
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                Quick-Start Educational Sample Documents
              </h3>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              Don't have a document on hand? Tap any sample below to test the zero-cost extraction
              engine instantly:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {SAMPLE_DOCS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="min-h-[54px] p-3 rounded-xl border-2 border-black bg-[#FAF7F2] hover:bg-[#FFD21A]/30 text-left transition-all shadow-[2px_2px_0px_#000000] group cursor-pointer space-y-1 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-neutral-500 font-mono">
                      {sample.subject}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400">Sample</span>
                  </div>
                  <h4 className="text-xs font-black text-black group-hover:underline line-clamp-1">
                    {sample.title}
                  </h4>
                  <p className="text-[11px] text-neutral-600 truncate font-mono">{sample.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: REVIEW EXTRACTED CONTENT */}
      {/* ========================================================================= */}
      {step === 'review' && extractedDoc && (
        <div className="space-y-4 sm:space-y-6">
          {/* Document Summary Ribbon - Responsive Grid */}
          <div className="bg-white rounded-2xl border-2 border-black p-4 shadow-[3px_3px_0px_#000000] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x-2 sm:divide-black/10">
            <div className="pr-2 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                Document
              </span>
              <span
                className="text-xs sm:text-sm font-black text-black truncate block"
                title={extractedDoc.name}
              >
                {extractedDoc.name}
              </span>
              <span className="text-[10px] font-mono text-neutral-600 uppercase">
                {extractedDoc.fileType} • {(extractedDoc.fileSize / 1024).toFixed(1)} KB
              </span>
            </div>

            <div className="sm:px-4 pt-2 sm:pt-0">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                Total Words
              </span>
              <span className="text-lg sm:text-xl font-black text-black">
                {extractedDoc.totalWords}
              </span>
              <span className="text-[10px] text-neutral-600 font-bold block">Extracted body</span>
            </div>

            <div className="sm:px-4 pt-2 sm:pt-0">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                Structure
              </span>
              <span className="text-lg sm:text-xl font-black text-black">
                {extractedDoc.totalPages
                  ? `${extractedDoc.totalPages} Pages`
                  : extractedDoc.totalSlides
                    ? `${extractedDoc.totalSlides} Slides`
                    : `${extractedDoc.sections.length} Sections`}
              </span>
              <span className="text-[10px] text-neutral-600 font-bold block">Segments</span>
            </div>

            <div className="col-span-2 sm:col-span-1 sm:pl-4 pt-2 sm:pt-0 flex flex-col justify-center">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="w-full min-h-[44px] py-2 px-3 bg-[#FFD21A] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-y-[-1px] transition-all cursor-pointer text-center flex items-center justify-center gap-1"
              >
                <span>Configure Quiz</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scanned Document Warning */}
          {extractedDoc.warnings && extractedDoc.warnings.length > 0 && (
            <div className="p-3.5 sm:p-4 bg-amber-50 border-2 border-amber-500 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-900">Document Processing Notice</h4>
                {extractedDoc.warnings.map((w, i) => (
                  <p key={i} className="text-xs font-semibold text-amber-800">
                    {w}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Section Selection Checklist */}
          <div className="bg-white rounded-2xl border-2 border-black p-4 sm:p-5 shadow-[3px_3px_0px_#000000] space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-black">
                  Target Sections & Outline ({selectedSectionIds.length} of{' '}
                  {extractedDoc.sections.length} Selected)
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Select which chapters, pages, or slides to include in your practice questions.
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedSectionIds(extractedDoc.sections.map((s) => s.id))}
                  className="min-h-[36px] text-xs font-black text-black hover:underline px-2 py-1"
                >
                  Select All
                </button>
                <span className="text-neutral-300">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedSectionIds([])}
                  className="min-h-[36px] text-xs font-black text-neutral-600 hover:underline px-2 py-1"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {extractedDoc.sections.map((sec) => {
                const isChecked = selectedSectionIds.includes(sec.id);
                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      setSelectedSectionIds((prev) =>
                        isChecked ? prev.filter((id) => id !== sec.id) : [...prev, sec.id],
                      );
                    }}
                    className={`p-3 rounded-xl border-2 border-black flex items-start justify-between gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-white shadow-[2px_2px_0px_#000000]'
                        : 'bg-neutral-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-black truncate">{sec.title}</h4>
                        <p className="text-[11px] text-neutral-600 line-clamp-1">{sec.content}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-neutral-500 block">
                        {sec.wordCount} words
                      </span>
                      {sec.detectedTerms.length > 0 && (
                        <span className="text-[9px] font-bold text-neutral-700 bg-neutral-200 px-1.5 py-0.5 rounded">
                          {sec.detectedTerms.length} terms
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Row - Mobile Friendly */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="min-h-[44px] px-4 py-2 border-2 border-black rounded-xl text-xs font-black bg-white hover:bg-neutral-100 cursor-pointer text-center"
            >
              ← Upload Different File
            </button>

            <button
              type="button"
              disabled={selectedSectionIds.length === 0}
              onClick={() => setStep('configure')}
              className="min-h-[48px] px-6 py-2.5 bg-[#FFD21A] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50 text-center"
            >
              Proceed to Quiz Setup →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: CONFIGURE QUIZ */}
      {/* ========================================================================= */}
      {step === 'configure' && extractedDoc && (
        <div className="bg-white rounded-2xl border-2 border-black p-4 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-5 sm:space-y-6">
          <div className="pb-3 border-b-2 border-black/10">
            <h2 className="text-base sm:text-xl font-black text-black">Configure Practice Quiz</h2>
            <p className="text-xs text-neutral-600 font-medium">
              Choose your desired question count, difficulty, and question formats.
            </p>
          </div>

          {/* Title & Subject (Single col on mobile, 2 cols on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-black">Quiz Title</label>
              <input
                type="text"
                value={quizConfig.title}
                onChange={(e) => setQuizConfig({ ...quizConfig, title: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 border-2 border-black rounded-xl text-xs font-bold bg-[#FAF7F2] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-black">Subject / Course</label>
              <input
                type="text"
                value={quizConfig.subject}
                onChange={(e) => setQuizConfig({ ...quizConfig, subject: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 border-2 border-black rounded-xl text-xs font-bold bg-[#FAF7F2] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Question Count Selector - Touch friendly pills */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black">Number of Questions</label>
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
              {[5, 10, 15, 20, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuizConfig({ ...quizConfig, questionCount: num })}
                  className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer text-center ${
                    quizConfig.questionCount === num
                      ? 'bg-[#FFD21A] shadow-[2px_2px_0px_#000000]'
                      : 'bg-[#FAF7F2] text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector - 2x2 grid on mobile, 4-col on desktop */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black">Difficulty Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'easy', label: 'Easy', desc: 'Definitions & terms' },
                { id: 'medium', label: 'Medium', desc: 'Core concepts' },
                { id: 'hard', label: 'Hard', desc: 'In-depth analysis' },
                { id: 'mixed', label: 'Mixed', desc: 'Balanced set' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() =>
                    setQuizConfig({ ...quizConfig, difficulty: diff.id as QuizDifficulty })
                  }
                  className={`min-h-[52px] p-2.5 rounded-xl border-2 border-black text-left transition-all cursor-pointer ${
                    quizConfig.difficulty === diff.id
                      ? 'bg-[#38BDF8] shadow-[2px_2px_0px_#000000]'
                      : 'bg-[#FAF7F2] hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-xs font-black text-black block">{diff.label}</span>
                  <span className="text-[10px] text-neutral-600 block line-clamp-1">
                    {diff.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Question Types Toggles - Single col mobile, 2 col desktop */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-black">Question Formats</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'multiple_choice',
                  title: 'Multiple Choice',
                  desc: '4 options with 1 verified answer',
                },
                {
                  id: 'true_false',
                  title: 'True or False',
                  desc: 'Verifiable statements backed by evidence',
                },
                {
                  id: 'identification',
                  title: 'Identification',
                  desc: 'Name concept based on definition',
                },
                {
                  id: 'fill_in_the_blank',
                  title: 'Fill in the Blank',
                  desc: 'Complete sentence with missing term',
                },
              ].map((qt) => {
                const isSelected = quizConfig.questionTypes.includes(
                  qt.id as GeneratorQuestionType,
                );
                return (
                  <div
                    key={qt.id}
                    onClick={() => {
                      const next = isSelected
                        ? quizConfig.questionTypes.filter((t) => t !== qt.id)
                        : [...quizConfig.questionTypes, qt.id as GeneratorQuestionType];
                      if (next.length > 0) {
                        setQuizConfig({ ...quizConfig, questionTypes: next });
                      }
                    }}
                    className={`min-h-[50px] p-3 rounded-xl border-2 border-black flex items-start gap-2.5 cursor-pointer transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'bg-white shadow-[2px_2px_0px_#000000]'
                        : 'bg-neutral-50 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-black">{qt.title}</h4>
                      <p className="text-[11px] text-neutral-600 line-clamp-1">{qt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Options */}
          <div className="pt-2 border-t border-black/10 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-4 text-xs font-bold">
            <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={quizConfig.includeExplanations}
                onChange={(e) =>
                  setQuizConfig({ ...quizConfig, includeExplanations: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span>Include Source Explanations</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={quizConfig.shuffleQuestions}
                onChange={(e) =>
                  setQuizConfig({ ...quizConfig, shuffleQuestions: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span>Shuffle Questions</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={quizConfig.shuffleOptions}
                onChange={(e) => setQuizConfig({ ...quizConfig, shuffleOptions: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Shuffle Answer Options</span>
            </label>
          </div>

          {/* Action Row - Mobile Friendly Full-Width */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={() => setStep('review')}
              className="min-h-[44px] px-4 py-2 border-2 border-black rounded-xl text-xs font-black bg-white hover:bg-neutral-100 cursor-pointer text-center"
            >
              ← Back to Review
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateQuiz}
              className="min-h-[50px] px-8 py-3 bg-[#FFD21A] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-y-[-1px] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-center"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{isGenerating ? 'Generating Questions...' : 'Generate Practice Quiz'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: INSPECT GENERATED QUESTIONS (PRE-PLAY REVIEW) */}
      {/* ========================================================================= */}
      {step === 'inspect' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border-2 border-black p-4 sm:p-5 shadow-[3px_3px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-black truncate">
                  {quizConfig.title}
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#FFD21A] border border-black text-xs font-black shrink-0">
                  {generatedQuestions.length} Questions
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                Review generated practice questions below, complete with verified citations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={handleSaveToStudySpace}
                disabled={savingQuiz}
                className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 bg-white rounded-xl border-2 border-black text-xs font-black flex items-center justify-center gap-1.5 hover:bg-neutral-100 cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{savingQuiz ? 'Saving...' : 'Save Quiz'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 bg-white rounded-xl border-2 border-black text-xs font-black flex items-center justify-center gap-1.5 hover:bg-neutral-100 cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartTaking()}
                className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-[#4ADE80] text-black rounded-xl border-2 border-black text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#000000] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                <span>Take Quiz Now →</span>
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3 sm:space-y-4">
            {generatedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border-2 border-black p-4 sm:p-5 shadow-[3px_3px_0px_#000000] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-black text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-neutral-100 border border-black/30">
                      {q.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-500">{q.difficulty}</span>
                  </div>

                  <div className="text-[11px] font-bold text-neutral-500">
                    Source:{' '}
                    <span className="text-black font-semibold">
                      {q.sourceReference.pageNumber
                        ? `Page ${q.sourceReference.pageNumber}`
                        : q.sourceReference.slideNumber
                          ? `Slide ${q.sourceReference.slideNumber}`
                          : q.sourceReference.sectionTitle}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-black break-words">{q.prompt}</p>

                {/* Multiple choice options preview */}
                {q.type === 'multiple_choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = opt === q.correctAnswer;
                      return (
                        <div
                          key={optIdx}
                          className={`min-h-[40px] p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                            isCorrect
                              ? 'bg-[#4ADE80]/20 border-green-700 font-black text-green-900'
                              : 'bg-neutral-50 border-black/20 text-neutral-700'
                          }`}
                        >
                          <span className="break-words">{opt}</span>
                          {isCorrect && (
                            <Check className="w-3.5 h-3.5 text-green-700 shrink-0 ml-1.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Other question types answer preview */}
                {q.type !== 'multiple_choice' && (
                  <div className="p-2.5 bg-neutral-50 rounded-lg border border-black/20 text-xs">
                    <span className="text-neutral-500 font-bold uppercase text-[10px] mr-2">
                      Answer:
                    </span>
                    <span className="font-black text-green-900 break-words">{q.correctAnswer}</span>
                  </div>
                )}

                {/* Source Evidence Quote */}
                <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-black/15 text-[11px] text-neutral-700 space-y-0.5">
                  <span className="font-black text-black uppercase text-[10px] block">
                    Document Evidence Excerpt:
                  </span>
                  <p className="italic break-words">"{q.sourceReference.excerpt}"</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep('configure')}
              className="min-h-[44px] px-4 py-2 border-2 border-black rounded-xl text-xs font-black bg-white hover:bg-neutral-100 cursor-pointer text-center"
            >
              ← Back to Settings
            </button>

            <button
              type="button"
              onClick={() => handleStartTaking()}
              className="min-h-[48px] px-8 py-3 bg-[#4ADE80] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[4px_4px_0px_#000000] hover:translate-y-[-1px] transition-all cursor-pointer text-center"
            >
              Start Quiz Now →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: INTERACTIVE QUIZ TAKING EXPERIENCE (MOBILE OPTIMIZED) */}
      {/* ========================================================================= */}
      {step === 'take' && generatedQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-black p-4 sm:p-7 shadow-[4px_4px_0px_#000000] space-y-5">
          {/* Compact Mobile-Friendly Header */}
          <div className="space-y-3 pb-3 border-b-2 border-black/10">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-neutral-500 font-mono truncate block">
                  {quizConfig.subject} • {extractedDoc?.name || 'Document'}
                </span>
                <h2 className="text-base sm:text-xl font-black text-black truncate">
                  Question {currentQuestionIndex + 1} of {generatedQuestions.length}
                </h2>
              </div>

              {/* Timer Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF7F2] border border-black rounded-lg text-xs font-mono font-bold shrink-0">
                <Clock className="w-3.5 h-3.5 text-neutral-600" />
                <span>
                  {Math.floor(timeSpentSeconds / 60)}:
                  {(timeSpentSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-black">
              <div
                className="bg-[#FFD21A] h-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / generatedQuestions.length) * 100}%`,
                }}
              />
            </div>

            {/* Practice Mode Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-black cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg border border-black/20 select-none">
                <input
                  type="checkbox"
                  checked={isPracticeMode}
                  onChange={(e) => setIsPracticeMode(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Practice Mode (Instant Feedback)</span>
              </label>

              <button
                type="button"
                onClick={() => setStep('inspect')}
                className="text-xs font-bold text-neutral-500 hover:text-black"
              >
                Exit
              </button>
            </div>
          </div>

          {/* Quick Jump Bar - Touch friendly min 38x38px */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {generatedQuestions.map((q, idx) => {
              const isAnswered = Boolean(userAnswers[q.id]);
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-xl text-xs font-mono font-black border-2 transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#FFD21A] border-black text-black shadow-[2px_2px_0px_#000000]'
                      : isAnswered
                        ? 'bg-black text-white border-black'
                        : 'bg-neutral-100 text-neutral-600 border-black/20 hover:bg-neutral-200'
                  }`}
                  title={`Go to question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Active Question Display */}
          {(() => {
            const currentQ = generatedQuestions[currentQuestionIndex];
            if (!currentQ) return null;
            const currentAns = userAnswers[currentQ.id] || '';
            const isAnswered = Boolean(currentAns);
            const isPracticeFeedback = isPracticeMode && isAnswered;

            return (
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-neutral-100 border border-black/30">
                      {currentQ.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-500">
                      {currentQ.points} {currentQ.points === 1 ? 'Point' : 'Points'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-black leading-snug break-words">
                    {currentQ.prompt}
                  </h3>
                </div>

                {/* Multiple choice options: full-width touch cards (min 48px height) */}
                {currentQ.type === 'multiple_choice' && currentQ.options && (
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = currentAns === opt;
                      const isCorrect = isPracticeFeedback && opt === currentQ.correctAnswer;
                      const isWrong =
                        isPracticeFeedback && isSelected && opt !== currentQ.correctAnswer;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => setUserAnswers({ ...userAnswers, [currentQ.id]: opt })}
                          className={`min-h-[48px] p-3.5 rounded-xl border-2 border-black flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] select-none ${
                            isCorrect
                              ? 'bg-green-100 border-green-700 shadow-[2px_2px_0px_#15803d]'
                              : isWrong
                                ? 'bg-red-100 border-red-700 shadow-[2px_2px_0px_#b91c1c]'
                                : isSelected
                                  ? 'bg-[#FFD21A] shadow-[2px_2px_0px_#000000]'
                                  : 'bg-white hover:bg-neutral-50 shadow-[1.5px_1.5px_0px_#000000]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <span className="w-6 h-6 rounded-full border border-black flex items-center justify-center font-mono font-bold text-xs bg-white shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-black break-words">
                              {opt}
                            </span>
                          </div>

                          {isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                          )}
                          {isWrong && <XCircle className="w-4 h-4 text-red-700 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True / False: Large 2-column touch buttons (min 52px height) */}
                {currentQ.type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {['True', 'False'].map((tf) => {
                      const isSelected = currentAns.toLowerCase() === tf.toLowerCase();
                      const isCorrect =
                        isPracticeFeedback &&
                        tf.toLowerCase() === currentQ.correctAnswer.toLowerCase();
                      const isWrong = isPracticeFeedback && isSelected && !isCorrect;

                      return (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setUserAnswers({ ...userAnswers, [currentQ.id]: tf })}
                          className={`min-h-[52px] p-4 rounded-xl border-2 border-black text-center font-black text-sm sm:text-base transition-all cursor-pointer select-none active:scale-[0.98] ${
                            isCorrect
                              ? 'bg-green-100 border-green-700 shadow-[3px_3px_0px_#15803d]'
                              : isWrong
                                ? 'bg-red-100 border-red-700 shadow-[3px_3px_0px_#b91c1c]'
                                : isSelected
                                  ? 'bg-[#FFD21A] shadow-[3px_3px_0px_#000000]'
                                  : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000000]'
                          }`}
                        >
                          {tf}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Identification & Fill in the Blank: Touch friendly input */}
                {(currentQ.type === 'identification' || currentQ.type === 'fill_in_the_blank') && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={currentAns}
                      onChange={(e) =>
                        setUserAnswers({ ...userAnswers, [currentQ.id]: e.target.value })
                      }
                      className="w-full min-h-[48px] px-4 py-3 border-2 border-black rounded-xl text-sm font-bold bg-[#FAF7F2] focus:bg-white focus:outline-none"
                    />

                    {isPracticeFeedback && (
                      <div className="p-3 bg-neutral-100 rounded-xl border border-black/20 text-xs">
                        <span className="font-bold text-neutral-600 block">Correct Answer:</span>
                        <span className="font-black text-green-800 break-words">
                          {currentQ.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Practice Mode Instant Explanation */}
                {isPracticeFeedback && currentQ.explanation && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-600 text-xs text-amber-900 space-y-1">
                    <span className="font-black block">Source Explanation:</span>
                    <p className="break-words">{currentQ.explanation}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Submission confirmation modal / inline banner */}
          {isConfirmingSubmit && (
            <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-600 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <h4 className="text-xs font-black text-amber-950">Confirm Quiz Submission</h4>
              </div>
              <p className="text-xs text-amber-900 font-medium">
                You have answered {Object.keys(userAnswers).length} of {generatedQuestions.length}{' '}
                questions. Are you ready to submit and calculate your final score?
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="min-h-[40px] px-4 py-2 bg-[#4ADE80] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  Yes, Submit Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingSubmit(false)}
                  className="min-h-[40px] px-4 py-2 bg-white text-black font-bold text-xs rounded-xl border border-black cursor-pointer"
                >
                  Keep Reviewing
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls - Mobile Bottom Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-black gap-2">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="min-h-[44px] px-4 py-2 border-2 border-black rounded-xl text-xs font-black bg-white hover:bg-neutral-100 cursor-pointer disabled:opacity-40"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              {currentQuestionIndex < generatedQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(generatedQuestions.length - 1, prev + 1),
                    )
                  }
                  className="min-h-[44px] px-5 py-2 bg-[#FFD21A] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="min-h-[48px] px-6 py-2.5 bg-[#4ADE80] text-black font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-y-[-1px] transition-all cursor-pointer"
                >
                  Submit & Finish Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: RESULTS & SOURCE VERIFICATION (MOBILE FRIENDLY) */}
      {/* ========================================================================= */}
      {step === 'results' && attemptResult && (
        <div className="space-y-4 sm:space-y-6">
          {/* Score Card Banner */}
          <div className="bg-white rounded-2xl border-2 border-black p-5 sm:p-7 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <span className="text-[10px] font-black uppercase text-neutral-500 font-mono block">
                Quiz Results Summary
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-black truncate break-words">
                {attemptResult.quizTitle}
              </h2>
              <p className="text-xs text-neutral-600 font-medium">
                Document: <span className="font-bold text-black">{attemptResult.documentName}</span>{' '}
                • Time: {Math.floor(attemptResult.timeSpentSeconds / 60)}m{' '}
                {attemptResult.timeSpentSeconds % 60}s
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
              <div className="text-center p-3 sm:p-4 bg-[#FFD21A] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] min-w-24 sm:min-w-28">
                <span className="text-2xl sm:text-3xl font-black text-black block">
                  {attemptResult.percentage}%
                </span>
                <span className="text-[10px] font-black uppercase text-black">
                  {attemptResult.score} / {attemptResult.totalPoints} Correct
                </span>
              </div>
            </div>
          </div>

          {/* Action Row - Mobile responsive grid */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResultsFilter('all')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all cursor-pointer ${
                    resultsFilter === 'all'
                      ? 'bg-black text-white border-black'
                      : 'bg-neutral-100 text-neutral-700 border-black/20'
                  }`}
                >
                  All ({attemptResult.answers.length})
                </button>

                <button
                  type="button"
                  onClick={() => setResultsFilter('incorrect')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-black border-2 transition-all cursor-pointer ${
                    resultsFilter === 'incorrect'
                      ? 'bg-black text-white border-black'
                      : 'bg-neutral-100 text-neutral-700 border-black/20'
                  }`}
                >
                  Incorrect ({attemptResult.answers.filter((a) => !a.isCorrect).length})
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetakeIncorrect}
                  className="min-h-[38px] px-3.5 py-1.5 bg-[#FFD21A] text-black font-black text-xs rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
                >
                  Practice Incorrect
                </button>

                <button
                  type="button"
                  onClick={() => handleStartTaking(generatedQuestions)}
                  className="min-h-[38px] px-3.5 py-1.5 bg-white text-black font-black text-xs rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000000] hover:bg-neutral-100 cursor-pointer"
                >
                  Retake Full Quiz
                </button>

                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="min-h-[38px] px-3.5 py-1.5 bg-neutral-100 text-neutral-800 font-black text-xs rounded-lg border border-black/30 hover:bg-neutral-200 cursor-pointer"
                >
                  New Document
                </button>
              </div>
            </div>
          </div>

          {/* Questions Breakdown List */}
          <div className="space-y-3 sm:space-y-4">
            {attemptResult.answers
              .filter((ans) => (resultsFilter === 'incorrect' ? !ans.isCorrect : true))
              .map((ans, idx) => {
                const isExpanded = showEvidenceId === ans.questionId;
                return (
                  <div
                    key={ans.questionId}
                    className={`bg-white rounded-2xl border-2 border-black p-4 sm:p-5 shadow-[3px_3px_0px_#000000] space-y-3 ${
                      ans.isCorrect
                        ? 'border-l-8 border-l-green-500'
                        : 'border-l-8 border-l-red-500'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-black text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {ans.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-700">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowEvidenceId(isExpanded ? null : ans.questionId)}
                        className="min-h-[36px] text-xs font-black text-neutral-700 hover:text-black flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Source Evidence' : 'View Source Evidence'}</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-black break-words">
                      {ans.prompt}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-neutral-50 border border-black/20">
                        <span className="text-[10px] font-black uppercase text-neutral-500 block">
                          Your Answer:
                        </span>
                        <span
                          className={`font-black break-words ${ans.isCorrect ? 'text-green-800' : 'text-red-700'}`}
                        >
                          {ans.userAnswer}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-green-50/50 border border-green-700/30">
                        <span className="text-[10px] font-black uppercase text-green-800 block">
                          Correct Answer:
                        </span>
                        <span className="font-black text-green-900 break-words">
                          {ans.correctAnswer}
                        </span>
                      </div>
                    </div>

                    {ans.explanation && (
                      <div className="text-xs text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-black/15">
                        <span className="font-bold">Explanation: </span>
                        <span className="break-words">{ans.explanation}</span>
                      </div>
                    )}

                    {/* Expandable Source Evidence Box */}
                    {isExpanded && (
                      <div className="p-3 bg-[#FAF7F2] rounded-xl border-2 border-black space-y-1.5 animate-fadeIn">
                        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono font-bold text-neutral-600 border-b border-black/15 pb-1 gap-1">
                          <span className="truncate">
                            Source: {ans.sourceReference.documentName}
                          </span>
                          <span className="shrink-0">
                            {ans.sourceReference.pageNumber
                              ? `Page ${ans.sourceReference.pageNumber}`
                              : ans.sourceReference.slideNumber
                                ? `Slide ${ans.sourceReference.slideNumber}`
                                : ans.sourceReference.sectionTitle}
                          </span>
                        </div>
                        <p className="text-xs text-black italic bg-white p-2.5 rounded-lg border border-black/20 select-all break-words">
                          "{ans.sourceReference.excerpt}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
