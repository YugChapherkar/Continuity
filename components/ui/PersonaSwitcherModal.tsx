'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from './Avatar';
import { Search, X, Check, ArrowRight, LogOut, ShieldCheck, Briefcase } from 'lucide-react';
import Link from 'next/link';

export function PersonaSwitcherModal() {
  const {
    isPersonaModalOpen,
    setIsPersonaModalOpen,
    users,
    currentUser,
    setCurrentUser,
    handoffs,
    projects,
  } = useApp();

  const [search, setSearch] = useState('');

  if (!isPersonaModalOpen) return null;

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsPersonaModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="persona-modal-title"
    >
      <div
        className="w-full max-w-2xl bg-[#0D0F10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 id="persona-modal-title" className="text-lg font-semibold text-[#F5F5F2] tracking-tight">
              Switch Employee Perspective
            </h2>
            <p className="text-xs text-[#A0A09D] mt-0.5">
              Instantaneous identity rotation for cross-team verifications and shift handovers.
            </p>
          </div>
          <button
            onClick={() => setIsPersonaModalOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-white/5 bg-[#050606]/40">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name, role, or engineering department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-[#141718] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F2] placeholder-neutral-500 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-white/5">
          {filteredUsers.map((user) => {
            const isCurrent = user.id === currentUser.id;
            const pendingForUser = handoffs.filter(
              (h) => h.recipientId === user.id && h.status === 'Pending'
            ).length;
            const ownedProjectsCount = projects.filter((p) => p.ownerId === user.id).length;

            return (
              <div
                key={user.id}
                className={`pt-2.5 first:pt-0 flex items-center justify-between p-3.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-blue-950/20 border border-blue-500/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar name={user.name} initials={user.initials} size="lg" showIndicator={isCurrent} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#F5F5F2] truncate">{user.name}</span>
                      {isCurrent && (
                        <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          Active Now
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate">{user.role}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-500">
                      <span className="truncate">{user.department}</span>
                      <span aria-hidden="true">·</span>
                      <span className="shrink-0 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-neutral-400" />
                        {ownedProjectsCount} projects
                      </span>
                      {pendingForUser > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="shrink-0 text-amber-400 font-medium">
                            {pendingForUser} pending handoff{pendingForUser > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-4">
                  {isCurrent ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-400 font-medium">
                      <Check className="w-4 h-4" />
                      <span>Current</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCurrentUser(user);
                        setIsPersonaModalOpen(false);
                      }}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-1.5"
                    >
                      <span>Switch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-neutral-500 text-sm">
              No engineering teammates found matching &quot;{search}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#050606] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-trust cryptographic audit log records all persona rotations.</span>
          </div>
          <Link
            href="/login"
            onClick={() => setIsPersonaModalOpen(false)}
            className="flex items-center gap-1.5 text-neutral-300 hover:text-white hover:underline transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out to login screen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
