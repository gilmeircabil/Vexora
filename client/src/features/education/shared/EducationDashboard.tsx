import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Quote,
  Target,
  FileCheck,
  Award,
  Users,
  Table,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileQuestion,
  FileText,
  FileCode,
  School,
} from 'lucide-react';
import { educationApi } from '../../../services/educationApi.js';
import { useAuth } from '../../../context/AuthContext.js';

interface DashboardStats {
  pendingTasks: number;
  completedTasks: number;
  deckCount: number;
  noteCount: number;
  activeGoals: number;
  recentAttempts: any[];
  recentSessions: any[];
  totalStudyMinutes: number;
  lessonPlanCount?: number;
  worksheetCount?: number;
  examCount?: number;
  gradebookCount?: number;
}

interface EducationDashboardProps {
  onSelectTool: (toolId: string) => void;
  activeRole: 'student' | 'teacher' | 'educator';
  onRoleChange: (role: 'student' | 'teacher' | 'educator') => void;
  workspace?: 'student' | 'teacher';
}

export const EducationDashboard: React.FC<EducationDashboardProps> = ({
  onSelectTool,
  activeRole,
  onRoleChange,
  workspace,
}) => {
  const { user, refreshUser } = useAuth();
  const currentWorkspace =
    workspace ||
    (user?.educationRole === 'teacher' ||
    user?.educationRole === 'educator' ||
    activeRole === 'teacher' ||
    activeRole === 'educator'
      ? 'teacher'
      : 'student');
  const [stats, setStats] = useState<DashboardStats>({
    pendingTasks: 0,
    completedTasks: 0,
    deckCount: 0,
    noteCount: 0,
    activeGoals: 0,
    recentAttempts: [],
    recentSessions: [],
    totalStudyMinutes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const res = await educationApi.getDashboardSummary();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard summary', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const handleSwitchRole = async (targetRole: 'student' | 'teacher' | 'educator') => {
    const res = await educationApi.updateEducationRole(targetRole);
    if (res.success) {
      onRoleChange(targetRole);
      if (refreshUser) refreshUser();
    }
  };

  // Badges / Achievements
  const achievements = [
    {
      id: 'badge-1',
      title: 'Study Starter',
      desc: 'Created study assignments',
      unlocked: stats.pendingTasks + stats.completedTasks > 0,
      icon: BookOpen,
      color: 'bg-emerald-400',
    },
    {
      id: 'badge-2',
      title: 'Active Recall',
      desc: 'Formed flashcard decks',
      unlocked: stats.deckCount > 0,
      icon: Layers,
      color: 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]',
    },
    {
      id: 'badge-3',
      title: 'Deep Focus',
      desc: 'Logged Pomodoro focus sessions',
      unlocked: stats.totalStudyMinutes >= 25,
      icon: Clock,
      color: 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]',
    },
    {
      id: 'badge-4',
      title: 'Quiz Master',
      desc: 'Completed practice assessments',
      unlocked: stats.recentAttempts?.length > 0,
      icon: HelpCircle,
      color: 'bg-purple-400',
    },
    {
      id: 'badge-5',
      title: 'Goal Oriented',
      desc: 'Established active learning goals',
      unlocked: stats.activeGoals > 0,
      icon: Target,
      color: 'bg-rose-400',
    },
  ];

  // Teacher Workspace Achievements
  const teacherAchievements = [
    {
      id: 'teacher-badge-1',
      title: 'Curriculum Architect',
      desc: 'Created structured lesson plans',
      unlocked: (stats.lessonPlanCount ?? 0) > 0 || stats.completedTasks > 0,
      icon: FileCheck,
      color: 'bg-emerald-400',
    },
    {
      id: 'teacher-badge-2',
      title: 'Material Author',
      desc: 'Generated printable worksheets',
      unlocked: (stats.worksheetCount ?? 0) > 0 || stats.deckCount > 0,
      icon: FileText,
      color: 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]',
    },
    {
      id: 'teacher-badge-3',
      title: 'Exam Builder',
      desc: 'Formed test assessments & keys',
      unlocked: (stats.examCount ?? 0) > 0 || stats.recentAttempts?.length > 0,
      icon: FileCode,
      color: 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]',
    },
    {
      id: 'teacher-badge-4',
      title: 'Class Coordinator',
      desc: 'Tracked attendance & rosters',
      unlocked: stats.recentSessions?.length > 0 || stats.totalStudyMinutes > 0,
      icon: Users,
      color: 'bg-purple-400',
    },
    {
      id: 'teacher-badge-5',
      title: 'Certified Educator',
      desc: 'Issued student certificates',
      unlocked: stats.completedTasks > 0 || stats.activeGoals > 0,
      icon: Award,
      color: 'bg-rose-400',
    },
  ];

  const activeAchievements = currentWorkspace === 'teacher' ? teacherAchievements : achievements;

  return (
    <div className="space-y-5">
      {/* Top Header: Minimal Hero Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)]">
              Zero-Cost Education Suite
            </span>
            <span className="text-[11px] font-bold text-[var(--theme-gray-muted)]">
              Workspace:{' '}
              <strong className="text-[var(--theme-dirty-white)] capitalize">
                {currentWorkspace === 'teacher' ? 'Teacher' : 'Student'}
              </strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--theme-dirty-white)] tracking-tight">
            {currentWorkspace === 'teacher'
              ? `Teacher Workspace Dashboard${user ? `, ${user.name.split(' ')[0]}` : ''}`
              : `Student Workspace Dashboard${user ? `, ${user.name.split(' ')[0]}` : ''}`}
          </h2>
          <p className="text-xs text-[var(--theme-gray-muted)] font-medium max-w-xl">
            {currentWorkspace === 'teacher'
              ? 'Curriculum design, automated exam builder, printable student worksheets, rubric builder, and gradebook tracking.'
              : 'Active recall, weighted GPA calculations, schedules, flashcard decks, and learning goals.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] shadow-xs">
            {currentWorkspace === 'teacher' ? 'Teacher Mode Active' : 'Student Mode Active'}
          </span>
        </div>
      </div>

      {/* KPI Overview: Workspace Specific Telemetry Strip */}
      {currentWorkspace === 'teacher' ? (
        <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] p-4 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-[var(--theme-gray-border)]">
          <div
            onClick={() => onSelectTool('lesson-plans')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--theme-gray-muted)] block">
              Lesson Plans
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--theme-dirty-white)] mt-0.5">
              {stats.lessonPlanCount ?? stats.pendingTasks}
            </div>
            <span className="text-[11px] text-amber-400 font-bold">Curriculum design &rarr;</span>
          </div>

          <div
            onClick={() => onSelectTool('worksheets')}
            className="pt-3 sm:pt-0 sm:pl-5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--theme-gray-muted)] block">
              Worksheets
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--theme-dirty-white)] mt-0.5">
              {stats.worksheetCount ?? stats.deckCount}
            </div>
            <span className="text-[11px] text-[var(--theme-dirty-white)] font-bold">
              Printable activities &rarr;
            </span>
          </div>

          <div
            onClick={() => onSelectTool('exams')}
            className="pt-3 sm:pt-0 sm:pl-5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--theme-gray-muted)] block">
              Exams & Tests
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--theme-dirty-white)] mt-0.5">
              {stats.examCount ?? stats.noteCount}
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">Build assessments &rarr;</span>
          </div>

          <div
            onClick={() => onSelectTool('gradebook')}
            className="pt-3 sm:pt-0 sm:pl-5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--theme-gray-muted)] block">
              Gradebook Ledger
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--theme-dirty-white)] mt-0.5">
              {stats.gradebookCount ?? (stats.totalStudyMinutes > 0 ? 1 : 0)}
            </div>
            <span className="text-[11px] text-purple-400 font-bold">Scores & mastery &rarr;</span>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] p-4 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-[var(--theme-gray-border)]">
          <div
            onClick={() => onSelectTool('study-planner')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--theme-gray-muted)] block">
              Pending Tasks
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--theme-dirty-white)] mt-0.5">
              {stats.pendingTasks}
            </div>
            <span className="text-[11px] text-[var(--theme-gray-muted)] font-medium">
              {stats.completedTasks} completed
            </span>
          </div>

          <div
            onClick={() => onSelectTool('flashcards')}
            className="pt-3 sm:pt-0 sm:pl-5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--theme-gray-muted)] block">
              Flashcard Decks
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--theme-dirty-white)] mt-0.5">
              {stats.deckCount}
            </div>
            <span className="text-[11px] text-[var(--theme-dirty-white)] font-bold">Study & Review &rarr;</span>
          </div>

          <div
            onClick={() => onSelectTool('smart-notes')}
            className="pt-3 sm:pt-0 sm:pl-5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--theme-gray-muted)] block">
              Study Notes
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--theme-dirty-white)] mt-0.5">
              {stats.noteCount}
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">Capture notes &rarr;</span>
          </div>

          <div
            onClick={() => onSelectTool('pomodoro')}
            className="pt-3 sm:pt-0 sm:pl-5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--theme-gray-muted)] block">
              Total Focus Time
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--theme-dirty-white)] mt-0.5">
              {stats.totalStudyMinutes}m
            </div>
            <span className="text-[11px] text-amber-400 font-bold">Pomodoro timer &rarr;</span>
          </div>
        </div>
      )}

      {/* Quick Tool Launchpad: Minimal Compact Tiles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[var(--theme-dirty-white)] uppercase tracking-wider">
            {currentWorkspace === 'teacher' ? 'Teacher Curriculum Launchpad' : 'Quick Launchpad'}
          </h3>
          <span className="text-[11px] text-[var(--theme-gray-muted)] font-bold">
            {currentWorkspace === 'teacher' ? '8 Tools' : '9 Tools'}
          </span>
        </div>

        {currentWorkspace === 'teacher' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => onSelectTool('lesson-plans')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-amber-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Lesson Plans</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Curriculum Design</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('worksheets')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-[var(--theme-dirty-white)]">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Worksheets</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Printable Activities</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('exams')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-emerald-400">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Exam Builder</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Tests & Keys</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('attendance')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-[var(--theme-dirty-white)]">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Attendance</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Rosters & Roll</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('gradebook')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-purple-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Gradebook</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Scores & Mastery</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('rubrics')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-rose-400">
                <Table className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Rubrics</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Scoring Guides</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('certificates')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Certificates</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">PDF Diplomas</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('backup')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Data Backup</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Export & Purge</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => onSelectTool('study-planner')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-[var(--theme-dirty-white)]">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Study Planner</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Tasks & Deadlines</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('flashcards')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Flashcard Maker</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Leitner System</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('quizzes')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-emerald-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Practice Tests</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Instant Grading</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('doc-quiz')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-[var(--theme-dirty-white)]">
                <FileQuestion className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Doc to Quiz</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Auto-generate tests</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('grade-calculator')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-purple-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">GPA Calculator</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Weighted Grades</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('citations')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-rose-400">
                <Quote className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Citations</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">APA, MLA, IEEE</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('timetable')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-cyan-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Timetable</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Weekly Schedule</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('goals')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-amber-400">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Goals Tracker</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Milestones</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('backup')}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--theme-surface)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-dirty-white)]/40 hover:bg-[var(--theme-surface-raised)] hover:shadow-xs text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-[var(--theme-dirty-white)] group-hover:text-white truncate">Data Backup</h4>
                <p className="text-[10px] text-[var(--theme-gray-muted)] truncate">Export & Purge</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Learning / Curriculum Achievements: Minimal Inline Badges */}
      <div className="bg-[var(--theme-surface)] p-4 rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[var(--theme-dirty-white)] flex items-center gap-1.5 uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-500" />
            <span>
              {currentWorkspace === 'teacher' ? 'Curriculum Milestones' : 'Learning Milestones'}
            </span>
          </h3>
          <span className="text-[11px] font-bold text-[var(--theme-gray-muted)]">
            {activeAchievements.filter((a) => a.unlocked).length} of {activeAchievements.length}{' '}
            Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {activeAchievements.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                  badge.unlocked
                    ? 'border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] shadow-xs'
                    : 'border-[var(--theme-gray-border)] bg-[var(--theme-surface)] opacity-40 grayscale'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0 ${badge.color}`}
                >
                  <Icon className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[11px] text-[var(--theme-dirty-white)] truncate">{badge.title}</h4>
                  <span className="text-[9px] font-medium text-[var(--theme-gray-muted)] block truncate">
                    {badge.unlocked ? 'Unlocked' : 'In Progress'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
