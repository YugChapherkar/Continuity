'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { CreateProjectModal } from '@/components/ui/CreateProjectModal';
import {
  FolderGit2,
  Search,
  ArrowRight,
  GitCommit,
  FileCode,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function ProjectsPage() {
  const { projects, users, setIsCreateHandoffModalOpen, theme } = useApp();
  const isLight = theme === 'light';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const transitioningCount = projects.filter((p) => p.status === 'Transitioning').length;
  const totalAdrs = projects.reduce((acc, p) => acc + p.decisions.length, 0);

  return (
    <div className="space-y-8">
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">
              Workspaces & Repositories
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
            Engineering <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">Workspaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A0A09D] mt-1">
            Architecture blueprints, decision records, runbooks, and project files.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-[#F5F5F2] text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </button>
          <button
            onClick={() => setIsCreateHandoffModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start a handoff</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-mono font-semibold">Total Workspaces</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-[#F5F5F2] mt-1 font-mono">{projects.length}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium inline-block">100% losslessly tracked</span>
        </div>
        <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-mono font-semibold">In Shift Transition</span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono">{transitioningCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 inline-block">Active handoffs open</span>
        </div>
        <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-mono font-semibold">Architecture ADRs</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-[#F5F5F2] mt-1 font-mono">{totalAdrs}</p>
          <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 inline-block">Ratified decision records</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
          <input
            type="text"
            placeholder="Search workspaces by name, team, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs transition-colors shadow-sm border focus:outline-none focus:border-blue-500 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                : 'bg-[#0E1116] border-white/15 text-[#F5F5F2] placeholder-neutral-400'
            }`}
          />
        </div>

        {/* Status Filter Buttons */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl overflow-x-auto shadow-sm border transition-all ${
            isLight
              ? 'bg-white border-slate-200 shadow-slate-100'
              : 'bg-[#0E1116] border-white/15 shadow-black/50'
          }`}
        >
          {['All', 'Active', 'Transitioning', 'Review Needed', 'Stable'].map((status) => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    : 'text-neutral-200 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const owner = users.find((u) => u.id === project.ownerId);
          const statusColors: Record<string, string> = {
            Active: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
            Transitioning: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
            'Review Needed': 'text-amber-700 dark:text-neutral-300 bg-amber-50 dark:bg-white/5 border-amber-200 dark:border-white/10',
            Stable: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
            'At Risk': 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
            Critical: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
            'Submitted for Final Review': 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
            'In Review': 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
            'Changes Requested': 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
            'Approved for Delivery': 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20',
            Delivered: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
          };
          const badgeStyle = statusColors[project.status] || 'text-slate-600 dark:text-neutral-300 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10';

          return (
            <div
              key={project.id}
              className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-400/50 dark:hover:border-white/20 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-slate-900 dark:text-[#F5F5F2] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                        {project.repositoryUrl}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] rounded-full border font-medium ${badgeStyle}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-[#A0A09D] mt-4 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Key Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 mt-5 py-3 border-y border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <GitCommit className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                    <span>{project.currentVersionId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <FileCode className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                    <span>{project.decisions.length} ADRs</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Users className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                    <span>{project.team}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Team Avatars, Owner & CTA */}
              <div className="mt-5 flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={owner?.name || 'Unassigned'} initials={owner?.initials} size="xs" />
                    <div className="text-[11px]">
                      <span className="text-slate-500 dark:text-neutral-400">Lead: </span>
                      <span className="text-slate-900 dark:text-[#F5F5F2] font-medium">{owner?.name || 'Unassigned'}</span>
                    </div>
                  </div>

                  {project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="hidden sm:flex items-center -space-x-1.5 pl-2 border-l border-slate-200 dark:border-white/10" title={`${project.teamMembers.length} team members`}>
                      {project.teamMembers.slice(0, 3).map((tm) => {
                        const u = users.find((x) => x.id === tm.userId);
                        if (!u) return null;
                        return (
                          <Avatar
                            key={tm.userId}
                            name={u.name}
                            initials={u.initials}
                            size="xs"
                            className="border border-white dark:border-[#0B0D0E]"
                          />
                        );
                      })}
                      {project.teamMembers.length > 3 && (
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 text-[9px] text-slate-700 dark:text-neutral-300 flex items-center justify-center font-mono border border-white dark:border-[#0B0D0E]">
                          +{project.teamMembers.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Link
                  href={`/projects/${project.id}`}
                  className="px-4 py-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 dark:bg-white/5 dark:hover:bg-blue-600 dark:text-neutral-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 border border-slate-200 dark:border-white/[0.08]"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 dark:text-neutral-400 text-sm bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl">
            No workspaces matching your query.
          </div>
        )}
      </div>

      {/* Comprehensive Guided Workspace Questionnaire Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
