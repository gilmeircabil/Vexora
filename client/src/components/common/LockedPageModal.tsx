import React from 'react';
import { Link } from 'react-router';
import { Wrench, ArrowLeft, Clock } from 'lucide-react';

export interface MaintenanceModalProps {
  title?: string;
  description?: string;
  pageTitle?: string;
  estimatedReturn?: string;
  accentColor?: string;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  title = 'Scheduled Maintenance',
  description = 'This section is currently undergoing scheduled maintenance and updates. Please check back shortly.',
  pageTitle,
  estimatedReturn,
  accentColor = '#FB923C',
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="maintenance-modal-title"
      aria-describedby="maintenance-modal-desc"
    >
      <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 relative text-[var(--theme-dirty-white)]">
        {/* Maintenance Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Under Maintenance</span>
        </div>

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] flex items-center justify-center mx-auto shadow-sm"
        >
          <Wrench className="w-8 h-8 text-[var(--theme-dirty-white)] stroke-[2]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2
            id="maintenance-modal-title"
            className="text-2xl font-bold text-[var(--theme-dirty-white)] tracking-tight"
          >
            {title}
          </h2>
          {pageTitle && (
            <p className="text-xs font-mono font-medium uppercase tracking-wider text-[var(--theme-gray-muted)]">
              Workspace: {pageTitle}
            </p>
          )}
          <p
            id="maintenance-modal-desc"
            className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)] leading-relaxed"
          >
            {description}
          </p>
        </div>

        {/* Estimated Return Time if configured */}
        {estimatedReturn && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-xs font-medium text-[var(--theme-dirty-white)]">
            <Clock className="w-4 h-4 text-[var(--theme-dirty-white)] stroke-[2]" />
            <span>
              Estimated completion: <strong className="text-[var(--theme-dirty-white)]">{estimatedReturn}</strong>
            </span>
          </div>
        )}

        {/* Navigation Action */}
        <div className="pt-2">
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-[var(--theme-canvas)] font-bold text-sm shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Backward-compatible alias for existing imports
export const LockedPageModal = MaintenanceModal;
