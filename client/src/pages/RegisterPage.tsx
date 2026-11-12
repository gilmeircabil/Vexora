import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertCircle,
  KeyRound,
  ArrowRight,
  School,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { TurnstileWidget } from '../components/auth/TurnstileWidget.js';
import { MathVerificationModal } from '../components/auth/MathVerificationModal.js';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons.js';
import { BrandLogo } from '../components/common/BrandLogo.js';

export const RegisterPage: React.FC = () => {
  const { user, login, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirect, { replace: true });
    }
  }, [user, authLoading, redirect, navigate]);

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [educationRole, setEducationRole] = useState<'student' | 'teacher'>('student');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [showMathModal, setShowMathModal] = useState(false);
  const [mathModalError, setMathModalError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Recovery Code Dialog State (shown once on registration)
  const [recoveryModalData, setRecoveryModalData] = useState<{
    recoveryCode: string;
    accessToken: string;
    user: any;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmedSaved, setConfirmedSaved] = useState(false);

  // Password requirement indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Username validation
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const isUsernameValid = usernameRegex.test(username.trim());

  const handleValidateForm = (): boolean => {
    setFormError(null);
    setMathModalError(null);

    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername) {
      setFormError('Please enter a username.');
      return false;
    }

    if (!isUsernameValid) {
      setFormError(
        'Username must be 3-20 characters long and contain only letters, numbers, or underscores.',
      );
      return false;
    }

    if (!hasMinLength) {
      setFormError('Password must be at least 8 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return false;
    }

    if (!turnstileToken) {
      const msg = 'Please complete the security verification challenge.';
      setFormError(msg);
      showToast(msg, 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidateForm()) return;
    // Activate Human Brain Check modal before creating the account!
    setShowMathModal(true);
  };

  const executeRegistration = async () => {
    const trimmedUsername = username.trim().toLowerCase();
    setIsLoading(true);
    setMathModalError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: trimmedUsername,
          name: name.trim() || trimmedUsername,
          password,
          confirmPassword,
          educationRole,
          turnstileToken,
          website: websiteHoneypot,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowMathModal(false);
        showToast('Account created successfully!', 'success');
        // Present the recovery code modal to the user
        setRecoveryModalData({
          recoveryCode: data.data.recoveryCode,
          accessToken: data.data.accessToken,
          user: data.data.user,
        });
      } else {
        const errMsg = data.error || 'Registration failed.';
        setFormError(errMsg);
        setMathModalError(errMsg);
        showToast(errMsg, 'error');
        setTurnstileResetKey((prev) => prev + 1);
      }
    } catch {
      const errMsg = 'Network error during registration.';
      setFormError(errMsg);
      setMathModalError(errMsg);
      showToast(errMsg, 'error');
      setTurnstileResetKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!recoveryModalData) return;
    try {
      await navigator.clipboard.writeText(recoveryModalData.recoveryCode);
      setCopiedCode(true);
      showToast('Recovery code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      showToast('Could not copy automatically. Please copy the code manually.', 'error');
    }
  };

  const handleFinishRegistration = () => {
    if (!recoveryModalData) return;
    login(recoveryModalData.accessToken, recoveryModalData.user);
    const isTeacher =
      recoveryModalData.user?.educationRole === 'teacher' ||
      recoveryModalData.user?.educationRole === 'educator';
    let target = redirect;
    if (isTeacher && (redirect === '/study' || redirect === '/study-space')) {
      target = '/study?workspace=teacher';
    }
    navigate(target);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-canvas)] text-[var(--theme-dirty-white)] relative overflow-x-hidden flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10">
      {/* Human Brain Check Verification Modal */}
      <MathVerificationModal
        isOpen={showMathModal}
        onClose={() => setShowMathModal(false)}
        onConfirm={executeRegistration}
        isLoading={isLoading}
        error={mathModalError}
      />

      {/* Recovery Code Security Modal */}
      {recoveryModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-[var(--theme-dirty-white)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center text-[var(--theme-dirty-white)] shrink-0 shadow-sm">
                <KeyRound className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--theme-dirty-white)]">Save Your Recovery Code</h3>
                <p className="text-xs font-normal text-[var(--theme-gray-muted)]">
                  This code is displayed once and will never be shown again.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <p className="text-xs font-normal text-amber-300 leading-relaxed">
                Because VexoraMods does not use emails, this{' '}
                <strong className="text-white">Emergency Recovery Code</strong> is the <em>only</em> way to recover your
                account if you forget your password.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-medium uppercase text-[var(--theme-gray-muted)]">
                Your Single-Use Recovery Code:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={recoveryModalData.recoveryCode}
                  className="flex-1 px-4 py-3 bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-xl font-mono text-sm sm:text-base font-bold tracking-wider text-[var(--theme-dirty-white)] select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-3 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] rounded-xl font-semibold text-xs text-[var(--theme-canvas)] shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
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

            <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-[var(--theme-surface-raised)] rounded-xl border border-[var(--theme-gray-border)] hover:border-[var(--theme-gray-subtle)]">
              <input
                type="checkbox"
                checked={confirmedSaved}
                onChange={(e) => setConfirmedSaved(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[var(--theme-gray-border)] bg-[var(--theme-surface)]"
              />
              <span className="text-xs font-normal text-[var(--theme-gray-muted)] select-none">
                I have written down or safely stored my recovery code in a secure location.
              </span>
            </label>

            <button
              type="button"
              disabled={!confirmedSaved}
              onClick={handleFinishRegistration}
              className="w-full py-3.5 px-4 bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] disabled:opacity-40 rounded-xl text-[var(--theme-canvas)] font-semibold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Continue to VexoraMods</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full mx-auto relative z-10 space-y-6">
        <div>
          <Link
            to="/"
            aria-label="Back to Homepage"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] text-xs font-semibold text-[var(--theme-dirty-white)] shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <Link to="/" className="inline-block" aria-label="VexoraMods Home">
              <BrandLogo size="lg" />
            </Link>

            <div className="space-y-3 max-w-xl">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--theme-dirty-white)] leading-[1.08]">
                Create Your Account. Start Building.
              </h1>
              <p className="text-sm sm:text-lg font-normal text-[var(--theme-gray-muted)] leading-relaxed">
                Join VexoraMods in seconds. Pick a username and password to create studio graphics,
                save quiz sets, and publish tutorials.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] space-y-2 max-w-lg">
              <div className="flex items-center gap-2 font-bold text-[var(--theme-dirty-white)] text-sm">
                <ShieldCheck className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2]" />
                <span>Zero Email Hassle &amp; Privacy First</span>
              </div>
              <p className="text-xs font-normal text-[var(--theme-gray-muted)] leading-relaxed">
                No email verification links, no promotional emails, and no tracking cookies. You
                control your username and secure recovery code.
              </p>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-gray-border)] p-7 sm:p-9 shadow-xl text-[var(--theme-dirty-white)]">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[var(--theme-dirty-white)]">Create Your Account</h2>
                <p className="text-xs font-normal text-[var(--theme-gray-muted)] mt-1">
                  Choose a unique username and strong password.
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
                  <label htmlFor="reg-website">Website</label>
                  <input
                    id="reg-website"
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
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="reg-username"
                      className="font-black text-black text-xs uppercase tracking-wider"
                    >
                      Username
                    </label>
                    <span className="text-[10px] font-mono font-medium text-slate-400">
                      3-20 chars (a-z, 0-9, _)
                    </span>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 stroke-[2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. gilmier_dev"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-xs font-medium text-[var(--theme-dirty-white)] placeholder:[var(--theme-gray-dim)] focus:border-[var(--theme-dirty-white)] focus:outline-none transition-all"
                      required
                    />
                  </div>
                  {username.length > 0 && !isUsernameValid && (
                    <p className="text-[11px] font-medium text-rose-400 mt-1">
                      Must be 3-20 characters: letters, numbers, and underscores only.
                    </p>
                  )}
                </div>

                {/* Display Name (Optional) */}
                <div>
                  <label
                    htmlFor="reg-name"
                    className="block font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1.5"
                  >
                    Display Name{' '}
                    <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Public Name or Handle"
                    autoComplete="name"
                    className="w-full px-3.5 py-3 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-xs font-medium text-[var(--theme-dirty-white)] placeholder:[var(--theme-gray-dim)] focus:border-[var(--theme-dirty-white)] focus:outline-none transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="reg-password"
                    className="block font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 stroke-[2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-password"
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

                {/* Password Requirements Badges */}
                {password.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-bold">
                    <span
                      className={`flex items-center gap-1 ${hasMinLength ? 'text-green-700' : 'text-neutral-500'}`}
                    >
                      {hasMinLength ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      8+ characters
                    </span>
                    <span
                      className={`flex items-center gap-1 ${hasUppercase ? 'text-green-700' : 'text-neutral-500'}`}
                    >
                      {hasUppercase ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      Uppercase letter
                    </span>
                    <span
                      className={`flex items-center gap-1 ${hasLowercase ? 'text-green-700' : 'text-neutral-500'}`}
                    >
                      {hasLowercase ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      Lowercase letter
                    </span>
                    <span
                      className={`flex items-center gap-1 ${hasNumber ? 'text-green-700' : 'text-neutral-500'}`}
                    >
                      {hasNumber ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      Number (0-9)
                    </span>
                  </div>
                )}

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="reg-confirm-password"
                    className="block font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 stroke-[2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface-raised)] text-xs font-medium text-[var(--theme-dirty-white)] placeholder:[var(--theme-gray-dim)] focus:border-[var(--theme-dirty-white)] focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-[11px] font-medium text-rose-400 mt-1">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                {/* Study Space Role Selection */}
                <div>
                  <label className="block font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1.5">
                    Study Space Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEducationRole('student')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                        educationRole === 'student'
                          ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-sm'
                          : 'bg-[var(--theme-surface-raised)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface)]'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEducationRole('teacher')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                        educationRole === 'teacher'
                          ? 'bg-[var(--theme-dirty-white)] text-[var(--theme-canvas)] border-[var(--theme-dirty-white)] shadow-sm'
                          : 'bg-[var(--theme-surface-raised)] text-[var(--theme-gray-muted)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface)]'
                      }`}
                    >
                      <School className="w-3.5 h-3.5" />
                      <span>Teacher</span>
                    </button>
                  </div>
                </div>

                {/* Security & Bot Protection Notice */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[var(--theme-gray-muted)] text-xs font-medium">
                  <div className="w-6 h-6 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] text-[var(--theme-dirty-white)] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <span>
                    Protected by <strong>Human Verification Check</strong> &amp; Turnstile security verification.
                  </span>
                </div>

                <TurnstileWidget
                  action="register"
                  onVerify={setTurnstileToken}
                  resetKey={turnstileResetKey}
                />

                <button
                  type="submit"
                  disabled={
                    isLoading || !isUsernameValid || (password.length > 0 && !passwordsMatch)
                  }
                  className="w-full py-3.5 px-4 rounded-full bg-[var(--theme-dirty-white)] hover:bg-[var(--theme-dirty-white-muted)] text-[var(--theme-canvas)] font-bold text-xs shadow-sm active:translate-y-0.5 flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2]" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 stroke-[2]" />
                    </>
                  )}
                </button>

                <p className="text-[11px] font-normal text-[var(--theme-gray-muted)] text-center leading-relaxed mt-2.5">
                  By creating an account, you agree to our{' '}
                  <Link
                    to="/terms"
                    className="text-[var(--theme-dirty-white)] font-medium underline hover:text-[var(--theme-dirty-white-muted)]"
                  >
                    Terms of Use
                  </Link>{' '}
                  and acknowledge our{' '}
                  <Link
                    to="/privacy"
                    className="text-[var(--theme-dirty-white)] font-medium underline hover:text-[var(--theme-dirty-white-muted)]"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>

              <SocialAuthButtons mode="register" />

              <div className="mt-6 pt-5 border-t border-[var(--theme-gray-border)] text-center text-xs font-normal text-[var(--theme-gray-muted)]">
                Already have an account?{' '}
                <Link
                  to={`/login?redirect=${redirect}`}
                  className="text-[var(--theme-dirty-white)] font-semibold underline hover:text-[var(--theme-dirty-white-muted)] ml-1"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
