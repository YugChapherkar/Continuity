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
    success: 'border-emerald-500/30 bg-[#0E1713]',
    info: 'border-blue-500/30 bg-[#0C1424]',
    error: 'border-rose-500/30 bg-[#1A0E12]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-xs max-w-md ${borders[toast.type]}`}
      >
        {icons[toast.type]}
        <span className="leading-snug text-white font-medium tracking-normal select-none">
          {toast.message}
        </span>
      </div>
    </div>
  );
}
