'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Avatar } from './Avatar';
import { NotificationPopover } from './NotificationPopover';
import { Search, Plus, PanelLeftClose, PanelLeftOpen, Menu, Sun, Moon } from 'lucide-react';

export function TopBar() {
  const {
    currentUser,
    setIsCreateHandoffModalOpen,
    setIsCommandPaletteOpen,
    isSidebarOpen,
    toggleSidebar,
    theme,
    toggleTheme,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#050606]/80 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
      {/* Zone 1: Sidebar Toggle & Quick Search Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl transition-all cursor-pointer shrink-0"
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {/* Desktop icon */}
          <span className="hidden md:inline-flex">
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-blue-400" />
            )}
          </span>
          {/* Mobile hamburger icon */}
          <span className="md:hidden inline-flex">
            <Menu className="w-4 h-4 text-blue-400" />
          </span>
        </button>

        {/* Mobile Brand Mark */}
        <Link href="/" className="md:hidden flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#2563EB]/20">
            C
          </div>
        </Link>

        {/* Quick Search Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 bg-[#141718] hover:bg-[#1C2022] border border-white/10 rounded-xl text-xs text-neutral-400 hover:text-neutral-200 transition-all max-w-[140px] sm:max-w-none sm:w-60 md:w-72"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate hidden sm:inline">Search commands, ADRs, repos...</span>
          <span className="truncate sm:hidden">Search...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white/10 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 2 & 3: Actions, Theme Switcher, User Badge, and CTA */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          data-testid="theme-toggle"
          className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl transition-all cursor-pointer shrink-0"
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

        {/* User Profile Badge */}
        <div className="hidden sm:flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 bg-[#0D0F10] border border-white/10 rounded-xl">
          <Avatar name={currentUser.name} initials={currentUser.initials} size="xs" showIndicator />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#F5F5F2] leading-none truncate max-w-[120px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-neutral-400 leading-tight truncate max-w-[120px]">
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
      </div>
    </header>
  );
}
