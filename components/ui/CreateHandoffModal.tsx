'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Send, AlertCircle, Plus, Trash2, ShieldCheck, CheckCircle2, Clock, Terminal, Check, Users } from 'lucide-react';

export function CreateHandoffModal() {
  const {
    isCreateHandoffModalOpen,
    setIsCreateHandoffModalOpen,
    handoffTarget,
    setHandoffTarget,
    projects,
    users,
    currentUser,
    createHandoff,
    showToast,
  } = useApp();

  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [recipientId, setRecipientId] = useState(
    users.find((u) => u.id !== currentUser.id)?.id || users[0]?.id || ''
  );

  useEffect(() => {
    if (handoffTarget) {
      if (handoffTarget.projectId) {
        setProjectId(handoffTarget.projectId);
      }
      if (handoffTarget.recipientId) {
        setRecipientId(handoffTarget.recipientId);
      }
    }
  }, [handoffTarget]);
  const [note, setNote] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [completedItems, setCompletedItems] = useState<string[]>([
    'CI pipeline green on target commit hash',
    'Verified staging health telemetry and error rates',
  ]);
  const [newCompletedItem, setNewCompletedItem] = useState('');
  const [nextSteps, setNextSteps] = useState<string[]>([
    'Monitor p99 latency during peak traffic epoch',
    'Complete failover verification simulation',
  ]);
  const [newNextStep, setNewNextStep] = useState('');
  const [criticalBlockers, setCriticalBlockers] = useState<string[]>([]);
  const [newBlocker, setNewBlocker] = useState('');
  const [runbookCommands, setRunbookCommands] = useState<string[]>([
    './bin/ctl cluster status',
  ]);
  const [newCommand, setNewCommand] = useState('');
  const [taskId, setTaskId] = useState('');
  const [setupInstructions, setSetupInstructions] = useState('./bin/ctl cluster status --verify');
  const [filesInput, setFilesInput] = useState('src/consensus/raft_state.rs');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateHandoffModalOpen) return null;

  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];

  // Dynamic Completeness & Readiness Calculation (0 - 100%)
  const hasValidSummary = executiveSummary.trim().length >= 20;
  const hasCompletedItems = completedItems.length > 0;
  const hasRunbook = runbookCommands.length > 0;
  const hasNextSteps = nextSteps.length > 0;

  const completenessScore =
    (hasValidSummary ? 30 : executiveSummary.trim().length > 0 ? 15 : 0) +
    (hasCompletedItems ? 25 : 0) +
    (hasRunbook ? 25 : 0) +
    (hasNextSteps ? 20 : 0);

  // Automated Pre-Submission Validation Warnings
  const validationWarnings: string[] = [];
  const validationSuccesses: string[] = [];

  // 1. Task blockers & unassigned tasks check in selected project
  const unresolvedP0Tasks =
    selectedProject?.tasks.filter(
      (t) =>
        (t.priority === 'P0' || (t.status as string) === 'Critical' || t.status === 'Blocked') &&
        t.status !== 'Done' &&
        t.status !== 'Completed'
    ) || [];
  if (unresolvedP0Tasks.length > 0) {
    validationWarnings.push(
      `${unresolvedP0Tasks.length} critical P0 task(s) unresolved: ${unresolvedP0Tasks
        .map((t) => t.title)
        .join(', ')}`
    );
  } else {
    validationSuccesses.push('All critical P0 tasks in workspace resolved');
  }

  const unassignedTasks =
    selectedProject?.tasks.filter(
      (t) => !t.assignee || t.assignee.trim() === '' || t.assignee.toLowerCase() === 'unassigned'
    ) || [];
  if (unassignedTasks.length > 0) {
    validationWarnings.push(
      `${unassignedTasks.length} task(s) are unassigned; pending receiver triage`
    );
  }

  // 2. Executive summary depth check
  if (!hasValidSummary) {
    if (executiveSummary.trim().length === 0) {
      validationWarnings.push('Executive briefing is empty (mandatory)');
    } else {
      validationWarnings.push(
        `Executive briefing is under 20 characters (${executiveSummary.trim().length} chars entered)`
      );
    }
  } else {
    validationSuccesses.push('Executive briefing meets depth threshold');
  }

  // 3. Runbook commands check
  if (!hasRunbook) {
    validationWarnings.push('Runbook commands missing; recipient cannot run diagnostic probes');
  } else {
    validationSuccesses.push(`${runbookCommands.length} runbook command(s) ready`);
  }

  // 4. Next steps check
  if (!hasNextSteps) {
    validationWarnings.push('Immediate next steps missing; shift transition continuity at risk');
  } else {
    validationSuccesses.push(`${nextSteps.length} immediate next step(s) specified`);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executiveSummary.trim()) {
      showToast('Please provide an executive summary for this handoff.', 'error');
      return;
    }

    if (completenessScore < 75) {
      const confirmLowReadiness = window.confirm(
        `Current handoff readiness score is ${completenessScore}% (recommended minimum is 75%). The receiver may lack critical runbook commands or next steps. Proceed anyway?`
      );
      if (!confirmLowReadiness) return;
    }

    setIsSubmitting(true);
    try {
      await createHandoff({
        projectId,
        taskId: taskId || undefined,
        recipientId,
        note: note || `Engineering handoff for ${selectedProject?.name}`,
        executiveSummary,
        completedItems,
        nextSteps,
        criticalBlockers,
        runbookCommands,
        setupInstructions,
        files: filesInput ? filesInput.split(',').map((f) => f.trim()).filter(Boolean) : [],
      });
      setIsCreateHandoffModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => setIsCreateHandoffModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-handoff-title"
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#0D0F11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D0F11]">
          <div>
            <h2 id="create-handoff-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Compile Engineering Handoff Dossier
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Create a lossless, tamper-evident transfer package for shift rotation or team reassignment.
            </p>
          </div>
          <button
            onClick={() => setIsCreateHandoffModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Completeness & Readiness Meter Banner */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/90 dark:bg-[#14171A] border-b border-slate-200 dark:border-white/10 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
                Pre-Handoff Completeness &amp; Readiness
              </span>
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  completenessScore === 100
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : completenessScore >= 75
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                }`}
              >
                {completenessScore}% {completenessScore === 100 ? 'Lossless' : completenessScore >= 75 ? 'Ready' : 'Incomplete'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
              {completenessScore >= 75 ? 'Ready for safe dispatch' : 'Fill missing items (>=75% required)'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                completenessScore === 100
                  ? 'bg-emerald-500'
                  : completenessScore >= 75
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${completenessScore}%` }}
            />
          </div>

          {/* Checklist chips */}
          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
            <span
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-mono transition-colors ${
                hasValidSummary
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                  : 'bg-slate-200/60 text-slate-600 dark:bg-white/5 dark:text-neutral-400 border border-transparent'
              }`}
            >
              {hasValidSummary ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : '○'} Summary (30%)
            </span>
            <span
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-mono transition-colors ${
                hasCompletedItems
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                  : 'bg-slate-200/60 text-slate-600 dark:bg-white/5 dark:text-neutral-400 border border-transparent'
              }`}
            >
              {hasCompletedItems ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : '○'} Completed Milestones (25%)
            </span>
            <span
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-mono transition-colors ${
                hasRunbook
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                  : 'bg-slate-200/60 text-slate-600 dark:bg-white/5 dark:text-neutral-400 border border-transparent'
              }`}
            >
              {hasRunbook ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : '○'} Runbook Commands (25%)
            </span>
            <span
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-mono transition-colors ${
                hasNextSteps
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                  : 'bg-slate-200/60 text-slate-600 dark:bg-white/5 dark:text-neutral-400 border border-transparent'
              }`}
            >
              {hasNextSteps ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : '○'} Next Steps (20%)
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 bg-white dark:bg-[#0D0F11]">
          {/* Lossless Handover Notice */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
            <span>
              <strong>Lossless Custodianship Invariant:</strong> Dispatching this handover does <em>not</em> transfer ownership. Primary ownership transfers atomically only after recipient acceptance or an authorized manager override.
            </span>
          </div>

          {/* Project, Task & Recipient Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Project Workspace
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setTaskId('');
                }}
                className="w-full bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Specific Task (Optional)
              </label>
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
              >
                <option value="">Full Project Scope</option>
                {selectedProject?.tasks?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id}: {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Designated Recipient (Assuming Ownership)
                </label>
                {selectedProject?.team && (
                  <span className="text-[10px] text-blue-500 font-mono">
                    {selectedProject.team}
                  </span>
                )}
              </div>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                {selectedProject?.teamMembers && selectedProject.teamMembers.length > 0 && (
                  <optgroup label="👥 Project Team Members (Recommended)">
                    {selectedProject.teamMembers.map((tm) => {
                      const u = users.find((x) => x.id === tm.userId);
                      if (!u) return null;
                      return (
                        <option key={u.id} value={u.id}>
                          ⭐ {u.name} — {tm.role} ({u.employeeId || 'Team'})
                        </option>
                      );
                    })}
                  </optgroup>
                )}
                <optgroup label="🏢 All Engineering Teammates">
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role}
                    </option>
                  ))}
                </optgroup>
              </select>

              {/* Quick Select Teammate Chips */}
              {selectedProject?.teamMembers && selectedProject.teamMembers.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-neutral-400">Team:</span>
                  {selectedProject.teamMembers.map((tm) => {
                    const u = users.find((x) => x.id === tm.userId);
                    if (!u) return null;
                    const isSelected = recipientId === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setRecipientId(u.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
                            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:border-blue-400'
                        }`}
                      >
                        {u.name.split(' ')[0]} ({tm.role.split(' ')[0]})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Note / Transition Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Handoff Memo / Transition Context
            </label>
            <input
              type="text"
              placeholder="e.g. European shift rotation, sprint handover, release lead transition..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Executive Summary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Executive Briefing Summary <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                {executiveSummary.trim().length} chars {hasValidSummary ? '✓ (>=20 chars)' : '(min 20 chars)'}
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Summarize the operational state, recent changes, key architectural nuances, and what the receiver must verify immediately..."
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Completed Items */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Completed Milestones &amp; Verified Tests
              </label>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">{completedItems.length} items</span>
            </div>
            <div className="space-y-2 mb-2">
              {completedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-slate-800 dark:text-slate-200">
                  <span>✓ {item}</span>
                  <button
                    type="button"
                    onClick={() => setCompletedItems(completedItems.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add completed task or test..."
                value={newCompletedItem}
                onChange={(e) => setNewCompletedItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newCompletedItem.trim()) {
                      setCompletedItems([...completedItems, newCompletedItem.trim()]);
                      setNewCompletedItem('');
                    }
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCompletedItem.trim()) {
                    setCompletedItems([...completedItems, newCompletedItem.trim()]);
                    setNewCompletedItem('');
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-xs text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Immediate Next Steps &amp; Action Items
              </label>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">{nextSteps.length} items</span>
            </div>
            <div className="space-y-2 mb-2">
              {nextSteps.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-slate-800 dark:text-slate-200">
                  <span>→ {step}</span>
                  <button
                    type="button"
                    onClick={() => setNextSteps(nextSteps.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add urgent next step for recipient..."
                value={newNextStep}
                onChange={(e) => setNewNextStep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newNextStep.trim()) {
                      setNextSteps([...nextSteps, newNextStep.trim()]);
                      setNewNextStep('');
                    }
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newNextStep.trim()) {
                    setNextSteps([...nextSteps, newNextStep.trim()]);
                    setNewNextStep('');
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-xs text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Critical Blockers */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Critical Blockers &amp; Risk Nuances (Optional)
              </label>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">{criticalBlockers.length} blockers</span>
            </div>
            <div className="space-y-2 mb-2">
              {criticalBlockers.map((blocker, idx) => (
                <div key={idx} className="flex items-center justify-between bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 px-3 py-2 rounded-lg text-xs text-rose-700 dark:text-rose-400">
                  <span>⚠ {blocker}</span>
                  <button
                    type="button"
                    onClick={() => setCriticalBlockers(criticalBlockers.filter((_, i) => i !== idx))}
                    className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add critical blocker or dependency alert..."
                value={newBlocker}
                onChange={(e) => setNewBlocker(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newBlocker.trim()) {
                      setCriticalBlockers([...criticalBlockers, newBlocker.trim()]);
                      setNewBlocker('');
                    }
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newBlocker.trim()) {
                    setCriticalBlockers([...criticalBlockers, newBlocker.trim()]);
                    setNewBlocker('');
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-xs text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Runbook Commands */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Runbook Verification Commands
              </label>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">{runbookCommands.length} commands</span>
            </div>
            <div className="space-y-2 mb-2">
              {runbookCommands.map((cmd, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-100/90 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200">
                  <span className="truncate">$ {cmd}</span>
                  <button
                    type="button"
                    onClick={() => setRunbookCommands(runbookCommands.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 p-0.5 ml-2 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. ./bin/apollo-ctl cluster status"
                value={newCommand}
                onChange={(e) => setNewCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newCommand.trim()) {
                      setRunbookCommands([...runbookCommands, newCommand.trim()]);
                      setNewCommand('');
                    }
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-[#14171A] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCommand.trim()) {
                    setRunbookCommands([...runbookCommands, newCommand.trim()]);
                    setNewCommand('');
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-xs text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Automated Pre-Submission Validation Warnings Card */}
          <div className="p-4 rounded-xl border transition-all text-xs space-y-2.5 bg-slate-50 dark:bg-[#14171A] border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                {validationWarnings.length > 0 ? (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                <span>Automated Pre-Submission Readiness Audit</span>
              </div>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${
                  validationWarnings.length > 0
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {validationWarnings.length > 0
                  ? `${validationWarnings.length} Warnings Detected`
                  : 'All Checks Verified'}
              </span>
            </div>

            {validationWarnings.length > 0 ? (
              <ul className="space-y-1.5 pt-1 text-slate-700 dark:text-neutral-300">
                {validationWarnings.map((warn, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">⚠</span>
                    <span className="leading-relaxed">{warn}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-emerald-700 dark:text-emerald-400 text-[11px] pt-1">
                ✓ Ready for safe lossless handover. Target commit pinned, runbook verification commands attached, and critical blockers verified.
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#14171A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Pins SHA-256 tree hash and creates immutable audit record.</span>
          </div>
          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateHandoffModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Compiling Dossier...' : 'Dispatch Handoff Package'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
