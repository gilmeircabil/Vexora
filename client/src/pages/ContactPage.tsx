import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldCheck, RefreshCw, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { supportChatApi, type SupportChatThread } from '../services/supportChatApi.js';

export const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdminUser = user?.role === 'admin';

  const [adminMode, setAdminMode] = useState<boolean>(false);
  const activeName = user?.name || user?.username || 'User';
  const activeEmail = user?.email || (user?.username ? `${user.username}@vexoramods.com` : '');

  const [threads, setThreads] = useState<SupportChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [rateLimit, setRateLimit] = useState(() => supportChatApi.getRateLimitState());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      if (typeof chatContainerRef.current.scrollTo === 'function') {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      } else {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => {
    setRateLimit(supportChatApi.getRateLimitState());
    const timer = setInterval(() => {
      setRateLimit(supportChatApi.getRateLimitState());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadThreads = async (emailToLoad: string) => {
    setIsRefreshing(true);
    try {
      if (isAdminUser && adminMode) {
        const all = await supportChatApi.getAllThreadsForAdmin();
        setThreads(all);
        if (all.length > 0 && !activeThreadId) setActiveThreadId(all[0]!._id);
        return;
      }
      const clean = emailToLoad.trim().toLowerCase();
      if (!clean || !clean.includes('@')) {
        setThreads([]);
        return;
      }
      const list = await supportChatApi.getUserThreads(clean);
      setThreads(list);
      if (list.length > 0 && !activeThreadId) setActiveThreadId(list[0]!._id);
    } finally {
      setIsRefreshing(false);
      scrollToBottom(true);
    }
  };

  useEffect(() => {
    loadThreads(activeEmail);
  }, [activeEmail, adminMode, isAdminUser]);

  const activeThread = threads.find((t) => t._id === activeThreadId) || threads[0] || null;

  useEffect(() => {
    scrollToBottom(false);
  }, [activeThreadId]);

  useEffect(() => {
    scrollToBottom(true);
  }, [activeThread?.messages?.length]);

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeThread) return;
    const updated = await supportChatApi.deleteMessage(activeThread._id, messageId);
    if (updated) {
      setThreads((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      showToast('Message deleted', 'info');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = messageText.trim();
    if (!cleanText) return;

    if (isAdminUser && adminMode && activeThread) {
      setIsSending(true);
      try {
        await supportChatApi.sendAdminReply(
          activeThread._id,
          cleanText,
          user?.name || 'VexoraMods Admin',
        );
        await loadThreads(activeEmail);
        setMessageText('');
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (rateLimit.remaining <= 0) {
      showToast('Message limit reached (5 per 15 mins). Please wait.', 'error');
      return;
    }
    if (rateLimit.cooldownSec > 0) {
      showToast(`Please wait ${rateLimit.cooldownSec}s before sending another message.`, 'error');
      return;
    }

    const cleanName = activeName.trim();
    const cleanEmail = activeEmail.trim().toLowerCase();
    if (!cleanName || !cleanEmail) {
      showToast('Please sign in to send a message.', 'error');
      return;
    }

    setIsSending(true);
    try {
      const updated = await supportChatApi.sendUserMessage({
        threadId: activeThread?._id,
        name: cleanName,
        email: cleanEmail,
        subject: 'Support Chat',
        text: cleanText,
      });
      const refreshed = await supportChatApi.getUserThreads(cleanEmail);
      setThreads(refreshed);
      setActiveThreadId(updated._id);
      setMessageText('');
      setRateLimit(supportChatApi.getRateLimitState());
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 text-[var(--theme-dirty-white)]">
      <div
        data-testid="contact-admin-chat"
        className="rounded-3xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] flex flex-col overflow-hidden shadow-sm min-h-[540px]"
      >
        {/* Minimal Chat Header */}
        <div className="px-5 py-3.5 border-b border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--theme-yellow)] text-[var(--theme-canvas)] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-[var(--theme-dirty-white)]">
                Admin Support
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span
                data-testid="contact-rate-limit-badge"
                className="px-2 py-0.5 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[10px] font-mono font-bold text-[var(--theme-gray-muted)]"
              >
                {rateLimit.remaining}/{rateLimit.limit} left • {rateLimit.windowMinutes}m
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminUser && (
              <button
                type="button"
                onClick={() => setAdminMode((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  adminMode
                    ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)]'
                    : 'bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border-[var(--theme-gray-border)]'
                }`}
              >
                {adminMode ? 'Admin Inbox' : 'Switch to Admin Inbox'}
              </button>
            )}
            <button
              type="button"
              onClick={() => loadThreads(activeEmail)}
              aria-label="Refresh Chat"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-xs font-bold text-[var(--theme-dirty-white)] cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Chat</span>
            </button>
          </div>
        </div>

        {/* Admin Thread Switcher Bar (only when Admin Inbox mode is active) */}
        {isAdminUser && adminMode && threads.length > 0 && (
          <div className="px-4 py-2.5 border-b border-[var(--theme-gray-border)] bg-[var(--theme-canvas)]/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {threads.map((t) => (
              <button
                key={t._id}
                type="button"
                onClick={() => setActiveThreadId(t._id)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer border ${
                  activeThread?._id === t._id
                    ? 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)]'
                    : 'bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)]'
                }`}
              >
                {t.name} ({t.email})
              </button>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 p-5 space-y-3 overflow-y-auto max-h-[380px]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--theme-yellow)] text-[var(--theme-canvas)] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--theme-dirty-white)]">
              {isAdminUser && adminMode
                ? `Viewing conversation with ${activeThread?.name || 'User'}. Send replies below.`
                : 'Hi! Send a message below to chat with Admin.'}
            </div>
          </div>

          {activeThread?.messages.map((msg) => {
            const isMe = adminMode ? msg.sender === 'admin' : msg.sender === 'user';
            const isIncomingAdmin = !isMe && msg.sender === 'admin';
            return (
              <div
                key={msg._id}
                className={`group flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {isAdminUser && isMe && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(msg._id)}
                    aria-label="Delete message"
                    title="Delete message"
                    className="opacity-70 hover:opacity-100 text-[var(--theme-gray-muted)] hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {!isMe && (
                  <div className="w-7 h-7 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-yellow)] flex items-center justify-center shrink-0 mt-0.5">
                    {isIncomingAdmin ? (
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <span className="text-[10px] font-bold text-[var(--theme-dirty-white)]">
                        {(msg.senderName || 'U').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 space-y-0.5 ${
                    isMe
                      ? 'rounded-tr-xs bg-[var(--theme-yellow)] text-[var(--theme-canvas)] font-medium'
                      : 'rounded-tl-xs bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)]'
                  }`}
                >
                  <div
                    className={`text-[10px] font-mono font-bold ${
                      isMe ? 'text-[var(--theme-canvas)]/75' : 'text-[var(--theme-yellow)]'
                    }`}
                  >
                    {msg.senderName || (msg.sender === 'admin' ? 'Admin' : 'User')}
                  </div>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                {isAdminUser && !isMe && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(msg._id)}
                    aria-label="Delete message"
                    title="Delete message"
                    className="opacity-70 hover:opacity-100 text-[var(--theme-gray-muted)] hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3.5 border-t border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] flex items-center gap-2.5"
        >
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={
              isAdminUser && adminMode && activeThread
                ? `Reply to ${activeThread.name}...`
                : 'Write a message to Admin...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-xs sm:text-sm font-medium text-[var(--theme-dirty-white)] placeholder:text-[var(--theme-gray-muted)] focus:outline-none focus:border-[var(--theme-yellow)]"
          />
          <button
            type="submit"
            disabled={
              isSending ||
              !messageText.trim() ||
              (!adminMode && (rateLimit.remaining <= 0 || rateLimit.cooldownSec > 0))
            }
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] disabled:opacity-50 text-[var(--theme-canvas)] text-xs font-black uppercase tracking-wider cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>
              {!adminMode && rateLimit.cooldownSec > 0
                ? `Wait ${rateLimit.cooldownSec}s`
                : !adminMode && rateLimit.remaining <= 0
                  ? 'Limit Reached'
                  : 'Send Message'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
