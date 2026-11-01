'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Whenever pathname changes, trigger a quick, crisp progress pulse
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none overflow-hidden bg-slate-200/50"
    >
      <div className="h-full bg-black animate-progress-strip shadow-[0_0_8px_rgba(0,0,0,0.4)]" />
    </div>
  );
}

