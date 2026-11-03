import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock,
  User,
  Wrench,
  BookOpen,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { TurnstileWidget } from '../components/auth/TurnstileWidget.js';
import { FallingStarsBackground } from '../components/common/FallingStarsBackground.js';
import { BrandLogo } from '../components/common/BrandLogo.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setFormError('Please enter your username.');
      return;
    }

    if (!turnstileToken) {
      const msg = 'Please complete the security verification check.';
      setFormError(msg);
      showToast(msg, 'error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUsername,
          password,
          turnstileToken,
          website: websiteHoneypot,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        login(data.data.accessToken, data.data.user);
        showToast(`Welcome back, ${data.data.user.name || data.data.user.username}!`, 'success');
        navigate(redirect);
      } else {
        const errMsg = data.error || 'Invalid username or password.';
        setFormError(errMsg);
        showToast(errMsg, 'error');
        setTurnstileResetKey((prev) => prev + 1);
      }
    } catch {
      const errMsg = 'Network error during login.';
      setFormError(errMsg);
      showToast(errMsg, 'error');
      setTurnstileResetKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10">
      <FallingStarsBackground />

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
          {/* Left Column: Platform Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <Link to="/" className="inline-block" aria-label="VexoraMods Home">
              <BrandLogo size="lg" />
            </Link>

            <div className="space-y-3 max-w-xl">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black leading-[1.08]">
                Everything You Need. One Platform.
              </h1>
              <p className="text-sm sm:text-lg font-semibold text-neutral-700 leading-relaxed">
                Log in to VexoraMods to create visual designs in Studio, share knowledge in the
                Learning Hub, and access free browser and AI utilities.
              </p>
            </div>

            <div className="space-y-3 pt-2 max-w-lg">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4ADE80] border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                  <Wrench className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-black text-sm text-black">All Tools &amp; Built-In AI Utilities</h2>
                  <p className="text-xs font-semibold text-neutral-600">
                    Image, PDF, developer, and text utilities with zero paywalls.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#38BDF8] border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-black text-sm text-black">VexoraMods Studio Editor</h2>
                  <p className="text-xs font-semibold text-neutral-600">
                    Save multi-page designs, version history, and templates in the cloud.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#A78BFA] border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-black text-sm text-black">Learning Hub &amp; Community</h2>
                  <p className="text-xs font-semibold text-neutral-600">
                    Publish tutorials, study quizzes, and share feedback with fellow builders.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FACC15] border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-black text-sm text-black">Secure Simple Authentication</h2>
                  <p className="text-xs font-semibold text-neutral-600">
                    Username and password only. No tracking, spam emails, or third-party OAuth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border-2 border-black p-7 sm:p-9 shadow-[6px_6px_0px_#000000]">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-black">Welcome Back</h2>
                <p className="text-xs font-bold text-neutral-600 mt-1">
                  Enter your username and password to log in.
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
                  <label htmlFor="login-website">Website</label>
                  <input
                    id="login-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={websiteHoneypot}
                    onChange={(e) => setWebsiteHoneypot(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-username"
                    className="block font-black text-black text-xs uppercase tracking-wider mb-1.5"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-username"
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
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="font-black text-black text-xs uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-black text-black underline hover:text-neutral-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
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

                <TurnstileWidget onVerify={setTurnstileToken} resetKey={turnstileResetKey} />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-black font-black text-xs shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t-2 border-black/10 text-center text-xs font-bold text-neutral-600">
                Don't have an account yet?{' '}
                <Link
                  to={`/register?redirect=${redirect}`}
                  className="text-black font-black underline hover:text-neutral-700 ml-1"
                >
                  Create Your Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
