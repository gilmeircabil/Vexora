import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { FallingStarsBackground } from '../components/common/FallingStarsBackground.js';
import { BrandLogo } from '../components/common/BrandLogo.js';

export const OAuthCallbackPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState<'processing' | 'error' | 'success'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const stateRaw = searchParams.get('state');
    const errorParam = searchParams.get('error') || searchParams.get('error_description');

    if (errorParam) {
      setStatus('error');
      setErrorMessage(`Authentication was cancelled or denied: ${errorParam}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage('Missing authorization code from OAuth provider.');
      return;
    }

    let targetRedirect = '/dashboard';

    if (stateRaw) {
      try {
        const parsed = JSON.parse(atob(stateRaw));
        if (parsed.redirect) targetRedirect = parsed.redirect;
      } catch {
        // Fall back to default
      }
    }

    const exchangeCode = async () => {
      try {
        const endpoint = '/api/auth/google';
        const redirectUri = `${window.location.origin}/oauth/callback`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            code,
            redirectUri,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('success');
          login(data.data.accessToken, data.data.user);
          showToast(`Welcome, ${data.data.user.name || data.data.user.username}!`, 'success');
          setTimeout(() => {
            navigate(targetRedirect, { replace: true });
          }, 800);
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Failed to complete authentication.');
        }
      } catch {
        setStatus('error');
        setErrorMessage('A network error occurred while communicating with the server.');
      }
    };

    exchangeCode();
  }, [searchParams, login, showToast, navigate]);

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-center items-center px-4 py-12">
      <FallingStarsBackground />

      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-black p-8 shadow-[6px_6px_0px_#000000] relative z-10 space-y-6 text-center">
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>

        {status === 'processing' && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FACC15] border-2 border-black mx-auto flex items-center justify-center shadow-[3px_3px_0px_#000000]">
              <Loader2 className="w-6 h-6 animate-spin text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black">Verifying Authentication...</h2>
              <p className="text-xs font-semibold text-neutral-600 mt-1">
                Connecting your account with VexoraMods. One second...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4ADE80] border-2 border-black mx-auto flex items-center justify-center shadow-[3px_3px_0px_#000000]">
              <CheckCircle2 className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black">Logged In Successfully!</h2>
              <p className="text-xs font-semibold text-neutral-600 mt-1">
                Redirecting you to your workspace...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 py-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-black mx-auto flex items-center justify-center shadow-[3px_3px_0px_#000000]">
              <AlertCircle className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black">Authentication Failed</h2>
              <p className="text-xs font-semibold text-neutral-700 mt-2 bg-neutral-50 p-3 rounded-xl border border-black/15">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-xs font-black text-black shadow-[3px_3px_0px_#000000] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
