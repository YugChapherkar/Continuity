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

  const { handoffs, users, currentUser, acceptHandoff, showToast } = useApp();

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isSignoffModalOpen, setIsSignoffModalOpen] = useState(false);
  const [signoffNote, setSignoffNote] = useState('Attested readiness and assumed primary operational custodianship.');
  const [isAccepting, setIsAccepting] = useState(false);

  const handoff = handoffs.find((h) => h.id === handoffId);
  if (!handoff) return notFound();

  const sender = users.find((u) => u.id === handoff.senderId);
  const recipient = users.find((u) => u.id === handoff.recipientId);

  const isRecipient = currentUser.id === handoff.recipientId;
  const isPending = handoff.status === 'Pending';

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
      <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-semibold text-blue-400 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20">
                {handoff.id}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-[#F5F5F2]">
                {handoff.projectName}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-mono font-medium ${
                  handoff.status === 'Accepted'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-blue-300 bg-blue-500/10 border-blue-500/20'
                }`}
              >
                {handoff.status}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border font-mono font-medium text-emerald-400 bg-emerald-500/10 border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {handoff.completenessScore ?? 100}% Completeness
              </span>
            </div>

            <p className="text-xs text-[#A0A09D] max-w-3xl leading-relaxed">
              {handoff.note}
            </p>

            {/* Pinned Tree & Actors */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-2 font-mono">
              <div className="flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-neutral-500" />
                <span>Pinned Tree: {handoff.pinnedVersionId} ({handoff.pinnedVersionHash})</span>
              </div>
              <span className="text-neutral-600">·</span>
              <div className="flex items-center gap-2 font-sans">
                <span className="text-neutral-500 font-mono">Transferring:</span>
                <Avatar name={sender?.name || ''} initials={sender?.initials} size="xs" />
                <span className="text-neutral-300">{sender?.name}</span>
                <ArrowRight className="w-3 h-3 text-neutral-600" />
                <Avatar name={recipient?.name || ''} initials={recipient?.initials} size="xs" />
                <span className="text-neutral-300 font-medium">{recipient?.name}</span>
              </div>
            </div>
          </div>

          {/* Primary CTA: Accept responsibility button */}
          <div className="flex items-center gap-3 shrink-0">
            {isPending && isRecipient ? (
              <button
                onClick={() => setIsSignoffModalOpen(true)}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Accept Responsibility</span>
              </button>
            ) : isPending && !isRecipient ? (
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
                <span>Assigned to {recipient?.name}. Awaiting acceptance.</span>
              </div>
            ) : (
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
          <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F2]">
              <Layers className="w-4 h-4 text-blue-400" />
              <h2>Executive Briefing Summary</h2>
            </div>
            <p className="text-xs text-[#A0A09D] leading-relaxed whitespace-pre-line bg-white/[0.02] p-4 rounded-xl border border-white/[0.06] font-mono">
              {handoff.briefing.executiveSummary}
            </p>
          </div>

          {/* Completed Milestones & Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completed */}
            <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3>Completed Milestones ({handoff.briefing.completedItems.length})</h3>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300">
                {handoff.briefing.completedItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <ArrowRight className="w-4 h-4 text-blue-400" />
                <h3>Immediate Next Steps ({handoff.briefing.nextSteps.length})</h3>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300">
                {handoff.briefing.nextSteps.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                    <span className="text-blue-400 shrink-0">→</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Critical Blockers */}
          {handoff.briefing.criticalBlockers.length > 0 && (
            <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-rose-500/20 rounded-2xl p-6 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3>Critical Blockers &amp; Known Failure Modes</h3>
              </div>
              <ul className="space-y-2 text-xs text-rose-200">
                {handoff.briefing.criticalBlockers.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-rose-950/20 border border-rose-500/20 p-3 rounded-lg">
                    <span className="shrink-0">⚠️</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Architectural Decisions (ADRs) */}
          <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F2]">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <h3>Key Architecture Decisions (ADRs)</h3>
              </div>
              <Link
                href={`/projects/${handoff.projectId}`}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Inspect in Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {handoff.briefing.architecturalDecisions.map((dec, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-xl text-xs text-neutral-300 font-mono flex items-center justify-between"
                >
                  <span>{dec}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
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
          <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F2]">
                <Terminal className="w-4 h-4 text-blue-400" />
                <h3>Verification Runbook Commands</h3>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400">
              Run these commands to assert cluster invariants and replication health before assuming shift on-call.
            </p>
            <div className="space-y-2 pt-1">
              {handoff.briefing.runbookCommands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex items-start justify-between gap-2 group"
                >
                  <pre className="text-[11px] font-mono text-blue-300 whitespace-pre-wrap leading-relaxed truncate">
                    {cmd}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(cmd)}
                    className="p-1.5 text-neutral-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd === cmd ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Key Files to Review */}
          <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F2]">
              <FileCode className="w-4 h-4 text-neutral-400" />
              <h3>Key Files for Custodian Review</h3>
            </div>
            <div className="space-y-1.5">
              {handoff.briefing.keyFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.02] border border-white/[0.06] px-3 py-2 rounded-lg text-xs font-mono text-neutral-300 truncate"
                >
                  {file}
                </div>
              ))}
            </div>
          </div>

          {/* Tamper-Evident Audit Trail */}
          <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F2]">
              <Clock className="w-4 h-4 text-neutral-400" />
              <h3>Tamper-Evident Handover Chain</h3>
            </div>
            <div className="space-y-3 pt-1">
              {handoff.auditTrail.map((trail, idx) => (
                <div
                  key={idx}
                  className="border-l-2 border-blue-500/40 pl-3 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-blue-400 font-mono">{trail.action}</span>
                    <span className="text-neutral-500 font-mono text-[10px]">{trail.timestamp}</span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">{trail.detail}</p>
                  {trail.hash && (
                    <p className="text-[10px] font-mono text-neutral-500 truncate">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsSignoffModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0D0F10] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F5F5F2]">
                  Accept Operational Guardianship
                </h3>
                <p className="text-xs text-neutral-400">
                  Verifiable digital signature for {handoff.projectName}
                </p>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-xs space-y-2 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Recipient Identity:</span>
                <span className="font-semibold text-[#F5F5F2]">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Project Workspace:</span>
                <span className="font-mono text-blue-300">{handoff.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Pinned Release:</span>
                <span className="font-mono text-neutral-200">{handoff.pinnedVersionId} ({handoff.pinnedVersionHash})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Losslessness Attestation:</span>
                <span className="text-emerald-400 font-semibold">100% losslessly verified</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Custodial Sign-off Attestation Memo
              </label>
              <textarea
                rows={3}
                value={signoffNote}
                onChange={(e) => setSignoffNote(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-[#F5F5F2] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSignoffModalOpen(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAcceptance}
                disabled={isAccepting}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isAccepting ? 'Ratifying...' : 'Sign & Assume Responsibility'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
