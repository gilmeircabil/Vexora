import React, { useState, useEffect } from 'react';
import { Table, Plus, Trash2, Printer, Sparkles, BookOpen } from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';

export interface RubricLevel {
  id: string;
  name: string;
  points: number;
  description: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricItem {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  criteria: RubricCriterion[];
}

export const RubricBuilder: React.FC = () => {
  const [rubrics, setRubrics] = useState<RubricItem[]>([]);
  const [activeRubric, setActiveRubric] = useState<RubricItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Rubric form
  const [form, setForm] = useState({
    title: '',
    subject: '',
    description: '',
    criteria: [
      {
        id: 'crit-1',
        title: 'Content & Research Depth',
        weight: 1,
        levels: [
          {
            id: 'l-4',
            name: 'Exemplary',
            points: 4,
            description: 'Comprehensive evidence with deep analytical synthesis.',
          },
          {
            id: 'l-3',
            name: 'Proficient',
            points: 3,
            description: 'Accurate and relevant supporting arguments.',
          },
          {
            id: 'l-2',
            name: 'Developing',
            points: 2,
            description: 'Basic facts presented with minor gaps.',
          },
          {
            id: 'l-1',
            name: 'Beginning',
            points: 1,
            description: 'Limited research with frequent inaccuracies.',
          },
        ],
      },
      {
        id: 'crit-2',
        title: 'Organization & Structure',
        weight: 1,
        levels: [
          {
            id: 'l-4',
            name: 'Exemplary',
            points: 4,
            description: 'Seamless transitions and clear logical progression.',
          },
          {
            id: 'l-3',
            name: 'Proficient',
            points: 3,
            description: 'Well-structured with identifiable paragraphs.',
          },
          {
            id: 'l-2',
            name: 'Developing',
            points: 2,
            description: 'Some structural issues affecting flow.',
          },
          {
            id: 'l-1',
            name: 'Beginning',
            points: 1,
            description: 'Disorganized thoughts without cohesive structure.',
          },
        ],
      },
    ],
  });

  const loadRubrics = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getRubrics();
      if (res.success && Array.isArray(res.data)) {
        setRubrics(res.data);
        if (!activeRubric && res.data.length > 0) setActiveRubric(res.data[0]);
      }
    } catch (e) {
      console.error('Failed to load rubrics', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRubrics();
  }, []);

  const handleSaveRubric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim()) return;

    const res = await educationApi.createRubric(form);
    if (res.success) {
      setActiveRubric(res.data);
      setIsModalOpen(false);
      loadRubrics();
    }
  };

  const handleDeleteRubric = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this rubric?')) {
      await educationApi.deleteRubric(id);
      if (activeRubric?._id === id) setActiveRubric(null);
      loadRubrics();
    }
  };

  const handleAddCriterion = () => {
    const newCrit: RubricCriterion = {
      id: 'crit-' + Date.now(),
      title: 'New Criterion',
      weight: 1,
      levels: [
        {
          id: 'l-4',
          name: 'Exemplary',
          points: 4,
          description: 'Exceeds all standard benchmarks.',
        },
        { id: 'l-3', name: 'Proficient', points: 3, description: 'Meets benchmark standards.' },
        {
          id: 'l-2',
          name: 'Developing',
          points: 2,
          description: 'Approaching standards with assistance.',
        },
        { id: 'l-1', name: 'Beginning', points: 1, description: 'Does not yet meet standards.' },
      ],
    };
    setForm({ ...form, criteria: [...form.criteria, newCrit] });
  };

  const calculateMaxPoints = (rubric: RubricItem): number => {
    return rubric.criteria.reduce((total, c) => {
      const maxL = Math.max(...c.levels.map((l) => l.points), 0);
      return total + maxL * (c.weight || 1);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Table className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Grading Rubric Matrix Builder
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct multi-level grading rubrics with customizable performance scales and
            descriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeRubric && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Rubric
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Rubric
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Rubrics List */}
        <div className="md:col-span-1 space-y-3 max-h-[650px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="text-center py-8 text-xs font-bold text-slate-400">
              Loading rubrics...
            </div>
          ) : rubrics.length === 0 ? (
            <div className="p-8 text-center bg-[var(--theme-surface)] rounded-xl border-2 border-dashed border-neutral-300">
              <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">No rubrics created yet</p>
            </div>
          ) : (
            rubrics.map((r) => (
              <div
                key={r._id}
                onClick={() => setActiveRubric(r)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  activeRubric?._id === r._id
                    ? 'border-black bg-[var(--theme-surface-raised)] shadow-sm'
                    : 'border-neutral-200 bg-[var(--theme-surface)] hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface)] border border-black/20 text-slate-300">
                    {r.subject}
                  </span>
                  <button
                    onClick={(e) => handleDeleteRubric(r._id, e)}
                    className="p-1 text-neutral-400 hover:text-red-600"
                    title="Delete rubric"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-black text-sm text-slate-100 truncate">{r.title}</h4>
                <span className="text-[11px] font-bold text-neutral-400 mt-1 block">
                  {r.criteria?.length || 0} criteria • {calculateMaxPoints(r)} max points
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right: Rubric Grid Table */}
        <div className="md:col-span-2">
          {activeRubric ? (
            <div className="bg-[var(--theme-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
              <div className="border-b border-[var(--theme-gray-border)] pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--theme-surface-raised)] border border-black/20 text-slate-300">
                    {activeRubric.subject}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Total Possible: {calculateMaxPoints(activeRubric)} points
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-100">{activeRubric.title}</h3>
                {activeRubric.description && (
                  <p className="text-xs text-slate-400 mt-1">{activeRubric.description}</p>
                )}
              </div>

              {/* Rubric Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)]">
                      <th className="p-3 border-r border-black font-black uppercase w-1/4">
                        Criteria
                      </th>
                      <th className="p-3 border-r border-black font-black uppercase text-center w-[18%]">
                        Exemplary (4)
                      </th>
                      <th className="p-3 border-r border-black font-black uppercase text-center w-[18%]">
                        Proficient (3)
                      </th>
                      <th className="p-3 border-r border-black font-black uppercase text-center w-[18%]">
                        Developing (2)
                      </th>
                      <th className="p-3 font-black uppercase text-center w-[18%]">
                        Beginning (1)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--theme-gray-border)]">
                    {activeRubric.criteria?.map((crit, idx) => (
                      <tr key={crit.id || idx} className="hover:bg-neutral-50">
                        <td className="p-3 font-black border-r border-black/20 align-top">
                          {crit.title}
                          <span className="block text-[10px] text-neutral-400 font-normal mt-0.5">
                            Weight: {crit.weight || 1}x
                          </span>
                        </td>
                        {crit.levels.map((lvl) => (
                          <td
                            key={lvl.id}
                            className="p-3 border-r border-black/10 text-slate-300 align-top leading-relaxed"
                          >
                            <span className="font-bold text-[11px] block text-slate-100 mb-1">
                              {lvl.name} ({lvl.points} pts)
                            </span>
                            {lvl.description}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
              <Table className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">Select a rubric to view or print</p>
            </div>
          )}
        </div>
      </div>

      {/* New Rubric Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-lg font-black">Create Grading Rubric</h3>
            <form onSubmit={handleSaveRubric} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. English Literature, Computer Science"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Rubric Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Research Paper Assessment Rubric"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                >
                  Save Rubric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
