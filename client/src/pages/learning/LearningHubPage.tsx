import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  BookOpen,
  Search,
  Heart,
  MessageSquare,
  Bookmark,
  Plus,
  Sparkles,
  Clock,
  Eye,
  X,
  Send,
  Star,
  DollarSign,
  Layers,
  Award,
  FolderHeart,
  BarChart3,
  Users,
  Video,
  FileText,
  Code2,
  Compass,
  CheckCircle2,
  Lock,
  Unlock,
  Upload,
  Trash2,
  Edit3,
  ShieldCheck,
  Wallet,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  learningApi,
  OPEN_LEARNING_TOPICS,
  LEARNING_CONTENT_TYPES,
  type LearningPost,
  type LearningContentType,
  type LearningCourseChapter,
  type LearningStepItem,
  type LearningCodeSnippet,
  type LearningProtectedFile,
  type DiscoveryOverview,
  type CreatorPublicProfile,
  type CreatorDashboardData,
  type LearnerLibraryData,
} from '../../services/learningApi.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

type HubArea =
  'explore' | 'free' | 'paid' | 'topics' | 'creators' | 'publish' | 'library' | 'dashboard';

const CONTENT_TYPE_BADGES: Record<string, { label: string; color: string }> = {
  article: { label: 'Article', color: 'bg-[#FAF7F2]' },
  course: { label: 'Course', color: 'bg-[#38BDF8]' },
  video: { label: 'Video Lesson', color: 'bg-[#F472B6]' },
  pdf: { label: 'PDF Resource', color: 'bg-[#FACC15]' },
  file: { label: 'Downloadable File', color: 'bg-[#A78BFA]' },
  guide: { label: 'Step-by-Step Guide', color: 'bg-[#4ADE80]' },
  code: { label: 'Code & Project', color: 'bg-[#FB923C]' },
  discussion: { label: 'Discussion', color: 'bg-white' },
};

export const LearningHubPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary Navigation Area (Phase 14: 8 areas)
  const initialArea = (searchParams.get('tab') as HubArea) || 'explore';
  const [activeArea, setActiveArea] = useState<HubArea>(initialArea);

  // Filters & Feed State
  const [posts, setPosts] = useState<LearningPost[]>([]);
  const [featured, setFeatured] = useState<LearningPost[]>([]);
  const [discovery, setDiscovery] = useState<DiscoveryOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [customTagFilter, setCustomTagFilter] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('All');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('All');
  const [pricingFilter, setPricingFilter] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sort, setSort] = useState<string>('featured');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(3);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('compact');

  // Selected Creator Profile Drawer/View
  const [selectedCreator, setSelectedCreator] = useState<CreatorPublicProfile | null>(null);
  const [loadingCreator, setLoadingCreator] = useState(false);

  // Learner Library State
  const [libraryData, setLibraryData] = useState<LearnerLibraryData | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [librarySection, setLibrarySection] = useState<
    'purchased' | 'free' | 'in_progress' | 'completed' | 'bookmarks' | 'recent'
  >('purchased');

  // Creator Dashboard State
  const [dashboardData, setDashboardData] = useState<CreatorDashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('gcash');
  const [payoutAccountInfo, setPayoutAccountInfo] = useState('');
  const [requestingPayout, setRequestingPayout] = useState(false);

  // Creator Profile Editor inside Dashboard
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileHeadline, setProfileHeadline] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileExpertise, setProfileExpertise] = useState('');
  const [profileInterests, setProfileInterests] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Publish / Edit Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [postCategory, setPostCategory] = useState<string>('Programming');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [postContentType, setPostContentType] = useState<LearningContentType>('article');
  const [postDifficulty, setPostDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'beginner',
  );
  const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');
  const [priceInput, setPriceInput] = useState<string>('0');
  const [currencyInput, setCurrencyInput] = useState<string>('PHP');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [learningOutcomesInput, setLearningOutcomesInput] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [resourceLabel, setResourceLabel] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [chapters, setChapters] = useState<LearningCourseChapter[]>([]);
  const [steps, setSteps] = useState<LearningStepItem[]>([]);
  const [codeSnippets, setCodeSnippets] = useState<LearningCodeSnippet[]>([]);
  const [protectedFiles, setProtectedFiles] = useState<LearningProtectedFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(true);
  const [publishStatus, setPublishStatus] = useState<'published' | 'draft'>('published');
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const effectivePricing =
        activeArea === 'free'
          ? 'free'
          : activeArea === 'paid'
            ? 'paid'
            : pricingFilter !== 'All'
              ? pricingFilter
              : undefined;

      const res = await learningApi.listPosts({
        q: search || undefined,
        category: category !== 'All' ? category : undefined,
        tag: customTagFilter || undefined,
        difficulty: difficulty !== 'All' ? difficulty : undefined,
        contentType: contentTypeFilter !== 'All' ? contentTypeFilter : undefined,
        pricingType: effectivePricing,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort,
        page,
        limit: itemsPerPage,
      });
      setPosts(res.data.items || []);
      setFeatured(res.data.featured || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [
    activeArea,
    search,
    category,
    customTagFilter,
    difficulty,
    contentTypeFilter,
    pricingFilter,
    minPrice,
    maxPrice,
    sort,
    page,
    itemsPerPage,
  ]);

  const loadDiscoveryOverview = useCallback(async () => {
    try {
      const res = await learningApi.getDiscoveryOverview();
      setDiscovery(res.data);
    } catch {
      // Optional discovery enrichment
    }
  }, []);

  const loadLearnerLibrary = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingLibrary(true);
    try {
      const res = await learningApi.getLearnerLibrary();
      setLibraryData(res.data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load your learning library', 'error');
    } finally {
      setLoadingLibrary(false);
    }
  }, [isAuthenticated, showToast]);

  const loadCreatorDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingDashboard(true);
    try {
      const res = await learningApi.getCreatorDashboard();
      setDashboardData(res.data);
      if (res.data.creatorProfile) {
        setProfileDisplayName(res.data.creatorProfile.displayName || user?.name || '');
        setProfileUsername(res.data.creatorProfile.username || '');
        setProfileHeadline(res.data.creatorProfile.headline || '');
        setProfileBio(res.data.creatorProfile.bio || '');
        setProfileExpertise((res.data.creatorProfile.expertise || []).join(', '));
        setProfileInterests((res.data.creatorProfile.interests || []).join(', '));
      } else if (user) {
        setProfileDisplayName(user.name || '');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load creator dashboard', 'error');
    } finally {
      setLoadingDashboard(false);
    }
  }, [isAuthenticated, showToast, user]);

  useEffect(() => {
    loadDiscoveryOverview();
  }, [loadDiscoveryOverview]);

  useEffect(() => {
    if (
      activeArea === 'explore' ||
      activeArea === 'free' ||
      activeArea === 'paid' ||
      activeArea === 'topics'
    ) {
      loadPosts();
    } else if (activeArea === 'library') {
      loadLearnerLibrary();
    } else if (activeArea === 'dashboard') {
      loadCreatorDashboard();
    }
  }, [activeArea, loadPosts, loadLearnerLibrary, loadCreatorDashboard]);

  const switchArea = (area: HubArea) => {
    if ((area === 'library' || area === 'dashboard' || area === 'publish') && !isAuthenticated) {
      showToast('Please sign in to access this area', 'info');
      return;
    }
    if (area === 'publish') {
      resetPublishForm();
      setShowCreateModal(true);
      return;
    }
    setActiveArea(area);
    setSearchParams({ tab: area });
    setPage(1);
  };

  const openCreatorProfile = async (usernameOrId: string) => {
    setLoadingCreator(true);
    setActiveArea('creators');
    try {
      const res = await learningApi.getCreatorProfile(usernameOrId);
      setSelectedCreator(res.data);
    } catch (err: any) {
      showToast(err.message || 'Could not load creator profile', 'error');
    } finally {
      setLoadingCreator(false);
    }
  };

  const handleToggleFollowCreator = async (creatorUserId: string) => {
    if (!isAuthenticated) {
      showToast('Sign in to follow creators', 'info');
      return;
    }
    try {
      const res = await learningApi.toggleFollowCreator(creatorUserId);
      if (selectedCreator && selectedCreator.userId === creatorUserId) {
        setSelectedCreator({
          ...selectedCreator,
          viewerFollowing: res.data.following,
          followersCount: res.data.followersCount,
        });
      }
      showToast(res.data.following ? 'Following creator!' : 'Unfollowed creator', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update follow status', 'error');
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to like posts', 'info');
      return;
    }
    try {
      const res = await learningApi.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likesCount: res.data.likesCount, viewerLiked: res.data.liked }
            : p,
        ),
      );
    } catch (err: any) {
      showToast(err.message || 'Could not like post', 'error');
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to bookmark posts', 'info');
      return;
    }
    try {
      const res = await learningApi.toggleBookmark(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                bookmarksCount: res.data.bookmarksCount,
                viewerBookmarked: res.data.bookmarked,
              }
            : p,
        ),
      );
      showToast(
        res.data.bookmarked ? 'Saved to your bookmarks' : 'Removed from bookmarks',
        'success',
      );
    } catch (err: any) {
      showToast(err.message || 'Could not bookmark post', 'error');
    }
  };

  const resetPublishForm = () => {
    setEditingPostId(null);
    setTitle('');
    setExcerpt('');
    setPostCategory('Programming');
    setCustomCategoryInput('');
    setUseCustomCategory(false);
    setPostContentType('article');
    setPostDifficulty('beginner');
    setPricingType('free');
    setPriceInput('0');
    setCurrencyInput('PHP');
    setPreviewContent('');
    setLearningOutcomesInput('');
    setTagsInput('');
    setContent('');
    setThumbnailUrl('');
    setVideoUrl('');
    setResourceLabel('');
    setResourceUrl('');
    setChapters([]);
    setSteps([]);
    setCodeSnippets([]);
    setProtectedFiles([]);
    setRightsConfirmed(true);
    setPublishStatus('published');
  };

  const openEditMaterial = (item: LearningPost) => {
    setEditingPostId(item._id);
    setTitle(item.title);
    setExcerpt(item.excerpt || '');
    const isKnownTopic = (OPEN_LEARNING_TOPICS as readonly string[]).includes(item.category);
    setUseCustomCategory(!isKnownTopic);
    if (isKnownTopic) {
      setPostCategory(item.category);
    } else {
      setCustomCategoryInput(item.category);
    }
    setPostContentType(item.contentType || 'article');
    setPostDifficulty(item.difficulty || 'beginner');
    setPricingType(item.pricingType || 'free');
    setPriceInput(String(item.price || 0));
    setCurrencyInput(item.currency || 'PHP');
    setPreviewContent(item.previewContent || '');
    setLearningOutcomesInput((item.learningOutcomes || []).join('\n'));
    setTagsInput((item.tags || []).join(', '));
    setContent(item.content || item.excerpt || '');
    setThumbnailUrl(item.thumbnailUrl || item.coverImage || '');
    setVideoUrl(item.videoUrl || '');
    setChapters(item.chapters || []);
    setSteps(item.steps || []);
    setCodeSnippets(item.codeSnippets || []);
    setProtectedFiles(item.protectedFiles || []);
    setRightsConfirmed(true);
    setPublishStatus(item.status === 'draft' ? 'draft' : 'published');
    setShowCreateModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const res = await learningApi.uploadLearningFile(file, false);
      setProtectedFiles((prev) => [...prev, res.data]);
      showToast(`Uploaded "${res.data.originalName}" to secure storage`, 'success');
    } catch (err: any) {
      showToast(err.message || 'File upload failed security check', 'error');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        chapterId: `ch_${Date.now()}_${prev.length + 1}`,
        title: `Chapter ${prev.length + 1}`,
        description: '',
        order: prev.length + 1,
        lessons: [
          {
            lessonId: `les_${Date.now()}_1`,
            title: 'Lesson 1: Introduction',
            contentType: 'text',
            content: 'Lesson content and key takeaways...',
            durationMinutes: 10,
            isFreePreview: prev.length === 0,
            order: 1,
          },
        ],
      },
    ]);
  };

  const addLessonToChapter = (chapterIndex: number) => {
    setChapters((prev) =>
      prev.map((ch, idx) => {
        if (idx !== chapterIndex) return ch;
        return {
          ...ch,
          lessons: [
            ...ch.lessons,
            {
              lessonId: `les_${Date.now()}_${ch.lessons.length + 1}`,
              title: `Lesson ${ch.lessons.length + 1}`,
              contentType: 'text',
              content: 'Detailed lesson walkthrough...',
              durationMinutes: 10,
              isFreePreview: false,
              order: ch.lessons.length + 1,
            },
          ],
        };
      }),
    );
  };

  const addGuideStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        title: `Step ${prev.length + 1}`,
        content: '',
        codeSnippet: '',
      },
    ]);
  };

  const addCodeSnippet = () => {
    setCodeSnippets((prev) => [
      ...prev,
      {
        title: `Example ${prev.length + 1}`,
        language: 'typescript',
        code: '',
      },
    ]);
  };

  const handleCreateOrUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rightsConfirmed) {
      showToast(
        'Please confirm that you have the rights to publish and distribute this educational material.',
        'error',
      );
      return;
    }

    const finalCategory = useCustomCategory
      ? customCategoryInput.trim() || 'General Discussion'
      : postCategory;

    const numericPrice = pricingType === 'paid' ? Number(priceInput) : 0;
    if (pricingType === 'paid' && (!Number.isFinite(numericPrice) || numericPrice <= 0)) {
      showToast('Please enter a valid selling price greater than 0 for PAID content.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const learningOutcomes = learningOutcomesInput
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean);
      const resourceLinks =
        resourceLabel && resourceUrl ? [{ label: resourceLabel, url: resourceUrl }] : [];

      const payload = {
        title,
        excerpt: excerpt || undefined,
        category: finalCategory,
        contentType: postContentType,
        difficulty: postDifficulty,
        pricingType,
        price: numericPrice,
        currency: currencyInput || 'PHP',
        previewContent: previewContent || undefined,
        learningOutcomes,
        tags,
        content,
        thumbnailUrl: thumbnailUrl || undefined,
        videoUrl: videoUrl || undefined,
        resourceLinks,
        chapters: postContentType === 'course' ? chapters : undefined,
        steps: postContentType === 'guide' ? steps : undefined,
        codeSnippets: postContentType === 'code' ? codeSnippets : undefined,
        protectedFiles,
        rightsConfirmed,
        status: publishStatus,
      };

      if (editingPostId) {
        await learningApi.updatePost(editingPostId, payload as any);
        showToast('Learning material updated!', 'success');
      } else {
        await learningApi.createPost(payload);
        showToast(
          publishStatus === 'draft'
            ? 'Saved to your creator drafts!'
            : 'Published to VexoraMods Learning Hub!',
          'success',
        );
      }

      setShowCreateModal(false);
      resetPublishForm();
      loadPosts();
      loadDiscoveryOverview();
      if (activeArea === 'dashboard') {
        loadCreatorDashboard();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to publish learning content', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCreatorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await learningApi.updateCreatorProfile({
        displayName: profileDisplayName,
        username: profileUsername || undefined,
        headline: profileHeadline,
        bio: profileBio,
        expertise: profileExpertise
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        interests: profileInterests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      showToast('Creator profile updated!', 'success');
      loadCreatorDashboard();
    } catch (err: any) {
      showToast(err.message || 'Failed to update creator profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestingPayout(true);
    try {
      await learningApi.requestPayout({
        amount: Number(payoutAmount),
        payoutMethod,
        payoutAccountInfo,
      });
      showToast('Payout request submitted!', 'success');
      setPayoutAmount('');
      loadCreatorDashboard();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit payout request', 'error');
    } finally {
      setRequestingPayout(false);
    }
  };

  const renderMaterialCard = (post: LearningPost, forceCard?: boolean) => {
    const isPaid = post.pricingType === 'paid' && (post.price || 0) > 0;
    const typeBadge = CONTENT_TYPE_BADGES[post.contentType || 'article'] ?? {
      label: 'Article',
      color: 'bg-[#FAF7F2]',
    };

    if (viewMode === 'compact' && !forceCard) {
      return (
        <Link
          key={post._id}
          to={`/learning/${post.slug}`}
          className="group block p-4 sm:p-5 hover:bg-[#FAF7F2] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span
                data-testid={`badge-${isPaid ? 'paid' : 'free'}`}
                className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md border border-black ${
                  isPaid ? 'bg-[#FACC15] text-black' : 'bg-[#4ADE80] text-black'
                }`}
              >
                {isPaid ? `PAID • ${post.currency || 'PHP'} ${post.price}` : 'FREE'}
              </span>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border border-black ${typeBadge.color}`}
              >
                {typeBadge.label}
              </span>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-black">
                {post.category}
              </span>
              <span className="text-[11px] font-bold text-gray-500 ml-1">
                {post.readTimeMinutes}m
              </span>
            </div>
            <h3 className="text-base font-black text-black group-hover:underline truncate">
              {post.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{post.excerpt}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-600 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <span className="truncate max-w-[120px] text-black font-bold">
              By {post.authorName}
            </span>
            {(post.reviewCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-0.5 text-black font-black">
                <Star className="w-3.5 h-3.5 fill-[#FACC15] text-black" />
                {Number(post.averageRating || 0).toFixed(1)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {post.viewsCount}
            </span>
            <button
              type="button"
              onClick={(e) => handleToggleLike(e, post._id)}
              className={`inline-flex items-center gap-1 hover:text-red-600 ${
                post.viewerLiked ? 'text-red-600' : ''
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${post.viewerLiked ? 'fill-red-600' : ''}`} />
              {post.likesCount}
            </button>
            <button
              type="button"
              onClick={(e) => handleToggleBookmark(e, post._id)}
              className={`inline-flex items-center gap-1 hover:text-black ${
                post.viewerBookmarked ? 'text-black' : ''
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-3.5 h-3.5 ${post.viewerBookmarked ? 'fill-black' : ''}`} />
            </button>
          </div>
        </Link>
      );
    }

    return (
      <Link
        key={post._id}
        to={`/learning/${post.slug}`}
        className="group bg-white border-2 border-black rounded-2xl p-5 shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex flex-col justify-between text-left"
      >
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                data-testid={`badge-${isPaid ? 'paid' : 'free'}`}
                className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md border-2 border-black ${
                  isPaid ? 'bg-[#FACC15] text-black' : 'bg-[#4ADE80] text-black'
                }`}
              >
                {isPaid ? `PAID • ${post.currency || 'PHP'} ${post.price}` : 'FREE'}
              </span>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border border-black ${typeBadge.color}`}
              >
                {typeBadge.label}
              </span>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-black">
                {post.category}
              </span>
            </div>
            <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readTimeMinutes}m
            </span>
          </div>

          <h3 className="text-lg font-black text-black group-hover:underline mb-1.5 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs text-gray-700 line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold px-1.5 py-0.5 bg-gray-100 border border-gray-300 text-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              openCreatorProfile(post.authorUsername || post.authorId);
            }}
            className="truncate max-w-[130px] text-left hover:underline text-black font-black"
          >
            By {post.authorName}
          </button>
          <div className="flex items-center gap-2.5">
            {(post.reviewCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-0.5 text-black font-black text-xs">
                <Star className="w-3 h-3 fill-[#FACC15] text-black" />
                {Number(post.averageRating || 0).toFixed(1)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px]">
              <Eye className="w-3 h-3" /> {post.viewsCount}
            </span>
            <button
              type="button"
              onClick={(e) => handleToggleLike(e, post._id)}
              className={`inline-flex items-center gap-1 hover:text-red-600 ${
                post.viewerLiked ? 'text-red-600' : ''
              }`}
            >
              <Heart className={`w-3 h-3 ${post.viewerLiked ? 'fill-red-600' : ''}`} />
              {post.likesCount}
            </button>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <MessageSquare className="w-3 h-3" /> {post.commentsCount}
            </span>
            <button
              type="button"
              onClick={(e) => handleToggleBookmark(e, post._id)}
              className={`inline-flex items-center gap-1 hover:text-black ${
                post.viewerBookmarked ? 'text-black' : ''
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-3 h-3 ${post.viewerBookmarked ? 'fill-black' : ''}`} />
            </button>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      {/* Open Editorial Header & Primary Navigation (Zero Bulky Card Wrapper) */}
      <div className="border-b-2 border-black pb-6 mb-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              Learn, Teach & Build Together
            </h1>
            <p className="text-gray-700 mt-2 max-w-2xl text-base">
              Share anything you want to teach or discuss across technology, business, arts,
              science, lifestyle, or any custom topic. Publish tutorials, courses, guides, and
              resources for FREE or for SALE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  showToast('Please log in to publish in the Learning Hub', 'info');
                  return;
                }
                resetPublishForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#FACC15] text-black font-black border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Write a Post / Tutorial
            </button>
          </div>
        </div>

        {/* 8 Primary Learning Hub Navigation Areas */}
        <div className="flex flex-wrap gap-2 pt-4 border-t-2 border-black/10">
          {[
            { id: 'explore', label: 'Explore', icon: Compass },
            { id: 'free', label: 'Free Learning', icon: Unlock },
            { id: 'paid', label: 'Paid Learning', icon: DollarSign },
            { id: 'topics', label: 'Categories & Topics', icon: Layers },
            { id: 'creators', label: 'Creator Profiles', icon: Users },
            { id: 'publish', label: 'Publish Learning', icon: Plus },
            { id: 'library', label: 'My Library', icon: FolderHeart },
            { id: 'dashboard', label: 'Creator Dashboard', icon: BarChart3 },
          ].map((nav) => {
            const Icon = nav.icon;
            const isActive = activeArea === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => switchArea(nav.id as HubArea)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-black border-2 border-black rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-[2px_2px_0px_#FACC15]'
                    : 'bg-white text-black hover:bg-[#FACC15]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {nav.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* AREA 1, 2, 3: EXPLORE / FREE LEARNING / PAID LEARNING */}
      {(activeArea === 'explore' || activeArea === 'free' || activeArea === 'paid') && (
        <>
          {/* Search & Multi-Faceted Marketplace Filters Box */}
          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_#000] mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 relative">
                <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search courses, tutorials, topics, creators..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-black font-medium text-sm focus:outline-none bg-[#FAF7F2]"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  aria-label="Content format filter"
                  value={contentTypeFilter}
                  onChange={(e) => {
                    setContentTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 border-2 border-black font-bold text-sm bg-white"
                >
                  <option value="All">All Content Formats (8)</option>
                  {LEARNING_CONTENT_TYPES.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  aria-label="Difficulty filter"
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 border-2 border-black font-bold text-sm bg-white"
                >
                  <option value="All">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  aria-label="Sort learning materials"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 border-2 border-black font-bold text-sm bg-white"
                >
                  <option value="featured">Featured & Ranked</option>
                  <option value="newest">Recently Published</option>
                  <option value="popular">Most Popular</option>
                  <option value="highest_rated">Most Highly Rated</option>
                  <option value="discussed">Most Discussed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                {activeArea === 'explore' && (
                  <div className="flex items-center gap-1">
                    {['All', 'free', 'paid'].map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => {
                          setPricingFilter(pt);
                          setPage(1);
                        }}
                        className={`px-3 py-1 text-xs font-black uppercase border border-black cursor-pointer ${
                          pricingFilter === pt ? 'bg-black text-white' : 'bg-[#FAF7F2] text-black'
                        }`}
                      >
                        {pt === 'All' ? 'All Pricing' : pt === 'free' ? 'FREE Only' : 'PAID Only'}
                      </button>
                    ))}
                  </div>
                )}

                {(activeArea === 'paid' || pricingFilter === 'paid') && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-24 px-2 py-1 text-xs border border-black bg-[#FAF7F2]"
                    />
                    <span className="text-xs font-bold">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-24 px-2 py-1 text-xs border border-black bg-[#FAF7F2]"
                    />
                  </div>
                )}

                {category !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black bg-[#FFD21A] border border-black">
                    Category: {category}
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('All');
                        setPage(1);
                      }}
                      className="hover:text-red-700 cursor-pointer ml-1"
                      aria-label="Clear category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {customTagFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black bg-[#38BDF8] border border-black">
                    Tag: #{customTagFilter}
                    <button
                      type="button"
                      onClick={() => setCustomTagFilter('')}
                      className="hover:text-red-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {discovery && discovery.trendingTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-black uppercase text-gray-500">Trending Tags:</span>
                  {discovery.trendingTags.slice(0, 6).map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => {
                        setCustomTagFilter(t.tag);
                        setPage(1);
                      }}
                      className="text-xs font-bold px-2 py-0.5 bg-[#FAF7F2] border border-black hover:bg-[#FACC15] cursor-pointer"
                    >
                      #{t.tag} ({t.count})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured Learning Banner (reduced to 3 clean cards like Home Page featured items) */}
          {featured.length > 0 && category === 'All' && !search && page === 1 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black text-black flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Featured Learning Materials
                </h2>
                <span className="text-xs font-bold text-gray-500">Curated by VexoraMods</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {featured.slice(0, 3).map((post) => renderMaterialCard(post, true))}
              </div>
            </div>
          )}

          {/* Card Count & Density Toolbar (Matches Home Page: 3-Card Option & Editorial View) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-gray-200">
            <div className="text-xs font-bold text-gray-600">
              {category !== 'All' ? `Topic: ${category}` : 'All Materials'} ({posts.length} loaded)
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-bold">
                <span className="text-gray-500 uppercase text-[11px]">Show:</span>
                {[3, 6, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setItemsPerPage(num);
                      setPage(1);
                    }}
                    className={`px-2 py-0.5 border border-black font-black cursor-pointer ${
                      itemsPerPage === num
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex items-center border-2 border-black bg-white">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 cursor-pointer ${
                    viewMode === 'grid' ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
                  }`}
                  title="Grid View (3 per row)"
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 cursor-pointer border-l-2 border-black ${
                    viewMode === 'compact' ? 'bg-black text-white' : 'text-black hover:bg-gray-100'
                  }`}
                  title="Editorial List View (Home Page Style)"
                  aria-label="Compact list view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Posts Grid / Compact View */}
          {loading ? (
            <div
              className={
                viewMode === 'compact'
                  ? 'bg-white border-2 border-black rounded-2xl divide-y-2 divide-black/10 overflow-hidden'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              }
            >
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={
                    viewMode === 'compact'
                      ? 'h-20 bg-white p-4 animate-pulse'
                      : 'h-28 bg-white border-2 border-black rounded-2xl p-4 animate-pulse'
                  }
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-2xl p-10 text-center shadow-[2px_2px_0px_#000]">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <h3 className="text-lg font-black text-black mb-1">
                No learning materials match your filter yet
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Be the first to share a tutorial, course, guide, or resource in this topic!
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'compact'
                  ? 'bg-white border-2 border-black rounded-2xl divide-y-2 divide-black/10 overflow-hidden shadow-[2px_2px_0px_#000]'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              }
            >
              {(featured.length > 0 && category === 'All' && !search && page === 1
                ? posts.filter((p) => !featured.slice(0, 3).some((f) => f._id === p._id))
                : posts
              ).map((post) => renderMaterialCard(post))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 font-black border-2 border-black ${
                    page === p ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* AREA 4: CATEGORIES & TOPICS */}
      {activeArea === 'topics' && (
        <div className="space-y-6">
          <div className="border-b-2 border-black pb-4">
            <h2 className="text-2xl font-black text-black mb-1">
              Categories & Multidisciplinary Topics
            </h2>
            <p className="text-xs text-gray-700">
              Explore materials by organized fields of knowledge, or publish under your own custom
              category.
            </p>
          </div>

          {/* 4 Organized domain groupings with zero outer wrapper card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                domain: 'Technology & Software Engineering',
                topics: [
                  'Web Development',
                  'Frontend Development',
                  'Backend Development',
                  'Programming',
                  'AI and Machine Learning',
                  'Cybersecurity',
                  'UI/UX Design',
                  'Databases',
                ],
              },
              {
                domain: 'Business, Finance & Entrepreneurship',
                topics: ['Business', 'Entrepreneurship', 'Finance'],
              },
              {
                domain: 'Creative Arts & Media',
                topics: ['Photography', 'Graphic Design', 'Music'],
              },
              {
                domain: 'Science, Lifestyle & Personal Growth',
                topics: [
                  'Cooking',
                  'Science',
                  'Mathematics',
                  'Languages',
                  'Personal Development',
                  'Education',
                  'Lifestyle',
                  'Hobbies',
                  'Tutorials',
                  'Project Ideas',
                  'Learning Journey',
                  'Resources',
                  'General Discussion',
                ],
              },
            ].map((group) => (
              <div
                key={group.domain}
                className="p-5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000]"
              >
                <h3 className="text-sm font-black text-black uppercase mb-3 pb-1 border-b border-black">
                  {group.domain}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.topics.map((topic) => {
                    const stat = discovery?.trendingCategories.find((c) => c.category === topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setCategory(topic);
                          setActiveArea('explore');
                        }}
                        className="px-3 py-1.5 bg-[#FAF7F2] border border-black rounded-lg font-black text-xs hover:bg-[#FACC15] transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>{topic}</span>
                        {stat && stat.count > 0 && (
                          <span className="text-[10px] text-gray-500 font-bold">
                            ({stat.count})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {discovery && discovery.trendingCategories.length > 0 && (
            <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[2px_2px_0px_#000]">
              <h3 className="text-sm font-black text-black uppercase mb-3">
                Active Community Custom Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {discovery.trendingCategories.map((cat) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => {
                      setCategory(cat.category);
                      setActiveArea('explore');
                    }}
                    className="px-3 py-1 bg-[#4ADE80] border border-black rounded-lg font-black text-xs hover:bg-[#FACC15] cursor-pointer"
                  >
                    {cat.category} ({cat.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AREA 5: CREATOR PROFILES */}
      {activeArea === 'creators' && (
        <div className="space-y-8">
          {selectedCreator ? (
            <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_#000]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
                <button
                  type="button"
                  onClick={() => setSelectedCreator(null)}
                  className="px-3 py-1.5 bg-[#FAF7F2] border-2 border-black font-bold text-xs cursor-pointer"
                >
                  ← Back to Recommended Creators
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleFollowCreator(selectedCreator.userId)}
                  className={`px-5 py-2 border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_#000] cursor-pointer ${
                    selectedCreator.viewerFollowing
                      ? 'bg-white text-black'
                      : 'bg-[#FACC15] text-black'
                  }`}
                >
                  {selectedCreator.viewerFollowing ? 'Following' : '+ Follow Creator'} (
                  {selectedCreator.followersCount})
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                <div className="w-20 h-20 border-2 border-black bg-[#38BDF8] flex items-center justify-center font-black text-2xl shrink-0">
                  {selectedCreator.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-black">{selectedCreator.displayName}</h2>
                  <p className="text-sm font-bold text-gray-600 mb-2">
                    @{selectedCreator.username} • {selectedCreator.headline}
                  </p>
                  <p className="text-sm text-gray-800 mb-4">{selectedCreator.bio}</p>
                  {selectedCreator.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCreator.expertise.map((exp) => (
                        <span
                          key={exp}
                          className="text-xs font-black px-2.5 py-0.5 bg-[#FAF7F2] border border-black"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 bg-[#FAF7F2] border-2 border-black p-4 shrink-0">
                  <div>
                    <div className="text-xs font-bold text-gray-500">Published</div>
                    <div className="text-xl font-black">{selectedCreator.stats.totalPublished}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500">Avg Rating</div>
                    <div className="text-xl font-black flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#FACC15]" />
                      {selectedCreator.stats.averageRating.toFixed(1)} (
                      {selectedCreator.stats.reviewCount})
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500">Free / Paid</div>
                    <div className="text-sm font-black">
                      {selectedCreator.stats.freeCount} Free • {selectedCreator.stats.paidCount}{' '}
                      Paid
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500">Verified Sales</div>
                    <div className="text-sm font-black">
                      {selectedCreator.stats.verifiedPurchasesCount}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-black text-black mb-4">
                Published Learning Materials ({selectedCreator.publishedMaterials.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {selectedCreator.publishedMaterials.map((item) => renderMaterialCard(item))}
              </div>

              {selectedCreator.recentFeedback.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-black mb-4">
                    Recent Learner Reviews & Verified Feedback
                  </h3>
                  <div className="space-y-3">
                    {selectedCreator.recentFeedback.map((rev) => (
                      <div
                        key={rev._id}
                        className="p-4 bg-[#FAF7F2] border-2 border-black flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm">{rev.userName}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="text-[11px] font-black px-2 py-0.5 bg-[#4ADE80] border border-black">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="font-black text-xs">
                            {'★'.repeat(rev.rating)}
                            {'☆'.repeat(5 - rev.rating)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b-2 border-black pb-4">
                <h2 className="text-2xl font-black text-black mb-1">
                  Featured Educators & Knowledge Creators
                </h2>
                <p className="text-sm text-gray-700">
                  Explore creators sharing free tutorials, comprehensive courses, and specialized
                  learning resources.
                </p>
              </div>
              {loadingCreator ? (
                <div className="p-8 text-center font-bold">Loading creator profile...</div>
              ) : !discovery || discovery.recommendedCreators.length === 0 ? (
                <div className="p-8 text-center text-gray-600 font-bold">
                  Publish your first learning post or course to appear in the Creator Directory!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discovery.recommendedCreators.map((creator) => (
                    <div
                      key={creator.userId}
                      className="p-5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#000] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 border-2 border-black bg-[#FACC15] flex items-center justify-center font-black text-lg">
                            {creator.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-black text-base text-black">
                              {creator.displayName}
                            </h3>
                            <p className="text-xs font-bold text-gray-600">
                              {creator.publishedCount} Materials • {creator.totalViews} Views
                            </p>
                          </div>
                        </div>
                        {creator.bio && (
                          <p className="text-xs text-gray-700 line-clamp-2 mb-3">{creator.bio}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {creator.expertise.slice(0, 4).map((topic) => (
                            <span
                              key={topic}
                              className="text-[11px] font-bold px-2 py-0.5 bg-white border border-black"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-black">
                        <span className="text-xs font-black flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[#FACC15]" />
                          {creator.averageRating > 0
                            ? `${creator.averageRating.toFixed(1)} (${creator.reviewCount})`
                            : 'New Creator'}
                        </span>
                        <button
                          type="button"
                          onClick={() => openCreatorProfile(creator.userId)}
                          className="px-3 py-1.5 bg-black text-white text-xs font-black cursor-pointer"
                        >
                          View Profile →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AREA 7: LEARNER LIBRARY */}
      {activeArea === 'library' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
            <div>
              <h2 className="text-2xl font-black text-black">My Personal Learning Library</h2>
              <p className="text-sm text-gray-700">
                Access your purchased courses, saved free materials, bookmarks, and learning
                progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  id: 'purchased',
                  label: `Purchased (${libraryData?.purchasedContent.length || 0})`,
                },
                {
                  id: 'free',
                  label: `Saved Free (${libraryData?.freeSavedMaterials.length || 0})`,
                },
                {
                  id: 'in_progress',
                  label: `In Progress (${libraryData?.inProgressMaterials.length || 0})`,
                },
                {
                  id: 'completed',
                  label: `Completed (${libraryData?.completedCourses.length || 0})`,
                },
                {
                  id: 'bookmarks',
                  label: `Bookmarked (${libraryData?.bookmarkedLessons.length || 0})`,
                },
                {
                  id: 'recent',
                  label: `Recently Viewed (${libraryData?.recentlyViewed.length || 0})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLibrarySection(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-black border-2 border-black cursor-pointer ${
                    librarySection === tab.id ? 'bg-black text-white' : 'bg-[#FAF7F2] text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loadingLibrary ? (
            <div className="p-12 text-center font-bold">Loading your learning library...</div>
          ) : !libraryData ? (
            <div className="p-12 text-center text-gray-600">No library records found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(librarySection === 'purchased'
                ? libraryData.purchasedContent
                : librarySection === 'free'
                  ? libraryData.freeSavedMaterials
                  : librarySection === 'in_progress'
                    ? libraryData.inProgressMaterials
                    : librarySection === 'completed'
                      ? libraryData.completedCourses
                      : librarySection === 'bookmarks'
                        ? libraryData.bookmarkedLessons
                        : libraryData.recentlyViewed
              ).map((item) => (
                <div key={item._id} className="flex flex-col">
                  {renderMaterialCard(item)}
                  {item.progress && (
                    <div className="bg-[#FAF7F2] border-2 border-t-0 border-black px-4 py-2 flex items-center justify-between text-xs font-black">
                      <span>Progress: {item.progress.progressPercent}%</span>
                      {item.progress.isCompleted && (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AREA 8: CREATOR DASHBOARD */}
      {activeArea === 'dashboard' && (
        <div className="space-y-8">
          {loadingDashboard || !dashboardData ? (
            <div className="bg-white border-2 border-black p-12 text-center font-bold">
              Loading your real-time Creator Dashboard...
            </div>
          ) : (
            <>
              <div className="border-b-2 border-black pb-4">
                <h2 className="text-2xl font-black text-black">Creator Dashboard & Analytics</h2>
                <p className="text-sm text-gray-700">
                  Track content reach, enrollee sales, available earnings, and payout status.
                </p>
              </div>

              {/* Real Database-Backed Inline Telemetry Ribbon (Zero Bulky Metric Cards) */}
              <div className="border-y-2 border-black py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:divide-x-2 sm:divide-black/15 bg-white px-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Published</div>
                  <div className="text-2xl font-black text-black mt-1">
                    {dashboardData.overview.totalPublished}
                  </div>
                  <div className="text-[11px] font-bold text-gray-600 mt-0.5">
                    {dashboardData.overview.totalDrafts} Drafts •{' '}
                    {dashboardData.overview.totalArchived} Archived
                  </div>
                </div>

                <div className="sm:pl-4">
                  <div className="text-xs font-bold text-gray-500 uppercase">Total Views</div>
                  <div className="text-2xl font-black text-black mt-1">
                    {dashboardData.overview.totalViews}
                  </div>
                  <div className="text-[11px] font-bold text-gray-600 mt-0.5">
                    {dashboardData.overview.totalLikes} Likes
                  </div>
                </div>

                <div className="sm:pl-4">
                  <div className="text-xs font-bold text-gray-500 uppercase">Verified Sales</div>
                  <div className="text-2xl font-black text-black mt-1">
                    {dashboardData.overview.verifiedPurchases}
                  </div>
                  <div className="text-[11px] font-bold text-gray-600 mt-0.5">
                    Refunds: {dashboardData.overview.refundsCount}
                  </div>
                </div>

                <div className="sm:pl-4">
                  <div className="text-xs font-bold text-gray-500 uppercase">Gross Sales</div>
                  <div className="text-2xl font-black text-black mt-1">
                    PHP {dashboardData.overview.grossSales.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-bold text-gray-600 mt-0.5">
                    Fees: PHP{' '}
                    {(
                      dashboardData.overview.platformFees + dashboardData.overview.processingFees
                    ).toFixed(2)}
                  </div>
                </div>

                <div className="sm:pl-4">
                  <div className="text-xs font-black text-green-700 uppercase">
                    Available Earnings
                  </div>
                  <div
                    data-testid="creator-available-earnings"
                    className="text-2xl font-black text-black mt-1"
                  >
                    PHP {dashboardData.overview.availableEarnings.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-bold text-gray-600 mt-0.5">
                    Withdrawable balance
                  </div>
                </div>

                <div className="sm:pl-4">
                  <div className="text-xs font-black text-amber-700 uppercase">Pending Payouts</div>
                  <div className="text-2xl font-black text-black mt-1">
                    PHP {dashboardData.overview.pendingPayouts.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-bold text-gray-600 mt-0.5">
                    Paid Out: PHP {dashboardData.overview.paidOutTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Manage Published, Draft & Archived Materials */}
              <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-black">
                    Manage Your Learning Materials ({dashboardData.materials.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      resetPublishForm();
                      setShowCreateModal(true);
                    }}
                    className="px-4 py-2 bg-[#FACC15] border-2 border-black font-black text-xs cursor-pointer"
                  >
                    + Publish New Material
                  </button>
                </div>

                {dashboardData.materials.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    You have not published any tutorials, courses, or resources yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b-2 border-black bg-[#FAF7F2]">
                          <th className="p-3 font-black">Title</th>
                          <th className="p-3 font-black">Format</th>
                          <th className="p-3 font-black">Pricing</th>
                          <th className="p-3 font-black">Status</th>
                          <th className="p-3 font-black">Views / Rating</th>
                          <th className="p-3 font-black">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.materials.map((item) => (
                          <tr key={item._id} className="border-b border-gray-200">
                            <td className="p-3 font-bold">
                              <Link
                                to={`/learning/${item.slug}`}
                                className="hover:underline text-black"
                              >
                                {item.title}
                              </Link>
                            </td>
                            <td className="p-3 uppercase text-xs font-bold">
                              {item.contentType || 'article'}
                            </td>
                            <td className="p-3 font-black text-xs">
                              {item.pricingType === 'paid'
                                ? `PAID (${item.currency || 'PHP'} ${item.price})`
                                : 'FREE'}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-xs font-black uppercase border border-black bg-[#FAF7F2]">
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3 text-xs font-bold">
                              {item.viewsCount} views • ★{' '}
                              {Number(item.averageRating || 0).toFixed(1)} ({item.reviewCount || 0})
                            </td>
                            <td className="p-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditMaterial(item)}
                                className="px-2.5 py-1 bg-[#FAF7F2] border border-black text-xs font-black inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payout Request & Creator Profile Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_#000]">
                  <h3 className="text-lg font-black text-black flex items-center gap-2 mb-3">
                    <Wallet className="w-5 h-5" /> Request Earnings Payout
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Only verified net earnings from completed purchases (PHP{' '}
                    {dashboardData.overview.availableEarnings.toFixed(2)}) can be requested for
                    withdrawal. Payout requests are reviewed and processed by platform
                    administrators.
                  </p>
                  <form onSubmit={handleRequestPayout} className="space-y-3">
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">
                        Amount (PHP)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        max={dashboardData.overview.availableEarnings || undefined}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="Enter amount to withdraw"
                        className="w-full px-3 py-2 border-2 border-black text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">
                          Payout Method
                        </label>
                        <select
                          value={payoutMethod}
                          onChange={(e) => setPayoutMethod(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black text-sm bg-white font-bold"
                        >
                          <option value="gcash">GCash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="paypal">PayPal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">
                          Account Details
                        </label>
                        <input
                          type="text"
                          value={payoutAccountInfo}
                          onChange={(e) => setPayoutAccountInfo(e.target.value)}
                          placeholder="Account number / email"
                          className="w-full px-3 py-2 border-2 border-black text-sm"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={requestingPayout || dashboardData.overview.availableEarnings <= 0}
                      className="px-5 py-2.5 bg-black text-white font-black text-xs uppercase border-2 border-black disabled:opacity-50 cursor-pointer"
                    >
                      {requestingPayout ? 'Submitting...' : 'Request Payout'}
                    </button>
                  </form>

                  {dashboardData.payoutHistory.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-black uppercase mb-2">Payout History</h4>
                      <div className="space-y-2">
                        {dashboardData.payoutHistory.map((p) => (
                          <div
                            key={p._id}
                            className="p-2.5 bg-[#FAF7F2] border border-black flex items-center justify-between text-xs font-bold"
                          >
                            <span>
                              PHP {p.amount.toFixed(2)} via {p.payoutMethod}
                            </span>
                            <span className="uppercase px-2 py-0.5 border border-black bg-white">
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Creator Public Profile Editor */}
                <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_#000]">
                  <h3 className="text-lg font-black text-black mb-3">
                    Public Creator Profile Settings
                  </h3>
                  <form onSubmit={handleSaveCreatorProfile} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={profileDisplayName}
                          onChange={(e) => setProfileDisplayName(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-black text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase mb-1">Username</label>
                        <input
                          type="text"
                          value={profileUsername}
                          onChange={(e) => setProfileUsername(e.target.value)}
                          placeholder="creator_handle"
                          className="w-full px-3 py-2 border-2 border-black text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Headline</label>
                      <input
                        type="text"
                        value={profileHeadline}
                        onChange={(e) => setProfileHeadline(e.target.value)}
                        placeholder="e.g., Full-Stack Engineer, Culinary Instructor, Finance Coach"
                        className="w-full px-3 py-2 border-2 border-black text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Biography</label>
                      <textarea
                        rows={3}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Share your background and what you love teaching..."
                        className="w-full px-3 py-2 border-2 border-black text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">
                        Areas of Expertise (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={profileExpertise}
                        onChange={(e) => setProfileExpertise(e.target.value)}
                        placeholder="e.g., Photography, Entrepreneurship, TypeScript, Music Theory"
                        className="w-full px-3 py-2 border-2 border-black text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2.5 bg-[#4ADE80] text-black font-black text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer"
                    >
                      {savingProfile ? 'Saving...' : 'Save Creator Profile'}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Create / Edit Learning Material Modal (Phases 1, 2, 3, 12) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-4 border-black p-6 sm:p-8 max-w-4xl w-full shadow-[8px_8px_0px_#000] my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-black">
              <h2 className="text-2xl font-black text-black">
                {editingPostId ? 'Edit Learning Material' : 'Publish to VexoraMods Learning Hub'}
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 border-2 border-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdatePost} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={180}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Complete Financial Literacy & Budgeting Course, Sourdough Baking Guide, or React Architecture"
                  className="w-full px-3 py-2.5 border-2 border-black font-medium text-sm"
                />
              </div>

              {/* Phase 2: 8 Content Formats + Phase 1: Open Topic / Custom Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Content Format *
                  </label>
                  <select
                    value={postContentType}
                    onChange={(e) => setPostContentType(e.target.value as LearningContentType)}
                    className="w-full px-3 py-2.5 border-2 border-black font-bold text-sm bg-white"
                  >
                    {LEARNING_CONTENT_TYPES.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black uppercase">Topic / Category *</label>
                    <button
                      type="button"
                      onClick={() => setUseCustomCategory((v) => !v)}
                      className="text-[11px] font-black underline text-blue-700 cursor-pointer"
                    >
                      {useCustomCategory ? 'Choose Preset Topic' : '+ Custom Topic'}
                    </button>
                  </div>
                  {useCustomCategory ? (
                    <input
                      type="text"
                      required
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="Enter any custom topic (e.g., Robotics, Gardening)"
                      className="w-full px-3 py-2.5 border-2 border-black font-bold text-sm"
                    />
                  ) : (
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-black font-bold text-sm bg-white"
                    >
                      {OPEN_LEARNING_TOPICS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1">Difficulty</label>
                  <select
                    value={postDifficulty}
                    onChange={(e) => setPostDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2.5 border-2 border-black font-bold text-sm bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Phase 3: Free vs Paid Publishing Option */}
              <div className="p-4 bg-[#FAF7F2] border-2 border-black space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black uppercase block">
                      Publishing Option (Free or For Sale)
                    </span>
                    <span className="text-xs text-gray-600">
                      Publish for FREE to the community or set your own selling price.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPricingType('free');
                        setPriceInput('0');
                      }}
                      className={`px-4 py-2 text-xs font-black border-2 border-black cursor-pointer ${
                        pricingType === 'free' ? 'bg-[#4ADE80] text-black' : 'bg-white text-black'
                      }`}
                    >
                      FREE Access
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPricingType('paid');
                        if (Number(priceInput) <= 0) setPriceInput('299');
                      }}
                      className={`px-4 py-2 text-xs font-black border-2 border-black cursor-pointer ${
                        pricingType === 'paid' ? 'bg-[#FACC15] text-black' : 'bg-white text-black'
                      }`}
                    >
                      PAID (For Sale)
                    </button>
                  </div>
                </div>

                {pricingType === 'paid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-black">
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">
                        Selling Price *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black font-black text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase mb-1">Currency</label>
                      <select
                        value={currencyInput}
                        onChange={(e) => setCurrencyInput(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black font-bold text-sm bg-white"
                      >
                        <option value="PHP">PHP (₱)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-black uppercase mb-1">
                        Public Preview Description (Shown to non-purchasers)
                      </label>
                      <textarea
                        rows={2}
                        value={previewContent}
                        onChange={(e) => setPreviewContent(e.target.value)}
                        placeholder="Describe what buyers will learn and show a teaser preview..."
                        className="w-full px-3 py-2 border-2 border-black text-sm bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Custom Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g., finance, photography, typescript, cooking"
                    className="w-full px-3 py-2 border-2 border-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Thumbnail / Cover Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border-2 border-black text-sm"
                  />
                </div>
              </div>

              {(postContentType === 'video' || postContentType === 'course') && (
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Video Lesson URL (YouTube / MP4 / Embed URL)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border-2 border-black text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Key Learning Outcomes (one per line)
                </label>
                <textarea
                  rows={2}
                  value={learningOutcomesInput}
                  onChange={(e) => setLearningOutcomesInput(e.target.value)}
                  placeholder={'Master core principles\nBuild practical real-world projects'}
                  className="w-full px-3 py-2 border-2 border-black text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Main Content / Tutorial Body (Markdown supported) *
                </label>
                <textarea
                  required
                  rows={7}
                  minLength={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your complete tutorial, article, course syllabus, or discussion..."
                  className="w-full px-3 py-2.5 border-2 border-black font-mono text-sm"
                />
              </div>

              {/* Phase 2: Complete Course Chapters & Ordered Lessons Builder */}
              {postContentType === 'course' && (
                <div className="p-4 bg-[#FAF7F2] border-2 border-black space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black uppercase">
                        Course Curriculum (Chapters & Lessons)
                      </h3>
                      <p className="text-xs text-gray-600">
                        Organize your course into chapters and ordered lessons. Mark lessons as Free
                        Preview if desired.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addChapter}
                      className="px-3 py-1.5 bg-[#38BDF8] border-2 border-black font-black text-xs cursor-pointer"
                    >
                      + Add Chapter
                    </button>
                  </div>

                  {chapters.map((ch, cIdx) => (
                    <div
                      key={ch.chapterId}
                      className="p-3 bg-white border-2 border-black space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={ch.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setChapters((prev) =>
                              prev.map((item, i) => (i === cIdx ? { ...item, title: val } : item)),
                            );
                          }}
                          placeholder="Chapter Title"
                          className="flex-1 px-2.5 py-1.5 border border-black font-black text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => addLessonToChapter(cIdx)}
                          className="px-2.5 py-1 bg-[#4ADE80] border border-black font-black text-xs cursor-pointer"
                        >
                          + Add Lesson
                        </button>
                      </div>

                      <div className="space-y-2 pl-3 border-l-2 border-black">
                        {ch.lessons.map((les, lIdx) => (
                          <div
                            key={les.lessonId}
                            className="p-2.5 bg-[#FAF7F2] border border-black space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <input
                                type="text"
                                value={les.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setChapters((prev) =>
                                    prev.map((item, i) =>
                                      i === cIdx
                                        ? {
                                            ...item,
                                            lessons: item.lessons.map((l, j) =>
                                              j === lIdx ? { ...l, title: val } : l,
                                            ),
                                          }
                                        : item,
                                    ),
                                  );
                                }}
                                placeholder="Lesson Title"
                                className="flex-1 px-2 py-1 border border-black text-xs font-bold bg-white"
                              />
                              <label className="inline-flex items-center gap-1 text-xs font-bold">
                                <input
                                  type="checkbox"
                                  checked={Boolean(les.isFreePreview)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setChapters((prev) =>
                                      prev.map((item, i) =>
                                        i === cIdx
                                          ? {
                                              ...item,
                                              lessons: item.lessons.map((l, j) =>
                                                j === lIdx ? { ...l, isFreePreview: checked } : l,
                                              ),
                                            }
                                          : item,
                                      ),
                                    );
                                  }}
                                />
                                Free Preview
                              </label>
                            </div>
                            <textarea
                              rows={2}
                              value={les.content}
                              onChange={(e) => {
                                const val = e.target.value;
                                setChapters((prev) =>
                                  prev.map((item, i) =>
                                    i === cIdx
                                      ? {
                                          ...item,
                                          lessons: item.lessons.map((l, j) =>
                                            j === lIdx ? { ...l, content: val } : l,
                                          ),
                                        }
                                      : item,
                                  ),
                                );
                              }}
                              placeholder="Lesson content..."
                              className="w-full px-2 py-1 border border-black text-xs bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Phase 2: Step-by-Step Guide Builder */}
              {postContentType === 'guide' && (
                <div className="p-4 bg-[#FAF7F2] border-2 border-black space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase">
                      Step-by-Step Instructions ({steps.length})
                    </span>
                    <button
                      type="button"
                      onClick={addGuideStep}
                      className="px-3 py-1 bg-[#4ADE80] border border-black font-black text-xs cursor-pointer"
                    >
                      + Add Step
                    </button>
                  </div>
                  {steps.map((st, sIdx) => (
                    <div key={sIdx} className="p-3 bg-white border border-black space-y-2">
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSteps((prev) =>
                            prev.map((item, i) => (i === sIdx ? { ...item, title: val } : item)),
                          );
                        }}
                        placeholder={`Step ${sIdx + 1} Title`}
                        className="w-full px-2 py-1 border border-black text-xs font-bold"
                      />
                      <textarea
                        rows={2}
                        value={st.content}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSteps((prev) =>
                            prev.map((item, i) => (i === sIdx ? { ...item, content: val } : item)),
                          );
                        }}
                        placeholder="Detailed instructions for this step..."
                        className="w-full px-2 py-1 border border-black text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Phase 2: Code Examples Builder */}
              {postContentType === 'code' && (
                <div className="p-4 bg-[#FAF7F2] border-2 border-black space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase">
                      Code Examples & Snippets ({codeSnippets.length})
                    </span>
                    <button
                      type="button"
                      onClick={addCodeSnippet}
                      className="px-3 py-1 bg-[#FB923C] border border-black font-black text-xs cursor-pointer"
                    >
                      + Add Code Snippet
                    </button>
                  </div>
                  {codeSnippets.map((snip, idx) => (
                    <div key={idx} className="p-3 bg-white border border-black space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={snip.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCodeSnippets((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, title: val } : item)),
                            );
                          }}
                          placeholder="File / Snippet Title"
                          className="flex-1 px-2 py-1 border border-black text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={snip.language}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCodeSnippets((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, language: val } : item,
                              ),
                            );
                          }}
                          placeholder="Language"
                          className="w-28 px-2 py-1 border border-black text-xs"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={snip.code}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCodeSnippets((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, code: val } : item)),
                          );
                        }}
                        placeholder="Paste code example..."
                        className="w-full px-2 py-1 border border-black font-mono text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Protected Downloadable Learning Resources Upload */}
              <div className="p-4 bg-[#FAF7F2] border-2 border-black space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase block">
                      Downloadable Learning Files & PDFs
                    </span>
                    <span className="text-xs text-gray-600">
                      Files are scanned for malware signatures and stored in private
                      entitlement-protected storage.
                    </span>
                  </div>
                  <label className="px-3 py-1.5 bg-white border-2 border-black font-black text-xs cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingFile ? 'Scanning & Uploading...' : 'Upload Resource File'}
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {protectedFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {protectedFiles.map((f) => (
                      <div
                        key={f.fileId}
                        className="p-2 bg-white border border-black flex items-center justify-between text-xs font-bold"
                      >
                        <span>
                          {f.originalName} ({Math.round(f.size / 1024)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setProtectedFiles((prev) =>
                              prev.filter((item) => item.fileId !== f.fileId),
                            )
                          }
                          className="text-red-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    External Resource Label (optional)
                  </label>
                  <input
                    type="text"
                    value={resourceLabel}
                    onChange={(e) => setResourceLabel(e.target.value)}
                    placeholder="e.g., GitHub Repo / Reference Sheet"
                    className="w-full px-3 py-2 border-2 border-black font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    External Resource URL (optional)
                  </label>
                  <input
                    type="url"
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border-2 border-black font-medium text-sm"
                  />
                </div>
              </div>

              {/* Phase 12: Creator Rights Confirmation */}
              <div className="p-3 bg-white border-2 border-black flex items-start gap-2.5">
                <input
                  id="rightsConfirmedCheckbox"
                  type="checkbox"
                  checked={rightsConfirmed}
                  onChange={(e) => setRightsConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <label
                  htmlFor="rightsConfirmedCheckbox"
                  className="text-xs font-bold text-gray-800"
                >
                  I confirm that I am the original creator or hold the necessary rights to publish,
                  distribute, and (if applicable) sell this educational material and its attached
                  files, and that it does not contain pirated, plagiarized, or malicious content.
                </label>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t-2 border-black">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black uppercase">Visibility:</label>
                  <select
                    value={publishStatus}
                    onChange={(e) => setPublishStatus(e.target.value as 'published' | 'draft')}
                    className="px-3 py-1.5 border-2 border-black text-xs font-black bg-white"
                  >
                    <option value="published">Publish Immediately</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 border-2 border-black font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4ADE80] border-2 border-black font-black text-sm shadow-[4px_4px_0px_#000] disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {submitting
                      ? 'Saving...'
                      : editingPostId
                        ? 'Save Changes'
                        : publishStatus === 'draft'
                          ? 'Save Draft'
                          : 'Publish Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
