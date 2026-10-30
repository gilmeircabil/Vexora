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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
              Admin Console
            </h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            System overview, user credit audit, and AI pipeline configuration.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-500 font-medium">Registered Users</span>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
              {stats.totalUsers}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-500 font-medium">Paid Subscriptions</span>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.activePaidSubscriptions}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-500 font-medium">Total AI Jobs</span>
            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-1">
              {stats.totalAIJobs}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-500 font-medium">Credits Consumed</span>
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
              {stats.totalCreditsConsumed}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-500 font-medium">Failed Jobs</span>
            <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">
              {stats.failedAIJobs}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'tools'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          AI Tools Config ({tools.length})
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'webhooks'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Webhook Events ({webhooks.length})
        </button>
        <button
          onClick={() => setActiveTab('failedJobs')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'failedJobs'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Failed Jobs ({failedJobs.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{u.email}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-mono">{u.role}</td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setAdjustModalUser(u)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors"
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
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Tool Name</th>
                  <th className="py-3 px-4">Tool ID</th>
                  <th className="py-3 px-4">Credit Cost</th>
                  <th className="py-3 px-4">Min Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {tools.map((t) => (
                  <tr
                    key={t.toolId}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40"
                  >
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                      {t.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">{t.toolId}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {t.creditCost}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-mono">{t.minPlan}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.isEnabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {t.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleTool(t)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
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
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Received At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {webhooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500">
                      No webhook events logged yet.
                    </td>
                  </tr>
                ) : (
                  webhooks.map((w) => (
                    <tr
                      key={w.eventId}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                        {w.eventId}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-mono">{w.provider}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                        {w.eventType}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            w.processingStatus === 'processed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}
                        >
                          {w.processingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
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
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Error Message</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {failedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-neutral-500">
                      No failed jobs recorded. System is healthy.
                    </td>
                  </tr>
                ) : (
                  failedJobs.map((f) => (
                    <tr key={f._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                        {f.userId?.email || 'User'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">{f.tool}</td>
                      <td className="py-3 px-4 text-red-600 dark:text-red-400 font-medium">
                        {f.errorMessage}
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Adjust User Credits
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Modifying allowance for <span className="font-semibold">{adjustModalUser.email}</span>
              . All administrative adjustments are permanently recorded in the audit ledger.
            </p>

            <form onSubmit={handleAdjustCredits} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Credit Delta (e.g. +50 or -10)
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Audit Reason (Mandatory, min 5 chars)
                </label>
                <textarea
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Compensation for temporary service maintenance or custom enterprise grant"
                  className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="px-3.5 py-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
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
