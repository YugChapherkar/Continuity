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

  // In light mode, keep the canvas pure minimal white with zero background images or color blur pools
  if (isLight) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 ${
        isSidebarOpen ? 'left-0 md:left-64' : 'left-0'
      } right-0 bottom-0 h-screen w-auto overflow-hidden select-none z-0 transition-[left] duration-300 ease-in-out ${className}`}
      aria-hidden="true"
    >
      {/* Subtle, restrained dark mode ambient backdrop */}
      <div className="absolute inset-0 bg-[#090B0E]/90" />
      <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-blue-500/5 blur-[120px] rounded-full" />
    </div>
  );
}





