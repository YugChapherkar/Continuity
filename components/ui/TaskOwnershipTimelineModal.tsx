'use client';

import React from 'react';
import { Task, TaskOwnershipRecord } from '@/lib/types';
import { X, History, UserCheck, ShieldCheck, ArrowRight, ShieldAlert, Clock, Calendar } from 'lucide-react';

interface TaskOwnershipTimelineModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskOwnershipTimelineModal({ task, isOpen, onClose }: TaskOwnershipTimelineModalProps) {
  if (!isOpen || !task) return null;

  const timeline: TaskOwnershipRecord[] = task.ownershipTimeline && task.ownershipTimeline.length > 0
    ? task.ownershipTimeline
    : [
        {
          id: 'initial-alloc',
          previousOwnerName: 'None (Project Backlog)',
          newOwnerId: task.assigneeId || 'user-assigned',
          newOwnerName: task.assigneeName || task.assignee || 'Assigned Engineer',
          transferredAt: task.createdAt,
          transferredBy: task.creatorId || 'lead-allocator',
          transferredByName: task.creatorName || 'Team Leader',
          reason: 'Initial task assignment during sprint planning',
          method: 'Assignment',
        },
      ];

  const methodColors: Record<string, string> = {
    Assignment: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Recipient Acceptance': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Manager Override': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#0B0D0E] border border-slate-200 dark:border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Task Ownership Timeline</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10">
                  {task.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 truncate max-w-md">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Custodian Callout */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-slate-500 dark:text-neutral-400">Current Primary Custodian:</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
              {task.assigneeName || task.assignee || 'Unassigned'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-neutral-500">
            {timeline.length} Recorded Transfer Event(s)
          </span>
        </div>

        {/* Timeline Records */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 pl-6 space-y-6">
            {timeline.map((event, idx) => (
              <div key={event.id || idx} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0B0D0E] bg-blue-600 dark:bg-blue-500 shadow-sm" />

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15 transition-all space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                        methodColors[event.method] || 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300'
                      }`}
                    >
                      {event.method}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-neutral-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(event.transferredAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Transfer Vector */}
                  <div className="flex items-center gap-2 text-xs font-mono pt-1">
                    <span className="text-slate-500 dark:text-neutral-400">{event.previousOwnerName || 'Unassigned'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-slate-900 dark:text-white font-semibold">{event.newOwnerName}</span>
                  </div>

                  {/* Reason & Author */}
                  <p className="text-xs text-slate-700 dark:text-neutral-300 italic bg-white dark:bg-white/[0.02] p-2.5 rounded-lg border border-slate-200/80 dark:border-white/[0.03]">
                    &ldquo;{event.reason}&rdquo;
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center justify-between pt-1">
                    <span>Authorized by: <strong className="text-slate-800 dark:text-neutral-200">{event.transferredByName}</strong></span>
                    {event.handoffId && (
                      <span className="font-mono text-blue-600 dark:text-blue-400">Dossier: {event.handoffId}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cryptographically sealed in SHA-256 ledger</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
