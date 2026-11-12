import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight,
  Wallet,
  CreditCard,
  QrCode,
  Coins,
  Users,
  Medal,
  Crown,
  User,
} from 'lucide-react';
import { donationApi } from '../../services/donationApi.js';
import { platformApi } from '../../services/platformApi.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export const CommunityPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  // Donation Form State
  const [amount, setAmount] = useState<number | ''>(100);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Leaderboard & Statistics State
  const [activeTab, setActiveTab] = useState<'all-time' | 'monthly' | 'recent'>('all-time');
  const [summary, setSummary] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<{
    allTime: any[];
    monthly: any[];
    recent: any[];
    calendarMonth: string;
  } | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [platformStats, setPlatformStats] = useState({ totalMembers: 0, totalPublishedPosts: 0, totalSupporters: 0 });

  // Checkout return verification
  const checkoutStatus = searchParams.get('status');
  const sessionId = searchParams.get('session_id');
  const [verifiedDonation, setVerifiedDonation] = useState<any>(null);

  const loadCommunityData = async () => {
    try {
      setIsLoadingBoard(true);
      const [sumRes, leadRes, homeRes] = await Promise.all([
        donationApi.getSummary(),
        donationApi.getLeaderboard(30),
        platformApi.getHomeOverview().catch(() => null),
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (leadRes.success) setLeaderboard(leadRes.data);
      if (homeRes?.success && homeRes.data) {
        const s = homeRes.data.statistics || homeRes.data.stats || {};
        setPlatformStats({
          totalMembers: s.totalMembers ?? 0,
          totalPublishedPosts: s.publishedLearningPosts ?? s.totalPublishedPosts ?? 0,
          totalSupporters: s.totalSupporters ?? sumRes.data?.uniqueSupporters ?? 0,
        });
      }
    } catch {
      // ignore offline error
    } finally {
      setIsLoadingBoard(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, []);

  useEffect(() => {
    if (checkoutStatus === 'success' && sessionId) {
      donationApi.getStatus(sessionId).then((res) => {
        if (res.success && res.data) {
          setVerifiedDonation(res.data);
          loadCommunityData();
        }
      });
    }
  }, [checkoutStatus, sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (amount === '' || isNaN(Number(amount)) || Number(amount) < 20) {
      setErrorMessage('Please enter a donation amount of at least ₱20.');
      return;
    }

    if (Number(amount) > 500000) {
      setErrorMessage('Maximum single donation amount is ₱500,000.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await donationApi.createCheckout({
        amount: Number(amount),
        displayName: isAnonymous
          ? 'Anonymous Supporter'
          : displayName.trim() || 'Community Supporter',
        isAnonymous,
        message: message.trim(),
        donorEmail: donorEmail.trim() || undefined,
        successUrl: window.location.origin + '/community?status=success',
        cancelUrl: window.location.origin + '/community?status=canceled',
      });

      if (res.success && res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        throw new Error(res.error || 'Failed to create payment checkout');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment provider error. Please try again.');
      toast(err.message || 'Payment initiation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRankBadge = (index: number) => {
    return (
      <span className="w-7 h-7 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center font-mono font-bold text-xs text-[var(--theme-dirty-white)] shadow-xs">
        #{index + 1}
      </span>
    );
  };

  const topSupporter = leaderboard?.allTime?.[0] || null;

  return (
    <div className="space-y-10">
      {/* Return from Checkout Notification */}
      {checkoutStatus === 'success' && (
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--theme-dirty-white)] border border-[var(--theme-dirty-white)] flex items-center justify-center text-[var(--theme-canvas)] shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[var(--theme-dirty-white)]">
                Thank you for supporting VexoraMods!
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[var(--theme-gray-muted)]">
                Your voluntary contribution has been verified and added to the community supporter
                hall of fame.
              </p>
            </div>
          </div>
          {verifiedDonation && (
            <div className="p-4 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl font-mono text-xs space-y-1 text-[var(--theme-dirty-white)]">
              <div>
                Supporter: <strong>{verifiedDonation.displayName}</strong>
              </div>
              <div>
                Verified Amount:{' '}
                <strong className="text-[var(--theme-dirty-white)]">
                  ₱{Number(verifiedDonation.amount).toLocaleString()}{' '}
                  {verifiedDonation.currency || 'PHP'}
                </strong>
              </div>
              {verifiedDonation.message && <div>Message: "{verifiedDonation.message}"</div>}
            </div>
          )}
        </div>
      )}

      {checkoutStatus === 'canceled' && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-medium text-amber-200">
            Checkout was canceled. No charges were made.
          </p>
        </div>
      )}

      {/* Open Editorial Header & Single Telemetry Strip */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
            Support VexoraMods
          </h1>
          <p className="text-sm sm:text-base font-normal text-slate-400 max-w-3xl leading-relaxed">
            VexoraMods is built to make useful online tools, design software, and learning resources
            accessible to everyone. Your voluntary contribution helps maintain, improve, and keep
            the platform free and open source.
          </p>
        </div>

        {/* Community Telemetry Strip */}
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x lg:divide-slate-800">
          <div className="lg:pr-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {isLoadingBoard ? (
                <div className="h-8 w-24 bg-slate-800 rounded-lg animate-pulse my-0.5" />
              ) : (
                platformStats.totalMembers.toLocaleString()
              )}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">Community Members</div>
          </div>

          <div className="lg:px-5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {isLoadingBoard ? (
                <div className="h-8 w-24 bg-slate-800 rounded-lg animate-pulse my-0.5" />
              ) : (
                platformStats.totalPublishedPosts.toLocaleString()
              )}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              Published Tutorials &amp; Posts
            </div>
          </div>

          <div className="lg:px-5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {isLoadingBoard ? (
                <div className="h-8 w-24 bg-slate-800 rounded-lg animate-pulse my-0.5" />
              ) : (
                (platformStats.totalSupporters || summary?.uniqueSupporters || 0).toLocaleString()
              )}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">Community Supporters</div>
          </div>

          <div className="col-span-2 sm:col-span-1 lg:pl-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-400">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Public Supporter</span>
            </div>
            {isLoadingBoard ? (
              <div className="space-y-1.5 mt-1.5">
                <div className="h-4 w-28 bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
              </div>
            ) : topSupporter ? (
              <div className="mt-0.5">
                <span className="font-bold text-sm text-[var(--theme-dirty-white)] block truncate">
                  {topSupporter.isAnonymous ? 'Anonymous Supporter' : topSupporter.displayName}
                </span>
                <span className="text-xs font-mono font-medium text-[var(--theme-dirty-white-muted)]">
                  ₱{Number(topSupporter.totalAmount).toLocaleString()} PHP
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-[var(--theme-dirty-white)] hover:underline mt-1 inline-block">
                Become our first supporter
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Side-by-Side Workspace: Donation Form (Left 5 cols) + Supporter Leaderboard (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Voluntary Donation Form & Principles */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-[var(--theme-gray-border)] pb-4">
              <h2 className="text-xl font-extrabold text-[var(--theme-dirty-white)] flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                <span>Make a Voluntary Contribution</span>
              </h2>
              <p className="text-xs font-normal text-[var(--theme-gray-muted)] mt-1">
                One-time voluntary support in Philippine Pesos (PHP ₱).
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase text-[var(--theme-dirty-white)]">
                  Enter Amount (PHP ₱)
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-base text-[var(--theme-gray-muted)]">
                    ₱
                  </span>
                  <input
                    type="number"
                    min="20"
                    max="500000"
                    step="any"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="Enter PHP amount..."
                    className="w-full pl-8 pr-4 py-2.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-sm font-bold text-[var(--theme-dirty-white)] shadow-xs focus:outline-none focus:border-[var(--theme-dirty-white)]"
                    required
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-[var(--theme-gray-muted)]">
                  <span>Min: ₱20</span>
                  <span>Max: ₱500,000</span>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase text-[var(--theme-dirty-white)]">
                  Donor Display Name (Optional)
                </label>
                <input
                  type="text"
                  disabled={isAnonymous}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera or Team Vexora"
                  maxLength={60}
                  className="w-full p-2.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl font-medium text-xs text-[var(--theme-dirty-white)] placeholder-[var(--theme-gray-dim)] disabled:opacity-50 focus:outline-none focus:border-[var(--theme-dirty-white)]"
                />
              </div>

              {/* Anonymous Checkbox */}
              <label className="flex items-start gap-3 p-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[var(--theme-gray-border)] bg-[var(--theme-surface)]"
                />
                <div className="text-xs">
                  <span className="font-bold text-[var(--theme-dirty-white)] block">Make my donation anonymous</span>
                  <span className="font-normal text-[var(--theme-gray-muted)] block">
                    Displays as "Anonymous Supporter" on the public leaderboard.
                  </span>
                </div>
              </label>

              {/* Support Message */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold uppercase text-[var(--theme-dirty-white)]">
                  <span>Support Message (Optional)</span>
                  <span className="text-[var(--theme-gray-muted)]">{message.length}/280</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={280}
                  rows={2}
                  placeholder="Leave a message for the VexoraMods community..."
                  className="w-full p-2.5 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl font-normal text-xs text-[var(--theme-dirty-white)] placeholder-[var(--theme-gray-dim)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
                />
              </div>

              {/* Clear Checkout Amount Preview Box */}
              <div className="p-3.5 rounded-2xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[var(--theme-gray-muted)] block">
                    Checkout Preview
                  </span>
                  <span className="text-xs font-bold text-[var(--theme-dirty-white)]">
                    {isAnonymous
                      ? 'Anonymous Supporter'
                      : displayName.trim() || 'Community Supporter'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-extrabold text-[var(--theme-dirty-white)]">
                    ₱{amount ? Number(amount).toLocaleString() : '0'} PHP
                  </span>
                  <span className="block text-[10px] font-mono text-emerald-400 font-medium">
                    One-time voluntary gift
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs font-medium text-red-300">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] border border-[var(--theme-yellow)] rounded-xl font-bold text-xs sm:text-sm text-[var(--theme-canvas)] shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Heart className="w-4 h-4 text-[var(--theme-canvas)] fill-current" />
                <span>
                  {isSubmitting
                    ? 'Preparing Checkout...'
                    : `Donate ₱${amount ? Number(amount).toLocaleString() : '0'} PHP`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Supported Gateways */}
            <div className="pt-4 border-t border-[var(--theme-gray-border)] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--theme-dirty-white)]">
                <Wallet className="w-4 h-4 text-[var(--theme-dirty-white)]" />
                <span>Supported Payment Channels</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[11px] font-mono font-medium text-center">
                <div className="py-1.5 px-2 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-lg text-[var(--theme-dirty-white)]">GCash</div>
                <div className="py-1.5 px-2 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-lg text-[var(--theme-dirty-white)]">Maya</div>
                <div className="py-1.5 px-2 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-lg flex items-center justify-center gap-1 text-[var(--theme-dirty-white)]">
                  <CreditCard className="w-3 h-3 text-[var(--theme-dirty-white)]" /> Cards
                </div>
                <div className="py-1.5 px-2 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-lg flex items-center justify-center gap-1 text-[var(--theme-dirty-white)]">
                  <QrCode className="w-3 h-3 text-[var(--theme-dirty-white)]" /> QRPh
                </div>
              </div>
            </div>
          </div>

          {/* Open Donation Principles List */}
          <div className="pt-2 space-y-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--theme-dirty-white)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--theme-dirty-white)] stroke-[2.2]" />
              <span>100% Voluntary Open-Source Pledge</span>
            </h3>
            <ul className="space-y-1.5 text-xs font-normal text-[var(--theme-gray-muted)]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-dirty-white)] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--theme-dirty-white)]">No Locked Tools:</strong> All tools, AI features, Studio templates, and
                  Learning Hub posts are 100% free for everyone.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-dirty-white)] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--theme-dirty-white)]">No Paid Subscriptions or AI Credits:</strong> Donations never gate
                  functionality or sell usage quotas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-dirty-white)] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--theme-dirty-white)]">Strict Privacy:</strong> Private emails and gateway references are never
                  exposed on the public leaderboard.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Supporter Leaderboard (7 cols — Open Layout) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-gray-border)] pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <span>Supporter Leaderboard</span>
                </h2>
                <p className="text-xs font-normal text-slate-400 mt-0.5">
                  Verified contributors helping keep VexoraMods free and independent.
                </p>
              </div>

              {/* Leaderboard Period Switcher */}
              <div className="inline-flex items-center bg-slate-900 p-1 rounded-xl border border-[var(--theme-gray-border)] self-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('all-time')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeTab === 'all-time'
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All-Time
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeTab === 'monthly'
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('recent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeTab === 'recent'
                      ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] hover:bg-[var(--theme-dirty-white-muted)] shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>

            {isLoadingBoard ? (
              <div className="py-16 text-center font-mono text-xs font-medium text-slate-400">
                Loading verified community supporter records...
              </div>
            ) : activeTab === 'recent' ? (
              <div className="divide-y divide-slate-800">
                {leaderboard?.recent && leaderboard.recent.length > 0 ? (
                  leaderboard.recent.map((entry, idx) => (
                    <div key={idx} className="py-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center font-bold text-sm shrink-0">
                          {entry.isAnonymous ? (
                            <User className="w-5 h-5 text-[var(--theme-gray-muted)]" />
                          ) : (
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-sm text-[var(--theme-dirty-white)] flex items-center gap-2">
                            <span>{entry.displayName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] border border-[var(--theme-gray-border)]">
                              Verified
                            </span>
                          </div>
                          {entry.message && (
                            <p className="text-xs font-normal text-[var(--theme-dirty-white-muted)] italic bg-[var(--theme-surface-raised)] p-2.5 rounded-xl border border-[var(--theme-gray-border)]">
                              "{entry.message}"
                            </p>
                          )}
                          <div className="text-[10px] font-mono text-[var(--theme-gray-muted)]">
                            {new Date(entry.verifiedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-base text-[var(--theme-dirty-white)] shrink-0">
                        ₱{Number(entry.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs font-mono font-medium text-[var(--theme-gray-muted)]">
                    No recent contributions recorded yet. Be the first supporter!
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-[var(--theme-dirty-white)] font-bold uppercase">
                      <th className="py-3 px-4 w-16">Rank</th>
                      <th className="py-3 px-4">Supporter</th>
                      <th className="py-3 px-4 text-center">Gifts</th>
                      <th className="py-3 px-4 text-right">Total Contributed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--theme-gray-border)]">
                    {(
                      (activeTab === 'all-time' ? leaderboard?.allTime : leaderboard?.monthly) || []
                    ).length > 0 ? (
                      (
                        (activeTab === 'all-time' ? leaderboard?.allTime : leaderboard?.monthly) ||
                        []
                      ).map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[var(--theme-surface-raised)]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold flex items-center">
                            {getRankBadge(idx)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-sm text-[var(--theme-dirty-white)] flex items-center gap-2">
                              <span>{row.displayName}</span>
                              {row.isAnonymous && (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface-raised)] text-[var(--theme-gray-muted)] border border-[var(--theme-gray-border)]">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--theme-gray-muted)]">
                              Last gift:{' '}
                              {row.latestVerifiedAt
                                ? new Date(row.latestVerifiedAt).toLocaleDateString()
                                : 'Verified'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-medium text-[var(--theme-gray-muted)]">
                            {row.donationCount}×
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-sm text-[var(--theme-dirty-white)]">
                            ₱{Number(row.totalAmount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-[var(--theme-gray-muted)] font-medium">
                          No verified supporter records for this period yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
