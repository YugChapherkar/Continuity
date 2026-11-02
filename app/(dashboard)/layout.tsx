'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { IridescentWave } from '@/components/ui/IridescentWave';
import { NavigationProgressBar } from '@/components/ui/NavigationProgressBar';
import { useApp } from '@/context/AppContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isSidebarOpen, theme } = useApp();
  const isLight = theme === 'light';

  // Prewarm all primary dashboard routes so tab clicks load instantaneously
  useEffect(() => {
    const primaryRoutes = [
      '/dashboard',
      '/projects',
      '/tasks',
      '/handoffs',
      '/reports',
      '/admin/teams',
      '/admin/employees',
      '/admin/reviews',
      '/admin/deliveries',
      '/notifications',
    ];
    const timer = setTimeout(() => {
      primaryRoutes.forEach((route) => {
        try {
          router.prefetch(route);
        } catch {}
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row relative overflow-x-clip ${
        isLight ? 'bg-[#F8FAFC] text-black' : 'bg-[#0A0C10] text-[#F3F4F6]'
      }`}
    >
      <NavigationProgressBar />
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
