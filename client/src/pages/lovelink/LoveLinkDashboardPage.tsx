import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import QRCode from 'qrcode';
import {
  Heart,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Eye,
  Edit3,
  Share2,
  Trash2,
  Lock,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import {
  loveLinkApi,
  type LoveLetter,
  type DashboardMetrics,
} from '../../services/loveLinkService.js';
import { LetterPaper } from '../../components/lovelink/LetterPaper.js';

export const LoveLinkDashboardPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total: 0,
    published: 0,
    drafts: 0,
    opened: 0,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [previewLetter, setPreviewLetter] = useState<LoveLetter | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLetters = async () => {
    try {
      setIsLoading(true);
      const res = await loveLinkApi.getUserLetters({
        search,
        status: statusFilter,
        sort: sortBy,
      });
      setLetters(res.letters);
      setMetrics(res.metrics);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch letters', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLetters();
    }
  }, [isAuthenticated, statusFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLetters();
  };

  const handleCopyLink = async (letter: LoveLetter) => {
    if (!letter.publicToken) return;
    const url = `${window.location.origin}/lovelink/open/${letter.publicToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(letter._id);
      showToast('Public link copied!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleDownloadQr = async (letter: LoveLetter) => {
    if (!letter.publicToken) return;
    const url = `${window.location.origin}/lovelink/open/${letter.publicToken}`;
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: { dark: '#9f1239', light: '#ffffff' },
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `LoveLink-${letter.recipientName}-QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('QR code downloaded!', 'success');
    } catch {
      showToast('Failed to generate QR code', 'error');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke public access to this letter?')) return;
    try {
      await loveLinkApi.revokeLetter(id);
      showToast('Letter access has been revoked', 'info');
      fetchLetters();
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke access', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this letter permanently? This action cannot be undone.')) return;
    try {
      await loveLinkApi.deleteLetter(id);
      showToast('Letter deleted successfully', 'success');
      fetchLetters();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete letter', 'error');
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <Heart className="w-12 h-12 text-rose-500 mb-4 stroke-1 animate-pulse" />
        <h2 className="text-xl font-bold text-[var(--theme-dirty-white)] mb-2">
          Sign In to Access Your Letters
        </h2>
        <p className="text-sm text-[var(--theme-gray-muted)] max-w-sm mb-6">
          Track opening status, edit drafts, and manage all your digital letters in one private place.
        </p>
        <Link
          to="/login?redirect=/lovelink/my-letters"
          className="px-6 py-2.5 rounded-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-95 transition-all"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--theme-gray-border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            <span>My Letters Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--theme-gray-muted)] mt-1">
            Manage your romantic messages, track views, and share moments.
          </p>
        </div>

        <Link
          to="/lovelink/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Letter</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)]">
          <div className="text-xs font-mono uppercase text-[var(--theme-gray-muted)]">
            Total Letters
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] mt-1">
            {metrics.total}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)]">
          <div className="text-xs font-mono uppercase text-emerald-400">Published</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] mt-1">
            {metrics.published}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)]">
          <div className="text-xs font-mono uppercase text-amber-400">Drafts</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] mt-1">
            {metrics.drafts}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)]">
          <div className="text-xs font-mono uppercase text-rose-400">Opened by Recipient</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-dirty-white)] mt-1">
            {metrics.opened}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)]">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--theme-gray-muted)]" />
          <input
            type="text"
            placeholder="Search by recipient or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] focus:border-rose-500 outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="revoked">Revoked</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="opened">Recently Opened</option>
          </select>
        </div>
      </div>

      {/* Letters List / Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-xs font-mono text-[var(--theme-gray-muted)]">
          Loading letters...
        </div>
      ) : letters.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] space-y-3">
          <Heart className="w-10 h-10 text-rose-400 mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[var(--theme-dirty-white)]">No Letters Found</h3>
          <p className="text-xs text-[var(--theme-gray-muted)] max-w-sm mx-auto">
            You haven't written any letters matching these criteria yet.
          </p>
          <Link
            to="/lovelink/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Your First Letter</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {letters.map((letter) => (
            <div
              key={letter._id}
              className="p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] hover:border-rose-500/30 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      letter.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : letter.status === 'draft'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {letter.status}
                  </span>

                  <span className="text-[11px] font-mono text-[var(--theme-gray-muted)]">
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--theme-dirty-white)] truncate">
                  To: {letter.recipientName}
                </h3>
                {letter.title && (
                  <p className="text-xs font-medium text-rose-300/90 truncate mt-0.5">
                    "{letter.title}"
                  </p>
                )}
                <p className="text-xs text-[var(--theme-gray-muted)] line-clamp-2 mt-2 leading-relaxed">
                  {letter.message || '(Empty message body)'}
                </p>
              </div>

              {/* Status & Analytics Bar */}
              <div className="pt-3 border-t border-[var(--theme-gray-border)] space-y-2 text-xs">
                {letter.status === 'published' && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--theme-gray-muted)]">Opening Status:</span>
                    {letter.firstOpenedAt ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Opened ({letter.openCount || 1}x)</span>
                      </span>
                    ) : (
                      <span className="text-zinc-400">Not opened yet</span>
                    )}
                  </div>
                )}

                {letter.isPasswordProtected && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Password Protected</span>
                  </div>
                )}

                {letter.scheduledRevealAt && (
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-300/80">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Scheduled: {new Date(letter.scheduledRevealAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 border-t border-[var(--theme-gray-border)] flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewLetter(letter)}
                    className="p-1.5 rounded-lg text-[var(--theme-gray-muted)] hover:text-white hover:bg-[var(--theme-surface-raised)]"
                    title="Preview Letter"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/lovelink/create?id=${letter._id}`}
                    className="p-1.5 rounded-lg text-[var(--theme-gray-muted)] hover:text-white hover:bg-[var(--theme-surface-raised)]"
                    title="Edit Letter"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  {letter.status === 'published' && letter.publicToken && (
                    <>
                      <button
                        onClick={() => handleCopyLink(letter)}
                        className="p-1.5 rounded-lg text-[var(--theme-gray-muted)] hover:text-white hover:bg-[var(--theme-surface-raised)] cursor-pointer"
                        title="Copy Public Link"
                      >
                        {copiedId === letter._id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <Link
                        to={`/lovelink/share/${letter._id}`}
                        className="p-1.5 rounded-lg text-[var(--theme-gray-muted)] hover:text-white hover:bg-[var(--theme-surface-raised)]"
                        title="Share & QR Code"
                      >
                        <Share2 className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/lovelink/open/${letter.publicToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-[var(--theme-surface-raised)]"
                        title="View Live Recipient Experience"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {letter.status === 'published' && (
                    <button
                      onClick={() => handleRevoke(letter._id)}
                      className="p-1.5 rounded-lg text-amber-400/80 hover:text-amber-300 hover:bg-[var(--theme-surface-raised)] cursor-pointer"
                      title="Revoke Public Access"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(letter._id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-[var(--theme-surface-raised)] cursor-pointer"
                    title="Delete Letter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--theme-canvas)] border border-[var(--theme-gray-border)] p-4 sm:p-6 shadow-2xl">
            <button
              onClick={() => setPreviewLetter(null)}
              className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
            >
              Close
            </button>
            <div className="pt-8">
              <LetterPaper
                recipientName={previewLetter.recipientName}
                senderName={previewLetter.senderName}
                isAnonymous={previewLetter.isAnonymous}
                title={previewLetter.title}
                message={previewLetter.message}
                template={previewLetter.template}
                customization={previewLetter.customization}
                attachments={previewLetter.attachments}
                createdAt={previewLetter.createdAt}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
