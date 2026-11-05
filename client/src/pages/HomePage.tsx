import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Wrench,
  Sparkles,
  Heart,
  Crown,
  ArrowRight,
  MessageSquare,
  Star,
  PenSquare,
  AlertCircle,
  Search,
  Info,
  X,
  GraduationCap,
  BrainCircuit,
  BookMarked,
  Clock,
  FileText,
  FolderKanban,
  Calculator,
  Award,
  Palette,
  BookOpen,
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
  const [studyWorkspaceTab, setStudyWorkspaceTab] = useState<'student' | 'teacher'>('student');
  const { mood, triggerMood } = useMascot();
  const { favoriteIds, favoritesCount } = useFavorites();

  const getHeroSpeechText = () => {
    if (mood === 'celebrate') {
      return 'Woohoo! Sparkle power! 🌰✨';
    }
    if (mood === 'crunch') {
      return 'Crunching code! High focus! 🔥';
    }
    return 'Hi! Click me to high-five! 🌰';
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

  const fetchReviewsSummary = useCallback(async () => {
    setLoadingReviews(true);
    setReviewsError('');
    try {
      const res = await reviewApi.getSummary(3);
      if (res?.success && res.data) {
        setReviewsData(res.data);
      } else if (res?.error) {
        setReviewsError(res.error);
      }
    } catch {
      setReviewsError('Unable to load recent reviews.');
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    platformApi
      .getHomeOverview()
      .then((res) => {
        if (!active) return;
        if (res?.success && res.data) {
          setOverview(res.data);
          if (res.data.reviewsSummary) {
            setReviewsData(res.data.reviewsSummary);
            setLoadingReviews(false);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingStats(false);
      });

    fetchReviewsSummary();

    return () => {
      active = false;
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

  const stats = {
    totalMembers: overview?.statistics?.totalMembers ?? overview?.stats?.totalMembers ?? 0,
    totalPublishedPosts:
      overview?.statistics?.publishedLearningPosts ?? overview?.stats?.totalPublishedPosts ?? 0,
    totalSupporters: overview?.statistics?.totalSupporters ?? overview?.stats?.totalSupporters ?? 0,
    totalDonationsAmount:
      overview?.statistics?.totalDonationsAmount ?? overview?.stats?.totalDonationsAmount ?? 0,
    totalDonationsCount:
      overview?.statistics?.totalVerifiedDonations ?? overview?.stats?.totalDonationsCount ?? 0,
  };

  // Comprehensive Platform Suites Summary

  return (
    <div className="space-y-20 pb-12">
      {/* 1. HERO SECTION & FAST DISCOVERY */}
      <section className="pt-4 sm:pt-8 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-4xl lg:max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-black text-xs font-mono font-bold text-black shadow-[1.5px_1.5px_0px_#000000]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>VexoraMods — All-in-One Creative, Utility &amp; AI Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-[1.05]">
              {overview?.config?.heroHeadline || 'Everything You Need. One Platform.'}
            </h1>

            <p className="text-base sm:text-xl font-semibold text-neutral-700 max-w-3xl leading-relaxed">
              {overview?.config?.heroDescription ||
                'Discover 38+ free browser tools, full-screen AI chat, vector design studio, and dual-workspace study suite — completely open and unlocked with zero paywalls.'}
            </p>
          </div>

          {/* Squirrel Mascot Hero Companion (Transparent Background with Animated Speech Bubble) */}
          <div className="hidden sm:flex flex-col items-center justify-center shrink-0 self-center lg:self-end relative lg:mr-4 xl:mr-8 pb-1">
            {/* Animated Speech Bubble */}
            <div
              data-testid="mascot-speech-bubble"
              aria-live="polite"
              className="relative mb-2 max-w-[240px] rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 px-4 py-2.5 shadow-[2.5px_2.5px_0px_#000000] border-2 border-black backdrop-blur-md text-xs font-semibold leading-relaxed"
            >
              <div
                key={mood}
                className="text-xs sm:text-[12.5px] leading-snug font-bold text-center animate-in fade-in zoom-in-95 duration-200"
              >
                {getHeroSpeechText()}
              </div>
              {/* Bubble pointer pointing down */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-black transform rotate-45" />
            </div>

            {/* Mascot */}
            <SquirrelMascot
              state={mood}
              size={210}
              onClick={() => triggerMood('celebrate', 2500)}
              className="drop-shadow-xl"
            />
          </div>
        </div>

        {/* Live Platform Telemetry & Top Supporter Strip */}
        <div className="border-y-2 border-black py-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x-2 lg:divide-black/15">
          <div className="lg:pr-4">
            <div className="text-2xl sm:text-3xl font-black text-black">
              {loadingStats ? '—' : stats.totalMembers.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-0.5">Community Members</div>
          </div>

          <div className="lg:px-5">
            <div className="text-2xl sm:text-3xl font-black text-black">
              {loadingStats ? '—' : stats.totalPublishedPosts.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-0.5">
              Published Tutorials &amp; Posts
            </div>
          </div>

          <div className="lg:px-5">
            <div className="text-2xl sm:text-3xl font-black text-black">
              {loadingStats ? '—' : stats.totalSupporters.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-0.5">Community Supporters</div>
          </div>

          <div className="col-span-2 sm:col-span-1 lg:pl-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-600">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Top Public Supporter</span>
            </div>
            {overview?.topSupporter ? (
              <div className="mt-0.5">
                <span className="font-black text-sm text-black block truncate">
                  {overview.topSupporter.isAnonymous
                    ? 'Anonymous Supporter'
                    : overview.topSupporter.displayName}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-600">
                  ₱{Number(overview.topSupporter.totalAmount).toLocaleString()} PHP
                </span>
              </div>
            ) : (
              <Link
                to="/community"
                className="text-xs font-black text-black underline mt-1 inline-block"
              >
                Become our first supporter
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 2. ALL TOOLS DIRECTORY (Combined with HomePage) */}
      <section className="border-t-2 border-black pt-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-600">
              <Wrench className="w-3.5 h-3.5 text-black" />
              <span>All Client-Side Tools</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              Browse All {TOOL_CATALOG.length} Tools
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
              Instant browser utilities, AI-powered tools, and design suite - all free and open source.
            </p>
          </div>

          {/* AI Configuration Notice when AI backend is unreachable */}
          {aiStatus.checked && !aiStatus.online && (
            <div className="py-3 px-4 rounded-xl bg-amber-50 border border-black flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-black text-black">AI Provider Configuration Notice</p>
                <p className="font-semibold text-neutral-700">
                  The Node/Sharp AI vision service is currently unreachable. All {totalStandardTools}{' '}
                  Standard Tools continue to work 100% offline in your browser. To enable AI-powered
                  tools ({totalAiTools} tools), ensure the VexoraMods backend server is running.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search + Tool Type Filter */}
        <div className="border-b-2 border-black pb-6 space-y-4">
          {/* Search Input */}
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            <input
              type="text"
              value={toolsQuery}
              onChange={(e) => setToolsQuery(e.target.value)}
              aria-label="Search tools by name, description, or keyword"
              placeholder={`Search all ${TOOL_CATALOG.length} tools by name, description, or keyword...`}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border-2 border-black rounded-xl focus:outline-none text-black font-bold placeholder:text-neutral-500 placeholder:font-semibold"
            />
            {toolsQuery && (
              <button
                type="button"
                onClick={() => setToolsQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-neutral-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Tool Type Filter Buttons */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl border-2 border-black self-start">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedType === 'all'
                  ? 'bg-[#FACC15] text-black border border-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              All ({TOOL_CATALOG.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('standard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedType === 'standard'
                  ? 'bg-[#4ADE80] text-black border border-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              Standard ({totalStandardTools})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('ai-powered')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedType === 'ai-powered'
                  ? 'bg-[#F472B6] text-black border border-black'
                  : 'text-neutral-700 hover:text-black'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>AI-Powered ({totalAiTools})</span>
            </button>
          </div>

          {/* Category Filter Tabs including Favorites */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Favorites Filter Pill */}
            <button
              type="button"
              onClick={() => setSelectedCategory('Favorites')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 border-black ${
                selectedCategory === 'Favorites'
                  ? 'bg-[#FFD21A] text-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  favoritesCount > 0 ? 'fill-black text-black' : 'text-neutral-500'
                }`}
              />
              <span>Favorites</span>
              <span className="text-[10px] font-mono opacity-80">({favoritesCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 border-black ${
                selectedCategory === 'All'
                  ? 'bg-black text-[#FACC15]'
                  : 'bg-white text-black hover:bg-neutral-100'
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2 border-black ${
                    active ? 'bg-black text-[#FACC15]' : 'bg-white text-black hover:bg-neutral-100'
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
          <div className="p-12 text-center bg-white rounded-3xl border-2 border-black shadow-[5px_5px_0px_#000000] space-y-3">
            <p className="text-lg font-black text-black">
              {toolsQuery ? `No tools matched "${toolsQuery}"` : 'No tools found'}
            </p>
            <p className="text-xs font-semibold text-neutral-600 max-w-md mx-auto">
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
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FACC15] border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#000000] cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* 4. INTERACTIVE STUDY SPACE SPOTLIGHT (Dual Student / Teacher Capabilities) */}
      <section className="border-t-2 border-black pt-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-600">
              <GraduationCap className="w-3.5 h-3.5 text-black" />
              <span>Zero-Cost Education Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              Study Space for Learners &amp; Educators
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
              Switch between the student study workstation and teacher classroom tools.
            </p>
          </div>

          {/* Interactive Toggle Pill */}
          <div className="inline-flex items-center p-1 bg-neutral-100 rounded-xl border-2 border-black self-start sm:self-auto shadow-[2px_2px_0px_#000000]">
            <button
              type="button"
              onClick={() => setStudyWorkspaceTab('student')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                studyWorkspaceTab === 'student'
                  ? 'bg-[#FFD21A] text-black border border-black shadow-[1px_1px_0px_#000000]'
                  : 'text-neutral-600 hover:text-black border border-transparent'
              }`}
            >
              Student Workspace
            </button>
            <button
              type="button"
              onClick={() => setStudyWorkspaceTab('teacher')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                studyWorkspaceTab === 'teacher'
                  ? 'bg-[#FFD21A] text-black border border-black shadow-[1px_1px_0px_#000000]'
                  : 'text-neutral-600 hover:text-black border border-transparent'
              }`}
            >
              Teacher Workspace
            </button>
          </div>
        </div>

        {studyWorkspaceTab === 'student' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-black flex items-center justify-center text-amber-900 font-black">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-black">Doc-to-Quiz AI</h4>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                Upload PDFs or notes and automatically generate interactive multiple-choice
                assessments.
              </p>
            </div>

            <div className="p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-black flex items-center justify-center text-emerald-900 font-black">
                <BookMarked className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-black">Flashcards &amp; Quizzes</h4>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                Spaced repetition decks and self-testing quizzes with instant scoring and review
                modes.
              </p>
            </div>

            <div className="p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 border border-black flex items-center justify-center text-sky-900 font-black">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-black">Pomodoro Focus Timer</h4>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                Configurable study sessions, short/long break cycles, and audio alerts to stay in
                the zone.
              </p>
            </div>

            <div className="p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-black flex items-center justify-center text-purple-900 font-black">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-black">Citations &amp; Planner</h4>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                Format citations in APA, MLA, or Chicago and manage weekly study timetables and
                deadlines.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-black flex items-center justify-center text-amber-900 font-black">
                <FolderKanban className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-black">Lesson Plan Creator</h4>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                Draft structured curriculum objectives, instructional phases, and learning
                materials.
              </p>
            </div>

            <div className="p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-black flex items-center justify-center text-emerald-900 font-black">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-black">Exam &amp; Worksheet Builder</h4>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                Generate printable tests, question banks, worksheets, and automatic answer keys.
              </p>
            </div>

            <div className="p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 border border-black flex items-center justify-center text-sky-900 font-black">
                <Calculator className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-black">Gradebook &amp; Attendance</h4>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                Track student performance, calculate weighted averages, and monitor daily
                attendance.
              </p>
            </div>

            <div className="p-4 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-black flex items-center justify-center text-purple-900 font-black">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-black text-sm text-black">Rubrics &amp; Certificates</h4>
              <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
                Design custom grading criteria matrices and award completion certificates for
                milestones.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Link
            to={
              studyWorkspaceTab === 'teacher'
                ? '/study?workspace=teacher'
                : '/study?workspace=student'
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFD21A] hover:bg-amber-300 border-2 border-black text-black font-black text-xs sm:text-sm shadow-[2.5px_2.5px_0px_#000000] transition-transform hover:-translate-y-0.5"
          >
            <span>
              Launch {studyWorkspaceTab === 'teacher' ? 'Teacher Workspace' : 'Student Workspace'}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </section>

      {/* 5. VEXORAMODS STUDIO INTRODUCTION */}
      <section className="border-t-2 border-black pt-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-600">
              <Palette className="w-3.5 h-3.5 text-black" />
              <span>Vector Graphic Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              Design in VexoraMods Studio
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
              Create graphics, multi-page documents, and templates directly in your browser.
            </p>
          </div>
          <Link
            to="/studio"
            className="inline-flex items-center gap-1.5 text-xs font-black text-black hover:underline self-start sm:self-auto"
          >
            <span>Open Studio Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1.5">
            <div className="text-sm font-black text-black flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#FACC15] border border-black flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>Multi-Page Vector Canvas</span>
            </div>
            <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
              Add text, shapes, custom SVGs, image filters, and layers with zero setup or software
              to install.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm font-black text-black flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#38BDF8] border border-black flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>Cloud &amp; Offline Autosave</span>
            </div>
            <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
              Save multi-page version history to your account or work in guest mode with instant
              local caching.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm font-black text-black flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#4ADE80] border border-black flex items-center justify-center text-xs font-black">
                3
              </span>
              <span>Instant Multi-Format Export</span>
            </div>
            <p className="text-xs font-semibold text-neutral-600 leading-relaxed">
              Export high-resolution PNG, JPEG, vector SVG, and multi-page PDF documents with
              transparent background support.
            </p>
          </div>
        </div>
      </section>

      {/* 6. RECENT LEARNING HUB POSTS (Clean Editorial Feed List) */}
      <section className="border-t-2 border-black pt-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-600">
              <BookOpen className="w-3.5 h-3.5 text-black" />
              <span>Peer Knowledge &amp; Tutorials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              Recent Learning Hub Posts
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
              Tutorials, engineering guides, and ideas shared by community members.
            </p>
          </div>

          <Link
            to="/learning"
            className="inline-flex items-center gap-1.5 text-xs font-black text-black hover:underline self-start sm:self-auto"
          >
            <span>Explore Learning Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {overview?.recentPosts && overview.recentPosts.length > 0 ? (
          <div className="divide-y-2 divide-black/10 border-y-2 border-black/15">
            {overview.recentPosts.slice(0, 4).map((post) => (
              <Link
                key={post._id}
                to={`/learning/${post.slug}`}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-black/[0.02] px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-neutral-600">
                    <span className="text-black font-black">{post.category}</span>
                    <span>·</span>
                    <span>By {post.authorName}</span>
                    <span>·</span>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-black group-hover:underline truncate">
                    {post.title}
                  </h3>
                  <p className="text-xs font-semibold text-neutral-600 line-clamp-1">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs font-bold text-neutral-700 shrink-0">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-600" />
                    {post.likesCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {post.commentsCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-6 border-y-2 border-black/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-black">
                No tutorials published yet in the Learning Hub.
              </p>
              <p className="text-xs font-semibold text-neutral-600">
                Share the first programming guide, project idea, or learning note with the
                community.
              </p>
            </div>
            <Link
              to="/learning"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4ADE80] border-2 border-black text-xs font-black text-black self-start sm:self-auto"
            >
              Write a Post in Learning Hub
            </Link>
          </div>
        )}
      </section>

      {/* 7. ABOUT VEXORAMODS MANIFESTO */}
      <section className="border-t-2 border-black pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight">
            Built for Everyone. Free &amp; Open Source Forever.
          </h2>
          <p className="text-sm font-semibold text-neutral-700 leading-relaxed">
            {overview?.config?.aboutMission ||
              'VexoraMods exists to provide high-performance online utilities, AI-assisted tools, a professional visual design studio, and a collaborative learning community — 100% free and open source with zero paywalls or subscriptions.'}
          </p>
        </div>

        <dl className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x-2 sm:divide-black/15">
          <div className="space-y-1.5">
            <dt className="font-black text-sm text-black">Zero Paywalls or Locks</dt>
            <dd className="text-xs font-semibold text-neutral-600 leading-relaxed">
              Every browser tool, AI utility, and Studio design feature is unlocked by default with
              no subscriptions or credit walls.
            </dd>
          </div>

          <div className="sm:pl-5 space-y-1.5">
            <dt className="font-black text-sm text-black">Privacy-First Architecture</dt>
            <dd className="text-xs font-semibold text-neutral-600 leading-relaxed">
              Standard tools process your files locally inside your browser so sensitive documents
              never leave your device.
            </dd>
          </div>

          <div className="sm:pl-5 space-y-1.5">
            <dt className="font-black text-sm text-black">Community-Driven Growth</dt>
            <dd className="text-xs font-semibold text-neutral-600 leading-relaxed">
              Powered by open knowledge in the Learning Hub and sustained through 100% voluntary
              community support.
            </dd>
          </div>
        </dl>
      </section>

      {/* 8. RATINGS & REVIEWS SECTION (Required by platform test assertions) */}
      <section
        id="reviews"
        aria-labelledby="homepage-reviews-heading"
        className="border-t-2 border-black pt-12 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="homepage-reviews-heading"
              className="text-2xl sm:text-3xl font-black text-black"
            >
              What People Say About VexoraMods
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600">
              Your feedback helps us improve and build better tools for everyone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWriteReviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Write a Review</span>
            </button>

            <Link
              to="/reviews"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black text-black hover:underline"
            >
              <span>View All Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Rating Summary & 5-Star Distribution */}
          <div className="lg:col-span-4 space-y-4 lg:border-r-2 lg:border-black/15 lg:pr-8">
            <div className="flex items-baseline gap-3">
              <div
                className="text-4xl sm:text-5xl font-black text-black"
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
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs font-mono font-bold text-neutral-600">
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
                    className="flex items-center gap-2.5 text-xs font-mono font-bold text-black"
                  >
                    <span className="w-8 shrink-0 flex items-center gap-1">
                      <span>{star}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full bg-black transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-neutral-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Recent Approved Reviews Stream */}
          <div className="lg:col-span-8">
            {loadingReviews ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-20 rounded-xl bg-black/5 animate-pulse" />
                ))}
              </div>
            ) : reviewsError ? (
              <div className="py-4 flex items-center gap-2 text-red-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reviewsError}</span>
              </div>
            ) : reviewsData.recentReviews.length === 0 ? (
              <div className="py-6 space-y-2">
                <p className="text-base font-black text-black">
                  Be the first to review VexoraMods.
                </p>
                <p className="text-xs font-semibold text-neutral-600 max-w-md">
                  No approved reviews yet. Share your experience with our tools, Studio, or Learning
                  Hub!
                </p>
              </div>
            ) : (
              <div className="divide-y-2 divide-black/10">
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
                              className="w-8 h-8 rounded-full border border-black object-cover shrink-0"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="w-8 h-8 rounded-full bg-[#FACC15] border border-black flex items-center justify-center font-black text-[11px] text-black shrink-0"
                            >
                              {initials}
                            </div>
                          )}
                          <span className="font-black text-sm text-black truncate">
                            {review.userName}
                          </span>
                          <span className="text-xs font-mono text-neutral-500">
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
                                  : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-neutral-700 leading-relaxed">
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
