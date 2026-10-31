import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ShieldCheck,
  Users,
  Heart,
  Code2,
  FolderGit2,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Star,
  Flag,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { adminDonationApi } from '../services/adminDonationApi.js';

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
  createdAt: string;
}

interface ToolConfig {
  toolId: string;
  name: string;
  creditCost?: number;
  minPlan?: string;
  isEnabled: boolean;
}

type AdminTab = 'users' | 'donations' | 'developers' | 'projects' | 'reports' | 'tools' | 'failedJobs';

export const AdminDashboardPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [failedJobs, setFailedJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('donations');
  const [isLoading, setIsLoading] = useState(true);

  // Donations data
  const [donations, setDonations] = useState<any[]>([]);
  const [donationStats, setDonationStats] = useState<any[]>([]);

  // Developers data
  const [developers, setDevelopers] = useState<any[]>([]);

  // Projects data
  const [projects, setProjects] = useState<any[]>([]);

  // Reports data
  const [reports, setReports] = useState<any[]>([]);

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
      const [usageRes, usersRes, toolsRes, donRes, devRes, projRes, repRes] = await Promise.all([
        fetch('/api/admin/usage', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/tools', { headers: { Authorization: `Bearer ${token}` } }),
        adminDonationApi.getDonations(),
        adminDonationApi.getDevelopers(),
        adminDonationApi.getProjects(),
        adminDonationApi.getReports(),
      ]);

      if (usageRes.ok) {
        const u = await usageRes.json();
        if (u.success) {
          setStats(u.data.stats);
          setFailedJobs(u.data.recentFailedJobs || []);
        }
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
        setDonationStats(donRes.data.stats || []);
      }

      if (devRes.success) {
        setDevelopers(devRes.data.developers || []);
      }

      if (projRes.success) {
        setProjects(projRes.data.projects || []);
      }

      if (repRes.success) {
        setReports(repRes.data.reports || []);
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

  const handleToggleFeatureDev = async (dev: any) => {
    try {
      const res = await adminDonationApi.updateDeveloper(dev._id, {
        isFeatured: !dev.isFeatured,
      });
      if (res.success) {
        showToast(`Developer ${dev.displayName} ${dev.isFeatured ? 'unfeatured' : 'featured'}.`, 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Error updating featured status', 'error');
    }
  };

  const handleToggleSuspendDev = async (dev: any) => {
    const reason = dev.isSuspended
      ? undefined
      : window.prompt('Provide reason for developer profile suspension:', 'Terms of service violation');

    if (!dev.isSuspended && reason === null) return;

    try {
      const res = await adminDonationApi.updateDeveloper(dev._id, {
        isSuspended: !dev.isSuspended,
        suspensionReason: reason,
      });
      if (res.success) {
        showToast(`Developer profile ${dev.isSuspended ? 'reactivated' : 'suspended'}.`, 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Error toggling suspension', 'error');
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove project "${title}"?`)) return;

    try {
      const res = await adminDonationApi.deleteProject(id);
      if (res.success) {
        showToast('Project removed.', 'success');
        fetchAdminData();
      }
    } catch {
      showToast('Error deleting project', 'error');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    const actionTaken = window.prompt(`Enter resolution notes for report (${status}):`, 'Reviewed by admin');
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-neutral-500 font-mono">
        Loading admin console...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-black/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FACC15] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black">
              Admin Moderation & Governance
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-neutral-600 mt-1">
            Voluntary donations audit, developer community moderation, project showcase, and system health.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 text-xs font-black rounded-xl border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
          <span className="text-[11px] text-neutral-600 font-black uppercase tracking-wider block">Registered Users</span>
          <div className="text-2xl font-black font-mono text-black mt-1">
            {stats?.totalUsers || users.length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
          <span className="text-[11px] text-neutral-600 font-black uppercase tracking-wider block">Donations Recorded</span>
          <div className="text-2xl font-black font-mono text-black mt-1">
            {donations.length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
          <span className="text-[11px] text-neutral-600 font-black uppercase tracking-wider block">Developer Profiles</span>
          <div className="text-2xl font-black font-mono text-black mt-1">
            {developers.length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
          <span className="text-[11px] text-neutral-600 font-black uppercase tracking-wider block">Open Reports</span>
          <div className="text-2xl font-black font-mono text-black mt-1 text-red-600">
            {reports.filter((r) => r.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex border-b-2 border-black overflow-x-auto text-xs font-black uppercase tracking-wider gap-2">
        {[
          { id: 'donations' as AdminTab, label: `Donations (${donations.length})`, icon: Heart },
          { id: 'developers' as AdminTab, label: `Developers (${developers.length})`, icon: Code2 },
          { id: 'projects' as AdminTab, label: `Projects (${projects.length})`, icon: FolderGit2 },
          { id: 'reports' as AdminTab, label: `Reports (${reports.length})`, icon: Flag },
          { id: 'users' as AdminTab, label: `Users (${users.length})`, icon: Users },
          { id: 'tools' as AdminTab, label: `Tool Config (${tools.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const IconComp = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 transition-all border-b-4 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                active
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-500 hover:text-black'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}

      {/* 1. Donations Tab */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Tx ID</th>
                  <th className="py-3.5 px-4">Donor Name</th>
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
                    <td colSpan={7} className="py-8 text-center text-neutral-500 font-bold">
                      No donation transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d._id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 font-bold text-neutral-600 truncate max-w-[120px]">
                        {d.providerTransactionId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-black text-black">
                          {d.moderatedDisplayName || d.displayName}
                        </div>
                        {d.isAnonymous && (
                          <span className="text-[9px] uppercase px-1 rounded bg-neutral-100 text-neutral-500 border border-neutral-300">
                            Anonymous
                          </span>
                        )}
                        {d.message && <div className="text-[10px] text-neutral-600 italic">"{d.message}"</div>}
                      </td>
                      <td className="py-3 px-4 font-black text-black text-sm">
                        ₱{Number(d.amount).toLocaleString()} {d.currency}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-bold">
                        {d.paymentProvider}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          d.paymentStatus === 'succeeded'
                            ? 'bg-green-100 border-green-800 text-green-900'
                            : d.paymentStatus === 'pending'
                            ? 'bg-amber-100 border-amber-800 text-amber-900'
                            : 'bg-red-100 border-red-800 text-red-900'
                        }`}>
                          {d.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleModerateDonor(d._id, d.moderatedDisplayName || d.displayName)}
                          className="px-2 py-1 bg-[#FAF7F2] hover:bg-neutral-200 border border-black rounded text-[10px] font-bold"
                        >
                          Moderate Name
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Developers Tab */}
      {activeTab === 'developers' && (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Developer</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {developers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      No developer profiles found.
                    </td>
                  </tr>
                ) : (
                  developers.map((dev) => (
                    <tr key={dev._id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="font-black text-black">{dev.displayName}</div>
                        <div className="text-[11px] text-neutral-600 truncate max-w-xs">{dev.headline}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600">@{dev.username}</td>
                      <td className="py-3 px-4 capitalize font-mono text-[11px]">{dev.experienceLevel}</td>
                      <td className="py-3 px-4 capitalize font-mono text-[11px]">{dev.availability}</td>
                      <td className="py-3 px-4 space-x-1">
                        {dev.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-900 border border-yellow-800 text-[10px] font-mono">
                            Featured
                          </span>
                        )}
                        {dev.isSuspended ? (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-900 border border-red-800 text-[10px] font-mono">
                            Suspended
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-900 border border-green-800 text-[10px] font-mono">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleFeatureDev(dev)}
                          className="px-2 py-1 bg-[#FAF7F2] hover:bg-neutral-200 border border-black rounded text-[10px] font-mono font-bold"
                        >
                          {dev.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleToggleSuspendDev(dev)}
                          className={`px-2 py-1 border border-black rounded text-[10px] font-mono font-bold ${
                            dev.isSuspended ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {dev.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Projects Tab */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Project Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      No projects published yet.
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p._id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div className="font-black text-black">{p.title}</div>
                        <div className="text-[10px] font-mono text-neutral-500">/{p.slug}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] uppercase">{p.category}</td>
                      <td className="py-3 px-4">
                        {p.profileId ? (
                          <span className="font-mono text-xs">@{p.profileId.username}</span>
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          p.status === 'published' ? 'bg-green-100 text-green-900 border-green-800' : 'bg-neutral-100'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">{p.viewCount || 0}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleDeleteProject(p._id, p.title)}
                          className="px-2 py-1 bg-red-100 text-red-900 border border-black rounded text-[10px] font-mono font-bold"
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
      )}

      {/* 4. Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Target</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500">
                      No reports submitted. Community is healthy.
                    </td>
                  </tr>
                ) : (
                  reports.map((rep) => (
                    <tr key={rep._id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <span className="font-mono uppercase font-black px-1.5 py-0.5 rounded bg-neutral-100 border border-black/20 text-[10px]">
                          {rep.targetType}
                        </span>
                        <div className="text-xs font-mono mt-1">{rep.targetIdentifier || String(rep.targetId)}</div>
                      </td>
                      <td className="py-3 px-4 capitalize font-mono text-[11px] text-red-700">
                        {rep.reason}
                      </td>
                      <td className="py-3 px-4 max-w-xs text-xs font-medium text-neutral-700 leading-relaxed">
                        {rep.description}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          rep.status === 'pending'
                            ? 'bg-amber-100 text-amber-900 border-amber-800'
                            : 'bg-green-100 text-green-900 border-green-800'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                        {new Date(rep.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {rep.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleResolveReport(rep._id, 'resolved')}
                              className="px-2 py-1 bg-green-100 text-green-900 border border-black rounded text-[10px] font-mono font-bold"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleResolveReport(rep._id, 'dismissed')}
                              className="px-2 py-1 bg-neutral-100 text-neutral-800 border border-black rounded text-[10px] font-mono font-bold"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-500">
                            {rep.actionTaken || 'Reviewed'}
                          </span>
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

      {/* 5. Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4 font-black text-black">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-neutral-700">{u.email}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-mono font-bold">{u.role}</td>
                    <td className="py-3 px-4 text-neutral-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-[#22C55E]/20 text-green-900 border border-green-800">
                        Unlimited Free
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tools Tab */}
      {activeTab === 'tools' && (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase text-[11px] font-black">
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
                    <td className="py-3 px-4 font-black text-black">{t.name}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">{t.toolId}</td>
                    <td className="py-3 px-4 font-mono font-black text-green-700">Free (0 credits)</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border border-black ${
                        t.isEnabled ? 'bg-[#4ADE80] text-black' : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {t.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleTool(t)}
                        className="text-xs font-black text-black underline hover:text-neutral-700 cursor-pointer"
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
