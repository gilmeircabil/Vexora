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
  ShieldCheck,
  FileQuestion,
  X,
  BookOpen,
} from 'lucide-react';
import { useFullscreenMode } from '../../features/education/shared/useFullscreenMode.js';

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

interface StudySpaceNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const STUDENT_NAV_ITEMS: StudySpaceNavItem[] = [
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

export const StudySpacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { isFullscreen, toggleFullscreen } = useFullscreenMode();

  const handleSelectTool = (toolId: string) => {
    setActiveTab(toolId);
    setIsMobileNavOpen(false);
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-transparent select-text font-sans">
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

        {/* Dedicated Sidebar for Student Workspace */}
        <aside
          className={`fixed md:static top-0 bottom-0 left-0 z-50 md:z-10 bg-[var(--theme-surface)] border-r border-[var(--theme-gray-border)] flex flex-col shrink-0 transition-all duration-200 ${
            isMobileNavOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
          } ${
            isSidebarCollapsed
              ? 'md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0 pointer-events-none md:pointer-events-none'
              : 'md:w-64 lg:w-72 md:opacity-100'
          }`}
        >
          {/* Mobile Drawer Header */}
          <div className="p-3 border-b border-[var(--theme-gray-border)] flex items-center justify-between md:hidden bg-[var(--theme-surface-raised)]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[var(--theme-dirty-white)]">
                Student Menu
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] shadow-xs cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Workspace Identity Tag in Sidebar */}
          <div className="p-3 border-b border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--theme-dirty-white)] stroke-[2.5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-dirty-white)]">
                Student Workspace
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] px-2 py-0.5 rounded-md border border-[var(--theme-gray-border)]">
              {STUDENT_NAV_ITEMS.length} Tools
            </span>
          </div>

          {/* Navigation Items List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {STUDENT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTool(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                      : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-[var(--theme-canvas)] stroke-[2.5]'
                          : 'text-[var(--theme-gray-muted)]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] px-1.5 py-0.5 rounded border border-[var(--theme-gray-border)] shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Canvas Area */}
        <main
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent"
          id="study-space-canvas"
        >
          <div className="max-w-6xl mx-auto w-full">
            {activeTab === 'dashboard' && <EducationDashboard onSelectTool={handleSelectTool} />}
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
            {activeTab === 'backup' && <DataExportImport />}
          </div>
        </main>
      </div>
    </div>
  );
};
