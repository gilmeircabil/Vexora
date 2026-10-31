import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Trophy,
  Heart,
  Calendar,
  Users,
  Coins,
  Medal,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { donationApi } from '../../services/donationApi.js';

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all-time' | 'monthly' | 'recent'>('all-time');
  const [summary, setSummary] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<{
    allTime: any[];
    monthly: any[];
    recent: any[];
    calendarMonth: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, leadRes] = await Promise.all([
        donationApi.getSummary(),
        donationApi.getLeaderboard(30),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (leadRes.success) setLeaderboard(leadRes.data);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FACC15] border-2 border-black font-mono text-xs font-black shadow-[2px_2px_0px_#000] mb-2 rounded-lg">
              <Trophy className="w-3.5 h-3.5 text-black" />
              <span>COMMUNITY LEADERBOARD</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              VexoraMods Supporters Hall of Fame
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1 max-w-xl">
              Voluntary contributions verified directly by server webhooks. Thank you to everyone who keeps VexoraMods free for the world!
            </p>
          </div>

          <Link
            to="/support"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl font-mono text-xs font-black text-black shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 transition-all self-start sm:self-auto shrink-0"
          >
            <Heart className="w-4 h-4 text-red-600 fill-red-500" />
            <span>Support VexoraMods</span>
          </Link>
        </div>

        {/* Public Statistics Deck */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
            <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-black" />
              <span>Total Raised</span>
            </div>
            <div className="text-2xl font-black text-black mt-1">
              ₱{summary ? Number(summary.totalAmount).toLocaleString() : '0'}
            </div>
            <div className="text-[10px] font-mono text-neutral-500 mt-1">All-time PHP contributions</div>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
            <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-black" />
              <span>This Month</span>
            </div>
            <div className="text-2xl font-black text-black mt-1">
              ₱{summary ? Number(summary.monthAmount).toLocaleString() : '0'}
            </div>
            <div className="text-[10px] font-mono text-neutral-500 mt-1">
              {summary?.currentMonth || 'Current Month'}
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
            <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase flex items-center gap-1.5">
              <Medal className="w-3.5 h-3.5 text-black" />
              <span>Donations</span>
            </div>
            <div className="text-2xl font-black text-black mt-1">
              {summary ? Number(summary.totalDonations).toLocaleString() : '0'}
            </div>
            <div className="text-[10px] font-mono text-neutral-500 mt-1">Successful transactions</div>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
            <div className="text-[11px] font-mono font-bold text-neutral-500 uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-black" />
              <span>Supporters</span>
            </div>
            <div className="text-2xl font-black text-black mt-1">
              {summary ? Number(summary.uniqueSupporters).toLocaleString() : '0'}
            </div>
            <div className="text-[10px] font-mono text-neutral-500 mt-1">Unique public identities</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b-2 border-black gap-2">
          <button
            onClick={() => setActiveTab('all-time')}
            className={`px-4 py-2.5 border-2 border-b-0 border-black rounded-t-xl font-mono text-xs font-black transition-all ${
              activeTab === 'all-time'
                ? 'bg-[#FACC15] -mb-[2px] shadow-[2px_-2px_0px_#000]'
                : 'bg-white hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            🏆 All-Time Top Supporters
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2.5 border-2 border-b-0 border-black rounded-t-xl font-mono text-xs font-black transition-all ${
              activeTab === 'monthly'
                ? 'bg-[#FACC15] -mb-[2px] shadow-[2px_-2px_0px_#000]'
                : 'bg-white hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            📅 Monthly ({leaderboard?.calendarMonth || 'Current Month'})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2.5 border-2 border-b-0 border-black rounded-t-xl font-mono text-xs font-black transition-all ${
              activeTab === 'recent'
                ? 'bg-[#FACC15] -mb-[2px] shadow-[2px_-2px_0px_#000]'
                : 'bg-white hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            ⚡ Recent Activity
          </button>
        </div>

        {/* Leaderboard Table / Feed Container */}
        <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs font-bold">Verifying leaderboard records...</span>
            </div>
          ) : activeTab === 'recent' ? (
            /* Recent Feed */
            <div className="divide-y-2 divide-black/10">
              {leaderboard?.recent && leaderboard.recent.length > 0 ? (
                leaderboard.recent.map((entry, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border-2 border-black flex items-center justify-center font-black text-sm">
                        {entry.isAnonymous ? '👤' : '❤️'}
                      </div>
                      <div className="space-y-1">
                        <div className="font-black text-sm text-black flex items-center gap-2">
                          <span>{entry.displayName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-100 text-green-900 border border-green-800">
                            Verified
                          </span>
                        </div>
                        {entry.message && (
                          <p className="text-xs font-medium text-neutral-700 italic bg-[#FAF7F2] p-2 rounded-lg border border-black/10">
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
                <div className="p-12 text-center text-xs font-mono text-neutral-500">
                  No recent donations recorded yet. Be the first to support VexoraMods!
                </div>
              )}
            </div>
          ) : (
            /* All-Time & Monthly Ranking Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b-2 border-black bg-[#FAF7F2] text-black font-black uppercase">
                    <th className="py-3 px-4 w-16">Rank</th>
                    <th className="py-3 px-4">Donor Identity</th>
                    <th className="py-3 px-4 text-center">Donations</th>
                    <th className="py-3 px-4 text-right">Total Contributed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {((activeTab === 'all-time' ? leaderboard?.allTime : leaderboard?.monthly) || []).length > 0 ? (
                    ((activeTab === 'all-time' ? leaderboard?.allTime : leaderboard?.monthly) || []).map(
                      (row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold flex items-center">
                            {getRankBadge(idx)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-black text-sm text-black flex items-center gap-2">
                              <span>{row.displayName}</span>
                              {row.isAnonymous && (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-black/20">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-500">
                              Last supported:{' '}
                              {row.latestVerifiedAt
                                ? new Date(row.latestVerifiedAt).toLocaleDateString()
                                : 'Recent'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-neutral-700">
                            {row.donationCount}×
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-sm text-black">
                            ₱{Number(row.totalAmount).toLocaleString()}
                          </td>
                        </tr>
                      ),
                    )
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
  );
};
