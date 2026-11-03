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
  const currentWorkspace = workspace || (activeRole === 'teacher' || activeRole === 'educator' ? 'teacher' : 'student');
  const { user, refreshUser } = useAuth();
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
      color: 'bg-[#FFD21A]',
    },
    {
      id: 'badge-3',
      title: 'Deep Focus',
      desc: 'Logged Pomodoro focus sessions',
      unlocked: stats.totalStudyMinutes >= 25,
      icon: Clock,
      color: 'bg-[#38BDF8]',
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

  return (
    <div className="space-y-5">
      {/* Top Header: Minimal Hero Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFD21A] border border-black text-black">
              Zero-Cost Education Suite
            </span>
            <span className="text-[11px] font-bold text-neutral-500">
              Role: <strong className="text-black capitalize">{activeRole}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            Study Space Dashboard{user ? `, ${user.name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-xs text-neutral-600 font-medium max-w-xl">
            Active recall, weighted GPA calculations, schedules, and curriculum planning tools.
          </p>
        </div>

        {/* Minimal Role Switcher */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-black self-start sm:self-auto shrink-0">
          <button
            onClick={() => handleSwitchRole('student')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'student'
                ? 'bg-black text-white font-black shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Student Mode
          </button>
          <button
            onClick={() => handleSwitchRole('teacher')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'teacher' || activeRole === 'educator'
                ? 'bg-[#FFD21A] text-black font-black border border-black shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            Teacher Mode
          </button>
        </div>
      </div>

      {/* KPI Overview: Unified Minimal Divided Telemetry Strip */}
      <div className="bg-white rounded-2xl border-2 border-black p-4 shadow-[3px_3px_0px_#000000] grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x-2 sm:divide-black/10">
        <div
          onClick={() => onSelectTool('study-planner')}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
            Pending Tasks
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black mt-0.5">
            {stats.pendingTasks}
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            {stats.completedTasks} completed
          </span>
        </div>

        <div
          onClick={() => onSelectTool('flashcards')}
          className="pt-3 sm:pt-0 sm:pl-5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
            Flashcard Decks
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black mt-0.5">{stats.deckCount}</div>
          <span className="text-[11px] text-indigo-600 font-bold">Study & Review &rarr;</span>
        </div>

        <div
          onClick={() => onSelectTool('smart-notes')}
          className="pt-3 sm:pt-0 sm:pl-5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
            Study Notes
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black mt-0.5">{stats.noteCount}</div>
          <span className="text-[11px] text-emerald-600 font-bold">Capture notes &rarr;</span>
        </div>

        <div
          onClick={() => onSelectTool('pomodoro')}
          className="pt-3 sm:pt-0 sm:pl-5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
            Total Focus Time
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black mt-0.5">
            {stats.totalStudyMinutes}m
          </div>
          <span className="text-[11px] text-amber-600 font-bold">Pomodoro timer &rarr;</span>
        </div>
      </div>

      {/* Quick Tool Launchpad: Minimal Compact Tiles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-black uppercase tracking-wider">
            {currentWorkspace === 'teacher' ? 'Teacher Curriculum Launchpad' : 'Quick Launchpad'}
          </h3>
          <span className="text-[11px] text-neutral-500 font-bold">
            {currentWorkspace === 'teacher' ? '8 Tools' : '9 Tools'}
          </span>
        </div>

        {currentWorkspace === 'teacher' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => onSelectTool('lesson-plans')}
              className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
                <FileCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs text-black truncate">Lesson Plans</h4>
                <p className="text-[10px] text-neutral-500 truncate">Curriculum Design</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('worksheets')}
              className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs text-black truncate">Worksheets</h4>
                <p className="text-[10px] text-neutral-500 truncate">Printable Activities</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('exams')}
              className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
                <FileCode className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs text-black truncate">Exam Builder</h4>
                <p className="text-[10px] text-neutral-500 truncate">Tests & Keys</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('attendance')}
              className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
                <Users className="w-4 h-4 text-sky-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs text-black truncate">Attendance</h4>
                <p className="text-[10px] text-neutral-500 truncate">Rosters & Roll</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('gradebook')}
              className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs text-black truncate">Gradebook</h4>
                <p className="text-[10px] text-neutral-500 truncate">Scores & Mastery</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('rubrics')}
              className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
                <Table className="w-4 h-4 text-rose-500" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs text-black truncate">Rubrics</h4>
                <p className="text-[10px] text-neutral-500 truncate">Scoring Guides</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('certificates')}
              className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFD21A] border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
                <Award className="w-4 h-4 text-black" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs text-black truncate">Certificates</h4>
                <p className="text-[10px] text-neutral-500 truncate">PDF Diplomas</p>
              </div>
            </button>

            <button
              onClick={() => onSelectTool('backup')}
              className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs text-black truncate">Data Backup</h4>
                <p className="text-[10px] text-neutral-500 truncate">Export & Purge</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onSelectTool('study-planner')}
            className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-black truncate">Study Planner</h4>
              <p className="text-[10px] text-neutral-500 truncate">Tasks & Deadlines</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTool('flashcards')}
            className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-black truncate">Flashcard Maker</h4>
              <p className="text-[10px] text-neutral-500 truncate">Leitner System</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTool('quizzes')}
            className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-black truncate">Practice Tests</h4>
              <p className="text-[10px] text-neutral-500 truncate">Instant Grading</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTool('doc-quiz')}
            className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
              <FileQuestion className="w-4 h-4 text-sky-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-black truncate">Doc to Quiz</h4>
              <p className="text-[10px] text-neutral-500 truncate">Auto-generate tests</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTool('grade-calculator')}
            className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-black truncate">GPA Calculator</h4>
              <p className="text-[10px] text-neutral-500 truncate">Weighted Grades</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTool('citations')}
            className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
              <Quote className="w-4 h-4 text-rose-500" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-black truncate">Citations</h4>
              <p className="text-[10px] text-neutral-500 truncate">APA, MLA, IEEE</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTool('timetable')}
            className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
              <Calendar className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-black truncate">Timetable</h4>
              <p className="text-[10px] text-neutral-500 truncate">Weekly Schedule</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTool('goals')}
            className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
              <Target className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-black truncate">Goals Tracker</h4>
              <p className="text-[10px] text-neutral-500 truncate">Milestones</p>
            </div>
          </button>

          <button
            onClick={() => onSelectTool('backup')}
            className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-black/30 hover:border-black hover:bg-[#FAF7F2] hover:shadow-[2px_2px_0px_#000000] text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-black/20 flex items-center justify-center shrink-0 group-hover:border-black">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-xs text-black truncate">Data Backup</h4>
              <p className="text-[10px] text-neutral-500 truncate">Export & Purge</p>
            </div>
          </button>
        </div>
        )}
      </div>

      {/* Learning Achievements: Minimal Inline Badges */}
      <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Learning Milestones</span>
          </h3>
          <span className="text-[11px] font-bold text-neutral-500">
            {achievements.filter((a) => a.unlocked).length} of {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {achievements.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                  badge.unlocked
                    ? 'border-black bg-[#FAF7F2] shadow-[1.5px_1.5px_0px_#000000]'
                    : 'border-neutral-200 bg-neutral-50 opacity-40 grayscale'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border border-black flex items-center justify-center shrink-0 ${badge.color}`}
                >
                  <Icon className="w-3.5 h-3.5 text-black" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-[11px] text-black truncate">{badge.title}</h4>
                  <span className="text-[9px] font-bold text-neutral-500 block truncate">
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
