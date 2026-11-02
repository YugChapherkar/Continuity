'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export function GlobalToast() {
  const { toast, closeToast, theme } = useApp();

  if (!toast) return null;

  const isLight = theme === 'light';

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
      label: 'Success',
      labelColor: 'text-emerald-700 dark:text-emerald-400',
    },
    info: {
      icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
      badgeBg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
      label: 'Notification',
      labelColor: 'text-blue-700 dark:text-blue-400',
    },
    error: {
      icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
      badgeBg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
      label: 'Attention',
      labelColor: 'text-rose-700 dark:text-rose-400',
    },
  };

  const current = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto max-w-sm w-full sm:w-auto"
    >
      <div className="flex items-center gap-3 p-3 sm:px-4 sm:py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14171A] shadow-xl shadow-slate-900/10 dark:shadow-black/60 text-slate-900 dark:text-white transition-all">
        {/* Type Icon Badge */}
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${current.badgeBg}`}
        >
          {current.icon}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug break-words">
            {toast.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={closeToast}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
