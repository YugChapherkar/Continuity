'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

/**
 * ContinuousIridescentWave (IridescentWave)
 *
 * Implements the authentic, full-bleed prismatic glass wave background:
 * - Edge-to-edge with ZERO right/side gaps.
 * - Single master artwork: no second wave overlapping or clashing.
 * - Fixed background so the iridescent wave continues seamlessly as you scroll down.
 * - Dynamically adapts when sidebar opens or closes with smooth transition.
 * - Active across all pages via DashboardLayout.
 * - Razor-sharp typography contrast via protective left gradient vignette.
 */
export function IridescentWave({ className = '' }: { className?: string }) {
  const { isSidebarOpen, theme } = useApp();
  const isLight = theme === 'light';

  return (
    <div
      className={`pointer-events-none fixed inset-0 ${
        isSidebarOpen ? 'left-0 md:left-64' : 'left-0'
      } right-0 bottom-0 h-screen w-auto overflow-hidden select-none z-0 transition-[left] duration-300 ease-in-out ${className}`}
      aria-hidden="true"
    >
      {/* 1. Ambient Prismatic Glow Pools */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${isLight ? 'opacity-25' : 'opacity-35'}`}>
        <div className="absolute top-1/4 right-1/6 w-[700px] h-[450px] rounded-full bg-emerald-500/20 blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-[650px] h-[400px] rounded-full bg-cyan-500/25 blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[400px] rounded-full bg-blue-600/20 blur-[140px]" />
      </div>

      {/* 2. Authentic Single Master Prismatic Wave Artwork */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/lumen-prismatic-wave.jpg"
          alt=""
          className={`w-full h-full object-cover object-right transition-all duration-300 ${
            isLight
              ? 'opacity-40 mix-blend-multiply'
              : 'opacity-95 mix-blend-screen'
          }`}
        />
      </div>

      {/* 3. Left Hero Headline & Content Protective Gradient */}
      <div
        className={`absolute inset-y-0 left-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none transition-colors duration-300 ${
          isLight
            ? 'bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent'
            : 'bg-gradient-to-r from-[#050606] via-[#050606]/80 to-transparent'
        }`}
      />

      {/* 4. Top Bar subtle ambient blend */}
      <div
        className={`absolute inset-x-0 top-0 h-16 pointer-events-none transition-colors duration-300 ${
          isLight
            ? 'bg-gradient-to-b from-[#F8FAFC]/70 to-transparent'
            : 'bg-gradient-to-b from-[#050606]/60 to-transparent'
        }`}
      />
    </div>
  );
}





