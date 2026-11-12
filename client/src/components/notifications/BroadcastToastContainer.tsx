import React, { useState, useEffect, useRef } from 'react';
import { Info, CheckCircle2, AlertTriangle, Megaphone, X } from 'lucide-react';
import { useBroadcastNotifications } from '../../context/BroadcastNotificationContext.js';
import type { BroadcastAnnouncement } from '../../services/announcementApi.js';

const TYPE_CONFIG = {
  info: {
    bg: 'bg-[var(--theme-surface)]',
    accentBg: 'bg-[var(--theme-surface-raised)]',
    accentText: 'text-[var(--theme-dirty-white)]',
    border: 'border-[var(--theme-gray-border)]',
    label: 'Announcement',
    icon: Info,
  },
  success: {
    bg: 'bg-[var(--theme-surface)]',
    accentBg: 'bg-emerald-600/20',
    accentText: 'text-emerald-400',
    border: 'border-slate-800',
    label: 'Update',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-[var(--theme-surface)]',
    accentBg: 'bg-amber-600/20',
    accentText: 'text-amber-400',
    border: 'border-slate-800',
    label: 'Notice',
    icon: AlertTriangle,
  },
  important: {
    bg: 'bg-[var(--theme-surface)]',
    accentBg: 'bg-rose-600/20',
    accentText: 'text-rose-400',
    border: 'border-slate-800',
    label: 'Urgent',
    icon: Megaphone,
  },
};

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Just now';
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

interface ToastCardProps {
  announcement: BroadcastAnnouncement;
  onDismiss: (id: string) => void;
}

const DURATION_MS = 9000;

export const BroadcastToastCard: React.FC<ToastCardProps> = ({ announcement, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const remainingRef = useRef(DURATION_MS);
  const lastTickRef = useRef(Date.now());
  const config = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.info;
  const Icon = config.icon;

  useEffect(() => {
    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      if (isPaused) {
        lastTickRef.current = Date.now();
        return;
      }
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      const nextProgress = (remainingRef.current / DURATION_MS) * 100;
      setProgress(nextProgress);

      if (remainingRef.current <= 0) {
        clearInterval(interval);
        onDismiss(announcement._id);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [announcement._id, isPaused, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] p-4 shadow-xl transition-all hover:-translate-y-0.5 animate-in slide-in-from-right-4 duration-300 text-[var(--theme-dirty-white)]"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border border-slate-700 text-[11px] font-mono font-bold ${config.accentBg} ${config.accentText} shrink-0`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
            <span>{config.label}</span>
          </span>

          <span className="text-[11px] font-mono font-medium text-slate-400 truncate">
            {formatRelativeTime(announcement.publishedAt || announcement.createdAt)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(announcement._id)}
          aria-label="Dismiss announcement"
          className="p-1 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-400 hover:text-slate-100 transition-all cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>

      {/* Title & Body */}
      <div className="mt-2.5 space-y-1">
        <h4 className="text-sm font-bold text-slate-100 leading-snug break-words">
          {announcement.title}
        </h4>
        <p className="text-xs font-normal text-slate-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap break-words">
          {announcement.message}
        </p>
      </div>

      {/* Sender metadata if available */}
      {announcement.createdByName && (
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>By {announcement.createdByName}</span>
          {isPaused && <span className="font-semibold text-slate-200 font-sans">Paused</span>}
        </div>
      )}

      {/* Auto-Dismiss Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
        <div
          className={`h-full transition-[width] ease-linear duration-100 ${
            announcement.type === 'important'
              ? 'bg-rose-500'
              : announcement.type === 'warning'
                ? 'bg-amber-400'
                : announcement.type === 'success'
                  ? 'bg-emerald-500'
                  : 'bg-[var(--theme-dirty-white)]'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const BroadcastToastContainer: React.FC = () => {
  const { visibleAnnouncements, dismiss } = useBroadcastNotifications();

  if (!visibleAnnouncements || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Global broadcast announcements"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] pointer-events-none flex flex-col gap-3 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[420px]"
    >
      {visibleAnnouncements.map((announcement) => (
        <BroadcastToastCard
          key={announcement._id}
          announcement={announcement}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
};
