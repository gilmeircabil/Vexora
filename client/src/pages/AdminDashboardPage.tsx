import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Zap,
  AlertTriangle,
  Sliders,
  RefreshCw,
  PlusCircle,
  Activity,
  Layers,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

interface AdminStats {
  totalUsers: number;
  activePaidSubscriptions: number;
  totalAIJobs: number;
  failedAIJobs: number;
  totalCreditsConsumed: number;
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
  creditCost: number;
  minPlan: string;
  isEnabled: boolean;
}

export const AdminDashboardPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [failedJobs, setFailedJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tools' | 'webhooks' | 'failedJobs'>(
    'users',
  );
  const [isLoading, setIsLoading] = useState(true);

  // Credit Adjustment Modal state
  const [adjustModalUser, setAdjustModalUser] = useState<AdminUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

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
      const [usageRes, usersRes, toolsRes] = await Promise.all([
        fetch('/api/admin/usage', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/tools', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (usageRes.ok) {
        const u = await usageRes.json();
        if (u.success) {
          setStats(u.data.stats);
          setWebhooks(u.data.webhookEvents || []);
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

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser || !token) return;

    if (!adjustReason || adjustReason.trim().length < 5) {
      showToast('An audit reason of at least 5 characters is required.', 'error');
      return;
    }

    setIsSubmittingAdjust(true);
    try {
      const res = await fetch('/api/admin/credits/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: adjustModalUser._id,
          amount: adjustAmount,
          reason: adjustReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Successfully adjusted credits for ${adjustModalUser.email}.`, 'success');
        setAdjustModalUser(null);
        setAdjustReason('');
        fetchAdminData();
      } else {
        showToast(data.error || 'Failed to adjust credits', 'error');
      }
    } catch {
      showToast('Network error during adjustment', 'error');
    } finally {
      setIsSubmittingAdjust(false);
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

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-neutral-500">
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
              Admin Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-bold text-neutral-600 mt-1">
            System overview, user credit audit, and AI pipeline configuration.
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

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
            <span className="text-[11px] text-neutral-600 font-black uppercase tracking-wider block">Registered Users</span>
            <div className="text-2xl font-black font-mono text-black mt-1">
              {stats.totalUsers}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
            <span className="text-[11px] text-neutral-600 font-black uppercase tracking-wider block">Paid Subscriptions</span>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
              {stats.activePaidSubscriptions}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
            <span className="text-[11px] text-neutral-600 font-black uppercase tracking-wider block">Total AI Jobs</span>
            <div className="text-2xl font-black font-mono text-black mt-1">
              {stats.totalAIJobs}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
            <span className="text-[11px] text-neutral-600 font-black uppercase tracking-wider block">Credits Consumed</span>
            <div className="text-2xl font-black font-mono text-purple-700 mt-1">
              {stats.totalCreditsConsumed}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
            <span className="text-[11px] text-neutral-600 font-black uppercase tracking-wider block">Failed Jobs</span>
            <div className="text-2xl font-black font-mono text-red-600 mt-1">
              {stats.failedAIJobs}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-black/10 text-xs font-black">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 transition-all border-b-4 cursor-pointer ${
            activeTab === 'users'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`pb-3 px-4 transition-all border-b-4 cursor-pointer ${
            activeTab === 'tools'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          AI Tools Config ({tools.length})
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 px-4 transition-all border-b-4 cursor-pointer ${
            activeTab === 'webhooks'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          Webhook Events ({webhooks.length})
        </button>
        <button
          onClick={() => setActiveTab('failedJobs')}
          className={`pb-3 px-4 transition-all border-b-4 cursor-pointer ${
            activeTab === 'failedJobs'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          Failed Jobs ({failedJobs.length})
        </button>
      </div>

      {/* Tab Panels */}
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
                  <th className="py-3.5 px-4 text-right">Actions</th>
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
                      <button
                        onClick={() => setAdjustModalUser(u)}
                        className="px-3 py-1 text-xs font-black rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-black border border-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                      >
                        Adjust Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Tool Name</th>
                  <th className="py-3.5 px-4">Tool ID</th>
                  <th className="py-3.5 px-4">Credit Cost</th>
                  <th className="py-3.5 px-4">Min Plan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {tools.map((t) => (
                  <tr
                    key={t.toolId}
                    className="hover:bg-neutral-50"
                  >
                    <td className="py-3 px-4 font-black text-black">
                      {t.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">{t.toolId}</td>
                    <td className="py-3 px-4 font-mono font-black text-black">
                      {t.creditCost}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-mono font-bold">{t.minPlan}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border border-black ${
                          t.isEnabled
                            ? 'bg-[#4ADE80] text-black'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
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

      {activeTab === 'webhooks' && (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Event ID</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Received At</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {webhooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-600 font-bold">
                      No webhook events logged yet.
                    </td>
                  </tr>
                ) : (
                  webhooks.map((w) => (
                    <tr
                      key={w.eventId}
                      className="hover:bg-neutral-50"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-700">
                        {w.eventId}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-mono font-bold">{w.provider}</td>
                      <td className="py-3 px-4 font-black text-black">
                        {w.eventType}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border border-black ${
                            w.processingStatus === 'processed'
                              ? 'bg-[#4ADE80] text-black'
                              : 'bg-red-300 text-black'
                          }`}
                        >
                          {w.processingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-mono">
                        {new Date(w.receivedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'failedJobs' && (
        <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase text-[11px] font-black">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Tool</th>
                  <th className="py-3.5 px-4">Error Message</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {failedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-neutral-600 font-bold">
                      No failed jobs recorded. System is healthy.
                    </td>
                  </tr>
                ) : (
                  failedJobs.map((f) => (
                    <tr key={f._id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 font-black text-black">
                        {f.userId?.email || 'User'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">{f.tool}</td>
                      <td className="py-3 px-4 text-red-600 font-black">
                        {f.errorMessage}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-mono">
                        {new Date(f.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Credit Adjustment Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl border-2 border-black max-w-md w-full p-8 shadow-[8px_8px_0px_#000000] animate-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-black mb-1">
              Adjust User Credits
            </h3>
            <p className="text-xs font-bold text-neutral-600 mb-6">
              Modifying allowance for <span className="font-black text-black">{adjustModalUser.email}</span>.
              All administrative adjustments are permanently recorded in the audit ledger.
            </p>

            <form onSubmit={handleAdjustCredits} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block font-black text-black text-xs uppercase tracking-wider mb-1.5">
                  Credit Delta (e.g. +50 or -10)
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-3 rounded-xl border-2 border-black bg-white font-mono text-sm text-black shadow-[2px_2px_0px_#000] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-black text-xs uppercase tracking-wider mb-1.5">
                  Audit Reason (Mandatory, min 5 chars)
                </label>
                <textarea
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Compensation for temporary service maintenance or custom enterprise grant"
                  className="w-full p-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black shadow-[2px_2px_0px_#000] focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="px-4 py-2.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 text-black font-black cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-black font-black shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  {isSubmittingAdjust ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
