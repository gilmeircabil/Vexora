import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  BookOpen,
  Clock,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';

export interface LessonPlanItem {
  _id: string;
  title: string;
  subject: string;
  gradeLevel?: string;
  durationMinutes: number;
  templateType: '5e' | 'direct' | 'inquiry' | 'standard';
  objectives: string[];
  materials: string[];
  activities: { phase: string; durationMinutes: number; description: string }[];
  assessmentMethods?: string;
  homework?: string;
  createdAt: string;
}

export const LessonPlanCreator: React.FC = () => {
  const [plans, setPlans] = useState<LessonPlanItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlanItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    subject: '',
    gradeLevel: 'Grade 9-10',
    durationMinutes: 45,
    templateType: 'standard' as '5e' | 'direct' | 'inquiry' | 'standard',
    objectivesText: '',
    materialsText: '',
    activities: [
      { phase: 'Warm-up / Bell Ringer', durationMinutes: 5, description: '' },
      { phase: 'Direct Instruction', durationMinutes: 15, description: '' },
      { phase: 'Guided Practice', durationMinutes: 15, description: '' },
      { phase: 'Closure / Exit Ticket', durationMinutes: 10, description: '' },
    ],
    assessmentMethods: '',
    homework: '',
  });

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getLessonPlans();
      if (res.success && Array.isArray(res.data)) {
        setPlans(res.data);
        if (!selectedPlan && res.data.length > 0) {
          setSelectedPlan(res.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load lesson plans', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleApplyTemplate = (type: '5e' | 'direct' | 'inquiry' | 'standard') => {
    let activities: any[] = [];
    if (type === '5e') {
      activities = [
        {
          phase: 'Engage',
          durationMinutes: 10,
          description: 'Hook student interest & activate prior knowledge.',
        },
        {
          phase: 'Explore',
          durationMinutes: 15,
          description: 'Hands-on inquiry and student experimentation.',
        },
        {
          phase: 'Explain',
          durationMinutes: 10,
          description: 'Teacher explanation and formal concept introduction.',
        },
        {
          phase: 'Elaborate',
          durationMinutes: 10,
          description: 'Apply concept to a new scenario or problem.',
        },
        {
          phase: 'Evaluate',
          durationMinutes: 5,
          description: 'Exit ticket or formative assessment check.',
        },
      ];
    } else if (type === 'direct') {
      activities = [
        { phase: 'Anticipatory Set', durationMinutes: 5, description: 'Review previous lesson.' },
        {
          phase: 'Direct Instruction (I Do)',
          durationMinutes: 15,
          description: 'Model skill explicitly.',
        },
        {
          phase: 'Guided Practice (We Do)',
          durationMinutes: 15,
          description: 'Step-by-step collaborative problem solving.',
        },
        {
          phase: 'Independent Practice (You Do)',
          durationMinutes: 10,
          description: 'Solo worksheet or task.',
        },
      ];
    } else {
      activities = [
        { phase: 'Warm-up / Hook', durationMinutes: 5, description: '' },
        { phase: 'Core Instruction', durationMinutes: 20, description: '' },
        { phase: 'Collaborative Activity', durationMinutes: 15, description: '' },
        { phase: 'Closure', durationMinutes: 5, description: '' },
      ];
    }

    setForm({
      ...form,
      templateType: type,
      activities,
    });
  };

  const handleOpenNew = () => {
    setSelectedPlan(null);
    setForm({
      title: '',
      subject: '',
      gradeLevel: 'Grade 9-10',
      durationMinutes: 45,
      templateType: 'standard',
      objectivesText: '',
      materialsText: '',
      activities: [
        { phase: 'Warm-up', durationMinutes: 5, description: '' },
        { phase: 'Direct Instruction', durationMinutes: 15, description: '' },
        { phase: 'Guided Practice', durationMinutes: 15, description: '' },
        { phase: 'Closure', durationMinutes: 10, description: '' },
      ],
      assessmentMethods: '',
      homework: '',
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim()) return;

    const payload = {
      title: form.title,
      subject: form.subject,
      gradeLevel: form.gradeLevel,
      durationMinutes: form.durationMinutes,
      templateType: form.templateType,
      objectives: form.objectivesText.split('\n').filter((l) => l.trim()),
      materials: form.materialsText.split('\n').filter((l) => l.trim()),
      activities: form.activities,
      assessmentMethods: form.assessmentMethods,
      homework: form.homework,
    };

    if (selectedPlan) {
      const res = await educationApi.updateLessonPlan(selectedPlan._id, payload);
      if (res.success) setSelectedPlan(res.data);
    } else {
      const res = await educationApi.createLessonPlan(payload);
      if (res.success) setSelectedPlan(res.data);
    }
    setIsEditing(false);
    loadPlans();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this lesson plan?')) {
      await educationApi.deleteLessonPlan(id);
      if (selectedPlan?._id === id) setSelectedPlan(null);
      loadPlans();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Curriculum & Lesson Plan Creator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Structure comprehensive instructional plans with pedagogical templates (5E, Direct,
            Inquiry) and print layouts.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          New Lesson Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Saved Plans List */}
        <div className="md:col-span-1 space-y-3 max-h-[650px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-bold text-slate-400">
              Loading lesson plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="p-8 text-center bg-[var(--theme-surface)] rounded-xl border-2 border-dashed border-neutral-300">
              <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">No lesson plans created yet</p>
            </div>
          ) : (
            plans.map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  setSelectedPlan(p);
                  setIsEditing(false);
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan?._id === p._id
                    ? 'border-black bg-[var(--theme-surface-raised)] shadow-sm'
                    : 'border-neutral-200 bg-[var(--theme-surface)] hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface)] border border-black/20 text-slate-300">
                    {p.subject}
                  </span>
                  <button
                    onClick={(e) => handleDelete(p._id, e)}
                    className="p-1 text-neutral-400 hover:text-red-600"
                    title="Delete plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-black text-sm text-slate-100 truncate">{p.title}</h4>
                <div className="flex items-center gap-3 text-[11px] font-bold text-neutral-400 mt-2">
                  <span>{p.gradeLevel || 'Standard'}</span>
                  <span>•</span>
                  <span>{p.durationMinutes} mins</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Plan Reader or Editor */}
        <div className="md:col-span-2">
          {isEditing ? (
            <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-3">
                <h3 className="font-black text-base">
                  {selectedPlan ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
                </h3>

                {/* Template Preset Buttons */}
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="text-slate-400">Template:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('standard')}
                    className={`px-2 py-0.5 rounded border ${
                      form.templateType === 'standard' ? 'bg-black text-white' : 'bg-neutral-100'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('5e')}
                    className={`px-2 py-0.5 rounded border ${
                      form.templateType === '5e' ? 'bg-black text-white' : 'bg-neutral-100'
                    }`}
                  >
                    5E Model
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('direct')}
                    className={`px-2 py-0.5 rounded border ${
                      form.templateType === 'direct' ? 'bg-black text-white' : 'bg-neutral-100'
                    }`}
                  >
                    Direct (I/We/You)
                  </button>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Earth Science, Geometry"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Lesson Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Introduction to Plate Tectonics"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Grade Level
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grade 10, AP Biology"
                      value={form.gradeLevel}
                      onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Total Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="180"
                      value={form.durationMinutes}
                      onChange={(e) =>
                        setForm({ ...form, durationMinutes: Number(e.target.value) || 45 })
                      }
                      className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Learning Objectives (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Students will be able to explain the 3 types of plate boundaries..."
                    value={form.objectivesText}
                    onChange={(e) => setForm({ ...form, objectivesText: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Learning Materials & Resources (One per line)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="World map handouts, colored pencils, tectonic plates diagram..."
                    value={form.materialsText}
                    onChange={(e) => setForm({ ...form, materialsText: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                {/* Activities Breakdown */}
                <div className="space-y-2 border-t border-black/10 pt-3">
                  <label className="block text-xs font-black uppercase text-slate-300">
                    Teaching Activities & Phases
                  </label>
                  {form.activities.map((act, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[var(--theme-surface-raised)] rounded-xl border border-black/20 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={act.phase}
                          onChange={(e) => {
                            const updated = [...form.activities];
                            const curr = updated[i];
                            if (curr) {
                              curr.phase = e.target.value;
                              setForm({ ...form, activities: updated });
                            }
                          }}
                          className="font-bold text-xs bg-[var(--theme-surface)] px-2 py-1 rounded border border-black/30 flex-1"
                        />
                        <div className="flex items-center gap-1 text-xs">
                          <input
                            type="number"
                            min="1"
                            value={act.durationMinutes}
                            onChange={(e) => {
                              const updated = [...form.activities];
                              const curr = updated[i];
                              if (curr) {
                                curr.durationMinutes = Number(e.target.value) || 5;
                                setForm({ ...form, activities: updated });
                              }
                            }}
                            className="w-14 px-1.5 py-1 text-center font-bold bg-[var(--theme-surface)] rounded border border-black/30"
                          />
                          <span>min</span>
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="What do teacher and students do during this phase?"
                        value={act.description}
                        onChange={(e) => {
                          const updated = [...form.activities];
                          const curr = updated[i];
                          if (curr) {
                            curr.description = e.target.value;
                            setForm({ ...form, activities: updated });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-[var(--theme-surface)] rounded border border-black/20 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Assessment Methods
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Exit ticket, 3-question quiz"
                      value={form.assessmentMethods}
                      onChange={(e) => setForm({ ...form, assessmentMethods: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Homework / Extension
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 3 review questions 1-5"
                      value={form.homework}
                      onChange={(e) => setForm({ ...form, homework: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-black/10">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                  >
                    Save Lesson Plan
                  </button>
                </div>
              </form>
            </div>
          ) : selectedPlan ? (
            <div className="bg-[var(--theme-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-6">
              {/* Top View Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--theme-gray-border)] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--theme-surface-raised)] border border-black/20 text-slate-300">
                      {selectedPlan.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {selectedPlan.gradeLevel || 'Standard'} • {selectedPlan.durationMinutes} min
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-100">{selectedPlan.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] hover:bg-neutral-50 text-xs font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      setForm({
                        title: selectedPlan.title,
                        subject: selectedPlan.subject,
                        gradeLevel: selectedPlan.gradeLevel || '',
                        durationMinutes: selectedPlan.durationMinutes,
                        templateType: selectedPlan.templateType || 'standard',
                        objectivesText: (selectedPlan.objectives || []).join('\n'),
                        materialsText: (selectedPlan.materials || []).join('\n'),
                        activities: selectedPlan.activities || [],
                        assessmentMethods: selectedPlan.assessmentMethods || '',
                        homework: selectedPlan.homework || '',
                      });
                      setIsEditing(true);
                    }}
                    className="px-4 py-1.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Objectives */}
              {selectedPlan.objectives && selectedPlan.objectives.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 mb-2">
                    Learning Objectives
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-[var(--theme-dirty-white)] space-y-1 font-normal">
                    {selectedPlan.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Materials */}
              {selectedPlan.materials && selectedPlan.materials.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 mb-2">
                    Materials & Resources
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-[var(--theme-dirty-white)] space-y-1 font-normal">
                    {selectedPlan.materials.map((mat, i) => (
                      <li key={i}>{mat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Activities Table */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 mb-2">
                  Instructional Activities
                </h4>
                <div className="space-y-2">
                  {selectedPlan.activities?.map((act, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[var(--theme-surface-raised)] rounded-xl border border-black/15 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <span className="font-black text-slate-100 block mb-0.5">{act.phase}</span>
                        <p className="text-slate-300 whitespace-pre-wrap">{act.description}</p>
                      </div>
                      <span className="font-black text-[11px] px-2 py-0.5 rounded bg-[var(--theme-surface)] border border-black/20 shrink-0 self-start">
                        {act.durationMinutes} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessment & Homework */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-black/10 pt-4">
                {selectedPlan.assessmentMethods && (
                  <div>
                    <h5 className="text-xs font-black uppercase text-slate-400 mb-1">
                      Assessment Methods
                    </h5>
                    <p className="text-xs text-neutral-800 font-medium">
                      {selectedPlan.assessmentMethods}
                    </p>
                  </div>
                )}
                {selectedPlan.homework && (
                  <div>
                    <h5 className="text-xs font-black uppercase text-slate-400 mb-1">
                      Homework Assignment
                    </h5>
                    <p className="text-xs text-neutral-800 font-medium">{selectedPlan.homework}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
              <FileCheck className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">
                Select a lesson plan to view or edit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
