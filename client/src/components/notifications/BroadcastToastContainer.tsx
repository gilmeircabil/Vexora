import React, { useState, useEffect, useRef } from 'react';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  X,
} from 'lucide-react';
import { useBroadcastNotifications } from '../../context/BroadcastNotificationContext.js';
import type { BroadcastAnnouncement } from '../../services/announcementApi.js';

const TYPE_CONFIG = {
  info: {
    bg: 'bg-[#FAF7F0]',
    accentBg: 'bg-[#38BDF8]',
    accentText: 'text-black',
    border: 'border-black',
    label: 'Announcement',
    icon: Info,
  },
  success: {
    bg: 'bg-[#FAF7F0]',
    accentBg: 'bg-[#4ADE80]',
    accentText: 'text-black',
    border: 'border-black',
    label: 'Update',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-[#FAF7F0]',
    accentBg: 'bg-[#FACC15]',
    accentText: 'text-black',
    border: 'border-black',
    label: 'Notice',
    icon: AlertTriangle,
  },
  important: {
    bg: 'bg-[#FAF7F0]',
    accentBg: 'bg-[#F43F5E]',
    accentText: 'text-white',
    border: 'border-black',
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
      className="pointer-events-auto relative w-full overflow-hidden rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] transition-all hover:-translate-y-0.5 animate-in slide-in-from-right-4 duration-300"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border-2 border-black text-[11px] font-mono font-black ${config.accentBg} ${config.accentText} shadow-[1.5px_1.5px_0px_#000] shrink-0`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span>{config.label}</span>
          </span>

          <span className="text-[11px] font-mono font-bold text-neutral-500 truncate">
            {formatRelativeTime(announcement.publishedAt || announcement.createdAt)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(announcement._id)}
          aria-label="Dismiss announcement"
          className="p-1 rounded-lg border border-black/40 hover:border-black bg-[#FAF7F0] hover:bg-neutral-200 text-black transition-all cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Title & Body */}
      <div className="mt-2.5 space-y-1">
        <h4 className="text-sm font-black text-black leading-snug break-words">
          {announcement.title}
        </h4>
        <p className="text-xs font-medium text-neutral-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap break-words">
          {announcement.message}
        </p>
      </div>

      {/* Sender metadata if available */}
      {announcement.createdByName && (
        <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span>By {announcement.createdByName}</span>
          {isPaused && <span className="font-bold text-black font-sans">Paused</span>}
        </div>
      )}

      {/* Auto-Dismiss Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-200">
        <div
          className={`h-full transition-[width] ease-linear duration-100 ${
            announcement.type === 'important'
              ? 'bg-[#F43F5E]'
              : announcement.type === 'warning'
                ? 'bg-[#FACC15]'
                : announcement.type === 'success'
                  ? 'bg-[#4ADE80]'
                  : 'bg-[#38BDF8]'
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
