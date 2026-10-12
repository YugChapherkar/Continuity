'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Avatar } from './Avatar';
import {
  Layers,
  FolderGit2,
  Inbox,
  Users,
  ShieldCheck,
  Terminal,
  Menu,
  X,
  PanelLeftClose,
  Sun,
  Moon,
  Network,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, handoffs, isSidebarOpen, setIsSidebarOpen, toggleSidebar, theme, toggleTheme } = useApp();

  // Pending for current user
  const pendingCount = handoffs.filter(
    (h) => h.recipientId === currentUser.id && h.status === 'Pending'
  ).length;

  const NAV_ITEMS = [
    { label: 'Overview', href: '/', icon: Layers },
    { label: 'Workspaces', href: '/projects', icon: FolderGit2 },
    {
      label: 'Handoff Dossiers',
      href: '/handoffs',
      icon: Inbox,
      badge: pendingCount > 0 ? `${pendingCount}` : undefined,
    },
    { label: 'Team Directory', href: '/team', icon: Users },
    { label: 'Audit Trail', href: '/audit', icon: ShieldCheck },
    { label: 'AI Terminal', href: '/assistant', icon: Terminal },
    { label: 'Convergence Hub', href: '/convergence', icon: Network, badge: 'Live' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0D0F10] border-r border-white/10 text-neutral-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#2563EB]/30 transition-transform group-hover:scale-105">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest text-[#F5F5F2]">CONTINUITY</span>
            <span className="text-[9px] text-neutral-400 tracking-wider uppercase">Lossless Handoffs</span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Engineering Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white/[0.07] text-[#F5F5F2] border border-white/[0.12] shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25 px-2 py-0.5 rounded-full font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Card & Theme Toggle */}
      <div className="p-3 border-t border-white/10 bg-[#050606]/60">
        <div className="w-full flex items-center justify-between p-2 rounded-xl text-left">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={currentUser.name} initials={currentUser.initials} size="sm" showIndicator />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#F5F5F2] truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent / Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col w-64 shrink-0 fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Flyout Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div
          className={`relative w-72 max-w-[85vw] h-full z-10 transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
