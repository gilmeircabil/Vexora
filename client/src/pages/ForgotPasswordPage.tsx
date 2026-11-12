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
    <div className="min-h-screen bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] relative overflow-x-hidden flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-md w-full mx-auto relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-xs font-semibold text-[var(--theme-dirty-white)] shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back to Sign In</span>
          </Link>
          <Link to="/" aria-label="VexoraMods Home">
            <BrandLogo size="sm" />
          </Link>
        </div>

        <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-7 sm:p-9 shadow-xl text-[var(--theme-dirty-white)]">
          {newRecoveryCode ? (
            /* Successful Recovery View with Rotated Code */
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                  <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--theme-dirty-white)]">Password Reset Successful!</h2>
                  <p className="text-xs font-normal text-[var(--theme-gray-muted)]">
                    Your password has been updated.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <p className="text-xs font-normal text-amber-300 leading-relaxed">
                  Your old recovery code has been rotated and expired. Please save your{' '}
                  <strong className="text-white">New Recovery Code</strong> below for future recovery.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-medium uppercase text-[var(--theme-gray-muted)]">
                  Your New Recovery Code:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newRecoveryCode}
                    className="flex-1 px-4 py-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-xs sm:text-sm font-bold tracking-wider text-[var(--theme-dirty-white)] select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-4 py-3 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] rounded-xl font-semibold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                    <>
                      <Copy className="w-4 h-4 stroke-[2]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3.5 px-4 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] rounded-xl text-[var(--theme-canvas)] font-semibold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        ) : (
            /* Recovery Form */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-lg text-[10px] font-mono font-semibold text-[var(--theme-dirty-white)] mb-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>EMERGENCY ACCOUNT RECOVERY</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-100">Recover Your Account</h1>
                <p className="text-xs font-normal text-slate-400 mt-1">
                  Enter your username and the recovery code you saved during registration.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-400 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 stroke-[2]" />
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
                    className="block font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1.5"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 stroke-[2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="recover-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your account username"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-xs font-medium text-[var(--theme-dirty-white)] placeholder:[var(--theme-gray-dim)] focus:border-[var(--theme-dirty-white)] focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Recovery Code */}
                <div>
                  <label
                    htmlFor="recover-code"
                    className="block font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1.5"
                  >
                    Recovery Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 stroke-[2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="recover-code"
                      type="text"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      placeholder="VEX-XXXX-XXXX-XXXX-XXXX"
                      autoComplete="off"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] font-mono text-xs font-medium text-[var(--theme-dirty-white)] placeholder:[var(--theme-gray-dim)] focus:border-[var(--theme-dirty-white)] focus:outline-none transition-all tracking-wider"
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="recover-password"
                    className="block font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 stroke-[2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="recover-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-xs font-medium text-[var(--theme-dirty-white)] placeholder:[var(--theme-gray-dim)] focus:border-[var(--theme-dirty-white)] focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    htmlFor="recover-confirm-password"
                    className="block font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 stroke-[2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="recover-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-xs font-medium text-[var(--theme-dirty-white)] placeholder:[var(--theme-gray-dim)] focus:border-[var(--theme-dirty-white)] focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>
                </div>

                <TurnstileWidget
                  action="forgot-password"
                  onVerify={setTurnstileToken}
                  resetKey={turnstileResetKey}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-[var(--theme-canvas)] font-bold text-xs shadow-sm active:translate-y-0.5 flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2]" />
                  ) : (
                    <>
                      <span>Reset Password &amp; Recover Account</span>
                      <ArrowRight className="w-4 h-4 stroke-[2]" />
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
