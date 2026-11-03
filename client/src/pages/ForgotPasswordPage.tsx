import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { FallingStarsBackground } from '../components/common/FallingStarsBackground.js';
import { BrandLogo } from '../components/common/BrandLogo.js';
import { useToast } from '../context/ToastContext.js';
import { TurnstileWidget } from '../components/auth/TurnstileWidget.js';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Success view state with rotated recovery code
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedUsername = username.trim().toLowerCase();
    const cleanRecoveryCode = recoveryCode.trim();

    if (!trimmedUsername) {
      setFormError('Please enter your account username.');
      return;
    }

    if (!cleanRecoveryCode) {
      setFormError('Please enter your emergency recovery code.');
      return;
    }

    if (password.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!turnstileToken) {
      const msg = 'Please complete the security verification challenge.';
      setFormError(msg);
      showToast(msg, 'error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/recover-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUsername,
          recoveryCode: cleanRecoveryCode,
          password,
          confirmPassword,
          turnstileToken,
          website: websiteHoneypot,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Password recovered successfully!', 'success');
        setNewRecoveryCode(data.data?.newRecoveryCode || null);
      } else {
        const errMsg = data.error || 'Invalid username or recovery code.';
        setFormError(errMsg);
        showToast(errMsg, 'error');
        setTurnstileResetKey((prev) => prev + 1);
      }
    } catch {
      const errMsg = 'Network error while attempting account recovery.';
      setFormError(errMsg);
      showToast(errMsg, 'error');
      setTurnstileResetKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!newRecoveryCode) return;
    try {
      await navigator.clipboard.writeText(newRecoveryCode);
      setCopiedCode(true);
      showToast('New recovery code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      showToast('Could not copy automatically. Please copy the code manually.', 'error');
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10">
      <FallingStarsBackground />

      <div className="max-w-md w-full mx-auto relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000000] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Sign In</span>
          </Link>
          <Link to="/" aria-label="VexoraMods Home">
            <BrandLogo size="sm" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border-2 border-black p-7 sm:p-9 shadow-[6px_6px_0px_#000000]">
          {newRecoveryCode ? (
            /* Successful Recovery View with Rotated Code */
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#4ADE80] border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black">Password Reset Successful!</h2>
                  <p className="text-xs font-bold text-neutral-600">
                    Your password has been updated.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-black space-y-2">
                <p className="text-xs font-bold text-black leading-relaxed">
                  Your old recovery code has been rotated and expired. Please save your{' '}
                  <strong>New Recovery Code</strong> below for future recovery.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-black uppercase text-neutral-600">
                  Your New Recovery Code:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newRecoveryCode}
                    className="flex-1 px-4 py-3 bg-[#FAF7F2] border-2 border-black rounded-xl font-mono text-xs sm:text-sm font-black tracking-wider text-black select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-4 py-3 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl font-black text-xs text-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 stroke-[2.5]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-4 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl text-black font-black text-xs shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            /* Recovery Form */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FACC15] border-2 border-black rounded-lg text-[10px] font-mono font-black mb-2 shadow-[2px_2px_0px_#000]">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>EMERGENCY ACCOUNT RECOVERY</span>
                </div>
                <h1 className="text-2xl font-black text-black">Recover Your Account</h1>
                <p className="text-xs font-bold text-neutral-600 mt-1">
                  Enter your username and the recovery code you saved during registration.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-xl bg-amber-50 border-2 border-black text-xs font-bold text-black flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Honeypot field */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="recover-website">Website</label>
                  <input
                    id="recover-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={websiteHoneypot}
                    onChange={(e) => setWebsiteHoneypot(e.target.value)}
                  />
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="recover-username"
                    className="block font-black text-black text-xs uppercase tracking-wider mb-1.5"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="recover-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your account username"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Recovery Code */}
                <div>
                  <label
                    htmlFor="recover-code"
                    className="block font-black text-black text-xs uppercase tracking-wider mb-1.5"
                  >
                    Recovery Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="recover-code"
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="VEX-XXXX-XXXX-XXXX-XXXX"
                      autoComplete="off"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-black bg-white font-mono text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all tracking-wider"
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="recover-password"
                    className="block font-black text-black text-xs uppercase tracking-wider mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="recover-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    htmlFor="recover-confirm-password"
                    className="block font-black text-black text-xs uppercase tracking-wider mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="recover-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                </div>

                <TurnstileWidget onVerify={setTurnstileToken} resetKey={turnstileResetKey} />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-black font-black text-xs shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  ) : (
                    <>
                      <span>Reset Password &amp; Recover Account</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
