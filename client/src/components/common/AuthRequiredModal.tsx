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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      aria-describedby="auth-modal-desc"
    >
      <div className="bg-[#FAF7F2] border-3 border-black rounded-3xl p-8 max-w-sm sm:max-w-md w-full shadow-[8px_8px_0px_#000000] text-center space-y-5 relative">
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl border-2 border-black bg-[#FACC15] flex items-center justify-center mx-auto shadow-[4px_4px_0px_#000000]">
          <Lock className="w-8 h-8 text-black stroke-[2.5]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2
            id="auth-modal-title"
            className="text-2xl sm:text-3xl font-black text-black tracking-tight"
          >
            You Need to Login to Proceed
          </h2>
          <p
            id="auth-modal-desc"
            className="text-xs sm:text-sm font-semibold text-neutral-700 leading-relaxed"
          >
            Access to {pageTitle} is reserved for members. Please sign in or create a 100% free
            account to continue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2.5">
          <Link
            to={`/login${redirectQuery}`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FACC15] hover:bg-yellow-400 border-2 border-black text-black font-black text-sm shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <LogIn className="w-4 h-4 stroke-[2.5]" />
            <span>Sign In to Proceed</span>
          </Link>

          <Link
            to={`/register${redirectQuery}`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4ADE80] hover:bg-emerald-400 border-2 border-black text-black font-black text-sm shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Free Account</span>
          </Link>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-black text-neutral-600 hover:text-black hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
