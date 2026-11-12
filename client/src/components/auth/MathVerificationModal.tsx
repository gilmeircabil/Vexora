import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Loader2, Award } from 'lucide-react';
import { MathVerificationChallenge } from './MathVerificationChallenge.js';

interface MathVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const MathVerificationModal: React.FC<MathVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  error = null,
}) => {
  const [isVerified, setIsVerified] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="math-modal-title"
    >
      <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl relative space-y-4 text-[var(--theme-dirty-white)] animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close verification modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[10px] font-mono font-semibold text-[var(--theme-dirty-white)] uppercase">
            <ShieldCheck className="w-3 h-3 stroke-[2]" />
            <span>Anti-Bot Verification</span>
          </div>
          <h3 id="math-modal-title" className="text-xl sm:text-2xl font-bold text-[var(--theme-dirty-white)]">
            Verify You&apos;re Human
          </h3>
          <p className="text-xs font-normal text-[var(--theme-gray-muted)]">
            Before creating your account, solve these 3 quick math problems to prove you are a
            human.
          </p>
        </div>

        {/* Error notice if registration failed */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs font-medium text-red-300">
            {error}
          </div>
        )}

        {/* Math Verification Card */}
        <MathVerificationChallenge onVerified={setIsVerified} />

        {/* Confirm Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!isVerified || isLoading}
            onClick={onConfirm}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isVerified && !isLoading
                ? 'bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] active:translate-y-0.5'
                : 'bg-[var(--theme-surface-raised)] text-[var(--theme-gray-muted)] border border-[var(--theme-gray-border)] cursor-not-allowed opacity-60'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[2]" />
                <span>Creating Account...</span>
              </>
            ) : isVerified ? (
              <>
                <Award className="w-4 h-4 stroke-[2]" />
                <span>Verify &amp; Create Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </>
            ) : (
              <span>Solve all 3 math problems to proceed</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
