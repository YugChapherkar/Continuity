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
  PanelLeftClose,
  Sun,
  Moon,
  LogOut,
  CheckSquare,
  FileText,
  ClipboardCheck,
  PackageCheck,
  Bell,
  Activity,
  UserCheck,
  ChevronDown,
  Bot,
  Network,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const {
    currentUser,
    setCurrentUser,
    users,
    activeRole,
    handoffs,
    notifications,
    reviews,
    reports,
    isSidebarOpen,
    setIsSidebarOpen,
    theme,
    toggleTheme,
    logout,
  } = useApp();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  // Counts for role-specific badges
  const pendingHandoffsCount = handoffs.filter(
    (h) => h.recipientId === currentUser.id && h.status === 'Pending'
  ).length;

  const unreadNotifsCount = notifications.filter(
    (n) => !n.read && (!n.recipientId || n.recipientId === currentUser.id)
  ).length;

  const pendingReviewsCount = reviews.filter(
    (r) => r.status === 'Submitted for Final Review'
  ).length;

  const pendingReportsCount = reports.filter(
    (r) => r.status === 'Submitted'
  ).length;

  const isLight = theme === 'light';

  const getNavItems = () => {
    if (activeRole === 'Admin') {
      return [
        { label: 'Overview', href: '/dashboard', icon: Layers },
        { label: 'Teams', href: '/admin/teams', icon: Users },
        { label: 'Employees', href: '/admin/employees', icon: UserCheck },
        { label: 'Projects', href: '/projects', icon: FolderGit2 },
        { label: 'Tasks', href: '/tasks', icon: CheckSquare },
        {
          label: 'Team Reports',
          href: '/reports',
          icon: FileText,
          badge: pendingReportsCount > 0 ? `${pendingReportsCount}` : undefined,
          badgeColor: 'amber',
        },
        {
          label: 'Reviews & Approvals',
          href: '/admin/reviews',
          icon: ClipboardCheck,
          badge: pendingReviewsCount > 0 ? `${pendingReviewsCount}` : undefined,
          badgeColor: 'rose',
        },
        { label: 'Client Deliveries', href: '/admin/deliveries', icon: PackageCheck },
        {
          label: 'Notifications',
          href: '/notifications',
          icon: Bell,
          badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : undefined,
          badgeColor: 'blue',
        },
        { label: 'AI Assistant', href: '/assistant', icon: Bot },
        { label: 'Convergence', href: '/convergence', icon: Network },
        { label: 'Audit Log', href: '/audit', icon: ShieldCheck },
      ];
    }

    if (activeRole === 'Team Leader') {
      return [
        { label: 'Overview', href: '/dashboard', icon: Layers },
        { label: 'My Team', href: '/team', icon: Users },
        { label: 'My Projects', href: '/projects', icon: FolderGit2 },
        { label: 'Tasks', href: '/tasks', icon: CheckSquare },
        { label: 'Team Updates', href: '/updates', icon: Activity },
        { label: 'Reports', href: '/reports', icon: FileText },
        {
          label: 'Handoffs',
          href: '/handoffs',
          icon: Inbox,
          badge: pendingHandoffsCount > 0 ? `${pendingHandoffsCount}` : undefined,
          badgeColor: 'blue',
        },
        {
          label: 'Notifications',
          href: '/notifications',
          icon: Bell,
          badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : undefined,
          badgeColor: 'blue',
        },
        { label: 'AI Assistant', href: '/assistant', icon: Bot },
        { label: 'Convergence', href: '/convergence', icon: Network },
      ];
    }

    // Employee
    return [
      { label: 'Overview', href: '/dashboard', icon: Layers },
      { label: 'My Tasks', href: '/tasks', icon: CheckSquare },
      { label: 'My Projects', href: '/projects', icon: FolderGit2 },
      { label: 'My Updates', href: '/updates', icon: Activity },
      {
        label: 'Handoffs',
        href: '/handoffs',
        icon: Inbox,
        badge: pendingHandoffsCount > 0 ? `${pendingHandoffsCount}` : undefined,
        badgeColor: 'blue',
      },
      {
        label: 'Notifications',
        href: '/notifications',
        icon: Bell,
        badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : undefined,
        badgeColor: 'blue',
      },
      { label: 'AI Assistant', href: '/assistant', icon: Bot },
      { label: 'Convergence', href: '/convergence', icon: Network },
    ];
  };

  const navItems = getNavItems();

  // 3 Primary Demo Personas for instant switching
  const DEMO_PERSONAS = [
    {
      id: 'user-admin',
      name: 'Alexander Ward',
      role: 'Admin',
      badge: 'ADMIN',
      desc: 'System Administrator & Release Reviewer',
    },
    {
      id: 'user-marcus',
      name: 'Marcus Vance',
      role: 'Team Leader',
      badge: 'LEADER',
      desc: 'Team Leader (Consensus & Storage Pod)',
    },
    {
      id: 'user-jessica',
      name: 'Jessica Chauhan',
      role: 'Employee',
      badge: 'EMPLOYEE',
      desc: 'Senior Systems Engineer (Storage Pod)',
    },
  ];

  const sidebarContent = (
    <div
      className={`flex flex-col h-full border-r transition-colors duration-200 ${
        isLight ? 'bg-white border-slate-200/90 text-slate-700 shadow-sm' : 'bg-[#0D0F10] border-white/10 text-neutral-300'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center justify-between px-6 border-b shrink-0 ${
          isLight ? 'border-slate-200/80' : 'border-white/10'
        }`}
      >
        <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2.5 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              isLight
                ? 'https://res.cloudinary.com/deimij13f/image/upload/v1791857115/logo-c_mq0xbm.png'
                : 'https://res.cloudinary.com/deimij13f/image/upload/v1791857114/logo-c_1_ju4lgi.png'
            }
            alt="Continuity"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-400 tracking-wider uppercase">
              {activeRole} Platform
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace Indicator */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              {activeRole} Workspace
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">Strict RBAC</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className={`px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          const badgeClasses =
            item.badgeColor === 'rose'
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30'
              : item.badgeColor === 'amber'
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30'
              : 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/25';

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-all ${
                isActive
                  ? isLight
                    ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200 shadow-xs'
                    : 'bg-white/[0.08] text-white font-semibold border border-white/[0.08] shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.03] border border-transparent font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? (isLight ? 'text-blue-600' : 'text-blue-400') : (isLight ? 'text-slate-400' : 'text-neutral-500')
                  }`}
                />
                <span className={isActive ? (isLight ? 'text-slate-900' : 'text-white') : ''}>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full font-mono ${badgeClasses}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Identity Profile Tile */}
      <div
        className={`p-3 border-t shrink-0 space-y-2 ${
          isLight ? 'bg-slate-50/90 border-slate-200/80' : 'bg-[#050606]/80 border-white/10'
        }`}
      >
        <div
          className={`w-full flex items-center justify-between p-2 rounded-xl text-left border ${
            isLight
              ? 'bg-white border-slate-200/90 text-slate-800 shadow-sm'
              : 'bg-white/[0.03] border-white/[0.08] text-[#F5F5F2]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={currentUser.name} initials={currentUser.initials} size="sm" showIndicator />
            <div className="min-w-0">
              <p className={`text-xs font-semibold truncate flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-[#F5F5F2]'}`}>
                <span className="truncate">{currentUser.name}</span>
              </p>
              <p className={`text-[10px] truncate flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{activeRole}</span>
                <span>·</span>
                <span className="truncate">{currentUser.role}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Theme & Logout Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            id="sidebar-theme-toggle"
            data-testid="sidebar-theme-toggle"
            className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/90 shadow-sm'
                : 'bg-white/[0.03] hover:bg-white/[0.07] text-neutral-400 hover:text-white border-white/[0.06]'
            }`}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-blue-600" />
                <span>Dark</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsSidebarOpen(false);
              logout();
            }}
            className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border-slate-200/90 hover:border-rose-200 shadow-sm'
                : 'text-neutral-400 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/10 border-white/[0.06] hover:border-rose-500/20'
            }`}
          >
            <LogOut className="w-3 h-3" />
            <span>Log out</span>
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
