'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
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
  UserPlus,
  X,
  Lock,
} from 'lucide-react';

export default function TeamDirectoryPage() {
  const {
    users,
    currentUser,
    projects,
    handoffs,
    openHandoffWithTarget,
    activeRole,
    refreshData,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Employee Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Software Systems Engineer');
  const [department, setDepartment] = useState(currentUser.department || 'Platform Engineering');
  const [password, setPassword] = useState('12345678');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAddEmployee = activeRole === 'Team Leader' || activeRole === 'Admin';

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.inviteEmployee({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim(),
        department: department.trim(),
        teamId: currentUser.teamId,
        password: password.trim() || '12345678',
        systemRole: 'Employee',
      });

      await refreshData();
      showToast(`Employee ${name} successfully created! Credentials are live for login.`, 'success');
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPassword('12345678');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error onboarding employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Team Roster &amp; Custody Directory
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
            Engineering <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">Team Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A0A09D] mt-1">
            Organizational custodians, on-call assignment coverage, and active shift handover responsibilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canAddEmployee && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Onboard Employee</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-3.5 py-2 rounded-xl font-mono shadow-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Engineering Custodians Active</span>
          </div>
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
                    <Avatar name={user.name} initials={user.initials} size="md" showIndicator />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-[#F5F5F2] text-sm">{user.name}</h3>
                        {isCurrent && (
                          <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 font-medium">{user.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 font-semibold">
                    {user.systemRole || 'Employee'}
                  </span>
                </div>

                {/* Details: Dept, Location, Email */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-neutral-400 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-mono text-[11px]">{user.email}</span>
                  </div>
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-[11px]">{user.location}</span>
                    </div>
                  )}
                </div>

                {/* KPI Metrics: Workspaces & Pending Handoffs */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
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
                  className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-600/15 dark:hover:bg-blue-600/25 dark:border-blue-500/30 dark:text-blue-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
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

      {/* Modal: Lead Onboards Employee */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0D0F11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Onboard Pod Employee
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neil Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Company Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="neil.sharma@continuity.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backend Systems Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Platform Infrastructure"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Login Password *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12345678"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 block">
                  The employee can log in immediately with this email and password.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Onboarding...' : 'Onboard Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
