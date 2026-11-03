import React, { useState } from 'react';
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
  ChevronRight,
  Menu,
  X,
  BookOpen,
  FileQuestion,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [educationRole, setEducationRole] = useState<'student' | 'teacher' | 'educator'>(() => {
    return (user?.educationRole as any) || 'student';
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const isTeacherAuthorized =
    educationRole === 'teacher' || educationRole === 'educator' || user?.role === 'admin';

  const handleSelectTool = (toolId: string) => {
    setActiveTab(toolId);
    setIsMobileNavOpen(false);
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Top Breadcrumb & Mobile Bar */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-black/10 gap-2">
        <div className="flex items-center gap-2 text-xs font-black text-neutral-600 min-w-0 truncate">
          <GraduationCap className="w-4 h-4 text-black shrink-0" />
          <span className="shrink-0">Study Space</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-black capitalize truncate">{activeTab.replace('-', ' ')}</span>
        </div>

        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="md:hidden min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000000] shrink-0 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Menu</span>
        </button>
      </div>

      {/* Main Grid: Sidebar Nav + Module Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* Sidebar Nav - Minimal Unified Panel */}
        <div className={`md:col-span-1 ${isMobileNavOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-2xl border-2 border-black p-2.5 shadow-[3px_3px_0px_#000000] space-y-3">
            {/* Dashboard Link */}
            <button
              onClick={() => handleSelectTool('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#FFD21A] text-black shadow-sm'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Student Workspace Links */}
            <div className="pt-2 border-t border-black/10 space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-3 py-1 block">
                Student Workspace
              </span>

              <button
                onClick={() => handleSelectTool('study-planner')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'study-planner'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Study Planner</span>
              </button>

              <button
                onClick={() => handleSelectTool('flashcards')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'flashcards'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Flashcard Maker</span>
              </button>

              <button
                onClick={() => handleSelectTool('quizzes')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'quizzes'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Practice Tests & Quizzes</span>
              </button>

              <button
                onClick={() => handleSelectTool('doc-quiz')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'doc-quiz'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileQuestion className="w-4 h-4 text-black" />
                  <span>Document to Quiz</span>
                </div>
                <span className="text-[9px] font-black bg-[#4ADE80] text-black px-1.5 py-0.2 rounded border border-black/40">
                  Auto
                </span>
              </button>

              <button
                onClick={() => handleSelectTool('grade-calculator')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'grade-calculator'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Grade & GPA Calculator</span>
              </button>

              <button
                onClick={() => handleSelectTool('smart-notes')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'smart-notes'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Smart Notes</span>
              </button>

              <button
                onClick={() => handleSelectTool('pomodoro')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pomodoro'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Focus Timer</span>
              </button>

              <button
                onClick={() => handleSelectTool('citations')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'citations'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Quote className="w-4 h-4" />
                <span>Citation Generator</span>
              </button>

              <button
                onClick={() => handleSelectTool('timetable')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'timetable'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Class Timetable</span>
              </button>

              <button
                onClick={() => handleSelectTool('goals')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'goals'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Learning Goals</span>
              </button>
            </div>

            {/* Teacher Workspace Links */}
            <div className="pt-2 border-t border-black/10 space-y-0.5">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  Teacher Workspace
                </span>
                {!isTeacherAuthorized && (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    Teacher Mode Required
                  </span>
                )}
              </div>

              {isTeacherAuthorized ? (
                <>
                  <button
                    onClick={() => handleSelectTool('lesson-plans')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'lesson-plans'
                        ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Lesson Plan Creator</span>
                  </button>

                  <button
                    onClick={() => handleSelectTool('worksheets')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'worksheets'
                        ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Worksheet Generator</span>
                  </button>

                  <button
                    onClick={() => handleSelectTool('exams')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'exams'
                        ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    <span>Exam Builder</span>
                  </button>

                  <button
                    onClick={() => handleSelectTool('attendance')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'attendance'
                        ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Attendance Tracker</span>
                  </button>

                  <button
                    onClick={() => handleSelectTool('gradebook')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'gradebook'
                        ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Gradebook Ledger</span>
                  </button>

                  <button
                    onClick={() => handleSelectTool('rubrics')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'rubrics'
                        ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Table className="w-4 h-4" />
                    <span>Rubric Builder</span>
                  </button>

                  <button
                    onClick={() => handleSelectTool('certificates')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'certificates'
                        ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Certificate Generator</span>
                  </button>
                </>
              ) : (
                <div className="p-3 bg-neutral-50 rounded-xl text-center space-y-2">
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Teacher tools are protected to ensure student data privacy and integrity.
                  </p>
                  <button
                    onClick={() => setEducationRole('teacher')}
                    className="px-3 py-1 bg-[#FFD21A] text-black font-black text-xs rounded-lg border border-black shadow-[1px_1px_0px_#000000]"
                  >
                    Enable Teacher Mode
                  </button>
                </div>
              )}
            </div>

            {/* Privacy & Backup Link */}
            <div className="pt-2 border-t border-black/10">
              <button
                onClick={() => handleSelectTool('backup')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'backup'
                    ? 'bg-[#FFD21A] font-black text-black shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Data Backup & Privacy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 lg:col-span-4 min-w-0">
          {activeTab === 'dashboard' && (
            <EducationDashboard
              onSelectTool={handleSelectTool}
              activeRole={educationRole}
              onRoleChange={setEducationRole}
            />
          )}

          {/* Student Workspace */}
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

          {/* Teacher Workspace */}
          {activeTab === 'lesson-plans' && <LessonPlanCreator />}
          {activeTab === 'worksheets' && <WorksheetGenerator />}
          {activeTab === 'exams' && <ExamBuilder />}
          {activeTab === 'attendance' && <AttendanceTracker />}
          {activeTab === 'gradebook' && <TeacherGradebookView />}
          {activeTab === 'rubrics' && <RubricBuilder />}
          {activeTab === 'certificates' && <CertificateGenerator />}

          {/* Data & Backup */}
          {activeTab === 'backup' && <DataExportImport />}
        </div>
      </div>
    </div>
  );
};
