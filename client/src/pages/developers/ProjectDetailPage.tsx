import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router';
import {
  ExternalLink,
  Eye,
  Flag,
  ArrowLeft,
  X,
  AlertCircle,
  MessageSquare,
  Send,
  Trash2,
  Heart,
  Rocket,
  Flame,
  Lightbulb,
  ThumbsUp,
} from 'lucide-react';
import { developerApi } from '../../services/developerApi.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface CommentItem {
  _id: string;
  projectId: string;
  userId?: string;
  authorName: string;
  authorAvatar?: string;
  isAuthor: boolean;
  content: string;
  createdAt: string;
}

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Reactions state
  const [reactions, setReactions] = useState<{
    counts: { love: number; rocket: number; fire: number; insightful: number; like: number };
    total: number;
    userReactions: string[];
  }>({
    counts: { love: 0, rocket: 0, fire: 0, insightful: 0, like: 0 },
    total: 0,
    userReactions: [],
  });
  const [isReacting, setIsReacting] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const hasRecordedViewRef = useRef<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadProject(slug);
    }
  }, [slug]);

  const loadProject = async (s: string) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await developerApi.getProjectBySlug(s);
      if (res.success && res.data) {
        setProject(res.data);

        // Record project view on load and update count (once per project visit)
        if (hasRecordedViewRef.current !== s) {
          hasRecordedViewRef.current = s;
          developerApi.recordProjectView(s).then((viewRes) => {
            if (viewRes.success && viewRes.data?.viewCount) {
              setProject((prev: any) => ({ ...prev, viewCount: viewRes.data.viewCount }));
            }
          });
        }

        // Load reactions and comments
        loadReactions(res.data._id);
        loadComments(res.data._id);
      } else {
        setError(res.error || 'Project not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReactions = async (projectId: string) => {
    try {
      const res = await developerApi.getProjectReactions(projectId);
      if (res.success && res.data) {
        setReactions(res.data);
      }
    } catch {
      // Ignore reaction loading failure
    }
  };

  const loadComments = async (projectId: string) => {
    try {
      const res = await developerApi.getProjectComments(projectId);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch {
      // Ignore comment loading failure
    }
  };

  const handleToggleReaction = async (type: 'love' | 'rocket' | 'fire' | 'insightful' | 'like') => {
    if (!project?._id || isReacting) return;
    setIsReacting(true);
    try {
      const res = await developerApi.toggleReaction(project._id, type);
      if (res.success && res.data) {
        setReactions({
          counts: res.data.counts,
          total: res.data.total,
          userReactions: res.data.userReactions || [],
        });
      }
    } catch {
      toast('Failed to update reaction.', 'error');
    } finally {
      setIsReacting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?._id || !newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const author = user ? user.name : guestName.trim() || 'Guest Viewer';
      const res = await developerApi.addProjectComment(project._id, newComment.trim(), author);
      if (res.success && res.data) {
        setComments((prev) => [res.data, ...prev]);
        setNewComment('');
        toast('Comment posted successfully!', 'success');
      } else {
        toast(res.error || 'Failed to post comment', 'error');
      }
    } catch {
      toast('Failed to post comment', 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await developerApi.deleteProjectComment(commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast('Comment deleted.', 'success');
      } else {
        toast(res.error || 'Failed to delete comment', 'error');
      }
    } catch {
      toast('Failed to delete comment', 'error');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?._id) return;

    try {
      setIsSubmittingReport(true);
      const res = await developerApi.submitReport({
        targetType: 'project',
        targetId: project._id,
        reason: reportReason,
        description: reportDescription,
        reporterEmail: user?.email,
      });

      if (res.success) {
        toast('Project report submitted for review.', 'success');
        setIsReportOpen(false);
        setReportDescription('');
      } else {
        throw new Error(res.error || 'Report submission failed');
      }
    } catch (err: any) {
      toast(err.message || 'Report error', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-canvas)] text-slate-100 py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border border-[var(--theme-gray-border)] border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs font-bold">Loading project details...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[var(--theme-canvas)] text-slate-100 py-20 px-4">
        <div className="max-w-md mx-auto bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-100">Project Not Found</h2>
          <p className="text-xs font-semibold text-slate-400">
            {error || 'This project may have been removed or unpublished.'}
          </p>
          <Link
            to="/developers/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  const profile = project.profileId;
  const isOwner =
    user && project.ownerId && (project.ownerId === user.id || project.ownerId._id === user.id);

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb Strip */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/developers/projects"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-slate-300 hover:text-slate-100 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Showcase Projects</span>
          </Link>

          <button
            onClick={() => setIsReportOpen(true)}
            className="text-xs font-mono font-bold text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>

        {/* Main Project Card */}
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[var(--theme-gray-border)]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-[#A78BFA] border border-black rounded-md text-[11px] font-mono font-black uppercase tracking-wider text-slate-100">
                  {project.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Published{' '}
                  {project.publishedAt
                    ? new Date(project.publishedAt).toLocaleDateString()
                    : 'Recently'}
                </span>

                {/* View Counter Badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-900/60 border border-black font-mono text-xs font-bold text-slate-100 shadow-sm">
                  <Eye className="w-3.5 h-3.5 text-purple-700" />
                  <span>{project.viewCount || 0} views</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
                {project.title}
              </h1>

              {project.role && (
                <div className="text-xs font-mono font-bold text-slate-300">
                  Developer Role: <strong>{project.role}</strong>
                </div>
              )}
            </div>

            {/* Live Link Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black text-slate-100 shadow-sm flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Demo</span>
                </a>
              )}

              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black shadow-sm flex items-center gap-2"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>Source Code</span>
                </a>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {project.coverImage && (
            <div className="border border-[var(--theme-gray-border)] rounded-2xl overflow-hidden max-h-[480px] bg-neutral-900 flex items-center justify-center">
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full h-auto object-cover max-h-[480px]"
              />
            </div>
          )}

          {/* Screenshots Gallery if available */}
          {project.screenshots && project.screenshots.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase font-mono text-slate-400">
                Project Screenshots
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.screenshots.map((s: string, idx: number) => (
                  <div
                    key={idx}
                    className="border border-[var(--theme-gray-border)] rounded-xl overflow-hidden h-32 bg-neutral-100"
                  >
                    <img
                      src={s}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description & Overview */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-black text-slate-100 font-mono uppercase">
              About the Project
            </h2>
            <div className="text-xs sm:text-sm font-medium text-neutral-800 leading-relaxed whitespace-pre-line">
              {project.description}
            </div>
          </div>

          {project.contributions && (
            <div className="p-4 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-2xl space-y-2">
              <h3 className="text-xs font-black uppercase font-mono text-slate-100">
                Contributions & Technical Highlights
              </h3>
              <p className="text-xs font-medium text-neutral-800 whitespace-pre-line leading-relaxed">
                {project.contributions}
              </p>
            </div>
          )}

          {/* Tech Stack */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-black/10">
              <h3 className="text-xs font-black uppercase font-mono text-slate-400">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t: string) => (
                  <span
                    key={t}
                    className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-900/60 border border-black rounded-lg"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Viewer Reactions Bar */}
          <div className="pt-6 border-t border-[var(--theme-gray-border)] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-black uppercase font-mono text-slate-300 flex items-center gap-1.5">
                <span>Reactions</span>
                <span className="text-[11px] font-normal text-slate-400 font-sans">
                  ({reactions.total} total)
                </span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                Click to react to this project
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { type: 'love', icon: Heart, label: 'Love', count: reactions.counts.love, color: 'text-rose-400' },
                { type: 'rocket', icon: Rocket, label: 'Rocket', count: reactions.counts.rocket, color: 'text-[var(--theme-dirty-white)]' },
                { type: 'fire', icon: Flame, label: 'Fire', count: reactions.counts.fire, color: 'text-amber-400' },
                {
                  type: 'insightful',
                  icon: Lightbulb,
                  label: 'Insightful',
                  count: reactions.counts.insightful,
                  color: 'text-yellow-400',
                },
                { type: 'like', icon: ThumbsUp, label: 'Like', count: reactions.counts.like, color: 'text-[var(--theme-dirty-white)]' },
              ].map((item) => {
                const isUserActive = reactions.userReactions.includes(item.type);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleToggleReaction(item.type as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-gray-border)] font-mono text-xs font-black shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                      isUserActive
                        ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] -translate-y-0.5 shadow-sm'
                        : 'bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${item.color}`} />
                    <span>{item.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Creator Bio Card */}
        {profile && (
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/60 border border-[var(--theme-gray-border)] overflow-hidden flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.displayName?.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-100">{profile.displayName}</h3>
                <p className="text-xs font-mono text-slate-400">@{profile.username}</p>
                <p className="text-xs font-medium text-slate-300 mt-1 line-clamp-1">
                  {profile.headline}
                </p>
              </div>
            </div>

            <Link
              to={`/developers/profile/${profile.username}`}
              className="px-5 py-2.5 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black text-slate-100 shadow-sm shrink-0"
            >
              View Full Developer Profile &rarr;
            </Link>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-100 stroke-[2.5]" />
              <h2 className="text-lg font-black text-slate-100">
                Community Discussion ({comments.length})
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Leave feedback or ask questions
            </span>
          </div>

          {/* Add Comment Form */}
          <form
            onSubmit={handleAddComment}
            className="space-y-3 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-2xl p-4 sm:p-5"
          >
            {!user && (
              <div>
                <label className="block text-xs font-mono font-black uppercase text-slate-100 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full sm:max-w-xs px-3 py-2 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-xl text-xs font-bold shadow-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-black uppercase text-slate-100 mb-1">
                Comment
              </label>
              <textarea
                required
                rows={3}
                placeholder="Share your thoughts on this project..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={2000}
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-xl text-xs font-medium shadow-sm focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-slate-400">
                {2000 - newComment.length} characters left
              </span>

              <button
                type="submit"
                disabled={isPostingComment || !newComment.trim()}
                className="px-4 py-2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black text-slate-100 shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPostingComment ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {comments.map((c) => {
              const canDelete =
                (user && c.userId && c.userId === user.id) ||
                isOwner ||
                (user && user.role === 'admin');

              return (
                <div
                  key={c._id}
                  className="p-4 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-2xl shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900/60 border border-black flex items-center justify-center font-black text-xs uppercase shadow-sm">
                        {c.authorName.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-100">{c.authorName}</span>
                          {c.isAuthor && (
                            <span className="px-1.5 py-0.2 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-black rounded text-[9px] font-mono font-black uppercase text-slate-100">
                              Project Author
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()} at{' '}
                          {new Date(c.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-medium text-neutral-800 leading-relaxed whitespace-pre-line pl-10">
                    {c.content}
                  </p>
                </div>
              );
            })}

            {comments.length === 0 && (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <MessageSquare className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="text-xs font-bold">No comments yet.</p>
                <p className="text-[11px]">
                  Be the first viewer to share your feedback or ask a question!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Report Modal */}
        {isReportOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--theme-gray-border)] pb-3">
                <h3 className="font-black text-base text-slate-100 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-600" />
                  <span>Report Project</span>
                </h3>
                <button onClick={() => setIsReportOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold"
                  >
                    <option value="spam">Spam or Fake Project</option>
                    <option value="inappropriate">Inappropriate / Harmful Content</option>
                    <option value="copyright">Plagiarism or Copyright Violation</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase font-mono mb-1">
                    Details
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe why this project violates community guidelines..."
                    className="w-full p-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl text-xs font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs font-black shadow-sm"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
