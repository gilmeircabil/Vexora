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
    if (index === 0) return <span className="text-xl">🥇</span>;
    if (index === 1) return <span className="text-xl">🥈</span>;
    if (index === 2) return <span className="text-xl">🥉</span>;
    return (
      <span className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-black flex items-center justify-center font-mono font-black text-xs text-black">
        #{index + 1}
      </span>
    );
  };

  const topSupporter = leaderboard?.allTime?.[0] || null;

  return (
    <div className="space-y-10">
      {/* Return from Checkout Notification */}
      {checkoutStatus === 'success' && (
        <div className="bg-[#4ADE80]/30 border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_#000000] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#22C55E] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_#000000]">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black">
                Thank you for supporting VexoraMods!
              </h3>
              <p className="text-xs sm:text-sm font-bold text-neutral-800">
                Your voluntary contribution has been verified and added to the community supporter
                hall of fame.
              </p>
            </div>
          </div>
          {verifiedDonation && (
            <div className="p-4 bg-white border-2 border-black rounded-2xl font-mono text-xs space-y-1">
              <div>
                Supporter: <strong>{verifiedDonation.displayName}</strong>
              </div>
              <div>
                Verified Amount:{' '}
                <strong>
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
        <div className="bg-amber-100 border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000000] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-800 shrink-0" />
          <p className="text-xs font-bold text-neutral-900">
            Checkout was canceled. No charges were made.
          </p>
        </div>
      )}

      {/* Open Editorial Header & Single Telemetry Strip */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black">
            Support VexoraMods
          </h1>
          <p className="text-sm sm:text-base font-semibold text-neutral-700 max-w-3xl leading-relaxed">
            VexoraMods is built to make useful online tools, design software, and learning resources
            accessible to everyone. Your voluntary contribution helps maintain, improve, and keep
            the platform free and open source.
          </p>
        </div>

        {/* Community Telemetry Strip */}
        <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_#000000] grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x-2 lg:divide-black/15">
          <div className="lg:pr-4">
            <div className="text-2xl sm:text-3xl font-black text-black">
              {isLoadingBoard ? (
                <div className="h-8 w-24 bg-black/10 rounded-lg animate-pulse my-0.5" />
              ) : (
                platformStats.totalMembers.toLocaleString()
              )}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-0.5">Community Members</div>
          </div>

          <div className="lg:px-5">
            <div className="text-2xl sm:text-3xl font-black text-black">
              {isLoadingBoard ? (
                <div className="h-8 w-24 bg-black/10 rounded-lg animate-pulse my-0.5" />
              ) : (
                platformStats.totalPublishedPosts.toLocaleString()
              )}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-0.5">
              Published Tutorials &amp; Posts
            </div>
          </div>

          <div className="lg:px-5">
            <div className="text-2xl sm:text-3xl font-black text-black">
              {isLoadingBoard ? (
                <div className="h-8 w-24 bg-black/10 rounded-lg animate-pulse my-0.5" />
              ) : (
                (platformStats.totalSupporters || summary?.uniqueSupporters || 0).toLocaleString()
              )}
            </div>
            <div className="text-xs font-bold text-neutral-600 mt-0.5">Community Supporters</div>
          </div>

          <div className="col-span-2 sm:col-span-1 lg:pl-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-600">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Top Public Supporter</span>
            </div>
            {isLoadingBoard ? (
              <div className="space-y-1.5 mt-1.5">
                <div className="h-4 w-28 bg-black/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-black/5 rounded animate-pulse" />
              </div>
            ) : topSupporter ? (
              <div className="mt-0.5">
                <span className="font-black text-sm text-black block truncate">
                  {topSupporter.isAnonymous ? 'Anonymous Supporter' : topSupporter.displayName}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-600">
                  ₱{Number(topSupporter.totalAmount).toLocaleString()} PHP
                </span>
              </div>
            ) : (
              <span className="text-xs font-black text-black underline mt-1 inline-block">
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
          <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#000000] space-y-6">
            <div className="border-b-2 border-black pb-4">
              <h2 className="text-xl font-black text-black flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600 fill-red-500" />
                <span>Make a Voluntary Contribution</span>
              </h2>
              <p className="text-xs font-semibold text-neutral-600 mt-1">
                One-time voluntary support in Philippine Pesos (PHP ₱).
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-black uppercase text-black">
                  Enter Amount (PHP ₱)
                </label>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-base text-black">
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
                    className="w-full pl-8 pr-4 py-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl font-mono text-sm font-black text-black shadow-[2px_2px_0px_#000000] focus:outline-none focus:bg-white"
                    required
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-500">
                  <span>Min: ₱20</span>
                  <span>Max: ₱500,000</span>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-black uppercase text-black">
                  Donor Display Name (Optional)
                </label>
                <input
                  type="text"
                  disabled={isAnonymous}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera or Team Vexora"
                  maxLength={60}
                  className="w-full p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl font-bold text-xs text-black disabled:opacity-50"
                />
              </div>

              {/* Anonymous Checkbox */}
              <label className="flex items-start gap-3 p-3 bg-[#FAF7F2] border-2 border-black rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-black rounded border-2 border-black"
                />
                <div className="text-xs">
                  <span className="font-black text-black block">Make my donation anonymous</span>
                  <span className="font-semibold text-neutral-600 block">
                    Displays as "Anonymous Supporter" on the public leaderboard.
                  </span>
                </div>
              </label>

              {/* Support Message */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-black uppercase text-black">
                  <span>Support Message (Optional)</span>
                  <span className="text-neutral-500">{message.length}/280</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={280}
                  rows={2}
                  placeholder="Leave a message for the VexoraMods community..."
                  className="w-full p-2.5 bg-[#FAF7F2] border-2 border-black rounded-xl font-medium text-xs text-black"
                />
              </div>

              {/* Clear Checkout Amount Preview Box */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border-2 border-black flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-neutral-500 block">
                    Checkout Preview
                  </span>
                  <span className="text-xs font-bold text-black">
                    {isAnonymous
                      ? 'Anonymous Supporter'
                      : displayName.trim() || 'Community Supporter'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-black">
                    ₱{amount ? Number(amount).toLocaleString() : '0'} PHP
                  </span>
                  <span className="block text-[10px] font-mono text-emerald-800 font-bold">
                    One-time voluntary gift
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-100 border-2 border-black rounded-xl text-xs font-bold text-red-800">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl font-mono text-xs sm:text-sm font-black text-black shadow-[4px_4px_0px_#000000] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Heart className="w-4 h-4 text-red-600 fill-red-500" />
                <span>
                  {isSubmitting
                    ? 'Preparing Checkout...'
                    : `Donate ₱${amount ? Number(amount).toLocaleString() : '0'} PHP`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Supported Gateways */}
            <div className="pt-4 border-t-2 border-black/10 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-black">
                <Wallet className="w-4 h-4" />
                <span>Supported Payment Channels</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[11px] font-mono font-bold text-center">
                <div className="py-1.5 px-2 bg-[#FAF7F2] border border-black rounded-lg">GCash</div>
                <div className="py-1.5 px-2 bg-[#FAF7F2] border border-black rounded-lg">Maya</div>
                <div className="py-1.5 px-2 bg-[#FAF7F2] border border-black rounded-lg flex items-center justify-center gap-1">
                  <CreditCard className="w-3 h-3" /> Cards
                </div>
                <div className="py-1.5 px-2 bg-[#FAF7F2] border border-black rounded-lg flex items-center justify-center gap-1">
                  <QrCode className="w-3 h-3" /> QRPh
                </div>
              </div>
            </div>
          </div>

          {/* Open Donation Principles List */}
          <div className="pt-2 space-y-2.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              <span>100% Voluntary Open-Source Pledge</span>
            </h3>
            <ul className="space-y-1.5 text-xs font-semibold text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No Locked Tools:</strong> All tools, AI features, Studio templates, and
                  Learning Hub posts are 100% free for everyone.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No Paid Subscriptions or AI Credits:</strong> Donations never gate
                  functionality or sell usage quotas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Privacy:</strong> Private emails and gateway references are never
                  exposed on the public leaderboard.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Supporter Leaderboard (7 cols — Open Layout) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
              <div>
                <h2 className="text-2xl font-black text-black flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-[#EAB308]" />
                  <span>Supporter Leaderboard</span>
                </h2>
                <p className="text-xs font-semibold text-neutral-600 mt-0.5">
                  Verified contributors helping keep VexoraMods free and independent.
                </p>
              </div>

              {/* Leaderboard Period Switcher */}
              <div className="inline-flex items-center bg-[#FAF7F2] p-1 rounded-xl border-2 border-black self-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('all-time')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black transition-all ${
                    activeTab === 'all-time'
                      ? 'bg-[#FACC15] text-black border border-black'
                      : 'text-neutral-700 hover:text-black'
                  }`}
                >
                  All-Time
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black transition-all ${
                    activeTab === 'monthly'
                      ? 'bg-[#FACC15] text-black border border-black'
                      : 'text-neutral-700 hover:text-black'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('recent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black transition-all ${
                    activeTab === 'recent'
                      ? 'bg-[#FACC15] text-black border border-black'
                      : 'text-neutral-700 hover:text-black'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>

            {isLoadingBoard ? (
              <div className="py-16 text-center font-mono text-xs font-bold text-neutral-600">
                Loading verified community supporter records...
              </div>
            ) : activeTab === 'recent' ? (
              <div className="divide-y-2 divide-black/10">
                {leaderboard?.recent && leaderboard.recent.length > 0 ? (
                  leaderboard.recent.map((entry, idx) => (
                    <div key={idx} className="py-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border-2 border-black flex items-center justify-center font-black text-sm shrink-0">
                          {entry.isAnonymous ? '👤' : '❤️'}
                        </div>
                        <div className="space-y-1">
                          <div className="font-black text-sm text-black flex items-center gap-2">
                            <span>{entry.displayName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-black">
                              Verified
                            </span>
                          </div>
                          {entry.message && (
                            <p className="text-xs font-medium text-neutral-700 italic bg-[#FAF7F2] p-2.5 rounded-xl border border-black/20">
                              "{entry.message}"
                            </p>
                          )}
                          <div className="text-[10px] font-mono text-neutral-500">
                            {new Date(entry.verifiedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono font-black text-base text-black shrink-0">
                        ₱{Number(entry.amount).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs font-mono font-bold text-neutral-500">
                    No recent contributions recorded yet. Be the first supporter!
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-black bg-[#FAF7F2] text-black font-black uppercase">
                      <th className="py-3 px-4 w-16">Rank</th>
                      <th className="py-3 px-4">Supporter</th>
                      <th className="py-3 px-4 text-center">Gifts</th>
                      <th className="py-3 px-4 text-right">Total Contributed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {(
                      (activeTab === 'all-time' ? leaderboard?.allTime : leaderboard?.monthly) || []
                    ).length > 0 ? (
                      (
                        (activeTab === 'all-time' ? leaderboard?.allTime : leaderboard?.monthly) ||
                        []
                      ).map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#FAF7F2] transition-colors">
                          <td className="py-3.5 px-4 font-bold flex items-center">
                            {getRankBadge(idx)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-black text-sm text-black flex items-center gap-2">
                              <span>{row.displayName}</span>
                              {row.isAnonymous && (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-black/30">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              Last gift:{' '}
                              {row.latestVerifiedAt
                                ? new Date(row.latestVerifiedAt).toLocaleDateString()
                                : 'Verified'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-neutral-700">
                            {row.donationCount}×
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-sm text-black">
                            ₱{Number(row.totalAmount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-neutral-500 font-bold">
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
