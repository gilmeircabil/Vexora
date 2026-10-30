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
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              t.type === 'success'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-50 dark:border-emerald-800'
                : t.type === 'error'
                  ? 'bg-rose-50 text-rose-950 border-rose-200 dark:bg-rose-950 dark:text-rose-50 dark:border-rose-800'
                  : 'bg-white text-neutral-900 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-800'
            }`}
          >
            {t.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            {t.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            {t.type === 'info' && (
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              {t.title && <p className="font-semibold">{t.title}</p>}
              <p className={t.title ? 'text-xs opacity-90 mt-0.5' : 'text-sm'}>{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              aria-label="Close notification"
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
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
