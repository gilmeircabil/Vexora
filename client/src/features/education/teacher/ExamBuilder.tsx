import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Plus,
  Trash2,
  Printer,
  Eye,
  EyeOff,
  BookOpen,
  Database,
  CheckCircle,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';

export interface ExamSection {
  id: string;
  title: string;
  instructions?: string;
  questions: any[];
}

export interface ExamItem {
  _id: string;
  title: string;
  subject: string;
  instructions?: string;
  durationMinutes: number;
  totalPoints: number;
  sections: ExamSection[];
}

export const ExamBuilder: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [activeExam, setActiveExam] = useState<ExamItem | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Question Banks state
  const [questionBanks, setQuestionBanks] = useState<any[]>([]);

  // Form state
  const [form, setForm] = useState({
    title: '',
    subject: '',
    instructions: 'No talking or electronic devices. Answer all sections completely.',
    durationMinutes: 60,
    totalPoints: 100,
    sections: [
      {
        id: 'sec-1',
        title: 'Section A: Multiple Choice',
        instructions: 'Choose the best answer for each question.',
        questions: [] as any[],
      },
    ],
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [eRes, bRes] = await Promise.all([
        educationApi.getExams(),
        educationApi.getQuestionBanks(),
      ]);
      if (eRes.success && Array.isArray(eRes.data)) {
        setExams(eRes.data);
        if (!activeExam && eRes.data.length > 0) setActiveExam(eRes.data[0]);
      }
      if (bRes.success && Array.isArray(bRes.data)) {
        setQuestionBanks(bRes.data);
      }
    } catch (e) {
      console.error('Failed to load exams', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim()) return;

    const res = await educationApi.createExam(form);
    if (res.success) {
      setActiveExam(res.data);
      setIsModalOpen(false);
      loadData();
    }
  };

  const handleDeleteExam = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this exam?')) {
      await educationApi.deleteExam(id);
      if (activeExam?._id === id) setActiveExam(null);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FileCode className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Formal Exam Builder & Question Banks
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct sectioned midterms, finals, and standardized assessments with question banks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeExam && (
            <>
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--theme-gray-border)] text-xs font-black transition-all cursor-pointer ${
                  showAnswerKey
                    ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-sm'
                    : 'bg-[var(--theme-surface)] hover:bg-neutral-100'
                }`}
              >
                {showAnswerKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print Exam
              </button>
            </>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Exam
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Exams List */}
        <div className="md:col-span-1 space-y-3 max-h-[650px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-bold text-slate-400">
              Loading exams...
            </div>
          ) : exams.length === 0 ? (
            <div className="p-8 text-center bg-[var(--theme-surface)] rounded-xl border-2 border-dashed border-neutral-300">
              <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">No exams created yet</p>
            </div>
          ) : (
            exams.map((ex) => (
              <div
                key={ex._id}
                onClick={() => setActiveExam(ex)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  activeExam?._id === ex._id
                    ? 'border-black bg-[var(--theme-surface-raised)] shadow-sm'
                    : 'border-neutral-200 bg-[var(--theme-surface)] hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface)] border border-black/20 text-slate-300">
                    {ex.subject}
                  </span>
                  <button
                    onClick={(e) => handleDeleteExam(ex._id, e)}
                    className="p-1 text-neutral-400 hover:text-red-600"
                    title="Delete exam"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-black text-sm text-slate-100 truncate">{ex.title}</h4>
                <div className="flex items-center gap-3 text-[11px] font-bold text-neutral-400 mt-2">
                  <span>{ex.durationMinutes} min</span>
                  <span>•</span>
                  <span>{ex.totalPoints} total pts</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Printable Exam Sheet */}
        <div className="md:col-span-2">
          {activeExam ? (
            <div className="bg-[var(--theme-surface)] p-8 sm:p-10 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
              {/* Formal Header */}
              <div className="border-b-4 border-black pb-4 text-center space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  OFFICIAL EXAMINATION PAPER
                </span>
                <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
                  {activeExam.title}
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  Course: {activeExam.subject} • Time Limit: {activeExam.durationMinutes} minutes •
                  Total Points: {activeExam.totalPoints}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-bold text-left border-t border-black/10">
                  <div className="border-b border-black pb-1">
                    Candidate Full Name: ____________________________________
                  </div>
                  <div className="border-b border-black pb-1">
                    Student ID No: __________________ Date: ______________
                  </div>
                </div>

                {activeExam.instructions && (
                  <p className="text-xs text-slate-400 text-left pt-2 font-medium">
                    <strong>General Instructions:</strong> {activeExam.instructions}
                  </p>
                )}
              </div>

              {/* Sections & Questions */}
              {activeExam.sections?.map((sec, sIdx) => (
                <div key={sec.id || sIdx} className="space-y-4">
                  <div className="bg-[var(--theme-surface-raised)] p-2.5 rounded-xl border border-black/20">
                    <h4 className="font-black text-sm uppercase text-slate-100">{sec.title}</h4>
                    {sec.instructions && (
                      <p className="text-xs text-slate-400 mt-0.5">{sec.instructions}</p>
                    )}
                  </div>

                  <div className="space-y-5 pl-2">
                    {sec.questions?.map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="space-y-1.5 text-xs">
                        <div className="flex items-start justify-between font-bold text-sm text-neutral-900">
                          <span>
                            {qIdx + 1}. {q.question}
                          </span>
                          <span className="text-[11px] font-black text-neutral-400 shrink-0 ml-2">
                            [{q.points || 1} pts]
                          </span>
                        </div>

                        {q.type === 'multiple_choice' && (
                          <div className="grid grid-cols-2 gap-2 pl-4 pt-1">
                            {q.options?.map((opt: string, oIdx: number) => (
                              <div
                                key={oIdx}
                                className={`flex items-center gap-2 ${
                                  showAnswerKey &&
                                  q.answer?.trim().toLowerCase() === opt.trim().toLowerCase()
                                    ? 'font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300'
                                    : ''
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full border border-black flex items-center justify-center text-[10px] font-bold">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'short_answer' && (
                          <div className="space-y-2 pl-4 pt-2">
                            <div className="border-b border-neutral-300 h-6" />
                            <div className="border-b border-neutral-300 h-6" />
                            {showAnswerKey && (
                              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-300">
                                Model Answer: {q.answer}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
              <FileCode className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">Select an exam to view or print</p>
            </div>
          )}
        </div>
      </div>

      {/* New Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-black">Create Examination</h3>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Physics"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Exam Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Examination Semester 1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setForm({ ...form, durationMinutes: Number(e.target.value) || 60 })
                    }
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={form.totalPoints}
                    onChange={(e) =>
                      setForm({ ...form, totalPoints: Number(e.target.value) || 100 })
                    }
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Instructions
                </label>
                <textarea
                  rows={2}
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
