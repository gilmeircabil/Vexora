import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Sparkles,
  Zap,
  Clock,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Cpu,
  Layers,
  ArrowRight,
  Upload,
  Camera,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { authApi } from '../services/authApi.js';

interface AIJobItem {
  _id: string;
  tool: string;
  status: string;
  creditsConsumed?: number;
  outputUrl?: string;
  inputMetadata?: {
    originalName?: string;
    mode?: string;
    size?: number;
  };
  createdAt: string;
}

export const DashboardPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<AIJobItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('Image size exceeds 15MB limit.', 'error');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const res = await authApi.uploadAvatar(file);
      if (res.success && res.data?.avatarUrl) {
        updateUser({ avatarUrl: res.data.avatarUrl });
        showToast('Profile picture updated successfully!', 'success');
      } else {
        throw new Error(res.error || 'Failed to upload profile picture');
      }
    } catch (err: any) {
      showToast(err.message || 'Avatar upload failed. Please try again.', 'error');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsRemovingAvatar(true);
      const res = await authApi.deleteAvatar();
      if (res.success) {
        updateUser({ avatarUrl: '' });
        showToast('Profile picture removed.', 'success');
      } else {
        throw new Error(res.error || 'Failed to remove profile picture');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to remove picture.', 'error');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const loadDashboardData = async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const jobsRes = await fetch('/api/ai/history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData.success) {
          setJobs(jobsData.data.jobs || []);
        }
      }
    } catch {
      showToast('Could not load processing history.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-neutral-500">
        Loading dashboard profile...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Profile Card with Avatar Changer */}
      <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-slate-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Container */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] shadow-sm overflow-hidden flex items-center justify-center font-bold text-2xl sm:text-3xl uppercase">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'User avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user.name || user.username || 'U').slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Quick Camera Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)] shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all"
              title="Change Picture"
              aria-label="Upload new profile picture"
            >
              {isUploadingAvatar ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 stroke-[2]" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--theme-dirty-white)]">
                {user.name || user.username}
              </h1>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase font-mono bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)]">
                {user.role === 'admin' ? 'Admin' : 'Free Member'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono font-medium text-[var(--theme-gray-muted)]">
              @{user.username} {user.email ? `• ${user.email}` : ''}
            </p>
            <p className="text-xs text-[var(--theme-gray-muted)] font-normal">
              Personalize your account. Your profile picture appears across the site and header
              menu.
            </p>
          </div>
        </div>

        {/* Avatar Actions & Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleAvatarUpload}
            className="hidden"
            id="user-avatar-upload-input"
          />

          <button
            type="button"
            disabled={isUploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] font-semibold text-xs uppercase rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            {isUploadingAvatar ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 stroke-[2]" />
                <span>{user.avatarUrl ? 'Change Picture' : 'Upload Picture'}</span>
              </>
            )}
          </button>

          {user.avatarUrl && (
            <button
              type="button"
              disabled={isRemovingAvatar || isUploadingAvatar}
              onClick={handleRemoveAvatar}
              className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950/40 text-rose-400 font-semibold text-xs uppercase border border-slate-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Remove profile picture and revert to initials"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isRemovingAvatar ? 'Removing...' : 'Remove'}</span>
            </button>
          )}

          <Link
            to="/tools"
            className="px-4 py-2 bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] font-semibold text-xs uppercase border border-[var(--theme-gray-border)] rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" /> All Tools
          </Link>
          <Link
            to="/design-studio"
            className="px-4 py-2 bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] font-semibold text-xs uppercase border border-[var(--theme-gray-border)] rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-[var(--theme-dirty-white)]" /> Design Studio
          </Link>
        </div>
      </div>

      {/* Platform & Account Telemetry Strip */}
      <div className="border-y border-[var(--theme-gray-border)] py-5 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x md:divide-[var(--theme-gray-border)] text-[var(--theme-dirty-white)]">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase text-[var(--theme-gray-muted)]">
              Platform Edition
            </span>
            <Sparkles className="w-4 h-4 text-[var(--theme-dirty-white)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--theme-dirty-white)]">100% Free Forever</div>
          <p className="text-xs text-[var(--theme-gray-muted)] font-normal">
            No subscriptions, no credits, and no daily limits. Ready out-of-the-box.
          </p>
        </div>

        <div className="pt-4 md:pt-0 md:pl-6 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase text-[var(--theme-gray-muted)]">
              VexoraMods Studio
            </span>
            <Layers className="w-4 h-4 text-[var(--theme-dirty-white)]" />
          </div>
          <div className="text-xl font-bold text-[var(--theme-dirty-white)]">Design Editor</div>
          <Link
            to="/design-studio"
            className="text-xs font-semibold text-[var(--theme-dirty-white)] hover:text-[var(--theme-dirty-white-muted)] hover:underline inline-flex items-center gap-1 mt-1"
          >
            Open Design Studio <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="pt-4 md:pt-0 md:pl-6 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase text-[var(--theme-gray-muted)]">
              Jobs Executed
            </span>
            <Zap className="w-4 h-4 text-[var(--theme-dirty-white)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--theme-dirty-white)]">{jobs.length} Runs</div>
          <p className="text-xs text-[var(--theme-gray-muted)] font-normal">
            Saved history across AI tools and image processing pipelines.
          </p>
        </div>
      </div>

      {/* Processing History Table */}
      <div className="p-6 bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl shadow-sm space-y-4 text-[var(--theme-dirty-white)]">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-gray-border)]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            <h2 className="text-xl font-bold text-[var(--theme-dirty-white)]">Processing History</h2>
          </div>
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={isLoadingData}
            className="p-1.5 rounded-lg bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] cursor-pointer"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingData ? (
          <div className="py-12 text-center text-xs text-[var(--theme-gray-muted)]">
            Loading recent processing runs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-sm font-medium text-[var(--theme-gray-muted)]">
            No tools executed yet. Try out one of the{' '}
            <Link to="/tools?type=ai" className="text-[var(--theme-dirty-white)] underline">
              AI Tools
            </Link>{' '}
            or design on{' '}
            <Link to="/studio" className="text-[var(--theme-dirty-white)] underline">
              Design Studio
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-gray-border)] font-semibold uppercase text-[var(--theme-gray-muted)] bg-[var(--theme-surface-raised)]">
                  <th className="py-2.5 px-3">Tool</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Input File</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-gray-border)] font-medium">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-[var(--theme-surface-raised)] transition-colors">
                    <td className="py-3 px-3 uppercase font-mono font-semibold text-[var(--theme-dirty-white)]">
                      {job.tool}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase font-mono border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)]"
                      >
                        {job.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : job.status === 'failed' ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        )}
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--theme-gray-muted)] truncate max-w-xs">
                      {job.inputMetadata?.originalName || 'Direct upload'}
                    </td>
                    <td className="py-3 px-3 text-[var(--theme-gray-muted)] font-mono">
                      {new Date(job.createdAt).toLocaleDateString()}{' '}
                      {new Date(job.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {job.outputUrl ? (
                        <a
                          href={job.outputUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] font-semibold text-[11px] rounded-lg shadow-sm"
                        >
                          <Download className="w-3 h-3" /> Download
                        </a>
                      ) : (
                        <span className="text-[var(--theme-gray-muted)] font-mono">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
