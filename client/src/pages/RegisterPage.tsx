import React, { useState } from 'react';
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
import { FallingStarsBackground } from '../components/common/FallingStarsBackground.js';
import { BrandLogo } from '../components/common/BrandLogo.js';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

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
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10">
      <FallingStarsBackground />

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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_#000000] space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FACC15] border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_#000]">
                <KeyRound className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-black">Save Your Recovery Code</h3>
                <p className="text-xs font-bold text-neutral-600">
                  This code is displayed once and will never be shown again.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-black space-y-2">
              <p className="text-xs font-bold text-black leading-relaxed">
                Because VexoraMods does not use emails, this <strong>Emergency Recovery Code</strong> is the <em>only</em> way to recover your account if you forget your password.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono font-black uppercase text-neutral-600">
                Your Single-Use Recovery Code:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={recoveryModalData.recoveryCode}
                  className="flex-1 px-4 py-3 bg-[#FAF7F2] border-2 border-black rounded-xl font-mono text-sm sm:text-base font-black tracking-wider text-black select-all"
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

            <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-neutral-50 rounded-xl border-2 border-black/20 hover:border-black">
              <input
                type="checkbox"
                checked={confirmedSaved}
                onChange={(e) => setConfirmedSaved(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-black rounded"
              />
              <span className="text-xs font-bold text-black select-none">
                I have written down or safely stored my recovery code in a secure location.
              </span>
            </label>

            <button
              type="button"
              disabled={!confirmedSaved}
              onClick={handleFinishRegistration}
              className="w-full py-3.5 px-4 bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-40 disabled:hover:bg-[#22C55E] border-2 border-black rounded-xl text-white font-black text-xs shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Continue to VexoraMods</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full mx-auto relative z-10 space-y-6">
        <div>
          <Link
            to="/"
            aria-label="Back to Homepage"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000000] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
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
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black leading-[1.08]">
                Create Your Account. Start Building.
              </h1>
              <p className="text-sm sm:text-lg font-semibold text-neutral-700 leading-relaxed">
                Join VexoraMods in seconds. Pick a username and password to create studio graphics, save quiz sets, and publish tutorials.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] space-y-2 max-w-lg">
              <div className="flex items-center gap-2 font-black text-black text-sm">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Zero Email Hassle &amp; Privacy First</span>
              </div>
              <p className="text-xs font-bold text-neutral-800 leading-relaxed">
                No email verification links, no promotional emails, and no tracking cookies. You control your username and secure recovery code.
              </p>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border-2 border-black p-7 sm:p-9 shadow-[6px_6px_0px_#000000]">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-black">Create Your Account</h2>
                <p className="text-xs font-bold text-neutral-600 mt-1">
                  Choose a unique username and strong password.
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
                    <span className="text-[10px] font-mono font-bold text-neutral-500">
                      3-20 chars (a-z, 0-9, _)
                    </span>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. gilmier_dev"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
                      required
                    />
                  </div>
                  {username.length > 0 && !isUsernameValid && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">
                      Must be 3-20 characters: letters, numbers, and underscores only.
                    </p>
                  )}
                </div>

                {/* Display Name (Optional) */}
                <div>
                  <label
                    htmlFor="reg-name"
                    className="block font-black text-black text-xs uppercase tracking-wider mb-1.5"
                  >
                    Display Name <span className="text-neutral-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Public Name or Handle"
                    autoComplete="name"
                    className="w-full px-3.5 py-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="reg-password"
                    className="block font-black text-black text-xs uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-password"
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

                {/* Password Requirements Badges */}
                {password.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-bold">
                    <span className={`flex items-center gap-1 ${hasMinLength ? 'text-green-700' : 'text-neutral-500'}`}>
                      {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-neutral-400" />}
                      8+ characters
                    </span>
                    <span className={`flex items-center gap-1 ${hasUppercase ? 'text-green-700' : 'text-neutral-500'}`}>
                      {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-neutral-400" />}
                      Uppercase letter
                    </span>
                    <span className={`flex items-center gap-1 ${hasLowercase ? 'text-green-700' : 'text-neutral-500'}`}>
                      {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-neutral-400" />}
                      Lowercase letter
                    </span>
                    <span className={`flex items-center gap-1 ${hasNumber ? 'text-green-700' : 'text-neutral-500'}`}>
                      {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-neutral-400" />}
                      Number (0-9)
                    </span>
                  </div>
                )}

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="reg-confirm-password"
                    className="block font-black text-black text-xs uppercase tracking-wider mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-[11px] font-bold text-red-600 mt-1">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                {/* Study Space Role Selection */}
                <div>
                  <label className="block font-black text-black text-xs uppercase tracking-wider mb-1.5">
                    Study Space Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEducationRole('student')}
                      className={`p-2.5 rounded-xl border-2 border-black flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                        educationRole === 'student'
                          ? 'bg-[#FFD21A] text-black shadow-[2px_2px_0px_#000]'
                          : 'bg-white text-neutral-600 hover:bg-neutral-50 shadow-[1px_1px_0px_#000]'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEducationRole('teacher')}
                      className={`p-2.5 rounded-xl border-2 border-black flex items-center justify-center gap-2 text-xs font-black transition-all cursor-pointer ${
                        educationRole === 'teacher'
                          ? 'bg-[#FFD21A] text-black shadow-[2px_2px_0px_#000]'
                          : 'bg-white text-neutral-600 hover:bg-neutral-50 shadow-[1px_1px_0px_#000]'
                      }`}
                    >
                      <School className="w-3.5 h-3.5" />
                      <span>Teacher</span>
                    </button>
                  </div>
                </div>

                {/* Security & Bot Protection Notice */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/70 border-2 border-black text-black text-xs font-bold shadow-[2px_2px_0px_#000]">
                  <div className="w-6 h-6 rounded-lg bg-[#FACC15] border border-black flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>
                    Protected by <strong>Human Brain Check</strong> &amp; Turnstile bot verification.
                  </span>
                </div>

                <TurnstileWidget onVerify={setTurnstileToken} resetKey={turnstileResetKey} />

                <button
                  type="submit"
                  disabled={isLoading || !isUsernameValid || (password.length > 0 && !passwordsMatch)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-black font-black text-xs shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t-2 border-black/10 text-center text-xs font-bold text-neutral-600">
                Already have an account?{' '}
                <Link
                  to={`/login?redirect=${redirect}`}
                  className="text-black font-black underline hover:text-neutral-700 ml-1"
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
