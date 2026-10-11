'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
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
} from 'lucide-react';

export default function ProjectWorkspacePage() {
  const routerParams = useParams();
  const projectId = (Array.isArray(routerParams?.id) ? routerParams.id[0] : routerParams?.id) || '';

  const {
    projects,
    users,
    currentUser,
    setIsCreateHandoffModalOpen,
    updateTaskStatus,
    addProjectDecision,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'tasks' | 'files'>('overview');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [expandedAdrs, setExpandedAdrs] = useState<Record<string, boolean>>({ 'ADR-041': true });
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  // New ADR Form State
  const [isAddingAdr, setIsAddingAdr] = useState(false);
  const [adrTitle, setAdrTitle] = useState('');
  const [adrContext, setAdrContext] = useState('');
  const [adrDecision, setAdrDecision] = useState('');
  const [adrConsequences, setAdrConsequences] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Back Link & Quick Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspaces</span>
        </Link>
        <span className="font-mono text-xs text-neutral-500">
          Last Synced: {new Date(project.updatedAt).toLocaleTimeString()} UTC
        </span>
      </div>

      {/* Project Header Banner */}
      <div className="bg-[#0D0F10] border border-white/10 rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">{project.name}</h1>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                {project.currentVersionId}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  project.status === 'Active'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : project.status === 'Transitioning'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                }`}
              >
                {project.status}
              </span>
            </div>

            <p className="text-xs text-[#A0A09D] max-w-3xl leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-2 font-mono">
              <span>Repo: {project.repositoryUrl}</span>
              <span>·</span>
              <span>Team: {project.team}</span>
              <span>·</span>
              <div className="flex items-center gap-1.5 font-sans">
                <span className="text-neutral-500 font-mono">Lead Custodian:</span>
                <Avatar name={owner?.name || ''} initials={owner?.initials} size="xs" />
                <span className="text-[#F5F5F2] font-medium">{owner?.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateHandoffModalOpen(true)}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/30 transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Handoff Workspace</span>
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-white/10 mt-6 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Architecture & ADRs', count: project.decisions.length },
            { id: 'history', label: 'Commit History & Diffs', count: project.versions.length },
            { id: 'tasks', label: 'Tasks & Critical Blockers', count: project.tasks.length },
            { id: 'files', label: 'Files & Specs', count: project.files.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-sm border border-white/15'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-neutral-400">
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
            {/* Architecture Summary */}
            <div className="bg-[#0D0F10] border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F2] mb-3">
                <Layers className="w-4 h-4 text-blue-400" />
                <h2>System Architecture Specification</h2>
              </div>
              <div className="text-xs text-[#A0A09D] leading-relaxed whitespace-pre-line bg-[#050606] p-4 rounded-xl border border-white/5 font-mono">
                {project.architectureSummary}
              </div>
            </div>

            {/* Architecture Decision Records (ADRs) */}
            <div className="bg-[#0D0F10] border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F2]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h2>Architecture Decision Records ({project.decisions.length})</h2>
                </div>
                <button
                  onClick={() => setIsAddingAdr(!isAddingAdr)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs text-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Propose ADR</span>
                </button>
              </div>

              {/* Add ADR Form */}
              {isAddingAdr && (
                <form
                  onSubmit={handleCreateAdr}
                  className="bg-[#141718] border border-blue-500/30 rounded-xl p-4 space-y-3"
                >
                  <h3 className="text-xs font-semibold text-blue-400">Propose New Architecture Decision Record</h3>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Decision Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Implement Monotonic Epoch Heartbeats"
                      value={adrTitle}
                      onChange={(e) => setAdrTitle(e.target.value)}
                      required
                      className="w-full bg-[#050606] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5F5F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Context & Problem Statement</label>
                    <textarea
                      rows={2}
                      placeholder="What friction, latency or failure mode necessitated this choice?"
                      value={adrContext}
                      onChange={(e) => setAdrContext(e.target.value)}
                      className="w-full bg-[#050606] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5F5F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Decision & Implementation</label>
                    <textarea
                      rows={2}
                      placeholder="What was decided? Which pattern was chosen?"
                      value={adrDecision}
                      onChange={(e) => setAdrDecision(e.target.value)}
                      required
                      className="w-full bg-[#050606] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5F5F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Consequences & Trade-offs</label>
                    <input
                      type="text"
                      placeholder="What are the downstream operational impacts?"
                      value={adrConsequences}
                      onChange={(e) => setAdrConsequences(e.target.value)}
                      className="w-full bg-[#050606] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5F5F2]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAdr(false)}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#2563EB] text-white text-xs font-medium rounded-lg"
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
                      className="border border-white/10 rounded-xl overflow-hidden bg-[#050606]/60 transition-colors"
                    >
                      <button
                        onClick={() => toggleAdr(adr.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0" />
                          )}
                          <span className="font-mono text-xs font-semibold text-blue-400">
                            {adr.id}
                          </span>
                          <span className="text-xs font-medium text-[#F5F5F2]">{adr.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400 shrink-0">
                          <span>{adr.date}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {adr.status || 'Accepted'}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 py-4 border-t border-white/5 bg-[#0D0F10]/50 space-y-3 text-xs">
                          <div>
                            <span className="font-semibold text-neutral-300 block mb-1">Context:</span>
                            <p className="text-neutral-400 leading-relaxed">{adr.context}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-300 block mb-1">Decision:</span>
                            <p className="text-blue-300/90 leading-relaxed font-mono text-[11px] bg-blue-950/20 p-2.5 rounded border border-blue-500/20">
                              {adr.decision}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-300 block mb-1">Consequences:</span>
                            <p className="text-neutral-400 leading-relaxed">{adr.consequences}</p>
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
            <div className="bg-[#0D0F10] border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F2]">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <h2>Quickstart Runbook</h2>
                </div>
                <button
                  onClick={() => copyToClipboard(project.quickstartGuide)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  title="Copy full runbook"
                >
                  {copiedCmd === project.quickstartGuide ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-neutral-300 bg-[#050606] p-4 rounded-xl border border-white/5 overflow-x-auto leading-relaxed">
                {project.quickstartGuide}
              </pre>
            </div>

            {/* Quick Context Card */}
            <div className="bg-[#0D0F10] border border-white/10 rounded-2xl p-6 shadow-lg space-y-3 text-xs">
              <h3 className="font-semibold text-[#F5F5F2]">Rotation Readiness Checklist</h3>
              <ul className="space-y-2 text-neutral-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>All ADRs ratified and linked to commit tags</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Staging runbook commands verified reproducible</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Cryptographic commit history pinned</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: HISTORY (COMMITS & DIFFS)
         ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-[#0D0F10] border border-white/10 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-semibold text-[#F5F5F2]">Commit &amp; Release History</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Verifiable release milestones with file insertion/deletion metrics.
              </p>
            </div>
            <span className="font-mono text-xs text-neutral-500">
              {project.versions.length} recorded versions
            </span>
          </div>

          <div className="space-y-4">
            {project.versions.map((ver) => (
              <div
                key={ver.id}
                className="bg-[#050606] border border-white/5 rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                      {ver.id}
                    </span>
                    <span className="font-mono text-xs text-neutral-400">
                      commit {ver.hash}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{ver.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-[#F5F5F2] font-mono leading-relaxed bg-[#0D0F10] p-3 rounded-lg border border-white/5">
                  {ver.commitMessage}
                </p>

                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <div className="flex items-center gap-2">
                    <Avatar name={ver.author.name} size="xs" />
                    <span>Authored by {ver.author.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-500">
                    {ver.changedFilesCount} files changed
                  </span>
                </div>

                {ver.changedFiles.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5 font-mono text-[11px]">
                    {ver.changedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-neutral-400">
                        <span className="truncate">{f.path}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-emerald-400">+{f.insertions}</span>
                          <span className="text-rose-400">-{f.deletions}</span>
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
          TAB 3: TASKS (CRITICAL BLOCKERS & QUEUE)
         ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="bg-[#0D0F10] border border-white/10 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-semibold text-[#F5F5F2]">Workspace Tasks &amp; Blockers</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Toggle status to update operational readiness. Changes are appended to the audit ledger.
              </p>
            </div>
            <span className="font-mono text-xs text-neutral-500">
              {project.tasks.length} active tasks
            </span>
          </div>

          <div className="space-y-3">
            {project.tasks.map((task) => {
              const statusBadge = {
                Critical: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                Blocked: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                'In Progress': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                Done: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
              }[task.status];

              return (
                <div
                  key={task.id}
                  className="bg-[#050606] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-neutral-500">{task.id}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
                        {task.priority}
                      </span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${statusBadge}`}>
                        {task.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#F5F5F2]">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-neutral-400 leading-relaxed">{task.description}</p>
                    )}
                    <div className="text-[11px] text-neutral-500 flex items-center gap-2 pt-1">
                      <span>Assignee: {task.assignee}</span>
                      <span>·</span>
                      <span>Created {task.createdAt}</span>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(['Critical', 'In Progress', 'Done'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateTaskStatus(project.id, task.id, s)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-mono ${
                          task.status === s
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
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
          TAB 4: FILES (FILE BROWSER & CODE VIEWER)
         ========================================================================= */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File list */}
          <div className="bg-[#0D0F10] border border-white/10 rounded-2xl p-4 shadow-lg space-y-2">
            <span className="text-xs font-semibold text-[#F5F5F2] block px-2 pb-2 border-b border-white/10">
              Core Source Tree
            </span>
            <div className="space-y-1">
              {project.files.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                    selectedFileIdx === idx
                      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span className="truncate font-mono">{file.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500 shrink-0">
                    {file.size}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-2 bg-[#0D0F10] border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-xs font-semibold text-[#F5F5F2]">
                  {project.files[selectedFileIdx]?.path}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(project.files[selectedFileIdx]?.contentSnippet || '')}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Copy snippet"
              >
                {copiedCmd === project.files[selectedFileIdx]?.contentSnippet ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <pre className="text-xs font-mono text-neutral-300 bg-[#050606] p-4 rounded-xl border border-white/5 overflow-x-auto leading-relaxed">
              {project.files[selectedFileIdx]?.contentSnippet}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
