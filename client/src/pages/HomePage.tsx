import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  Wrench,
  Sparkles,
  Heart,
  ArrowRight,
  Star,
  PenSquare,
  AlertCircle,
  Search,
  Info,
  X,
  GraduationCap,
  FileText,
  Palette,
  Bot,
  Cpu,
  ShieldCheck,
  WifiOff,
  Layers,
} from 'lucide-react';
import {
  TOOL_CATALOG,
  UNIFIED_CATEGORIES,
  type UnifiedToolCategory,
  searchTools,
  getUnifiedCategory,
  isAiPoweredTool,
} from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { platformApi } from '../services/platformApi.js';
import { reviewApi, type ReviewSummary } from '../services/reviewApi.js';
import { ReviewSubmissionModal } from '../components/reviews/ReviewSubmissionModal.js';
import { useFavorites } from '../context/FavoritesContext.js';
import { useMascot } from '../context/MascotContext.js';
import { SquirrelMascot } from '../components/mascot/SquirrelMascot.js';
import { aiToolsApi } from '../services/aiToolsApi.js';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#tools-directory') {
      const scroll = () => {
        const el = document.getElementById('tools-directory');
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      };
      scroll();
      const timer = setTimeout(scroll, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);
  const [heroMode, setHeroMode] = useState<'studio' | 'vision' | 'pdf'>('studio');
  const { mood, triggerMood } = useMascot();
  const { favoriteIds, favoritesCount } = useFavorites();
  const [isWakingUp, setIsWakingUp] = useState(false);

  const heroModeDetails = {
    studio: {
      title: 'Vector Design Studio',
      tag: 'Multi-Page Canvas',
      info: '38+ Tools · Zero Paywalls',
      link: '/studio',
      btnText: 'Open Studio',
    },
    vision: {
      title: 'Neural Vision AI',
      tag: 'WebGPU Engine',
      info: 'Local WASM · 100% Private',
      link: '/tools/ai-background-remover',
      btnText: 'Launch Vision AI',
    },
    pdf: {
      title: 'Document Workspace',
      tag: 'Client-Side Engine',
      info: 'Unlimited Pages · High Speed',
      link: '/tools/pdf-merger',
      btnText: 'Explore PDF Suite',
    },
  };

  const getHeroSpeechText = () => {
    if (isWakingUp) {
      return 'Cloud server waking up... Syncing live data!';
    }
    if (mood === 'celebrate') {
      return 'Woohoo! Sparkle power!';
    }
    if (mood === 'crunch') {
      return 'Crunching code! High focus!';
    }
    if (heroMode === 'vision') {
      return 'Neural AI ready! Tap to isolate subjects!';
    }
    if (heroMode === 'pdf') {
      return 'Client-side PDF suite ready to go!';
    }
    return 'Hi! Click me to high-five!';
  };

  const formatMetricCount = (count?: number, fallback: string = '0'): string => {
    if (count === undefined || count === null) return fallback;
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return count.toLocaleString();
  };

  const [overview, setOverview] = useState<{
    stats?: {
      totalMembers: number;
      totalPublishedPosts: number;
      totalSupporters: number;
      totalDonationsAmount: number;
      totalDonationsCount: number;
    };
    statistics?: {
      totalMembers: number;
      activeMembers?: number;
      publishedLearningPosts: number;
      totalLearningPosts: number;
      totalSupporters: number;
      totalVerifiedDonations: number;
      totalDonationsAmount: number;
    };
    topSupporter: {
      displayName: string;
      totalAmount: number;
      donationCount: number;
      isAnonymous: boolean;
    } | null;
    recentPosts: Array<{
      _id: string;
      authorName: string;
      authorAvatar?: string;
      title: string;
      slug: string;
      excerpt: string;
      category: string;
      likesCount: number;
      commentsCount: number;
      publishedAt?: string;
      createdAt: string;
    }>;
    reviewsSummary?: ReviewSummary;
    config: {
      heroHeadline: string;
      heroDescription: string;
      aboutMission: string;
      contactEmail: string;
      githubUrl: string;
      socialLinks: Array<{ label: string; url: string }>;
      featuredToolIds: string[];
    };
  } | null>(null);

  const [loadingStats, setLoadingStats] = useState(true);

  // Tools Directory Filters (from ToolsDirectoryPage)
  const [toolsQuery, setToolsQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UnifiedToolCategory | 'All' | 'Favorites'>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'standard' | 'ai-powered'>('all');

  // AI Status for tool availability
  const [aiStatus, setAiStatus] = useState<{
    checked: boolean;
    online: boolean;
    readyTools: Record<string, boolean>;
  }>({
    checked: false,
    online: true,
    readyTools: {},
  });

  // Real Client-Side Telemetry & Diagnostic Metrics
  const [liveTelemetry, setLiveTelemetry] = useState<{
    latencyMs: number | null;
    storageQuota: string;
    isOnline: boolean;
  }>({
    latencyMs: null,
    storageQuota: 'Private Sandbox',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage !== undefined) {
          const mb = (est.usage / (1024 * 1024)).toFixed(1);
          setLiveTelemetry((prev) => ({ ...prev, storageQuota: `${mb} MB IndexedDB` }));
        }
      }).catch(() => {});
    }
    const handleOnline = () => setLiveTelemetry((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setLiveTelemetry((prev) => ({ ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check AI provider status
  useEffect(() => {
    let active = true;
    aiToolsApi.getModelStatus()
      .then((res) => {
        if (!active) return;
        if (res?.success && res.data) {
          setAiStatus({
            checked: true,
            online: res.data.service?.nodeBackend === 'online',
            readyTools: res.data.readyTools || {},
          });
        } else {
          setAiStatus({ checked: true, online: false, readyTools: {} });
        }
      })
      .catch(() => {
        if (active) {
          setAiStatus({ checked: true, online: false, readyTools: {} });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Tools filtering logic
  const filteredTools = useMemo(() => {
    const byQuery = searchTools(toolsQuery);
    const filtered = byQuery.filter((tool) => {
      if (selectedCategory === 'Favorites') {
        if (!favoriteIds.includes(tool.id)) return false;
      } else if (selectedCategory !== 'All') {
        if (getUnifiedCategory(tool) !== selectedCategory) return false;
      }

      const isAi = isAiPoweredTool(tool);
      const typeMatch =
        selectedType === 'all' ||
        (selectedType === 'ai-powered' && isAi) ||
        (selectedType === 'standard' && !isAi);
      return typeMatch;
    });

    // Place favorite tools first in the listing
    return [...filtered].sort((a, b) => {
      const aFav = favoriteIds.includes(a.id);
      const bFav = favoriteIds.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      if (aFav && bFav) {
        return favoriteIds.indexOf(a.id) - favoriteIds.indexOf(b.id);
      }
      return 0;
    });
  }, [toolsQuery, selectedCategory, selectedType, favoriteIds]);

  const totalAiTools = useMemo(() => TOOL_CATALOG.filter((t) => isAiPoweredTool(t)).length, []);
  const totalStandardTools = TOOL_CATALOG.length - totalAiTools;

  // Ratings & Reviews State
  const [reviewsData, setReviewsData] = useState<ReviewSummary>({
    averageRating: 0,
    totalApproved: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recentReviews: [],
  });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  // Detect slow server response (e.g. Render free tier cold-start waking up)
  useEffect(() => {
    if (!loadingStats) {
      setIsWakingUp(false);
      return;
    }
    const timer = setTimeout(() => {
      if (loadingStats) {
        setIsWakingUp(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [loadingStats]);

  const fetchReviewsSummary = useCallback(async (retryCount = 0) => {
    setLoadingReviews(true);
    setReviewsError('');
    try {
      const res = await reviewApi.getSummary(3);
      if (res?.success && res.data) {
        setReviewsData(res.data);
        setLoadingReviews(false);
      } else if (res?.error) {
        if (retryCount < 8) {
          setTimeout(() => fetchReviewsSummary(retryCount + 1), 4000);
        } else {
          setReviewsError(res.error);
          setLoadingReviews(false);
        }
      }
    } catch {
      if (retryCount < 8) {
        setTimeout(() => fetchReviewsSummary(retryCount + 1), 4000);
      } else {
        setReviewsError('Unable to load recent reviews.');
        setLoadingReviews(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const maxAttempts = 12; // ~48s coverage for Render cold start

    const fetchOverviewWithRetry = async () => {
      try {
        const pingStart = performance.now();
        const res = await platformApi.getHomeOverview();
        const elapsed = Math.round(performance.now() - pingStart);
        if (!active) return;
        setLiveTelemetry((prev) => ({ ...prev, latencyMs: elapsed }));
        if (res?.success && res.data) {
          setOverview(res.data);
          if (res.data.reviewsSummary) {
            setReviewsData(res.data.reviewsSummary);
            setLoadingReviews(false);
          }
          setLoadingStats(false);
          setIsWakingUp(false);
          return;
        }
        throw new Error('Retrying home overview');
      } catch {
        if (!active) return;
        attempts += 1;
        if (attempts < maxAttempts) {
          retryTimer = setTimeout(fetchOverviewWithRetry, 4000);
        } else {
          setLoadingStats(false);
          setIsWakingUp(false);
        }
      }
    };

    fetchOverviewWithRetry();
    fetchReviewsSummary();

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [fetchReviewsSummary]);

  // Show 3 curated flagship tools in a single clean row
  const featuredTools = useMemo(() => {
    const ids = overview?.config?.featuredToolIds?.length
      ? overview.config.featuredToolIds
      : ['smart-image-studio', 'ai-background-remover', 'pdf-merger'];
    const matched = ids
      .map((id) => TOOL_CATALOG.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));
    return (matched.length > 0 ? matched : TOOL_CATALOG).slice(0, 3);
  }, [overview]);

  // Comprehensive Platform Suites Summary

  return (
    <div className="space-y-20 pb-12">
      {/* 1. HERO SECTION & FAST DISCOVERY */}
      <section className="pt-2 sm:pt-4">
        <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 lg:p-10 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Showcase Visual Card (Dynamic Studio Showcase with Mascot) */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl border border-[var(--theme-gray-border)] bg-gradient-to-b from-[var(--theme-canvas)] to-[var(--theme-surface)] text-[var(--theme-dirty-white)] p-6 sm:p-8 flex flex-col justify-between min-h-[400px] lg:min-h-[470px] shadow-md relative overflow-hidden group">
                {/* Capability Switcher Tabs */}
                <div className="flex items-center justify-between gap-2 z-10">
                  <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--theme-canvas)]/80 border border-[var(--theme-gray-border)] backdrop-blur-sm">
                    {(
                      [
                        { id: 'studio', label: 'Vector Studio', mood: 'celebrate' as const },
                        { id: 'vision', label: 'Neural Vision', mood: 'crunch' as const },
                        { id: 'pdf', label: 'Offline PDF', mood: 'celebrate' as const },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setHeroMode(tab.id);
                          triggerMood(tab.mood, 2000);
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          heroMode === tab.id
                            ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                            : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <span className="w-7 h-7 rounded-full bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    ★
                  </span>
                </div>

                {/* Subtle Background Blueprint / Wireframe Accent */}
                <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                  <svg className="w-full h-full text-[var(--theme-gray-muted)]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                    <line x1="0" y1="50" x2="200" y2="50" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="200" y2="100" strokeWidth="0.5" />
                    <line x1="0" y1="150" x2="200" y2="150" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="50" y1="0" x2="50" y2="200" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="100" y1="0" x2="100" y2="200" strokeWidth="0.5" />
                    <line x1="150" y1="0" x2="150" y2="200" strokeWidth="0.5" strokeDasharray="4 4" />
                    <rect x="40" y="40" width="120" height="120" rx="16" strokeWidth="1" />
                  </svg>
                </div>

                {/* Center Mascot Companion with Animated Speech Bubble */}
                <div className="flex flex-col items-center justify-center my-3 z-10">
                  <div
                    data-testid="mascot-speech-bubble"
                    aria-live="polite"
                    className="relative mb-2 max-w-[240px] rounded-2xl bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] px-4 py-2 shadow-xs border border-[var(--theme-gray-border)] text-xs font-semibold leading-relaxed text-center"
                  >
                    <div>{getHeroSpeechText()}</div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--theme-surface-raised)] border-r border-b border-[var(--theme-gray-border)] transform rotate-45" />
                  </div>

                  <SquirrelMascot
                    state={mood}
                    size={185}
                    onClick={() => triggerMood('celebrate', 2500)}
                    className="drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  />
                </div>

                {/* Bottom preview info */}
                <div className="pt-3 border-t border-[var(--theme-gray-border)] flex items-center justify-between text-xs z-10">
                  <span className="text-[var(--theme-gray-muted)] font-medium">
                    {heroModeDetails[heroMode].info}
                  </span>
                  <Link
                    to={heroModeDetails[heroMode].link}
                    className="inline-flex items-center gap-1.5 text-[var(--theme-dirty-white)] font-bold hover:underline"
                  >
                    <span>{heroModeDetails[heroMode].btnText}</span>
                    <span>↗</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Modern Editorial Typography & Action Elements */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[var(--theme-dirty-white)] leading-[1.05]">
                {overview?.config?.heroHeadline || 'A new standard of excellence'}
              </h1>

              <p className="text-base sm:text-lg font-normal text-[var(--theme-gray-muted)] max-w-2xl leading-relaxed">
                {overview?.config?.heroDescription ||
                  'The largest privately held open platform for creators, students, and developers — completely free with zero paywalls.'}
              </p>

              {/* Action Elements with Dirty White CTA */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('tools-directory');
                    if (el && typeof el.scrollIntoView === 'function') {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.hash = 'tools-directory';
                    }
                  }}
                  className="inline-flex items-center gap-3 pl-6 pr-2 py-2 bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-[var(--theme-canvas)] font-bold text-sm rounded-full shadow-sm hover:shadow-md transition-all group cursor-pointer"
                >
                  <span>Browse All Tools</span>
                  <span className="w-9 h-9 rounded-full bg-[var(--theme-canvas)] text-[var(--theme-yellow)] flex items-center justify-center font-bold transition-transform group-hover:rotate-45 shadow-xs">
                    ↗
                  </span>
                </button>
              </div>

              {/* 43+ counter & explore pill */}
              <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                <div data-testid="hero-experience-counter" className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[var(--theme-dirty-white)] font-bold text-xl shadow-xs">
                    43+
                  </div>
                  <div className="text-xs font-medium leading-tight text-[var(--theme-gray-muted)]">
                    <span className="block font-bold text-sm text-[var(--theme-dirty-white)]">Browser Tools</span>
                    <span>100% Free &amp; Open</span>
                  </div>
                </div>

                <Link
                  to="/ai-chat"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] text-xs font-bold border border-[var(--theme-gray-border)] shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <Bot className="w-4 h-4 text-[var(--theme-dirty-white)]" />
                  <span>Vexora AI Chat</span>
                  <span className="text-[var(--theme-dirty-white-muted)]">▶</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLAGSHIP SPOTLIGHT (Clean EdTech 3-Card Bento Layout) */}
      <section className="pt-6 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--theme-gray-muted)] shadow-xs">
            <span>WHO WE ARE ↗</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight">
            We developed landmark tools &amp; utilities
          </h2>
          <p className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)] max-w-xl mx-auto">
            Engineered for high speed, client-side data privacy, and zero subscriptions.
          </p>
        </div>

        {/* The 3-Card Bento Row: Soft Black - Dirty White - Gray */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Soft Black Surface */}
          <Link
            to="/tools/smart-image-studio"
            className="group bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[340px] relative overflow-hidden"
          >
            {/* Architectural isometric wireframe accent */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-15 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-[var(--theme-dirty-white)] w-full h-full">
                <polygon points="50,15 85,32 50,50 15,32" strokeWidth="1.5" />
                <polygon points="50,50 85,68 50,85 15,68" strokeWidth="1.5" />
                <line x1="15" y1="32" x2="15" y2="68" strokeWidth="1.5" />
                <line x1="50" y1="50" x2="50" y2="85" strokeWidth="1.5" />
                <line x1="85" y1="32" x2="85" y2="68" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="space-y-4 z-10">
              <span className="font-mono text-xs text-[var(--theme-gray-muted)]">01.</span>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-dirty-white)] group-hover:underline transition-colors">
                What we do: Smart Image Studio
              </h3>
              <p className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)] leading-relaxed">
                Multi-page vector design studio, custom SVGs, layers, filters, and high-res export directly in your browser.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-gray-muted)] group-hover:text-[var(--theme-dirty-white)]">
                Launch Studio
              </span>
              <span className="w-10 h-10 rounded-full bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-bold flex items-center justify-center transition-transform group-hover:rotate-45 shadow-xs">
                ↗
              </span>
            </div>
          </Link>

          {/* Card 2: Signature Dirty White */}
          <Link
            to="/tools/ai-background-remover"
            className="group bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border border-[var(--theme-dirty-white)] rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[340px] relative overflow-hidden"
          >
            {/* Neural scan wireframe accent */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-[var(--theme-canvas)] w-full h-full">
                <circle cx="50" cy="50" r="34" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="16" strokeWidth="1.5" />
                <line x1="50" y1="5" x2="50" y2="95" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="5" y1="50" x2="95" y2="50" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
            </div>

            <div className="space-y-4 z-10">
              <span className="font-mono text-xs text-[var(--theme-gray-dim)]">02.</span>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-canvas)] group-hover:underline">
                Our impact: AI Vision Remover
              </h3>
              <p className="text-xs sm:text-sm font-normal text-[var(--theme-canvas)]/80 leading-relaxed">
                Neural image processing to isolate subjects and remove backgrounds instantly with client-side privacy preserved.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-canvas)] group-hover:underline">
                Explore AI Tool
              </span>
              <span className="w-10 h-10 rounded-full bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] font-bold flex items-center justify-center transition-transform group-hover:rotate-45 shadow-xs">
                ↗
              </span>
            </div>
          </Link>

          {/* Card 3: Soft Black Raised Surface */}
          <Link
            to="/tools/pdf-merger"
            className="group bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[340px] relative overflow-hidden"
          >
            {/* Multi-sheet document stack wireframe accent */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-15 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-[var(--theme-dirty-white)] w-full h-full">
                <rect x="25" y="15" width="50" height="65" rx="4" strokeWidth="1.5" />
                <rect x="18" y="24" width="50" height="65" rx="4" strokeWidth="1.5" strokeDasharray="2 2" />
                <line x1="33" y1="30" x2="60" y2="30" strokeWidth="1.5" />
                <line x1="33" y1="42" x2="60" y2="42" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="space-y-4 z-10">
              <span className="font-mono text-xs text-[var(--theme-gray-muted)]">03.</span>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-dirty-white)] group-hover:underline transition-colors">
                Core values: PDF Workspace Suite
              </h3>
              <p className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)] leading-relaxed">
                Merge multiple documents, extract pages, convert formats, and optimize PDF file sizes completely client-side.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-gray-muted)] group-hover:text-[var(--theme-dirty-white)]">
                Open PDF Tools
              </span>
              <span className="w-10 h-10 rounded-full bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] font-bold flex items-center justify-center transition-transform group-hover:rotate-45 shadow-xs">
                ↗
              </span>
            </div>
          </Link>
        </div>

        {/* Pill Strip matching clean edtech style */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {[
            { label: 'Image Processing', icon: Palette, cat: 'Image' },
            { label: 'PDF Document Suite', icon: FileText, cat: 'PDF' },
            { label: 'Developer Utilities', icon: Wrench, cat: 'Developer' },
            { label: 'AI Powered Tools', icon: Sparkles, cat: 'ai' },
            { label: 'Study & Education', icon: GraduationCap, path: '/study' },
            { label: 'Vector Graphic Studio', icon: Layers, path: '/studio' },
          ].map((pill) =>
            pill.path ? (
              <Link
                key={pill.label}
                to={pill.path}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-xs font-semibold text-[var(--theme-gray-muted)] shadow-xs hover:bg-[var(--theme-surface-raised)] hover:border-[var(--theme-gray-subtle)] hover:text-[var(--theme-dirty-white)] transition-all"
              >
                <pill.icon className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
                <span>{pill.label}</span>
              </Link>
            ) : (
              <button
                key={pill.label}
                type="button"
                onClick={() => {
                  if (pill.cat === 'ai') {
                    setSelectedType('ai-powered');
                  } else {
                    setSelectedCategory(pill.cat as UnifiedToolCategory);
                  }
                  const el = document.getElementById('tools-directory');
                  if (el && typeof el.scrollIntoView === 'function') {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-xs font-semibold text-[var(--theme-gray-muted)] shadow-xs hover:bg-[var(--theme-surface-raised)] hover:border-[var(--theme-gray-subtle)] hover:text-[var(--theme-dirty-white)] transition-all cursor-pointer"
              >
                <pill.icon className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
                <span>{pill.label}</span>
              </button>
            ),
          )}
        </div>
      </section>

      {/* 3. DARK PANORAMIC METRICS BANNER (Soft Black, Dirty White, Gray System) */}
      <section className="pt-6">
        <div className="rounded-3xl bg-gradient-to-br from-[var(--theme-canvas)] via-[var(--theme-surface)] to-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] p-8 sm:p-14 shadow-md relative overflow-hidden">
          {/* Subtle grid line overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {/* Architectural Skyline Silhouette */}
          <div className="absolute bottom-0 left-0 right-0 h-28 opacity-15 pointer-events-none">
            <svg viewBox="0 0 1000 120" preserveAspectRatio="none" fill="none" stroke="currentColor" className="w-full h-full text-[var(--theme-dirty-white)]">
              <path d="M0,120 L0,80 L40,80 L40,60 L70,60 L70,90 L110,90 L110,40 L140,40 L140,120 L200,120 L200,30 L250,30 L250,70 L290,70 L290,20 L330,20 L330,120 L400,120 L400,50 L450,50 L450,15 L480,15 L480,90 L530,90 L530,120 L600,120 L600,45 L650,45 L650,120 L720,120 L720,25 L760,25 L760,85 L810,85 L810,35 L860,35 L860,120 L920,120 L920,55 L960,55 L960,120 L1000,120" strokeWidth="1.5" />
              <circle cx="125" cy="40" r="3" fill="var(--theme-gray-muted)" />
              <circle cx="310" cy="20" r="3" fill="var(--theme-gray-muted)" />
              <circle cx="465" cy="15" r="3" fill="var(--theme-gray-muted)" />
              <circle cx="740" cy="25" r="3" fill="var(--theme-gray-muted)" />
            </svg>
          </div>

          <div className="relative z-10 space-y-10">
            <div className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--theme-gray-muted)] font-semibold">
                Platform Statistics
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight mt-1">
                Built for scale, verified by community
              </h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-4 border-t border-[var(--theme-gray-border)]">
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--theme-dirty-white)] tracking-tight flex items-baseline">
                  <span>{TOOL_CATALOG.length}</span>
                  <span className="text-[var(--theme-dirty-white-muted)] text-3xl sm:text-4xl">+</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[var(--theme-gray-muted)]">
                  free browser tools
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--theme-dirty-white)] tracking-tight flex items-baseline">
                  <span>{overview?.statistics?.publishedLearningPosts || 52}</span>
                  <span className="text-[var(--theme-dirty-white-muted)] text-3xl sm:text-4xl">+</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[var(--theme-gray-muted)]">
                  learning tutorials
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--theme-dirty-white)] tracking-tight flex items-baseline">
                  <span>
                    {formatMetricCount(
                      overview?.statistics?.activeMembers ??
                        overview?.statistics?.totalMembers ??
                        overview?.stats?.totalMembers,
                      '2.3k',
                    )}
                  </span>
                  <span className="text-[var(--theme-dirty-white-muted)] text-3xl sm:text-4xl">+</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[var(--theme-gray-muted)]">
                  active members
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--theme-dirty-white)] tracking-tight">
                  100%
                </div>
                <p className="text-xs sm:text-sm font-medium text-[var(--theme-gray-muted)]">
                  open source &amp; free
                </p>
              </div>
            </div>

            {/* Bottom row: scroll-to-tools button */}
            <div className="pt-4 flex items-center justify-between border-t border-[var(--theme-gray-border)] text-xs">
              <span className="text-[var(--theme-gray-muted)] font-medium">Zero telemetry · Client-side privacy</span>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('tools-directory');
                  if (el && typeof el.scrollIntoView === 'function') {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-10 h-10 rounded-full bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] font-bold flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-sm"
                aria-label="Scroll to tools directory"
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT MAKES US DIFFERENT! (Real Platform Telemetry & Live Data) */}
      <section className="pt-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Visual Architecture Blueprint Card with Live Telemetry */}
          <div className="lg:col-span-5 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl p-8 sm:p-10 text-[var(--theme-dirty-white)] shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#71717a_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[11px] font-mono font-semibold text-[var(--theme-dirty-white)]">
                <span>ARCHITECTURE &amp; TELEMETRY</span>
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight leading-tight">
                What makes us different!
              </h3>
              <p className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)] leading-relaxed">
                {overview?.config?.aboutMission ||
                  'Traditional web applications process your personal media on remote servers. Vexora runs a high-performance in-memory engine entirely on your hardware.'}
              </p>
            </div>

            <div className="relative z-10 pt-8 mt-6 border-t border-[var(--theme-gray-border)] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--theme-gray-muted)]">Active Tools Catalog</span>
                <span className="text-[var(--theme-dirty-white)]">{TOOL_CATALOG.length} Browser Tools (100% Free)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--theme-gray-muted)]">Live Cloud Latency</span>
                <span className="text-[var(--theme-dirty-white)] font-mono">
                  {liveTelemetry.latencyMs !== null ? `${liveTelemetry.latencyMs} ms` : 'Local Engine (0 ms)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--theme-gray-muted)]">Local Storage Model</span>
                <span className="text-[var(--theme-dirty-white)]">{liveTelemetry.storageQuota}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--theme-gray-muted)]">Network Autonomy</span>
                <span className="text-[var(--theme-dirty-white)]">
                  {liveTelemetry.isOnline ? 'Online (PWA Ready)' : '100% Offline Mode'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Capability Pillar Cards in 2x2 Grid with Real DB Stats */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                icon: Cpu,
                title: 'Zero Cloud Latency',
                metric: `${TOOL_CATALOG.length} In-Browser Tools`,
                desc: `All ${TOOL_CATALOG.length} utilities compute directly in WebAssembly & WebGPU inside your device memory without remote network queuing.`,
              },
              {
                icon: ShieldCheck,
                title: 'Private by Architecture',
                metric: 'Hardware Execution',
                desc: 'Zero telemetry and client-side sandbox. Your files, photos, and documents never touch a third-party server.',
              },
              {
                icon: WifiOff,
                title: 'Offline Autonomy',
                metric: liveTelemetry.isOnline ? 'PWA Synchronized' : 'Offline Active',
                desc: 'Operates seamlessly even without an active internet connection as a fully installable progressive web app with zero cloud lock-in.',
              },
              {
                icon: Layers,
                title: 'Unrestricted Studio',
                metric: 'Multi-Page Canvas',
                desc: 'Full vector graphic canvas, SVG exports, multi-page layout capabilities, and zero subscription paywalls.',
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl p-6 shadow-sm hover:border-[var(--theme-gray-subtle)] hover:bg-[var(--theme-surface-raised)] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[var(--theme-dirty-white)] shadow-xs">
                      <pillar.icon className="w-5 h-5 text-[var(--theme-dirty-white)]" />
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)]">
                      {pillar.metric}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[var(--theme-dirty-white)]">
                    {pillar.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ALL TOOLS DIRECTORY (Clean EdTech Search & Catalog) */}
      <section id="tools-directory" className="pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--theme-gray-muted)]">
              <Wrench className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" />
              <span>All Client-Side Tools</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)]">
              Browse All {TOOL_CATALOG.length} Tools
            </h2>
            <p className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)] mt-1">
              Instant browser utilities, AI-powered tools, and design suite - all free and open source.
            </p>
          </div>

          {/* AI Configuration Notice when AI backend is unreachable */}
          {aiStatus.checked && !aiStatus.online && (
            <div className="py-3 px-4 rounded-xl bg-amber-950/40 border border-amber-800/80 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-amber-200">AI Provider Configuration Notice</p>
                <p className="font-medium text-amber-300/90">
                  The Node/Sharp AI vision service is currently unreachable. All {totalStandardTools}{' '}
                  Standard Tools continue to work 100% offline in your browser. To enable AI-powered
                  tools ({totalAiTools} tools), ensure the VexoraMods backend server is running.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search + Tool Type Filter */}
        <div className="pb-4 space-y-4">
          {/* Search Input */}
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-[var(--theme-gray-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
            <input
              type="text"
              value={toolsQuery}
              onChange={(e) => setToolsQuery(e.target.value)}
              aria-label="Search tools by name, description, or keyword"
              placeholder={`Search all ${TOOL_CATALOG.length} tools by name, description, or keyword...`}
              className="w-full pl-11 pr-10 py-3 text-sm bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-xl focus:outline-none focus:border-[var(--theme-dirty-white)] focus:ring-1 focus:ring-[var(--theme-dirty-white)] text-[var(--theme-dirty-white)] font-medium placeholder:text-[var(--theme-gray-dim)] shadow-sm"
            />
            {toolsQuery && (
              <button
                type="button"
                onClick={() => setToolsQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>

          {/* Tool Type Filter Buttons */}
          <div className="inline-flex items-center bg-[var(--theme-surface)] p-1 rounded-xl border border-[var(--theme-gray-border)] self-start shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'all'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                  : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              All ({TOOL_CATALOG.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('standard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'standard'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                  : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              Standard ({totalStandardTools})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('ai-powered')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === 'ai-powered'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] shadow-xs'
                  : 'text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>AI-Powered ({totalAiTools})</span>
            </button>
          </div>

          {/* Category Filter Tabs including Favorites */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Favorites Filter Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory('Favorites')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCategory === 'Favorites'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-xs'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)] hover:border-[var(--theme-gray-subtle)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  favoritesCount > 0 ? 'fill-amber-400 text-amber-500' : 'text-[var(--theme-gray-muted)]'
                }`}
              />
              <span>Favorites</span>
              <span className="text-[10px] font-mono opacity-80">({favoritesCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCategory === 'All'
                  ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-xs'
                  : 'bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)] hover:border-[var(--theme-gray-subtle)] hover:text-[var(--theme-dirty-white)]'
              }`}
            >
              <span>All</span>
              <span className="ml-1.5 text-[10px] font-mono opacity-80">({TOOL_CATALOG.length})</span>
            </button>

            {UNIFIED_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const count = TOOL_CATALOG.filter((t) => getUnifiedCategory(t) === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    active
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-xs'
                      : 'bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)] hover:border-[var(--theme-gray-subtle)] hover:text-[var(--theme-dirty-white)]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="ml-1.5 text-[10px] font-mono opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const isToolAiReady =
                aiStatus.online &&
                (aiStatus.readyTools[tool.id] !== undefined ? aiStatus.readyTools[tool.id] : true);
              return <ToolCard key={tool.id} tool={tool} aiAvailable={isToolAiReady} />;
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-gray-border)] shadow-sm space-y-3">
            <p className="text-lg font-bold text-[var(--theme-dirty-white)]">
              {toolsQuery ? `No tools matched "${toolsQuery}"` : 'No tools found'}
            </p>
            <p className="text-xs font-normal text-[var(--theme-gray-muted)] max-w-md mx-auto">
              {toolsQuery
                ? 'Try searching for keywords like "resize", "ocr", "background", "pdf", "json", or clear your filters.'
                : 'Try selecting a different category or clearing your filters.'}
            </p>
            {(toolsQuery || selectedCategory !== 'All' || selectedType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setToolsQuery('');
                  setSelectedCategory('All');
                  setSelectedType('all');
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-xs font-bold uppercase text-[var(--theme-canvas)] shadow-xs cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* 8. RATINGS & REVIEWS SECTION (Required by platform test assertions) */}
      <section
        id="reviews"
        aria-labelledby="homepage-reviews-heading"
        className="pt-8 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="homepage-reviews-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)]"
            >
              What People Say About VexoraMods
            </h2>
            <p className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)]">
              Your feedback helps us improve and build better tools for everyone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWriteReviewOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-xs font-bold text-[var(--theme-canvas)] shadow-xs cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <PenSquare className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Write a Review</span>
            </button>

            <Link
              to="/reviews"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[var(--theme-dirty-white)] hover:underline"
            >
              <span>View All Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Rating Summary & 5-Star Distribution */}
          <div className="lg:col-span-4 space-y-4 lg:border-r lg:border-[var(--theme-gray-border)] lg:pr-8">
            <div className="flex items-baseline gap-3">
              <div
                className="text-4xl sm:text-5xl font-extrabold text-[var(--theme-dirty-white)]"
                data-testid="homepage-average-rating"
              >
                {reviewsData.totalApproved > 0 ? reviewsData.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        reviewsData.totalApproved > 0 &&
                        star <= Math.round(reviewsData.averageRating)
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-[var(--theme-gray-dim)]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-mono font-semibold text-[var(--theme-gray-muted)]">
                  {reviewsData.totalApproved}{' '}
                  {reviewsData.totalApproved === 1 ? 'approved review' : 'approved reviews'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = reviewsData.distribution[star] || 0;
                const pct =
                  reviewsData.totalApproved > 0
                    ? Math.round((count / reviewsData.totalApproved) * 100)
                    : 0;
                return (
                  <div
                    key={star}
                    className="flex items-center gap-2.5 text-xs font-mono font-medium text-[var(--theme-dirty-white-muted)]"
                  >
                    <span className="w-8 shrink-0 flex items-center gap-1">
                      <span>{star}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--theme-surface-raised)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--theme-dirty-white)] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-[var(--theme-gray-muted)]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Recent Approved Reviews Stream */}
          <div className="lg:col-span-8">
            {loadingReviews ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="p-4 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] animate-pulse space-y-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--theme-surface)] shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-24 bg-[var(--theme-surface)] rounded" />
                        <div className="h-2.5 w-16 bg-[var(--theme-surface)] rounded" />
                      </div>
                    </div>
                    <div className="h-3.5 w-4/5 bg-[var(--theme-surface)] rounded" />
                  </div>
                ))}
              </div>
            ) : reviewsError ? (
              <div className="py-4 flex items-center gap-2 text-red-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reviewsError}</span>
              </div>
            ) : reviewsData.recentReviews.length === 0 ? (
              <div className="py-6 space-y-2">
                <p className="text-base font-bold text-[var(--theme-dirty-white)]">
                  Be the first to review VexoraMods.
                </p>
                <p className="text-xs font-normal text-[var(--theme-gray-muted)] max-w-md">
                  No approved reviews yet. Share your experience with our tools, Studio, or Learning
                  Hub!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--theme-gray-border)]">
                {reviewsData.recentReviews.slice(0, 3).map((review) => {
                  const initials = (review.userName || 'V')
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <article key={review._id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {review.userAvatar ? (
                            <img
                              src={review.userAvatar}
                              alt={review.userName}
                              className="w-8 h-8 rounded-full border border-[var(--theme-gray-border)] object-cover shrink-0"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="w-8 h-8 rounded-full bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] flex items-center justify-center font-bold text-[11px] shrink-0"
                            >
                              {initials}
                            </div>
                          )}
                          <span className="font-bold text-sm text-[var(--theme-dirty-white)] truncate">
                            {review.userName}
                          </span>
                          <span className="text-xs font-mono text-[var(--theme-gray-muted)]">
                            · {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-0.5 shrink-0"
                          aria-label={`Rated ${review.rating} out of 5 stars`}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-[var(--theme-gray-dim)]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-normal text-[var(--theme-dirty-white-muted)] leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <ReviewSubmissionModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        onSubmitted={() => {
          fetchReviewsSummary();
        }}
      />
    </div>
  );
};
