'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from './Avatar';
import { NotificationPopover } from './NotificationPopover';
import { Search, Plus, UserCheck, ChevronDown } from 'lucide-react';

export function TopBar() {
  const {
    currentUser,
    setIsPersonaModalOpen,
    setIsCreateHandoffModalOpen,
    setIsCommandPaletteOpen,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#050606]/80 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Contextual Title / Quick Search Trigger */}
      <div className="flex items-center gap-4 min-w-0">
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

      {/* Zone 2 & 3: Actions, Persona Switcher Chip, and CTA */}
      <div className="flex items-center gap-3 shrink-0">
        <NotificationPopover />

        {/* Global Persona Chip */}
        <div className="relative group">
          <button
            onClick={() => setIsPersonaModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0D0F10] hover:bg-[#141718] border border-white/10 rounded-xl transition-all"
            title="Switch Employee Perspective"
          >
            <Avatar name={currentUser.name} initials={currentUser.initials} size="xs" showIndicator />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-medium text-[#F5F5F2] leading-none truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-neutral-400 leading-tight truncate max-w-[130px]">
                {currentUser.role}
              </span>
            </div>
            <div className="flex items-center gap-1 pl-1 text-[11px] font-medium text-blue-400">
              <UserCheck className="w-3 h-3" />
              <span className="hidden sm:inline">Switch</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </div>
          </button>
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
