import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, title?: string) => addToast(message, 'success', title),
    [addToast],
  );
  const error = useCallback(
    (message: string, title?: string) => addToast(message, 'error', title),
    [addToast],
  );
  const info = useCallback(
    (message: string, title?: string) => addToast(message, 'info', title),
    [addToast],
  );

  // Bridge native window.alert to styled Toast UI
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      addToast(String(message ?? ''), 'info');
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, showToast: addToast, success, error, info }}>
      {children}
      {/* Toast Render Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border border-[var(--theme-gray-border)] text-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 bg-[var(--theme-surface)] text-[var(--theme-dirty-white)]"
          >
            {t.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[2] shrink-0 mt-0.5" />
            )}
            {t.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-400 stroke-[2] shrink-0 mt-0.5" />
            )}
            {t.type === 'info' && (
              <Info className="w-5 h-5 text-[var(--theme-dirty-white)] stroke-[2] shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              {t.title && <p className="font-bold text-slate-100">{t.title}</p>}
              <p
                className={
                  t.title ? 'text-xs font-normal mt-0.5 text-slate-300' : 'text-xs font-medium text-slate-200'
                }
              >
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              aria-label="Close notification"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
