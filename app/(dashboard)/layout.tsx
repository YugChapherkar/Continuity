'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { IridescentWave } from '@/components/ui/IridescentWave';
import { useApp } from '@/context/AppContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, theme, isAuthenticated } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Gracefully wait during client-side auth redirection
  if (mounted && !isAuthenticated) {
    return null;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col md:flex-row relative overflow-x-clip ${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#050606] text-[#F5F5F2]'
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
