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
} from 'lucide-react';

export default function TeamDirectoryPage() {
  const { users, currentUser, setCurrentUser, projects, handoffs } = useApp();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">Engineering Team Directory</h1>
          <p className="text-xs text-[#A0A09D] mt-1">
            Organizational custodians, on-call assignment coverage, and active shift handover responsibilities.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Engineering Custodians Active</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter colleagues by name, role, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F5F2] placeholder-neutral-500 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedUsers.map((user) => {
          const isCurrent = user.id === currentUser.id;
          const userProjects = projects.filter((p) => p.ownerId === user.id);
          const pendingHandoffs = handoffs.filter(
            (h) => h.recipientId === user.id && h.status === 'Pending'
          );

          return (
            <div
              key={user.id}
              className={`bg-[#0B0D0E]/60 backdrop-blur-md border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-blue-500/40'
                  : 'border-white/[0.08] hover:border-white/20'
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
                        <h2 className="font-semibold text-base text-[#F5F5F2]">{user.name}</h2>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 font-medium">{user.role}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 font-mono text-[11px] truncate">
                  {user.department}
                </p>

                {user.bio && (
                  <p className="text-xs text-[#A0A09D] leading-relaxed line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Location and email */}
                <div className="space-y-1.5 text-[11px] text-neutral-400 font-mono pt-2 border-t border-white/[0.06]">
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.06] flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono text-[#F5F5F2]">{userProjects.length}</span>
                    <span className="text-neutral-400 text-[11px]">Projects</span>
                  </div>
                  <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.06] flex items-center gap-2">
                    <Inbox className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono text-blue-300">{pendingHandoffs.length}</span>
                    <span className="text-neutral-400 text-[11px]">Pending</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-3 border-t border-white/[0.06]">
                <Link
                  href="/handoffs"
                  className="w-full py-2 bg-white/5 hover:bg-[#2563EB] hover:text-white text-neutral-300 rounded-xl text-xs font-medium border border-white/[0.08] transition-all flex items-center justify-center gap-2"
                >
                  <span>View Member Dossiers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
