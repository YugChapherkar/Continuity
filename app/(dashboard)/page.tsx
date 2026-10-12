'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import {
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  FileText,
} from 'lucide-react';

export default function HomePage() {
  const {
    currentUser,
    setIsCreateHandoffModalOpen,
    handoffs,
    projects,
    auditLogs,
  } = useApp();

  // Attention items: pending handoffs specifically assigned to currentUser
  const attentionHandoffs = handoffs.filter(
    (h) => h.recipientId === currentUser.id && h.status === 'Pending'
  );

  return (
    <div className="relative space-y-24">
      {/* =========================================================================
          1. ABOVE THE FOLD (INITIAL VIEWPORT) - LUMEN PRISMATIC WAVE THEME
         ========================================================================= */}
      <section className="relative min-h-[calc(100vh-8rem)] flex flex-col justify-between py-6 lg:py-10">
        {/* Top Header Group: Status Badge */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-mono tracking-widest uppercase text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CONTINUITY ARCHITECTURE</span>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#0D0F10]/80 backdrop-blur-md border border-white/10 text-xs shadow-sm">
            <span className="text-[#F5F5F2] font-medium">{currentUser.name}</span>
            <span className="text-neutral-500">·</span>
            <span className="text-[#A0A09D] truncate max-w-[180px] sm:max-w-none">{currentUser.role}</span>
          </div>
        </div>

        {/* Main Hero Statement: Bold Sans-Serif Typography + Signature Blue Pill Button */}
        <div className="relative z-10 max-w-4xl my-auto py-6">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white uppercase leading-[0.92] select-none">
            DIGITAL ENGINEERING<br />
            SOLUTIONS
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsCreateHandoffModalOpen(true)}
              className="px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm sm:text-base font-semibold rounded-full shadow-lg shadow-[#2563EB]/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer"
            >
              <span>Start your audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#workspace-details"
              className="px-6 py-3.5 text-sm font-medium text-neutral-300 hover:text-white transition-all flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08]"
            >
              <span>Explore workspaces</span>
              <span className="text-xs text-neutral-400 font-mono">↓</span>
            </a>
          </div>
        </div>

        {/* Bottom Split Narrative Row matching reference design */}
        <div className="relative z-10 pt-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          {/* Bottom Left Microcopy */}
          <div className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
            Tailored strategies,<br />
            <span className="text-neutral-300">guaranteed results</span>
          </div>

          {/* Bottom Right Narrative Paragraph with highlighted key terms */}
          <div className="max-w-xl text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
            At Continuity, we understand that no two engineering teams are the same. That’s why we offer a full suite of lossless handoff services, each tailored to address your unique challenges and rotation goals. Our team <span className="text-white font-medium">combines verifiable cryptographic handoffs</span> with <span className="text-white font-medium">automated ADR tracking</span> to build workflows that <span className="text-white font-medium">deliver results</span>.
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. BELOW THE FOLD (REVEALED UPON SCROLLING)
         ========================================================================= */}
      <div id="workspace-details" className="space-y-16 pt-8 scroll-mt-20">
        {/* -------------------------------------------------------------
            SECTION: NEEDS YOUR ATTENTION (Assigned to Current User)
           ------------------------------------------------------------- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-semibold text-[#F5F5F2]">Needs your attention</h2>
              {attentionHandoffs.length > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {attentionHandoffs.length} assigned to you
                </span>
              )}
            </div>
            <Link
              href="/handoffs"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
            >
              <span>View full inbox</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {attentionHandoffs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {attentionHandoffs.map((handoff) => (
                <div
                  key={handoff.id}
                  className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] hover:border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-medium px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25">
                          Assigned to you
                        </span>
                        <span className="font-mono text-xs text-blue-400 font-semibold">{handoff.id}</span>
                        <span className="text-neutral-500">·</span>
                        <span className="font-mono text-xs text-neutral-400">
                          Pinned {handoff.pinnedVersionId} ({handoff.pinnedVersionHash})
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-[#F5F5F2]">
                        {handoff.projectName}
                      </h3>

                      <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">
                        {handoff.note}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Submitted {new Date(handoff.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>{handoff.briefing.criticalBlockers.length} Critical Blocker(s)</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{handoff.briefing.completedItems.length} Verified Milestones</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/handoffs/${handoff.id}`}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/25 transition-all text-center flex items-center justify-center gap-2"
                      >
                        <span>Inspect Briefing Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.06] text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-sm text-[#F5F5F2] font-medium">All transition queues clear</p>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                No handoff packages are currently pending your acceptance as {currentUser.name}.
              </p>
            </div>
          )}
        </section>

        {/* -------------------------------------------------------------
            SECTION: ACTIVE PROJECTS (Clean Tabular Overview)
           ------------------------------------------------------------- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-semibold text-[#F5F5F2]">Active Projects</h2>
            </div>
            <Link
              href="/projects"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
            >
              <span>Explore all workspaces</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F5F5F2]">
                <thead className="border-b border-white/[0.06] bg-white/[0.01] text-neutral-500 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Repository / Project</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Release Tag</th>
                    <th scope="col" className="px-6 py-3.5">Decisions</th>
                    <th scope="col" className="px-6 py-3.5">Last Activity</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Workspace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {projects.map((project) => {
                    const statusColors = {
                      Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      Transitioning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                      'Review Needed': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                      Stable: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                    }[project.status];

                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-sm text-[#F5F5F2]">{project.name}</div>
                          <div className="text-neutral-400 text-[11px] truncate max-w-sm mt-0.5">
                            {project.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[11px] rounded-full border font-medium ${statusColors}`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-neutral-300">
                          {project.currentVersionId}
                        </td>
                        <td className="px-6 py-4 font-mono text-neutral-400">
                          {project.decisions.length} ADRs
                        </td>
                        <td className="px-6 py-4 font-mono text-neutral-400">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
            SECTION: RECENT ACTIVITY TIMELINE
           ------------------------------------------------------------- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              <h2 className="text-base font-semibold text-[#F5F5F2]">Recent Activity &amp; Audit Log</h2>
            </div>
            <Link
              href="/audit"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
            >
              <span>Verify cryptographic chain</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-lg divide-y divide-white/[0.04]">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4">
                <Avatar name={log.actorName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[#F5F5F2]">
                      <span className="font-semibold">{log.actorName}</span>{' '}
                      <span className="text-neutral-400">performed</span>{' '}
                      <span className="font-mono text-blue-400">{log.action}</span>
                    </p>
                    <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{log.detail}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-400 font-mono">
                    <span className="text-neutral-400">Target: {log.projectName}</span>
                    <span>·</span>
                    <span className="text-neutral-400 truncate max-w-xs">SHA256: {log.hash.slice(0, 16)}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
