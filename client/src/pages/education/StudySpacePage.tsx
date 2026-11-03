import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  GraduationCap,
  Calendar,
  Layers,
  HelpCircle,
  Calculator,
  FileText,
  Clock,
  Quote,
  Target,
  FileCheck,
  Award,
  Users,
  Table,
  FileCode,
  ShieldCheck,
  FileQuestion,
  X,
  School,
  BookOpen,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { educationApi } from '../../services/educationApi.js';
import { useFullscreenMode } from '../../features/education/shared/useFullscreenMode.js';
import { StudySpaceHeader } from '../../features/education/shared/StudySpaceHeader.js';

// Shared Components
import { EducationDashboard } from '../../features/education/shared/EducationDashboard.js';
import { LearningGoalsTracker } from '../../features/education/shared/LearningGoalsTracker.js';
import { DataExportImport } from '../../features/education/shared/DataExportImport.js';

// Document to Quiz Generator
import { DocumentQuizGenerator } from '../../features/education/doc-quiz/DocumentQuizGenerator.js';

// Student Workspace Modules
import { StudyPlanner } from '../../features/education/student/StudyPlanner.js';
import { FlashcardMaker } from '../../features/education/student/FlashcardMaker.js';
import { QuizMaker } from '../../features/education/student/QuizMaker.js';
import { GradeCalculator } from '../../features/education/student/GradeCalculator.js';
import { SmartNotes } from '../../features/education/student/SmartNotes.js';
import { PomodoroTimer } from '../../features/education/student/PomodoroTimer.js';
import { CitationGenerator } from '../../features/education/student/CitationGenerator.js';
import { TimetableGenerator } from '../../features/education/student/TimetableGenerator.js';

// Teacher Workspace Modules
import { LessonPlanCreator } from '../../features/education/teacher/LessonPlanCreator.js';
import { WorksheetGenerator } from '../../features/education/teacher/WorksheetGenerator.js';
import { ExamBuilder } from '../../features/education/teacher/ExamBuilder.js';
import { AttendanceTracker } from '../../features/education/teacher/AttendanceTracker.js';
import { TeacherGradebookView } from '../../features/education/teacher/TeacherGradebookView.js';
import { RubricBuilder } from '../../features/education/teacher/RubricBuilder.js';
import { CertificateGenerator } from '../../features/education/teacher/CertificateGenerator.js';

export const StudySpacePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine initial workspace from URL param or user's role
  const urlWorkspace = searchParams.get('workspace');
  const [workspace, setWorkspace] = useState<'student' | 'teacher'>(() => {
    if (urlWorkspace === 'student' || urlWorkspace === 'teacher') {
      return urlWorkspace;
    }
    return user?.educationRole === 'teacher' || user?.educationRole === 'educator'
      ? 'teacher'
      : 'student';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [educationRole, setEducationRole] = useState<'student' | 'teacher' | 'educator'>(() => {
    if (urlWorkspace === 'teacher') return 'teacher';
    if (urlWorkspace === 'student') return 'student';
    return (user?.educationRole as any) || (workspace === 'teacher' ? 'teacher' : 'student');
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { isFullscreen, toggleFullscreen } = useFullscreenMode();

  const isTeacherAuthorized =
    educationRole === 'teacher' ||
    educationRole === 'educator' ||
    user?.educationRole === 'teacher' ||
    user?.educationRole === 'educator' ||
    user?.role === 'admin';

  // Synchronize workspace changes with URL parameters and active role
  const handleWorkspaceChange = async (newWorkspace: 'student' | 'teacher') => {
    setWorkspace(newWorkspace);
    setEducationRole(newWorkspace);
    setActiveTab('dashboard');
    setIsMobileNavOpen(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('workspace', newWorkspace);
    setSearchParams(newParams, { replace: true });

    // Sync role change to user profile on server if logged in
    if (user && user.educationRole !== newWorkspace) {
      try {
        await educationApi.updateEducationRole(newWorkspace);
        if (refreshUser) {
          await refreshUser();
        }
      } catch (err) {
        console.error('Failed to sync education role change', err);
      }
    }
  };

  // Sync workspace and education role when URL search param changes
  useEffect(() => {
    const ws = searchParams.get('workspace');
    if (ws === 'student' || ws === 'teacher') {
      setWorkspace(ws);
      setEducationRole(ws);
    }
  }, [searchParams]);

  // Automatically activate Teacher Workspace when authenticated user has teacher or educator role
  useEffect(() => {
    if (!user) return;
    const isTeacher = user.educationRole === 'teacher' || user.educationRole === 'educator';
    const ws = searchParams.get('workspace');

    if (isTeacher && ws !== 'student') {
      setWorkspace('teacher');
      setEducationRole('teacher');
      if (ws !== 'teacher') {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('workspace', 'teacher');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [user, searchParams, setSearchParams]);

  const handleSelectTool = (toolId: string) => {
    setActiveTab(toolId);
    setIsMobileNavOpen(false);
  };

  // Student Navigation Items
  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
    { id: 'study-planner', label: 'Study Planner', icon: Calendar },
    { id: 'flashcards', label: 'Flashcard Maker', icon: Layers },
    { id: 'quizzes', label: 'Practice Tests & Quizzes', icon: HelpCircle },
    { id: 'doc-quiz', label: 'Document to Quiz', icon: FileQuestion, badge: 'Auto' },
    { id: 'grade-calculator', label: 'Grade & GPA Calculator', icon: Calculator },
    { id: 'smart-notes', label: 'Smart Notes', icon: FileText },
    { id: 'pomodoro', label: 'Focus Timer', icon: Clock },
    { id: 'citations', label: 'Citation Generator', icon: Quote },
    { id: 'timetable', label: 'Class Timetable', icon: Calendar },
    { id: 'goals', label: 'Learning Goals', icon: Target },
    { id: 'backup', label: 'Data Backup & Privacy', icon: ShieldCheck },
  ];

  // Teacher Navigation Items
  const teacherNavItems = [
    { id: 'dashboard', label: 'Teacher Dashboard', icon: School },
    { id: 'lesson-plans', label: 'Lesson Plan Creator', icon: FileCheck },
    { id: 'worksheets', label: 'Worksheet Generator', icon: FileText },
    { id: 'exams', label: 'Exam Builder', icon: FileCode },
    { id: 'attendance', label: 'Attendance Tracker', icon: Users },
    { id: 'gradebook', label: 'Gradebook Ledger', icon: GraduationCap },
    { id: 'rubrics', label: 'Rubric Builder', icon: Table },
    { id: 'certificates', label: 'Certificate Generator', icon: Award },
    { id: 'backup', label: 'Data Backup & Privacy', icon: ShieldCheck },
  ];

  const currentNavItems = workspace === 'student' ? studentNavItems : teacherNavItems;

  return (
    <div
      className={`w-full ${
        isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'
      } flex flex-col overflow-hidden bg-transparent select-text font-sans`}
    >
      {/* Top Header Strip with Workspace Switcher & Fullscreen Mode */}
      <StudySpaceHeader
        workspace={workspace}
        onWorkspaceChange={handleWorkspaceChange}
        activeTab={activeTab}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Mobile Navigation Drawer Backdrop */}
        {isMobileNavOpen && (
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
            aria-hidden="true"
          />
        )}

        {/* Dedicated Sidebar for Active Workspace */}
        <aside
          className={`fixed md:static top-0 bottom-0 left-0 z-50 md:z-10 bg-white/80 backdrop-blur-md border-r-2 border-black flex flex-col shrink-0 transition-all duration-200 ${
            isMobileNavOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
          } ${
            isSidebarCollapsed
              ? 'md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0 pointer-events-none md:pointer-events-none'
              : 'md:w-64 lg:w-72 md:opacity-100'
          }`}
        >
          {/* Mobile Drawer Header */}
          <div className="p-3 border-b-2 border-black flex items-center justify-between md:hidden bg-[#FAF7F2]">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-wider text-black">
                {workspace === 'student' ? 'Student Menu' : 'Teacher Menu'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[1px_1px_0px_#000]"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Workspace Identity Tag in Sidebar */}
          <div className="p-3 border-b border-black/10 bg-[#FAF7F2]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {workspace === 'student' ? (
                <BookOpen className="w-4 h-4 text-black stroke-[2.5]" />
              ) : (
                <School className="w-4 h-4 text-black stroke-[2.5]" />
              )}
              <span className="text-xs font-black uppercase tracking-wider text-black">
                {workspace === 'student' ? 'Student Workspace' : 'Teacher Workspace'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#FFD21A] text-black px-1.5 py-0.5 rounded border border-black/30">
              {currentNavItems.length} Tools
            </span>
          </div>

          {/* Navigation Items List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTool(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FFD21A] text-black font-black border-2 border-black shadow-[2px_2px_0px_#000]'
                      : 'text-neutral-700 hover:bg-neutral-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-black stroke-[2.5]' : 'text-neutral-600'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-black bg-[#4ADE80] text-black px-1.5 py-0.2 rounded border border-black/40 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Teacher Mode Authorization Status Bar (if in Teacher Workspace) */}
          {workspace === 'teacher' && !isTeacherAuthorized && (
            <div className="p-3 border-t-2 border-black bg-amber-50 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] font-black">Teacher Mode Required</span>
              </div>
              <p className="text-[10px] text-amber-800 leading-tight">
                Log in with a teacher account or enable teacher mode to create curriculum documents and manage student records.
              </p>
              <div className="flex flex-col gap-1.5">
                {!user && (
                  <Link
                    to="/login?redirect=/study?workspace=teacher"
                    className="w-full py-1.5 px-2 bg-[#FFD21A] text-black font-black text-xs rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000] text-center hover:bg-yellow-400 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <School className="w-3.5 h-3.5" />
                    <span>Log In as Teacher</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    setEducationRole('teacher');
                    if (user) {
                      try {
                        await educationApi.updateEducationRole('teacher');
                        if (refreshUser) {
                          await refreshUser();
                        }
                      } catch (err) {
                        console.error('Failed to activate teacher role', err);
                      }
                    }
                  }}
                  className="w-full py-1.5 px-2 bg-white text-black font-black text-xs rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer hover:bg-neutral-100 active:translate-y-0.5 transition-all"
                >
                  Enable Teacher Mode
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Content Canvas Area */}
        <main
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent"
          id="study-space-canvas"
        >
          <div className="max-w-6xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <EducationDashboard
                onSelectTool={handleSelectTool}
                activeRole={educationRole}
                onRoleChange={setEducationRole}
                workspace={workspace}
              />
            )}

            {/* Student Workspace Modules */}
            {workspace === 'student' && (
              <>
                {activeTab === 'study-planner' && <StudyPlanner />}
                {activeTab === 'flashcards' && <FlashcardMaker />}
                {activeTab === 'quizzes' && (
                  <QuizMaker onOpenDocQuiz={() => handleSelectTool('doc-quiz')} />
                )}
                {activeTab === 'doc-quiz' && (
                  <DocumentQuizGenerator onBackToQuizzes={() => handleSelectTool('quizzes')} />
                )}
                {activeTab === 'grade-calculator' && <GradeCalculator />}
                {activeTab === 'smart-notes' && <SmartNotes />}
                {activeTab === 'pomodoro' && <PomodoroTimer />}
                {activeTab === 'citations' && <CitationGenerator />}
                {activeTab === 'timetable' && <TimetableGenerator />}
                {activeTab === 'goals' && <LearningGoalsTracker />}
              </>
            )}

            {/* Teacher Workspace Modules */}
            {workspace === 'teacher' && (
              <>
                {activeTab === 'lesson-plans' && <LessonPlanCreator />}
                {activeTab === 'worksheets' && <WorksheetGenerator />}
                {activeTab === 'exams' && <ExamBuilder />}
                {activeTab === 'attendance' && <AttendanceTracker />}
                {activeTab === 'gradebook' && <TeacherGradebookView />}
                {activeTab === 'rubrics' && <RubricBuilder />}
                {activeTab === 'certificates' && <CertificateGenerator />}
              </>
            )}

            {/* Data & Backup Module (Available in both workspaces) */}
            {activeTab === 'backup' && <DataExportImport />}
          </div>
        </main>
      </div>
    </div>
  );
};
