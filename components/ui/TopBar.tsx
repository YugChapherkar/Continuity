'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Avatar } from './Avatar';
import { NotificationPopover } from './NotificationPopover';
import { Search, Plus, PanelLeftClose, PanelLeftOpen, Menu, Sun, Moon, LogOut } from 'lucide-react';

export function TopBar() {
  const router = useRouter();
  const {
    currentUser,
    setIsCreateHandoffModalOpen,
    setIsCommandPaletteOpen,
    isSidebarOpen,
    toggleSidebar,
    theme,
    toggleTheme,
    logout,
  } = useApp();

  const isLight = theme === 'light';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header
      className={`sticky top-0 z-30 h-16 backdrop-blur-md border-b px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 transition-colors ${
        isLight ? 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm' : 'bg-[#050606]/80 border-white/10 text-[#F5F5F2]'
      }`}
    >
      {/* Zone 1: Sidebar Toggle & Quick Search Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className={`p-2 border rounded-xl transition-all cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              : 'text-neutral-400 hover:text-white hover:bg-white/5 border-white/10'
          }`}
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {/* Desktop icon */}
          <span className="hidden md:inline-flex">
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
          </span>
          {/* Mobile hamburger icon */}
          <span className="md:hidden inline-flex">
            <Menu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
        </button>

        {/* Mobile Brand Mark */}
        <Link href="/dashboard" className="md:hidden flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#2563EB]/20">
            C
          </div>
        </Link>

        {/* Quick Search Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 border rounded-xl text-xs transition-all max-w-[140px] sm:max-w-none sm:w-60 md:w-72 ${
            isLight
              ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-600 hover:text-slate-900'
              : 'bg-[#141718] hover:bg-[#1C2022] border-white/10 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate hidden sm:inline">Search commands, ADRs, repos...</span>
          <span className="truncate sm:hidden">Search...</span>
          <kbd
            className={`hidden sm:inline-block ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono ${
              isLight ? 'bg-slate-200 text-slate-600' : 'bg-white/10 text-neutral-400'
            }`}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 2 & 3: Actions, Theme Switcher, User Badge, Logout, and CTA */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          data-testid="theme-toggle"
          className={`p-2 border rounded-xl transition-all cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              : 'text-neutral-400 hover:text-white hover:bg-white/5 border-white/10'
          }`}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        <NotificationPopover />

        {/* User Profile Info */}
        <div
          className={`hidden sm:flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 border rounded-xl ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0D0F10] border-white/10 text-[#F5F5F2]'
          }`}
        >
          <Avatar name={currentUser.name} initials={currentUser.initials} size="xs" showIndicator />
          <div className="hidden lg:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold leading-none truncate max-w-[120px] ${
                  isLight ? 'text-slate-900' : 'text-[#F5F5F2]'
                }`}
              >
                {currentUser.name}
              </span>
              {currentUser.employeeId && (
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                    isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-neutral-300'
                  }`}
                >
                  {currentUser.employeeId}
                </span>
              )}
              {currentUser.isAdmin && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-300 font-bold border border-blue-500/30">
                  ADMIN
                </span>
              )}
            </div>
            <span className={`text-[10px] leading-tight truncate max-w-[120px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={() => setIsCreateHandoffModalOpen(true)}
          className="px-2.5 sm:px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Start a handoff</span>
          <span className="sm:hidden">Handoff</span>
        </button>

        {/* Prominent Logout Button */}
        <button
          onClick={handleLogout}
          id="topbar-logout-btn"
          className={`px-2.5 sm:px-3 py-2 border rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200 hover:border-rose-200'
              : 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border-white/10 hover:border-rose-500/30'
          }`}
          title="Sign out of Continuity"
          aria-label="Log out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
