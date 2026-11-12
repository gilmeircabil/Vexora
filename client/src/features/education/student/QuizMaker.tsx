import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Share2,
  History,
  AlertTriangle,
  FileQuestion,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export interface QuizItem {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  durationMinutes: number;
  isPublic: boolean;
  questions: QuizQuestion[];
}

export interface AttemptItem {
  _id: string;
  quizTitle: string;
  subject: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpentSeconds: number;
  createdAt: string;
}

export interface QuizMakerProps {
  onOpenDocQuiz?: () => void;
}

export const QuizMaker: React.FC<QuizMakerProps> = ({ onOpenDocQuiz }) => {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'history'>('quizzes');
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);

  // Taking Quiz State
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    answersList: any[];
  } | null>(null);

  // Create Quiz Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    subject: '',
    description: '',
    durationMinutes: 15,
    isPublic: false,
    questions: [] as QuizQuestion[],
  });

  const [newQuestion, setNewQuestion] = useState<QuizQuestion>({
    id: '',
    type: 'multiple_choice',
    prompt: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    points: 1,
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [qRes, aRes] = await Promise.all([
        educationApi.getQuizzes(),
        educationApi.getQuizAttempts(),
      ]);
      if (qRes.success && Array.isArray(qRes.data)) {
        setQuizzes(qRes.data);
      }
      if (aRes.success && Array.isArray(aRes.data)) {
        setAttempts(aRes.data);
      }
    } catch (e) {
      console.error('Failed to load quiz data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer countdown while taking quiz
  useEffect(() => {
    if (!isTakingQuiz || isSubmitted || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((t) => {
        if (t <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTakingQuiz, isSubmitted, timeLeftSeconds]);

  const handleStartQuiz = (quiz: QuizItem, onlyIncorrect: QuizQuestion[] | null = null) => {
    const list = onlyIncorrect ? [...onlyIncorrect] : [...quiz.questions];
    if (list.length === 0) {
      alert('This quiz has no questions.');
      return;
    }
    // Shuffle questions
    const shuffled = list.sort(() => Math.random() - 0.5);
    setActiveQuiz(quiz);
    setQuizQuestions(shuffled);
    setUserAnswers({});
    setTimeLeftSeconds((quiz.durationMinutes || 15) * 60);
    setIsSubmitted(false);
    setScoreResult(null);
    setIsTakingQuiz(true);
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmitted) return;

    let totalScore = 0;
    let maxPoints = 0;
    const gradedAnswers: any[] = [];

    quizQuestions.forEach((q) => {
      maxPoints += q.points || 1;
      const userAns = (userAnswers[q.id] || '').trim();
      let isCorrect = false;

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        isCorrect = userAns.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      } else {
        // Short answer: normalized string comparison
        const cleanUser = userAns.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanTarget = q.correctAnswer.toLowerCase().replace(/[^a-z0-9]/g, '');
        isCorrect = cleanUser === cleanTarget;
      }

      const pointsEarned = isCorrect ? q.points || 1 : 0;
      totalScore += pointsEarned;

      gradedAnswers.push({
        questionId: q.id,
        questionText: q.prompt,
        userAnswer: userAns,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || '',
        pointsEarned,
      });
    });

    const percentage = Math.round((totalScore / (maxPoints || 1)) * 100);
    const duration = activeQuiz.durationMinutes * 60 - timeLeftSeconds;

    setScoreResult({
      score: totalScore,
      total: maxPoints,
      percentage,
      answersList: gradedAnswers,
    });
    setIsSubmitted(true);

    // Persist attempt to MongoDB
    await educationApi.recordQuizAttempt(activeQuiz._id, {
      score: totalScore,
      totalPoints: maxPoints,
      percentage,
      timeSpentSeconds: duration > 0 ? duration : 0,
      answers: gradedAnswers,
    });

    loadData();
  };

  const handleRetryIncorrect = () => {
    if (!activeQuiz || !scoreResult) return;
    const incorrectQuestions = quizQuestions.filter((q) => {
      const match = scoreResult.answersList.find((a) => a.questionId === q.id);
      return match && !match.isCorrect;
    });

    if (incorrectQuestions.length === 0) {
      alert('You got a perfect score! No incorrect questions to retry.');
      return;
    }

    handleStartQuiz(activeQuiz, incorrectQuestions);
  };

  const handleAddQuestionToForm = () => {
    if (!newQuestion.prompt.trim() || !newQuestion.correctAnswer.trim()) {
      alert('Prompt and Correct Answer are required.');
      return;
    }
    const q: QuizQuestion = {
      ...newQuestion,
      id: 'q-' + Date.now(),
    };
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, q],
    }));

    setNewQuestion({
      id: '',
      type: 'multiple_choice',
      prompt: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
    });
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.title.trim() || !quizForm.subject.trim()) {
      alert('Title and subject are required.');
      return;
    }
    if (quizForm.questions.length === 0) {
      alert('Please add at least one question to your quiz.');
      return;
    }

    await educationApi.createQuiz(quizForm);
    setIsModalOpen(false);
    setQuizForm({
      title: '',
      subject: '',
      description: '',
      durationMinutes: 15,
      isPublic: false,
      questions: [],
    });
    loadData();
  };

  const handleDeleteQuiz = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this quiz?')) {
      await educationApi.deleteQuiz(id);
      loadData();
    }
  };

  // Taking Quiz View
  if (isTakingQuiz && activeQuiz) {
    const minutes = Math.floor(timeLeftSeconds / 60);
    const seconds = timeLeftSeconds % 60;

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Quiz Banner & Timer */}
        <div className="flex items-center justify-between bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-gray-border)] shadow-sm">
          <div>
            <button
              onClick={() => setIsTakingQuiz(false)}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-100 mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit Quiz
            </button>
            <h2 className="text-lg font-black">{activeQuiz.title}</h2>
          </div>

          {!isSubmitted && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] font-black text-sm ${
                timeLeftSeconds < 120 ? 'bg-red-100 text-red-600' : 'bg-[var(--theme-surface-raised)]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
          )}
        </div>

        {/* Results Screen if Submitted */}
        {isSubmitted && scoreResult && (
          <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm text-center space-y-4">
            <h3 className="text-2xl font-black">Quiz Completed!</h3>
            <div className="inline-block px-6 py-3 rounded-2xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] shadow-sm">
              <span className="text-4xl font-black text-slate-100">
                {scoreResult.score} / {scoreResult.total}
              </span>
              <span className="block text-sm font-bold text-slate-400 mt-1">
                Score: {scoreResult.percentage}%
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              * Note: Automatically evaluated short answers are compared against target keywords.
              Subjective answers should not be taken as authoritative.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsTakingQuiz(false)}
                className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
              >
                Return to Quizzes
              </button>
              {scoreResult.percentage < 100 && (
                <button
                  onClick={handleRetryIncorrect}
                  className="px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5 transition-transform"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Incorrect Questions
                </button>
              )}
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {quizQuestions.map((q, idx) => {
            const userAns = userAnswers[q.id] || '';
            const graded = isSubmitted
              ? scoreResult?.answersList.find((a) => a.questionId === q.id)
              : null;

            return (
              <div
                key={q.id || idx}
                className={`p-5 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] transition-all ${
                  isSubmitted
                    ? graded?.isCorrect
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-red-500 bg-red-50/20'
                    : 'shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>
                    Question {idx + 1} of {quizQuestions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--theme-surface-raised)] px-2 py-0.5 rounded border border-black/20 text-slate-100">
                      {q.points || 1} {q.points === 1 ? 'pt' : 'pts'}
                    </span>
                    {isSubmitted && (
                      <span>
                        {graded?.isCorrect ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-black">
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1 font-black">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <p className="font-black text-base text-neutral-900 mb-4">{q.prompt}</p>

                {/* Multiple Choice Options */}
                {q.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {q.options?.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          userAns === opt
                            ? 'border-black bg-[var(--theme-surface-raised)] font-black'
                            : 'border-neutral-200 hover:border-black/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt}
                          disabled={isSubmitted}
                          checked={userAns === opt}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-4 h-4 text-slate-100 border-black"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True / False */}
                {q.type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-3">
                    {['True', 'False'].map((tf) => (
                      <button
                        type="button"
                        key={tf}
                        disabled={isSubmitted}
                        onClick={() => handleAnswerChange(q.id, tf)}
                        className={`py-3 px-4 rounded-xl border-2 font-black text-sm transition-all cursor-pointer ${
                          userAns.toLowerCase() === tf.toLowerCase()
                            ? 'border-black bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-sm'
                            : 'border-neutral-300 bg-[var(--theme-surface)] hover:border-black'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                )}

                {/* Short Answer */}
                {q.type === 'short_answer' && (
                  <div>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      placeholder="Type your answer here..."
                      value={userAns}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full px-3 py-2.5 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none"
                    />
                  </div>
                )}

                {/* Explanation on Submission */}
                {isSubmitted && (
                  <div className="mt-4 p-3 bg-[var(--theme-surface)] rounded-xl border border-black/20 text-xs space-y-1">
                    <p className="font-bold text-slate-300">
                      Correct Answer:{' '}
                      <span className="font-black text-emerald-700">{q.correctAnswer}</span>
                    </p>
                    {q.explanation && (
                      <p className="text-slate-400">
                        <span className="font-bold">Explanation:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="flex justify-end pt-2 pb-6">
            <button
              onClick={handleSubmitQuiz}
              className="px-8 py-3 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-sm rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
            >
              Submit & Grade Quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Quiz & Practice Test Maker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create custom timed assessments with instant automated scoring and answer explanations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--theme-surface-raised)] p-1 rounded-xl border border-black text-xs font-bold">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'quizzes'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Attempt History ({attempts.length})
            </button>
          </div>

          {onOpenDocQuiz && (
            <button
              onClick={onOpenDocQuiz}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] font-bold text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <FileQuestion className="w-4 h-4" />
              <span>Doc to Quiz</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Quiz
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
        <div>
          <span className="font-bold">Automated Scoring Policy:</span> Objective multiple-choice and
          true/false questions are scored directly. Short-answer responses are evaluated based on
          exact/keyword match and should be reviewed by an instructor for full academic grading.
        </div>
      </div>

      {/* Main Content: Quizzes Tab */}
      {activeTab === 'quizzes' ? (
        isLoading ? (
          <div className="text-center py-12 font-bold text-slate-400">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
            <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-300">No quizzes available</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create your first practice test or quiz to start self-testing.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-black shadow-sm"
            >
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-gray-border)] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--theme-surface-raised)] border border-black/20 text-slate-300">
                      {quiz.subject}
                    </span>
                    <button
                      onClick={(e) => handleDeleteQuiz(quiz._id, e)}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-black text-base text-slate-100">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{quiz.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-3">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {quiz.questions?.length || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {quiz.durationMinutes} mins
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                  {quiz.isPublic && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      Public Quiz
                    </span>
                  )}
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    disabled={!quiz.questions || quiz.questions.length === 0}
                    className="ml-auto px-4 py-1.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] disabled:opacity-50 text-slate-100 font-black text-xs rounded-xl border border-black shadow-sm hover:-translate-y-0.5 transition-transform"
                  >
                    Start Test &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* History Tab */
        <div className="space-y-3">
          {attempts.length === 0 ? (
            <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-neutral-200 text-slate-400 text-sm font-bold">
              No quiz attempts recorded yet.
            </div>
          ) : (
            attempts.map((att) => (
              <div
                key={att._id}
                className="bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-gray-border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--theme-surface-raised)] border border-black/20 text-slate-300">
                      {att.subject}
                    </span>
                    <h4 className="font-black text-sm text-slate-100">{att.quizTitle}</h4>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Completed on {new Date(att.createdAt).toLocaleDateString()} at{' '}
                    {new Date(att.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-100">
                      {att.score} / {att.totalPoints}
                    </span>
                    <span className="block text-xs font-bold text-emerald-600">
                      {att.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Quiz Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <h3 className="text-lg font-black">Create Practice Test or Quiz</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Chemistry"
                  value={quizForm.subject}
                  onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Practice Exam"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={quizForm.durationMinutes}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, durationMinutes: Number(e.target.value) || 15 })
                  }
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={quizForm.isPublic}
                    onChange={(e) => setQuizForm({ ...quizForm, isPublic: e.target.checked })}
                    className="rounded border-black"
                  />
                  <span>Allow other students to practice with this quiz</span>
                </label>
              </div>
            </div>

            {/* Questions Form Section */}
            <div className="border-t border-[var(--theme-gray-border)] pt-4 space-y-4">
              <h4 className="font-black text-sm text-neutral-800 flex items-center justify-between">
                <span>Quiz Questions ({quizForm.questions.length})</span>
              </h4>

              {quizForm.questions.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {quizForm.questions.map((q, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-[var(--theme-surface-raised)] rounded-lg border border-black/20 flex items-center justify-between text-xs font-medium"
                    >
                      <span className="truncate max-w-sm">
                        <strong>Q{i + 1}:</strong> {q.prompt}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuizForm({
                            ...quizForm,
                            questions: quizForm.questions.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-red-600 hover:underline font-bold ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Question Box */}
              <div className="p-4 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Question Type
                    </label>
                    <select
                      value={newQuestion.type}
                      onChange={(e: any) =>
                        setNewQuestion({ ...newQuestion, type: e.target.value })
                      }
                      className="w-full px-3 py-1.5 border border-black rounded-lg text-xs font-bold bg-[var(--theme-surface)]"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newQuestion.points}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, points: Number(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-1.5 border border-black rounded-lg text-xs font-medium bg-[var(--theme-surface)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Question Prompt *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter question text"
                    value={newQuestion.prompt}
                    onChange={(e) => setNewQuestion({ ...newQuestion, prompt: e.target.value })}
                    className="w-full px-3 py-2 border border-black rounded-lg text-xs font-medium bg-[var(--theme-surface)]"
                  />
                </div>

                {newQuestion.type === 'multiple_choice' && (
                  <div className="grid grid-cols-2 gap-2">
                    {newQuestion.options?.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...(newQuestion.options || [])];
                          updated[i] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: updated });
                        }}
                        className="px-3 py-1.5 border border-black/40 rounded-lg text-xs bg-[var(--theme-surface)]"
                      />
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Correct Answer *
                  </label>
                  <input
                    type="text"
                    placeholder="Exact correct answer or exact option text"
                    value={newQuestion.correctAnswer}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-black rounded-lg text-xs font-medium bg-[var(--theme-surface)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Why this answer is correct"
                    value={newQuestion.explanation}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, explanation: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-black rounded-lg text-xs font-medium bg-[var(--theme-surface)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestionToForm}
                  className="px-4 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-lg border border-[var(--theme-gray-border)] hover:bg-neutral-100"
                >
                  + Add Question to Quiz
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuiz}
                className="px-6 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
              >
                Save Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
