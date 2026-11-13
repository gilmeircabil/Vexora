import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { useMaintenance } from '../context/MaintenanceContext.js';
import { PAGE_LOCK_ITEMS, type MaintenanceConfigData } from '../config/pageLocks.js';
import { adminDonationApi } from '../services/adminDonationApi.js';
import { announcementApi, type BroadcastAnnouncement } from '../services/announcementApi.js';
import {
  supportChatApi,
  type SupportChatThread,
  type SupportThreadStatus,
} from '../services/supportChatApi.js';

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
  | 'support-chat'
  | 'announcements'
  | 'maintenance'
  | 'users'
  | 'learning'
  | 'donations'
  | 'reports'
  | 'platform'
  | 'tools';

export const AdminDashboardPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { maintenance, saveMaintenanceConfig, refresh: refreshMaintenance } = useMaintenance();

  const [activeTab, setActiveTab] = useState<AdminTab>('support-chat');
  const [isLoading, setIsLoading] = useState(false);

  // Core Admin Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [toolSearch, setToolSearch] = useState('');

  // Support Chat Data
  const [supportThreads, setSupportThreads] = useState<SupportChatThread[]>([]);
  const [activeSupportThreadId, setActiveSupportThreadId] = useState<string | null>(null);
  const [supportReplyInput, setSupportReplyInput] = useState('');
  const [isSendingSupportReply, setIsSendingSupportReply] = useState(false);

  // Broadcast Announcements Data
  const [announcements, setAnnouncements] = useState<BroadcastAnnouncement[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<
    'info' | 'success' | 'warning' | 'important'
  >('info');
  const [announcementExpiry, setAnnouncementExpiry] = useState<string>('none');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Maintenance Data
  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceConfigData>(maintenance);
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  // Learning, Donations, Reports, Platform Config Data
  const [learningPosts, setLearningPosts] = useState<any[]>([]);
  const [learningComments, setLearningComments] = useState<any[]>([]);
  const [learningReports, setLearningReports] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [platformConfig, setPlatformConfig] = useState({
    heroHeadline: 'Everything You Need. One Platform.',
    heroDescription:
      'Discover free online tools, explore AI-powered utilities, create designs, and learn with a growing community.',
    aboutMission: '',
    contactEmail: '',
    githubUrl: '',
    featuredToolIds: '',
  });

  useEffect(() => {
    if (maintenance) {
      setMaintenanceForm(maintenance);
    }
  }, [maintenance]);

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [
        usageRes,
        usersRes,
        toolsRes,
        donRes,
        repRes,
        lpRes,
        lcRes,
        lrRes,
        cfgRes,
        annRes,
      ] = await Promise.all([
        fetch('/api/admin/usage', { headers: { Authorization: `Bearer ${token}` } }).catch(
          () => null,
        ),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }).catch(
          () => null,
        ),
        fetch('/api/admin/tools', { headers: { Authorization: `Bearer ${token}` } }).catch(
          () => null,
        ),
        adminDonationApi.getDonations().catch(() => ({ success: false, data: {} })),
        adminDonationApi.getReports().catch(() => ({ success: false, data: {} })),
        adminDonationApi.getLearningPosts().catch(() => ({ success: false, data: {} })),
        adminDonationApi.getLearningComments().catch(() => ({ success: false, data: {} })),
        adminDonationApi.getLearningReports().catch(() => ({ success: false, data: {} })),
        adminDonationApi.getPlatformConfig().catch(() => ({ success: false, data: {} })),
        announcementApi
          .getAll()
          .catch(() => ({ success: false, data: { announcements: [], connectedLiveClients: 0 } })),
      ]);

      if (usageRes?.ok) {
        const u = await usageRes.json();
        if (u?.success && u.data?.stats) setStats(u.data.stats);
      }

      if (usersRes?.ok) {
        const usr = await usersRes.json();
        if (usr?.success && Array.isArray(usr.data?.users)) setUsers(usr.data.users);
      }

      if (toolsRes?.ok) {
        const tl = await toolsRes.json();
        if (tl?.success && Array.isArray(tl.data?.tools)) setTools(tl.data.tools);
      }

      if (donRes?.success && donRes.data) {
        setDonations(donRes.data.donations || []);
      }

      if (repRes?.success && repRes.data) {
        setReports(repRes.data.reports || []);
      }

      if (lpRes?.success && lpRes.data) {
        setLearningPosts(lpRes.data.items || lpRes.data.posts || []);
      }

      if (lcRes?.success && lcRes.data) {
        setLearningComments(lcRes.data.items || lcRes.data.comments || []);
      }

      if (lrRes?.success && lrRes.data) {
        setLearningReports(lrRes.data.items || lrRes.data.reports || []);
      }

      if (annRes?.success && annRes.data) {
        setAnnouncements(annRes.data.announcements || []);
      }

      let remoteInquiries: any[] = [];
      if (cfgRes?.success && cfgRes.data) {
        const cfg = cfgRes.data.config || cfgRes.data;
        remoteInquiries = cfgRes.data.inquiries || [];
        setPlatformConfig({
          heroHeadline: cfg.heroHeadline || 'Everything You Need. One Platform.',
          heroDescription:
            cfg.heroDescription ||
            'Discover free online tools, explore AI-powered utilities, create designs, and learn with a growing community.',
          aboutMission: cfg.aboutMission || '',
          contactEmail: cfg.contactEmail || '',
          githubUrl: cfg.githubUrl || '',
          featuredToolIds: Array.isArray(cfg.featuredToolIds)
            ? cfg.featuredToolIds.join(', ')
            : '',
        });
      }

      const mergedThreads = await supportChatApi.getAllThreadsForAdmin(remoteInquiries);
      setSupportThreads(mergedThreads);
      setActiveSupportThreadId((prev) => prev || mergedThreads[0]?._id || null);
    } catch {
      showToast('Failed to fetch administrative data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [token, user?.role, fetchAdminData]);

  // 1. Support Chat Handlers
  const activeSupportThread =
    supportThreads.find((t) => t._id === activeSupportThreadId) || supportThreads[0] || null;

  const handleSendSupportReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupportThread || !supportReplyInput.trim()) return;
    setIsSendingSupportReply(true);
    try {
      const updated = await supportChatApi.sendAdminReply(
        activeSupportThread._id,
        supportReplyInput.trim(),
        user?.name || 'VexoraMods Admin',
      );
      if (updated) {
        setSupportThreads((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        setSupportReplyInput('');
        showToast('Reply sent to user.', 'success');
      }
    } catch {
      showToast('Failed to send reply.', 'error');
    } finally {
      setIsSendingSupportReply(false);
    }
  };

  const handleUpdateSupportStatus = async (threadId: string, status: SupportThreadStatus) => {
    try {
      const updated = await supportChatApi.updateThreadStatus(threadId, status);
      if (updated) {
        setSupportThreads((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        showToast(`Thread marked as ${status}.`, 'info');
      }
    } catch {
      showToast('Failed to update thread status.', 'error');
    }
  };

  const handleDeleteSupportMessage = async (threadId: string, messageId: string) => {
    try {
      const updated = await supportChatApi.deleteMessage(threadId, messageId);
      if (updated) {
        setSupportThreads((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        showToast('Message deleted.', 'info');
      }
    } catch {
      showToast('Failed to delete message.', 'error');
    }
  };

  // 2. Broadcast Announcement Handlers
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
        showToast('Announcement broadcasted to all users!', 'success');
        setAnnouncements((prev) => [res.data, ...prev]);
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        setAnnouncementType('info');
        setAnnouncementExpiry('none');
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

  // 3. Maintenance Handlers
  const handleSaveMaintenance = async (override?: Partial<MaintenanceConfigData>) => {
    const nextForm = override ? { ...maintenanceForm, ...override } : maintenanceForm;
    setMaintenanceForm(nextForm);
    setIsSavingMaintenance(true);
    try {
      const res = await saveMaintenanceConfig(nextForm);
      if (res.success) {
        showToast('Maintenance settings saved!', 'success');
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

  const handleTogglePageMaintenance = (pageKey: string) => {
    const nextPages = {
      ...maintenanceForm.pages,
      [pageKey]: !maintenanceForm.pages[pageKey],
    };
    setMaintenanceForm((prev) => ({ ...prev, pages: nextPages }));
  };

  // 4. User Handlers
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

  // 5. Learning Hub Moderation Handlers
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

  // 6. Donation Moderation Handlers
  const handleModerateDonor = async (donationId: string, currentName: string) => {
    const newName = window.prompt('Enter moderated display name for this donor:', currentName);
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
    const newMsg = window.prompt('Edit or clear donor support message:', currentMsg || '');
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

  // 7. Reports Handlers
  const handleResolveLearningReport = async (
    reportId: string,
    status: 'resolved' | 'dismissed',
  ) => {
    try {
      const res = await adminDonationApi.resolveLearningReport(reportId, {
        status,
        actionTaken: 'Reviewed by moderator',
      });
      if (res.success) {
        showToast(`Learning report marked as ${status}.`, 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to resolve report.', 'error');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      const res = await adminDonationApi.resolveReport(reportId, {
        status,
        actionTaken: 'Reviewed by admin',
      });
      if (res.success) {
        showToast(`Report marked as ${status}.`, 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update report', 'error');
    }
  };

  // 8. Platform Config Handler
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
        showToast('Platform configuration saved!', 'success');
        fetchAdminData();
      } else {
        showToast(res.error || 'Failed to save configuration.', 'error');
      }
    } catch {
      showToast('Error saving platform configuration.', 'error');
    }
  };

  // 9. Tools Handler
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

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-slate-400">
        Loading admin console...
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const unreadSupportCount = supportThreads.filter((t) => t.status === 'unread').length;
  const activeBroadcastCount = announcements.filter((a) => a.status === 'active').length;
  const lockedPagesCount = Object.values(maintenanceForm.pages || {}).filter(Boolean).length;
  const pendingReportsCount =
    learningReports.filter((r: any) => r.status === 'pending').length +
    reports.filter((r: any) => r.status === 'pending').length;

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    {
      id: 'support-chat',
      label: 'Support Chat',
      count: unreadSupportCount || supportThreads.length,
    },
    { id: 'announcements', label: 'Broadcast', count: activeBroadcastCount },
    { id: 'maintenance', label: 'Maintenance', count: lockedPagesCount },
    { id: 'users', label: 'Users', count: stats?.totalUsers ?? users.length },
    { id: 'learning', label: 'Learning', count: learningPosts.length },
    { id: 'donations', label: 'Donations', count: donations.length },
    { id: 'reports', label: 'Reports', count: pendingReportsCount },
    { id: 'platform', label: 'Platform' },
    { id: 'tools', label: 'Tools', count: tools.length },
  ];

  const filteredUsers = users.filter(
    (u) =>
      !userSearch.trim() ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const filteredTools = tools.filter(
    (t) =>
      !toolSearch.trim() ||
      t.name?.toLowerCase().includes(toolSearch.toLowerCase()) ||
      t.toolId?.toLowerCase().includes(toolSearch.toLowerCase()),
  );

  return (
    <div
      data-testid="admin-console-minimal"
      className="max-w-6xl mx-auto px-4 py-6 text-slate-100 space-y-4"
    >
      {/* Minimal Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-white">Admin Console</h1>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              maintenanceForm.global
                ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {maintenanceForm.global ? 'Maintenance ON' : 'Online'}
          </span>
          {stats && (
            <span className="text-xs text-slate-400 hidden sm:inline">
              {stats.totalUsers} users • {stats.totalAIJobs} AI jobs
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          {isLoading ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* Compact Tab Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900/60 border border-slate-800/80 p-1.5 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 1. Support Chat */}
      {activeTab === 'support-chat' && (
        <div
          data-testid="admin-support-chat-inbox"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4"
        >
          <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden flex flex-col max-h-[520px]">
            <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-white">
              <span>Threads ({supportThreads.length})</span>
              {unreadSupportCount > 0 && (
                <span className="text-[10px] text-amber-300">{unreadSupportCount} unread</span>
              )}
            </div>
            <div className="divide-y divide-slate-800/60 overflow-y-auto flex-1">
              {supportThreads.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No support chats yet.</div>
              ) : (
                supportThreads.map((t) => {
                  const lastMsg = t.messages[t.messages.length - 1];
                  const isSelected = activeSupportThread?._id === t._id;
                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => setActiveSupportThreadId(t._id)}
                      className={`w-full text-left px-3.5 py-2.5 transition-colors cursor-pointer ${
                        isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate">{t.name}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : t.message}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px]">
            {!activeSupportThread ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Select a conversation to reply.
              </div>
            ) : (
              <>
                <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/60">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white">{activeSupportThread.name}</span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {activeSupportThread.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateSupportStatus(
                        activeSupportThread._id,
                        activeSupportThread.status === 'resolved' ? 'read' : 'resolved',
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    {activeSupportThread.status === 'resolved' ? 'Reopen' : 'Resolve'}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                  {activeSupportThread.messages.map((msg) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={msg._id}
                        className={`group flex items-center gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSupportMessage(activeSupportThread._id, msg._id)}
                            aria-label="Delete message"
                            title="Delete message"
                            className="opacity-60 hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                              isAdmin
                                ? 'bg-amber-500 text-slate-950 font-medium'
                                : 'bg-slate-800/90 text-slate-100 border border-slate-700/70'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-slate-500 mt-0.5 px-1">
                            {msg.senderName}
                          </span>
                        </div>
                        {!isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSupportMessage(activeSupportThread._id, msg._id)}
                            aria-label="Delete message"
                            title="Delete message"
                            className="opacity-60 hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <form
                  onSubmit={handleSendSupportReply}
                  className="p-3 border-t border-slate-800 bg-slate-950/70 flex gap-2"
                >
                  <input
                    type="text"
                    value={supportReplyInput}
                    onChange={(e) => setSupportReplyInput(e.target.value)}
                    placeholder={`Reply to ${activeSupportThread.name}...`}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    type="submit"
                    disabled={isSendingSupportReply || !supportReplyInput.trim()}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    {isSendingSupportReply ? 'Sending...' : 'Reply'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Broadcast Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <form
            onSubmit={handleBroadcastSubmit}
            className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              New Broadcast
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="text"
                required
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Announcement Title"
                className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
              <select
                value={announcementType}
                onChange={(e) =>
                  setAnnouncementType(
                    e.target.value as 'info' | 'success' | 'warning' | 'important',
                  )
                }
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="important">Important</option>
              </select>
              <select
                value={announcementExpiry}
                onChange={(e) => setAnnouncementExpiry(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="none">No Expiry</option>
                <option value="1h">1 Hour</option>
                <option value="6h">6 Hours</option>
                <option value="24h">24 Hours</option>
                <option value="3d">3 Days</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
            <textarea
              rows={2}
              required
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              placeholder="Broadcast message..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  isBroadcasting || !announcementTitle.trim() || !announcementMessage.trim()
                }
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer"
              >
                {isBroadcasting ? 'Sending...' : 'Broadcast Now'}
              </button>
            </div>
          </form>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl divide-y divide-slate-800">
            {announcements.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No broadcasts yet.</div>
            ) : (
              announcements.map((a) => (
                <div
                  key={a._id}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{a.title}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {a.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          a.status === 'active' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{a.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleAnnouncementStatus(a._id, a.status)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                    >
                      {a.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(a._id)}
                      className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-xs text-red-300 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Maintenance & Page Locks */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  Global Maintenance Lock
                </h2>
                <p className="text-[11px] text-slate-400">
                  Lock all public pages for non-admin visitors.
                </p>
              </div>
              <button
                type="button"
                disabled={isSavingMaintenance}
                onClick={() => handleSaveMaintenance({ global: !maintenanceForm.global })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  maintenanceForm.global
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-red-500 text-white'
                }`}
              >
                {maintenanceForm.global ? 'Disable Maintenance' : 'Enable Maintenance'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <input
                type="text"
                value={maintenanceForm.title}
                onChange={(e) =>
                  setMaintenanceForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Maintenance Title"
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                value={maintenanceForm.estimatedReturn || ''}
                onChange={(e) =>
                  setMaintenanceForm((prev) => ({ ...prev, estimatedReturn: e.target.value }))
                }
                placeholder="Expected return (optional)"
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <textarea
              rows={2}
              value={maintenanceForm.message}
              onChange={(e) =>
                setMaintenanceForm((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Maintenance notice message..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isSavingMaintenance}
                onClick={() => handleSaveMaintenance()}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                {isSavingMaintenance ? 'Saving...' : 'Save Maintenance Settings'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Individual Page Locks ({lockedPagesCount})
              </h3>
              {lockedPagesCount > 0 && (
                <button
                  type="button"
                  onClick={() => handleSaveMaintenance({ pages: {} })}
                  className="text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  Unlock All
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {PAGE_LOCK_ITEMS.map((item) => {
                const isLocked = Boolean(maintenanceForm.pages?.[item.key]);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTogglePageMaintenance(item.key)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isLocked
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-medium truncate">{item.label}</span>
                    <span className="text-[10px] font-bold uppercase">
                      {isLocked ? 'Locked' : 'Open'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Users */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-64"
            />
            <span className="text-xs text-slate-400">{filteredUsers.length} users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-950/40">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-2.5 px-3 uppercase font-bold text-slate-300">{u.role}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            u.isSuspended
                              ? 'bg-red-500/15 text-red-300'
                              : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                        >
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleToggleSuspendUser(u)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 cursor-pointer"
                          >
                            {u.isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Learning Hub */}
      {activeTab === 'learning' && (
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl divide-y divide-slate-800">
            <div className="px-4 py-2.5 text-xs font-bold text-white">
              Learning Posts ({learningPosts.length})
            </div>
            {learningPosts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No learning posts found.
              </div>
            ) : (
              learningPosts.map((post: any) => (
                <div
                  key={post._id}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{post.title}</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {post.status || 'published'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      By {post.authorName} • {post.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleModeratePost(post._id, { isFeatured: !post.isFeatured })
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs cursor-pointer"
                    >
                      {post.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleModeratePost(post._id, {
                          status: post.status === 'hidden' ? 'published' : 'hidden',
                        })
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 text-amber-300 text-xs cursor-pointer"
                    >
                      {post.status === 'hidden' ? 'Publish' : 'Hide'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLearningPost(post._id, post.title)}
                      className="px-2.5 py-1 rounded bg-red-500/15 text-red-300 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {learningComments.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl divide-y divide-slate-800">
              <div className="px-4 py-2.5 text-xs font-bold text-white">
                Recent Comments ({learningComments.length})
              </div>
              {learningComments.slice(0, 15).map((c: any) => (
                <div
                  key={c._id}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white">{c.authorName}</span>
                    <p className="text-xs text-slate-400 truncate">{c.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleModerateComment(
                          c._id,
                          c.status === 'hidden' ? 'active' : 'hidden',
                        )
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs cursor-pointer"
                    >
                      {c.status === 'hidden' ? 'Restore' : 'Hide'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerateComment(c._id, 'deleted')}
                      className="px-2.5 py-1 rounded bg-red-500/15 text-red-300 text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Donations */}
      {activeTab === 'donations' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {donations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No donations recorded.</div>
          ) : (
            donations.map((d: any) => (
              <div
                key={d._id}
                className="p-3.5 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-white">
                    {d.moderatedDisplayName || d.displayName || 'Anonymous'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 ml-2">
                    ${Number(d.amount || 0).toFixed(2)} {d.currency || 'USD'}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-2">
                    ({d.paymentMethod || 'online'} • {d.status})
                  </span>
                  {d.message && <p className="text-xs text-slate-400 mt-0.5">"{d.message}"</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleModerateDonor(
                        d._id,
                        d.moderatedDisplayName || d.displayName || 'Anonymous',
                      )
                    }
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs cursor-pointer"
                  >
                    Edit Name
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerateDonorMessage(d._id, d.message || '')}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs cursor-pointer"
                  >
                    Edit Message
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 7. Reports */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {learningReports.length === 0 && reports.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No moderation reports.</div>
          ) : (
            <>
              {learningReports.map((r: any) => (
                <div
                  key={r._id}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {r.category || r.targetType}
                      </span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {r.details || r.reason} (by {r.reporterName || 'User'})
                    </p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleResolveLearningReport(r._id, 'resolved')}
                        className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 text-xs cursor-pointer"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveLearningReport(r._id, 'dismissed')}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {reports.map((r: any) => (
                <div
                  key={r._id}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {r.reason || r.targetType}
                      </span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{r.details}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleResolveReport(r._id, 'resolved')}
                        className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 text-xs cursor-pointer"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveReport(r._id, 'dismissed')}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* 8. Platform Config */}
      {activeTab === 'platform' && (
        <form
          onSubmit={handleSavePlatformConfig}
          className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Homepage & Platform Config
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={platformConfig.heroHeadline}
              onChange={(e) =>
                setPlatformConfig({ ...platformConfig, heroHeadline: e.target.value })
              }
              placeholder="Hero Headline"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="email"
              value={platformConfig.contactEmail}
              onChange={(e) =>
                setPlatformConfig({ ...platformConfig, contactEmail: e.target.value })
              }
              placeholder="Support Contact Email"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="url"
              value={platformConfig.githubUrl}
              onChange={(e) =>
                setPlatformConfig({ ...platformConfig, githubUrl: e.target.value })
              }
              placeholder="GitHub URL"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              value={platformConfig.featuredToolIds}
              onChange={(e) =>
                setPlatformConfig({ ...platformConfig, featuredToolIds: e.target.value })
              }
              placeholder="Featured Tool Slugs (comma-separated)"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>
          <textarea
            rows={2}
            value={platformConfig.heroDescription}
            onChange={(e) =>
              setPlatformConfig({ ...platformConfig, heroDescription: e.target.value })
            }
            placeholder="Hero Description"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Save Config
            </button>
          </div>
        </form>
      )}

      {/* 9. Tools */}
      {activeTab === 'tools' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Filter tools..."
              value={toolSearch}
              onChange={(e) => setToolSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-64"
            />
            <span className="text-xs text-slate-400">{filteredTools.length} tools</span>
          </div>
          {filteredTools.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No tools found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredTools.map((tool) => (
                <div
                  key={tool.toolId}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/50 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{tool.name}</div>
                    <div className="text-[10px] text-slate-500">{tool.toolId}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleTool(tool)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                      tool.isEnabled
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-red-500/15 text-red-300'
                    }`}
                  >
                    {tool.isEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
