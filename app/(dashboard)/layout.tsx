'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { IridescentWave } from '@/components/ui/IridescentWave';
import { useApp } from '@/context/AppContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, theme } = useApp();
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col md:flex-row relative overflow-x-clip ${
        isLight ? 'bg-white text-slate-900' : 'bg-[#0A0C10] text-[#F3F4F6]'
      }`}
    >
      <Sidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 relative min-h-screen transition-[padding] duration-300 ease-in-out ${
          isSidebarOpen ? 'md:pl-64' : 'md:pl-0'
        }`}
      >
        {/* Full-bleed continuous iridescent background spanning across all pages & scroll depth */}
        <IridescentWave />
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
