import React, { useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Zap, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useCredits } from '../../context/CreditContext.js';

export const CreditIndicator: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const { user, isAuthenticated } = useAuth();
  const { balance } = useCredits();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link
        to="/pricing"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>3 Free AI Credits</span>
      </Link>
    );
  }

  const plan = user?.subscription?.plan || 'free';
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';

  const isFree = plan === 'free';
  const remaining = isFree
    ? (balance?.dailyRemaining ?? user?.credits?.dailyRemaining ?? 3)
    : (balance?.monthlyRemaining ?? user?.credits?.monthlyRemaining ?? 300);
  const totalAllowance = isFree
    ? (balance?.dailyAllowance ?? user?.credits?.dailyAllowance ?? 3)
    : (balance?.monthlyAllowance ?? user?.credits?.monthlyAllowance ?? 300);

  const isOutOfCredits = remaining <= 0;

  if (isMobile) {
    return (
      <div className="p-3 bg-white rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-black">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>{planLabel}</span>
          </div>
          <span
            className={`text-xs font-black px-2 py-0.5 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000000] ${
              isOutOfCredits ? 'bg-[#F472B6] text-black' : 'bg-[#4ADE80] text-black'
            }`}
          >
            {remaining} / {totalAllowance} Credits
          </span>
        </div>

        {isOutOfCredits ? (
          <div className="mt-2 text-xs text-neutral-800">
            <p className="mb-2 font-bold">
              You've used all your AI credits. Upgrade your plan to continue generating.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-1 w-full py-2 px-3 bg-[#FACC15] hover:bg-[#EAB308] text-black border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_#000000]"
            >
              <span>Upgrade Plan</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        ) : (
          <p className="text-[11px] font-semibold text-neutral-600">
            {isFree ? 'Resets daily at 00:00 UTC' : 'Refreshes every billing month'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link
        to={isOutOfCredits ? '/pricing' : '/dashboard'}
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black rounded-xl border-2 border-black transition-all ${
          isOutOfCredits
            ? 'bg-[#F472B6] text-black shadow-[2px_2px_0px_#000000] animate-pulse'
            : 'bg-white text-black shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5'
        }`}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full border border-black ${
            isOutOfCredits ? 'bg-red-500' : 'bg-[#4ADE80]'
          }`}
        />
        <div className="flex items-center gap-1.5">
          <span>{planLabel}</span>
          <span className="text-black/30">•</span>
          <span className="font-mono">
            {remaining}/{totalAllowance}
          </span>
        </div>
        {isOutOfCredits && <Zap className="w-3.5 h-3.5 text-black" />}
      </Link>

      {/* Hover Dropdown / Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 mt-2 w-64 p-4 bg-white rounded-2xl shadow-[5px_5px_0px_#000000] border-2 border-black text-xs z-50">
          <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-black/10">
            <span className="font-black text-black">AI Generation Balance</span>
            <span className="text-[10px] font-black uppercase tracking-wider font-mono px-1.5 py-0.5 bg-[#FACC15] border border-black rounded">
              {plan}
            </span>
          </div>

          <div className="space-y-1.5 text-neutral-800 font-semibold">
            <div className="flex justify-between">
              <span>Available Credits:</span>
              <span className="font-mono font-black text-black text-sm">{remaining}</span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-600">
              <span>{isFree ? 'Daily Allowance:' : 'Monthly Allowance:'}</span>
              <span className="font-mono font-bold">{totalAllowance}</span>
            </div>
            {isFree && (
              <div className="text-[11px] text-neutral-500 font-mono mt-1">
                Resets daily at 00:00 UTC
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t-2 border-black/10 flex items-center justify-between font-black">
            <Link
              to="/pricing"
              className="text-black hover:underline inline-flex items-center gap-1"
            >
              <span>{isOutOfCredits ? 'Upgrade Now' : 'View Plans'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
            <Link to="/dashboard" className="text-neutral-500 hover:text-black">
              History
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
