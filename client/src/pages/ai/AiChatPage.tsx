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
  Clock,
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
  provider: 'gemini' | 'nvidia' | 'openrouter' | 'groq' | 'auto';
  badge: string;
  description: string;
  speed: string;
}

export const FREE_AI_MODELS: AIModelOption[] = [
  // 1. Smart Auto Router
  {
    id: 'auto',
    name: 'Auto Fast Router',
    provider: 'auto',
    badge: 'Smart Auto',
    description: 'Dynamic auto-routing & instant failover across all 4 providers',
    speed: 'Dynamic',
  },
  // 2. Groq LPU Ultra-Fast Hardware
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B (Groq LPU)',
    provider: 'groq',
    badge: '800 tps',
    description: 'High-throughput 120B flagship reasoning on Groq LPUs',
    speed: 'Instant',
  },
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B (Groq LPU)',
    provider: 'groq',
    badge: '15ms',
    description: 'Sub-20ms instant TTFT coding and conversation on Groq',
    speed: 'Ultra-Fast',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B (Groq LPU)',
    provider: 'groq',
    badge: 'Light LPU',
    description: 'Instant lightweight conversational LPU model for rapid Q&A',
    speed: 'Instant',
  },
  {
    id: 'allam-2-7b',
    name: 'Allam 2 7B (Groq LPU)',
    provider: 'groq',
    badge: 'Specialized',
    description: 'Fast analytical reasoning and bilingual support on Groq',
    speed: 'Ultra-Fast',
  },
  // 3. Google Gemini
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash',
    provider: 'gemini',
    badge: 'Google Fast',
    description: 'Google flagship multimodal model with instant ~700ms streaming',
    speed: 'Ultra-Fast',
  },
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash Lite (Latest)',
    provider: 'gemini',
    badge: 'Google Stable',
    description: 'High-speed, stable Google engine for technical answers & files',
    speed: 'Ultra-Fast',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    badge: 'Google 2.0',
    description: 'Next-gen Gemini engine with rich multimodal vision & reasoning',
    speed: 'Fast',
  },
  // 4. OpenRouter Free Network
  {
    id: 'openrouter/free',
    name: 'OpenRouter Free Router',
    provider: 'openrouter',
    badge: 'Free Router',
    description: 'Auto-routes to the best available free model across providers',
    speed: 'Multi-AI',
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Gemma 4 31B (OpenRouter)',
    provider: 'openrouter',
    badge: '31B Free',
    description: 'Google next-generation open-weights model via OpenRouter',
    speed: 'High-IQ',
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Gemma 4 26B (OpenRouter)',
    provider: 'openrouter',
    badge: '26B Free',
    description: 'Google high-speed balanced reasoning model via OpenRouter',
    speed: 'Fast',
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'Nemotron 3 Ultra 550B (OpenRouter)',
    provider: 'openrouter',
    badge: '550B Free',
    description: 'NVIDIA 550B massive reasoning powerhouse on OpenRouter',
    speed: 'Deep-Think',
  },
  {
    id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    name: 'Nemotron 3 Nano Omni (OpenRouter)',
    provider: 'openrouter',
    badge: 'Omni Free',
    description: 'NVIDIA reasoning & conversational model via OpenRouter',
    speed: 'Fast',
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'Nemotron 3.5 Lightning (OpenRouter)',
    provider: 'openrouter',
    badge: 'Lightning',
    description: 'NVIDIA low-latency NIM model on OpenRouter network',
    speed: 'Ultra-Fast',
  },
  {
    id: 'liquid/lfm-2.5-2.6b:free',
    name: 'LiquidAI LFM 2.5 (OpenRouter)',
    provider: 'openrouter',
    badge: 'Liquid AI',
    description: 'Liquid neural network architecture for dynamic context',
    speed: 'Ultra-Fast',
  },
  {
    id: 'cohere/north-mini-code:free',
    name: 'North Mini Code (OpenRouter)',
    provider: 'openrouter',
    badge: 'Code Free',
    description: 'Cohere code-generation and debugging specialist model',
    speed: 'Fast',
  },
  {
    id: 'dots-studio/dots-3-note-preview:free',
    name: 'Dots-3 Note (OpenRouter)',
    provider: 'openrouter',
    badge: 'Notes Free',
    description: 'Document summarization, note-taking, and synthesis',
    speed: 'Fast',
  },
  {
    id: 'thinkingmachines/inkling:free',
    name: 'Inkling (OpenRouter)',
    provider: 'openrouter',
    badge: 'Creative',
    description: 'Thinking Machines creative writing & explanatory assistant',
    speed: 'Fast',
  },
  {
    id: 'recursive/flint-v1.0:free',
    name: 'Recursive Flint (OpenRouter)',
    provider: 'openrouter',
    badge: 'Flint Free',
    description: 'Recursive Flint multi-step reasoning and analytical thinking',
    speed: 'Deep-Think',
  },
  // 5. NVIDIA NIM (Official)
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B Vision (NVIDIA NIM)',
    provider: 'nvidia',
    badge: '90B NIM',
    description: 'Official NVIDIA NIM high-capacity vision, reasoning & coding',
    speed: 'High-IQ',
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
    prompt:
      'Help me debug this common error: "TypeError: Cannot read properties of undefined". Why does it happen and how do I prevent it?',
  },
  {
    icon: PenTool,
    label: 'Resume bullet points',
    prompt:
      'Draft 4 high-impact, quantifiable resume bullet points for a modern React and Node.js developer.',
  },
  {
    icon: Brain,
    label: 'How LLMs work',
    prompt:
      'Explain how Large Language Models (LLMs) and neural networks work using simple real-world analogies.',
  },
];

// Intelligent Neo-Brutalist Markdown Normalizer & Formatter
function normalizeMarkdown(text: string): string {
  // If the model squished multiple bullets onto one line (e.g. "Game Elements * **Avatar:** ... * **Environment:**")
  let normalized = text.replace(/([^\n])\s+([*•-])\s+(\*\*[^*]+\*\*)/g, '$1\n$2 $3');
  // Handle numbered lists squished onto one line
  normalized = normalized.replace(/([^\n])\s+(\d+\.)\s+(\*\*[^*]+\*\*)/g, '$1\n$2 $3');
  // Handle inline emoji headers followed immediately by bullets
  normalized = normalized.replace(/([^\n])\s+([*•-])\s+/g, (match, prefix, bullet) => {
    // If preceded by punctuation or emoji, ensure newline
    if (/[:.!?]/.test(prefix) || /\p{Extended_Pictographic}/u.test(prefix)) {
      return `${prefix}\n${bullet} `;
    }
    return match;
  });
  return normalized;
}

interface MarkdownBlock {
  type: 'heading' | 'list' | 'quote' | 'paragraph';
  level?: number;
  ordered?: boolean;
  items?: string[];
  text?: string;
}

function parseMarkdownBlocks(rawText: string): MarkdownBlock[] {
  const normalized = normalizeMarkdown(rawText);
  const lines = normalized.split('\n');
  const blocks: MarkdownBlock[] = [];

  let currentList: { ordered: boolean; items: string[] } | null = null;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', text: currentParagraph.join(' ') });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push({ type: 'list', ordered: currentList.ordered, items: currentList.items });
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] || '';
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Heading: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch && headingMatch[1] && headingMatch[2]) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      continue;
    }

    // Blockquote: >
    if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'quote',
        text: trimmed.replace(/^>\s*/, ''),
      });
      continue;
    }

    // Unordered list item: * or - or •
    const bulletMatch = trimmed.match(/^([*•-]|\*\*)\s+(.*)$/);
    if (bulletMatch && bulletMatch[2]) {
      flushParagraph();
      if (!currentList || currentList.ordered) {
        flushList();
        currentList = { ordered: false, items: [] };
      }
      currentList.items.push(bulletMatch[2]);
      continue;
    }

    // Ordered list item: 1. or 2.
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch && orderedMatch[2]) {
      flushParagraph();
      if (!currentList || !currentList.ordered) {
        flushList();
        currentList = { ordered: true, items: [] };
      }
      currentList.items.push(orderedMatch[2]);
      continue;
    }

    // Indented continuation of list item
    if (currentList && (rawLine.startsWith('   ') || rawLine.startsWith('\t'))) {
      const lastIdx = currentList.items.length - 1;
      currentList.items[lastIdx] += ' ' + trimmed;
      continue;
    }

    // Regular paragraph line
    flushList();
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}

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
        const language = firstLineBreak !== -1 ? part.slice(3, firstLineBreak).trim() : '';
        const code = firstLineBreak !== -1 ? part.slice(firstLineBreak + 1, -3) : part.slice(3, -3);

        return (
          <div
            key={index}
            className="my-3 rounded-xl border border-[var(--theme-gray-border)] overflow-hidden bg-[#1E1E1E] text-white font-mono text-xs shadow-xs"
          >
            <div className="px-4 py-2 bg-[#2D2D2D] border-b border-[var(--theme-gray-border)] flex items-center justify-between text-[11px] text-neutral-300">
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

      const blocks = parseMarkdownBlocks(part);
      return (
        <div key={index} className="space-y-3">
          {blocks.map((block, bIdx) => {
            if (block.type === 'heading') {
              if (block.level === 1) {
                return (
                  <h2
                    key={bIdx}
                    className="text-lg font-bold text-[var(--theme-dirty-white)] pt-3 pb-1 border-b border-[var(--theme-gray-border)]"
                  >
                    {renderInlineFormatting(block.text || '')}
                  </h2>
                );
              }
              if (block.level === 2) {
                return (
                  <h3 key={bIdx} className="text-base font-bold text-[var(--theme-dirty-white)] pt-2.5 pb-0.5">
                    {renderInlineFormatting(block.text || '')}
                  </h3>
                );
              }
              return (
                <h4 key={bIdx} className="text-sm font-bold text-[var(--theme-dirty-white)] pt-2 pb-0.5">
                  {renderInlineFormatting(block.text || '')}
                </h4>
              );
            }

            if (block.type === 'quote') {
              return (
                <blockquote
                  key={bIdx}
                  className="my-2 pl-3 py-1.5 border-l-2 border-[var(--theme-dirty-white)] bg-[var(--theme-surface-raised)] rounded-r-xl text-[var(--theme-dirty-white-muted)] font-normal italic text-xs leading-relaxed"
                >
                  {renderInlineFormatting(block.text || '')}
                </blockquote>
              );
            }

            if (block.type === 'list' && block.items) {
              if (block.ordered) {
                return (
                  <ol
                    key={bIdx}
                    className="space-y-1.5 my-2 pl-5 list-decimal text-[var(--theme-dirty-white)] font-normal"
                  >
                    {block.items.map((item, iIdx) => (
                      <li key={iIdx} className="leading-relaxed">
                        {renderInlineFormatting(item)}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <ul
                  key={bIdx}
                  className="space-y-1.5 my-2 pl-5 list-disc text-[var(--theme-dirty-white)] font-normal"
                >
                  {block.items.map((item, iIdx) => (
                    <li key={iIdx} className="leading-relaxed">
                      {renderInlineFormatting(item)}
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={bIdx} className="leading-relaxed text-[var(--theme-dirty-white)] font-normal">
                {renderInlineFormatting(block.text || '')}
              </p>
            );
          })}
        </div>
      );
    });
  }, [content, copiedIndex]);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-[var(--theme-dirty-white)]">
      {elements}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-[var(--theme-dirty-white)] animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );
};

function renderInlineFormatting(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((seg, i) => {
    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[var(--theme-surface-raised)] font-mono text-[11px] font-bold text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)]"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      return (
        <strong key={i} className="font-bold text-[var(--theme-dirty-white)]">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2 && !seg.startsWith('**')) {
      return (
        <em key={i} className="italic text-[var(--theme-dirty-white-muted)]">
          {seg.slice(1, -1)}
        </em>
      );
    }
    return seg;
  });
}

export const AiChatPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const initialSession: ChatSession = {
      id: 'draft-' + Date.now(),
      title: 'New Conversation',
      createdAt: Date.now(),
      messages: [],
    };
    return [initialSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(
    () => sessions[0]?.id || 'default',
  );
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

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

  // Cloud session synchronization (MongoDB is sole source of truth - zero localStorage for user chats)
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const syncCloudSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const res = await aiToolsApi.listChatSessions();
        if (!isMounted) return;

        if (res?.success && Array.isArray(res.data?.sessions)) {
          if (res.data.sessions.length > 0) {
            const serverSessions: ChatSession[] = res.data.sessions.map((s: any) => ({
              id: s.id,
              title: s.title,
              createdAt: s.createdAt,
              messages: [],
            }));
            setSessions(serverSessions);
            const firstId = serverSessions[0]?.id;
            if (firstId) {
              setActiveSessionId(firstId);

              // Fetch messages for the first active session
              const detailRes = await aiToolsApi.getChatSession(firstId);
              if (detailRes?.success && detailRes.data?.session && isMounted) {
                setSessions((prev) =>
                  prev.map((item) =>
                    item.id === firstId
                      ? { ...item, messages: (detailRes.data!.session.messages as any) || [] }
                      : item,
                  ),
                );
              }
            }
          } else {
            // One-time migration for legacy localStorage chats if any exist
            try {
              const legacySaved = localStorage.getItem('vexora_ai_chat_sessions');
              if (legacySaved) {
                const parsed = JSON.parse(legacySaved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  for (const legacy of parsed.slice(0, 10)) {
                    if (legacy.messages && legacy.messages.length > 0) {
                      await aiToolsApi.createChatSession({
                        title: legacy.title,
                        selectedModel: selectedModelId,
                        messages: legacy.messages,
                      });
                    }
                  }
                  localStorage.removeItem('vexora_ai_chat_sessions');
                  const reRes = await aiToolsApi.listChatSessions();
                  if (
                    reRes?.success &&
                    Array.isArray(reRes.data?.sessions) &&
                    reRes.data.sessions.length > 0
                  ) {
                    const migratedList: ChatSession[] = reRes.data.sessions.map((s: any) => ({
                      id: s.id,
                      title: s.title,
                      createdAt: s.createdAt,
                      messages: [],
                    }));
                    setSessions(migratedList);
                    const firstMigratedId = migratedList[0]?.id;
                    if (firstMigratedId) {
                      setActiveSessionId(firstMigratedId);
                      const det = await aiToolsApi.getChatSession(firstMigratedId);
                      if (det?.success && det.data?.session && isMounted) {
                        setSessions((prev) =>
                          prev.map((item) =>
                            item.id === firstMigratedId
                              ? { ...item, messages: (det.data!.session.messages as any) || [] }
                              : item,
                          ),
                        );
                      }
                    }
                    return;
                  }
                }
              }
            } catch {
              // Ignore migration error
            }

            const fresh: ChatSession = {
              id: 'draft-' + Date.now(),
              title: 'New Conversation',
              createdAt: Date.now(),
              messages: [],
            };
            setSessions([fresh]);
            setActiveSessionId(fresh.id);
          }
        }
      } catch (err) {
        console.error('Failed to sync cloud sessions', err);
      } finally {
        if (isMounted) setIsLoadingSessions(false);
      }
    };

    syncCloudSessions();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsSidebarOpen(false);

    if (isAuthenticated && !sessionId.startsWith('draft-')) {
      const found = sessions.find((s) => s.id === sessionId);
      if (!found || found.messages.length === 0) {
        try {
          const res = await aiToolsApi.getChatSession(sessionId);
          if (res?.success && res.data?.session) {
            setSessions((prev) =>
              prev.map((item) =>
                item.id === sessionId
                  ? { ...item, messages: (res.data!.session.messages as any) || [] }
                  : item,
              ),
            );
          }
        } catch (err) {
          console.error('Failed to load session messages', err);
        }
      }
    }
  };

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
    const draftId = 'draft-' + Date.now();
    const newSession: ChatSession = {
      id: draftId,
      title: 'New Conversation',
      createdAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(draftId);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated && !id.startsWith('draft-')) {
      try {
        await aiToolsApi.deleteChatSession(id);
      } catch (err) {
        showToast('Failed to delete cloud conversation', 'error');
      }
    }

    if (sessions.length <= 1) {
      const fresh: ChatSession = {
        id: 'draft-' + Date.now(),
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
    const firstUpdated = updated[0];
    if (activeSessionId === id && firstUpdated) {
      handleSelectSession(firstUpdated.id);
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
      text ||
      (currentAttachment ? `Please analyze this attached file: ${currentAttachment.name}` : '');

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

        // Persist to MongoDB cloud if authenticated (pure cloud storage - zero localStorage for user chats)
        if (isAuthenticated) {
          const completedMsgs = [
            ...currentSession.messages,
            userMsg,
            { ...initialBotMsg, content: fullAnswer },
          ];

          if (targetSessionId.startsWith('draft-') || targetSessionId.startsWith('session-')) {
            aiToolsApi
              .createChatSession({
                title: newTitle,
                selectedModel: selectedModelId,
                messages: completedMsgs,
              })
              .then((res) => {
                if (res?.success && res.data?.session?.id) {
                  const dbId = res.data.session.id;
                  setSessions((prev) =>
                    prev.map((s) => (s.id === targetSessionId ? { ...s, id: dbId } : s)),
                  );
                  setActiveSessionId((prevActive) =>
                    prevActive === targetSessionId ? dbId : prevActive,
                  );
                }
              })
              .catch((e) => console.error('Cloud chat save failed', e));
          } else {
            aiToolsApi
              .updateChatSession(targetSessionId, {
                title: newTitle,
                selectedModel: selectedModelId,
                messages: completedMsgs,
              })
              .catch((e) => console.error('Cloud chat update failed', e));
          }
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

        // Persist partial/error response to cloud as well so conversation isn't lost
        if (isAuthenticated) {
          const completedMsgs = [
            ...currentSession.messages,
            userMsg,
            { ...initialBotMsg, content: errorText },
          ];
          if (targetSessionId.startsWith('draft-') || targetSessionId.startsWith('session-')) {
            aiToolsApi
              .createChatSession({
                title: newTitle,
                selectedModel: selectedModelId,
                messages: completedMsgs,
              })
              .then((res) => {
                if (res?.success && res.data?.session?.id) {
                  const dbId = res.data.session.id;
                  setSessions((prev) =>
                    prev.map((s) => (s.id === targetSessionId ? { ...s, id: dbId } : s)),
                  );
                  setActiveSessionId((prevActive) =>
                    prevActive === targetSessionId ? dbId : prevActive,
                  );
                }
              })
              .catch((e) => console.error('Cloud chat save failed', e));
          } else {
            aiToolsApi
              .updateChatSession(targetSessionId, {
                title: newTitle,
                selectedModel: selectedModelId,
                messages: completedMsgs,
              })
              .catch((e) => console.error('Cloud chat update failed', e));
          }
        }
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
      const p0 = parts[0];
      const p1 = parts[1];
      if (p0 && p1) {
        return ((p0[0] || '') + (p1[0] || '')).toUpperCase();
      }
    }
    return name.slice(0, 2).toUpperCase();
  }, [user, isAuthenticated]);

  const userName = isAuthenticated && user ? user.name || user.username || 'User' : 'Guest User';
  const userSubtext =
    isAuthenticated && user
      ? user.role === 'admin'
        ? 'Admin Access'
        : 'Free Forever'
      : 'Sign in to sync';
  const userBadge = isAuthenticated && user ? (user.role === 'admin' ? 'Admin' : 'Free') : 'Guest';

  return (
    <div
      className={`w-full ${
        isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'
      } bg-transparent text-slate-100 flex overflow-hidden font-sans select-text`}
    >
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 bg-[var(--theme-surface)] border-r border-[var(--theme-gray-border)] flex flex-col transition-all duration-200 shrink-0 ${
          isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${
          isSidebarCollapsed
            ? 'md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0 pointer-events-none md:pointer-events-none'
            : 'md:w-72 md:opacity-100'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-[var(--theme-gray-border)] flex items-center justify-between bg-[var(--theme-surface-raised)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border border-[var(--theme-gray-border)] flex items-center justify-center font-black text-xs shadow-xs">
              V
            </div>
            <span className="font-black text-sm uppercase tracking-tight text-[var(--theme-dirty-white)]">
              Vexora AI
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs cursor-pointer"
              title="Search conversations"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className="hidden md:flex p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs cursor-pointer"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] text-[var(--theme-dirty-white)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action: New Chat */}
        <div className="p-3 space-y-2 border-b border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)]">
          <button
            type="button"
            onClick={handleCreateNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] border border-[var(--theme-gray-border)] font-black text-xs uppercase flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
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
                className="w-full bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] rounded-xl px-2.5 py-1.5 text-xs font-mono placeholder:text-[var(--theme-gray-muted)] focus:outline-none shadow-xs"
              />
            </div>
          )}
        </div>

        {/* Conversations History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
          <div className="px-2 pt-2 pb-1 text-[10px] font-mono font-black text-[var(--theme-gray-muted)] uppercase tracking-wider">
            Conversations
          </div>
          {filteredSessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                className={`group px-3 py-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[var(--theme-surface-raised)] border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] font-black shadow-xs'
                    : 'border-transparent text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] hover:bg-[var(--theme-surface-raised)] hover:border-[var(--theme-gray-border)] font-semibold'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-[var(--theme-dirty-white)] stroke-[2.5]' : 'text-[var(--theme-gray-muted)]'
                    }`}
                  />
                  <span className="truncate flex-1 font-mono">{s.title}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Notice Banners */}
        <div className="px-3 py-2 space-y-2 border-t border-[var(--theme-gray-border)] bg-[var(--theme-surface)]">
          {!isAuthenticated && (
            <div className="p-2.5 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-xs text-[var(--theme-dirty-white)] shadow-xs">
              <span className="font-black block text-[10px] uppercase font-mono tracking-wide text-[var(--theme-dirty-white)]">
                Cross-Device Sync
              </span>
              <span className="text-[11px] leading-tight text-[var(--theme-gray-muted)] block mt-0.5">
                Sign in to save and access your conversations across your phone, tablet, and
                computer.
              </span>
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-xs text-[var(--theme-dirty-white)] flex items-start gap-2 shadow-xs">
            <Clock className="w-4 h-4 text-[var(--theme-gray-muted)] shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-[10px] uppercase font-mono tracking-wide text-[var(--theme-dirty-white)]">
                12-Day Cloud Storage
              </span>
              <span className="text-[11px] leading-tight text-[var(--theme-gray-muted)] block mt-0.5">
                Inactive conversations are automatically cleared after 12 days to optimize storage.
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: User Profile Card */}
        <div className="p-3 border-t border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)]">
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] shadow-xs hover:bg-[var(--theme-gray-border)] hover:-translate-y-0.5 transition-all cursor-pointer block"
            title={isAuthenticated ? 'View Account Dashboard' : 'Sign In to sync your chats'}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] flex items-center justify-center font-black text-xs uppercase shrink-0 shadow-xs overflow-hidden">
                {isAuthenticated && user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-black text-[var(--theme-dirty-white)] truncate leading-tight"
                  title={userName}
                >
                  {userName}
                </p>
                <p className="text-[10px] font-mono font-bold text-[var(--theme-gray-muted)] leading-tight">
                  {userSubtext}
                </p>
              </div>
            </div>
            <div
              className="px-2 py-0.5 rounded-md border border-[var(--theme-gray-border)] text-[9px] font-mono font-black uppercase bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)]"
            >
              {userBadge}
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        {/* Top Header Bar */}
        <div className="h-14 border-b border-[var(--theme-gray-border)] px-4 flex items-center justify-between gap-2 shrink-0 bg-[var(--theme-surface)] shadow-xs z-10">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Open Drawer */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] shadow-xs"
            >
              <Menu className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Desktop Open Sidebar button if collapsed */}
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="hidden md:flex p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] text-xs font-black text-[var(--theme-dirty-white)] shadow-xs transition-all cursor-pointer active:translate-y-0.5"
              >
                <Bot className="w-3.5 h-3.5 text-[var(--theme-gray-muted)]" />
                <span className="font-bold text-[var(--theme-dirty-white)]">
                  {FREE_AI_MODELS.find((m) => m.id === selectedModelId)?.name || 'Gemini 3.5 Flash'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--theme-gray-muted)]" />
              </button>

              {isModelDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-88 max-h-[28rem] overflow-y-auto bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] rounded-2xl shadow-md p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="sticky top-0 bg-[var(--theme-surface-raised)] backdrop-blur-xs px-2.5 py-1.5 border-b border-[var(--theme-gray-border)] flex items-center justify-between text-[10px] font-mono font-black uppercase text-[var(--theme-gray-muted)] z-10">
                    <span>Select Free Model ({FREE_AI_MODELS.length} Available)</span>
                    <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800 font-bold">
                      All 100% Free
                    </span>
                  </div>
                  {FREE_AI_MODELS.map((m, idx) => {
                    const isSelected = selectedModelId === m.id;
                    const prevModel = idx > 0 ? FREE_AI_MODELS[idx - 1] : null;
                    const isNewProvider = !prevModel || prevModel.provider !== m.provider;
                    const providerLabel =
                      m.provider === 'auto'
                        ? 'Smart Router'
                        : m.provider === 'groq'
                          ? 'Groq LPU (Ultra-Fast Hardware)'
                          : m.provider === 'gemini'
                            ? 'Google Gemini'
                            : m.provider === 'openrouter'
                              ? 'OpenRouter Free Network'
                              : 'NVIDIA NIM (Official)';

                    return (
                      <React.Fragment key={m.id}>
                        {isNewProvider && (
                          <div className="pt-2 pb-0.5 px-2 text-[10px] font-mono font-black uppercase tracking-wider text-[var(--theme-gray-muted)] flex items-center gap-1.5">
                            <span>{providerLabel}</span>
                            <div className="flex-1 h-[1px] bg-[var(--theme-gray-border)]" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModelId(m.id);
                            setIsModelDropdownOpen(false);
                            setActiveModel(m.name);
                          }}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border border-[var(--theme-gray-border)] shadow-xs'
                              : 'hover:bg-[var(--theme-surface-raised)] border-2 border-transparent'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-slate-100">{m.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] font-bold">
                                {m.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                              {m.description}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-slate-100 stroke-[3] shrink-0 mt-0.5" />
                          )}
                        </button>
                      </React.Fragment>
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
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] text-xs font-black uppercase font-mono shadow-xs transition-all cursor-pointer active:translate-y-0.5 ${
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

            <button
              type="button"
              onClick={() => setIsInspectorOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] text-xs font-black uppercase font-mono shadow-xs transition-all cursor-pointer active:translate-y-0.5 ${
                isInspectorOpen
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]'
                  : 'bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)]'
              }`}
              title="Studio model parameters"
            >
              <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Parameters</span>
            </button>

            <button
              type="button"
              onClick={handleCreateNewChat}
              className="p-2 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-dirty-white)] hover:text-[var(--theme-canvas)] text-[var(--theme-dirty-white)] shadow-xs cursor-pointer transition-all active:translate-y-0.5"
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
                  <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] flex items-center justify-center shadow-xs">
                    <Sparkles className="w-6 h-6 stroke-[2.5]" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                      What can I help you build or learn today?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto font-medium">
                      Powered by high-throughput multimodal AI models with zero paywalls or
                      subscriptions.
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
                          className="p-3.5 rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-left transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-3.5 h-3.5 text-[var(--theme-gray-muted)] group-hover:text-[var(--theme-dirty-white)] transition-colors stroke-[2.5]" />
                            <span className="text-xs font-black text-[var(--theme-dirty-white)]">{item.label}</span>
                          </div>
                          <p className="text-[11px] text-[var(--theme-gray-muted)] line-clamp-2 leading-relaxed font-medium">
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
                          <div className="rounded-3xl rounded-tr-xs bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] px-5 py-3 text-sm font-semibold leading-relaxed max-w-xl shadow-xs">
                            {msg.attachment && (
                              <div className="mb-2">
                                {msg.attachment.isImage && msg.attachment.previewUrl ? (
                                  <img
                                    src={msg.attachment.previewUrl}
                                    alt={msg.attachment.name}
                                    onClick={() =>
                                      setPreviewModalImage(msg.attachment?.previewUrl || null)
                                    }
                                    className="max-h-60 max-w-full rounded-2xl border border-[var(--theme-gray-border)] object-cover cursor-zoom-in hover:opacity-95 shadow-xs transition-opacity"
                                  />
                                ) : (
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-xs font-mono font-bold text-slate-100">
                                    <FileText className="w-4 h-4 text-slate-100 shrink-0" />
                                    <span className="truncate max-w-[200px]">
                                      {msg.attachment.name}
                                    </span>
                                    <span className="text-[10px] text-slate-300 shrink-0">
                                      ({formatBytes(msg.attachment.size)})
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>

                          <div className="flex items-center gap-2 pr-2 text-slate-400 text-xs font-mono">
                            <button
                              type="button"
                              onClick={() => copyMessage(msg.content, msg.id)}
                              className="p-1 hover:text-slate-100 transition-colors cursor-pointer"
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
                        <div className="rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] overflow-hidden shadow-xs">
                          {/* Card Header (Response / Writing) */}
                          <div className="px-4 py-2 border-b border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] flex items-center justify-between text-xs font-mono font-black text-[var(--theme-dirty-white)]">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[var(--theme-dirty-white)] stroke-[2.5]" />
                              <span>VEXORA AI</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => copyMessage(msg.content, msg.id)}
                                className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                                title="Copy response"
                              >
                                {copiedMessageId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
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
                            <div className="px-4 pb-3.5 pt-2 border-t border-[var(--theme-gray-border)] flex flex-wrap gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSendMessage('Make this shorter and more concise')
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-dirty-white)] hover:text-[var(--theme-canvas)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] font-mono text-xs font-bold transition-all shadow-xs cursor-pointer active:translate-y-0.5"
                              >
                                <span>↳ Make this shorter and more concise</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSendMessage(
                                    'Add practical code examples or a step-by-step breakdown',
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-dirty-white)] hover:text-[var(--theme-canvas)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] font-mono text-xs font-bold transition-all shadow-xs cursor-pointer active:translate-y-0.5"
                              >
                                <span>↳ Add practical code examples or step-by-step breakdown</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Action Bar Below Response */}
                        <div className="flex items-center gap-2 pl-1 text-[var(--theme-gray-muted)] text-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(msg.id, 'up')}
                            className={`p-1.5 rounded-lg border transition-all shadow-xs cursor-pointer ${
                              likedMessages[msg.id] === 'up'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800 font-bold'
                                : 'border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-gray-border)]'
                            }`}
                            title="Helpful response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleLike(msg.id, 'down')}
                            className={`p-1.5 rounded-lg border transition-all shadow-xs cursor-pointer ${
                              likedMessages[msg.id] === 'down'
                                ? 'bg-red-950/60 text-red-400 border-red-800 font-bold'
                                : 'border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] hover:bg-[var(--theme-gray-border)]'
                            }`}
                            title="Unhelpful response"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSpeech(msg.content)}
                            className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] transition-all shadow-xs cursor-pointer"
                            title="Read aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyMessage(msg.content, msg.id)}
                            className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] transition-all shadow-xs cursor-pointer"
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
                            className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] transition-all shadow-xs cursor-pointer"
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
                className="absolute bottom-24 right-8 p-2 rounded-xl bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] shadow-xs cursor-pointer transition-all"
                title="Scroll to bottom"
              >
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {/* Bottom Centered Capsule Input (ChatGPT layout + Vexora theme) */}
            <div className="max-w-3xl mx-auto w-full px-4 pb-3.5 pt-1 space-y-2">
              {attachedFile && (
                <div className="flex items-center gap-2 p-1.5 px-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl w-fit max-w-full text-xs text-[var(--theme-dirty-white)] shadow-xs">
                  {attachedFile.isImage && attachedFile.previewUrl ? (
                    <img
                      src={attachedFile.previewUrl}
                      alt={attachedFile.name}
                      className="w-8 h-8 rounded-lg object-cover border border-[var(--theme-gray-border)] shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[var(--theme-dirty-white)]" />
                    </div>
                  )}
                  <div className="min-w-0 pr-1">
                    <div className="font-bold text-slate-100 truncate max-w-[200px] sm:max-w-xs text-xs">
                      {attachedFile.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {formatBytes(attachedFile.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAttachment}
                    className="p-1 rounded-md hover:bg-black/10 text-slate-400 hover:text-slate-100 cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="relative flex items-end gap-2 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] rounded-3xl p-2 px-3 shadow-xs focus-within:border-[var(--theme-dirty-white)] transition-all">
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
                  className="p-2 rounded-full bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs cursor-pointer shrink-0 mb-0.5 transition-all"
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
                  className="w-full max-h-36 min-h-[38px] bg-transparent text-sm font-semibold text-[var(--theme-dirty-white)] placeholder:text-[var(--theme-gray-muted)] border-0 border-none outline-none focus:outline-none focus:border-0 focus:ring-0 shadow-none resize-none px-2 py-2"
                  style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                />

                {isGenerating ? (
                  <button
                    type="button"
                    onClick={handleStopGenerating}
                    className="p-2 rounded-full bg-red-600 hover:bg-red-700 border border-[var(--theme-gray-border)] text-white shadow-xs shrink-0 cursor-pointer transition-all mb-0.5"
                    title="Stop generating"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!inputMessage.trim() && !attachedFile}
                    onClick={() => handleSendMessage()}
                    className="p-2 rounded-full bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer active:translate-y-0.5 transition-all mb-0.5"
                    title="Send prompt"
                    aria-label="Send prompt"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 px-1 pt-0.5">
                <span>Vexora AI can make mistakes. Verify important info.</span>
                <span className="flex items-center gap-1 text-[var(--theme-gray-muted)]">
                  <Zap className="w-3 h-3 text-[var(--theme-dirty-white)] fill-[var(--theme-dirty-white)]" /> Free Unlimited AI
                </span>
              </div>
            </div>
          </div>

          {/* Studio Parameters Slide-Over Inspector */}
          {isInspectorOpen && (
            <aside className="w-72 sm:w-80 border-l border-[var(--theme-gray-border)] bg-[var(--theme-surface)] flex flex-col shrink-0 overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-150">
              <div className="p-3.5 border-b border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 stroke-[2.5] text-[var(--theme-dirty-white)]" />
                  <span className="font-mono font-black text-xs uppercase text-[var(--theme-dirty-white)]">
                    Studio Parameters
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(false)}
                  className="p-1 rounded-md hover:bg-[var(--theme-surface-raised)] text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] cursor-pointer"
                  title="Close parameters"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-5 flex-1 text-xs">
                {/* System Persona Instructions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono font-black text-[11px] uppercase text-[var(--theme-dirty-white)]">
                      System Instructions
                    </label>
                    {systemPrompt && (
                      <button
                        type="button"
                        onClick={() => setSystemPrompt('')}
                        className="text-[10px] text-red-400 hover:underline font-mono cursor-pointer"
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
                    className="w-full text-xs font-mono bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl p-2.5 text-[var(--theme-dirty-white)] placeholder:text-[var(--theme-gray-muted)] focus:outline-none focus:border-[var(--theme-dirty-white)] resize-none"
                  />

                  {/* Persona Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SYSTEM_PERSONAS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setSystemPrompt(p.prompt)}
                        className={`px-2 py-0.5 rounded-lg border border-[var(--theme-gray-border)] font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                          systemPrompt === p.prompt
                            ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                            : 'bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-2 border-t border-[var(--theme-gray-border)] pt-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-black uppercase text-[var(--theme-dirty-white)]">Temperature</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[11px] text-[var(--theme-dirty-white)]">
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
                    className="w-full accent-neutral-300 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[var(--theme-gray-muted)] font-bold">
                    <span>Strict (0.0)</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>

                {/* Engine Runtime Specs */}
                <div className="space-y-2 border-t border-[var(--theme-gray-border)] pt-4">
                  <span className="font-mono font-black text-[11px] uppercase text-[var(--theme-dirty-white)] block">
                    Active Engine Specs
                  </span>
                  <div className="p-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--theme-gray-muted)] font-medium">Model:</span>
                      <span className="font-mono font-bold text-[11px] text-[var(--theme-dirty-white)] truncate max-w-[130px]">
                        {selectedModelId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--theme-gray-muted)] font-medium">Pricing:</span>
                      <span className="text-[var(--theme-dirty-white)] bg-[var(--theme-surface-raised)] px-1.5 py-0.2 rounded border border-[var(--theme-gray-border)] font-mono text-[10px] font-bold">
                        Free Unlimited
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Speed:</span>
                      <span className="font-mono font-bold text-[11px] text-slate-100">
                        ~700ms TTFB
                      </span>
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
            className="relative max-w-4xl max-h-[90vh] bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] rounded-2xl p-3 shadow-md flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between pb-2 px-1">
              <span className="text-xs font-mono font-bold text-[var(--theme-dirty-white)]">Image Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalImage}
                  download="attachment-preview"
                  className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] shadow-xs"
                  title="Download image"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModalImage(null)}
                  className="p-1.5 rounded-lg border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs cursor-pointer"
                  title="Close preview"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
            <img
              src={previewModalImage}
              alt="Full preview"
              className="max-h-[75vh] w-auto max-w-full rounded-xl border border-[var(--theme-gray-border)] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default AiChatPage;
