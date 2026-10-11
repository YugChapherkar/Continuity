'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { IridescentWave } from '@/components/ui/IridescentWave';
import { useApp } from '@/context/AppContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#050606] text-[#F5F5F2] flex flex-col md:flex-row relative overflow-x-clip">
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
