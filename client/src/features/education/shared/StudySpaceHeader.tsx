import React from 'react';
import {
  GraduationCap,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export interface StudySpaceHeaderProps {
  activeTab: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileNav: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const StudySpaceHeader: React.FC<StudySpaceHeaderProps> = ({
  activeTab,
  isSidebarCollapsed,
  onToggleSidebar,
  onToggleMobileNav,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="h-14 bg-[var(--theme-canvas)]/90 backdrop-blur-md border-b border-[var(--theme-gray-border)] px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-20 shadow-sm text-[var(--theme-dirty-white)]">
      {/* Left: Sidebar Toggles & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Nav Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] shadow-sm cursor-pointer"
          aria-label="Toggle navigation menu"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden md:flex p-1.5 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] shadow-sm cursor-pointer transition-transform active:translate-y-0.5"
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
          <div className="w-8 h-8 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[var(--theme-dirty-white)] font-black text-sm shadow-sm">
            <GraduationCap className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-xs uppercase tracking-tight text-[var(--theme-dirty-white)] leading-none">
              Study Space
            </h1>
            <span className="text-[10px] font-mono font-bold text-[var(--theme-gray-muted)]">
              Zero-Cost Education
            </span>
          </div>
        </div>
      </div>

      {/* Center: Student Workspace Pill */}
      <div className="flex items-center bg-[var(--theme-surface)] px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] shadow-sm gap-1.5 text-xs font-black text-[var(--theme-dirty-white)]">
        <BookOpen className="w-3.5 h-3.5 stroke-[2.5] text-[var(--theme-yellow)]" />
        <span>Student Workspace</span>
      </div>

      {/* Right: Breadcrumb & Fullscreen / Focus Mode Toggle */}
      <div className="flex items-center gap-2">
        {/* Active Tab Breadcrumb pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-gray-muted)] text-xs font-mono font-bold">
          <span className="capitalize text-[var(--theme-gray-muted)]">student</span>
          <ChevronRight className="w-3 h-3 text-[var(--theme-gray-dim)]" />
          <span className="capitalize text-[var(--theme-dirty-white)] font-black">
            {activeTab.replace('-', ' ')}
          </span>
        </div>

        {/* Fullscreen / Focus Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] text-xs font-black transition-all shadow-sm cursor-pointer active:translate-y-0.5 ${
            isFullscreen
              ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]'
              : 'bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)]'
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
