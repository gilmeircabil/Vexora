import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Download,
  BookOpen,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';
import type { TeacherClassItem } from './AttendanceTracker.js';

export interface CategoryItem {
  id: string;
  name: string;
  weight: number;
}

export interface AssignmentItem {
  id: string;
  name: string;
  categoryId: string;
  maxPoints: number;
  date?: string;
}

export interface GradeItem {
  studentId: string;
  assignmentId: string;
  score: number;
}

export const TeacherGradebookView: React.FC = () => {
  const [classes, setClasses] = useState<TeacherClassItem[]>([]);
  const [activeClass, setActiveClass] = useState<TeacherClassItem | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newAssign, setNewAssign] = useState({
    name: '',
    categoryId: '',
    maxPoints: 100,
  });

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', weight: 20 });

  const loadClassesAndGradebook = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getClasses();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setClasses(res.data);
        const cls = activeClass || res.data[0];
        setActiveClass(cls);

        const gbRes = await educationApi.getGradebook(cls._id);
        if (gbRes.success && gbRes.data) {
          setCategories(gbRes.data.categories || []);
          setAssignments(gbRes.data.assignments || []);
          setGrades(gbRes.data.grades || []);
        }
      }
    } catch (e) {
      console.error('Failed to load gradebook', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClassesAndGradebook();
  }, []);

  const handleSelectClass = async (cls: TeacherClassItem) => {
    setActiveClass(cls);
    setIsLoading(true);
    const gbRes = await educationApi.getGradebook(cls._id);
    if (gbRes.success && gbRes.data) {
      setCategories(gbRes.data.categories || []);
      setAssignments(gbRes.data.assignments || []);
      setGrades(gbRes.data.grades || []);
    }
    setIsLoading(false);
  };

  const handleScoreChange = async (studentId: string, assignmentId: string, score: number) => {
    const existingIdx = grades.findIndex(
      (g) => g.studentId === studentId && g.assignmentId === assignmentId,
    );

    const updatedGrades = [...grades];
    if (existingIdx >= 0) {
      updatedGrades[existingIdx] = { studentId, assignmentId, score };
    } else {
      updatedGrades.push({ studentId, assignmentId, score });
    }

    setGrades(updatedGrades);

    if (activeClass) {
      await educationApi.updateGradebook(activeClass._id, {
        categories,
        assignments,
        grades: updatedGrades,
      });
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssign.name.trim() || !activeClass) return;

    const catId = newAssign.categoryId || categories[0]?.id || 'cat-1';
    const updatedAssignments: AssignmentItem[] = [
      ...assignments,
      {
        id: 'assign-' + Date.now(),
        name: newAssign.name.trim(),
        categoryId: catId,
        maxPoints: Number(newAssign.maxPoints) || 100,
      },
    ];

    setAssignments(updatedAssignments);
    setIsAssignModalOpen(false);
    setNewAssign({ name: '', categoryId: '', maxPoints: 100 });

    await educationApi.updateGradebook(activeClass._id, {
      categories,
      assignments: updatedAssignments,
      grades,
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim() || !activeClass) return;

    const updatedCategories: CategoryItem[] = [
      ...categories,
      {
        id: 'cat-' + Date.now(),
        name: newCat.name.trim(),
        weight: Number(newCat.weight) || 10,
      },
    ];

    setCategories(updatedCategories);
    setIsCategoryModalOpen(false);
    setNewCat({ name: '', weight: 20 });

    await educationApi.updateGradebook(activeClass._id, {
      categories: updatedCategories,
      assignments,
      grades,
    });
  };

  // Calculate weighted student overall grade
  const calculateStudentOverall = (studentId: string): { percentage: number; letter: string } => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    categories.forEach((cat) => {
      const catAssignments = assignments.filter((a) => a.categoryId === cat.id);
      if (catAssignments.length === 0) return;

      let catPointsScored = 0;
      let catPointsMax = 0;

      catAssignments.forEach((a) => {
        const match = grades.find((g) => g.studentId === studentId && g.assignmentId === a.id);
        if (match !== undefined) {
          catPointsScored += match.score;
          catPointsMax += a.maxPoints;
        }
      });

      if (catPointsMax > 0) {
        const catRatio = catPointsScored / catPointsMax;
        totalWeightedScore += catRatio * cat.weight;
        totalWeight += cat.weight;
      }
    });

    if (totalWeight === 0) return { percentage: 0, letter: 'N/A' };
    const pct = Math.round((totalWeightedScore / totalWeight) * 100);

    let letter = 'F';
    if (pct >= 90) letter = 'A';
    else if (pct >= 80) letter = 'B';
    else if (pct >= 70) letter = 'C';
    else if (pct >= 60) letter = 'D';

    return { percentage: pct, letter };
  };

  // Export full gradebook to CSV
  const handleExportCSV = () => {
    if (!activeClass) return;

    let csv =
      'Student ID,Student Name,' +
      assignments.map((a) => `"${a.name} (${a.maxPoints})"`).join(',') +
      ',Overall %,Grade\n';

    activeClass.students.forEach((student) => {
      const scores = assignments.map((a) => {
        const m = grades.find((g) => g.studentId === student.id && g.assignmentId === a.id);
        return m !== undefined ? m.score : '';
      });
      const { percentage, letter } = calculateStudentOverall(student.id);

      csv +=
        `"${student.studentIdNumber || ''}","${student.name}",` +
        scores.join(',') +
        `,${percentage}%,${letter}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradebook-${activeClass.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Teacher Gradebook & Score Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Weighted category calculations, real-time assignment grading, and instant progress
            reporting.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeClass && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3.5 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] hover:bg-neutral-100"
              >
                Categories ({categories.length})
              </button>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add Assignment
              </button>
            </>
          )}
        </div>
      </div>

      {/* Class Switcher */}
      {classes.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto bg-[var(--theme-surface-raised)] p-3 rounded-2xl border border-[var(--theme-gray-border)] pb-2">
          <span className="text-xs font-black uppercase text-slate-400">Active Class:</span>
          {classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => handleSelectClass(cls)}
              className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black shrink-0 transition-all cursor-pointer ${
                activeClass?._id === cls._id
                  ? 'border-black bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-sm'
                  : 'border-neutral-300 bg-[var(--theme-surface)] hover:border-black'
              }`}
            >
              {cls.name} ({cls.students?.length || 0})
            </button>
          ))}
        </div>
      )}

      {/* Main Gradebook Grid */}
      {activeClass ? (
        <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-3">
            <div>
              <h3 className="text-base font-black text-slate-100">{activeClass.name} Ledger</h3>
              <p className="text-xs text-slate-400">
                {activeClass.students.length} students enrolled • {assignments.length} assignments
              </p>
            </div>

            {/* Category weights badge list */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              {categories.map((c) => (
                <span
                  key={c.id}
                  className="text-[10px] font-black px-2 py-0.5 bg-[var(--theme-surface-raised)] rounded border border-black/20"
                >
                  {c.name}: {c.weight}%
                </span>
              ))}
            </div>
          </div>

          {activeClass.students.length === 0 ? (
            <div className="text-center py-12 text-xs font-bold text-slate-400">
              No students enrolled in this class. Add students from the Attendance / Roster Tracker.
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-xl space-y-2">
              <p className="text-xs font-bold text-slate-400">No assignments created yet</p>
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="px-4 py-1.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-black"
              >
                Create First Assignment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--theme-gray-border)] text-slate-400 uppercase tracking-wider font-black">
                    <th className="py-2.5 px-3 sticky left-0 bg-[var(--theme-surface)] z-10">Student</th>
                    {assignments.map((a) => {
                      const cat = categories.find((c) => c.id === a.categoryId);
                      return (
                        <th key={a.id} className="py-2.5 px-3 min-w-[120px]">
                          <div>{a.name}</div>
                          <div className="text-[10px] text-neutral-400 font-normal">
                            Max: {a.maxPoints} ({cat?.name || 'General'})
                          </div>
                        </th>
                      );
                    })}
                    <th className="py-2.5 px-3 text-right bg-neutral-50">Overall Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {activeClass.students.map((student) => {
                    const { percentage, letter } = calculateStudentOverall(student.id);

                    return (
                      <tr key={student.id} className="hover:bg-neutral-50 font-medium">
                        <td className="py-2.5 px-3 font-bold text-slate-100 sticky left-0 bg-[var(--theme-surface)] z-10 border-r border-neutral-100">
                          {student.name}
                        </td>
                        {assignments.map((a) => {
                          const match = grades.find(
                            (g) => g.studentId === student.id && g.assignmentId === a.id,
                          );
                          const val = match !== undefined ? match.score : '';

                          return (
                            <td key={a.id} className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0"
                                max={a.maxPoints * 1.5}
                                value={val}
                                onChange={(e) =>
                                  handleScoreChange(
                                    student.id,
                                    a.id,
                                    e.target.value === '' ? 0 : Number(e.target.value),
                                  )
                                }
                                placeholder="—"
                                className="w-16 px-2 py-1 border border-neutral-300 rounded font-bold text-center focus:border-black focus:outline-none"
                              />
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-right bg-neutral-50 font-black">
                          <span className="text-sm">{percentage}%</span>{' '}
                          <span className="text-[11px] text-[var(--theme-dirty-white)]">({letter})</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-400">
            Create or select a class to view the gradebook
          </p>
        </div>
      )}

      {/* Add Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black">Add Assignment</h3>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Assignment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 Test, Chapter 5 Homework"
                  value={newAssign.name}
                  onChange={(e) => setNewAssign({ ...newAssign, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newAssign.categoryId}
                    onChange={(e) => setNewAssign({ ...newAssign, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold bg-[var(--theme-surface)] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.weight}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Max Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newAssign.maxPoints}
                    onChange={(e) =>
                      setNewAssign({ ...newAssign, maxPoints: Number(e.target.value) || 100 })
                    }
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm"
                >
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black">Grading Categories</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-2 bg-[var(--theme-surface-raised)] rounded-lg border border-black/20 flex items-center justify-between text-xs font-bold"
                >
                  <span>{c.name}</span>
                  <span>{c.weight}%</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCategory} className="border-t border-black/10 pt-3 space-y-3">
              <h4 className="text-xs font-black uppercase">Add New Category</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Category Name"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="px-3 py-1.5 border border-black rounded-lg text-xs"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Weight %"
                  value={newCat.weight}
                  onChange={(e) => setNewCat({ ...newCat, weight: Number(e.target.value) || 20 })}
                  className="px-3 py-1.5 border border-black rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-1.5 border border-black rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-black"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
