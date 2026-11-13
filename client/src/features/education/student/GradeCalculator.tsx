import React, { useState } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  Info,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext.js';

export interface AssessmentItem {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number; // percentage
}

export interface SubjectGrade {
  id: string;
  name: string;
  credits: number;
  assessments: AssessmentItem[];
}

export const GradeCalculator: React.FC = () => {
  const { showToast } = useToast();
  // Configurable grading scales
  const [scaleType, setScaleType] = useState<'4.0' | '4.3' | '5.0'>('4.0');

  // Subjects with their assessments
  const [subjects, setSubjects] = useState<SubjectGrade[]>([
    {
      id: 'sub-1',
      name: 'Calculus I',
      credits: 4,
      assessments: [
        { id: 'a-1', name: 'Homework & Assignments', score: 92, maxScore: 100, weight: 20 },
        { id: 'a-2', name: 'Midterm Exam', score: 85, maxScore: 100, weight: 35 },
        { id: 'a-3', name: 'Quizzes', score: 88, maxScore: 100, weight: 15 },
      ],
    },
    {
      id: 'sub-2',
      name: 'Computer Science 101',
      credits: 3,
      assessments: [
        { id: 'b-1', name: 'Programming Labs', score: 98, maxScore: 100, weight: 40 },
        { id: 'b-2', name: 'Midterm Project', score: 90, maxScore: 100, weight: 30 },
      ],
    },
  ]);

  const [activeSubjectId, setActiveSubjectId] = useState<string>('sub-1');

  // Target Grade Calculator State
  const [targetGoal, setTargetGoal] = useState<number>(90); // e.g. want 90%
  const [finalWeight, setFinalWeight] = useState<number>(30); // final is worth 30%

  // Calculate weighted percentage for a subject
  const calculateSubjectPercentage = (sub: SubjectGrade): number => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    sub.assessments.forEach((a) => {
      if (a.maxScore > 0 && a.weight > 0) {
        const itemPct = (a.score / a.maxScore) * 100;
        totalWeightedScore += itemPct * (a.weight / 100);
        totalWeight += a.weight;
      }
    });

    if (totalWeight === 0) return 0;
    // Normalized to 100% of assessed weight
    return Math.round((totalWeightedScore / totalWeight) * 100 * 10) / 10;
  };

  // Convert percentage to letter grade & GPA points
  const getLetterGradeAndPoints = (pct: number, scale: string) => {
    if (pct >= 93)
      return { letter: 'A', points: scale === '5.0' ? 5.0 : scale === '4.3' ? 4.3 : 4.0 };
    if (pct >= 90) return { letter: 'A-', points: scale === '5.0' ? 4.7 : 3.7 };
    if (pct >= 87) return { letter: 'B+', points: scale === '5.0' ? 4.3 : 3.3 };
    if (pct >= 83) return { letter: 'B', points: scale === '5.0' ? 4.0 : 3.0 };
    if (pct >= 80) return { letter: 'B-', points: scale === '5.0' ? 3.7 : 2.7 };
    if (pct >= 77) return { letter: 'C+', points: scale === '5.0' ? 3.3 : 2.3 };
    if (pct >= 73) return { letter: 'C', points: scale === '5.0' ? 3.0 : 2.0 };
    if (pct >= 70) return { letter: 'C-', points: scale === '5.0' ? 2.7 : 1.7 };
    if (pct >= 65) return { letter: 'D+', points: scale === '5.0' ? 2.3 : 1.3 };
    if (pct >= 60) return { letter: 'D', points: scale === '5.0' ? 2.0 : 1.0 };
    return { letter: 'F', points: 0.0 };
  };

  // Calculate Cumulative GPA across subjects
  const calculateOverallGpa = (): number => {
    let totalQualityPoints = 0;
    let totalCredits = 0;

    subjects.forEach((sub) => {
      const pct = calculateSubjectPercentage(sub);
      const { points } = getLetterGradeAndPoints(pct, scaleType);
      totalQualityPoints += points * sub.credits;
      totalCredits += sub.credits;
    });

    if (totalCredits === 0) return 0;
    return Math.round((totalQualityPoints / totalCredits) * 100) / 100;
  };

  // Target Grade Calculation: Target = CurrentWeightPct + FinalWeight * FinalScore
  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0];
  const activeSubjectCurrentPct = activeSubject ? calculateSubjectPercentage(activeSubject) : 0;
  const currentAssessedWeight = activeSubject
    ? activeSubject.assessments.reduce((acc, a) => acc + (a.weight || 0), 0)
    : 0;

  const calculateNeededFinalScore = (): number | string => {
    if (!activeSubject) return 0;
    const currentContribution = activeSubject.assessments.reduce((acc, a) => {
      return acc + (a.score / a.maxScore) * a.weight;
    }, 0);

    const needed = (targetGoal - currentContribution) / (finalWeight / 100);
    return Math.round(needed * 10) / 10;
  };

  const handleAddSubject = () => {
    const newSub: SubjectGrade = {
      id: 'sub-' + Date.now(),
      name: 'New Course',
      credits: 3,
      assessments: [
        { id: 'a-1', name: 'Assignments', score: 85, maxScore: 100, weight: 50 },
        { id: 'a-2', name: 'Exams', score: 90, maxScore: 100, weight: 50 },
      ],
    };
    setSubjects([...subjects, newSub]);
    setActiveSubjectId(newSub.id);
  };

  const handleDeleteSubject = (id: string) => {
    if (subjects.length <= 1) {
      showToast('You must have at least one subject.', 'error');
      return;
    }
    const filtered = subjects.filter((s) => s.id !== id);
    setSubjects(filtered);
    if (activeSubjectId === id && filtered.length > 0 && filtered[0]) {
      setActiveSubjectId(filtered[0].id);
    }
  };

  const handleAddAssessment = () => {
    if (!activeSubject) return;
    const newA: AssessmentItem = {
      id: 'item-' + Date.now(),
      name: 'New Assessment',
      score: 100,
      maxScore: 100,
      weight: 10,
    };
    const updated = subjects.map((s) =>
      s.id === activeSubject.id ? { ...s, assessments: [...s.assessments, newA] } : s,
    );
    setSubjects(updated);
  };

  const handleUpdateAssessment = (itemId: string, field: keyof AssessmentItem, val: any) => {
    if (!activeSubject) return;
    const updated = subjects.map((s) => {
      if (s.id !== activeSubject.id) return s;
      return {
        ...s,
        assessments: s.assessments.map((a) => (a.id === itemId ? { ...a, [field]: val } : a)),
      };
    });
    setSubjects(updated);
  };

  const handleDeleteAssessment = (itemId: string) => {
    if (!activeSubject) return;
    const updated = subjects.map((s) => {
      if (s.id !== activeSubject.id) return s;
      return {
        ...s,
        assessments: s.assessments.filter((a) => a.id !== itemId),
      };
    });
    setSubjects(updated);
  };

  const neededFinalScore = calculateNeededFinalScore();
  const overallGpa = calculateOverallGpa();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Grade & Weighted GPA Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculate accurate semester GPA, weighted course standings, and required final exam
            targets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[var(--theme-surface-raised)] px-3 py-1.5 rounded-xl border border-black text-xs font-bold">
            <span>Scale:</span>
            <select
              value={scaleType}
              onChange={(e: any) => setScaleType(e.target.value)}
              className="bg-transparent font-black cursor-pointer focus:outline-none"
            >
              <option value="4.0">Standard 4.0 Scale</option>
              <option value="4.3">4.3 Honors Scale</option>
              <option value="5.0">5.0 AP/IB Scale</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* GPA Summary: Minimal Divided Row */}
      <div className="bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-2 md:divide-[var(--theme-gray-border)] gap-3 md:gap-0">
        <div className="md:pr-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Cumulative GPA ({scaleType})
            </span>
            <p className="text-2xl font-black mt-0.5 text-slate-100">{overallGpa}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border border-[var(--theme-gray-border)] flex items-center justify-center font-black text-base shadow-sm">
            {getLetterGradeAndPoints(overallGpa * 25, scaleType).letter}
          </div>
        </div>

        <div className="pt-3 md:pt-0 md:px-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Credits Enrolled
            </span>
            <p className="text-2xl font-black mt-0.5 text-slate-100">
              {subjects.reduce((acc, s) => acc + (s.credits || 0), 0)}
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-neutral-400" />
        </div>

        <div className="pt-3 md:pt-0 md:pl-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Active Courses
            </span>
            <p className="text-2xl font-black mt-0.5 text-[var(--theme-dirty-white)]">{subjects.length}</p>
          </div>
          <button
            onClick={handleAddSubject}
            className="flex items-center gap-1 text-xs font-black bg-[#4ADE80] text-slate-100 px-2.5 py-1 rounded-lg border border-black shadow-sm hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Add Course
          </button>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {subjects.map((sub) => {
          const pct = calculateSubjectPercentage(sub);
          const { letter } = getLetterGradeAndPoints(pct, scaleType);
          const isActive = sub.id === activeSubject?.id;

          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              className={`px-4 py-2 rounded-xl border-2 text-xs font-black shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'border-black bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-sm'
                  : 'border-neutral-300 bg-[var(--theme-surface)] hover:border-black'
              }`}
            >
              <span>{sub.name}</span>
              <span className="bg-black/10 px-1.5 py-0.5 rounded text-[10px]">
                {pct}% ({letter})
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Subject Assessment Table */}
      {activeSubject && (
        <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--theme-gray-border)] pb-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={activeSubject.name}
                onChange={(e) => {
                  const updated = subjects.map((s) =>
                    s.id === activeSubject.id ? { ...s, name: e.target.value } : s,
                  );
                  setSubjects(updated);
                }}
                className="font-black text-lg border-b border-dashed border-neutral-400 focus:outline-none focus:border-black"
              />
              <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                <span>Credits:</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={activeSubject.credits}
                  onChange={(e) => {
                    const updated = subjects.map((s) =>
                      s.id === activeSubject.id
                        ? { ...s, credits: Number(e.target.value) || 1 }
                        : s,
                    );
                    setSubjects(updated);
                  }}
                  className="w-12 px-1.5 py-0.5 border border-black rounded text-center font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400">
                Current Standing:{' '}
                <strong className="text-slate-100 text-base">
                  {activeSubjectCurrentPct}% (
                  {getLetterGradeAndPoints(activeSubjectCurrentPct, scaleType).letter})
                </strong>
              </span>

              <button
                onClick={() => handleDeleteSubject(activeSubject.id)}
                className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                title="Delete this course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assessment Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--theme-gray-border)] text-slate-400 uppercase tracking-wider font-black">
                  <th className="py-2.5 px-3">Assessment Name</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Max Score</th>
                  <th className="py-2.5 px-3">Weight (%)</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {activeSubject.assessments.map((item) => {
                  const itemPct =
                    item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50 font-medium">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateAssessment(item.id, 'name', e.target.value)}
                          className="w-full border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none py-1"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={item.score}
                          onChange={(e) =>
                            handleUpdateAssessment(item.id, 'score', Number(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 border border-neutral-300 rounded font-bold text-center"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={item.maxScore}
                          onChange={(e) =>
                            handleUpdateAssessment(item.id, 'maxScore', Number(e.target.value) || 1)
                          }
                          className="w-20 px-2 py-1 border border-neutral-300 rounded font-bold text-center"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={item.weight}
                          onChange={(e) =>
                            handleUpdateAssessment(item.id, 'weight', Number(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 border border-neutral-300 rounded font-bold text-center"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-black text-neutral-800">{itemPct}%</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteAssessment(item.id)}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              onClick={handleAddAssessment}
              className="px-4 py-2 bg-[var(--theme-surface)] text-slate-100 font-black text-xs rounded-xl border border-[var(--theme-gray-border)] hover:bg-neutral-50 shadow-sm self-start"
            >
              + Add Assessment Item
            </button>

            <div className="text-xs font-bold text-slate-400">
              Total Assessed Weight:{' '}
              <span
                className={`font-black ${
                  currentAssessedWeight > 100 ? 'text-red-600' : 'text-neutral-900'
                }`}
              >
                {currentAssessedWeight}%
              </span>{' '}
              {currentAssessedWeight > 100 && '(Warning: Exceeds 100%)'}
            </div>
          </div>
        </div>
      )}

      {/* Target Grade Calculator */}
      <div className="bg-[var(--theme-surface-raised)] p-6 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-4">
        <h3 className="text-base font-black flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300" />
          Target Grade Calculator for {activeSubject?.name || 'Current Course'}
        </h3>
        <p className="text-xs text-slate-400">
          Find out what grade you need on your remaining final assignment or exam to achieve your
          desired course score.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-300 mb-1">
              Desired Target Grade (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={targetGoal}
              onChange={(e) => setTargetGoal(Number(e.target.value) || 90)}
              className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-black bg-[var(--theme-surface)]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-300 mb-1">
              Final Exam / Remaining Weight (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={finalWeight}
              onChange={(e) => setFinalWeight(Number(e.target.value) || 30)}
              className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-black bg-[var(--theme-surface)]"
            />
          </div>

          <div className="bg-[var(--theme-surface)] p-3 rounded-xl border border-[var(--theme-gray-border)] flex flex-col justify-center text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Required Score on Final
            </span>
            <span className="text-2xl font-black text-slate-100 mt-0.5">
              {Number(neededFinalScore) > 100 ? (
                <span className="text-red-600">{neededFinalScore}% (High)</span>
              ) : Number(neededFinalScore) <= 0 ? (
                <span className="text-emerald-600">Already Met! (0%)</span>
              ) : (
                <span className="text-[var(--theme-dirty-white)]">{neededFinalScore}%</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
