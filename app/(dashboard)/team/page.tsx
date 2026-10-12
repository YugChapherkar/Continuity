'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import {
  Users,
  Search,
  ArrowRight,
  Briefcase,
  Inbox,
  MapPin,
  Mail,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function TeamDirectoryPage() {
  const { users, currentUser, setCurrentUser, projects, handoffs, openHandoffWithTarget } = useApp();
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const priorityOrder = ['user-jessica', 'user-yash', 'user-shruti'];
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aIdx = priorityOrder.indexOf(a.id);
    const bIdx = priorityOrder.indexOf(b.id);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">
              Team Roster & Custody Directory
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
            Engineering <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">Team Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A0A09D] mt-1">
            Organizational custodians, on-call assignment coverage, and active shift handover responsibilities.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3.5 py-2 rounded-xl font-mono shadow-sm">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Engineering Custodians Active</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter colleagues by name, role, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-[#F5F5F2] placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
        />
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedUsers.map((user) => {
          const isCurrent = user.id === currentUser.id;
          const userProjects = projects.filter(
            (p) => p.ownerId === user.id || p.teamMembers?.some((m) => m.userId === user.id)
          );
          const pendingHandoffs = handoffs.filter(
            (h) => h.recipientId === user.id && h.status === 'Pending'
          );

          return (
            <div
              key={user.id}
              className={`bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-blue-300 dark:border-blue-500/40 ring-1 ring-blue-500/10'
                  : 'border-slate-200 dark:border-white/[0.08] hover:border-blue-400/50 dark:hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                {/* Header: Avatar, Name, Role */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={user.name}
                      initials={user.initials}
                      size="lg"
                      showIndicator={isCurrent}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-base text-slate-900 dark:text-[#F5F5F2]">{user.name}</h2>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">{user.role}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono text-[11px] truncate">
                  {user.department}
                </p>

                {user.bio && (
                  <p className="text-xs text-slate-600 dark:text-[#A0A09D] leading-relaxed line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Location and email */}
                <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-neutral-400 font-mono pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 shrink-0" />
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-mono text-slate-900 dark:text-[#F5F5F2] font-semibold">{userProjects.length}</span>
                    <span className="text-slate-500 dark:text-neutral-400 text-[11px]">Workspaces</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
                    <Inbox className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-mono text-blue-600 dark:text-blue-300 font-semibold">{pendingHandoffs.length}</span>
                    <span className="text-slate-500 dark:text-neutral-400 text-[11px]">Pending</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: 1-Click Hand Off & Dossiers */}
              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const primaryProject = userProjects[0] || projects[0];
                    if (primaryProject) {
                      openHandoffWithTarget(primaryProject.id, user.id);
                    }
                  }}
                  className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-600/15 dark:hover:bg-emerald-600/25 dark:border-emerald-500/30 dark:text-emerald-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  title={`Initiate handoff to ${user.name}`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Hand Off</span>
                </button>
                <Link
                  href="/handoffs"
                  className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-300 dark:border-white/[0.08] transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Dossiers</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
