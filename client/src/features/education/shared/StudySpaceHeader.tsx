import React from 'react';
import {
  GraduationCap,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ChevronRight,
  School,
  BookOpen,
} from 'lucide-react';

export interface StudySpaceHeaderProps {
  workspace: 'student' | 'teacher';
  onWorkspaceChange: (ws: 'student' | 'teacher') => void;
  activeTab: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileNav: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const StudySpaceHeader: React.FC<StudySpaceHeaderProps> = ({
  workspace,
  onWorkspaceChange,
  activeTab,
  isSidebarCollapsed,
  onToggleSidebar,
  onToggleMobileNav,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b-2 border-black px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-20 shadow-[0_2px_0px_#000000]">
      {/* Left: Sidebar Toggles & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Nav Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-xl border-2 border-black bg-[#FAF7F2] hover:bg-neutral-100 text-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
          aria-label="Toggle navigation menu"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden md:flex p-1.5 rounded-xl border-2 border-black bg-[#FAF7F2] hover:bg-neutral-100 text-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-transform active:translate-y-0.5"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <PanelLeftClose className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>

        {/* Brand / Space Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFD21A] border-2 border-black flex items-center justify-center text-black font-black text-sm shadow-[2px_2px_0px_#000]">
            <GraduationCap className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-xs uppercase tracking-tight text-black leading-none">
              Study Space
            </h1>
            <span className="text-[10px] font-mono font-bold text-neutral-500">
              Zero-Cost Education
            </span>
          </div>
        </div>
      </div>

      {/* Center: Dedicated Workspace Switcher */}
      <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
        <button
          type="button"
          onClick={() => onWorkspaceChange('student')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            workspace === 'student'
              ? 'bg-[#FFD21A] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]'
              : 'text-neutral-600 hover:text-black border border-transparent'
          }`}
          aria-label="Student Workspace"
        >
          <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Student Workspace</span>
        </button>

        <button
          type="button"
          onClick={() => onWorkspaceChange('teacher')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
            workspace === 'teacher'
              ? 'bg-[#FFD21A] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]'
              : 'text-neutral-600 hover:text-black border border-transparent'
          }`}
          aria-label="Teacher Workspace"
        >
          <School className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Teacher Workspace</span>
        </button>
      </div>

      {/* Right: Breadcrumb & Fullscreen / Focus Mode Toggle */}
      <div className="flex items-center gap-2">
        {/* Active Tab Breadcrumb pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-black/20 text-neutral-700 text-xs font-mono font-bold">
          <span className="capitalize text-neutral-500">{workspace}</span>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="capitalize text-black font-black">{activeTab.replace('-', ' ')}</span>
        </div>

        {/* Fullscreen / Focus Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black transition-all shadow-[2px_2px_0px_#000] cursor-pointer active:translate-y-0.5 ${
            isFullscreen
              ? 'bg-[#FACC15] text-black'
              : 'bg-white hover:bg-[#FAF7F2] text-black'
          }`}
          aria-label={isFullscreen ? 'Exit Full Screen' : 'Full Screen (Focus Mode)'}
          title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen Focus Mode'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Exit Full Screen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Full Screen</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
