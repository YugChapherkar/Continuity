'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Send, AlertCircle, Plus, Trash2, ShieldCheck, Terminal } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executiveSummary.trim()) {
      showToast('Please provide an executive summary for this handoff.', 'error');
      return;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={() => setIsCreateHandoffModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-handoff-title"
    >
      <div
        className="w-full max-w-3xl bg-[#0D0F10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 id="create-handoff-title" className="text-lg font-semibold text-[#F5F5F2]">
              Compile Engineering Handoff Dossier
            </h2>
            <p className="text-xs text-[#A0A09D] mt-0.5">
              Create a lossless, tamper-evident transfer package for shift rotation or team reassignment.
            </p>
          </div>
          <button
            onClick={() => setIsCreateHandoffModalOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project & Recipient Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Target Project Workspace
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#141718] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F2] focus:outline-none focus:border-[#2563EB]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.currentVersionId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Designated Recipient (Assuming Ownership)
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full bg-[#141718] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F2] focus:outline-none focus:border-[#2563EB]"
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
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Handoff Memo / Transition Context
            </label>
            <input
              type="text"
              placeholder="e.g. European shift rotation, sprint handover, release lead transition..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#141718] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5F2] placeholder-neutral-500 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Executive Summary */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Executive Briefing Summary <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Summarize the operational state, recent changes, key architectural nuances, and what the receiver must verify immediately..."
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              required
              className="w-full bg-[#141718] border border-white/10 rounded-xl p-3.5 text-sm text-[#F5F5F2] placeholder-neutral-500 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Completed Items */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Completed Milestones & Verified Tests
              </label>
              <span className="text-[11px] text-neutral-500">{completedItems.length} items</span>
            </div>
            <div className="space-y-2 mb-2">
              {completedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#141718] border border-white/5 px-3 py-2 rounded-lg text-xs text-[#F5F5F2]">
                  <span>✓ {item}</span>
                  <button
                    type="button"
                    onClick={() => setCompletedItems(completedItems.filter((_, i) => i !== idx))}
                    className="text-neutral-500 hover:text-rose-400 p-0.5"
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
                className="flex-1 bg-[#141718] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F2] placeholder-neutral-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCompletedItem.trim()) {
                    setCompletedItems([...completedItems, newCompletedItem.trim()]);
                    setNewCompletedItem('');
                  }
                }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-neutral-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Immediate Next Steps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Immediate Next Steps for Recipient
              </label>
              <span className="text-[11px] text-neutral-500">{nextSteps.length} items</span>
            </div>
            <div className="space-y-2 mb-2">
              {nextSteps.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#141718] border border-white/5 px-3 py-2 rounded-lg text-xs text-[#F5F5F2]">
                  <span>→ {item}</span>
                  <button
                    type="button"
                    onClick={() => setNextSteps(nextSteps.filter((_, i) => i !== idx))}
                    className="text-neutral-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add critical next step..."
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
                className="flex-1 bg-[#141718] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F2] placeholder-neutral-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newNextStep.trim()) {
                    setNextSteps([...nextSteps, newNextStep.trim()]);
                    setNewNextStep('');
                  }
                }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-neutral-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Critical Blockers */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Critical Blockers & Known Failure Modes</span>
              </label>
              <span className="text-[11px] text-neutral-500">{criticalBlockers.length} items</span>
            </div>
            {criticalBlockers.length > 0 && (
              <div className="space-y-2 mb-2">
                {criticalBlockers.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-rose-950/20 border border-rose-500/20 px-3 py-2 rounded-lg text-xs text-rose-200">
                    <span>⚠️ {item}</span>
                    <button
                      type="button"
                      onClick={() => setCriticalBlockers(criticalBlockers.filter((_, i) => i !== idx))}
                      className="text-neutral-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Upstream ticket SEC-8821 pending VPC firewall allowance..."
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
                className="flex-1 bg-[#141718] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F2] placeholder-neutral-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newBlocker.trim()) {
                    setCriticalBlockers([...criticalBlockers, newBlocker.trim()]);
                    setNewBlocker('');
                  }
                }}
                className="px-3 py-2 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 rounded-xl text-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Runbook Commands */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span>Verification & Runbook Commands</span>
              </label>
              <span className="text-[11px] text-neutral-500">{runbookCommands.length} commands</span>
            </div>
            <div className="space-y-2 mb-2">
              {runbookCommands.map((cmd, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#141718] border border-white/5 px-3 py-2 rounded-lg text-xs font-mono text-blue-300">
                  <span className="truncate">$ {cmd}</span>
                  <button
                    type="button"
                    onClick={() => setRunbookCommands(runbookCommands.filter((_, i) => i !== idx))}
                    className="text-neutral-500 hover:text-rose-400 p-0.5 ml-2 shrink-0"
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
                className="flex-1 bg-[#141718] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5F2] placeholder-neutral-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCommand.trim()) {
                    setRunbookCommands([...runbookCommands, newCommand.trim()]);
                    setNewCommand('');
                  }
                }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-neutral-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#050606] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pins SHA-256 tree hash and creates immutable audit record.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateHandoffModalOpen(false)}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-2 disabled:opacity-50"
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
