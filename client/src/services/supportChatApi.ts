export type SupportThreadStatus = 'unread' | 'read' | 'replied' | 'resolved' | 'archived';

export interface SupportChatMessage {
  _id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  createdAt: string;
}

export interface SupportChatThread {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  messages: SupportChatMessage[];
  status: SupportThreadStatus;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'vexora_support_threads_v1';
const RATE_LIMIT_KEY = 'vexora_support_rate_limit_v1';
export const SUPPORT_MAX_MESSAGES = 5;
export const SUPPORT_WINDOW_MINUTES = 15;
export const SUPPORT_COOLDOWN_SECONDS = 10;

function readSendTimestamps(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    const cutoff = Date.now() - SUPPORT_WINDOW_MINUTES * 60 * 1000;
    return raw.filter((ts): ts is number => typeof ts === 'number' && ts > cutoff);
  } catch {
    return [];
  }
}

function recordSendTimestamp(): void {
  try {
    const next = [...readSendTimestamps(), Date.now()];
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage error
  }
}

function readLocalThreads(): SupportChatThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalThreads(threads: SupportChatThread[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // Ignore storage quota errors
  }
}

function normalizeThread(raw: any): SupportChatThread {
  const createdAt = raw.createdAt || new Date().toISOString();
  const messages: SupportChatMessage[] =
    Array.isArray(raw.messages) && raw.messages.length > 0
      ? raw.messages.map((m: any, idx: number) => ({
          _id: String(m._id || `${raw._id}-msg-${idx}`),
          sender: m.sender === 'admin' ? 'admin' : 'user',
          senderName: m.senderName || (m.sender === 'admin' ? 'VexoraMods Admin' : raw.name || 'User'),
          text: String(m.text || ''),
          createdAt: m.createdAt || createdAt,
        }))
      : [
          {
            _id: `${raw._id}-initial`,
            sender: 'user',
            senderName: raw.name || 'User',
            text: String(raw.message || ''),
            createdAt,
          },
        ];

  return {
    _id: String(raw._id || `thread-${Date.now()}`),
    name: String(raw.name || 'Visitor'),
    email: String(raw.email || '').toLowerCase(),
    subject: String(raw.subject || 'General Support'),
    message: String(raw.message || messages[messages.length - 1]?.text || ''),
    messages,
    status: (raw.status as SupportThreadStatus) || 'unread',
    createdAt,
    updatedAt: raw.updatedAt || messages[messages.length - 1]?.createdAt || createdAt,
  };
}

function mergeThreads(primary: SupportChatThread[], secondary: SupportChatThread[]): SupportChatThread[] {
  const map = new Map<string, SupportChatThread>();
  for (const t of [...secondary, ...primary]) {
    const existing = map.get(t._id);
    if (!existing || t.messages.length >= existing.messages.length) {
      map.set(t._id, t);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem('tn_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('vexora_auth_token');
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

export const supportChatApi = {
  getRateLimitState() {
    const timestamps = readSendTimestamps();
    const remaining = Math.max(0, SUPPORT_MAX_MESSAGES - timestamps.length);
    const lastSend = timestamps[timestamps.length - 1] || 0;
    const elapsedSec = Math.floor((Date.now() - lastSend) / 1000);
    const cooldownSec = lastSend > 0 ? Math.max(0, SUPPORT_COOLDOWN_SECONDS - elapsedSec) : 0;
    return {
      remaining,
      limit: SUPPORT_MAX_MESSAGES,
      windowMinutes: SUPPORT_WINDOW_MINUTES,
      cooldownSec,
    };
  },

  async getUserThreads(email: string): Promise<SupportChatThread[]> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return [];

    const local = readLocalThreads().filter((t) => t.email === cleanEmail);
    try {
      const res = await fetch(`/api/platform/contact/threads?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const json = await res.json();
        const remoteList: SupportChatThread[] = Array.isArray(json?.data?.threads)
          ? json.data.threads.map(normalizeThread)
          : [];
        if (remoteList.length > 0) {
          const mergedAll = mergeThreads(remoteList, readLocalThreads());
          writeLocalThreads(mergedAll);
          return mergedAll.filter((t) => t.email === cleanEmail);
        }
      }
    } catch {
      // Fallback to local threads
    }
    return local;
  },

  async sendUserMessage(params: {
    threadId?: string;
    name: string;
    email: string;
    subject: string;
    text: string;
  }): Promise<SupportChatThread> {
    const now = new Date().toISOString();
    const cleanName = params.name.trim() || 'Guest User';
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanSubject = params.subject.trim() || 'General Support';
    const cleanText = params.text.trim();

    const localThreads = readLocalThreads();
    let updatedThread: SupportChatThread | undefined;

    if (params.threadId) {
      const existing = localThreads.find((t) => t._id === params.threadId);
      if (existing) {
        const newMsg: SupportChatMessage = {
          _id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sender: 'user',
          senderName: cleanName,
          text: cleanText,
          createdAt: now,
        };
        updatedThread = {
          ...existing,
          message: cleanText,
          status: 'unread',
          updatedAt: now,
          messages: [...existing.messages, newMsg],
        };
      }
    }

    if (!updatedThread) {
      const newId = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      updatedThread = {
        _id: newId,
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanText,
        status: 'unread',
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            _id: `msg-${Date.now()}`,
            sender: 'user',
            senderName: cleanName,
            text: cleanText,
            createdAt: now,
          },
        ],
      };
    }

    try {
      const res = await fetch('/api/platform/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: params.threadId,
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanText,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.thread?._id && Array.isArray(json.data.thread.messages)) {
          updatedThread = normalizeThread(json.data.thread);
        }
      }
    } catch {
      // Keep local thread update
    }

    const merged = mergeThreads([updatedThread], localThreads.filter((t) => t._id !== params.threadId));
    writeLocalThreads(merged);
    recordSendTimestamp();
    return updatedThread;
  },

  async getAllThreadsForAdmin(remoteInquiries: any[] = []): Promise<SupportChatThread[]> {
    const normalizedRemote = Array.isArray(remoteInquiries)
      ? remoteInquiries.map(normalizeThread)
      : [];
    const local = readLocalThreads();
    const merged = mergeThreads(normalizedRemote, local);
    writeLocalThreads(merged);
    return merged;
  },

  async sendAdminReply(
    threadId: string,
    text: string,
    senderName = 'VexoraMods Admin',
  ): Promise<SupportChatThread | null> {
    const cleanText = text.trim();
    if (!cleanText) return null;

    const now = new Date().toISOString();
    const localThreads = readLocalThreads();
    const target = localThreads.find((t) => t._id === threadId);
    let updated: SupportChatThread | null = target
      ? {
          ...target,
          status: 'replied',
          updatedAt: now,
          messages: [
            ...target.messages,
            {
              _id: `msg-admin-${Date.now()}`,
              sender: 'admin',
              senderName,
              text: cleanText,
              createdAt: now,
            },
          ],
        }
      : null;

    try {
      const res = await fetch(`/api/admin/contact/${threadId}/reply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: cleanText, senderName }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?._id && Array.isArray(json.data.messages)) {
          updated = normalizeThread(json.data);
        }
      }
    } catch {
      // Keep local update
    }

    if (updated) {
      const next = mergeThreads([updated], localThreads);
      writeLocalThreads(next);
    }
    return updated;
  },

  async updateThreadStatus(
    threadId: string,
    status: SupportThreadStatus,
  ): Promise<SupportChatThread | null> {
    const localThreads = readLocalThreads();
    const target = localThreads.find((t) => t._id === threadId);
    let updated: SupportChatThread | null = target
      ? { ...target, status, updatedAt: new Date().toISOString() }
      : null;

    try {
      const res = await fetch(`/api/admin/contact/${threadId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?._id && Array.isArray(json.data.messages)) {
          updated = normalizeThread(json.data);
        }
      }
    } catch {
      // Keep local update
    }

    if (updated) {
      const next = mergeThreads([updated], localThreads);
      writeLocalThreads(next);
    }
    return updated;
  },

  async deleteMessage(threadId: string, messageId: string): Promise<SupportChatThread | null> {
    const localThreads = readLocalThreads();
    const target = localThreads.find((t) => t._id === threadId);
    let updated: SupportChatThread | null = target
      ? {
          ...target,
          messages: target.messages.filter((m) => m._id !== messageId),
        }
      : null;

    try {
      const res = await fetch(`/api/admin/contact/${threadId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?._id && Array.isArray(json.data.messages)) {
          updated = normalizeThread(json.data);
        }
      }
    } catch {
      // Keep local update
    }

    if (updated) {
      const next = localThreads.map((t) => (t._id === threadId ? updated! : t));
      writeLocalThreads(next);
    }
    return updated;
  },
};
