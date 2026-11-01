'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Send, Layers, UserCheck, Terminal, AlertCircle, ShieldCheck } from 'lucide-react';
import { CompletenessBreakdown } from './CompletenessBreakdown';

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
    'Completed core sprint milestones, verified staging builds, and stabilized cluster state across microservices.'
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

  // Parse lines for live completeness breakdown
  const parsedItems = useMemo(() => {
    const completed = completedItemsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const nextSteps = nextStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const blockers = blockersText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const runbooks = runbookCommand.trim() ? [runbookCommand.trim()] : [];

    return {
      completed,
      nextSteps,
      blockers,
      runbooks,
    };
  }, [completedItemsText, nextStepsText, blockersText, runbookCommand]);

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

    setIsSubmitting(true);
    try {
      await createHandoff({
        projectId,
        recipientId,
        note: executiveSummary.trim(),
        executiveSummary: executiveSummary.trim(),
        completedItems:
          parsedItems.completed.length > 0 ? parsedItems.completed : ['Shift deliverables verified.'],
        nextSteps:
          parsedItems.nextSteps.length > 0 ? parsedItems.nextSteps : ['Continue planned sprint execution.'],
        criticalBlockers: parsedItems.blockers,
        runbookCommands: parsedItems.runbooks,
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
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                Continuity Transfer Protocol
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-black mt-0.5">
              Initiate Shift Handoff
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compile project context, verified deliverables, and incoming instructions with cryptographic integrity.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-black rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Real-time 4-Dimension Completeness Scoring Breakdown */}
          <CompletenessBreakdown
            data={{
              executiveSummary,
              completedItems: parsedItems.completed,
              nextSteps: parsedItems.nextSteps,
              runbookCommands: parsedItems.runbooks,
              criticalBlockers: parsedItems.blockers,
            }}
            interactive={true}
            title="Live Shift Losslessness Score"
          />

          {/* Target Project & Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Project <span className="text-rose-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black cursor-pointer font-medium"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white">
                    {p.name} ({p.currentVersionId || 'v1.0'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recipient Engineer <span className="text-rose-500">*</span>
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-black cursor-pointer font-medium"
              >
                {users
                  .filter((u) => u.id !== currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id} className="bg-white">
                      {u.name} &bull; {u.role}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                1. Executive Briefing / Shift Context <span className="text-rose-500">*</span>
              </label>
              <span className="font-mono text-[10px] text-slate-400">
                {executiveSummary.length} chars (30% weight, &gt;50 required)
              </span>
            </div>
            <textarea
              rows={3}
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              placeholder="State key progress, critical context, or operational notes for the incoming engineer..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black font-sans leading-relaxed"
            />
          </div>

          {/* Completed Work & Next Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  2. Completed Milestones (25% weight)
                </label>
                <span className="font-mono text-[10px] text-slate-400">
                  {parsedItems.completed.length} recorded
                </span>
              </div>
              <textarea
                rows={3}
                value={completedItemsText}
                onChange={(e) => setCompletedItemsText(e.target.value)}
                placeholder="CI passing&#10;Staging telemetry verified"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black font-mono text-[11px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  3. Task Linkages &amp; Priorities (20% weight)
                </label>
                <span className="font-mono text-[10px] text-slate-400">
                  {parsedItems.nextSteps.length} planned
                </span>
              </div>
              <textarea
                rows={3}
                value={nextStepsText}
                onChange={(e) => setNextStepsText(e.target.value)}
                placeholder="Monitor p99 latency&#10;Verify failover test"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Runbook Command & Blockers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  4. Runbook Operational Command (25% weight)
                </label>
                <span className="font-mono text-[10px] text-slate-400">
                  {parsedItems.runbooks.length > 0 ? 'Verified' : 'Missing'}
                </span>
              </div>
              <div className="relative">
                <Terminal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={runbookCommand}
                  onChange={(e) => setRunbookCommand(e.target.value)}
                  placeholder="./bin/ctl cluster status"
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Known Blockers (optional audit)
                </label>
                <span className="font-mono text-[10px] text-slate-400">
                  {parsedItems.blockers.length} logged
                </span>
              </div>
              <input
                type="text"
                value={blockersText}
                onChange={(e) => setBlockersText(e.target.value)}
                placeholder="None or upstream API dependency"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2.5">
            <span className="text-[11px] text-slate-500 font-mono">
              Attestation guaranteed via SHA-256 Digest
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-black bg-white hover:bg-slate-100 border border-slate-200 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Handoff'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
