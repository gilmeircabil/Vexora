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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="maintenance-modal-title"
      aria-describedby="maintenance-modal-desc"
    >
      <div className="bg-[#FAF7F2] border-3 border-black rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_#000000] text-center space-y-5 relative">
        {/* Maintenance Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200 border-2 border-black text-[11px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000]">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Under Maintenance</span>
        </div>

        {/* Icon */}
        <div
          style={{ backgroundColor: accentColor }}
          className="w-16 h-16 rounded-2xl border-2 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_#000000]"
        >
          <Wrench className="w-8 h-8 text-black stroke-[2.5]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2
            id="maintenance-modal-title"
            className="text-2xl font-black text-black tracking-tight"
          >
            {title}
          </h2>
          {pageTitle && (
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
              Workspace: {pageTitle}
            </p>
          )}
          <p
            id="maintenance-modal-desc"
            className="text-xs sm:text-sm font-semibold text-neutral-700 leading-relaxed"
          >
            {description}
          </p>
        </div>

        {/* Estimated Return Time if configured */}
        {estimatedReturn && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-bold text-neutral-800">
            <Clock className="w-4 h-4 text-amber-600 stroke-[2.5]" />
            <span>
              Estimated completion: <strong>{estimatedReturn}</strong>
            </span>
          </div>
        )}

        {/* Navigation Action */}
        <div className="pt-2">
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FFD21A] hover:bg-yellow-400 border-2 border-black text-black font-black text-sm shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Backward-compatible alias for existing imports
export const LockedPageModal = MaintenanceModal;
