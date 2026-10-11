'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export function GlobalToast() {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
    error: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-[#0D1512]',
    info: 'border-blue-500/30 bg-[#0A101D]',
    error: 'border-rose-500/30 bg-[#170E10]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-xs text-[#F5F5F2] max-w-md ${borders[toast.type]}`}
      >
        {icons[toast.type]}
        <span className="leading-snug">{toast.message}</span>
      </div>
    </div>
  );
}
