'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Avatar } from './Avatar';
import { NotificationPopover } from './NotificationPopover';
import {
  Search,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Check,
  User as UserIcon,
} from 'lucide-react';

export function TopBar() {
  const router = useRouter();
  const {
    currentUser,
    setCurrentUser,
    users,
    activeRole,
    setIsCreateHandoffModalOpen,
    setIsCommandPaletteOpen,
    isSidebarOpen,
    toggleSidebar,
    theme,
    toggleTheme,
    logout,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    router.push('/login');
  };

  // 3 Primary Demo Personas
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
      desc: 'Team Leader (Consensus & Storage)',
    },
    {
      id: 'user-jessica',
      name: 'Jessica Chauhan',
      role: 'Employee',
      badge: 'EMPLOYEE',
      desc: 'Senior Systems Engineer',
    },
  ];

  return (
    <header
      className={`sticky top-0 z-30 h-14 border-b px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-[#0A0C10] border-white/10 text-white'
      }`}
    >
      {/* Left Area: Sidebar Toggle & Search Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              : 'text-neutral-400 hover:text-white hover:bg-white/5 border-white/10'
          }`}
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <span className="hidden md:inline-flex">
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
          </span>
          <span className="md:hidden inline-flex">
            <Menu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
        </button>

        {/* Mobile Brand Mark */}
        <Link href="/dashboard" className="md:hidden flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            C
          </div>
        </Link>

        {/* Quick Search Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs transition-colors w-48 sm:w-64 md:w-80 cursor-pointer ${
            isLight
              ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-500 hover:text-slate-800'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-neutral-500" />
          <span className="truncate hidden sm:inline">Search commands, ADRs, repos...</span>
          <span className="truncate sm:hidden">Search...</span>
          <kbd
            className={`hidden sm:inline-block ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
              isLight
                ? 'bg-white text-slate-500 border border-slate-200'
                : 'bg-white/10 text-neutral-400 border border-white/10'
            }`}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Area: Actions, Notification, Theme, Profile Dropdown */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Primary Action Button */}
        <button
          onClick={() => setIsCreateHandoffModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Start a handoff</span>
          <span className="sm:hidden">Handoff</span>
        </button>

        {/* Notifications Popover */}
        <NotificationPopover />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          data-testid="theme-toggle"
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              : 'text-neutral-400 hover:text-white hover:bg-white/5 border-white/10'
          }`}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600" />
          )}
        </button>

        {/* User Profile Menu & Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white'
            }`}
            aria-expanded={isProfileOpen}
            aria-label="User profile options"
          >
            <Avatar name={currentUser.name} initials={currentUser.initials} size="xs" showIndicator />
            <div className="hidden md:flex items-center gap-1.5 text-left">
              <span className="text-xs font-semibold truncate max-w-[110px]">
                {currentUser.name}
              </span>
              <span
                className={`text-[9px] font-mono font-semibold px-1 py-0.5 rounded ${
                  currentUser.isAdmin
                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-neutral-300'
                }`}
              >
                {currentUser.isAdmin ? 'ADMIN' : activeRole}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-neutral-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Dropdown Menu */}
          {isProfileOpen && (
            <div
              className={`absolute right-0 mt-2 w-72 rounded-xl border shadow-xl z-50 p-2 space-y-2 animate-fadeIn ${
                isLight
                  ? 'bg-white border-slate-200 shadow-slate-200/50 text-slate-900'
                  : 'bg-[#0E1114] border-white/10 shadow-black/60 text-white'
              }`}
            >
              {/* Profile Details Header */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    {currentUser.name}
                  </span>
                  {currentUser.employeeId && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-neutral-300">
                      {currentUser.employeeId}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                  {currentUser.role}
                </p>
                {currentUser.department && (
                  <p className="text-[10px] text-slate-400 dark:text-neutral-500">
                    Dept: {currentUser.department}
                  </p>
                )}
              </div>

              {/* Perspective / Role Switcher */}
              <div className="space-y-1">
                <div className="px-2 pt-1 text-[10px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
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
                          setIsProfileOpen(false);
                        }
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? isLight
                            ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200'
                            : 'bg-white/[0.08] text-white font-semibold border border-white/10'
                          : isLight
                          ? 'hover:bg-slate-50 text-slate-700'
                          : 'hover:bg-white/5 text-neutral-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{persona.name}</span>
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold shrink-0 ${
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
                        <p className="text-[10px] text-slate-400 dark:text-neutral-500 truncate mt-0.5">
                          {persona.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Divider */}
              <div className="border-t border-slate-100 dark:border-white/[0.08] my-1" />

              {/* Log out action */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>

        {/* Standalone Quick Log out button */}
        <button
          onClick={handleLogout}
          id="topbar-logout-btn"
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200 hover:border-rose-200'
              : 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border-white/10 hover:border-rose-500/20'
          }`}
          title="Log out of Continuity"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
