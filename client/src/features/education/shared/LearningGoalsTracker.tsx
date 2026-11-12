import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, CheckCircle2, Calendar, Sparkles, BookOpen } from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';

export interface MilestoneItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface GoalItem {
  _id: string;
  title: string;
  subject?: string;
  targetDate?: string;
  progressPercent: number;
  isCompleted: boolean;
  milestones: MilestoneItem[];
}

export const LearningGoalsTracker: React.FC = () => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '',
    subject: 'General',
    targetDate: '',
    milestones: ['', '', ''],
  });

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getGoals();
      if (res.success && Array.isArray(res.data)) {
        setGoals(res.data);
      }
    } catch (e) {
      console.error('Failed to load learning goals', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    const formattedMilestones = newGoal.milestones
      .filter((m) => m.trim().length > 0)
      .map((m, i) => ({
        id: 'm-' + Date.now() + '-' + i,
        title: m.trim(),
        completed: false,
      }));

    const res = await educationApi.createGoal({
      title: newGoal.title.trim(),
      subject: newGoal.subject.trim() || 'General',
      targetDate: newGoal.targetDate || undefined,
      milestones: formattedMilestones,
    });

    if (res.success) {
      setIsModalOpen(false);
      setNewGoal({ title: '', subject: 'General', targetDate: '', milestones: ['', '', ''] });
      loadGoals();
    }
  };

  const handleToggleMilestone = async (goal: GoalItem, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m,
    );

    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progressPercent = Math.round((completedCount / updatedMilestones.length) * 100);
    const isCompleted = progressPercent === 100;

    await educationApi.updateGoal(goal._id, {
      milestones: updatedMilestones,
      progressPercent,
      isCompleted,
    });
    loadGoals();
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm('Delete this goal?')) {
      await educationApi.deleteGoal(id);
      loadGoals();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2 text-[var(--theme-dirty-white)]">
            <Target className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Learning Goals & Milestone Progress
          </h2>
          <p className="text-xs text-[var(--theme-gray-muted)] mt-0.5">
            Define target academic milestones and track your journey toward mastery.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-bold text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          New Goal
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs font-bold text-[var(--theme-gray-muted)]">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border border-[var(--theme-gray-border)]">
          <Target className="w-12 h-12 text-[var(--theme-gray-muted)] mx-auto mb-2" />
          <h3 className="font-bold text-[var(--theme-dirty-white)]">No learning goals defined</h3>
          <p className="text-xs text-[var(--theme-gray-muted)] mt-1">
            Set a tangible goal to stay motivated throughout the term.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-bold text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-xs cursor-pointer"
          >
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div
              key={goal._id}
              className={`p-5 rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] shadow-sm flex flex-col justify-between ${
                goal.isCompleted ? 'border-emerald-500/50 bg-[var(--theme-surface-raised)]' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)]">
                    {goal.subject || 'General'}
                  </span>
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="p-1 text-[var(--theme-gray-muted)] hover:text-red-400 cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-bold text-base text-[var(--theme-dirty-white)]">{goal.title}</h3>

                {goal.targetDate && (
                  <span className="text-[11px] text-[var(--theme-gray-muted)] flex items-center gap-1 font-medium mt-1">
                    <Calendar className="w-3 h-3" />
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                )}

                {/* Progress bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--theme-dirty-white)]">
                    <span>Progress</span>
                    <span>{goal.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[var(--theme-surface-raised)] h-2 rounded-full border border-[var(--theme-gray-border)] overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${goal.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mt-4 space-y-1.5 border-t border-[var(--theme-gray-border)] pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-gray-muted)] block mb-1">
                      Milestones
                    </span>
                    {goal.milestones.map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-[var(--theme-dirty-white-muted)] hover:text-[var(--theme-dirty-white)]"
                      >
                        <input
                          type="checkbox"
                          checked={m.completed}
                          onChange={() => handleToggleMilestone(goal, m.id)}
                          className="rounded border-[var(--theme-gray-border)] w-3.5 h-3.5"
                        />
                        <span className={m.completed ? 'line-through text-[var(--theme-gray-muted)]' : ''}>
                          {m.title}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-lg w-full max-w-md p-6 space-y-4 text-[var(--theme-dirty-white)]">
            <h3 className="text-lg font-bold text-[var(--theme-dirty-white)]">Define Learning Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--theme-gray-muted)] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Calculus, Physics, Spanish"
                  value={newGoal.subject}
                  onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--theme-gray-muted)] mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Derivatives & Integrals by Midterm"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--theme-gray-muted)] mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--theme-gray-muted)] mb-1">
                  Key Milestones (Sub-tasks)
                </label>
                <div className="space-y-2">
                  {newGoal.milestones.map((m, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Milestone #${i + 1}`}
                      value={m}
                      onChange={(e) => {
                        const updated = [...newGoal.milestones];
                        updated[i] = e.target.value;
                        setNewGoal({ ...newGoal, milestones: updated });
                      }}
                      className="w-full px-3 py-1.5 border border-[var(--theme-gray-border)] rounded-lg text-xs bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--theme-gray-border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] font-bold text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-xs cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
