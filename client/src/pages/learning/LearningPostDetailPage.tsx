import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  MessageSquare,
  Clock,
  Eye,
  ExternalLink,
  Flag,
  Trash2,
  Share2,
  Send,
  Star,
  Lock,
  CheckCircle2,
  Download,
  PlayCircle,
  BookOpen,
  Code2,
  ListChecks,
  ShieldCheck,
  ShoppingBag,
  FolderPlus,
} from 'lucide-react';
import {
  learningApi,
  type LearningPost,
  type LearningComment,
  type LearningReview,
  type LearningCourseLesson,
} from '../../services/learningApi.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const LearningPostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState<LearningPost | null>(null);
  const [comments, setComments] = useState<LearningComment[]>([]);
  const [reviews, setReviews] = useState<LearningReview[]>([]);
  const [reviewSummary, setReviewSummary] = useState<{
    averageRating: number;
    totalApproved: number;
    distribution: Record<number, number>;
  }>({
    averageRating: 0,
    totalApproved: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);

  // Course Player State
  const [activeLesson, setActiveLesson] = useState<LearningCourseLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [courseProgressPercent, setCourseProgressPercent] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);

  // Checkout & Purchase State
  const [pendingCheckout, setPendingCheckout] = useState<{
    purchaseId: string;
    providerSessionId: string;
    paymentProvider: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // Review Form State
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Discussion Comments State
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState<
    'spam' | 'inappropriate' | 'copyright' | 'prohibited' | 'other'
  >('inappropriate');
  const [reportReason, setReportReason] = useState('');
  const viewedSlugRef = useRef<string | null>(null);

  const loadData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const isRepeatView = viewedSlugRef.current === slug;
      if (!isRepeatView) {
        viewedSlugRef.current = slug;
      }
      const postRes = await learningApi.getPostBySlug(slug, isRepeatView);
      const loadedPost = postRes.data;
      setPost(loadedPost);

      if (loadedPost.viewerProgress) {
        setCompletedLessons(loadedPost.viewerProgress.completedLessonIds || []);
        setCourseProgressPercent(loadedPost.viewerProgress.progressPercent || 0);
        setCourseCompleted(Boolean(loadedPost.viewerProgress.isCompleted));
      }

      if (
        loadedPost.chapters &&
        loadedPost.chapters.length > 0 &&
        loadedPost.chapters[0]?.lessons?.length
      ) {
        setActiveLesson(loadedPost.chapters[0].lessons[0] || null);
      }

      const [commentsRes, reviewsRes] = await Promise.all([
        learningApi.getComments(loadedPost._id),
        learningApi.getReviews(loadedPost._id),
      ]);
      setComments(commentsRes.data.comments || []);
      setReviews(reviewsRes.data.reviews || []);
      if (reviewsRes.data.summary) {
        setReviewSummary(reviewsRes.data.summary);
      }
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLike = async () => {
    if (!post) return;
    if (!isAuthenticated) {
      showToast('Sign in to like this post', 'info');
      return;
    }
    try {
      const res = await learningApi.toggleLike(post._id);
      setPost({
        ...post,
        likesCount: res.data.likesCount,
        viewerLiked: res.data.liked,
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to like post', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!post) return;
    if (!isAuthenticated) {
      showToast('Sign in to bookmark this post', 'info');
      return;
    }
    try {
      const res = await learningApi.toggleBookmark(post._id);
      setPost({
        ...post,
        bookmarksCount: res.data.bookmarksCount,
        viewerBookmarked: res.data.bookmarked,
      });
      showToast(res.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to bookmark post', 'error');
    }
  };

  const handleSaveFreeToLibrary = async () => {
    if (!post) return;
    if (!isAuthenticated) {
      showToast('Sign in to save materials to your library', 'info');
      return;
    }
    try {
      await learningApi.saveFreeToLibrary(post._id);
      showToast('Added to your personal Learning Library!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not save to library', 'error');
    }
  };

  const handleInitiatePurchase = async () => {
    if (!post) return;
    if (!isAuthenticated) {
      showToast('Please sign in to purchase this learning material', 'info');
      return;
    }
    setProcessingCheckout(true);
    try {
      const res = await learningApi.createPurchaseCheckout(post._id);
      setPendingCheckout(res.data);
      showToast(
        'Secure checkout session initialized. Complete payment verification to unlock.',
        'info',
      );
    } catch (err: any) {
      showToast(err.message || 'Could not initialize checkout session', 'error');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const handleCompleteSandboxPayment = async () => {
    if (!pendingCheckout) return;
    setProcessingCheckout(true);
    try {
      await learningApi.verifySandboxPurchase(pendingCheckout.purchaseId);
      setPendingCheckout(null);
      showToast(
        'Payment verified on backend! Full learning material unlocked and added to your library.',
        'success',
      );
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Payment verification failed', 'error');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const handleToggleLessonComplete = async (lessonId: string) => {
    if (!post || !isAuthenticated) return;
    const isAlreadyDone = completedLessons.includes(lessonId);
    try {
      const res = await learningApi.updateCourseProgress(post._id, {
        lessonId,
        completed: !isAlreadyDone,
      });
      setCompletedLessons(res.data.completedLessonIds || []);
      setCourseProgressPercent(res.data.progressPercent || 0);
      setCourseCompleted(Boolean(res.data.isCompleted));
      showToast(
        !isAlreadyDone ? 'Lesson marked completed!' : 'Lesson marked incomplete',
        'success',
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update course progress', 'error');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await learningApi.upsertReview(post._id, ratingInput, reviewText);
      showToast('Your rating and review have been saved!', 'success');
      setReviewText('');
      const refreshed = await learningApi.getReviews(post._id);
      setReviews(refreshed.data.reviews || []);
      if (refreshed.data.summary) {
        setReviewSummary(refreshed.data.summary);
      }
      setPost((prev) =>
        prev
          ? {
              ...prev,
              averageRating: res.data.averageRating,
              reviewCount: res.data.reviewCount,
            }
          : prev,
      );
    } catch (err: any) {
      showToast(err.message || 'Could not submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await learningApi.addComment(post._id, commentText, replyTo);
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
      setReplyTo(null);
      setPost({ ...post, commentsCount: post.commentsCount + 1 });
      showToast('Comment posted', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await learningApi.deleteComment(commentId);
      setComments((prev) =>
        prev.filter((c) => c._id !== commentId && c.parentCommentId !== commentId),
      );
      if (post) setPost({ ...post, commentsCount: res.data.commentsCount });
      showToast('Comment deleted', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not delete comment', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!post || !window.confirm('Delete this post permanently?')) return;
    try {
      await learningApi.deletePost(post._id);
      showToast('Post deleted', 'success');
      navigate('/learning');
    } catch (err: any) {
      showToast(err.message || 'Could not delete post', 'error');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    try {
      await learningApi.createReport('post', post._id, reportReason, reportCategory);
      showToast('Report submitted to moderators', 'success');
      setShowReportModal(false);
      setReportReason('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-black p-8 animate-pulse h-96" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-2 border-black p-10 text-center shadow-[6px_6px_0px_#000]">
          <h1 className="text-2xl font-black mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-6">
            This learning post may have been removed or does not exist.
          </p>
          <Link
            to="/learning"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FACC15] border-2 border-black font-black"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Learning Hub
          </Link>
        </div>
      </div>
    );
  }

  const isOwnerOrAdmin =
    user && (String(user.id) === String(post.authorId) || user.role === 'admin');
  const isPaid = post.pricingType === 'paid' && (post.price || 0) > 0;
  const hasAccess = post.hasAccess !== false;
  const rootComments = comments.filter((c) => !c.parentCommentId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <Link
          to="/learning"
          className="inline-flex items-center gap-2 text-sm font-black text-black hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Learning Hub
        </Link>

        <div className="flex items-center gap-2">
          {!isPaid && isAuthenticated && (
            <button
              type="button"
              onClick={handleSaveFreeToLibrary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4ADE80] border-2 border-black text-xs font-black cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Save to My Library
            </button>
          )}
        </div>
      </div>

      {/* Main Learning Material Container */}
      <article className="bg-white border-2 border-black p-6 sm:p-10 shadow-[6px_6px_0px_#000] mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`px-3 py-1 border-2 border-black text-xs font-black uppercase ${
              isPaid ? 'bg-[#FACC15]' : 'bg-[#4ADE80]'
            }`}
          >
            {isPaid ? `PAID • ${post.currency || 'PHP'} ${post.price}` : 'FREE'}
          </span>
          <span className="px-3 py-1 bg-[#38BDF8] border-2 border-black text-xs font-black uppercase">
            {post.contentType || 'article'}
          </span>
          <span className="px-3 py-1 bg-[#FAF7F2] border-2 border-black text-xs font-black uppercase">
            {post.category}
          </span>
          <span className="px-3 py-1 bg-white border-2 border-black text-xs font-bold uppercase">
            {post.difficulty}
          </span>
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1 ml-auto">
            <Clock className="w-4 h-4" /> {post.readTimeMinutes} min •{' '}
            <Eye className="w-4 h-4 ml-2" /> {post.viewsCount} views
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-black mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white font-black flex items-center justify-center border-2 border-black">
              {post.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-black text-sm text-black">{post.authorName}</div>
              <div className="text-xs text-gray-500">
                Published {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-bold text-xs cursor-pointer ${
                post.viewerLiked ? 'bg-red-100 text-red-700' : 'bg-white text-black'
              }`}
            >
              <Heart className={`w-4 h-4 ${post.viewerLiked ? 'fill-red-600' : ''}`} />
              {post.likesCount}
            </button>

            <button
              type="button"
              onClick={handleBookmark}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-bold text-xs cursor-pointer ${
                post.viewerBookmarked ? 'bg-[#FACC15]' : 'bg-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.viewerBookmarked ? 'fill-black' : ''}`} />
              Save
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-bold text-xs bg-white cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="p-1.5 border-2 border-black bg-white text-gray-600 hover:text-red-600 cursor-pointer"
                title="Report post"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}

            {isOwnerOrAdmin && (
              <button
                type="button"
                onClick={handleDeletePost}
                className="p-1.5 border-2 border-black bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Learning Outcomes Box */}
        {post.learningOutcomes && post.learningOutcomes.length > 0 && (
          <div className="mb-6 p-5 bg-[#FAF7F2] border-2 border-black">
            <h3 className="text-sm font-black uppercase mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-700" /> What You Will Learn
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium text-gray-800">
              {post.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-black text-green-700">✓</span> {outcome}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Phase 3 & 10: Paid Content Purchase Lock & Verified Checkout Workflow */}
        {isPaid && !hasAccess && (
          <div
            data-testid="paid-content-lock-banner"
            className="mb-8 p-6 bg-[#FACC15] border-4 border-black shadow-[6px_6px_0px_#000]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-white text-xs font-black uppercase mb-2">
                  <Lock className="w-3.5 h-3.5" /> Protected Paid Learning Material
                </div>
                <h2 className="text-2xl font-black text-black">
                  Unlock Full Access for {post.currency || 'PHP'} {post.price}
                </h2>
                <p className="text-sm font-bold text-gray-900 mt-1 max-w-xl">
                  You are currently viewing the public preview. Purchase once to unlock the complete
                  lessons, step-by-step instructions, code examples, and downloadable resources
                  permanently in your Learning Library.
                </p>
              </div>

              <div className="shrink-0">
                {!pendingCheckout ? (
                  <button
                    type="button"
                    disabled={processingCheckout}
                    onClick={handleInitiatePurchase}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-black text-white font-black text-sm uppercase border-2 border-black shadow-[4px_4px_0px_#fff] cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {processingCheckout
                      ? 'Starting Checkout...'
                      : `Buy Now • ${post.currency || 'PHP'} ${post.price}`}
                  </button>
                ) : (
                  <div className="p-4 bg-white border-2 border-black space-y-2">
                    <div className="text-xs font-black uppercase">
                      Checkout Session Ready ({pendingCheckout.paymentProvider})
                    </div>
                    <div className="text-xs text-gray-600">
                      Session: {pendingCheckout.providerSessionId.slice(0, 24)}...
                    </div>
                    <button
                      type="button"
                      disabled={processingCheckout}
                      onClick={handleCompleteSandboxPayment}
                      className="w-full px-4 py-2 bg-[#4ADE80] border-2 border-black font-black text-xs uppercase cursor-pointer"
                    >
                      {processingCheckout ? 'Verifying Payment...' : 'Complete Verified Purchase'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Lesson Player */}
        {post.videoUrl && hasAccess && (
          <div className="mb-6 p-4 bg-black border-2 border-black text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase flex items-center gap-1.5 text-[#FACC15]">
                <PlayCircle className="w-4 h-4" /> Video Lesson Resource
              </span>
              <a
                href={post.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold underline text-[#38BDF8] inline-flex items-center gap-1"
              >
                Open Video Stream <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Main Written Content / Public Preview */}
        <div className="prose max-w-none text-gray-900 whitespace-pre-wrap font-medium leading-relaxed text-base mb-8">
          {post.content}
        </div>

        {/* Complete Course Curriculum & Interactive Lesson Player */}
        {post.chapters && post.chapters.length > 0 && (
          <div className="mb-8 border-2 border-black bg-[#FAF7F2] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b-2 border-black">
              <div>
                <h3 className="text-lg font-black text-black flex items-center gap-2">
                  <BookOpen className="w-5 h-5" /> Course Curriculum ({post.chapters.length}{' '}
                  Chapters)
                </h3>
                {hasAccess && isAuthenticated && (
                  <p className="text-xs font-bold text-gray-600">
                    Your Course Progress: {courseProgressPercent}%{' '}
                    {courseCompleted ? '(Completed ✓)' : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-3">
                {post.chapters.map((ch) => (
                  <div key={ch.chapterId} className="bg-white border-2 border-black p-3">
                    <div className="font-black text-sm text-black mb-2">{ch.title}</div>
                    <div className="space-y-1.5">
                      {ch.lessons.map((les) => {
                        const isCompleted = completedLessons.includes(les.lessonId);
                        const isSelected = activeLesson?.lessonId === les.lessonId;
                        return (
                          <button
                            key={les.lessonId}
                            type="button"
                            onClick={() => setActiveLesson(les)}
                            className={`w-full text-left p-2 border border-black text-xs font-bold flex items-center justify-between cursor-pointer ${
                              isSelected ? 'bg-[#FACC15]' : 'bg-[#FAF7F2] hover:bg-gray-100'
                            }`}
                          >
                            <span className="truncate pr-2">
                              {isCompleted ? '✓ ' : ''}
                              {les.title}
                            </span>
                            <span className="shrink-0 flex items-center gap-1">
                              {les.isFreePreview && !hasAccess && (
                                <span className="px-1.5 py-0.5 bg-[#4ADE80] border border-black text-[10px] font-black">
                                  Preview
                                </span>
                              )}
                              {les.isLocked ? (
                                <Lock className="w-3.5 h-3.5 text-gray-600" />
                              ) : (
                                <span>{les.durationMinutes || 5}m</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-7 bg-white border-2 border-black p-5">
                {activeLesson ? (
                  activeLesson.isLocked ? (
                    <div className="text-center py-12">
                      <Lock className="w-10 h-10 mx-auto mb-2 text-gray-500" />
                      <h4 className="font-black text-base mb-1">{activeLesson.title}</h4>
                      <p className="text-xs text-gray-600">
                        Purchase this course to unlock this lesson and all course resources.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-200">
                        <h4 className="font-black text-lg">{activeLesson.title}</h4>
                        {hasAccess && isAuthenticated && (
                          <button
                            type="button"
                            onClick={() => handleToggleLessonComplete(activeLesson.lessonId)}
                            className={`px-3 py-1 border-2 border-black text-xs font-black cursor-pointer ${
                              completedLessons.includes(activeLesson.lessonId)
                                ? 'bg-[#4ADE80]'
                                : 'bg-white'
                            }`}
                          >
                            {completedLessons.includes(activeLesson.lessonId)
                              ? '✓ Completed'
                              : 'Mark Complete'}
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {activeLesson.content}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-xs text-gray-500">Select a lesson to begin learning.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step-by-Step Guide Viewer */}
        {post.steps && post.steps.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-lg font-black text-black flex items-center gap-2">
              <ListChecks className="w-5 h-5" /> Step-by-Step Guide
            </h3>
            {post.steps.map((st) => (
              <div key={st.stepNumber} className="p-4 bg-[#FAF7F2] border-2 border-black space-y-1">
                <div className="font-black text-sm">
                  Step {st.stepNumber}: {st.title}
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{st.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Code Examples & Project Snippets */}
        {post.codeSnippets && post.codeSnippets.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-lg font-black text-black flex items-center gap-2">
              <Code2 className="w-5 h-5" /> Code Examples & Project Snippets
            </h3>
            {post.codeSnippets.map((snip, idx) => (
              <div key={idx} className="border-2 border-black bg-gray-900 text-gray-100 p-4">
                <div className="flex items-center justify-between text-xs font-black text-[#FACC15] mb-2">
                  <span>{snip.title}</span>
                  <span className="uppercase">{snip.language}</span>
                </div>
                <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {snip.code}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Protected Downloadable Files */}
        {post.protectedFiles && post.protectedFiles.length > 0 && (
          <div className="mb-8 p-4 bg-[#FAF7F2] border-2 border-black">
            <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Downloadable Learning Resources
            </h3>
            <div className="space-y-2">
              {post.protectedFiles.map((file) => (
                <div
                  key={file.fileId}
                  className="p-3 bg-white border border-black flex items-center justify-between text-xs font-bold"
                >
                  <div>
                    <span className="font-black">{file.originalName}</span>{' '}
                    <span className="text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                  </div>
                  {file.isLocked || !file.downloadUrl ? (
                    <span className="inline-flex items-center gap-1 text-gray-500 font-black">
                      <Lock className="w-3.5 h-3.5" /> Locked (Purchase Required)
                    </span>
                  ) : (
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#4ADE80] border border-black font-black text-black inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {post.resourceLinks && post.resourceLinks.length > 0 && (
          <div className="mt-8 p-4 bg-[#FAF7F2] border-2 border-black">
            <h3 className="text-xs font-black uppercase tracking-wider mb-2">
              Helpful Resources & Links
            </h3>
            <div className="flex flex-wrap gap-3">
              {post.resourceLinks.map((r, idx) => (
                <a
                  key={idx}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" /> {r.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-200">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-bold px-2.5 py-1 bg-gray-100 border border-black"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* PHASE 8: FORMAL RATINGS & REVIEWS SECTION (Separate from Discussion Comments) */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_#000] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black">
          <div>
            <h2 className="text-xl font-black text-black flex items-center gap-2">
              <Star className="w-5 h-5 fill-[#FACC15]" /> Learner Ratings & Reviews (
              {reviewSummary.totalApproved})
            </h2>
            <p className="text-xs text-gray-600">
              Verified ratings from learners who studied or purchased this material.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#FAF7F2] border-2 border-black px-4 py-2">
            <span className="text-2xl font-black">{reviewSummary.averageRating.toFixed(1)}</span>
            <span className="text-xs font-bold text-gray-600">
              out of 5.0 ({reviewSummary.totalApproved} reviews)
            </span>
          </div>
        </div>

        {isAuthenticated && String(user?.id) !== String(post.authorId) && hasAccess && (
          <form
            onSubmit={handleSubmitReview}
            className="mb-6 p-4 bg-[#FAF7F2] border-2 border-black space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase">Rate & Review This Material</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className={`text-lg cursor-pointer ${
                      star <= ratingInput ? 'text-amber-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={2}
              required
              minLength={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your honest learning experience with this material..."
              className="w-full p-2.5 border-2 border-black text-sm bg-white"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 bg-[#FACC15] border-2 border-black font-black text-xs uppercase cursor-pointer"
            >
              {submittingReview ? 'Saving Review...' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-600">
            No learner reviews yet. Be the first to rate this material!
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-4 bg-[#FAF7F2] border-2 border-black">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">{rev.userName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#4ADE80] border border-black text-[11px] font-black">
                        <ShieldCheck className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="font-black text-xs text-amber-600">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PHASE 9: COMMUNITY DISCUSSION SECTION */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_#000]">
        <h2 className="text-xl font-black text-black flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5" /> Discussion ({post.commentsCount})
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="mb-8">
            {replyTo && (
              <div className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-2">
                Replying to comment
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="underline text-black"
                >
                  Cancel
                </button>
              </div>
            )}
            <textarea
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ask a question or share your thoughts..."
              className="w-full p-3 border-2 border-black font-medium text-sm mb-3 bg-[#FAF7F2]"
            />
            <button
              type="submit"
              disabled={submittingComment}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4ADE80] border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_#000] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="p-4 bg-[#FAF7F2] border-2 border-black mb-6 text-sm font-bold">
            Please{' '}
            <Link to="/login" className="underline">
              sign in
            </Link>{' '}
            to join the discussion.
          </div>
        )}

        <div className="space-y-4">
          {rootComments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet. Start the conversation!</p>
          ) : (
            rootComments.map((c) => {
              const replies = comments.filter((r) => r.parentCommentId === c._id);
              const commentOwnerId = c.authorId || c.userId;
              const canDelete =
                user && (String(user.id) === String(commentOwnerId) || user.role === 'admin');
              return (
                <div key={c._id} className="border-2 border-black p-4 bg-[#FAF7F2]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-black">
                      {c.authorName || c.userName || 'Learner'}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      {isAuthenticated && (
                        <button
                          type="button"
                          onClick={() => setReplyTo(c._id)}
                          className="font-bold text-black hover:underline"
                        >
                          Reply
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-red-600 hover:underline font-bold"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.content}</p>

                  {replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-black space-y-2">
                      {replies.map((r) => (
                        <div key={r._id} className="bg-white border border-black p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs">
                              {r.authorName || r.userName || 'Learner'}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-800">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 max-w-md w-full shadow-[8px_8px_0px_#000]">
            <h3 className="text-xl font-black mb-2">Report Learning Content</h3>
            <p className="text-xs text-gray-600 mb-4">
              Report spam, copyright infringement, or prohibited material to VexoraMods moderators.
            </p>
            <form onSubmit={handleReport} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border-2 border-black text-sm font-bold bg-white"
                >
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="copyright">Copyright Infringement / Plagiarism</option>
                  <option value="prohibited">Prohibited / Malicious Material</option>
                  <option value="spam">Spam or Misleading</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <textarea
                required
                minLength={5}
                rows={4}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe why this content should be reviewed..."
                className="w-full p-3 border-2 border-black text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border-2 border-black font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white border-2 border-black font-black text-xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
