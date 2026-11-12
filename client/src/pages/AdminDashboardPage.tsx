import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ShieldCheck,
  Users,
  Heart,
  RefreshCw,
  BookOpen,
  Flag,
  Settings,
  Webhook,
  MessageSquare,
  Megaphone,
  Radio,
  Send,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  X,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { useMaintenance } from '../context/MaintenanceContext.js';
import { PAGE_LOCK_ITEMS, type MaintenanceConfigData } from '../config/pageLocks.js';
import { adminDonationApi } from '../services/adminDonationApi.js';
import { announcementApi, type BroadcastAnnouncement } from '../services/announcementApi.js';

interface AdminStats {
  totalUsers: number;
  totalAIJobs: number;
  failedAIJobs: number;
  completedAIJobs?: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isSuspended?: boolean;
  suspensionReason?: string;
  createdAt: string;
}

interface ToolConfig {
  toolId: string;
  name: string;
  creditCost?: number;
  minPlan?: string;
  isEnabled: boolean;
}

type AdminTab =
  | 'announcements'
  | 'maintenance'
  | 'learning'
  | 'donations'
  | 'users'
  | 'platform'
  | 'reports'
  | 'tools';

export const AdminDashboardPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('announcements');
  const [isLoading, setIsLoading] = useState(true);

  // Global Broadcast Announcements Data
  const [announcements, setAnnouncements] = useState<BroadcastAnnouncement[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<
    'info' | 'success' | 'warning' | 'important'
  >('info');
  const [announcementExpiry, setAnnouncementExpiry] = useState<string>('none');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Learning Hub Admin Data
  const [learningPosts, setLearningPosts] = useState<any[]>([]);
  const [learningComments, setLearningComments] = useState<any[]>([]);
  const [learningReports, setLearningReports] = useState<any[]>([]);

  // Community & Donations Data
  const [donations, setDonations] = useState<any[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);

  // Preserved Legacy Developer & Project Data
  const [reports, setReports] = useState<any[]>([]);

  // Maintenance Mode & Page Locks Data
  const { maintenance, saveMaintenanceConfig, refresh: refreshMaintenance } = useMaintenance();
  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceConfigData>(maintenance);
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  useEffect(() => {
    if (maintenance) {
      setMaintenanceForm(maintenance);
    }
  }, [maintenance]);

  const handleToggleGlobalMaintenance = () => {
    setMaintenanceForm((prev) => ({
      ...prev,
      global: !prev.global,
    }));
  };

  const handleTogglePageMaintenance = (pageKey: string) => {
    setMaintenanceForm((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: !prev.pages[pageKey],
      },
    }));
  };

  const handleSaveMaintenance = async () => {
    setIsSavingMaintenance(true);
    try {
      const res = await saveMaintenanceConfig(maintenanceForm);
      if (res.success) {
        showToast('Maintenance settings saved successfully!', 'success');
        await refreshMaintenance();
      } else {
        showToast(res.error || 'Failed to save maintenance settings', 'error');
      }
    } catch {
      showToast('Network error saving maintenance settings', 'error');
    } finally {
      setIsSavingMaintenance(false);
    }
  };

  const handleResetMaintenanceDefaults = () => {
    if (window.confirm('Reset all maintenance settings to defaults (all pages online)?')) {
      setMaintenanceForm({
        global: false,
        title: 'Scheduled Maintenance',
        message:
          'This section is currently undergoing maintenance and improvements. Please check back shortly.',
        estimatedReturn: '',
        pages: {
          HOME: false,
          TOOLS: false,
          STUDIO: false,
          LEARNING: false,
          STUDY_SPACE: false,
          COMMUNITY: false,
          REVIEWS: false,
          DASHBOARD: false,
          ABOUT: false,
          PRIVACY: false,
          TERMS: false,
          LICENSES: false,
          CONTRIBUTING: false,
        },
      });
    }
  };

  // Platform & Homepage Config Data
  const [platformConfig, setPlatformConfig] = useState<{
    heroHeadline: string;
    heroDescription: string;
    aboutMission: string;
    contactEmail: string;
    githubUrl: string;
    featuredToolIds: string;
  }>({
    heroHeadline: 'Everything You Need. One Platform.',
    heroDescription:
      'Discover free online tools, explore AI-powered utilities, create designs, and learn with a growing community.',
    aboutMission: '',
    contactEmail: '',
    githubUrl: '',
    featuredToolIds: '',
  });
  const [contactInquiries, setContactInquiries] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        showToast('Access denied: administrative permissions required.', 'error');
        navigate('/');
      }
    }
  }, [authLoading, isAuthenticated, user, navigate, showToast]);

  const fetchAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [
        usageRes,
        usersRes,
        toolsRes,
        donRes,
        webhooksRes,
        repRes,
        lpRes,
        lcRes,
        lrRes,
        cfgRes,
        annRes,
      ] = await Promise.all([
        fetch('/api/admin/usage', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/tools', { headers: { Authorization: `Bearer ${token}` } }),
        adminDonationApi.getDonations(),
        adminDonationApi.getWebhooks(),
        adminDonationApi.getReports(),
        adminDonationApi.getLearningPosts(),
        adminDonationApi.getLearningComments(),
        adminDonationApi.getLearningReports(),
        adminDonationApi.getPlatformConfig(),
        announcementApi
          .getAll()
          .catch(() => ({ success: false, data: { announcements: [], connectedLiveClients: 0 } })),
      ]);

      if (usageRes.ok) {
        const u = await usageRes.json();
        if (u.success) setStats(u.data.stats);
      }

      if (usersRes.ok) {
        const usr = await usersRes.json();
        if (usr.success) setUsers(usr.data.users || []);
      }

      if (toolsRes.ok) {
        const tl = await toolsRes.json();
        if (tl.success) setTools(tl.data.tools || []);
      }

      if (donRes.success) {
        setDonations(donRes.data.donations || []);
      }

      if (webhooksRes.success) {
        setWebhookEvents(webhooksRes.data.webhooks || webhooksRes.data.events || []);
      }

      if (repRes.success) {
        setReports(repRes.data.reports || []);
      }

      if (lpRes.success) {
        setLearningPosts(lpRes.data.items || lpRes.data.posts || []);
      }

      if (lcRes.success) {
        setLearningComments(lcRes.data.items || lcRes.data.comments || []);
      }

      if (lrRes.success) {
        setLearningReports(lrRes.data.items || lrRes.data.reports || []);
      }

      if (annRes?.success && annRes.data) {
        setAnnouncements(annRes.data.announcements || []);
      }

      if (cfgRes.success && cfgRes.data) {
        const cfg = cfgRes.data.config || cfgRes.data;
        setPlatformConfig({
          heroHeadline: cfg.heroHeadline || 'Everything You Need. One Platform.',
          heroDescription:
            cfg.heroDescription ||
            'Discover free online tools, explore AI-powered utilities, create designs, and learn with a growing community.',
          aboutMission: cfg.aboutMission || '',
          contactEmail: cfg.contactEmail || '',
          githubUrl: cfg.githubUrl || '',
          featuredToolIds: Array.isArray(cfg.featuredToolIds) ? cfg.featuredToolIds.join(', ') : '',
        });
        setContactInquiries(cfgRes.data.inquiries || []);
      }
    } catch {
      showToast('Failed to fetch administrative data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [token, user]);

  // Global Announcement Broadcast Handlers
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      showToast('Please provide both an announcement title and message.', 'error');
      return;
    }

    let expiresAt: string | null = null;
    if (announcementExpiry === '1h') {
      expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    } else if (announcementExpiry === '6h') {
      expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    } else if (announcementExpiry === '24h') {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    } else if (announcementExpiry === '3d') {
      expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    } else if (announcementExpiry === '7d') {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    try {
      setIsBroadcasting(true);
      const res = await announcementApi.create({
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
        type: announcementType,
        expiresAt,
      });

      if (res.success && res.data) {
        showToast('Announcement broadcasted to all users successfully!', 'success');
        setAnnouncements((prev) => [res.data, ...prev]);
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        setAnnouncementType('info');
        setAnnouncementExpiry('none');
        setShowConfirmModal(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to broadcast announcement.', 'error');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleToggleAnnouncementStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await announcementApi.updateStatus(id, nextStatus);
      if (res.success) {
        setAnnouncements((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: nextStatus } : a)),
        );
        showToast(`Announcement marked as ${nextStatus}.`, 'success');
      }
    } catch {
      showToast('Failed to update announcement status.', 'error');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await announcementApi.delete(id);
      if (res.success) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
        showToast('Announcement deleted.', 'success');
      }
    } catch {
      showToast('Failed to delete announcement.', 'error');
    }
  };

  // Learning Hub Moderation Handlers
  const handleModeratePost = async (
    postId: string,
    updates: { status?: string; isFeatured?: boolean },
  ) => {
    try {
      const res = await adminDonationApi.moderateLearningPost(postId, updates);
      if (res.success) {
        showToast('Learning Hub post updated.', 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update post.', 'error');
    }
  };

  const handleDeleteLearningPost = async (postId: string, title: string) => {
    if (!window.confirm(`Permanently delete Learning Hub post "${title}"?`)) return;
    try {
      const res = await adminDonationApi.deleteLearningPost(postId);
      if (res.success) {
        showToast('Post deleted.', 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to delete post.', 'error');
    }
  };

  const handleModerateComment = async (
    commentId: string,
    status: 'active' | 'hidden' | 'deleted',
  ) => {
    try {
      const res = await adminDonationApi.moderateLearningComment(commentId, status);
      if (res.success) {
        showToast(`Comment marked as ${status}.`, 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to moderate comment.', 'error');
    }
  };

  const handleResolveLearningReport = async (
    reportId: string,
    status: 'resolved' | 'dismissed',
  ) => {
    const actionTaken = window.prompt(
      `Enter moderator note for report (${status}):`,
      'Reviewed by moderator',
    );
    if (actionTaken === null) return;
    try {
      const res = await adminDonationApi.resolveLearningReport(reportId, {
        status,
        actionTaken,
      });
      if (res.success) {
        showToast(`Learning report marked as ${status}.`, 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to resolve report.', 'error');
    }
  };

  // User Suspension Handler
  const handleToggleSuspendUser = async (u: AdminUser) => {
    const nextSuspended = !u.isSuspended;
    const reason = nextSuspended
      ? window.prompt(
          'Provide reason for suspending this account:',
          'Community guidelines violation',
        )
      : undefined;
    if (nextSuspended && reason === null) return;

    try {
      const res = await adminDonationApi.updateUserStatus(u._id, {
        isSuspended: nextSuspended,
        suspensionReason: reason || '',
      });
      if (res.success) {
        showToast(
          nextSuspended ? `Account ${u.name} suspended.` : `Account ${u.name} reactivated.`,
          'success',
        );
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update user account status.', 'error');
    }
  };

  // Donation Moderation Handlers
  const handleModerateDonor = async (donationId: string, currentName: string) => {
    const newName = window.prompt('Enter new moderated display name for this donor:', currentName);
    if (newName === null) return;

    try {
      const res = await adminDonationApi.updateDonation(donationId, {
        moderatedDisplayName: newName.trim() || 'Anonymous Supporter',
        isModerated: true,
      });
      if (res.success) {
        showToast('Donor display name moderated.', 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to moderate donation name', 'error');
    }
  };

  const handleModerateDonorMessage = async (donationId: string, currentMsg: string) => {
    const newMsg = window.prompt(
      'Edit or clear donor support message (leave empty to remove message):',
      currentMsg || '',
    );
    if (newMsg === null) return;

    try {
      const res = await adminDonationApi.updateDonation(donationId, {
        message: newMsg.trim(),
        isModerated: true,
      });
      if (res.success) {
        showToast('Donor message updated.', 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to moderate donor message', 'error');
    }
  };

  // Platform Config Handler
  const handleSavePlatformConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const featuredToolIds = platformConfig.featuredToolIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await adminDonationApi.updatePlatformConfig({
        heroHeadline: platformConfig.heroHeadline.trim(),
        heroDescription: platformConfig.heroDescription.trim(),
        aboutMission: platformConfig.aboutMission.trim(),
        contactEmail: platformConfig.contactEmail.trim(),
        githubUrl: platformConfig.githubUrl.trim(),
        featuredToolIds,
      });
      if (res.success) {
        showToast('Homepage & Platform configuration saved!', 'success');
        fetchAdminData();
      } else {
        showToast(res.error || 'Failed to save configuration.', 'error');
      }
    } catch {
      showToast('Error saving platform configuration.', 'error');
    }
  };

  const handleToggleTool = async (tool: ToolConfig) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/tools/${tool.toolId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isEnabled: !tool.isEnabled,
        }),
      });

      if (res.ok) {
        showToast(`Updated ${tool.name} status.`, 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update tool state', 'error');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    const actionTaken = window.prompt(
      `Enter resolution notes for report (${status}):`,
      'Reviewed by admin',
    );
    if (actionTaken === null) return;
    try {
      const res = await adminDonationApi.resolveReport(reportId, {
        status,
        actionTaken,
      });
      if (res.success) {
        showToast(`Report marked as ${status}.`, 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update report', 'error');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-400 font-mono">
        Loading admin console...
      </div>
    );
  }

  const openReportsCount =
    learningReports.filter((r) => r.status === 'pending').length +
    reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[var(--theme-gray-border)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-yellow)] text-[var(--theme-canvas)] hover:bg-[var(--theme-yellow-hover)] border border-[var(--theme-yellow)] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[var(--theme-canvas)] stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-100">
              Admin Moderation &amp; Governance
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1">
            Manage Learning Hub posts &amp; comments, Community donations &amp; webhooks, user
            accounts, and Homepage configuration.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 text-xs font-bold rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)] shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Inline Telemetry Bar (Consolidated Summary) */}
      <div className="border-y border-[var(--theme-gray-border)] py-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x-2 md:divide-black/15">
        <div>
          <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider block">
            Registered Users
          </span>
          <div className="text-2xl font-black font-mono text-slate-100 mt-1">
            {stats?.totalUsers || users.length}
          </div>
        </div>
        <div className="md:pl-6">
          <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider block">
            Learning Hub Posts
          </span>
          <div className="text-2xl font-black font-mono text-slate-100 mt-1">
            {learningPosts.length}
          </div>
        </div>
        <div className="md:pl-6">
          <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider block">
            Donations Recorded
          </span>
          <div className="text-2xl font-black font-mono text-slate-100 mt-1">{donations.length}</div>
        </div>
        <div className="md:pl-6">
          <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider block">
            Open Reports
          </span>
          <div className="text-2xl font-black font-mono mt-1 text-red-600">{openReportsCount}</div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex border-b border-[var(--theme-gray-border)] overflow-x-auto text-xs font-black uppercase tracking-wider gap-2">
        {[
          {
            id: 'announcements' as AdminTab,
            label: `Announcements / Broadcast (${announcements.length})`,
            icon: Megaphone,
          },
          {
            id: 'maintenance' as AdminTab,
            label: `Maintenance & Locks (${maintenanceForm.global ? 'GLOBAL' : Object.values(maintenanceForm.pages).filter(Boolean).length})`,
            icon: Wrench,
          },
          {
            id: 'learning' as AdminTab,
            label: `Learning Hub (${learningPosts.length})`,
            icon: BookOpen,
          },
          {
            id: 'donations' as AdminTab,
            label: `Community & Donations (${donations.length})`,
            icon: Heart,
          },
          { id: 'users' as AdminTab, label: `Users (${users.length})`, icon: Users },
          { id: 'platform' as AdminTab, label: 'Homepage & Contact', icon: Settings },
          {
            id: 'reports' as AdminTab,
            label: `Reports (${openReportsCount})`,
            icon: Flag,
          },
          {
            id: 'tools' as AdminTab,
            label: `Tool Config (${tools.length})`,
            icon: ShieldCheck,
          },
        ].map((tab) => {
          const IconComp = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 transition-all border-b-4 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                active
                  ? 'border-[var(--theme-yellow)] text-[var(--theme-yellow)] font-bold'
                  : 'border-transparent text-[var(--theme-gray-muted)] hover:text-[var(--theme-silver)]'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 0. Broadcast Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-8">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--theme-surface-raised)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[var(--theme-gray-muted)] block">
                Total Broadcasts
              </span>
              <div className="text-3xl font-bold font-mono mt-1 text-[var(--theme-dirty-white)]">
                {announcements.length}
              </div>
            </div>
            <div className="bg-[var(--theme-surface-raised)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[var(--theme-gray-muted)] block">
                Active Broadcasts
              </span>
              <div className="text-3xl font-bold font-mono mt-1 text-[var(--theme-dirty-white)]">
                {announcements.filter((a) => a.status === 'active').length}
              </div>
            </div>
            <div className="bg-[var(--theme-surface-raised)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[var(--theme-gray-muted)] block">
                Total Views
              </span>
              <div className="text-3xl font-bold font-mono mt-1 text-[var(--theme-dirty-white)]">
                {announcements.reduce((acc, curr) => acc + (curr.viewCount || 0), 0)}
              </div>
            </div>
            <div className="bg-[var(--theme-surface-raised)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[var(--theme-gray-muted)] block">
                User Dismissals
              </span>
              <div className="text-3xl font-bold font-mono mt-1 text-[var(--theme-dirty-white-muted)]">
                {announcements.reduce((acc, curr) => acc + (curr.dismissedCount || 0), 0)}
              </div>
            </div>
          </div>

          {/* Main Grid: Compose Form + Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Compose Card */}
            <div className="lg:col-span-7 bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[var(--theme-gray-border)] pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] font-mono text-xs font-black shadow-sm mb-2 rounded-lg">
                  <Megaphone className="w-3.5 h-3.5 text-slate-100 stroke-[2.5]" />
                  <span>GLOBAL BROADCAST SYSTEM</span>
                </div>
                <h3 className="text-2xl font-black text-slate-100">Compose New Announcement</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  Send a real-time toast notification to every active visitor across all pages on
                  Vexora.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!announcementTitle.trim() || !announcementMessage.trim()) {
                    showToast('Please provide both title and message.', 'error');
                    return;
                  }
                  setShowConfirmModal(true);
                }}
                className="space-y-5"
              >
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase text-slate-100">
                      Announcement Title *
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {announcementTitle.length}/120
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={120}
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="e.g. Scheduled System Upgrade Tonight at 10 PM"
                    className="w-full px-4 py-3 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl font-bold text-sm focus:outline-none focus:bg-[var(--theme-surface-raised)] transition-all shadow-sm"
                  />
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black uppercase text-slate-100">
                      Announcement Message *
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {announcementMessage.length}/1000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={1000}
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    placeholder="Write your announcement details here. It will display inside a non-intrusive toast notification on the side of the screen..."
                    className="w-full px-4 py-3 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl font-medium text-sm focus:outline-none focus:bg-[var(--theme-surface-raised)] transition-all shadow-sm resize-y"
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-100 mb-2">
                    Notification Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(
                      [
                        { id: 'info', label: 'Information', color: 'bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)]', icon: Info },
                        {
                          id: 'success',
                          label: 'Success',
                          color: 'bg-[#4ADE80]',
                          icon: CheckCircle2,
                        },
                        {
                          id: 'warning',
                          label: 'Warning',
                          color: 'bg-[#FACC15]',
                          icon: AlertTriangle,
                        },
                        {
                          id: 'important',
                          label: 'Important',
                          color: 'bg-[#F43F5E] text-white',
                          icon: Megaphone,
                        },
                      ] as const
                    ).map((t) => {
                      const IconComp = t.icon;
                      const selected = announcementType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAnnouncementType(t.id)}
                          className={`p-2.5 rounded-xl border border-[var(--theme-gray-border)] text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            selected
                              ? `${t.color} shadow-sm scale-[1.02]`
                              : 'bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-dirty-white)]'
                          }`}
                        >
                          <IconComp className="w-4 h-4 stroke-[2.5]" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Expiration Dropdown */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-100 mb-1.5">
                    Expiration Duration
                  </label>
                  <select
                    value={announcementExpiry}
                    onChange={(e) => setAnnouncementExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl font-bold text-sm focus:outline-none shadow-sm"
                  >
                    <option value="none">No specific expiry (Stays active for 7 days)</option>
                    <option value="1h">1 Hour (Quick alert)</option>
                    <option value="6h">6 Hours</option>
                    <option value="24h">24 Hours (1 Day)</option>
                    <option value="3d">3 Days</option>
                    <option value="7d">7 Days (Full week)</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="w-full py-3.5 px-6 bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] border border-[var(--theme-yellow)] rounded-2xl font-black text-sm uppercase tracking-wider text-[var(--theme-canvas)] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>Broadcast Announcement to All Users</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Interactive Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/60 p-5 rounded-3xl border border-[var(--theme-gray-border)] shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--theme-gray-border)]">
                  <Eye className="w-4 h-4 text-slate-100 stroke-[2.5]" />
                  <span className="text-xs font-black uppercase text-slate-100">
                    Live Toast Preview (User Screen)
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 mb-4 leading-relaxed">
                  This is exactly how connected users on any page (Tools, Studio, Learning,
                  Dashboard, etc.) will see this toast in the upper-right corner:
                </p>

                {/* Render Simulated Toast Card */}
                <div className="relative w-full overflow-hidden rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] p-4 shadow-sm text-[var(--theme-dirty-white)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border border-[var(--theme-gray-border)] text-[11px] font-mono font-black ${
                          announcementType === 'important'
                            ? 'bg-[#F43F5E] text-white'
                            : announcementType === 'warning'
                              ? 'bg-[#FACC15] text-slate-100'
                              : announcementType === 'success'
                                ? 'bg-[#4ADE80] text-slate-100'
                                : 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]'
                        } shadow-sm shrink-0`}
                      >
                        <Megaphone className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                        <span className="capitalize">{announcementType}</span>
                      </span>

                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        Just now
                      </span>
                    </div>

                    <button
                      type="button"
                      className="p-1 rounded-lg border border-black/40 bg-slate-900/60 text-slate-100 shrink-0 pointer-events-none"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                  <div className="mt-2.5 space-y-1">
                    <h4 className="text-sm font-black text-slate-100 leading-snug break-words">
                      {announcementTitle.trim() || 'Your Announcement Title Here'}
                    </h4>
                    <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                      {announcementMessage.trim() ||
                        'Your announcement message will appear here. Users can read it smoothly and dismiss it, or let it auto-disappear after 9 seconds.'}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>By {user?.name || 'Administrator'}</span>
                    <span className="font-bold text-slate-100 font-sans">Hover to Pause</span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-200">
                    <div
                      className={`h-full w-2/3 ${
                        announcementType === 'important'
                          ? 'bg-[#F43F5E]'
                          : announcementType === 'warning'
                            ? 'bg-[#FACC15]'
                            : announcementType === 'success'
                              ? 'bg-[#4ADE80]'
                              : 'bg-[var(--theme-dirty-white)]'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/15 text-[11px] font-mono font-bold text-slate-400 space-y-1">
                  <div>&bull; Max simultaneous toasts: 2 (queue handles the rest)</div>
                  <div>&bull; Auto-dismiss: 9 seconds (paused on hover)</div>
                  <div>&bull; Zero paid third-party dependencies (Native SSE)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements History & Management Table */}
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-900/60 border-b border-[var(--theme-gray-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-slate-100 stroke-[2.5]" />
                <h3 className="font-black text-sm uppercase text-slate-100">
                  Broadcast History ({announcements.length})
                </h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold">
                <thead className="bg-slate-900/60 border-b border-[var(--theme-gray-border)] text-slate-100 uppercase text-[11px] font-black">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Title & Message</th>
                    <th className="py-3 px-4">Published</th>
                    <th className="py-3 px-4">Stats</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {announcements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                        No announcements broadcasted yet. Compose your first message above!
                      </td>
                    </tr>
                  ) : (
                    announcements.map((ann) => (
                      <tr key={ann._id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3.5 px-4 align-top">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase border border-black ${
                              ann.type === 'important'
                                ? 'bg-[#F43F5E] text-white'
                                : ann.type === 'warning'
                                  ? 'bg-[#FACC15] text-slate-100'
                                  : ann.type === 'success'
                                    ? 'bg-[#4ADE80] text-slate-100'
                                    : 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)]'
                            }`}
                          >
                            {ann.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-top max-w-xs sm:max-w-md">
                          <div className="font-black text-sm text-slate-100">{ann.title}</div>
                          <div className="text-xs text-slate-400 line-clamp-2 mt-0.5 font-medium">
                            {ann.message}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {new Date(ann.publishedAt || ann.createdAt || '').toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 align-top whitespace-nowrap font-mono text-[11px]">
                          <div>Views: {ann.viewCount || 0}</div>
                          <div className="text-slate-400">
                            Dismissed: {ann.dismissedCount || 0}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border border-black ${
                              ann.status === 'active'
                                ? 'bg-[#4ADE80] text-slate-100'
                                : 'bg-neutral-200 text-slate-300'
                            }`}
                          >
                            {ann.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAnnouncementStatus(ann._id, ann.status)}
                            className={`px-2.5 py-1 text-xs font-mono font-black border border-black rounded cursor-pointer ${
                              ann.status === 'active'
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-green-100 hover:bg-green-200 text-green-900'
                            }`}
                          >
                            {ann.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncement(ann._id)}
                            className="p-1 text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50 cursor-pointer inline-flex items-center"
                            title="Delete Announcement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Broadcast Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 sm:p-8 max-w-md w-full shadow-xl space-y-5 animate-in zoom-in-95 duration-200 text-[var(--theme-dirty-white)]">
                <div className="flex items-center gap-3 text-amber-400">
                  <div className="p-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl">
                    <Megaphone className="w-6 h-6 text-[var(--theme-dirty-white)] stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--theme-dirty-white)]">Confirm Broadcast</h3>
                    <p className="text-xs font-semibold text-[var(--theme-gray-muted)]">Send to all online users?</p>
                  </div>
                </div>

                <div className="p-4 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-[var(--theme-gray-muted)]">
                    Preview Title
                  </div>
                  <div className="text-sm font-bold text-[var(--theme-dirty-white)]">{announcementTitle}</div>
                  <div className="text-xs text-[var(--theme-dirty-white-muted)] font-normal line-clamp-3">
                    {announcementMessage}
                  </div>
                </div>

                <p className="text-xs font-normal text-[var(--theme-gray-muted)] leading-relaxed">
                  This will immediately push this notification to all connected sessions and any
                  users who visit while it remains active.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--theme-gray-border)]">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2.5 bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBroadcastSubmit}
                    disabled={isBroadcasting}
                    className="px-5 py-2.5 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold text-[var(--theme-canvas)] cursor-pointer shadow-xs flex items-center gap-2"
                  >
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>{isBroadcasting ? 'Broadcasting...' : 'Yes, Broadcast to All'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Maintenance & Page Locks Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Top Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs ${
                maintenanceForm.global ? 'bg-red-500/10' : 'bg-[var(--theme-surface-raised)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[var(--theme-gray-muted)] block">
                  Global Maintenance
                </span>
                {maintenanceForm.global ? (
                  <AlertTriangle className="w-5 h-5 text-red-400 stroke-[2.5]" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
                )}
              </div>
              <div
                className={`text-xl font-bold font-mono mt-2 ${
                  maintenanceForm.global ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {maintenanceForm.global ? 'ACTIVE (SITE OFFLINE)' : 'INACTIVE (ONLINE)'}
              </div>
              <p className="text-[11px] font-medium text-[var(--theme-gray-muted)] mt-1">
                {maintenanceForm.global
                  ? 'All public routes are currently locked'
                  : 'Site accessible to all visitors'}
              </p>
            </div>

            <div className="bg-[var(--theme-surface-raised)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[var(--theme-gray-muted)] block">
                Workspaces in Maintenance
              </span>
              <div className="text-3xl font-bold font-mono mt-1 text-[var(--theme-dirty-white)]">
                {Object.values(maintenanceForm.pages).filter(Boolean).length} /{' '}
                {PAGE_LOCK_ITEMS.length}
              </div>
              <p className="text-[11px] font-medium text-[var(--theme-gray-muted)] mt-1">
                Individual sections locked
              </p>
            </div>

            <div className="bg-[var(--theme-surface-raised)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[var(--theme-gray-muted)] block">
                Admin Bypass Mode
              </span>
              <div className="text-xl font-bold font-mono mt-2 text-[var(--theme-dirty-white)] flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>ACTIVE</span>
              </div>
              <p className="text-[11px] font-medium text-[var(--theme-gray-muted)] mt-1">
                Admins see floating banner with edit access
              </p>
            </div>

            <div className="bg-[var(--theme-surface-raised)] p-5 rounded-2xl border border-[var(--theme-gray-border)] shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[var(--theme-gray-muted)] block">
                Estimated Completion
              </span>
              <div className="text-lg font-bold font-mono mt-2 text-[var(--theme-dirty-white)] truncate">
                {maintenanceForm.estimatedReturn || 'None specified'}
              </div>
              <p className="text-[11px] font-medium text-[var(--theme-gray-muted)] mt-1">
                Displayed in visitor notice
              </p>
            </div>
          </div>

          {/* Master Global Switch Card */}
          <div
            className={`p-6 rounded-3xl border shadow-sm transition-colors ${
              maintenanceForm.global
                ? 'bg-rose-950/30 border-rose-500/40'
                : 'bg-[var(--theme-surface)] border-[var(--theme-gray-border)]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-silver)] shadow-sm">
                    <Wrench className="w-5 h-5 text-[var(--theme-silver)] stroke-[2.5]" />
                  </span>
                  <h3 className="text-lg font-black text-[var(--theme-silver)] uppercase tracking-tight">
                    Global Platform Maintenance Switch
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[var(--theme-gray-muted)] leading-relaxed">
                  When enabled, <strong>every single page</strong> on VexoraMods is locked with your
                  customized maintenance notice. Visitors cannot interact with any workspaces or
                  tools. Administrators remain able to navigate and test via Admin Bypass.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleGlobalMaintenance}
                  className={`px-6 py-3.5 rounded-2xl border font-bold text-xs sm:text-sm uppercase tracking-wider cursor-pointer shadow-xs active:translate-y-0.5 transition-all flex items-center gap-2.5 ${
                    maintenanceForm.global
                      ? 'bg-rose-600 text-white hover:bg-rose-700 border-rose-500 ring-2 ring-rose-400'
                      : 'bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-[var(--theme-canvas)] border-[var(--theme-yellow)]'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      maintenanceForm.global ? 'bg-white animate-ping' : 'bg-[var(--theme-canvas)]'
                    }`}
                  />
                  <span>
                    {maintenanceForm.global
                      ? 'Global Maintenance ON (Click to Disable)'
                      : 'Enable Global Maintenance Mode'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Notice Configuration & Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Notice Customizer Form */}
            <div className="lg:col-span-7 bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 sm:p-7 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-black text-[var(--theme-silver)] uppercase tracking-tight flex items-center gap-2">
                  <Megaphone className="w-4 h-4 stroke-[2.5]" />
                  <span>Customize Maintenance Notice</span>
                </h3>
                <p className="text-xs text-[var(--theme-gray-muted)] font-medium mt-0.5">
                  This text appears inside the maintenance modal seen by visitors on locked pages.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-black uppercase text-[var(--theme-gray-muted)] mr-1">
                  Presets:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMaintenanceForm((p) => ({
                      ...p,
                      title: 'Scheduled Maintenance',
                      message:
                        'We are currently performing scheduled maintenance and updates. All features will be back online shortly.',
                      estimatedReturn: 'In 30 minutes',
                    }))
                  }
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[11px] font-bold text-[var(--theme-silver)] cursor-pointer"
                >
                  Routine Maintenance
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMaintenanceForm((p) => ({
                      ...p,
                      title: 'Platform System Upgrade',
                      message:
                        'Major platform updates and AI infrastructure enhancements are in progress. Thank you for your patience!',
                      estimatedReturn: '11:00 PM UTC',
                    }))
                  }
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[11px] font-bold text-[var(--theme-silver)] cursor-pointer"
                >
                  System Upgrade
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMaintenanceForm((p) => ({
                      ...p,
                      title: 'Emergency Maintenance',
                      message:
                        'We are currently resolving an unexpected service interruption. Service will resume as quickly as possible.',
                      estimatedReturn: 'Shortly',
                    }))
                  }
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[11px] font-bold text-[var(--theme-silver)] cursor-pointer"
                >
                  Emergency Fix
                </button>
              </div>

              {/* Notice Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-[var(--theme-silver)]">
                  Notice Header Title
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={maintenanceForm.title}
                  onChange={(e) => setMaintenanceForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Scheduled Maintenance"
                  className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold text-[var(--theme-silver)] placeholder:text-[var(--theme-gray-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-yellow)] shadow-sm"
                />
              </div>

              {/* Notice Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-[var(--theme-silver)]">
                  Detailed Notice Message
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={maintenanceForm.message}
                  onChange={(e) => setMaintenanceForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Explain what is happening and when the feature will return..."
                  className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl text-xs font-semibold text-[var(--theme-silver)] placeholder:text-[var(--theme-gray-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-yellow)] shadow-sm"
                />
              </div>

              {/* Estimated Return Time */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-[var(--theme-silver)]">
                  Estimated Completion / Return Time (Optional)
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={maintenanceForm.estimatedReturn || ''}
                  onChange={(e) =>
                    setMaintenanceForm((p) => ({ ...p, estimatedReturn: e.target.value }))
                  }
                  placeholder="e.g. 10:30 PM UTC or In 45 minutes"
                  className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl text-xs font-bold text-[var(--theme-silver)] placeholder:text-[var(--theme-gray-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-yellow)] shadow-sm"
                />
              </div>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="lg:col-span-5 bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[var(--theme-dirty-white)] stroke-[2.5]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-dirty-white)]">
                    Live Visitor Modal Preview
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] px-2 py-0.5 rounded border border-[var(--theme-gray-border)]">
                  Realtime
                </span>
              </div>

              {/* Render Preview Modal Replica */}
              <div className="bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl p-6 text-center space-y-4 shadow-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Under Maintenance</span>
                </div>

                <div className="w-14 h-14 rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] flex items-center justify-center mx-auto shadow-xs text-[var(--theme-dirty-white)]">
                  <Wrench className="w-7 h-7 stroke-[2]" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-[var(--theme-dirty-white)]">
                    {maintenanceForm.title || 'Scheduled Maintenance'}
                  </h4>
                  <p className="text-[11px] font-mono font-medium uppercase text-[var(--theme-gray-muted)]">
                    Workspace: Preview Mode
                  </p>
                  <p className="text-xs font-normal text-[var(--theme-dirty-white-muted)] leading-relaxed">
                    {maintenanceForm.message ||
                      'This section is currently undergoing maintenance and improvements. Please check back shortly.'}
                  </p>
                </div>

                {maintenanceForm.estimatedReturn && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] shadow-xs text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-400 stroke-[2]" />
                    <span>
                      Estimated completion: <strong>{maintenanceForm.estimatedReturn}</strong>
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <div className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-[var(--theme-canvas)] font-bold text-xs shadow-xs">
                    <span>Return to Homepage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Per-Page Toggles Grid */}
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[var(--theme-silver)] uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Individual Workspace & Page Locks</span>
                </h3>
                <p className="text-xs text-[var(--theme-gray-muted)] font-medium mt-0.5">
                  Toggle individual workspaces into maintenance without taking the rest of the site
                  offline.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allLocked: Record<string, boolean> = {};
                    PAGE_LOCK_ITEMS.forEach((item) => {
                      allLocked[item.key] = true;
                    });
                    setMaintenanceForm((p) => ({ ...p, pages: { ...p.pages, ...allLocked } }));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] border border-[var(--theme-yellow)] text-[11px] font-black text-[var(--theme-canvas)] cursor-pointer shadow-sm"
                >
                  Lock All Pages
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allUnlocked: Record<string, boolean> = {};
                    PAGE_LOCK_ITEMS.forEach((item) => {
                      allUnlocked[item.key] = false;
                    });
                    setMaintenanceForm((p) => ({ ...p, pages: { ...p.pages, ...allUnlocked } }));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[11px] font-black text-[var(--theme-silver)] cursor-pointer shadow-sm"
                >
                  Unlock All Pages
                </button>
              </div>
            </div>

            {/* Grid of Workspaces */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PAGE_LOCK_ITEMS.map((item) => {
                const isPageLocked = Boolean(maintenanceForm.pages[item.key]);
                const isUnderGlobal = Boolean(maintenanceForm.global);

                return (
                  <div
                    key={item.key}
                    className={`p-4 rounded-2xl border transition-all shadow-sm flex flex-col justify-between gap-3 ${
                      isUnderGlobal || isPageLocked
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-[var(--theme-surface-raised)] border-[var(--theme-gray-border)]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: item.accentColor }}
                            className="w-3 h-3 rounded-full border border-black/30"
                          />
                          <h4 className="font-bold text-sm text-[var(--theme-silver)]">{item.label}</h4>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            isUnderGlobal
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                              : isPageLocked
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                          }`}
                        >
                          {isUnderGlobal ? 'Global Lock' : isPageLocked ? 'Maintenance' : 'Online'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[var(--theme-gray-muted)] leading-snug">
                        {item.description}
                      </p>
                      <div className="text-[10px] font-mono text-[var(--theme-gray-muted)]/80 pt-1">
                        Paths: {item.paths.join(', ')}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--theme-gray-border)] flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[var(--theme-gray-muted)]">
                        {isPageLocked ? 'Lock active' : 'Accessible to users'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTogglePageMaintenance(item.key)}
                        disabled={isUnderGlobal}
                        className={`px-3 py-1.5 rounded-xl border font-bold text-xs cursor-pointer shadow-sm active:translate-y-0.5 transition-all ${
                          isUnderGlobal
                            ? 'bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] cursor-not-allowed border-[var(--theme-gray-border)] shadow-none'
                            : isPageLocked
                              ? 'bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-raised)] text-[var(--theme-silver)] border-[var(--theme-gray-border)]'
                              : 'bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-[var(--theme-canvas)] border-[var(--theme-yellow)]'
                        }`}
                      >
                        {isPageLocked ? 'Set Online' : 'Put in Maintenance'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Bar (Save & Reset) */}
          <div className="sticky bottom-4 z-30 p-4 bg-[var(--theme-surface)]/95 backdrop-blur-md rounded-2xl border border-[var(--theme-gray-border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-[var(--theme-silver)] stroke-[2.5]" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[var(--theme-silver)]">Ready to apply changes?</p>
                <p className="text-[11px] font-normal text-[var(--theme-gray-muted)]">
                  Settings are saved to the database and sync instantly with all visitor sessions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetMaintenanceDefaults}
                className="px-4 py-2.5 bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-silver)] rounded-xl text-xs font-bold cursor-pointer shadow-xs active:translate-y-0.5 transition-all"
              >
                Reset to Defaults
              </button>

              <button
                type="button"
                onClick={handleSaveMaintenance}
                disabled={isSavingMaintenance}
                className="px-6 py-2.5 bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] border border-[var(--theme-yellow)] rounded-xl text-xs sm:text-sm font-bold text-[var(--theme-canvas)] cursor-pointer shadow-xs active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                {isSavingMaintenance ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Maintenance Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Learning Hub Tab (Posts + Comments) */}
      {activeTab === 'learning' && (
        <div className="space-y-8">
          {/* Learning Posts Table */}
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-900/60 border-b border-[var(--theme-gray-border)] flex items-center justify-between">
              <h3 className="font-black text-sm uppercase text-slate-100">
                Learning Hub Posts ({learningPosts.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold">
                <thead className="bg-slate-900/60 border-b border-[var(--theme-gray-border)] text-slate-100 uppercase text-[11px] font-black">
                  <tr>
                    <th className="py-3 px-4">Post Title</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Engagement</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {learningPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No Learning Hub posts found.
                      </td>
                    </tr>
                  ) : (
                    learningPosts.map((post) => (
                      <tr key={post._id} className="hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-100">{post.title}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            /learning/{post.slug}
                          </div>
                        </td>
                        <td className="py-3 px-4">{post.authorName}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">{post.category}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          Likes: {post.likesCount || 0} · Comments: {post.commentsCount || 0}
                        </td>
                        <td className="py-3 px-4 space-x-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-900 border-green-800'
                                : post.status === 'hidden'
                                  ? 'bg-red-100 text-red-900 border-red-800'
                                  : 'bg-amber-100 text-amber-900 border-amber-800'
                            }`}
                          >
                            {post.status}
                          </span>
                          {post.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-black text-[10px] font-mono">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() =>
                              handleModeratePost(post._id, {
                                isFeatured: !post.isFeatured,
                              })
                            }
                            className="px-2 py-1 bg-slate-900/60 hover:bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] border border-black rounded text-[10px] font-mono font-bold"
                          >
                            {post.isFeatured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() =>
                              handleModeratePost(post._id, {
                                status: post.status === 'hidden' ? 'published' : 'hidden',
                              })
                            }
                            className="px-2 py-1 bg-amber-100 hover:bg-amber-200 border border-black rounded text-[10px] font-mono font-bold"
                          >
                            {post.status === 'hidden' ? 'Unhide' : 'Hide'}
                          </button>
                          <button
                            onClick={() => handleDeleteLearningPost(post._id, post.title)}
                            className="px-2 py-1 bg-red-100 hover:bg-red-200 border border-black rounded text-[10px] font-mono font-bold text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Learning Comments Moderation Table */}
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-900/60 border-b border-[var(--theme-gray-border)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-100" />
              <h3 className="font-black text-sm uppercase text-slate-100">
                Recent Learning Hub Comments ({learningComments.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold">
                <thead className="bg-slate-900/60 border-b border-[var(--theme-gray-border)] text-slate-100 uppercase text-[11px] font-black">
                  <tr>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Comment Content</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {learningComments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No Learning Hub comments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    learningComments.map((c) => (
                      <tr key={c._id} className="hover:bg-neutral-50">
                        <td className="py-3 px-4 font-black text-slate-100">{c.authorName}</td>
                        <td className="py-3 px-4 max-w-md truncate">{c.content}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 border border-black/30 text-[10px] font-mono uppercase">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() =>
                              handleModerateComment(
                                c._id,
                                c.status === 'hidden' ? 'active' : 'hidden',
                              )
                            }
                            className="px-2 py-1 bg-amber-100 border border-black rounded text-[10px] font-mono font-bold"
                          >
                            {c.status === 'hidden' ? 'Restore' : 'Hide'}
                          </button>
                          <button
                            onClick={() => handleModerateComment(c._id, 'deleted')}
                            className="px-2 py-1 bg-red-100 border border-black rounded text-[10px] font-mono font-bold text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Community & Donations Tab (Donations + Webhooks) */}
      {activeTab === 'donations' && (
        <div className="space-y-8">
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-900/60 border-b border-[var(--theme-gray-border)]">
              <h3 className="font-black text-sm uppercase text-slate-100">
                Verified &amp; Pending Donations ({donations.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/60 border-b border-[var(--theme-gray-border)] text-slate-100 uppercase text-[11px] font-black">
                  <tr>
                    <th className="py-3.5 px-4">Tx ID</th>
                    <th className="py-3.5 px-4">Donor &amp; Message</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Provider</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                        No donation transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    donations.map((d) => (
                      <tr key={d._id} className="hover:bg-neutral-50">
                        <td className="py-3 px-4 font-bold text-slate-400 truncate max-w-[120px]">
                          {d.providerTransactionId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-100">
                            {d.moderatedDisplayName || d.displayName}
                          </div>
                          {d.isAnonymous && (
                            <span className="text-[9px] uppercase px-1 rounded bg-neutral-100 text-slate-400 border border-neutral-300">
                              Anonymous
                            </span>
                          )}
                          {d.message && (
                            <div className="text-[10px] text-slate-400 italic">"{d.message}"</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-100 text-sm">
                          ₱{Number(d.amount).toLocaleString()} {d.currency}
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-bold">
                          {d.paymentProvider}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              d.paymentStatus === 'succeeded'
                                ? 'bg-green-100 border-green-800 text-green-900'
                                : d.paymentStatus === 'pending'
                                  ? 'bg-amber-100 border-amber-800 text-amber-900'
                                  : 'bg-red-100 border-red-800 text-red-900'
                            }`}
                          >
                            {d.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() =>
                              handleModerateDonor(d._id, d.moderatedDisplayName || d.displayName)
                            }
                            className="px-2 py-1 bg-slate-900/60 hover:bg-neutral-200 border border-black rounded text-[10px] font-bold"
                          >
                            Moderate Name
                          </button>
                          <button
                            onClick={() => handleModerateDonorMessage(d._id, d.message || '')}
                            className="px-2 py-1 bg-slate-900/60 hover:bg-neutral-200 border border-black rounded text-[10px] font-bold"
                          >
                            Edit Message
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Webhook Audit Log */}
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-900/60 border-b border-[var(--theme-gray-border)] flex items-center gap-2">
              <Webhook className="w-4 h-4 text-slate-100" />
              <h3 className="font-black text-sm uppercase text-slate-100">
                Payment Webhook Events ({webhookEvents.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/60 border-b border-[var(--theme-gray-border)] text-slate-100 uppercase text-[11px] font-black">
                  <tr>
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {webhookEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No payment webhook events logged yet.
                      </td>
                    </tr>
                  ) : (
                    webhookEvents.map((ev: any) => (
                      <tr key={ev._id} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-4 font-bold">{ev.eventId}</td>
                        <td className="py-2.5 px-4">{ev.eventType}</td>
                        <td className="py-2.5 px-4 uppercase">{ev.provider}</td>
                        <td className="py-2.5 px-4">{ev.processingStatus || 'processed'}</td>
                        <td className="py-2.5 px-4 text-slate-400">
                          {new Date(ev.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Users Tab (with Account Suspension) */}
      {activeTab === 'users' && (
        <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-slate-900/60 border-b border-[var(--theme-gray-border)] text-slate-100 uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 font-black text-slate-100">{u.name}</td>
                    <td className="py-3 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-mono font-bold">
                      {u.role}
                    </td>
                    <td className="py-3 px-4">
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-800 text-[10px] font-mono uppercase">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-900 border border-green-800 text-[10px] font-mono uppercase">
                          Active Free
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleSuspendUser(u)}
                          className={`px-2.5 py-1 rounded border border-black text-[10px] font-mono font-black ${
                            u.isSuspended
                              ? 'bg-green-100 text-green-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {u.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Homepage & Platform Config Tab */}
      {activeTab === 'platform' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <form
            onSubmit={handleSavePlatformConfig}
            className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 shadow-xs space-y-4"
          >
            <h3 className="text-lg font-black text-slate-100 border-b border-[var(--theme-gray-border)] pb-2">
              Homepage &amp; Contact Configuration
            </h3>

            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                value={platformConfig.heroHeadline}
                onChange={(e) =>
                  setPlatformConfig({ ...platformConfig, heroHeadline: e.target.value })
                }
                className="w-full p-2.5 text-xs font-bold bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Hero Description
              </label>
              <textarea
                rows={2}
                value={platformConfig.heroDescription}
                onChange={(e) =>
                  setPlatformConfig({
                    ...platformConfig,
                    heroDescription: e.target.value,
                  })
                }
                className="w-full p-2.5 text-xs font-medium bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Contact Email (Leave blank if not configured)
              </label>
              <input
                type="email"
                value={platformConfig.contactEmail}
                onChange={(e) =>
                  setPlatformConfig({ ...platformConfig, contactEmail: e.target.value })
                }
                placeholder="Optional public contact email"
                className="w-full p-2.5 text-xs font-bold bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={platformConfig.githubUrl}
                onChange={(e) =>
                  setPlatformConfig({ ...platformConfig, githubUrl: e.target.value })
                }
                placeholder="https://github.com/..."
                className="w-full p-2.5 text-xs font-bold bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase mb-1">
                Featured Tool IDs (Comma-separated)
              </label>
              <input
                type="text"
                value={platformConfig.featuredToolIds}
                onChange={(e) =>
                  setPlatformConfig({
                    ...platformConfig,
                    featuredToolIds: e.target.value,
                  })
                }
                placeholder="smart-image-studio, ai-image-enhancer, pdf-merger"
                className="w-full p-2.5 text-xs font-mono bg-slate-900/60 border border-[var(--theme-gray-border)] rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[var(--theme-yellow)] text-[var(--theme-canvas)] hover:bg-[var(--theme-yellow-hover)] border border-[var(--theme-yellow)] text-xs font-black uppercase shadow-sm cursor-pointer"
            >
              Save Platform Configuration
            </button>
          </form>

          {/* Submitted Contact Inquiries */}
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-100 border-b border-[var(--theme-gray-border)] pb-2">
              Submitted Contact Inquiries ({contactInquiries.length})
            </h3>
            {contactInquiries.length === 0 ? (
              <p className="text-xs font-semibold text-slate-400 py-8 text-center">
                No contact inquiries received yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {contactInquiries.map((inq: any) => (
                  <div
                    key={inq._id}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-[var(--theme-gray-border)] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-100">{inq.subject}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      From: {inq.name} ({inq.email})
                    </div>
                    <p className="text-xs font-medium text-neutral-800 pt-1">{inq.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Reports Tab (Combined Learning Hub + Legacy Reports) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-900/60 border-b border-[var(--theme-gray-border)]">
              <h3 className="font-black text-sm uppercase text-slate-100">
                Learning Hub Moderation Reports ({learningReports.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold">
                <thead className="bg-slate-900/60 border-b border-[var(--theme-gray-border)] text-slate-100 uppercase text-[11px] font-black">
                  <tr>
                    <th className="py-3.5 px-4">Target</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4">Details</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {learningReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No Learning Hub reports pending.
                      </td>
                    </tr>
                  ) : (
                    learningReports.map((rep) => (
                      <tr key={rep._id} className="hover:bg-neutral-50">
                        <td className="py-3 px-4 font-mono uppercase">{rep.targetType}</td>
                        <td className="py-3 px-4 text-red-700">{rep.reason}</td>
                        <td className="py-3 px-4">{rep.description || '—'}</td>
                        <td className="py-3 px-4 uppercase font-mono text-[10px]">{rep.status}</td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          {rep.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleResolveLearningReport(rep._id, 'resolved')}
                                className="px-2 py-1 bg-green-100 border border-black rounded text-[10px] font-mono font-bold"
                              >
                                Resolve
                              </button>
                              <button
                                onClick={() => handleResolveLearningReport(rep._id, 'dismissed')}
                                className="px-2 py-1 bg-neutral-100 border border-black rounded text-[10px] font-mono font-bold"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {reports.length > 0 && (
            <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-900/60 border-b border-[var(--theme-gray-border)]">
                <h3 className="font-black text-sm uppercase text-slate-100">
                  Legacy Community Reports ({reports.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-bold">
                  <tbody className="divide-y-2 divide-black/10">
                    {reports.map((rep) => (
                      <tr key={rep._id}>
                        <td className="py-3 px-4">{rep.targetType}</td>
                        <td className="py-3 px-4">{rep.reason}</td>
                        <td className="py-3 px-4">{rep.status}</td>
                        <td className="py-3 px-4 text-right">
                          {rep.status === 'pending' && (
                            <button
                              onClick={() => handleResolveReport(rep._id, 'resolved')}
                              className="px-2 py-1 bg-green-100 border border-black rounded text-[10px]"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Tools Tab */}
      {activeTab === 'tools' && (
        <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-slate-900/60 border-b border-[var(--theme-gray-border)] text-slate-100 uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Tool Name</th>
                  <th className="py-3.5 px-4">Tool ID</th>
                  <th className="py-3.5 px-4">Usage Fee</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {tools.map((t) => (
                  <tr key={t.toolId} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 font-black text-slate-100">{t.name}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{t.toolId}</td>
                    <td className="py-3 px-4 font-mono font-black text-green-700">100% Free</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border border-black ${
                          t.isEnabled
                            ? 'bg-[#4ADE80] text-slate-100'
                            : 'bg-neutral-200 text-slate-400'
                        }`}
                      >
                        {t.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleTool(t)}
                        className="text-xs font-black text-slate-100 underline hover:text-slate-300 cursor-pointer"
                      >
                        {t.isEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
