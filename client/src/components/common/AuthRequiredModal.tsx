import React from 'react';
import { Link, useLocation } from 'react-router';
import { Lock, ArrowLeft, LogIn, UserPlus } from 'lucide-react';

interface AuthRequiredModalProps {
  pageTitle?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  pageTitle = 'This Page',
}) => {
  const location = useLocation();
  const redirectQuery = `?redirect=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-desc"
    >
      <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl p-8 max-w-sm sm:max-w-md w-full shadow-2xl text-center space-y-5 relative text-[var(--theme-dirty-white)]">
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8 text-[var(--theme-dirty-white)] stroke-[2]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2
            id="auth-modal-title"
            className="text-2xl sm:text-3xl font-bold text-[var(--theme-dirty-white)] tracking-tight"
          >
            Sign In Required
          </h2>
          <p
            id="auth-modal-desc"
            className="text-xs sm:text-sm font-normal text-[var(--theme-gray-muted)] leading-relaxed"
          >
            Access to {pageTitle} is reserved for members. Please sign in or create a 100% free
            account to continue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2.5">
          <Link
            to={`/login${redirectQuery}`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-[var(--theme-canvas)] font-bold text-sm shadow-sm active:translate-y-0.5 transition-all"
          >
            <LogIn className="w-4 h-4 stroke-[2]" />
            <span>Sign In to Proceed</span>
          </Link>

          <Link
            to={`/register${redirectQuery}`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] font-semibold text-sm shadow-sm active:translate-y-0.5 transition-all"
          >
            <UserPlus className="w-4 h-4 stroke-[2]" />
            <span>Create Free Account</span>
          </Link>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
