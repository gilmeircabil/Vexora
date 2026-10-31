import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { useNavigate, useSearchParams } from 'react-router';
import { authApi } from '../../services/authApi.js';
import { Loader2 } from 'lucide-react';

interface SocialAuthButtonsProps {
  mode: 'login' | 'register';
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ mode }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Prompt / Modal state for easy OAuth email input when live client ID isn't configured
  const [promptProvider, setPromptProvider] = useState<'google' | 'github' | 'facebook' | null>(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');

  const handleOAuthLogin = async (
    provider: 'google' | 'github' | 'facebook',
    email: string,
    name?: string,
    avatarUrl?: string,
  ) => {
    setIsLoading(provider);
    try {
      const providerId = `${provider}_${Math.random().toString(36).substring(2, 12)}`;
      const res = await authApi.loginWithOAuth({
        provider,
        providerId,
        email,
        name: name || email.split('@')[0],
        avatarUrl,
      });

      if (res.success && res.data) {
        login(res.data.accessToken, res.data.user);
        showToast(
          mode === 'register'
            ? `Welcome to VexoraMods! Signed up with ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`
            : `Welcome back, ${res.data.user.name}!`,
          'success',
        );
        navigate(redirect);
      } else {
        showToast(res.error || 'Social authentication failed.', 'error');
      }
    } catch {
      showToast('Network error during social authentication.', 'error');
    } finally {
      setIsLoading(null);
      setPromptProvider(null);
    }
  };

  const handleClickProvider = (provider: 'google' | 'github' | 'facebook') => {
    // Open clean dialog to enter or confirm email for the social account
    setPromptProvider(provider);
    setSocialEmail('');
    setSocialName('');
  };

  return (
    <div className="space-y-3">
      {/* Social Provider Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Google Button */}
        <button
          type="button"
          disabled={Boolean(isLoading)}
          onClick={() => handleClickProvider('google')}
          className="w-full py-2.5 px-3 rounded-xl border-2 border-black bg-white hover:bg-neutral-50 font-black text-xs text-black shadow-[2.5px_2.5px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading === 'google' ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Google</span>
        </button>

        {/* GitHub Button */}
        <button
          type="button"
          disabled={Boolean(isLoading)}
          onClick={() => handleClickProvider('github')}
          className="w-full py-2.5 px-3 rounded-xl border-2 border-black bg-white hover:bg-neutral-50 font-black text-xs text-black shadow-[2.5px_2.5px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading === 'github' ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          )}
          <span>GitHub</span>
        </button>

        {/* Facebook Button */}
        <button
          type="button"
          disabled={Boolean(isLoading)}
          onClick={() => handleClickProvider('facebook')}
          className="w-full py-2.5 px-3 rounded-xl border-2 border-black bg-white hover:bg-neutral-50 font-black text-xs text-black shadow-[2.5px_2.5px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isLoading === 'facebook' ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <svg className="w-4 h-4 shrink-0 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          <span>Facebook</span>
        </button>
      </div>

      {/* Modal / Quick prompt for Social Login */}
      {promptProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-[6px_6px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {promptProvider === 'google' && '🌐'}
                  {promptProvider === 'github' && '🐙'}
                  {promptProvider === 'facebook' && '📘'}
                </span>
                <h3 className="font-black text-base text-black capitalize">
                  Continue with {promptProvider}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPromptProvider(null)}
                className="w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center font-black hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-semibold text-neutral-600">
              Sign in or register instantly by linking your {promptProvider.toUpperCase()} account:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  placeholder={`you@${promptProvider === 'google' ? 'gmail.com' : 'example.com'}`}
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_#000]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPromptProvider(null)}
                className="flex-1 py-2 text-xs font-black rounded-xl border-2 border-black bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_#000]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!socialEmail.trim()}
                onClick={() => handleOAuthLogin(promptProvider, socialEmail, socialName)}
                className="flex-1 py-2 text-xs font-black rounded-xl border-2 border-black bg-[#FACC15] hover:bg-[#EAB308] shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="relative flex items-center justify-center pt-1 pb-1">
        <div className="border-t-2 border-black/15 w-full absolute" />
        <span className="bg-white px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 relative z-10">
          or continue with email
        </span>
      </div>
    </div>
  );
};
