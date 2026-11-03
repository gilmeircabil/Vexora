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
  GraduationCap,
} from 'lucide-react';
import { TOOL_CATALOG } from '../tools/catalog.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { platformApi } from '../services/platformApi.js';
import { reviewApi, type ReviewSummary } from '../services/reviewApi.js';
import { ReviewSubmissionModal } from '../components/reviews/ReviewSubmissionModal.js';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
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

  // Show 3 curated flagship tools in a single clean row instead of a dense grid of cards
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

  return (
    <div className="space-y-20 pb-12">
      {/* A. OPEN EDITORIAL HERO + B/C. INLINE TELEMETRY & TOP SUPPORTER STRIP */}
      <section className="pt-4 sm:pt-8 space-y-12">
        <div className="max-w-4xl lg:max-w-5xl space-y-5">
          <p className="text-xs font-mono font-bold text-neutral-600">
            VexoraMods — Free &amp; Open-Source Creative &amp; Utility Platform
          </p>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-[1.05]">
            {overview?.config?.heroHeadline || 'Everything You Need. One Platform.'}
          </h1>

          <p className="text-base sm:text-xl font-semibold text-neutral-700 max-w-2xl leading-relaxed">
            {overview?.config?.heroDescription ||
              'Discover free online tools, explore AI-powered utilities, create designs, and learn with a growing community.'}
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (heroSearch.trim()) {
                navigate(`/tools?q=${encodeURIComponent(heroSearch.trim())}`);
              } else {
                navigate('/tools');
              }
            }}
            className="relative max-w-xl"
          >
            <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              aria-label="Search all tools by name, description, or keyword"
              placeholder="Search 38+ tools (e.g. background remover, pdf merger, ocr, json)..."
              className="w-full pl-11 pr-24 py-3 bg-white border-2 border-black rounded-xl text-xs sm:text-sm font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] border border-black font-black text-xs text-black transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Primary Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-black font-black text-sm shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap"
            >
              <Wrench className="w-4 h-4 stroke-[2.5]" />
              <span>Explore All Tools</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-sky-300 border-2 border-black text-black font-black text-sm shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Open Studio</span>
            </Link>

            <Link
              to="/study"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFD21A] hover:bg-amber-300 border-2 border-black text-black font-black text-sm shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap"
            >
              <GraduationCap className="w-4 h-4 stroke-[2.5]" />
              <span>Study Space</span>
            </Link>

            <Link
              to="/community"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black text-black font-black text-sm shadow-[3px_3px_0px_#000000] transition-colors whitespace-nowrap"
            >
              <Heart className="w-4 h-4 text-red-600 fill-red-500 stroke-[2.5]" />
              <span>Join the Community</span>
            </Link>
          </div>
        </div>

        {/* B & C. Single Divided Telemetry & Top Supporter Strip (No separate stat cards) */}
        <div className="border-y-2 border-black py-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x-2 lg:divide-black/15">
          <div className="lg:pr-4">
            <div className="text-2xl sm:text-3xl font-black text-black">
              {loadingStats ? '—' : stats.totalMembers.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-0.5">Community</div>
          </div>

          <div className="lg:px-5">
            <div className="text-2xl sm:text-3xl font-black text-black">
              {loadingStats ? '—' : stats.totalPublishedPosts.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-0.5">Learning Hub Posts</div>
          </div>

          <div className="lg:px-5">
            <div className="text-2xl sm:text-3xl font-black text-black">
              {loadingStats ? '—' : stats.totalSupporters.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-0.5">Supporter</div>
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

      {/* D. FEATURED TOOLS (Single 3-Card Row) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              Featured Tools &amp; AI Utilities
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
              Instant browser utilities and built-in AI tools with zero paywalls.
            </p>
          </div>

          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-xs font-black text-black hover:underline self-start sm:self-auto"
          >
            <span>Browse all {TOOL_CATALOG.length} tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* MINIMAL STUDIO INTRODUCTION */}
      <section className="border-t-2 border-black pt-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
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

      {/* E. RECENT LEARNING HUB POSTS (Clean Editorial Feed List — No Cards) */}
      <section className="border-t-2 border-black pt-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
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

      {/* F. ABOUT VEXORAMODS (Open Two-Column Manifesto — No Nested Cards) */}
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

      {/* G. RATINGS & REVIEWS SECTION (Open Layout — Minimal Chrome) */}
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

          {/* Right Column: Recent Approved Reviews Stream (Clean Divided Rows — No Heavy Cards) */}
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
