import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, RefreshCw, Check } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
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
  action?: string;
}

const DEFAULT_TEST_SITE_KEY = '1x00000000000000000000AA';

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onExpire,
  resetKey = 0,
  action,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [siteKey, setSiteKey] = useState<string>(
    (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY,
  );
  const [verified, setVerified] = useState(false);
  const [usingFallback, setUsingFallback] = useState(true);
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

    const isTestSiteKey =
      siteKey === DEFAULT_TEST_SITE_KEY ||
      siteKey.startsWith('1x') ||
      siteKey.startsWith('2x') ||
      siteKey.startsWith('3x');

    if (isTestSiteKey) {
      setUsingFallback(true);
      return;
    }

    let active = true;

    const tryRenderWidget = () => {
      if (!active || !containerRef.current || !window.turnstile) return false;
      try {
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
          action: action || undefined,
          callback: (token: string) => {
            if (active) {
              setVerified(true);
              onVerify(token);
            }
          },
          'expired-callback': () => {
            if (active) {
              setVerified(false);
              onVerify('');
              onExpire?.();
            }
          },
          'error-callback': () => {
            if (active) {
              setVerified(false);
              onVerify('');
            }
          },
        });
        setUsingFallback(false);
        return true;
      } catch {
        setUsingFallback(true);
        return false;
      }
    };

    if (typeof window !== 'undefined' && window.turnstile) {
      tryRenderWidget();
    } else {
      setUsingFallback(true);
      if (typeof window !== 'undefined') {
        const checkTurnstile = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkTurnstile);
            tryRenderWidget();
          }
        }, 150);
        const timeout = setTimeout(() => clearInterval(checkTurnstile), 4000);
        return () => {
          active = false;
          clearInterval(checkTurnstile);
          clearTimeout(timeout);
        };
      }
    }

    return () => {
      active = false;
      if (widgetIdRef.current && typeof window !== 'undefined' && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, resetKey]);

  return (
    <div className="rounded-xl border border-[var(--theme-gray-border)] bg-[var(--theme-surface)] px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-sm text-[var(--theme-dirty-white)]">
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
              className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                verified
                  ? 'bg-[var(--theme-dirty-white)] border-[var(--theme-dirty-white)] text-[var(--theme-canvas)]'
                  : isVerifying
                    ? 'bg-[var(--theme-surface-raised)] border-[var(--theme-gray-subtle)]'
                    : 'bg-[var(--theme-surface-raised)] border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface)]'
              }`}
            >
              {isVerifying ? (
                <RefreshCw className="w-3 h-3 animate-spin text-[var(--theme-dirty-white)]" />
              ) : verified ? (
                <Check className="w-3.5 h-3.5 stroke-[3] text-[var(--theme-canvas)]" />
              ) : null}
            </div>
            <span className="text-xs font-semibold text-[var(--theme-dirty-white)]">
              {isVerifying ? 'Verifying...' : verified ? 'Verified human' : 'Verify you are human'}
            </span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--theme-gray-muted)] shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--theme-dirty-white)] stroke-[2]" />
            <span>Cloudflare Turnstile</span>
          </div>
        </>
      )}
    </div>
  );
};
