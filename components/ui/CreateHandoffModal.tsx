'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Send, Layers, UserCheck, Terminal, AlertCircle } from 'lucide-react';

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

  const [executiveSummary, setExecutiveSummary] = useState(
    'Completed core sprint milestones, verified staging builds, and stabilized cluster state.'
  );
  const [completedItemsText, setCompletedItemsText] = useState(
    'CI pipeline passing on main branch\nVerified staging health telemetry and zero error rate'
  );
  const [nextStepsText, setNextStepsText] = useState(
    'Monitor p99 latency during peak traffic\nComplete failover verification simulation'
  );
  const [blockersText, setBlockersText] = useState('');
  const [runbookCommand, setRunbookCommand] = useState('./bin/ctl cluster status --verify');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (!isCreateHandoffModalOpen) return null;

  const handleClose = () => {
    setIsCreateHandoffModalOpen(false);
    if (setHandoffTarget) setHandoffTarget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) {
      showToast('Please select a project.', 'error');
      return;
    }
    if (!recipientId) {
      showToast('Please select a recipient.', 'error');
      return;
    }
    if (!executiveSummary.trim()) {
      showToast('Please provide an executive summary.', 'error');
      return;
    }

    const completedItems = completedItemsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const nextSteps = nextStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const criticalBlockers = blockersText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const runbookCommands = runbookCommand.trim() ? [runbookCommand.trim()] : [];

    setIsSubmitting(true);
    try {
      await createHandoff({
        projectId,
        recipientId,
        note: executiveSummary.trim(),
        executiveSummary: executiveSummary.trim(),
        completedItems: completedItems.length > 0 ? completedItems : ['Shift deliverables verified.'],
        nextSteps: nextSteps.length > 0 ? nextSteps : ['Continue planned sprint execution.'],
        criticalBlockers,
        runbookCommands,
      });

      handleClose();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error creating handoff', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0D0F11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Shift Handover Protocol
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Initiate Shift Handoff
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Compile project context, verified deliverables, and incoming instructions.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Target Project & Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Target Project <span className="text-blue-600">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#0D0F11]">
                    {p.name} ({p.currentVersionId || 'v1.0'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Recipient Engineer <span className="text-blue-600">*</span>
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {users
                  .filter((u) => u.id !== currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id} className="bg-white dark:bg-[#0D0F11]">
                      {u.name} &bull; {u.role}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Executive Briefing / Shift Summary <span className="text-blue-600">*</span>
            </label>
            <textarea
              rows={3}
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              placeholder="State key progress, critical context, or operational notes for the incoming engineer..."
              required
              className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* Completed Work & Next Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Completed Items (one per line)
              </label>
              <textarea
                rows={3}
                value={completedItemsText}
                onChange={(e) => setCompletedItemsText(e.target.value)}
                placeholder="CI passing&#10;Staging telemetry verified"
                className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Next Shift Priorities (one per line)
              </label>
              <textarea
                rows={3}
                value={nextStepsText}
                onChange={(e) => setNextStepsText(e.target.value)}
                placeholder="Monitor p99 latency&#10;Verify failover test"
                className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Runbook Command & Blockers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Verification / Runbook Command
              </label>
              <div className="relative">
                <Terminal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={runbookCommand}
                  onChange={(e) => setRunbookCommand(e.target.value)}
                  placeholder="./bin/ctl cluster status"
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Known Blockers (optional)
              </label>
              <input
                type="text"
                value={blockersText}
                onChange={(e) => setBlockersText(e.target.value)}
                placeholder="None or upstream API dependency"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Handoff'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
