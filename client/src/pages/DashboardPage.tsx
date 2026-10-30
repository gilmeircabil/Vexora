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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-black/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-black text-black">
              Account Dashboard
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase font-mono bg-[#FACC15] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              {plan}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-neutral-600 mt-1">
            Logged in as <span className="font-black text-black">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refreshBalance();
              loadDashboardData();
            }}
            className="p-2.5 text-xs font-black rounded-xl border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh credits & transactions"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/pricing"
            className="py-2.5 px-4 text-xs font-black rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Manage Plans</span>
          </Link>
        </div>
      </div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Available */}
        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between text-neutral-600 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">Available Credits</span>
            <div className="w-7 h-7 rounded-lg bg-[#4ADE80] border border-black flex items-center justify-center">
              <Zap className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-black font-mono">
            {totalAvailable}
          </div>
          <p className="text-[11px] font-bold text-neutral-600 mt-1">
            Ready to consume across all AI generation tools
          </p>
        </div>

        {/* Daily Credits */}
        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between text-neutral-600 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">Daily Free Allowance</span>
            <div className="w-7 h-7 rounded-lg bg-[#FACC15] border border-black flex items-center justify-center">
              <Clock className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-black font-mono">
            {dailyRemaining}{' '}
            <span className="text-sm font-bold text-neutral-500">/ {dailyAllowance}</span>
          </div>
          <p className="text-[11px] font-bold text-neutral-600 mt-1">Resets automatically at 00:00 UTC</p>
        </div>

        {/* Monthly Subscription Credits */}
        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between text-neutral-600 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">Monthly Plan Credits</span>
            <div className="w-7 h-7 rounded-lg bg-[#A78BFA] border border-black flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl font-black text-black font-mono">
            {monthlyRemaining}{' '}
            <span className="text-sm font-bold text-neutral-500">/ {monthlyAllowance}</span>
          </div>
          <p className="text-[11px] font-bold text-neutral-600 mt-1">
            {isFree ? 'Upgrade to Pro or Premium' : 'Active billing period balance'}
          </p>
        </div>

        {/* Plan Status & Renewal */}
        <div className="p-5 rounded-2xl bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between text-neutral-600 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-black">Subscription Status</span>
            <div className="w-7 h-7 rounded-lg bg-[#38BDF8] border border-black flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
          </div>
          <div className="text-lg font-black text-black capitalize">
            {user.subscription?.status || 'Active'}
          </div>
          <p className="text-[11px] font-bold text-neutral-600 mt-1">
            {user.subscription?.currentPeriodEnd
              ? `Cycle ends ${new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}`
              : 'Permanent free tier'}
          </p>
          {!isFree && !user.subscription?.cancelAtPeriodEnd && (
            <button
              onClick={handleCancelSubscription}
              disabled={isCanceling}
              className="mt-2 text-[11px] font-black text-red-600 hover:underline block cursor-pointer"
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
            <h2 className="text-base font-black text-black flex items-center gap-2">
              <FileImage className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Recent AI Jobs</span>
            </h2>
            <Link
              to="/tools/ai-image-enhancer"
              className="text-xs font-black text-black hover:underline flex items-center gap-1"
            >
              <span>Launch Tool</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border-2 border-black p-5 shadow-[4px_4px_0px_#000000] divide-y-2 divide-black/10">
            {jobs.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-neutral-600">
                <p>No recent AI jobs yet.</p>
                <Link
                  to="/tools/ai-image-enhancer"
                  className="mt-2 inline-block font-black text-black underline hover:text-neutral-700"
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
                    <p className="font-black text-black">
                      {job.inputMetadata?.originalName || job.tool}
                    </p>
                    <p className="text-[11px] font-bold text-neutral-600">
                      {new Date(job.createdAt).toLocaleString()} • {job.creditsConsumed} credit(s)
                    </p>
                  </div>
                  <div>
                    {job.status === 'completed' && job.outputUrl ? (
                      <a
                        href={job.outputUrl}
                        download
                        className="p-1.5 px-2.5 rounded-lg bg-[#4ADE80] border border-black hover:bg-[#3ec470] text-black shadow-[1px_1px_0px_#000] flex items-center gap-1 text-[11px] font-black"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-[11px] font-black text-neutral-800 bg-[#FACC15] border border-black px-2 py-0.5 rounded capitalize">
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
            <h2 className="text-base font-black text-black">
              Credit Usage & Transaction History
            </h2>
          </div>

          <div className="bg-white rounded-3xl border-2 border-black overflow-hidden shadow-[5px_5px_0px_#000000]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b-2 border-black text-black uppercase tracking-wider font-black text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Credits</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10 text-black font-bold">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-600 font-bold text-xs">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => {
                      const isDeduction = tx.type === 'consumption' || tx.type === 'reservation';
                      return (
                        <tr
                          key={tx._id}
                          className="hover:bg-neutral-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-neutral-600 whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-black text-black">
                            {tx.description}
                          </td>
                          <td className="py-3 px-4 uppercase text-[10px] font-mono font-bold text-neutral-600">
                            {tx.type.replace('_', ' ')}
                          </td>
                          <td
                            className={`py-3 px-4 font-mono font-black whitespace-nowrap ${
                              isDeduction
                                ? 'text-red-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {isDeduction ? `-${tx.amount}` : `+${tx.amount}`}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_#000] ${
                                tx.status === 'committed'
                                  ? 'bg-[#4ADE80] text-black'
                                  : tx.status === 'refunded'
                                    ? 'bg-[#38BDF8] text-black'
                                    : 'bg-[#FACC15] text-black'
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
