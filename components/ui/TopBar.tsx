'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from './Avatar';
import { NotificationPopover } from './NotificationPopover';
import { Search, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function TopBar() {
  const {
    currentUser,
    setIsCreateHandoffModalOpen,
    setIsCommandPaletteOpen,
    isSidebarOpen,
    toggleSidebar,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#050606]/80 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Sidebar Toggle & Quick Search Trigger */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl transition-all cursor-pointer shrink-0"
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-blue-400" />
          )}
        </button>

        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 bg-[#141718] hover:bg-[#1C2022] border border-white/10 rounded-xl text-xs text-neutral-400 hover:text-neutral-200 transition-all w-48 sm:w-72"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Search commands, ADRs, repos...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white/10 text-neutral-400 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 2 & 3: Actions, User Badge, and CTA */}
      <div className="flex items-center gap-3 shrink-0">
        <NotificationPopover />

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0D0F10] border border-white/10 rounded-xl">
          <Avatar name={currentUser.name} initials={currentUser.initials} size="xs" showIndicator />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium text-[#F5F5F2] leading-none truncate max-w-[130px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-neutral-400 leading-tight truncate max-w-[130px]">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={() => setIsCreateHandoffModalOpen(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Start a handoff</span>
        </button>
      </div>
    </header>
  );
}
