import React, { useState } from 'react';
import { Link } from 'react-router';
import { Sparkles, Zap, AlertCircle, ArrowUpRight } from 'lucide-react';
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors"
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
      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-750">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{planLabel}</span>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isOutOfCredits
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
            }`}
          >
            {remaining} / {totalAllowance} Credits
          </span>
        </div>

        {isOutOfCredits ? (
          <div className="mt-2 text-xs text-amber-700 dark:text-amber-400">
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
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
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
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
            : 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:border-indigo-300 dark:hover:border-indigo-600'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${isOutOfCredits ? 'bg-amber-500' : 'bg-emerald-500'}`}
        />
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{planLabel}</span>
          <span className="text-neutral-400 dark:text-neutral-500">•</span>
          <span className="font-mono font-bold">
            {remaining} / {totalAllowance}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400 hidden lg:inline">Credits</span>
        </div>
        {isOutOfCredits && <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
      </Link>

      {/* Hover Dropdown / Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 mt-2 w-64 p-3 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 text-xs z-50">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              AI Generation Balance
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
              {plan}
            </span>
          </div>

          <div className="space-y-1.5 text-neutral-600 dark:text-neutral-300">
            <div className="flex justify-between">
              <span>Available Credits:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {remaining}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>{isFree ? 'Daily Limit:' : 'Monthly Limit:'}</span>
              <span className="font-mono">{totalAllowance}</span>
            </div>
            {isFree && (
              <div className="text-[11px] text-neutral-400 mt-1">
                Resets every day at 00:00 UTC.
              </div>
            )}
          </div>

          {isOutOfCredits ? (
            <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>You've used all your AI credits for today.</span>
              </div>
              <Link
                to="/pricing"
                className="flex items-center justify-center gap-1 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-xs"
              >
                <span>Upgrade Plan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between">
              <Link
                to="/dashboard"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                View Dashboard
              </Link>
              <Link
                to="/pricing"
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                Upgrade
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
