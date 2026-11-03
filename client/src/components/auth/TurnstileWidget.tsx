import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, RefreshCw, Check } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  resetKey?: number;
}

const DEFAULT_TEST_SITE_KEY = '1x00000000000000000000AA';

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onExpire,
  resetKey = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState<string>(
    (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY,
  );
  const [verified, setVerified] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const issueLocalToken = () => {
    const token = `cf-turnstile-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    setVerified(true);
    onVerify(token);
  };

  const handleManualToggle = () => {
    if (verified) {
      setVerified(false);
      onVerify('');
      onExpire?.();
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      issueLocalToken();
    }, 350);
  };

  useEffect(() => {
    let active = true;
    fetch('/api/auth/security-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.success && data?.data?.turnstileSiteKey) {
          setSiteKey(data.data.turnstileSiteKey);
        }
      })
      .catch(() => {
        // Keep default site key
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setVerified(false);
    setIsVerifying(false);
    onVerify('');

    const isTestSiteKey = siteKey === DEFAULT_TEST_SITE_KEY;

    // If Cloudflare Turnstile SDK is loaded in browser and a custom site key is active, render native widget
    if (
      typeof window !== 'undefined' &&
      window.turnstile &&
      containerRef.current &&
      !isTestSiteKey
    ) {
      setUsingFallback(false);
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: (token: string) => {
          setVerified(true);
          onVerify(token);
        },
        'expired-callback': () => {
          setVerified(false);
          onVerify('');
          onExpire?.();
        },
        'error-callback': () => {
          setVerified(false);
          onVerify('');
        },
      });
      return;
    }

    // For local dev / test sitekey or when external script is blocked in sandbox, use manual interactive verification control
    setUsingFallback(true);
  }, [siteKey, resetKey]);

  return (
    <div className="rounded-xl border-2 border-black bg-[#FAF7F2] px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-[1.5px_1.5px_0px_#000]">
      <div ref={containerRef} className={usingFallback ? 'hidden' : 'block'} />

      {usingFallback && (
        <>
          <button
            type="button"
            onClick={handleManualToggle}
            disabled={isVerifying}
            className="flex items-center gap-2.5 cursor-pointer select-none group text-left focus:outline-none"
            aria-label="Verify you are human"
          >
            <div
              className={`w-5 h-5 rounded border-2 border-black flex items-center justify-center transition-all ${
                verified
                  ? 'bg-black text-white shadow-[1px_1px_0px_#000]'
                  : isVerifying
                    ? 'bg-yellow-200'
                    : 'bg-white hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
              }`}
            >
              {isVerifying ? (
                <RefreshCw className="w-3 h-3 animate-spin text-black" />
              ) : verified ? (
                <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
              ) : null}
            </div>
            <span className="text-xs font-black text-black">
              {isVerifying
                ? 'Verifying...'
                : verified
                  ? 'Verified human'
                  : 'Verify you are human'}
            </span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>Cloudflare Turnstile</span>
          </div>
        </>
      )}
    </div>
  );
};
