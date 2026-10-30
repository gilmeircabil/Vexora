import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Sparkles,
  Zap,
  Clock,
  Calendar,
  CreditCard,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  FileImage,
  Download,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCredits } from '../context/CreditContext.js';
import { useToast } from '../context/ToastContext.js';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  tool?: string;
  description: string;
  status: string;
  createdAt: string;
}

interface AIJobItem {
  _id: string;
  tool: string;
  status: string;
  creditsConsumed: number;
  outputUrl?: string;
  inputMetadata?: {
    originalName?: string;
    mode?: string;
    size?: number;
  };
  createdAt: string;
}

export const DashboardPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { balance, refreshBalance } = useCredits();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [jobs, setJobs] = useState<AIJobItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [txRes, jobsRes] = await Promise.all([
        fetch('/api/credits/history?limit=15', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/ai/history', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData.success) {
          setTransactions(txData.data.transactions || []);
        }
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        if (jobsData.success) {
          setJobs(jobsData.data.jobs || []);
        }
      }
    } catch {
      showToast('Could not load transaction history.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const handleCancelSubscription = async () => {
    if (!token) return;
    if (
      !confirm(
        'Are you sure you want to cancel renewal? You will retain all your credits and benefits until the end of your billing cycle.',
      )
    ) {
      return;
    }

    setIsCanceling(true);
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Subscription set to cancel at end of billing cycle.', 'success');
        await refreshUser();
      } else {
        showToast(data.error || 'Failed to cancel subscription', 'error');
      }
    } catch {
      showToast('Network error while canceling subscription', 'error');
    } finally {
      setIsCanceling(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-neutral-500">
        Loading dashboard profile...
      </div>
    );
  }

  const plan = user.subscription?.plan || 'free';
  const isFree = plan === 'free';
  const dailyRemaining = balance?.dailyRemaining ?? user.credits?.dailyRemaining ?? 3;
  const dailyAllowance = balance?.dailyAllowance ?? user.credits?.dailyAllowance ?? 3;
  const monthlyRemaining = balance?.monthlyRemaining ?? user.credits?.monthlyRemaining ?? 0;
  const monthlyAllowance = balance?.monthlyAllowance ?? user.credits?.monthlyAllowance ?? 0;
  const totalAvailable = balance?.totalAvailable ?? user.credits?.totalAvailable ?? 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
              Account Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase font-mono bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {plan}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Logged in as <span className="font-semibold">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refreshBalance();
              loadDashboardData();
            }}
            className="p-2 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            title="Refresh credits & transactions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/pricing"
            className="py-2 px-3.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Plans</span>
          </Link>
        </div>
      </div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Available */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Available AI Credits</span>
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 font-mono">
            {totalAvailable}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Ready to consume across all AI generation tools
          </p>
        </div>

        {/* Daily Credits */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Daily Free Allowance</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 font-mono">
            {dailyRemaining}{' '}
            <span className="text-sm font-normal text-neutral-400">/ {dailyAllowance}</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Resets automatically at 00:00 UTC</p>
        </div>

        {/* Monthly Subscription Credits */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Monthly Plan Credits</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 font-mono">
            {monthlyRemaining}{' '}
            <span className="text-sm font-normal text-neutral-400">/ {monthlyAllowance}</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {isFree ? 'Upgrade to Pro or Premium' : 'Active billing period balance'}
          </p>
        </div>

        {/* Plan Status & Renewal */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Subscription Status</span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100 capitalize">
            {user.subscription?.status || 'Active'}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {user.subscription?.currentPeriodEnd
              ? `Cycle ends ${new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}`
              : 'Permanent free tier'}
          </p>
          {!isFree && !user.subscription?.cancelAtPeriodEnd && (
            <button
              onClick={handleCancelSubscription}
              disabled={isCanceling}
              className="mt-2 text-[11px] text-red-600 hover:underline block"
            >
              {isCanceling ? 'Canceling...' : 'Cancel renewal'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Recent AI Generations & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent AI Generations (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileImage className="w-4 h-4 text-indigo-500" />
              <span>Recent AI Jobs</span>
            </h2>
            <Link
              to="/tools/ai-image-enhancer"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              <span>Launch Tool</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 divide-y divide-neutral-100 dark:divide-neutral-800">
            {jobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                <p>No recent AI jobs yet.</p>
                <Link
                  to="/tools/ai-image-enhancer"
                  className="mt-2 inline-block text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Enhance your first image
                </Link>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {job.inputMetadata?.originalName || job.tool}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {new Date(job.createdAt).toLocaleString()} • {job.creditsConsumed} credit(s)
                    </p>
                  </div>
                  <div>
                    {job.status === 'completed' && job.outputUrl ? (
                      <a
                        href={job.outputUrl}
                        download
                        className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center gap-1 text-[11px] font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 capitalize">
                        {job.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Credit Transaction History Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Credit Usage & Transaction History
            </h2>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500 text-xs">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const isDeduction = tx.type === 'consumption' || tx.type === 'reservation';
                      return (
                        <tr
                          key={tx._id}
                          className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40"
                        >
                          <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                            {tx.description}
                          </td>
                          <td className="py-3 px-4 uppercase text-[10px] font-mono text-neutral-500">
                            {tx.type.replace('_', ' ')}
                          </td>
                          <td
                            className={`py-3 px-4 font-mono font-bold whitespace-nowrap ${
                              isDeduction
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isDeduction ? `-${tx.amount}` : `+${tx.amount}`}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                tx.status === 'committed'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : tx.status === 'refunded'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
