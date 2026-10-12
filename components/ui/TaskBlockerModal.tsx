'use client';

import React, { useState } from 'react';
import { Task, BlockerStatus } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Send,
  Check,
  RotateCcw,
} from 'lucide-react';

interface TaskBlockerModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskBlockerModal({ task, isOpen, onClose }: TaskBlockerModalProps) {
  const { currentUser, activeRole, reportTaskBlocker, updateTaskBlocker, showToast } = useApp();

  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const blocker = task.blockerDetails;
  const isBlocked = task.status === 'Blocked' && Boolean(blocker);

  const isLeaderOrAdmin = activeRole === 'Admin' || activeRole === 'Team Leader';

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please enter a description for the blocker', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportTaskBlocker(task.id, description.trim(), severity);
      setDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await updateTaskBlocker(task.id, 'acknowledge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    setIsSubmitting(true);
    try {
      await updateTaskBlocker(task.id, 'escalate', {
        reason: escalationReason.trim() || 'Cross-pod blocker escalated to Platform Admin.',
      });
      setEscalationReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      showToast('Please enter resolution notes to clear the blocker', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateTaskBlocker(task.id, 'resolve', {
        notes: resolutionNotes.trim(),
      });
      setResolutionNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusSteps: BlockerStatus[] = ['Reported', 'Acknowledged', 'Escalated', 'Resolved'];

  const severityColors: Record<string, string> = {
    Low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    High: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0B0D0E] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isBlocked ? 'Operational Blocker Lifecycle' : 'Report Operational Blocker'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 truncate max-w-sm">
                {task.id} &middot; {task.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isBlocked && blocker ? (
            <div className="space-y-6">
              {/* Stepper */}
              <div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-3">
                  Triage & Escalation Progress
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {statusSteps.map((step, idx) => {
                    const isCurrent = blocker.status === step;
                    const isPast =
                      statusSteps.indexOf(blocker.status) >= idx && blocker.status !== 'Resolved'
                        ? true
                        : blocker.status === 'Resolved';

                    return (
                      <div
                        key={step}
                        className={`p-2.5 rounded-xl border text-center font-mono text-[11px] transition-all ${
                          isCurrent
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold shadow-md shadow-amber-500/10'
                            : isPast
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-white/[0.02] text-slate-400 dark:text-neutral-500 border-slate-200 dark:border-white/[0.04]'
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blocker Metadata Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold ${severityColors[blocker.severity]}`}>
                    {blocker.severity} Severity
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                    Reported {new Date(blocker.reportedAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-800 dark:text-white bg-white dark:bg-white/[0.02] p-3 rounded-lg border border-slate-200 dark:border-white/[0.03] leading-relaxed">
                  {blocker.description}
                </p>

                <div className="text-[11px] text-slate-600 dark:text-neutral-400 space-y-1 pt-1">
                  <div>Reported by: <strong className="text-slate-900 dark:text-neutral-200">{blocker.reportedByName}</strong></div>
                  {blocker.acknowledgedByName && (
                    <div className="text-emerald-700 dark:text-emerald-400">
                      Acknowledged by: <strong>{blocker.acknowledgedByName}</strong> ({new Date(blocker.acknowledgedAt || '').toLocaleTimeString()})
                    </div>
                  )}
                  {blocker.escalatedToName && (
                    <div className="text-amber-700 dark:text-amber-400">
                      Escalated to: <strong>{blocker.escalatedToName}</strong> &middot; {blocker.escalationReason}
                    </div>
                  )}
                  {blocker.resolvedByName && (
                    <div className="text-emerald-700 dark:text-emerald-300">
                      Resolved by: <strong>{blocker.resolvedByName}</strong> &middot; &ldquo;{blocker.resolutionNotes}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Team Leader / Admin */}
              {blocker.status !== 'Resolved' && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/[0.06]">
                  <span className="text-xs font-mono text-slate-500 dark:text-neutral-400 uppercase">Leadership Actions</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {blocker.status === 'Reported' && isLeaderOrAdmin && (
                      <button
                        onClick={handleAcknowledge}
                        disabled={isSubmitting}
                        className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-600/30 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Acknowledge Blocker
                      </button>
                    )}

                    {blocker.status !== 'Escalated' && isLeaderOrAdmin && (
                      <div className="sm:col-span-2 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Escalation reason (e.g. VIP routing failure in AWS VPC-04)..."
                            value={escalationReason}
                            onChange={(e) => setEscalationReason(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={handleEscalate}
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-600/20 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-600/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            Escalate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resolution Input */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs text-slate-700 dark:text-neutral-300 font-medium">Clear / Resolve Blocker:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Resolution notes (e.g. DNS propagated, verified connectivity)..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={handleResolve}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Resolve & Resume
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Report Blocker Form */
            <form onSubmit={handleReport} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  Reporting a blocker will transition this task to <strong>Blocked</strong> and automatically notify your Team Leader for rapid triage and unblocking.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-700 dark:text-neutral-300 mb-1.5">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                        severity === sev
                          ? severityColors[sev] + ' font-bold ring-1 ring-blue-500/30 dark:ring-white/20'
                          : 'bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-700 dark:text-neutral-300 mb-1.5">
                  Blocker Description & Operational Impact *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the exact dependency, missing credential, or external failure blocking progress..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Dispatching...' : 'Dispatch Blocker Alert'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
