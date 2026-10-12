'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  FileCode,
  Copy,
  Check,
  ArrowRight,
  GitCommit,
  UserCheck,
  Layers,
  ExternalLink,
  Lock,
} from 'lucide-react';

export default function HandoffDossierPage() {
  const routerParams = useParams();
  const handoffId = (Array.isArray(routerParams?.id) ? routerParams.id[0] : routerParams?.id) || '';

  const {
    handoffs,
    users,
    currentUser,
    activeRole,
    acceptHandoff,
    declineHandoff,
    clarifyHandoff,
    overrideHandoff,
    showToast,
  } = useApp();

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isSignoffModalOpen, setIsSignoffModalOpen] = useState(false);
  const [signoffNote, setSignoffNote] = useState('Attested readiness and assumed primary operational custodianship.');
  const [isAccepting, setIsAccepting] = useState(false);

  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  const [isClarifyModalOpen, setIsClarifyModalOpen] = useState(false);
  const [clarifyQuestion, setClarifyQuestion] = useState('');
  const [isClarifying, setIsClarifying] = useState(false);

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('Authorized operational manager override transfer.');
  const [isOverriding, setIsOverriding] = useState(false);

  const handoff = handoffs.find((h) => h.id === handoffId);
  if (!handoff) return notFound();

  const sender = users.find((u) => u.id === handoff.senderId);
  const recipient = users.find((u) => u.id === handoff.recipientId);

  const isRecipient = currentUser.id === handoff.recipientId;
  const isManager = activeRole === 'Admin' || activeRole === 'Team Leader';
  const isPending = handoff.status === 'Pending' || handoff.status === 'Clarification Requested';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    showToast('Copied runbook command', 'info');
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleConfirmAcceptance = async () => {
    setIsAccepting(true);
    try {
      await acceptHandoff(handoff.id, signoffNote);
      setIsSignoffModalOpen(false);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleConfirmDecline = async () => {
    if (!declineReason.trim()) {
      showToast('Please state a reason for declining this handover', 'error');
      return;
    }
    setIsDeclining(true);
    try {
      await declineHandoff(handoff.id, declineReason.trim());
      setIsDeclineModalOpen(false);
      setDeclineReason('');
    } finally {
      setIsDeclining(false);
    }
  };

  const handleConfirmClarify = async () => {
    if (!clarifyQuestion.trim()) {
      showToast('Please specify the question or missing context', 'error');
      return;
    }
    setIsClarifying(true);
    try {
      await clarifyHandoff(handoff.id, clarifyQuestion.trim());
      setIsClarifyModalOpen(false);
      setClarifyQuestion('');
    } finally {
      setIsClarifying(false);
    }
  };

  const handleConfirmOverride = async () => {
    setIsOverriding(true);
    try {
      await overrideHandoff(handoff.id, overrideReason.trim());
      setIsOverrideModalOpen(false);
    } finally {
      setIsOverriding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button & dossier ID header */}
      <div className="flex items-center justify-between">
        <Link
          href="/handoffs"
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Handoff Inbox</span>
        </Link>
        <span className="font-mono text-xs text-neutral-500">
          Dossier ID: {handoff.id}
        </span>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                {handoff.id}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5F2]">
                {handoff.projectName}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-mono font-medium ${
                  handoff.status === 'Accepted'
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                    : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
                }`}
              >
                {handoff.status}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {handoff.completenessScore ?? 100}% Completeness
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#A0A09D] max-w-3xl leading-relaxed">
              {handoff.note}
            </p>

            {/* Pinned Tree & Actors */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-neutral-400 pt-2 font-mono">
              <div className="flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                <span>Pinned Tree: {handoff.pinnedVersionId} ({handoff.pinnedVersionHash})</span>
              </div>
              <span className="text-slate-300 dark:text-neutral-600">&bull;</span>
              <div className="flex items-center gap-2 font-sans">
                <span className="text-slate-500 dark:text-neutral-500 font-mono">Transferring:</span>
                <Avatar name={sender?.name || ''} initials={sender?.initials} size="xs" />
                <span className="text-slate-800 dark:text-neutral-300 font-medium">{sender?.name}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 dark:text-neutral-600" />
                <Avatar name={recipient?.name || ''} initials={recipient?.initials} size="xs" />
                <span className="text-slate-900 dark:text-neutral-300 font-semibold">{recipient?.name}</span>
              </div>
            </div>
          </div>

          {/* Primary CTA: Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isPending && isRecipient ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsClarifyModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Request Clarification
                </button>
                <button
                  onClick={() => setIsDeclineModalOpen(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Decline
                </button>
                <button
                  onClick={() => setIsSignoffModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Accept Responsibility</span>
                </button>
              </div>
            ) : isPending && isManager ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOverrideModalOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Execute Manager Override</span>
                </button>
                <div className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-600 dark:text-neutral-400">
                  Awaiting {recipient?.name} acceptance
                </div>
              </div>
            ) : isPending && !isRecipient ? (
              <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-600 dark:text-neutral-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                <span>Assigned to {recipient?.name}. Awaiting acceptance.</span>
              </div>
            ) : (
              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Lossless Handover Ratified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Executive Summary & Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Briefing Dossier Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-[#F5F5F2]">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2>Executive Briefing Summary</h2>
            </div>
            <p className="text-xs text-slate-700 dark:text-[#A0A09D] leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200 dark:border-white/[0.06] font-mono">
              {handoff.briefing.executiveSummary}
            </p>
          </div>

          {/* Completed Milestones & Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completed */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3>Completed Milestones ({handoff.briefing.completedItems.length})</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-neutral-300">
                {handoff.briefing.completedItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">✓</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3>Immediate Next Steps ({handoff.briefing.nextSteps.length})</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-neutral-300">
                {handoff.briefing.nextSteps.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-blue-600 dark:text-blue-400 shrink-0 font-bold">→</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Critical Blockers */}
          {handoff.briefing.criticalBlockers.length > 0 && (
            <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-rose-200 dark:border-rose-500/20 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3>Critical Blockers &amp; Known Failure Modes</h3>
              </div>
              <ul className="space-y-2 text-xs text-rose-800 dark:text-rose-200">
                {handoff.briefing.criticalBlockers.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 p-3 rounded-lg">
                    <span className="shrink-0">⚠️</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Architectural Decisions (ADRs) */}
          <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-[#F5F5F2]">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3>Key Architecture Decisions (ADRs)</h3>
              </div>
              <Link
                href={`/projects/${handoff.projectId}`}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Inspect in Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {handoff.briefing.architecturalDecisions.map((dec, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] p-3 rounded-xl text-xs text-slate-800 dark:text-neutral-300 font-mono flex items-center justify-between"
                >
                  <span>{dec}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                    Active Invariant
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Runbook & Verifiable Audit Log */}
        <div className="space-y-6">
          {/* Runbook Commands */}
          <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-[#F5F5F2]">
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3>Verification Runbook Commands</h3>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400">
              Run these commands to assert cluster invariants and replication health before assuming shift on-call.
            </p>
            <div className="space-y-2 pt-1">
              {handoff.briefing.runbookCommands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl p-3 flex items-start justify-between gap-2 group"
                >
                  <pre className="text-[11px] font-mono text-blue-700 dark:text-blue-300 whitespace-pre-wrap leading-relaxed truncate">
                    {cmd}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(cmd)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
                    title="Copy command"
                  >
                    {copiedCmd === cmd ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Key Files to Review */}
          <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-[#F5F5F2]">
              <FileCode className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
              <h3>Key Files for Custodian Review</h3>
            </div>
            <div className="space-y-1.5">
              {handoff.briefing.keyFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] px-3 py-2 rounded-lg text-xs font-mono text-slate-800 dark:text-neutral-300 truncate"
                >
                  {file}
                </div>
              ))}
            </div>
          </div>

          {/* Tamper-Evident Audit Trail */}
          <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-[#F5F5F2]">
              <Clock className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
              <h3>Tamper-Evident Handover Chain</h3>
            </div>
            <div className="space-y-3 pt-1">
              {handoff.auditTrail.map((trail, idx) => (
                <div
                  key={idx}
                  className="border-l-2 border-blue-500 pl-3 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-blue-700 dark:text-blue-400 font-mono">{trail.action}</span>
                    <span className="text-slate-500 dark:text-neutral-500 font-mono text-[10px]">{trail.timestamp}</span>
                  </div>
                  <p className="text-slate-700 dark:text-neutral-300 text-[11px] leading-relaxed">{trail.detail}</p>
                  {trail.hash && (
                    <p className="text-[10px] font-mono text-slate-500 dark:text-neutral-500 truncate">
                      SHA256: {trail.hash.slice(0, 24)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ACCEPT RESPONSIBILITY CONFIRMATION MODAL
         ========================================================================= */}
      {isSignoffModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsSignoffModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0D0F10] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-6 text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F5F2]">
                  Accept Operational Guardianship
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Verifiable digital signature for {handoff.projectName}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl p-4 text-xs space-y-2 text-slate-700 dark:text-neutral-300">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-neutral-400">Recipient Identity:</span>
                <span className="font-semibold text-slate-900 dark:text-[#F5F5F2]">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-neutral-400">Project Workspace:</span>
                <span className="font-mono text-blue-700 dark:text-blue-300 font-semibold">{handoff.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-neutral-400">Pinned Release:</span>
                <span className="font-mono text-slate-800 dark:text-neutral-200">{handoff.pinnedVersionId} ({handoff.pinnedVersionHash})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-neutral-400">Losslessness Attestation:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">100% losslessly verified</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                Custodial Sign-off Attestation Memo
              </label>
              <textarea
                rows={3}
                value={signoffNote}
                onChange={(e) => setSignoffNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-[#F5F5F2] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSignoffModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAcceptance}
                disabled={isAccepting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isAccepting ? 'Ratifying...' : 'Sign & Assume Responsibility'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Decline Confirmation Modal */}
      {isDeclineModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsDeclineModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0D0F10] border border-rose-200 dark:border-rose-500/30 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Decline Handover Package</h3>
            <p className="text-xs text-slate-600 dark:text-neutral-300">
              Task and project ownership will <strong>remain with {sender?.name}</strong>. Please state your reason clearly:
            </p>
            <textarea
              rows={3}
              required
              placeholder="State reason for declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeclineModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                disabled={isDeclining}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm"
              >
                {isDeclining ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Request Modal */}
      {isClarifyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsClarifyModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0D0F10] border border-amber-200 dark:border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Request Clarification</h3>
            <p className="text-xs text-slate-600 dark:text-neutral-300">
              Transfer is paused while {sender?.name} answers your operational question:
            </p>
            <textarea
              rows={3}
              required
              placeholder="What questions or commands do you need clarified before assuming ownership?"
              value={clarifyQuestion}
              onChange={(e) => setClarifyQuestion(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsClarifyModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClarify}
                disabled={isClarifying}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm"
              >
                {isClarifying ? 'Submitting...' : 'Send Clarification Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Override Modal */}
      {isOverrideModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOverrideModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0D0F10] border border-amber-200 dark:border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Execute Operational Manager Override</h3>
            <p className="text-xs text-slate-600 dark:text-neutral-300">
              As an authorized manager, executing this override will force the atomic transfer of custodianship to {recipient?.name}.
            </p>
            <textarea
              rows={3}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverride}
                disabled={isOverriding}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm"
              >
                {isOverriding ? 'Executing...' : 'Authorize Override Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
