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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 transition-colors shadow-2xs"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
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
      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{planLabel}</span>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isOutOfCredits
                ? 'bg-amber-100 text-amber-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}
          >
            {remaining} / {totalAllowance} Credits
          </span>
        </div>

        {isOutOfCredits ? (
          <div className="mt-2 text-xs text-amber-700">
            <p className="mb-2">
              You've used all your AI credits. Upgrade your plan to continue generating.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-1 w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs shadow-xs"
            >
              <span>Upgrade Plan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <p className="text-[11px] text-neutral-500">
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
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
          isOutOfCredits
            ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
            : 'bg-white text-neutral-700 border-neutral-200/90 hover:border-indigo-300 shadow-2xs'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${isOutOfCredits ? 'bg-amber-500' : 'bg-emerald-500'}`}
        />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{planLabel}</span>
          <span className="text-neutral-400">•</span>
          <span className="font-mono font-bold">
            {remaining} / {totalAllowance}
          </span>
          <span className="text-neutral-500 hidden lg:inline">Credits</span>
        </div>
        {isOutOfCredits && <Zap className="w-3.5 h-3.5 text-amber-600" />}
      </Link>

      {/* Hover Dropdown / Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 mt-2 w-64 p-3 bg-white rounded-xl shadow-lg border border-neutral-200 text-xs z-50">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-100">
            <span className="font-semibold text-neutral-800">
              AI Generation Balance
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
              {plan}
            </span>
          </div>

          <div className="space-y-1.5 text-neutral-600">
            <div className="flex justify-between">
              <span>Available Credits:</span>
              <span className="font-mono font-bold text-neutral-800">
                {remaining}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>{isFree ? 'Daily Limit:' : 'Monthly Limit:'}</span>
              <span className="font-mono">{totalAllowance}</span>
            </div>
            {isFree && (
              <div className="text-[11px] text-neutral-400 mt-1">
                Resets daily at 00:00 UTC
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
            <Link
              to="/pricing"
              className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
            >
              <span>{isOutOfCredits ? 'Upgrade Now' : 'View Plans'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link to="/dashboard" className="text-neutral-400 hover:text-neutral-600">
              History
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
