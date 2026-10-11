'use client';

import React from 'react';

interface AvatarProps {
  name: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIndicator?: boolean;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  JC: { bg: 'bg-blue-950/80', text: 'text-blue-200', border: 'border-blue-500/30' },
  MV: { bg: 'bg-violet-950/80', text: 'text-violet-200', border: 'border-violet-500/30' },
  SL: { bg: 'bg-emerald-950/80', text: 'text-emerald-200', border: 'border-emerald-500/30' },
  ER: { bg: 'bg-amber-950/80', text: 'text-amber-200', border: 'border-amber-500/30' },
  DK: { bg: 'bg-cyan-950/80', text: 'text-cyan-200', border: 'border-cyan-500/30' },
  AC: { bg: 'bg-indigo-950/80', text: 'text-indigo-200', border: 'border-indigo-500/30' },
};

export function Avatar({
  name,
  initials,
  size = 'md',
  className = '',
  showIndicator = false,
}: AvatarProps) {
  const userInitials =
    initials ||
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg font-semibold',
  }[size];

  const colors = COLOR_MAP[userInitials] || {
    bg: 'bg-neutral-900',
    text: 'text-neutral-200',
    border: 'border-white/10',
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizeClasses} ${colors.bg} ${colors.text} ${colors.border} border rounded-full flex items-center justify-center font-medium tracking-wide shadow-sm select-none transition-transform hover:scale-105`}
        title={name}
      >
        <span>{userInitials}</span>
      </div>
      {showIndicator && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#050606]"
          aria-label="Active status"
        />
      )}
    </div>
  );
}
