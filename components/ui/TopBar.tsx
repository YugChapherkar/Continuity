'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { NotificationPopover } from './NotificationPopover';
import { Avatar } from '@/components/ui/Avatar';
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
  ShieldCheck,
  User,
} from 'lucide-react';

export function TopBar() {
  const {
    currentUser,
    activeRole,
    logout,
    setIsCreateHandoffModalOpen,
    setIsCommandPaletteOpen,
    isSidebarOpen,
    toggleSidebar,
    theme,
    toggleTheme,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 h-14 border-b px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors ${
        isLight
          ? 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900'
          : 'bg-[#0A0C10]/95 backdrop-blur-md border-white/10 text-white'
      }`}
    >
      {/* Left Area: Sidebar Toggle & Search Action */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              : 'text-neutral-300 hover:text-white hover:bg-white/5 border-white/10'
          }`}
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <span className="hidden md:inline-flex">
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </span>
          <span className="md:hidden">
            <Menu className="w-4 h-4" />
          </span>
        </button>

        {/* Global Command Palette search input trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200 text-slate-700 hover:text-slate-900 font-medium'
              : 'bg-white/[0.05] hover:bg-white/[0.08] border-white/10 text-neutral-200 hover:text-white font-medium'
          }`}
        >
          <Search className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-neutral-400" />
          <span className="hidden sm:inline-block">Search commands, ADRs, repos...</span>
          <span className="sm:hidden">Search...</span>
          <kbd
            className={`hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border font-semibold ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 shadow-xs'
                : 'bg-white/10 border-white/15 text-neutral-200'
            }`}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Area: Action button, Notifications, Theme toggle, Extreme Right Account Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Create Handoff Primary CTA */}
        <button
          onClick={() => setIsCreateHandoffModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start a handoff</span>
          <span className="sm:hidden">Handoff</span>
        </button>

        {/* Notifications Popover */}
        <NotificationPopover />

        {/* Quick Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          id="topbar-theme-toggle"
          data-testid="topbar-theme-toggle"
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              : 'text-neutral-300 hover:text-white hover:bg-white/5 border-white/10'
          }`}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-slate-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600" />
          )}
        </button>

        {/* Account Profile at Extreme Right */}
        <div className="relative shrink-0" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900 shadow-xs'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white'
            }`}
            title="User Account Menu"
          >
            <Avatar name={currentUser.name} initials={currentUser.initials} size="sm" showIndicator />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-slate-900 dark:text-white truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 leading-tight">
                {activeRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          </button>

          {/* User Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0D0F11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in duration-150 space-y-2">
              <div className="p-2 border-b border-slate-100 dark:border-white/[0.08]">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 truncate">
                  {currentUser.email}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                    {activeRole}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 truncate">
                    {currentUser.department}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-blue-600" />
                    )}
                    <span>Theme Mode</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 capitalize">{theme}</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-slate-400" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
