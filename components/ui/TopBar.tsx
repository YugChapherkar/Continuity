'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { NotificationPopover } from './NotificationPopover';
import {
  Search,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';

export function TopBar() {
  const {
    setIsCreateHandoffModalOpen,
    setIsCommandPaletteOpen,
    isSidebarOpen,
    toggleSidebar,
    theme,
    toggleTheme,
  } = useApp();

  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-30 h-14 border-b px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-[#0A0C10] border-white/10 text-white'
      }`}
    >
      {/* Left Area: Sidebar Toggle & Quick Action */}
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
              ? 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200 text-slate-500 hover:text-slate-900'
              : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline-block">Search commands, ADRs, repos...</span>
          <span className="sm:hidden">Search...</span>
          <kbd
            className={`hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-600'
                : 'bg-white/10 border-white/15 text-neutral-300'
            }`}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Area: Action button, Notifications, Theme toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Create Handoff Primary CTA */}
        <button
          onClick={() => setIsCreateHandoffModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold shadow-sm shadow-[#2563EB]/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start a handoff</span>
          <span className="sm:hidden">Handoff</span>
        </button>

        {/* Notifications Popover */}
        <NotificationPopover />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          id="topbar-theme-toggle"
          data-testid="topbar-theme-toggle"
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              : 'text-neutral-400 hover:text-white hover:bg-white/5 border-white/10'
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
      </div>
    </header>
  );
}
