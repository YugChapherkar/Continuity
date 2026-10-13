'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Task, HandoffPackage } from '@/lib/types';
import { TaskOwnershipTimelineModal } from '@/components/ui/TaskOwnershipTimelineModal';
import { TaskBlockerModal } from '@/components/ui/TaskBlockerModal';
import { TaskCommentsModal } from '@/components/ui/TaskCommentsModal';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Inbox,
  Send,
  History,
  MessageSquare,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Sparkles,
  Bot,
  Layers,
  ChevronRight,
  Calendar,
} from 'lucide-react';

export function EmployeeDashboard() {
  const {
    currentUser,
    projects,
    handoffs,
    updates,
    acceptHandoff,
    declineHandoff,
    clarifyHandoff,
    updateTaskStatus,
    submitDailyUpdate,
    openHandoffWithTarget,
    showToast,
  } = useApp();

  // Active task filters
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'IN_PROGRESS' | 'BLOCKED' | 'IN_REVIEW' | 'COMPLETED'>('ALL');
  const [taskSearch, setTaskSearch] = useState('');

  // Selected modals state
  const [selectedTaskForTimeline, setSelectedTaskForTimeline] = useState<Task | null>(null);
  const [selectedTaskForBlocker, setSelectedTaskForBlocker] = useState<Task | null>(null);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<Task | null>(null);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState<Task | null>(null);

  // Status update modal inputs
  const [newStatus, setNewStatus] = useState<Task['status']>('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [statusEvidence, setStatusEvidence] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Incoming handoff actions modal
  const [activeHandoffModal, setActiveHandoffModal] = useState<{
    handoff: HandoffPackage;
    action: 'accept' | 'decline' | 'clarify';
  } | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [isProcessingHandoff, setIsProcessingHandoff] = useState(false);

  // Daily Work Journal Form State
  const [journalProjectId, setJournalProjectId] = useState(projects[0]?.id || '');
  const [journalTaskId, setJournalTaskId] = useState('');
  const [journalCompleted, setJournalCompleted] = useState('');
  const [journalInProgress, setJournalInProgress] = useState('');
  const [journalNextSteps, setJournalNextSteps] = useState('');
  const [journalBlockers, setJournalBlockers] = useState('');
  const [isSubmittingJournal, setIsSubmittingJournal] = useState(false);

  // AI Assistant Quick Inquiry State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<{
    response: string;
    citations: string[];
  } | null>(null);
  const [isQueryingAi, setIsQueryingAi] = useState(false);

  // Gather tasks assigned to current user
  const myTasks = projects.flatMap((p) =>
    (p.tasks || [])
      .filter(
        (t) =>
          t.assigneeId === currentUser.id ||
          t.assignee.toLowerCase() === currentUser.name.toLowerCase()
      )
      .map((t) => ({ ...t, projectName: p.name, projectId: p.id }))
  );

  const inProgressTasks = myTasks.filter((t) => t.status === 'In Progress');
  const blockedTasks = myTasks.filter((t) => t.status === 'Blocked');
  const inReviewTasks = myTasks.filter((t) => t.status === 'In Review');
  const completedTasks = myTasks.filter((t) => t.status === 'Completed' || t.status === 'Done');

  // Filter tasks
  const filteredTasks = myTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.projectName && t.projectName.toLowerCase().includes(taskSearch.toLowerCase()));

    if (!matchesSearch) return false;
    if (taskFilter === 'IN_PROGRESS') return t.status === 'In Progress';
    if (taskFilter === 'BLOCKED') return t.status === 'Blocked';
    if (taskFilter === 'IN_REVIEW') return t.status === 'In Review';
    if (taskFilter === 'COMPLETED') return t.status === 'Completed' || t.status === 'Done';
    return true;
  });

  // Incoming handovers requiring action
  const incomingHandovers = handoffs.filter(
    (h) => h.recipientId === currentUser.id && (h.status === 'Pending' || h.status === 'Clarification Requested')
  );

  // Outgoing handovers sent by me
  const outgoingHandovers = handoffs.filter((h) => h.senderId === currentUser.id);

  // My recorded daily journal entries
  const myJournalEntries = updates.filter((u) => u.employeeId === currentUser.id);

  // Handlers
  const handleConfirmHandoffAction = async () => {
    if (!activeHandoffModal) return;
    const { handoff, action } = activeHandoffModal;

    setIsProcessingHandoff(true);
    try {
      if (action === 'accept') {
        await acceptHandoff(
          handoff.id,
          actionInput.trim() || 'Attested operational readiness and assumed primary custodianship.'
        );
      } else if (action === 'decline') {
        if (!actionInput.trim()) {
          showToast('Please state the reason for declining this handover', 'error');
          return;
        }
        await declineHandoff(handoff.id, actionInput.trim());
      } else if (action === 'clarify') {
        if (!actionInput.trim()) {
          showToast('Please enter the question or clarification required', 'error');
          return;
        }
        await clarifyHandoff(handoff.id, actionInput.trim());
      }
      setActiveHandoffModal(null);
      setActionInput('');
    } finally {
      setIsProcessingHandoff(false);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForStatus) return;

    setIsUpdatingStatus(true);
    try {
      await updateTaskStatus(
        selectedTaskForStatus.projectId || '',
        selectedTaskForStatus.id,
        newStatus,
        statusNote.trim() || undefined
      );
      setSelectedTaskForStatus(null);
      setStatusNote('');
      setStatusEvidence('');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalCompleted.trim() || !journalInProgress.trim() || !journalNextSteps.trim()) {
      showToast('Please fill completed work, in progress, and next steps', 'error');
      return;
    }

    setIsSubmittingJournal(true);
    try {
      await submitDailyUpdate({
        projectId: journalProjectId || projects[0]?.id || '',
        taskId: journalTaskId || undefined,
        completedWork: journalCompleted.trim(),
        inProgress: journalInProgress.trim(),
        nextSteps: journalNextSteps.trim(),
        blockers: journalBlockers.trim() || undefined,
      });
      setJournalCompleted('');
      setJournalInProgress('');
      setJournalNextSteps('');
      setJournalBlockers('');
      setJournalTaskId('');
    } finally {
      setIsSubmittingJournal(false);
    }
  };

  const handleAiInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsQueryingAi(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id,
        },
        body: JSON.stringify({
          query: aiQuery.trim(),
          activeProjectId: projects[0]?.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse({
          response: data.response,
          citations: data.citations || [],
        });
      } else {
        showToast('Unable to complete AI project inquiry', 'error');
      }
    } catch {
      showToast('AI service unreachable', 'error');
    } finally {
      setIsQueryingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Employee Workbench Header & Metrics */}
      <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-xl p-5 lg:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10">
                ACTIVE SHIFT &middot; {currentUser.department}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-neutral-400">ID: {currentUser.employeeId}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Engineer Workbench
            </h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Operational workbench for task execution, lossless handovers, daily journals, and blocker escalation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openHandoffWithTarget(projects[0]?.id || '')}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Task Handover</span>
            </button>
            <Link
              href="/updates"
              className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/10 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>View All Journal Logs</span>
            </Link>
          </div>
        </div>

        {/* 6 Core Real-Time Pulse Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 uppercase">My Assigned Tasks</span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{myTasks.length}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 uppercase">In Progress</span>
            <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{inProgressTasks.length}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 uppercase">Active Blockers</span>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{blockedTasks.length}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 uppercase">In Review</span>
            <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">{inReviewTasks.length}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 uppercase">Completed</span>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{completedTasks.length}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 uppercase">Incoming Handovers</span>
            <div className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400 mt-1">{incomingHandovers.length}</div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          INCOMING HANDOVERS QUEUE (Accept, Decline, Clarify)
         ===================================================================== */}
      {incomingHandovers.length > 0 && (
        <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-orange-200 dark:border-orange-500/20 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Incoming Task & Project Handovers ({incomingHandovers.length})</h2>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Lossless Custodianship Invariant: Ownership will only transfer to you upon your formal acceptance.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingHandovers.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] hover:border-orange-300 dark:hover:border-orange-500/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">{h.id}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{h.projectName}</h3>
                    {h.taskTitle && (
                      <p className="text-xs text-slate-600 dark:text-neutral-300 font-mono mt-0.5">Task: {h.taskTitle}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      (h.readinessCheck?.score || h.completenessScore || 0) >= 75
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 font-semibold'
                        : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                    }`}
                  >
                    Readiness: {h.readinessCheck?.score || h.completenessScore || 0}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-neutral-300 line-clamp-2 bg-white dark:bg-white/[0.02] p-2.5 rounded-lg border border-slate-200/70 dark:border-white/[0.03]">
                  {h.briefing?.executiveSummary || h.note || 'No executive summary attached.'}
                </p>

                {/* Next steps / Pending tasks excerpt */}
                {h.briefing?.nextSteps && h.briefing.nextSteps.length > 0 && (
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                    <span className="text-slate-400 dark:text-neutral-500">Next Step: </span>
                    {h.briefing.nextSteps[0]}
                  </div>
                )}

                {/* Actions: Review & Accept, Decline, Request Clarification */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between gap-2">
                  <Link
                    href={`/handoffs/${h.id}`}
                    className="text-xs font-mono text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                  >
                    Inspect Full Dossier <ExternalLink className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveHandoffModal({ handoff: h, action: 'clarify' });
                        setActionInput('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 transition-colors"
                      title="Request Clarification"
                    >
                      Clarify
                    </button>
                    <button
                      onClick={() => {
                        setActiveHandoffModal({ handoff: h, action: 'decline' });
                        setActionInput('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-colors"
                      title="Decline Handover"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => {
                        setActiveHandoffModal({ handoff: h, action: 'accept' });
                        setActionInput('Attested operational readiness and assumed primary custodianship.');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                    >
                      Accept Handover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          ASSIGNED TASKS WORKBENCH (Update Status, Handover, Blocker, Comments)
         ===================================================================== */}
      <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Active Tasks & Operational Ownership</h2>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400">
              Manage progress, flag blockers for leadership escalation, view ownership lineage, and initiate task handovers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-neutral-400" />
              <input
                type="text"
                placeholder="Filter tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 w-44"
              />
            </div>

            {/* Filter pills */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-0.5 text-xs font-mono">
              {(['ALL', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'COMPLETED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    taskFilter === f ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Task ID & Title</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status & Health</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 dark:text-neutral-500">
                    No matching tasks assigned. Use the filters or check the project workspace.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const statusColors: Record<string, string> = {
                    'To Do': 'bg-slate-100 dark:bg-neutral-500/10 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-neutral-500/20',
                    'In Progress': 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 font-semibold',
                    Blocked: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 font-bold animate-pulse',
                    'In Review': 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
                    'Changes Requested': 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
                    Completed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 font-semibold',
                    Done: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 font-semibold',
                  };

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group">
                      {/* Title & Latest Note */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>{task.id}</span>
                          {task.latestUpdate && (
                            <span className="truncate max-w-xs text-slate-400 dark:text-neutral-500">&middot; {task.latestUpdate}</span>
                          )}
                        </div>
                      </td>

                      {/* Project */}
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-neutral-300">
                        {task.projectName}
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            task.priority === 'P0'
                              ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                              : task.priority === 'P1'
                              ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-white/10'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                              statusColors[task.status] || 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400'
                            }`}
                          >
                            {task.status}
                          </span>
                          {task.blockerDetails && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{task.blockerDetails.status} ({task.blockerDetails.severity})</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-600 dark:text-neutral-300">
                        {task.dueDate || task.deadline || 'No target date'}
                      </td>

                      {/* Action Tray */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Update Status */}
                          <button
                            onClick={() => {
                              setSelectedTaskForStatus(task);
                              setNewStatus(task.status);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                            title="Update Task Status / Progress"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>

                          {/* Send Handover */}
                          <button
                            onClick={() => openHandoffWithTarget(task.projectId || '', undefined)}
                            className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                            title="Compile & Send Task Handover"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Ownership Timeline */}
                          <button
                            onClick={() => setSelectedTaskForTimeline(task)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            title="Inspect Ownership Pedigree"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Blocker Action */}
                          <button
                            onClick={() => setSelectedTaskForBlocker(task)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              task.status === 'Blocked'
                                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                : 'text-slate-400 dark:text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                            title={task.status === 'Blocked' ? 'Manage Blocker Escalation' : 'Report Blocker'}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>

                          {/* Comments */}
                          <button
                            onClick={() => setSelectedTaskForComments(task)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            title="Discussion & Comments"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          DAILY WORK JOURNAL & RECORDED PROGRESS LOG
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Log Today's Work */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daily Work Journal</h2>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">Record completed work and daily commitments.</p>
            </div>
          </div>

          <form onSubmit={handleJournalSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 dark:text-neutral-400 mb-1">Target Project *</label>
              <select
                value={journalProjectId}
                onChange={(e) => setJournalProjectId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-[#0B0D0E]">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 dark:text-neutral-400 mb-1">Related Task (Optional)</label>
              <select
                value={journalTaskId}
                onChange={(e) => setJournalTaskId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">General Project Work</option>
                {myTasks.map((t) => (
                  <option key={t.id} value={t.id} className="dark:bg-[#0B0D0E]">
                    {t.id}: {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 dark:text-neutral-400 mb-1">Completed Work Today *</label>
              <textarea
                rows={2}
                required
                placeholder="What did you complete today?"
                value={journalCompleted}
                onChange={(e) => setJournalCompleted(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 dark:text-neutral-400 mb-1">Current Progress / Focus *</label>
              <input
                type="text"
                required
                placeholder="Currently working on..."
                value={journalInProgress}
                onChange={(e) => setJournalInProgress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 dark:text-neutral-400 mb-1">Next Immediate Steps *</label>
              <input
                type="text"
                required
                placeholder="Planned for tomorrow / next shift..."
                value={journalNextSteps}
                onChange={(e) => setJournalNextSteps(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 dark:text-neutral-400 mb-1">Blockers / Risks (Optional)</label>
              <input
                type="text"
                placeholder="Any blocker to alert Team Leader?"
                value={journalBlockers}
                onChange={(e) => setJournalBlockers(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingJournal}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmittingJournal ? 'Logging...' : 'Post Daily Journal Entry'}</span>
            </button>
          </form>
        </div>

        {/* History of Recent Journal Entries */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Work Journal Timeline</h2>
            <span className="text-xs font-mono text-slate-500 dark:text-neutral-400">{myJournalEntries.length} Recorded Entries</span>
          </div>

          <div className="overflow-y-auto max-h-[460px] space-y-3 flex-1 pr-1">
            {myJournalEntries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-neutral-500 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-neutral-600" />
                <p className="text-xs">No daily entries logged yet.</p>
                <p className="text-[11px] text-slate-400 dark:text-neutral-600">Post your first daily journal update using the form on the left.</p>
              </div>
            ) : (
              myJournalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">{entry.projectName}</span>
                      {entry.taskTitle && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-white/5 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/5">
                          {entry.taskTitle}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-neutral-300 space-y-1">
                    <div>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">Completed: </strong>
                      {entry.completedWork}
                    </div>
                    <div>
                      <strong className="text-blue-700 dark:text-blue-400 font-mono text-[11px]">In Progress: </strong>
                      {entry.inProgress}
                    </div>
                    <div>
                      <strong className="text-purple-700 dark:text-purple-400 font-mono text-[11px]">Next Steps: </strong>
                      {entry.nextSteps}
                    </div>
                    {entry.blockers && (
                      <div className="text-amber-700 dark:text-amber-400">
                        <strong className="font-mono text-[11px]">Blocker: </strong>
                        {entry.blockers}
                      </div>
                    )}
                  </div>

                  {entry.leaderComment && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 mt-2">
                      <strong>Team Leader Feedback:</strong> {entry.leaderComment}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          GROUNDED AI PROJECT ASSISTANT (Never Fabricates, Cites Sources)
         ===================================================================== */}
      <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Project Knowledge Assistant</h2>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400">
              Grounded exclusively in authorized repository files, architecture decision records (ADRs), and tasks. Never exposes secrets or fabricates information.
            </p>
          </div>
        </div>

        <form onSubmit={handleAiInquiry} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a technical or handover question (e.g., 'What are the read barrier bounds in ADR-041?' or 'What is blocking TASK-103?')..."
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isQueryingAi || !aiQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isQueryingAi ? 'Synthesizing...' : 'Inquire'}</span>
          </button>
        </form>

        {aiResponse && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Grounded Knowledge Synthesis
              </span>
              <button
                onClick={() => setAiResponse(null)}
                className="text-[11px] text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white"
              >
                Clear
              </button>
            </div>

            <div className="text-xs text-slate-800 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans bg-white dark:bg-white/[0.01] p-3 rounded-lg border border-slate-200/80 dark:border-white/[0.03]">
              {aiResponse.response}
            </div>

            {aiResponse.citations && aiResponse.citations.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04] flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">Cited Project Sources:</span>
                {aiResponse.citations.map((c, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          MODALS
         ===================================================================== */}
      {/* 1. Task Ownership Timeline Modal */}
      <TaskOwnershipTimelineModal
        task={selectedTaskForTimeline}
        isOpen={Boolean(selectedTaskForTimeline)}
        onClose={() => setSelectedTaskForTimeline(null)}
      />

      {/* 2. Task Blocker Modal */}
      <TaskBlockerModal
        task={selectedTaskForBlocker}
        isOpen={Boolean(selectedTaskForBlocker)}
        onClose={() => setSelectedTaskForBlocker(null)}
      />

      {/* 3. Task Comments Modal */}
      <TaskCommentsModal
        task={selectedTaskForComments}
        isOpen={Boolean(selectedTaskForComments)}
        onClose={() => setSelectedTaskForComments(null)}
      />

      {/* 4. Update Status Modal */}
      {selectedTaskForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0B0D0E] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Update Task Status</h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono truncate max-w-xs">
                  {selectedTaskForStatus.id} &middot; {selectedTaskForStatus.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedTaskForStatus(null)}
                className="text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-neutral-400 mb-1">New State</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Task['status'])}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="To Do" className="dark:bg-[#0B0D0E]">To Do</option>
                  <option value="In Progress" className="dark:bg-[#0B0D0E]">In Progress</option>
                  <option value="In Review" className="dark:bg-[#0B0D0E]">In Review (Submit for Review)</option>
                  <option value="Completed" className="dark:bg-[#0B0D0E]">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-neutral-400 mb-1">Progress Note</label>
                <textarea
                  rows={3}
                  placeholder="Record summary of changes or test commands run..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForStatus(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-600/20"
                >
                  {isUpdatingStatus ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Incoming Handoff Action Modal (Accept, Decline, Clarify) */}
      {activeHandoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0B0D0E] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeHandoffModal.action === 'accept'
                    ? 'Accept & Assume Primary Custodianship'
                    : activeHandoffModal.action === 'decline'
                    ? 'Decline Incoming Handover'
                    : 'Request Clarification on Handover'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
                  {activeHandoffModal.handoff.id} &middot; {activeHandoffModal.handoff.projectName}
                </p>
              </div>
              <button
                onClick={() => setActiveHandoffModal(null)}
                className="text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                {activeHandoffModal.action === 'accept' && (
                  <>
                    By accepting this handover, you attest to operational readiness. Task ownership will be <strong>atomically transferred to you</strong> and recorded with a SHA-256 ledger receipt.
                  </>
                )}
                {activeHandoffModal.action === 'decline' && (
                  <>
                    Declining will reject this transfer. Task ownership will <strong>remain with the original sender</strong>. Please provide a clear explanation below.
                  </>
                )}
                {activeHandoffModal.action === 'clarify' && (
                  <>
                    Requesting clarification pauses the transfer. Task ownership will <strong>remain with the original sender</strong> until all questions are answered.
                  </>
                )}
              </p>

              <div>
                <label className="block text-xs font-mono text-slate-500 dark:text-neutral-400 mb-1">
                  {activeHandoffModal.action === 'accept'
                    ? 'Attestation Signoff Note'
                    : activeHandoffModal.action === 'decline'
                    ? 'Reason for Declining *'
                    : 'Clarification Question / Context Needed *'}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    activeHandoffModal.action === 'accept'
                      ? 'Attested readiness and assumed custodianship...'
                      : activeHandoffModal.action === 'decline'
                      ? 'Prerequisites incomplete / lack capacity to assume ownership...'
                      : 'Please specify the exact deployment command or test evidence...'
                  }
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveHandoffModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmHandoffAction}
                  disabled={isProcessingHandoff}
                  className={`px-5 py-2 rounded-xl font-semibold text-xs text-white transition-colors ${
                    activeHandoffModal.action === 'accept'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : activeHandoffModal.action === 'decline'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {isProcessingHandoff ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
