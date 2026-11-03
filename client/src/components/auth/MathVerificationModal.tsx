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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="math-modal-title"
    >
      <div className="bg-[#FAF7F2] border-3 sm:border-4 border-black rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-[8px_8px_0px_#000000] relative space-y-4 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close verification modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FACC15] border border-black text-[10px] font-mono font-black uppercase shadow-[1px_1px_0px_#000]">
            <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
            <span>Anti-Bot Verification</span>
          </div>
          <h3 id="math-modal-title" className="text-xl sm:text-2xl font-black text-black">
            Verify You&apos;re Human
          </h3>
          <p className="text-xs font-bold text-neutral-600">
            Before creating your account, solve these 3 quick math problems to prove you are a
            human!
          </p>
        </div>

        {/* Error notice if registration failed */}
        {error && (
          <div className="p-3 bg-red-100 border-2 border-red-600 rounded-xl text-xs font-bold text-red-800">
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
            className={`w-full py-3.5 px-4 rounded-xl border-2 border-black font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isVerified && !isLoading
                ? 'bg-[#4ADE80] hover:bg-emerald-400 text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000]'
                : 'bg-neutral-200 text-neutral-500 border-black/30 cursor-not-allowed opacity-75'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>Creating Account...</span>
              </>
            ) : isVerified ? (
              <>
                <Award className="w-4 h-4 stroke-[2.5]" />
                <span>Verify &amp; Create Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
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
