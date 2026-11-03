import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Bot,
  Square,
  MessageSquare,
  Zap,
  Code2,
  PenTool,
  Brain,
  Menu,
  X,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Paperclip,
  FileText,
  Image as ImageIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Sliders,
  Download,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  RotateCw,
  Search,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { aiToolsApi } from '../../services/aiToolsApi.js';
import { useFullscreenMode } from '../../features/education/shared/useFullscreenMode.js';

export interface AttachedFile {
  file: File;
  name: string;
  size: number;
  mimeType: string;
  previewUrl?: string;
  isImage: boolean;
  base64Data?: string;
  isText?: boolean;
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const SIDEBAR_COLLAPSED_KEY = 'vexora_ai_sidebar_collapsed';
const INSPECTOR_OPEN_KEY = 'vexora_ai_inspector_open';
const STORAGE_KEY = 'vexora_ai_chat_sessions';
const ACTIVE_SESSION_KEY = 'vexora_ai_active_session_id';
const MODEL_STORAGE_KEY = 'vexora_ai_selected_model';

const SYSTEM_PERSONAS = [
  { label: 'General', prompt: '' },
  {
    label: 'Code Pro',
    prompt:
      'You are an elite principal software engineer. Write robust, concise, production-grade code with TypeScript types, modern syntax, and clean explanations.',
  },
  {
    label: 'Concise',
    prompt:
      'Provide ultra-concise, direct, bulleted answers. Cut all conversational pleasantries, intros, and boilerplate.',
  },
  {
    label: 'Creative',
    prompt:
      'You are a creative brainstormer, writer, and product designer. Provide fresh, engaging, and high-impact ideas.',
  },
  {
    label: 'Academic',
    prompt:
      'You are an academic researcher and educator. Provide rigorous, fact-based, analytical explanations with structured breakdowns.',
  },
];

interface ChatMessageItem {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachment?: {
    name: string;
    mimeType: string;
    size: number;
    previewUrl?: string;
    isImage: boolean;
  };
}

export interface AIModelOption {
  id: string;
  name: string;
  provider: 'gemini' | 'nvidia' | 'auto';
  badge: string;
  description: string;
  speed: string;
}

export const FREE_AI_MODELS: AIModelOption[] = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash',
    provider: 'gemini',
    badge: 'Ultra-Fast',
    description: 'Instant ~700ms token streaming with sharp coding & Q&A',
    speed: 'Ultra-Fast',
  },
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash Lite',
    provider: 'gemini',
    badge: 'Fast',
    description: 'High-speed, stable Google model for rapid answers',
    speed: 'Ultra-Fast',
  },
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B Vision',
    provider: 'nvidia',
    badge: '90B NIM',
    description: 'NVIDIA NIM high-capacity multimodal reasoning & coding',
    speed: 'High-IQ',
  },
  {
    id: 'auto',
    name: 'Auto Fast Router',
    provider: 'auto',
    badge: 'Smart Auto',
    description: 'Selects the fastest available free model automatically',
    speed: 'Dynamic',
  },
];

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessageItem[];
}

const STARTER_PROMPTS = [
  {
    icon: Code2,
    label: 'Explain async/await',
    prompt: 'Explain how async/await works in JavaScript with clear code examples.',
  },
  {
    icon: Zap,
    label: 'Debug TypeError',
    prompt: 'Help me debug this common error: "TypeError: Cannot read properties of undefined". Why does it happen and how do I prevent it?',
  },
  {
    icon: PenTool,
    label: 'Resume bullet points',
    prompt: 'Draft 4 high-impact, quantifiable resume bullet points for a modern React and Node.js developer.',
  },
  {
    icon: Brain,
    label: 'How LLMs work',
    prompt: 'Explain how Large Language Models (LLMs) and neural networks work using simple real-world analogies.',
  },
];

// Neo-Brutalist Markdown Formatter with Copy Code Buttons
const MarkdownRenderer: React.FC<{ content: string; isStreaming?: boolean }> = ({
  content,
  isStreaming,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const elements = useMemo(() => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    let codeBlockCount = 0;

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeIndex = codeBlockCount++;
        const firstLineBreak = part.indexOf('\n');
        const language =
          firstLineBreak !== -1 ? part.slice(3, firstLineBreak).trim() : '';
        const code =
          firstLineBreak !== -1
            ? part.slice(firstLineBreak + 1, -3)
            : part.slice(3, -3);

        return (
          <div
            key={index}
            className="my-3 rounded-xl border-2 border-black overflow-hidden bg-[#1E1E1E] text-white font-mono text-xs shadow-[2px_2px_0px_#000]"
          >
            <div className="px-4 py-2 bg-[#2D2D2D] border-b border-black flex items-center justify-between text-[11px] text-neutral-300">
              <span className="font-bold uppercase tracking-wider text-neutral-400 font-mono">
                {language || 'code'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(code, codeIndex)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                {copiedIndex === codeIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed text-emerald-300 font-mono">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const paragraphs = part.split('\n\n');
      return (
        <div key={index} className="space-y-3">
          {paragraphs.map((p, pIdx) => {
            if (!p.trim()) return null;

            if (p.startsWith('### ')) {
              return (
                <h4 key={pIdx} className="text-sm font-black text-black pt-2 pb-0.5">
                  {p.slice(4)}
                </h4>
              );
            }
            if (p.startsWith('## ')) {
              return (
                <h3 key={pIdx} className="text-base font-black text-black pt-2.5 pb-0.5">
                  {p.slice(3)}
                </h3>
              );
            }
            if (p.startsWith('# ')) {
              return (
                <h2 key={pIdx} className="text-lg font-black text-black pt-3 pb-1">
                  {p.slice(2)}
                </h2>
              );
            }

            const lines = p.split('\n');
            const isList = lines.every(
              (l) => l.trim().startsWith('* ') || l.trim().startsWith('- ') || /^\d+\.\s/.test(l.trim()),
            );

            if (isList) {
              return (
                <ul key={pIdx} className="space-y-1.5 my-1 pl-5 list-disc text-neutral-900 font-medium">
                  {lines.map((l, lIdx) => {
                    const clean = l.replace(/^(\*|-|\d+\.)\s+/, '');
                    return (
                      <li key={lIdx} className="leading-relaxed">
                        {renderInlineFormatting(clean)}
                      </li>
                    );
                  })}
                </ul>
              );
            }

            return (
              <p key={pIdx} className="leading-relaxed whitespace-pre-wrap text-black font-medium">
                {renderInlineFormatting(p)}
              </p>
            );
          })}
        </div>
      );
    });
  }, [content, copiedIndex]);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {elements}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-black animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );
};

function renderInlineFormatting(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((seg, i) => {
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-black/10 font-mono text-[11px] font-bold text-black border border-black/20"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={i} className="font-black text-black">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    return seg;
  });
}

export const AiChatPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    const initialSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Conversation',
      createdAt: Date.now(),
      messages: [],
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedId) return savedId;
    } catch {
      // fallback
    }
    return sessions[0]?.id || 'default';
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [likedMessages, setLikedMessages] = useState<Record<string, 'up' | 'down'>>({});

  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(MODEL_STORAGE_KEY);
      if (
        saved === 'meta/llama-3.3-70b-instruct' ||
        saved === 'gemini-2.0-flash' ||
        saved === 'gemini-1.5-flash'
      ) {
        return 'gemini-3.5-flash-lite';
      }
      if (saved && FREE_AI_MODELS.some((m) => m.id === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'gemini-3.5-flash-lite';
  });
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activeModel, setActiveModel] = useState<string>(() => {
    const match = FREE_AI_MODELS.find((m) => m.id === 'gemini-3.5-flash-lite');
    return match ? match.name : 'Gemini 3.5 Flash';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
    } catch {
      // ignore
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(INSPECTOR_OPEN_KEY, String(isInspectorOpen));
    } catch {
      // ignore
    }
  }, [isInspectorOpen]);

  const { isFullscreen, toggleFullscreen } = useFullscreenMode();

  useEffect(() => {
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, selectedModelId);
    } catch {
      // ignore
    }
    const match = FREE_AI_MODELS.find((m) => m.id === selectedModelId);
    if (match) setActiveModel(match.name);
  }, [selectedModelId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSession: ChatSession = useMemo(() => {
    return (
      sessions.find((s) => s.id === activeSessionId) ||
      sessions[0] || {
        id: 'default',
        title: 'New Conversation',
        createdAt: Date.now(),
        messages: [],
      }
    );
  }, [sessions, activeSessionId]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [sessions, searchQuery]);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    } catch {
      // ignore
    }
  }, [activeSessionId]);

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
    scrollToBottom(false);
  }, [activeSessionId]);

  useEffect(() => {
    if (isGenerating) {
      scrollToBottom(true);
    }
  }, [currentSession?.messages, isGenerating]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 180);
  };

  const handleCreateNewChat = () => {
    if (isGenerating) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
    }
    const newSession: ChatSession = {
      id: 'session-' + Date.now(),
      title: 'New Conversation',
      createdAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      const fresh: ChatSession = {
        id: 'session-' + Date.now(),
        title: 'New Conversation',
        createdAt: Date.now(),
        messages: [],
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      return;
    }
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id && updated[0]) {
      setActiveSessionId(updated[0].id);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('File size must be under 15MB', 'error');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isText =
      file.type.startsWith('text/') ||
      /\.(txt|json|csv|js|jsx|ts|tsx|py|html|css|md|yaml|yml|log|sh)$/i.test(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      let base64 = '';
      if (typeof result === 'string') {
        const commaIdx = result.indexOf(',');
        base64 = commaIdx !== -1 ? result.slice(commaIdx + 1) : result;
      }

      setAttachedFile({
        file,
        name: file.name,
        size: file.size,
        mimeType: file.type || (isText ? 'text/plain' : 'application/octet-stream'),
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        isImage,
        base64Data: base64,
        isText,
      });
      showToast(`Attached ${file.name}`, 'info');
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearAttachment = () => {
    if (attachedFile?.previewUrl) {
      URL.revokeObjectURL(attachedFile.previewUrl);
    }
    setAttachedFile(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputMessage;
    const text = rawText.trim();
    if ((!text && !attachedFile) || isGenerating) return;

    setInputMessage('');
    const currentAttachment = attachedFile;
    setAttachedFile(null);

    const userPromptText =
      text || (currentAttachment ? `Please analyze this attached file: ${currentAttachment.name}` : '');

    const userMsg: ChatMessageItem = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userPromptText,
      timestamp: Date.now(),
      attachment: currentAttachment
        ? {
            name: currentAttachment.name,
            mimeType: currentAttachment.mimeType,
            size: currentAttachment.size,
            previewUrl: currentAttachment.previewUrl,
            isImage: currentAttachment.isImage,
          }
        : undefined,
    };

    const botMsgId = 'msg-' + (Date.now() + 1);
    const initialBotMsg: ChatMessageItem = {
      id: botMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now() + 1,
    };

    const targetSessionId = currentSession.id;
    const isFirstMessage = currentSession.messages.length === 0;
    const newTitle = isFirstMessage
      ? userPromptText.slice(0, 32) + (userPromptText.length > 32 ? '...' : '')
      : currentSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMsg, initialBotMsg],
          };
        }
        return s;
      }),
    );

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const historyPayload = [
      ...currentSession.messages.slice(-12).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: userPromptText },
    ];

    let fullAnswer = '';
    const currentModelObj = FREE_AI_MODELS.find((m) => m.id === selectedModelId);

    const attachmentPayload = currentAttachment?.base64Data
      ? [
          {
            name: currentAttachment.name,
            mimeType: currentAttachment.mimeType,
            data: currentAttachment.base64Data,
            isText: currentAttachment.isText,
          },
        ]
      : undefined;

    await aiToolsApi.streamChat(
      {
        messages: historyPayload,
        model: selectedModelId === 'auto' ? undefined : selectedModelId,
        provider: currentModelObj?.provider,
        attachments: attachmentPayload,
        systemPrompt: systemPrompt.trim() || undefined,
        temperature,
      },
      (chunk: string) => {
        fullAnswer += chunk;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              const updatedMsgs = s.messages.map((m) => {
                if (m.id === botMsgId) {
                  return { ...m, content: fullAnswer };
                }
                return m;
              });
              return { ...s, messages: updatedMsgs };
            }
            return s;
          }),
        );
      },
      (meta) => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        if (meta.model) {
          const match = FREE_AI_MODELS.find((m) => m.id === meta.model);
          setActiveModel(match ? match.name : meta.model);
        }
      },
      (err) => {
        setIsGenerating(false);
        abortControllerRef.current = null;
        const errorText =
          fullAnswer ||
          `Sorry, I encountered an issue: ${err.message || 'Unable to generate response. Please check your connection or API key.'}`;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === targetSessionId) {
              const updatedMsgs = s.messages.map((m) => {
                if (m.id === botMsgId) {
                  return { ...m, content: errorText };
                }
                return m;
              });
              return { ...s, messages: updatedMsgs };
            }
            return s;
          }),
        );
        showToast(err.message || 'AI generation failed', 'error');
      },
      controller.signal,
    );
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
    showToast('Copied to clipboard', 'info');
  };

  const handleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser', 'error');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleLike = (msgId: string, type: 'up' | 'down') => {
    setLikedMessages((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined! : type,
    }));
  };

  const userInitials = useMemo(() => {
    if (!isAuthenticated || !user) return 'GU';
    const name = (user.name || user.username || 'User').trim();
    if (!name) return 'GU';
    const parts = name.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [user, isAuthenticated]);

  const userName = isAuthenticated && user ? (user.name || user.username || 'User') : 'Guest User';
  const userSubtext = isAuthenticated && user ? (user.role === 'admin' ? 'Admin Access' : 'Free Forever') : 'Sign in to sync';
  const userBadge = isAuthenticated && user ? (user.role === 'admin' ? 'Admin' : 'Free') : 'Guest';

  return (
    <div
      className={`w-full ${
        isFullscreen ? 'h-screen fixed inset-0 z-50 bg-[#FAF7F2]' : 'h-[calc(100vh-4rem)] bg-transparent'
      } text-black flex overflow-hidden font-sans select-text`}
    >
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
        />
      )}

      {/* Left Sidebar: Vexora Neo-Brutalist Theme */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-r-2 border-black flex flex-col transition-all duration-200 shrink-0 ${
          isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${
          isSidebarCollapsed
            ? 'md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0 pointer-events-none md:pointer-events-none'
            : 'md:w-72 md:opacity-100'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FACC15] border-2 border-black flex items-center justify-center text-black font-black text-xs shadow-[1.5px_1.5px_0px_#000]">
              V
            </div>
            <span className="font-black text-sm uppercase tracking-tight text-black">
              Vexora AI
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="p-1.5 rounded-lg border-2 border-black bg-[#FAF7F2] hover:bg-neutral-100 text-black shadow-[1px_1px_0px_#000] cursor-pointer"
              title="Search conversations"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className="hidden md:flex p-1.5 rounded-lg border-2 border-black bg-[#FAF7F2] hover:bg-neutral-100 text-black shadow-[1px_1px_0px_#000] cursor-pointer"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg border-2 border-black bg-[#FAF7F2] text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action: New Chat */}
        <div className="p-3 space-y-2 border-b-2 border-black bg-[#FAF7F2]">
          <button
            type="button"
            onClick={handleCreateNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-[#FACC15] hover:bg-yellow-400 text-black border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Conversation</span>
          </button>

          {isSearchOpen && (
            <div className="pt-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-white border-2 border-black rounded-xl px-2.5 py-1.5 text-xs text-black font-mono placeholder:text-neutral-500 focus:outline-none shadow-[1px_1px_0px_#000]"
              />
            </div>
          )}
        </div>

        {/* Conversations History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
          <div className="px-2 pt-2 pb-1 text-[10px] font-mono font-black text-neutral-500 uppercase tracking-wider">
            Conversations
          </div>
          {filteredSessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  setIsSidebarOpen(false);
                }}
                className={`group px-3 py-2 rounded-xl border-2 flex items-center justify-between gap-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white border-black text-black font-black shadow-[2px_2px_0px_#000]'
                    : 'border-transparent text-neutral-700 hover:text-black hover:bg-black/5 hover:border-black/20 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-black stroke-[2.5]' : 'text-neutral-500'
                    }`}
                  />
                  <span className="truncate flex-1 font-mono">{s.title}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: User Profile Card */}
        <div className="p-3 border-t-2 border-black bg-white">
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FAF7F2] border-2 border-black shadow-[1.5px_1.5px_0px_#000] hover:bg-[#FFF9D2] hover:-translate-y-0.5 transition-all cursor-pointer block"
            title={isAuthenticated ? 'View Account Dashboard' : 'Sign In to sync your chats'}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#FACC15] border-2 border-black text-black flex items-center justify-center font-black text-xs uppercase shrink-0 shadow-[1px_1px_0px_#000] overflow-hidden">
                {isAuthenticated && user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInitials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-black truncate leading-tight" title={userName}>
                  {userName}
                </p>
                <p className="text-[10px] font-mono font-bold text-neutral-500 leading-tight">
                  {userSubtext}
                </p>
              </div>
            </div>
            <div
              className={`px-2 py-0.5 rounded-md border border-black text-[9px] font-mono font-black uppercase ${
                isAuthenticated && user?.role === 'admin'
                  ? 'bg-[#F472B6] text-black'
                  : isAuthenticated
                  ? 'bg-[#4ADE80] text-black'
                  : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {userBadge}
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        {/* Top Header Bar */}
        <div className="h-14 border-b-2 border-black px-4 flex items-center justify-between gap-2 shrink-0 bg-white/85 backdrop-blur-md shadow-xs z-10">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Open Drawer */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg border-2 border-black bg-[#FAF7F2] text-black shadow-[1px_1px_0px_#000]"
            >
              <Menu className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Desktop Open Sidebar button if collapsed */}
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="hidden md:flex p-1.5 rounded-lg border-2 border-black bg-[#FAF7F2] hover:bg-neutral-100 text-black shadow-[1px_1px_0px_#000] cursor-pointer"
                title="Open sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {/* Free AI Model Dropdown */}
            <div className="relative" ref={modelDropdownRef}>
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-neutral-100 border-2 border-black text-xs font-black text-black shadow-[1.5px_1.5px_0px_#000] transition-all cursor-pointer active:translate-y-0.5"
              >
                <Bot className="w-3.5 h-3.5 text-neutral-700" />
                <span className="font-bold">{FREE_AI_MODELS.find((m) => m.id === selectedModelId)?.name || 'Gemini 3.5 Flash'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {isModelDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 border-b border-black/10 flex items-center justify-between text-[10px] font-mono font-black uppercase text-neutral-500">
                    <span>Select Free Model</span>
                    <span className="text-green-700 bg-green-100 px-1.5 py-0.2 rounded border border-green-300 font-bold">
                      100% Free
                    </span>
                  </div>
                  {FREE_AI_MODELS.map((m) => {
                    const isSelected = selectedModelId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedModelId(m.id);
                          setIsModelDropdownOpen(false);
                          setActiveModel(m.name);
                        }}
                        className={`w-full text-left p-2 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#FACC15] border-2 border-black shadow-[1.5px_1.5px_0px_#000]'
                            : 'hover:bg-neutral-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-black">{m.name}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full border border-black/30 bg-black/5 font-bold">
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-600 font-medium truncate mt-0.5">
                            {m.description}
                          </p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3] shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen / Focus Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black uppercase font-mono shadow-[1.5px_1.5px_0px_#000] transition-all cursor-pointer active:translate-y-0.5 ${
                isFullscreen
                  ? 'bg-[#FACC15] text-black'
                  : 'bg-[#FAF7F2] hover:bg-neutral-100 text-black'
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

            <button
              type="button"
              onClick={() => setIsInspectorOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black uppercase font-mono shadow-[1.5px_1.5px_0px_#000] transition-all cursor-pointer active:translate-y-0.5 ${
                isInspectorOpen
                  ? 'bg-[#FACC15] text-black'
                  : 'bg-[#FAF7F2] hover:bg-neutral-100 text-black'
              }`}
              title="Studio model parameters"
            >
              <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Parameters</span>
            </button>

            <button
              type="button"
              onClick={handleCreateNewChat}
              className="p-2 rounded-xl border-2 border-black bg-[#FAF7F2] hover:bg-yellow-400 text-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-all active:translate-y-0.5"
              title="New Conversation"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Center Chat Messages + Studio Inspector Side-by-Side */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Messages Flow Area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6"
            >
              {currentSession.messages.length === 0 ? (
                <div className="max-w-2xl mx-auto my-auto py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-150">
                  <div className="w-12 h-12 rounded-2xl bg-[#FACC15] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
                    <Sparkles className="w-6 h-6 stroke-[2.5]" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                      What can I help you build or learn today?
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto font-medium">
                      Powered by high-throughput multimodal AI models with zero paywalls or subscriptions.
                    </p>
                  </div>

                  {/* Starter Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg pt-2">
                    {STARTER_PROMPTS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(item.prompt)}
                          className="p-3.5 rounded-2xl border-2 border-black bg-white hover:bg-amber-50 text-left transition-all shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-3.5 h-3.5 text-neutral-600 group-hover:text-black transition-colors stroke-[2.5]" />
                            <span className="text-xs font-black text-black">{item.label}</span>
                          </div>
                          <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed font-medium">
                            {item.prompt}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto w-full space-y-6">
                  {currentSession.messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    const isLast = index === currentSession.messages.length - 1;

                    if (isUser) {
                      return (
                        <div key={msg.id} className="flex flex-col items-end gap-1.5">
                          <div className="rounded-3xl rounded-tr-xs bg-[#FACC15] text-black border-2 border-black px-5 py-3 text-sm font-semibold leading-relaxed max-w-xl shadow-[2px_2px_0px_#000]">
                            {msg.attachment && (
                              <div className="mb-2">
                                {msg.attachment.isImage && msg.attachment.previewUrl ? (
                                  <img
                                    src={msg.attachment.previewUrl}
                                    alt={msg.attachment.name}
                                    onClick={() => setPreviewModalImage(msg.attachment?.previewUrl || null)}
                                    className="max-h-60 max-w-full rounded-2xl border-2 border-black object-cover cursor-zoom-in hover:opacity-95 shadow-[1.5px_1.5px_0px_#000] transition-opacity"
                                  />
                                ) : (
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/10 border border-black text-xs font-mono font-bold text-black">
                                    <FileText className="w-4 h-4 text-black shrink-0" />
                                    <span className="truncate max-w-[200px]">{msg.attachment.name}</span>
                                    <span className="text-[10px] text-neutral-700 shrink-0">
                                      ({formatBytes(msg.attachment.size)})
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>

                          <div className="flex items-center gap-2 pr-2 text-neutral-500 text-xs font-mono">
                            <button
                              type="button"
                              onClick={() => copyMessage(msg.content, msg.id)}
                              className="p-1 hover:text-black transition-colors cursor-pointer"
                              title="Copy prompt"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Assistant Response Card (Neo-Brutalist Layout)
                    return (
                      <div key={msg.id} className="space-y-2">
                        <div className="rounded-2xl bg-white border-2 border-black overflow-hidden shadow-[3px_3px_0px_#000] text-black">
                          {/* Card Header (Response / Writing) */}
                          <div className="px-4 py-2 border-b-2 border-black bg-[#FAF7F2] flex items-center justify-between text-xs font-mono font-black text-black">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                              <span>VEXORA AI</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => copyMessage(msg.content, msg.id)}
                                className="p-1 hover:bg-black/10 rounded transition-colors cursor-pointer"
                                title="Copy response"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 sm:p-5 text-sm leading-relaxed">
                            <MarkdownRenderer
                              content={msg.content || (isGenerating && isLast ? 'Thinking...' : '')}
                              isStreaming={isGenerating && isLast}
                            />
                          </div>

                          {/* Suggested follow-up prompt pills */}
                          {isLast && !isGenerating && msg.content && (
                            <div className="px-4 pb-3.5 pt-2 border-t-2 border-black/10 flex flex-wrap gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => handleSendMessage('Make this shorter and more concise')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FACC15] text-black border border-black font-mono text-xs font-bold transition-all shadow-[1px_1px_0px_#000] cursor-pointer active:translate-y-0.5"
                              >
                                <span>↳ Make this shorter and more concise</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendMessage('Add practical code examples or a step-by-step breakdown')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FACC15] text-black border border-black font-mono text-xs font-bold transition-all shadow-[1px_1px_0px_#000] cursor-pointer active:translate-y-0.5"
                              >
                                <span>↳ Add practical code examples or step-by-step breakdown</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Action Bar Below Response */}
                        <div className="flex items-center gap-2 pl-1 text-neutral-600 text-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(msg.id, 'up')}
                            className={`p-1.5 rounded-lg border border-black/20 hover:border-black bg-white transition-all shadow-[1px_1px_0px_#000] cursor-pointer ${
                              likedMessages[msg.id] === 'up' ? 'bg-[#4ADE80] text-black font-bold' : 'hover:bg-neutral-100'
                            }`}
                            title="Helpful response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleLike(msg.id, 'down')}
                            className={`p-1.5 rounded-lg border border-black/20 hover:border-black bg-white transition-all shadow-[1px_1px_0px_#000] cursor-pointer ${
                              likedMessages[msg.id] === 'down' ? 'bg-red-200 text-black font-bold' : 'hover:bg-neutral-100'
                            }`}
                            title="Unhelpful response"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSpeech(msg.content)}
                            className="p-1.5 rounded-lg border border-black/20 hover:border-black bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black transition-all shadow-[1px_1px_0px_#000] cursor-pointer"
                            title="Read aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyMessage(msg.content, msg.id)}
                            className="p-1.5 rounded-lg border border-black/20 hover:border-black bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black transition-all shadow-[1px_1px_0px_#000] cursor-pointer"
                            title="Copy response"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const lastUser = [...currentSession.messages]
                                .reverse()
                                .find((m) => m.role === 'user');
                              if (lastUser) handleSendMessage(lastUser.content);
                            }}
                            className="p-1.5 rounded-lg border border-black/20 hover:border-black bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black transition-all shadow-[1px_1px_0px_#000] cursor-pointer"
                            title="Regenerate response"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Scroll to Bottom */}
            {showScrollBottom && (
              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-24 right-8 p-2 rounded-xl bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all"
                title="Scroll to bottom"
              >
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {/* Bottom Centered Capsule Input (ChatGPT layout + Vexora theme) */}
            <div className="max-w-3xl mx-auto w-full px-4 pb-3.5 pt-1 space-y-2">
              {attachedFile && (
                <div className="flex items-center gap-2 p-1.5 px-3 bg-amber-50 border-2 border-black rounded-2xl w-fit max-w-full text-xs text-black shadow-[2px_2px_0px_#000]">
                  {attachedFile.isImage && attachedFile.previewUrl ? (
                    <img
                      src={attachedFile.previewUrl}
                      alt={attachedFile.name}
                      className="w-8 h-8 rounded-lg object-cover border border-black shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-black flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-black" />
                    </div>
                  )}
                  <div className="min-w-0 pr-1">
                    <div className="font-bold text-black truncate max-w-[200px] sm:max-w-xs text-xs">
                      {attachedFile.name}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-600">
                      {formatBytes(attachedFile.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAttachment}
                    className="p-1 rounded-md hover:bg-black/10 text-neutral-600 hover:text-black cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="relative flex items-end gap-2 bg-white border-2 border-black rounded-3xl p-2 px-3 shadow-[3px_3px_0px_#000] focus-within:shadow-[4px_4px_0px_#000] transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,application/pdf,.txt,.json,.csv,.js,.jsx,.ts,.tsx,.py,.html,.css,.md,.yaml,.yml,.log,.sh"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                  className="p-2 rounded-full bg-[#FAF7F2] hover:bg-neutral-200 border-2 border-black text-black shadow-[1px_1px_0px_#000] cursor-pointer shrink-0 mb-0.5 transition-all"
                  title="Attach file (image, PDF, code, text)"
                  aria-label="Attach file"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>

                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Vexora AI anything..."
                  rows={1}
                  disabled={isGenerating}
                  className="w-full max-h-36 min-h-[38px] bg-transparent text-sm font-semibold text-black placeholder:text-neutral-500 focus:outline-none resize-none px-2 py-2"
                />

                {isGenerating ? (
                  <button
                    type="button"
                    onClick={handleStopGenerating}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 border-2 border-black text-white shadow-[1px_1px_0px_#000] shrink-0 cursor-pointer transition-all mb-0.5"
                    title="Stop generating"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!inputMessage.trim() && !attachedFile}
                    onClick={() => handleSendMessage()}
                    className="p-2 rounded-full bg-[#FACC15] hover:bg-yellow-400 border-2 border-black text-black shadow-[1.5px_1.5px_0px_#000] disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer active:translate-y-0.5 transition-all mb-0.5"
                    title="Send prompt"
                    aria-label="Send prompt"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-500 px-1 pt-0.5">
                <span>Vexora AI can make mistakes. Verify important info.</span>
                <span className="flex items-center gap-1 text-neutral-700">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Free Unlimited AI
                </span>
              </div>
            </div>
          </div>

          {/* Studio Parameters Slide-Over Inspector */}
          {isInspectorOpen && (
            <aside className="w-72 sm:w-80 border-l-2 border-black bg-white/95 backdrop-blur-md flex flex-col shrink-0 overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="p-3.5 border-b-2 border-black bg-[#FAF7F2] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 stroke-[2.5] text-black" />
                  <span className="font-mono font-black text-xs uppercase text-black">
                    Studio Parameters
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(false)}
                  className="p-1 rounded-md hover:bg-black/10 text-neutral-600 hover:text-black cursor-pointer"
                  title="Close parameters"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-5 flex-1 text-xs">
                {/* System Persona Instructions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono font-black text-[11px] uppercase text-black">
                      System Instructions
                    </label>
                    {systemPrompt && (
                      <button
                        type="button"
                        onClick={() => setSystemPrompt('')}
                        className="text-[10px] text-red-600 hover:underline font-mono cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Define custom persona, behavior, instructions or constraints..."
                    rows={4}
                    className="w-full text-xs font-mono bg-[#FAF7F2] border-2 border-black rounded-xl p-2.5 text-black placeholder:text-neutral-500 focus:outline-none focus:bg-white resize-none"
                  />

                  {/* Persona Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SYSTEM_PERSONAS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setSystemPrompt(p.prompt)}
                        className={`px-2 py-0.5 rounded-lg border border-black font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                          systemPrompt === p.prompt
                            ? 'bg-[#FACC15] text-black shadow-[1px_1px_0px_#000]'
                            : 'bg-[#FAF7F2] hover:bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-2 border-t-2 border-black/10 pt-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-black uppercase text-black">Temperature</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-[#FAF7F2] border border-black text-[11px] text-black">
                      {temperature.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500 font-bold">
                    <span>Strict (0.0)</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>

                {/* Engine Runtime Specs */}
                <div className="space-y-2 border-t-2 border-black/10 pt-4">
                  <span className="font-mono font-black text-[11px] uppercase text-black block">
                    Active Engine Specs
                  </span>
                  <div className="p-3 bg-[#FAF7F2] border-2 border-black rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Model:</span>
                      <span className="font-mono font-bold text-[11px] text-black truncate max-w-[130px]">
                        {selectedModelId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Pricing:</span>
                      <span className="text-green-700 bg-green-100 px-1.5 py-0.2 rounded border border-green-300 font-mono text-[10px] font-bold">
                        Free Unlimited
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Speed:</span>
                      <span className="font-mono font-bold text-[11px] text-black">~700ms TTFB</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white border-3 border-black rounded-2xl p-3 shadow-[8px_8px_0px_#000] flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between pb-2 px-1">
              <span className="text-xs font-mono font-bold text-neutral-700">Image Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalImage}
                  download="attachment-preview"
                  className="p-1.5 rounded-lg border-2 border-black bg-[#FAF7F2] hover:bg-neutral-100 text-black shadow-[1px_1px_0px_#000]"
                  title="Download image"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModalImage(null)}
                  className="p-1.5 rounded-lg border-2 border-black bg-[#FACC15] hover:bg-yellow-400 text-black shadow-[1px_1px_0px_#000] cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
            <img
              src={previewModalImage}
              alt="Full preview"
              className="max-h-[75vh] w-auto max-w-full rounded-xl border border-black/20 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default AiChatPage;
