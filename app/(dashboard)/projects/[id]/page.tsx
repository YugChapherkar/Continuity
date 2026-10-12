'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { CreateTaskModal } from '@/components/ui/CreateTaskModal';
import { AddProjectTeamMemberModal } from '@/components/ui/AddProjectTeamMemberModal';
import { EditProjectTeamModal } from '@/components/ui/EditProjectTeamModal';
import { AddProjectFileModal } from '@/components/ui/AddProjectFileModal';
import { TeamRole } from '@/lib/types';
import {
  FolderGit2,
  GitCommit,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Copy,
  Check,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Clock,
  Send,
  Users,
  UserPlus,
  Settings2,
  Radio,
  Trash2,
  MessageSquare,
  ArrowRightLeft,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';

export default function ProjectWorkspacePage() {
  const routerParams = useParams();
  const projectId = (Array.isArray(routerParams?.id) ? routerParams.id[0] : routerParams?.id) || '';

  const {
    projects,
    users,
    currentUser,
    handoffs,
    setIsCreateHandoffModalOpen,
    openHandoffWithTarget,
    removeProjectTeamMember,
    updateProjectTeamMemberRole,
    updateTaskStatus,
    addProjectDecision,
    uploadVersion,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'history' | 'tasks' | 'files'>('overview');
  const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [taskAssigneeTarget, setTaskAssigneeTarget] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [expandedAdrs, setExpandedAdrs] = useState<Record<string, boolean>>({ 'ADR-041': true });
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
  const [fileSearch, setFileSearch] = useState('');

  // New ADR Form State
  const [isAddingAdr, setIsAddingAdr] = useState(false);
  const [adrTitle, setAdrTitle] = useState('');
  const [adrContext, setAdrContext] = useState('');
  const [adrDecision, setAdrDecision] = useState('');
  const [adrConsequences, setAdrConsequences] = useState('');

  // Snapshot ZIP Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [commitMsg, setCommitMsg] = useState('');
  const [baseVerId, setBaseVerId] = useState('');
  const [isSubmittingVersion, setIsSubmittingVersion] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  if (!project) return notFound();

  const owner = users.find((u) => u.id === project.ownerId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const toggleAdr = (id: string) => {
    setExpandedAdrs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateAdr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adrTitle.trim() || !adrDecision.trim()) return;

    addProjectDecision(project.id, {
      title: adrTitle,
      date: new Date().toISOString().split('T')[0],
      context: adrContext || 'Architecture context established by lead.',
      decision: adrDecision,
      consequences: adrConsequences || 'Verified by engineering consensus.',
      status: 'Accepted',
    });

    setIsAddingAdr(false);
    setAdrTitle('');
    setAdrContext('');
    setAdrDecision('');
    setAdrConsequences('');
  };

  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Please select a ZIP snapshot archive', 'error');
      return;
    }
    if (!commitMsg.trim()) {
      showToast('Commit message is required', 'error');
      return;
    }

    setIsSubmittingVersion(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('commitMessage', commitMsg);
      if (baseVerId) formData.append('baseVersionId', baseVerId);

      await uploadVersion(project.id, formData);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setCommitMsg('');
    } catch {
      // error toast shown in AppContext
    } finally {
      setIsSubmittingVersion(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link & Quick Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspaces</span>
        </Link>
        <span className="font-mono text-xs text-slate-500 dark:text-neutral-500">
          Last Synced: {new Date(project.updatedAt).toLocaleTimeString()} UTC
        </span>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5F2]">{project.name}</h1>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 font-semibold">
                {project.currentVersionId}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  project.status === 'Active'
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                    : project.status === 'Transitioning'
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
                    : 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
                }`}
              >
                {project.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A0A09D] max-w-3xl leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-neutral-400 pt-2 font-mono">
              <span>Repo: {project.repositoryUrl}</span>
              <span className="text-slate-300 dark:text-neutral-600">&bull;</span>
              <span>Team: {project.team}</span>
              <span className="text-slate-300 dark:text-neutral-600">&bull;</span>
              <div className="flex items-center gap-1.5 font-sans">
                <span className="text-slate-500 dark:text-neutral-500 font-mono">Lead Custodian:</span>
                <Avatar name={owner?.name || ''} initials={owner?.initials} size="xs" />
                <span className="text-slate-900 dark:text-[#F5F5F2] font-semibold">{owner?.name}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddFileModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/10 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Add a new source file or specification to this workspace"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>+ Add File</span>
            </button>

            <button
              onClick={() => setIsAddTeamMemberModalOpen(true)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/10 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Add a colleague to collaborate on this workspace pod"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{(project.teamMembers || []).length > 0 ? 'Add Teammate' : 'Form Team Pod'}</span>
            </button>

            <button
              onClick={() => setIsCreateHandoffModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Handoff Workspace</span>
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-200 dark:border-white/[0.08] mt-6 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Summary & Architecture', count: project.decisions.length },
            { id: 'files', label: 'Source Files & Specs', count: project.files.length },
            { id: 'team', label: 'Team Pod & Roster', count: (project.teamMembers || []).length },
            { id: 'tasks', label: 'Tasks & Critical Blockers', count: project.tasks.length },
            { id: 'history', label: 'Commit History & Snapshots', count: project.versions.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-medium'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-black/30 text-slate-700 dark:text-neutral-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW (ARCHITECTURE & ADRs)
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Executive Workspace Summary */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#F5F5F2]">
                  <FolderGit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2>Project Overview</h2>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 font-semibold">
                  {project.currentVersionId}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                {project.description}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-500 uppercase font-mono block">Responsible Team</span>
                  <strong className="text-slate-900 dark:text-white text-xs">{project.team}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-500 uppercase font-mono block">Current Custodian</span>
                  <strong className="text-slate-900 dark:text-white text-xs">{owner?.name || 'Unassigned'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-500 uppercase font-mono block">Source Files</span>
                  <strong className="text-slate-900 dark:text-white text-xs">{project.files.length} registered</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-500 uppercase font-mono block">Ratified ADRs</span>
                  <strong className="text-slate-900 dark:text-white text-xs">{project.decisions.length} records</strong>
                </div>
              </div>
            </div>

            {/* Architecture Summary */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#F5F5F2] mb-3">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2>System Architecture Specification</h2>
              </div>
              <div className="text-xs text-slate-800 dark:text-[#A0A09D] leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200 dark:border-white/[0.06] font-mono">
                {project.architectureSummary}
              </div>
            </div>

            {/* Repository Files & Specs Preview */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#F5F5F2]">
                  <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2>Source Files &amp; Specs ({project.files.length})</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddFileModalOpen(true)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-neutral-200 rounded-lg flex items-center gap-1 transition-colors border border-slate-200 dark:border-white/[0.08] cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Add File</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Code Tree &rarr;</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.files.map((file, idx) => (
                  <div
                    key={file.path}
                    onClick={() => {
                      setSelectedFileIdx(idx);
                      setActiveTab('files');
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.06] hover:border-blue-400/50 dark:hover:border-white/15 transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900 dark:text-[#F5F5F2] group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                        <FileCode className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono truncate mt-0.5">
                        {file.path}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-neutral-400 shrink-0">
                      {file.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Decision Records (ADRs) */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#F5F5F2]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2>Architecture Decision Records ({project.decisions.length})</h2>
                </div>
                <button
                  onClick={() => setIsAddingAdr(!isAddingAdr)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-white/[0.08] cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Propose ADR</span>
                </button>
              </div>

              {/* Add ADR Form */}
              {isAddingAdr && (
                <form
                  onSubmit={handleCreateAdr}
                  className="bg-slate-50 dark:bg-white/[0.03] border border-blue-500/30 rounded-xl p-4 space-y-3"
                >
                  <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400">Propose New Architecture Decision Record</h3>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-400 mb-1">Decision Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Implement Monotonic Epoch Heartbeats"
                      value={adrTitle}
                      onChange={(e) => setAdrTitle(e.target.value)}
                      required
                      className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-[#F5F5F2] focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-400 mb-1">Context & Problem Statement</label>
                    <textarea
                      rows={2}
                      placeholder="What friction, latency or failure mode necessitated this choice?"
                      value={adrContext}
                      onChange={(e) => setAdrContext(e.target.value)}
                      className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-[#F5F5F2] focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-400 mb-1">Decision & Implementation</label>
                    <textarea
                      rows={2}
                      placeholder="What was decided? Which pattern was chosen?"
                      value={adrDecision}
                      onChange={(e) => setAdrDecision(e.target.value)}
                      required
                      className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-[#F5F5F2] focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-400 mb-1">Consequences & Trade-offs</label>
                    <input
                      type="text"
                      placeholder="What are the downstream operational impacts?"
                      value={adrConsequences}
                      onChange={(e) => setAdrConsequences(e.target.value)}
                      className="w-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-[#F5F5F2] focus:outline-none focus:border-blue-500 shadow-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAdr(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                    >
                      Ratify Decision
                    </button>
                  </div>
                </form>
              )}

              {/* ADR Expandable Accordion */}
              <div className="space-y-3">
                {project.decisions.map((adr) => {
                  const isExpanded = expandedAdrs[adr.id];
                  return (
                    <div
                      key={adr.id}
                      className="border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-hidden bg-slate-50/50 dark:bg-white/[0.02] transition-colors"
                    >
                      <button
                        onClick={() => toggleAdr(adr.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-neutral-500 shrink-0" />
                          )}
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {adr.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-[#F5F5F2]">{adr.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-neutral-400 shrink-0">
                          <span>{adr.date}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-semibold">
                            {adr.status || 'Accepted'}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 py-4 border-t border-slate-200 dark:border-white/[0.06] bg-white dark:bg-black/20 space-y-3 text-xs">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-neutral-300 block mb-1">Context:</span>
                            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">{adr.context}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-neutral-300 block mb-1">Decision:</span>
                            <p className="text-blue-800 dark:text-blue-300/90 leading-relaxed font-mono text-[11px] bg-blue-50 dark:bg-blue-950/20 p-2.5 rounded border border-blue-200 dark:border-blue-500/20">
                              {adr.decision}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-neutral-300 block mb-1">Consequences:</span>
                            <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">{adr.consequences}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Runbook & Quickstart Guide */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#F5F5F2]">
                  <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2>Quickstart Runbook</h2>
                </div>
                <button
                  onClick={() => copyToClipboard(project.quickstartGuide)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Copy full runbook"
                >
                  {copiedCmd === project.quickstartGuide ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-800 dark:text-neutral-300 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200 dark:border-white/[0.06] overflow-x-auto leading-relaxed">
                {project.quickstartGuide}
              </pre>
            </div>

            {/* Team Pod Quick Snapshot Card */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#F5F5F2]">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3>Project Team Pod</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('team')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  Manage Roster &rarr;
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-neutral-400">Pod:</span>
                  <strong className="text-slate-900 dark:text-[#F5F5F2]">{project.team}</strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-neutral-400">Active Roster:</span>
                  <div className="flex items-center -space-x-1.5">
                    {(project.teamMembers || []).slice(0, 4).map((tm) => {
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
                    {(project.teamMembers || []).length > 4 && (
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] text-slate-700 dark:text-neutral-300 flex items-center justify-center font-mono border border-slate-200 dark:border-[#0B0D0E]">
                        +{(project.teamMembers || []).length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeamMemberModalOpen(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Add Teammate</span>
                </button>
                <button
                  type="button"
                  onClick={() => openHandoffWithTarget(project.id)}
                  className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Initiate handoff"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Handoff</span>
                </button>
              </div>
            </div>

            {/* Quick Context Card */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-3 text-xs">
              <h3 className="font-semibold text-slate-900 dark:text-[#F5F5F2]">Rotation Readiness Checklist</h3>
              <ul className="space-y-2 text-slate-600 dark:text-neutral-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>All ADRs ratified and linked to commit tags</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Staging runbook commands verified reproducible</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Cryptographic commit history pinned</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: TEAM POD & ROSTER (WORK TOGETHER & HANDOFF)
         ========================================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Team Pod Header Banner */}
          <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/25 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5F2]">
                        {project.team || 'Engineering Pod'}
                      </h2>
                      <button
                        onClick={() => setIsEditTeamModalOpen(true)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="Configure team pod name & details"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                    {project.teamChannel && (
                      <span className="text-xs font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>{project.teamChannel}</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-[#A0A09D] max-w-2xl leading-relaxed">
                  {project.teamDescription ||
                    'Engineers collaborating on this workspace, maintaining code quality, architecture decisions, and zero-loss shift handoffs.'}
                </p>

                {/* Team Pod Metrics Chips */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-slate-500 dark:text-neutral-400">Members:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{(project.teamMembers || []).length}</strong>
                  </div>

                  {(() => {
                    const primaryOnCallMember = (project.teamMembers || []).find((m) => m.isPrimaryOnCall);
                    const onCallUser = primaryOnCallMember ? users.find((u) => u.id === primaryOnCallMember.userId) : null;
                    return onCallUser ? (
                      <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-amber-700 dark:text-neutral-400">Primary On-Call:</span>
                        <strong className="text-amber-900 dark:text-amber-200 font-semibold">{onCallUser.name}</strong>
                      </div>
                    ) : null;
                  })()}

                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-slate-500 dark:text-neutral-400">Workspace Tasks:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{project.tasks.length}</strong>
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setIsEditTeamModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Configure Pod</span>
                </button>

                <button
                  onClick={() => setIsAddTeamMemberModalOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Teammate</span>
                </button>

                <button
                  onClick={() => openHandoffWithTarget(project.id)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Initiate Handoff</span>
                </button>
              </div>
            </div>
          </div>

          {/* Collaborative Teammates Roster Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F5F2]">Teammates &amp; Responsibilities</h3>
                <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                  Engineers working on this project. Assign tasks, view shift coverage, or hand off ownership.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-neutral-500">
                {(project.teamMembers || []).length} teammates active
              </span>
            </div>

            {(!project.teamMembers || project.teamMembers.length === 0) ? (
              <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">No Team Members Formed Yet</h4>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Form a dedicated engineering team for this project to collaborate together on tasks, ratify ADRs, and execute seamless shift handoffs.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddTeamMemberModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Form Team &amp; Add Teammates</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {project.teamMembers.map((member) => {
                  const user = users.find((u) => u.id === member.userId);
                  if (!user) return null;

                  const isCurrentUser = user.id === currentUser.id;
                  const memberTasks = project.tasks.filter(
                    (t) => t.assignee?.toLowerCase() === user.name.toLowerCase()
                  );
                  const criticalTasks = memberTasks.filter(
                    (t) => t.priority === 'P0' || (t.status as string) === 'Critical' || t.status === 'Blocked'
                  );

                  return (
                    <div
                      key={member.userId}
                      className={`bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all group ${
                        member.isPrimaryOnCall
                          ? 'border-amber-300 dark:border-amber-500/35 hover:border-amber-400 dark:hover:border-amber-500/50'
                          : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Member Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar
                              name={user.name}
                              initials={user.initials}
                              size="md"
                              showIndicator={isCurrentUser || member.isPrimaryOnCall}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-semibold text-sm text-slate-900 dark:text-[#F5F5F2] truncate">
                                  {user.name}
                                </h4>
                                {user.employeeId && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-neutral-300 shrink-0">
                                    {user.employeeId}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {/* Role Badge */}
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                member.role === 'Lead'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 font-semibold'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-neutral-300 dark:border-white/15'
                              }`}
                            >
                              {member.role}
                            </span>
                            {member.isPrimaryOnCall && (
                              <span className="text-[9px] font-mono text-amber-700 dark:text-amber-400 flex items-center gap-1 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                On-Call
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Responsibility Description */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-xs shadow-2xs">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-500 block mb-1">
                            Focus Area &bull; Responsibility
                          </span>
                          <p className="text-slate-700 dark:text-neutral-300 text-xs leading-relaxed">
                            {member.responsibility}
                          </p>
                        </div>

                        {/* Tasks Assigned */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 dark:text-neutral-400">Assigned Tasks:</span>
                            <span className="font-mono text-slate-700 dark:text-neutral-300">
                              {memberTasks.length} {memberTasks.length === 1 ? 'task' : 'tasks'}
                              {criticalTasks.length > 0 && (
                                <strong className="text-rose-600 dark:text-rose-400 ml-1">({criticalTasks.length} P0)</strong>
                              )}
                            </span>
                          </div>

                          {memberTasks.length > 0 ? (
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                              {memberTasks.slice(0, 2).map((t) => (
                                <div
                                  key={t.id}
                                  className="text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex items-center justify-between gap-2"
                                >
                                  <span className="truncate text-slate-800 dark:text-neutral-300">{t.title}</span>
                                  <span
                                    className={`text-[9px] font-mono px-1 py-0.2 rounded shrink-0 ${
                                      t.priority === 'P0'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-transparent font-semibold'
                                        : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-neutral-400'
                                    }`}
                                  >
                                    {t.priority}
                                  </span>
                                </div>
                              ))}
                              {memberTasks.length > 2 && (
                                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block pt-0.5">
                                  + {memberTasks.length - 2} more tasks
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 dark:text-neutral-500 italic">
                              No active tasks assigned
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Member Actions */}
                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                        {/* 1-Click Handoff */}
                        <button
                          type="button"
                          onClick={() => {
                            openHandoffWithTarget(project.id, member.userId);
                            showToast(`Initiating handoff to ${user.name}...`, 'info');
                          }}
                          className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/15 dark:hover:bg-emerald-600/25 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          title={`Initiate verified handoff to ${user.name}`}
                        >
                          <Send className="w-3 h-3" />
                          <span>Hand Off</span>
                        </button>

                        {/* Assign Task */}
                        <button
                          type="button"
                          onClick={() => {
                            setTaskAssigneeTarget(user.name);
                            setIsCreateTaskModalOpen(true);
                          }}
                          className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                          title={`Assign a new task to ${user.name}`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Task</span>
                        </button>

                        {/* Role selector */}
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateProjectTeamMemberRole(
                              project.id,
                              member.userId,
                              e.target.value as TeamRole
                            )
                          }
                          className="py-1.5 px-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 rounded-lg text-[10px] focus:outline-none cursor-pointer shadow-xs"
                          title="Change team role"
                        >
                          <option value="Lead" className="bg-white dark:bg-[#0D0F11] text-slate-900 dark:text-white">Lead</option>
                          <option value="Member" className="bg-white dark:bg-[#0D0F11] text-slate-900 dark:text-white">Member</option>
                        </select>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove ${user.name} from the ${project.team} team?`)) {
                              removeProjectTeamMember(project.id, member.userId);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove teammate from project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team Collaboration Workflow & Recent Handoffs Board */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* How Team Works Together Card */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3>Team Collaboration</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                Shared guidelines for coordinating development and project handoffs:
              </p>
              <div className="space-y-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-neutral-200">Shared Ownership &amp; Tasks</h5>
                    <p className="text-[11px] text-slate-600 dark:text-neutral-400 mt-0.5">
                      Assign tasks, track critical P0 blockers, and commit release snapshots collaboratively under a single team charter.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-neutral-200">Continuous ADR Ratification</h5>
                    <p className="text-[11px] text-slate-600 dark:text-neutral-400 mt-0.5">
                      Every architectural decision is ratified by team consensus and permanently pinned to git hashes.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 dark:text-neutral-200">1-Click Teammate Shift Handoff</h5>
                    <p className="text-[11px] text-slate-600 dark:text-neutral-400 mt-0.5">
                      Rotate on-call coverage or pass project leadership to another teammate with cryptographic audit trail verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Handoffs in this Project */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3>Project Handoff History</h3>
                </div>
                <Link
                  href="/handoffs"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  All Handoffs &rarr;
                </Link>
              </div>

              {(() => {
                const projectHandoffs = handoffs.filter((h) => h.projectId === project.id);
                if (projectHandoffs.length === 0) {
                  return (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-white/[0.06] rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                      No handoffs generated for this project yet. Use &ldquo;Hand Off&rdquo; on any teammate card to initiate.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    {projectHandoffs.map((ho) => {
                      const sender = users.find((u) => u.id === ho.senderId);
                      const recipient = users.find((u) => u.id === ho.recipientId);

                      return (
                        <div
                          key={ho.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                                {ho.id}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                                  ho.status === 'Accepted'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                                }`}
                              >
                                {ho.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-800 dark:text-neutral-300">
                              <strong>{sender?.name || 'Sender'}</strong>
                              <span className="text-slate-400 dark:text-neutral-500">&rarr;</span>
                              <strong>{recipient?.name || 'Recipient'}</strong>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-neutral-400 truncate max-w-sm">
                              {ho.note || ho.briefing.executiveSummary}
                            </p>
                          </div>

                          <Link
                            href={`/handoffs/${ho.id}`}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-white/10 whitespace-nowrap shrink-0 transition-colors shadow-2xs"
                          >
                            View Dossier
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HISTORY (COMMITS & DIFFS)
         ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#F5F5F2]">Commit &amp; Release History</h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                Verifiable release milestones with file insertion/deletion metrics.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-500 dark:text-neutral-500">
                {project.versions.length} recorded versions
              </span>
              <button
                onClick={() => {
                  setBaseVerId(project.currentVersionId || project.versions[0]?.id || '');
                  setIsUploadModalOpen(true);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Snapshot (ZIP)</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {project.versions.map((ver) => (
              <div
                key={ver.id}
                className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl p-5 space-y-3 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 px-2 py-0.5 rounded">
                      {ver.id}
                    </span>
                    <span className="font-mono text-xs text-slate-500 dark:text-neutral-400">
                      commit {ver.hash}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{ver.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-800 dark:text-[#F5F5F2] font-mono leading-relaxed bg-white dark:bg-black/20 p-3 rounded-lg border border-slate-200 dark:border-white/[0.06]">
                  {ver.commitMessage}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400 pt-1">
                  <div className="flex items-center gap-2">
                    <Avatar name={ver.author.name} size="xs" />
                    <span className="font-medium text-slate-800 dark:text-neutral-300">Authored by {ver.author.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-neutral-500">
                    {ver.changedFilesCount} files changed
                  </span>
                </div>

                {ver.changedFiles.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] space-y-1.5 font-mono text-[11px]">
                    {ver.changedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-600 dark:text-neutral-400">
                        <span className="truncate">{f.path}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{f.insertions}</span>
                          <span className="text-rose-600 dark:text-rose-400 font-medium">-{f.deletions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: TASKS (CRITICAL BLOCKERS & QUEUE)
         ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#F5F5F2]">Workspace Tasks &amp; Blockers</h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                Toggle status to update operational readiness. Changes are appended to the audit ledger.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-500 dark:text-neutral-500">
                {project.tasks.length} active tasks
              </span>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {project.tasks.map((task) => {
              const statusBadge: Record<string, string> = {
                Backlog: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-neutral-400 dark:border-white/10',
                'To Do': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-neutral-300 dark:border-white/10',
                'In Progress': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
                Blocked: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
                'In Review': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
                'Changes Requested': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
                Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
                Critical: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
                Done: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
              };
              const badgeClass = statusBadge[task.status] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-neutral-300 dark:border-white/10';

              const isOverdue =
                task.deadline &&
                task.status !== 'Done' &&
                task.status !== 'Completed' &&
                new Date(task.deadline).getTime() < new Date().setHours(0, 0, 0, 0);

              return (
                <div
                  key={task.id}
                  className={`bg-slate-50 dark:bg-white/[0.02] border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors shadow-2xs ${
                    isOverdue ? 'border-rose-300 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-500/[0.03]' : 'border-slate-200 dark:border-white/[0.06]'
                  }`}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-500 dark:text-neutral-500">{task.id}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-white/5 text-slate-700 dark:text-neutral-400 font-semibold">
                        {task.priority}
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold ${badgeClass}`}>
                        {task.status}
                      </span>
                      {task.deadline && (
                        <span
                          className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40 font-semibold'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-neutral-400 dark:border-white/10'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{isOverdue ? `OVERDUE (due ${task.deadline})` : `Due ${task.deadline}`}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F5F5F2]">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">{task.description}</p>
                    )}
                    <div className="text-[11px] text-slate-500 dark:text-neutral-500 flex flex-wrap items-center gap-2 pt-1 font-mono">
                      <span>Assignee: {task.assignee}</span>
                      <span>&bull;</span>
                      <span>Created {task.createdAt}</span>
                      {task.deadline && (
                        <>
                          <span>&bull;</span>
                          <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                            Target: {task.deadline}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(['In Progress', 'Blocked', 'In Review', 'Completed'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateTaskStatus(project.id, task.id, s)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-mono cursor-pointer ${
                          task.status === s
                            ? 'bg-blue-600 text-white shadow-sm font-semibold'
                            : 'bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06] shadow-2xs'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: FILES & SOURCE CODE (FULL CODE STUDIO & EXPLORER)
         ========================================================================= */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File list / Tree Explorer */}
          <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-[#F5F5F2] block">
                  Source Tree Explorer
                </span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono">
                  {project.files.length} registered file(s)
                </span>
              </div>
              <button
                onClick={() => setIsAddFileModalOpen(true)}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                title="Add a new file to this project"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add File</span>
              </button>
            </div>

            {/* File search filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filter files by name or path..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-[#F5F5F2] placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono shadow-xs"
              />
            </div>

            {/* Filtered File items */}
            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
              {project.files
                .map((file, originalIdx) => ({ file, originalIdx }))
                .filter(({ file }) =>
                  !fileSearch.trim() ||
                  file.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
                  file.path.toLowerCase().includes(fileSearch.toLowerCase())
                )
                .map(({ file, originalIdx }) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileIdx(originalIdx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      selectedFileIdx === originalIdx
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-500/30 font-semibold shadow-xs'
                        : 'text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-4 h-4 shrink-0 ${selectedFileIdx === originalIdx ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-neutral-500'}`} />
                      <div className="min-w-0">
                        <span className="truncate font-mono block text-xs font-medium">{file.name}</span>
                        <span className="truncate font-mono block text-[10px] text-slate-500 dark:text-neutral-500">{file.path}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-mono text-[10px] text-slate-500 dark:text-neutral-400">
                        {file.size}
                      </span>
                      {file.type && (
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 uppercase">
                          {file.type}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Code Viewer & File Inspector */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4">
            {project.files[selectedFileIdx] ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.08] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-[#F5F5F2]">
                        {project.files[selectedFileIdx].name}
                      </h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 font-semibold">
                        {project.files[selectedFileIdx].type || 'code'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                      Path: {project.files[selectedFileIdx].path} &bull; Size: {project.files[selectedFileIdx].size}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(project.files[selectedFileIdx]?.contentSnippet || '')}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Copy snippet"
                    >
                      {copiedCmd === project.files[selectedFileIdx]?.contentSnippet ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Code container with line numbers */}
                <div className="bg-slate-950 dark:bg-[#050608] rounded-xl border border-slate-800 dark:border-white/[0.08] overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 dark:bg-white/[0.02] border-b border-slate-800 dark:border-white/[0.06] text-[11px] font-mono text-slate-400 dark:text-neutral-500">
                    <span>{project.files[selectedFileIdx].path}</span>
                    <span>UTF-8 &bull; Read-Only Preview</span>
                  </div>

                  <div className="p-4 overflow-x-auto max-h-[550px] flex font-mono text-xs leading-relaxed">
                    {/* Line numbers column */}
                    <div className="select-none text-slate-500 dark:text-neutral-600 text-right pr-4 border-r border-slate-800 dark:border-white/10 shrink-0">
                      {(project.files[selectedFileIdx].contentSnippet || '')
                        .split('\n')
                        .map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                    </div>

                    {/* Code lines */}
                    <pre className="text-slate-200 dark:text-neutral-200 pl-4 whitespace-pre overflow-x-visible">
                      {project.files[selectedFileIdx].contentSnippet}
                    </pre>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-500 font-mono">
                  <span>
                    Lines: {(project.files[selectedFileIdx].contentSnippet || '').split('\n').length}
                  </span>
                  <span>Indexed for RAG semantic search</span>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 dark:text-neutral-500 text-xs">
                Select a file from the source tree to preview.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Snapshot ZIP Upload Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0D0F10] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F5F2]">Commit Snapshot (ZIP Archive)</h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Upload project snapshot to trigger versioning, diffing, and RAG indexing.
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadVersion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Select Snapshot ZIP File
                </label>
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                  className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-[#F5F5F2] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Commit Message
                </label>
                <textarea
                  rows={2}
                  value={commitMsg}
                  onChange={(e) => setCommitMsg(e.target.value)}
                  placeholder="e.g. feat(raft): speculative read barriers with monotonic leases [ADR-041]"
                  required
                  className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-[#F5F5F2] placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Base Version ID (Concurrency Guard)
                </label>
                <input
                  type="text"
                  value={baseVerId}
                  onChange={(e) => setBaseVerId(e.target.value)}
                  placeholder="e.g. v2.4.0"
                  className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-[#F5F5F2] font-mono placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 shadow-xs"
                />
                <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-1">
                  Protects against race conditions. Stale base versions are rejected with HTTP 409 Conflict.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVersion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingVersion ? 'Uploading & Indexing...' : 'Commit Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        projectId={project.id}
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false);
          setTaskAssigneeTarget('');
        }}
        initialAssignee={taskAssigneeTarget}
      />

      {/* Add Project Team Member Modal */}
      <AddProjectTeamMemberModal
        project={project}
        isOpen={isAddTeamMemberModalOpen}
        onClose={() => setIsAddTeamMemberModalOpen(false)}
      />

      {/* Configure Project Team Pod Modal */}
      <EditProjectTeamModal
        project={project}
        isOpen={isEditTeamModalOpen}
        onClose={() => setIsEditTeamModalOpen(false)}
      />

      {/* Add Project File Modal */}
      <AddProjectFileModal
        projectId={project.id}
        isOpen={isAddFileModalOpen}
        onClose={() => setIsAddFileModalOpen(false)}
        onFileAdded={(newF) => {
          const idx = project.files.findIndex((f) => f.path === newF.path);
          if (idx >= 0) {
            setSelectedFileIdx(idx);
          } else {
            setSelectedFileIdx(project.files.length);
          }
          setActiveTab('files');
        }}
      />
    </div>
  );
}
