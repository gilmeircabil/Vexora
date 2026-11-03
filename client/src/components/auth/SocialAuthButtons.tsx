import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2, Info, X, ExternalLink, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

declare global {
  interface Window {
    google?: any;
  }
}

export const SocialAuthButtons: React.FC<{
  mode?: 'login' | 'register';
}> = ({ mode = 'login' }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  );
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Fetch backend Google OAuth configuration on mount
  useEffect(() => {
    fetch('/api/auth/oauth-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data?.google?.clientId) {
          setGoogleClientId(data.data.google.clientId);
        }
      })
      .catch(() => {
        // Fall back to Vite environment variable
      });
  }, []);

  // Initialize Google Identity Services script when client ID is available
  useEffect(() => {
    if (!googleClientId) return;

    const scriptId = 'google-jssdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [googleClientId]);

  const handleGoogleClick = () => {
    if (!googleClientId) {
      setShowSetupModal(true);
      return;
    }

    setIsLoading(true);

    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              setIsLoading(false);
              showToast('Google login cancelled or token missing.', 'error');
              return;
            }
            await exchangeGoogleCredential(response.credential);
          },
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            redirectToGoogleOAuth(googleClientId);
          }
        });
      } else {
        redirectToGoogleOAuth(googleClientId);
      }
    } catch {
      setIsLoading(false);
      showToast('Failed to start Google sign in.', 'error');
    }
  };

  const redirectToGoogleOAuth = (clientId: string) => {
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const state = btoa(JSON.stringify({ provider: 'google', redirect }));
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&state=${encodeURIComponent(state)}&prompt=select_account`;
    window.location.href = url;
  };

  const exchangeGoogleCredential = async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.data.accessToken, data.data.user);
        showToast(`Welcome, ${data.data.user.name || data.data.user.username}!`, 'success');
        navigate(redirect);
      } else {
        showToast(data.error || 'Google login failed.', 'error');
      }
    } catch {
      showToast('Network error during Google login.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const envSnippet = `GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com\nVITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com`;

  return (
    <div className="space-y-3">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-black/15" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-black">
          <span className="bg-white px-2.5 text-neutral-500 tracking-wider">
            Or {mode === 'register' ? 'sign up' : 'continue'} with
          </span>
        </div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isLoading}
        className="w-full relative flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-black bg-white hover:bg-neutral-50 text-xs font-black text-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] transition-all cursor-pointer disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.27-2.09 3.675-5.17 3.675-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.24c-.25-.72-.39-1.5-.39-2.24s.14-1.52.39-2.24V6.61H1.25C.45 8.22 0 10.05 0 12s.45 3.78 1.25 5.39l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      {/* Setup Guide Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border-2 border-black p-6 max-w-md w-full shadow-[6px_6px_0px_#000000] space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15] border-2 border-black flex items-center justify-center font-black">
                  <Info className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <h3 className="font-black text-sm text-black">Activate Google Sign-In (Free)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="text-neutral-500 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
              Google authentication is ready! To activate it, paste your free Google Client ID into
              your{' '}
              <code className="bg-neutral-100 px-1 py-0.5 rounded border border-black/20 font-bold">
                .env
              </code>{' '}
              file:
            </p>

            <div className="relative">
              <pre className="p-3 bg-neutral-900 text-neutral-100 text-[11px] font-mono rounded-xl border-2 border-black overflow-x-auto">
                {envSnippet}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(envSnippet);
                  setCopiedEnv(true);
                  setTimeout(() => setCopiedEnv(false), 2000);
                }}
                className="absolute top-2 right-2 px-2 py-1 bg-white hover:bg-neutral-100 border border-black rounded text-[10px] font-black text-black flex items-center gap-1 cursor-pointer"
              >
                {copiedEnv ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 stroke-[2.5]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black text-black underline flex items-center gap-1 hover:text-neutral-700"
              >
                <span>Google Cloud Credentials</span>
                <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              </a>

              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black rounded-xl text-xs font-black text-black shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
