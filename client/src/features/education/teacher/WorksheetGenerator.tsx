import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Printer, Eye, EyeOff, BookOpen, Sparkles } from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';

export interface WorksheetQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'matching' | 'short_answer';
  question: string;
  options?: string[];
  matchingPairs?: { left: string; right: string }[];
  answer: string;
  points: number;
}

export interface WorksheetItem {
  _id: string;
  title: string;
  subject: string;
  instructions: string;
  gradeLevel?: string;
  questions: WorksheetQuestion[];
}

export const WorksheetGenerator: React.FC = () => {
  const [worksheets, setWorksheets] = useState<WorksheetItem[]>([]);
  const [activeWorksheet, setActiveWorksheet] = useState<WorksheetItem | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    subject: '',
    instructions:
      'Read each question carefully and write your answers clearly in the spaces provided.',
    gradeLevel: 'High School',
    questions: [] as WorksheetQuestion[],
  });

  const [newQuestion, setNewQuestion] = useState<WorksheetQuestion>({
    id: '',
    type: 'multiple_choice',
    question: '',
    options: ['', '', '', ''],
    matchingPairs: [
      { left: '', right: '' },
      { left: '', right: '' },
      { left: '', right: '' },
    ],
    answer: '',
    points: 1,
  });

  const loadWorksheets = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getWorksheets();
      if (res.success && Array.isArray(res.data)) {
        setWorksheets(res.data);
        if (!activeWorksheet && res.data.length > 0) {
          setActiveWorksheet(res.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load worksheets', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorksheets();
  }, []);

  const handleAddQuestionToForm = () => {
    if (!newQuestion.question.trim()) {
      alert('Question text is required.');
      return;
    }

    const q: WorksheetQuestion = {
      ...newQuestion,
      id: 'q-' + Date.now(),
      options:
        newQuestion.type === 'multiple_choice'
          ? (newQuestion.options || []).filter(Boolean)
          : undefined,
      matchingPairs:
        newQuestion.type === 'matching'
          ? (newQuestion.matchingPairs || []).filter((p) => p.left && p.right)
          : undefined,
    };

    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, q],
    }));

    setNewQuestion({
      id: '',
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      matchingPairs: [
        { left: '', right: '' },
        { left: '', right: '' },
        { left: '', right: '' },
      ],
      answer: '',
      points: 1,
    });
  };

  const handleSaveWorksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim()) return;
    if (form.questions.length === 0) {
      alert('Please add at least one question to the worksheet.');
      return;
    }

    const res = await educationApi.createWorksheet(form);
    if (res.success) {
      setActiveWorksheet(res.data);
      setIsModalOpen(false);
      setForm({
        title: '',
        subject: '',
        instructions:
          'Read each question carefully and write your answers clearly in the spaces provided.',
        gradeLevel: 'High School',
        questions: [],
      });
      loadWorksheets();
    }
  };

  const handleDeleteWorksheet = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this worksheet?')) {
      await educationApi.deleteWorksheet(id);
      if (activeWorksheet?._id === id) setActiveWorksheet(null);
      loadWorksheets();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000000]">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Classroom Worksheet Generator
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Design formatted printable student worksheets and generate separate instructor answer
            keys.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeWorksheet && (
            <>
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-black text-xs font-black transition-all cursor-pointer ${
                  showAnswerKey
                    ? 'bg-[#FFD21A] shadow-[2px_2px_0px_#000000]'
                    : 'bg-white hover:bg-neutral-100'
                }`}
              >
                {showAnswerKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print Worksheet
              </button>
            </>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFD21A] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Worksheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Worksheets Directory */}
        <div className="md:col-span-1 space-y-3 max-h-[650px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-bold text-neutral-500">
              Loading worksheets...
            </div>
          ) : worksheets.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border-2 border-dashed border-neutral-300">
              <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-neutral-600">No worksheets created yet</p>
            </div>
          ) : (
            worksheets.map((ws) => (
              <div
                key={ws._id}
                onClick={() => setActiveWorksheet(ws)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  activeWorksheet?._id === ws._id
                    ? 'border-black bg-[#FAF7F2] shadow-[3px_3px_0px_#000000]'
                    : 'border-neutral-200 bg-white hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white border border-black/20 text-neutral-700">
                    {ws.subject}
                  </span>
                  <button
                    onClick={(e) => handleDeleteWorksheet(ws._id, e)}
                    className="p-1 text-neutral-400 hover:text-red-600"
                    title="Delete worksheet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-black text-sm text-black truncate">{ws.title}</h4>
                <span className="text-[11px] font-bold text-neutral-400 mt-1 block">
                  {ws.questions?.length || 0} questions • {ws.gradeLevel || 'All Grades'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right: Printable Worksheet View */}
        <div className="md:col-span-2">
          {activeWorksheet ? (
            <div className="bg-white p-8 sm:p-10 rounded-2xl border-2 border-black shadow-[6px_6px_0px_#000000] space-y-6 print:border-none print:shadow-none print:p-0">
              {/* Header Box (Name, Date, Score) */}
              <div className="border-b-2 border-black pb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-black tracking-tight uppercase">
                      {activeWorksheet.title}
                    </h3>
                    <p className="text-xs font-bold text-neutral-500 uppercase mt-0.5">
                      {activeWorksheet.subject}{' '}
                      {activeWorksheet.gradeLevel && `• ${activeWorksheet.gradeLevel}`}
                    </p>
                  </div>
                  {showAnswerKey && (
                    <span className="bg-amber-100 border-2 border-black text-black font-black text-xs px-3 py-1 rounded-xl">
                      TEACHER ANSWER KEY
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 text-xs font-bold">
                  <div className="border-b border-black pb-1">
                    Student Name: <span className="font-normal">___________________________</span>
                  </div>
                  <div className="border-b border-black pb-1">
                    Date: <span className="font-normal">________________</span>
                  </div>
                  <div className="border-b border-black pb-1 text-right">
                    Score:{' '}
                    <span className="font-normal">
                      ______ / {activeWorksheet.questions.reduce((a, q) => a + (q.points || 1), 0)}
                    </span>
                  </div>
                </div>

                {activeWorksheet.instructions && (
                  <p className="text-xs text-neutral-600 italic bg-[#FAF7F2] p-2.5 rounded-lg border border-black/10">
                    <strong>Instructions:</strong> {activeWorksheet.instructions}
                  </p>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {activeWorksheet.questions?.map((q, idx) => (
                  <div key={q.id || idx} className="space-y-2 text-xs">
                    <div className="flex items-start justify-between font-bold text-sm text-neutral-900">
                      <span>
                        {idx + 1}. {q.question}
                      </span>
                      <span className="text-[11px] font-black text-neutral-400 shrink-0 ml-2">
                        ({q.points || 1} {q.points === 1 ? 'pt' : 'pts'})
                      </span>
                    </div>

                    {/* Multiple Choice */}
                    {q.type === 'multiple_choice' && (
                      <div className="grid grid-cols-2 gap-2 pl-4 pt-1">
                        {q.options?.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-2 ${
                              showAnswerKey &&
                              q.answer.trim().toLowerCase() === opt.trim().toLowerCase()
                                ? 'font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-300'
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

                    {/* True / False */}
                    {q.type === 'true_false' && (
                      <div className="flex items-center gap-6 pl-4 pt-1 font-bold">
                        <span
                          className={
                            showAnswerKey && q.answer.toLowerCase() === 'true'
                              ? 'font-black text-emerald-700 underline'
                              : ''
                          }
                        >
                          [ &nbsp; ] True
                        </span>
                        <span
                          className={
                            showAnswerKey && q.answer.toLowerCase() === 'false'
                              ? 'font-black text-emerald-700 underline'
                              : ''
                          }
                        >
                          [ &nbsp; ] False
                        </span>
                      </div>
                    )}

                    {/* Fill in the Blank */}
                    {q.type === 'fill_in_blank' && (
                      <div className="pl-4 pt-1">
                        Answer: __________________________________________________
                        {showAnswerKey && (
                          <span className="font-black text-emerald-700 ml-2">
                            [Key: {q.answer}]
                          </span>
                        )}
                      </div>
                    )}

                    {/* Matching */}
                    {q.type === 'matching' && q.matchingPairs && (
                      <div className="grid grid-cols-2 gap-4 pl-4 pt-2">
                        <div className="space-y-1.5">
                          {q.matchingPairs.map((pair, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2">
                              <span className="font-bold">{pIdx + 1}.</span>
                              <span>{pair.left}</span>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          {q.matchingPairs.map((pair, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-2">
                              <span className="font-bold">({String.fromCharCode(65 + pIdx)})</span>
                              <span>{pair.right}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Short Answer */}
                    {q.type === 'short_answer' && (
                      <div className="space-y-2 pl-4 pt-2">
                        <div className="border-b border-neutral-300 h-6" />
                        <div className="border-b border-neutral-300 h-6" />
                        {showAnswerKey && (
                          <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-300">
                            Key Answer / Rubric: {q.answer}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
              <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-600">
                Select a worksheet to preview or print
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Worksheet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-black shadow-[6px_6px_0px_#000000] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-black">Create Classroom Worksheet</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. World Geography"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Worksheet Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. European Capitals & Rivers"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Student Instructions
              </label>
              <textarea
                rows={2}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            {/* Questions Form Section */}
            <div className="border-t-2 border-black/10 pt-4 space-y-4">
              <h4 className="font-black text-sm text-neutral-800">
                Worksheet Questions ({form.questions.length})
              </h4>

              {form.questions.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {form.questions.map((q, i) => (
                    <div
                      key={i}
                      className="p-2 bg-[#FAF7F2] rounded-lg border border-black/20 flex items-center justify-between text-xs"
                    >
                      <span className="truncate max-w-md">
                        <strong>
                          Q{i + 1} ({q.type}):
                        </strong>{' '}
                        {q.question}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            questions: form.questions.filter((_, idx) => idx !== i),
                          })
                        }
                        className="text-red-600 font-bold ml-2 hover:underline"
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
                    <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newQuestion.type}
                      onChange={(e: any) =>
                        setNewQuestion({ ...newQuestion, type: e.target.value })
                      }
                      className="w-full px-3 py-1.5 border border-black rounded-lg text-xs font-bold bg-white"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="fill_in_blank">Fill in the Blank</option>
                      <option value="matching">Matching Pairs</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                      Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newQuestion.points}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, points: Number(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-1.5 border border-black rounded-lg text-xs font-medium bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Question Prompt *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter question prompt"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full px-3 py-2 border border-black rounded-lg text-xs font-medium bg-white"
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
                        className="px-2.5 py-1.5 border border-black/40 rounded-lg text-xs bg-white"
                      />
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Correct Answer / Key
                  </label>
                  <input
                    type="text"
                    placeholder="Answer for teacher key"
                    value={newQuestion.answer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                    className="w-full px-3 py-2 border border-black rounded-lg text-xs font-medium bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestionToForm}
                  className="px-4 py-1.5 bg-white text-black font-black text-xs rounded-lg border-2 border-black hover:bg-neutral-100"
                >
                  + Add Question to Worksheet
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border-2 border-black rounded-xl text-xs font-bold hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWorksheet}
                className="px-6 py-2 bg-[#FFD21A] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]"
              >
                Save Worksheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
