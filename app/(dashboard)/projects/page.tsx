'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
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
  const { projects, users, setIsCreateHandoffModalOpen, createProject } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTeam, setNewProjectTeam] = useState('Core Engineering');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      await createProject({
        name: newProjectName,
        description: newProjectDesc,
        team: newProjectTeam,
        status: 'Active',
      });
      setIsCreateModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch {
      // Handled
    } finally {
      setIsCreating(false);
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">Engineering Workspaces</h1>
          <p className="text-xs text-[#A0A09D] mt-1">
            Centrally governed architecture blueprints, decision records, and active rotation custodians.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#F5F5F2] text-xs font-medium rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </button>
          <button
            onClick={() => setIsCreateHandoffModalOpen(true)}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start a handoff</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-4">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Total Workspaces</span>
          <p className="text-2xl font-bold text-[#F5F5F2] mt-1 font-mono">{projects.length}</p>
          <span className="text-[11px] text-emerald-400 mt-1 inline-block">100% losslessly tracked</span>
        </div>
        <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-4">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">In Shift Transition</span>
          <p className="text-2xl font-bold text-blue-400 mt-1 font-mono">{transitioningCount}</p>
          <span className="text-[11px] text-neutral-400 mt-1 inline-block">Active handoffs open</span>
        </div>
        <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-4">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">Architecture ADRs</span>
          <p className="text-2xl font-bold text-[#F5F5F2] mt-1 font-mono">{totalAdrs}</p>
          <span className="text-[11px] text-neutral-400 mt-1 inline-block">Ratified decision records</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workspaces by name, team, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5F5F2] placeholder-neutral-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-x-auto">
          {['All', 'Active', 'Transitioning', 'Review Needed', 'Stable'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const owner = users.find((u) => u.id === project.ownerId);
          const statusColors = {
            Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            Transitioning: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
            'Review Needed': 'text-neutral-300 bg-white/5 border-white/10',
            Stable: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
          }[project.status];

          return (
            <div
              key={project.id}
              className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-[#F5F5F2] group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {project.repositoryUrl}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] rounded-full border font-medium ${statusColors}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-[#A0A09D] mt-4 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Key Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 mt-5 py-3 border-y border-white/5 text-xs text-neutral-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <GitCommit className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{project.currentVersionId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <FileCode className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{project.decisions.length} ADRs</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{project.team}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Owner & CTA */}
              <div className="mt-5 flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Avatar name={owner?.name || 'Unassigned'} initials={owner?.initials} size="xs" />
                  <div className="text-[11px]">
                    <span className="text-neutral-400">Current Lead: </span>
                    <span className="text-[#F5F5F2] font-medium">{owner?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <Link
                  href={`/projects/${project.id}`}
                  className="px-4 py-2 bg-white/5 hover:bg-[#2563EB] hover:text-white text-neutral-300 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 border border-white/[0.08]"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-400 text-sm bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl">
            No workspaces matching your query.
          </div>
        )}
      </div>

      {/* New Workspace Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0D0F10] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-semibold text-[#F5F5F2]">Create Engineering Workspace</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Initialize a new repository workspace with governed continuity tracking.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Hyperion Observability Mesh"
                  required
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-2.5 text-xs text-[#F5F5F2] placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Responsible Team
                </label>
                <input
                  type="text"
                  value={newProjectTeam}
                  onChange={(e) => setNewProjectTeam(e.target.value)}
                  placeholder="e.g. Edge Infrastructure"
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-2.5 text-xs text-[#F5F5F2] placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Description & Mission Invariants
                </label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Describe system purpose, key invariants, and architecture scope..."
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-[#F5F5F2] placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isCreating ? 'Creating Workspace...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
