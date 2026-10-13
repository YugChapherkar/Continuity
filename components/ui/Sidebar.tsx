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
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#2563EB]/30 transition-transform group-hover:scale-105">
            C
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-sm tracking-widest ${isLight ? 'text-slate-900' : 'text-[#F5F5F2]'}`}>
              CONTINUITY
            </span>
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

      {/* Quick Role & Persona Switcher */}
      <div
        className={`p-3 border-t shrink-0 space-y-2 ${
          isLight ? 'bg-slate-50/90 border-slate-200/80' : 'bg-[#050606]/80 border-white/10'
        }`}
      >
        <div className="relative">
          <button
            onClick={() => setIsPersonaMenuOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition-colors cursor-pointer group ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 shadow-sm'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-[#F5F5F2]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={currentUser.name} initials={currentUser.initials} size="sm" showIndicator />
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-[#F5F5F2]'}`}>
                  <span className="truncate">{currentUser.name}</span>
                </p>
                <p className={`text-[10px] truncate flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{activeRole}</span>
                  <span>·</span>
                  <span className="truncate">{currentUser.role}</span>
                </p>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${isLight ? 'text-slate-400 group-hover:text-slate-800' : 'text-neutral-400 group-hover:text-white'}`} />
          </button>

          {/* Persona Switcher Popup Dropdown */}
          {isPersonaMenuOpen && (
            <div
              className={`absolute bottom-full left-0 right-0 mb-2 p-2 border rounded-xl shadow-2xl z-50 space-y-1 ${
                isLight ? 'bg-white border-slate-200 shadow-slate-300/40 text-slate-800' : 'bg-[#0E1112] border-white/15 text-neutral-200'
              }`}
            >
              <div className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-neutral-400'}`}>
                Switch Perspective
              </div>
              {DEMO_PERSONAS.map((persona) => {
                const userObj = users.find((u) => u.id === persona.id);
                const isSelected = currentUser.id === persona.id;

                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      if (userObj) {
                        setCurrentUser(userObj);
                        setIsPersonaMenuOpen(false);
                      }
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-start justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200'
                          : 'bg-white/[0.08] text-white font-semibold border border-white/10'
                        : isLight
                        ? 'hover:bg-slate-50 text-slate-700'
                        : 'hover:bg-white/5 text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <span className={isLight ? 'text-slate-900' : 'text-white'}>{persona.name}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            persona.role === 'Admin'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'
                              : persona.role === 'Team Leader'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
                          }`}
                        >
                          {persona.badge}
                        </span>
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>{persona.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
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
