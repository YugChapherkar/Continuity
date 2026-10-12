'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Send, AlertCircle, Plus, Trash2, ShieldCheck, CheckCircle2, Clock, Terminal, Check } from 'lucide-react';

export function CreateHandoffModal() {
  const {
    isCreateHandoffModalOpen,
    setIsCreateHandoffModalOpen,
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
        recipientId,
        note: note || `Engineering handoff for ${selectedProject?.name}`,
        executiveSummary,
        completedItems,
        nextSteps,
        criticalBlockers,
        runbookCommands,
      });
      setIsCreateHandoffModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsCreateHandoffModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-handoff-title"
    >
      <div
        className="w-full max-w-3xl bg-[var(--surface-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div>
            <h2 id="create-handoff-title" className="text-lg font-semibold text-[var(--text-primary)]">
              Compile Engineering Handoff Dossier
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Create a lossless, tamper-evident transfer package for shift rotation or team reassignment.
            </p>
          </div>
          <button
            onClick={() => setIsCreateHandoffModalOpen(false)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Completeness & Readiness Meter Banner */}
        <div className="px-6 py-3.5 bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Pre-Handoff Completeness &amp; Readiness
              </span>
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  completenessScore === 100
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : completenessScore >= 75
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
              >
                {completenessScore}% {completenessScore === 100 ? 'Lossless' : completenessScore >= 75 ? 'Ready' : 'Incomplete'}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-mono">
              {completenessScore >= 75 ? 'Ready for safe dispatch' : 'Fill missing items (>=75% required)'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
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
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${
                hasValidSummary
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)]'
              }`}
            >
              {hasValidSummary ? <Check className="w-3 h-3" /> : '○'} Summary (30%)
            </span>
            <span
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${
                hasCompletedItems
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)]'
              }`}
            >
              {hasCompletedItems ? <Check className="w-3 h-3" /> : '○'} Completed Milestones (25%)
            </span>
            <span
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${
                hasRunbook
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)]'
              }`}
            >
              {hasRunbook ? <Check className="w-3 h-3" /> : '○'} Runbook Commands (25%)
            </span>
            <span
              className={`px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${
                hasNextSteps
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)]'
              }`}
            >
              {hasNextSteps ? <Check className="w-3 h-3" /> : '○'} Next Steps (20%)
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project & Recipient Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                Target Project Workspace
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.currentVersionId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
                Designated Recipient (Assuming Ownership)
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Note / Transition Reason */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-primary)] mb-1.5">
              Handoff Memo / Transition Context
            </label>
            <input
              type="text"
              placeholder="e.g. European shift rotation, sprint handover, release lead transition..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Executive Summary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">
                Executive Briefing Summary <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {executiveSummary.trim().length} chars {hasValidSummary ? '✓ (>=20 chars)' : '(min 20 chars)'}
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Summarize the operational state, recent changes, key architectural nuances, and what the receiver must verify immediately..."
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              required
              className="w-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl p-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Completed Items */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">
                Completed Milestones &amp; Verified Tests
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">{completedItems.length} items</span>
            </div>
            <div className="space-y-2 mb-2">
              {completedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-3 py-2 rounded-lg text-xs text-[var(--text-primary)]">
                  <span>✓ {item}</span>
                  <button
                    type="button"
                    onClick={() => setCompletedItems(completedItems.filter((_, i) => i !== idx))}
                    className="text-[var(--text-muted)] hover:text-rose-500 p-0.5"
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
                className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCompletedItem.trim()) {
                    setCompletedItems([...completedItems, newCompletedItem.trim()]);
                    setNewCompletedItem('');
                  }
                }}
                className="px-3 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs text-[var(--text-primary)] border border-[var(--border-subtle)]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">
                Immediate Next Steps &amp; Action Items
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">{nextSteps.length} items</span>
            </div>
            <div className="space-y-2 mb-2">
              {nextSteps.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-3 py-2 rounded-lg text-xs text-[var(--text-primary)]">
                  <span>→ {step}</span>
                  <button
                    type="button"
                    onClick={() => setNextSteps(nextSteps.filter((_, i) => i !== idx))}
                    className="text-[var(--text-muted)] hover:text-rose-500 p-0.5"
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
                className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newNextStep.trim()) {
                    setNextSteps([...nextSteps, newNextStep.trim()]);
                    setNewNextStep('');
                  }
                }}
                className="px-3 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs text-[var(--text-primary)] border border-[var(--border-subtle)]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Critical Blockers */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">
                Critical Blockers &amp; Risk Nuances (Optional)
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">{criticalBlockers.length} blockers</span>
            </div>
            <div className="space-y-2 mb-2">
              {criticalBlockers.map((blocker, idx) => (
                <div key={idx} className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg text-xs text-rose-500 dark:text-rose-400">
                  <span>⚠ {blocker}</span>
                  <button
                    type="button"
                    onClick={() => setCriticalBlockers(criticalBlockers.filter((_, i) => i !== idx))}
                    className="text-[var(--text-muted)] hover:text-rose-500 p-0.5"
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
                className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newBlocker.trim()) {
                    setCriticalBlockers([...criticalBlockers, newBlocker.trim()]);
                    setNewBlocker('');
                  }
                }}
                className="px-3 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs text-[var(--text-primary)] border border-[var(--border-subtle)]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Runbook Commands */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">
                Runbook Verification Commands
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">{runbookCommands.length} commands</span>
            </div>
            <div className="space-y-2 mb-2">
              {runbookCommands.map((cmd, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-3 py-2 rounded-lg text-xs font-mono text-[var(--text-primary)]">
                  <span className="truncate">$ {cmd}</span>
                  <button
                    type="button"
                    onClick={() => setRunbookCommands(runbookCommands.filter((_, i) => i !== idx))}
                    className="text-[var(--text-muted)] hover:text-rose-500 p-0.5 ml-2 shrink-0"
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
                className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCommand.trim()) {
                    setRunbookCommands([...runbookCommands, newCommand.trim()]);
                    setNewCommand('');
                  }
                }}
                className="px-3 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs text-[var(--text-primary)] border border-[var(--border-subtle)]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Pins SHA-256 tree hash and creates immutable audit record.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateHandoffModalOpen(false)}
              className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
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
