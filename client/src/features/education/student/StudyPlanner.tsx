import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Filter,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';

export interface TaskItem {
  _id: string;
  subject: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string | null;
}

export const StudyPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'daily' | 'weekly'>('list');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    deadline: '',
  });

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const res = await educationApi.getTasks({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        subject: selectedSubject !== 'all' ? selectedSubject : undefined,
      });
      if (res.success && Array.isArray(res.data)) {
        setTasks(res.data);
      }
    } catch (e) {
      console.error('Failed to load study tasks', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter, selectedSubject]);

  const allSubjects = Array.from(new Set(tasks.map((t) => t.subject).filter(Boolean)));

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      subject: '',
      title: '',
      description: '',
      priority: 'medium',
      deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] ?? '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      subject: task.subject,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline ? (new Date(task.deadline).toISOString().split('T')[0] ?? '') : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim()) return;

    if (editingTask) {
      await educationApi.updateTask(editingTask._id, formData);
    } else {
      await educationApi.createTask(formData);
    }
    setIsModalOpen(false);
    loadTasks();
  };

  const handleToggleComplete = async (task: TaskItem) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    await educationApi.updateTask(task._id, { status: nextStatus });
    loadTasks();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this study task?')) {
      await educationApi.deleteTask(id);
      loadTasks();
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filter tasks based on viewMode
  const getFilteredTasks = () => {
    const now = new Date();
    if (viewMode === 'daily') {
      const todayStr = now.toISOString().split('T')[0] ?? '';
      return tasks.filter((t) => t.deadline && todayStr && t.deadline.startsWith(todayStr));
    }
    if (viewMode === 'weekly') {
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      return tasks.filter((t) => {
        if (!t.deadline) return false;
        const d = new Date(t.deadline);
        return d >= now && d <= nextWeek;
      });
    }
    return tasks;
  };

  const visibleTasks = getFilteredTasks();

  const priorityColor = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-amber-400 text-slate-100';
      case 'medium':
        return 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]';
      default:
        return 'bg-neutral-200 text-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            Study Planner
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize study schedules, track deadlines, and maintain learning momentum.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[var(--theme-surface-raised)] p-1 rounded-xl border border-black text-xs font-bold">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'daily'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'weekly'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              This Week
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Task
          </button>
        </div>
      </div>

      {/* Progress & Stats Bar: Single Divided Minimal Row */}
      <div className="bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] p-3.5 shadow-sm grid grid-cols-3 divide-x-2 divide-[var(--theme-gray-border)]">
        <div className="flex items-center justify-between pr-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Completion Rate
            </span>
            <p className="text-xl font-black mt-0.5">{progressPercent}%</p>
          </div>
          <div className="w-14 h-2 bg-neutral-100 border border-black rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-[#4ADE80] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="px-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Pending
            </span>
            <p className="text-xl font-black mt-0.5 text-amber-600">{pendingCount}</p>
          </div>
          <Clock className="w-4 h-4 text-neutral-400 hidden sm:block" />
        </div>

        <div className="pl-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Completed
            </span>
            <p className="text-xl font-black mt-0.5 text-emerald-600">{completedCount}</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 hidden sm:block" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--theme-surface-raised)] p-3 rounded-xl border border-black/20 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--theme-surface)] border border-black rounded-lg px-2.5 py-1 font-medium text-xs cursor-pointer focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[var(--theme-surface)] border border-black rounded-lg px-2.5 py-1 font-medium text-xs cursor-pointer focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {allSubjects.length > 0 && (
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-[var(--theme-surface)] border border-black rounded-lg px-2.5 py-1 font-medium text-xs cursor-pointer focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {allSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="text-center py-12 text-sm font-bold text-slate-400">
          Loading your study tasks...
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="bg-[var(--theme-surface)] p-12 text-center rounded-2xl border-2 border-dashed border-neutral-300">
          <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-300">No study tasks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {tasks.length === 0
              ? 'Get started by creating your first study task or assignment deadline.'
              : 'Try clearing your filters to see more tasks.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-black shadow-sm"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleTasks.map((task) => (
            <div
              key={task._id}
              className={`p-4 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                task.status === 'completed'
                  ? 'bg-neutral-50 border-neutral-300 opacity-75'
                  : 'shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="mt-0.5 hover:scale-110 transition-transform cursor-pointer"
                  title="Mark task completed"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <div className="w-5 h-5 rounded-md border border-[var(--theme-gray-border)] bg-[var(--theme-surface)]" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-[var(--theme-surface-raised)] border border-black/30 text-slate-300">
                      {task.subject}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border border-black/20 ${priorityColor(
                        task.priority,
                      )}`}
                    >
                      {task.priority}
                    </span>
                    {task.deadline && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h4
                    className={`font-black text-sm mt-1 text-slate-100 ${
                      task.status === 'completed' ? 'line-through text-neutral-400' : ''
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black mb-4">
              {editingTask ? 'Edit Study Task' : 'Create New Study Task'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus, Physics, Literature"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD21A]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Problem Set 4, Read Chapter 7"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD21A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e: any) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional details, page numbers, or links"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-gray-border)] rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-black text-xs rounded-xl border border-[var(--theme-gray-border)] shadow-sm hover:-translate-y-0.5 transition-transform"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
