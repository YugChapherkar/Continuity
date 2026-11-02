'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname changes (navigation completed), finish and clear progress bar
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Intercept all internal anchor clicks for instantaneous visual feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Don't intercept if modified click (ctrl, cmd, shift, middle click)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
        return;
      }

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor || !anchor.href) return;

      const targetAttr = anchor.getAttribute('target');
      if (targetAttr && targetAttr !== '_self') return;

      try {
        const url = new URL(anchor.href, window.location.href);
        const isInternal = url.origin === window.location.origin;
        const isDifferentPath = url.pathname !== window.location.pathname || url.search !== window.location.search;

        if (isInternal && isDifferentPath && !url.pathname.startsWith('/api')) {
          setLoading(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          // Safety timeout to prevent sticking if navigation is cancelled or fast
          timeoutRef.current = setTimeout(() => {
            setLoading(false);
          }, 3500);
        }
      } catch {}
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999] h-[2.5px] pointer-events-none overflow-hidden bg-slate-200/60"
    >
      <div className="h-full bg-black animate-progress-strip shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
    </div>
  );
}
