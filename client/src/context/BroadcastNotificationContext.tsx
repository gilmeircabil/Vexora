import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext.js';
import { announcementApi, type BroadcastAnnouncement } from '../services/announcementApi.js';

interface BroadcastNotificationContextType {
  visibleAnnouncements: BroadcastAnnouncement[];
  queuedCount: number;
  dismiss: (id: string) => void;
  refresh: () => Promise<void>;
}

const BroadcastNotificationContext = createContext<BroadcastNotificationContextType | undefined>(
  undefined,
);

const MAX_VISIBLE_TOASTS = 2;
const DISMISSED_STORAGE_KEY = 'vexora_dismissed_announcements';

function getLocalDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveLocalDismissedId(id: string): void {
  try {
    const set = getLocalDismissedIds();
    set.add(id);
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage quota errors
  }
}

export const BroadcastNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<BroadcastAnnouncement[]>([]);
  const queueRef = useRef<BroadcastAnnouncement[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Move next queued announcement into visible slots if available
  const processQueue = useCallback(() => {
    setVisibleAnnouncements((prev) => {
      if (prev.length >= MAX_VISIBLE_TOASTS || queueRef.current.length === 0) {
        return prev;
      }
      const needed = MAX_VISIBLE_TOASTS - prev.length;
      const nextBatch = queueRef.current.splice(0, needed);
      return [...prev, ...nextBatch];
    });
  }, []);

  // Dismiss an announcement
  const dismiss = useCallback(
    (id: string) => {
      saveLocalDismissedId(id);
      seenIdsRef.current.add(id);

      // Remove from visible
      setVisibleAnnouncements((prev) => prev.filter((a) => a._id !== id));

      // Remove from queue if present
      queueRef.current = queueRef.current.filter((a) => a._id !== id);

      // Record dismissal on backend
      announcementApi.dismiss(id).catch(() => {});

      // Bring in next from queue
      setTimeout(() => {
        processQueue();
      }, 150);
    },
    [processQueue],
  );

  // Enqueue a new announcement
  const enqueueAnnouncement = useCallback((announcement: BroadcastAnnouncement) => {
    const dismissed = getLocalDismissedIds();
    if (dismissed.has(announcement._id) || seenIdsRef.current.has(announcement._id)) {
      return;
    }

    // Check if expired
    if (announcement.expiresAt && new Date(announcement.expiresAt) <= new Date()) {
      return;
    }

    seenIdsRef.current.add(announcement._id);

    // Record view
    announcementApi.recordView(announcement._id).catch(() => {});

    setVisibleAnnouncements((prev) => {
      if (prev.some((a) => a._id === announcement._id)) {
        return prev;
      }
      if (prev.length < MAX_VISIBLE_TOASTS) {
        return [...prev, announcement];
      }
      // Exceeds visible limit; queue it
      if (!queueRef.current.some((a) => a._id === announcement._id)) {
        queueRef.current.push(announcement);
      }
      return prev;
    });
  }, []);

  // Fetch active eligible announcements on mount & auth change
  const fetchActiveAnnouncements = useCallback(async () => {
    try {
      const res = await announcementApi.getActive();
      if (res.success && Array.isArray(res.data)) {
        const dismissed = getLocalDismissedIds();
        for (const item of res.data) {
          if (!dismissed.has(item._id) && !seenIdsRef.current.has(item._id)) {
            enqueueAnnouncement(item);
          }
        }
      }
    } catch {
      // Offline or network error - silently skip
    }
  }, [enqueueAnnouncement]);

  useEffect(() => {
    fetchActiveAnnouncements();
  }, [user, fetchActiveAnnouncements]);

  // Connect to real-time Server-Sent Events stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/announcements/stream');

        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'new_announcement' && parsed.announcement) {
              enqueueAnnouncement(parsed.announcement);
            }
          } catch {
            // Ignore parse errors on heartbeats
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect with backoff
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              connectSSE();
            }, 10000);
          }
        };
      } catch {
        // EventSource not supported or failed
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [enqueueAnnouncement]);

  return (
    <BroadcastNotificationContext.Provider
      value={{
        visibleAnnouncements,
        queuedCount: queueRef.current.length,
        dismiss,
        refresh: fetchActiveAnnouncements,
      }}
    >
      {children}
    </BroadcastNotificationContext.Provider>
  );
};

export function useBroadcastNotifications(): BroadcastNotificationContextType {
  const context = useContext(BroadcastNotificationContext);
  if (!context) {
    throw new Error(
      'useBroadcastNotifications must be used within a BroadcastNotificationProvider',
    );
  }
  return context;
}
