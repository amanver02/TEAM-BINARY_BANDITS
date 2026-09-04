'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-green-600 shrink-0" />,
  error: <XCircle size={16} className="text-red-600 shrink-0" />,
  warning: <AlertTriangle size={16} className="text-yellow-600 shrink-0" />,
  info: <Info size={16} className="text-blue-600 shrink-0" />,
};

const borderColors: Record<ToastVariant, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-yellow-500',
  info: 'border-l-blue-500',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { ...opts, id }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto bg-white border border-slate-200 rounded-lg shadow-lg p-4',
              'border-l-4 flex items-start gap-3',
              'animate-in slide-in-from-right-full fade-in-0 duration-200',
              borderColors[t.variant]
            )}
            role="alert"
          >
            {icons[t.variant]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              {t.description && (
                <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 rounded p-0.5 hover:bg-slate-100 transition-colors duration-150"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
