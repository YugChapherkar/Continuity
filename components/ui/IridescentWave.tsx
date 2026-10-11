'use client';

import React from 'react';

export function IridescentWave({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute right-0 top-1/4 -translate-y-12 translate-x-12 lg:translate-x-0 w-[540px] h-[540px] lg:w-[720px] lg:h-[720px] overflow-hidden select-none opacity-80 ${className}`}
      aria-hidden="true"
    >
      {/* Background glow pools */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-violet-950/20 to-teal-900/20 rounded-full blur-3xl filter transform -rotate-12 animate-pulse" />

      {/* Holographic glass ribbon vector */}
      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform scale-110"
      >
        <defs>
          <linearGradient id="iridescent-grad-1" x1="120" y1="80" x2="680" y2="720" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#7C3AED" stopOpacity="0.7" />
            <stop offset="65%" stopColor="#06B6D4" stopOpacity="0.65" />
            <stop offset="85%" stopColor="#10B981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="iridescent-grad-2" x1="680" y1="120" x2="140" y2="680" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#8B5CF6" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#14B8A6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="glass-specular" x1="200" y1="200" x2="600" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
          </linearGradient>

          <filter id="glass-blur" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="38" result="blur" />
          </filter>
          <filter id="subtle-blur" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="16" result="blur" />
          </filter>
        </defs>

        {/* Deep atmospheric wave layer */}
        <path
          d="M 150,220 C 320,120 540,180 680,310 C 820,440 680,680 490,690 C 300,700 180,590 140,450 C 100,310 320,240 450,230"
          fill="url(#iridescent-grad-1)"
          filter="url(#glass-blur)"
          opacity="0.5"
        />

        {/* Foreground sweeping ribbon 1 */}
        <path
          d="M 120,540 C 240,420 380,560 520,420 C 660,280 620,160 500,190 C 380,220 280,380 190,440 Z"
          fill="url(#iridescent-grad-2)"
          filter="url(#subtle-blur)"
          opacity="0.65"
        />

        {/* Crisp glass highlight spine */}
        <path
          d="M 140,520 C 260,390 410,510 540,380 C 670,250 630,150 520,180"
          stroke="url(#glass-specular)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Secondary delicate refractive hair line */}
        <path
          d="M 210,570 C 310,480 440,550 560,430 C 640,350 670,260 620,220"
          stroke="url(#iridescent-grad-1)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 6"
          fill="none"
          opacity="0.5"
        />

        {/* Light glint nodes */}
        <circle cx="540" cy="380" r="3.5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="410" cy="510" r="2.5" fill="#38BDF8" opacity="0.8" />
        <circle cx="260" cy="390" r="2" fill="#F59E0B" opacity="0.7" />
      </svg>
    </div>
  );
}
