'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import {
  Inbox,
  Search,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function HandoffsInboxPage() {
  const { handoffs, users, currentUser, setIsCreateHandoffModalOpen, theme } = useApp();
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'All' | 'Received' | 'Sent' | 'Pending' | 'Accepted'>('All');
  const [search, setSearch] = useState('');

  const filteredHandoffs = handoffs.filter((h) => {
    // Tab filter
    if (activeTab === 'Received' && h.recipientId !== currentUser.id) return false;
    if (activeTab === 'Sent' && h.senderId !== currentUser.id) return false;
    if (activeTab === 'Pending' && h.status !== 'Pending') return false;
    if (activeTab === 'Accepted' && h.status !== 'Accepted') return false;

    // Search filter
    const q = search.toLowerCase();
    const sender = users.find((u) => u.id === h.senderId)?.name.toLowerCase() || '';
    const recipient = users.find((u) => u.id === h.recipientId)?.name.toLowerCase() || '';
    return (
      h.id.toLowerCase().includes(q) ||
      h.projectName.toLowerCase().includes(q) ||
      h.note.toLowerCase().includes(q) ||
      sender.includes(q) ||
      recipient.includes(q)
    );
  });

  const pendingReceivedCount = handoffs.filter(
    (h) => h.recipientId === currentUser.id && h.status === 'Pending'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">
              Transfer Dossiers & Handover Invariant Pipeline
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
            Handoffs <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">Inbox</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A0A09D] mt-1">
            Review, coordinate, attest, and sign off on verified engineering project handoffs.
          </p>
        </div>
        <button
          onClick={() => setIsCreateHandoffModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Start a handoff</span>
        </button>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl overflow-x-auto shadow-sm border transition-all ${
            isLight
              ? 'bg-white border-slate-200 shadow-slate-100'
              : 'bg-[#0E1116] border-white/15 shadow-black/50'
          }`}
        >
          {(['All', 'Received', 'Sent', 'Pending', 'Accepted'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            const count = {
              All: handoffs.length,
              Received: handoffs.filter((h) => h.recipientId === currentUser.id).length,
              Sent: handoffs.filter((h) => h.senderId === currentUser.id).length,
              Pending: handoffs.filter((h) => h.status === 'Pending').length,
              Accepted: handoffs.filter((h) => h.status === 'Accepted').length,
            }[tab];

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    : 'text-neutral-200 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isLight
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-white/10 text-neutral-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
          <input
            type="text"
            placeholder="Search dossier ID, project, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-4 py-2 text-xs transition-colors shadow-sm border focus:outline-none focus:border-blue-500 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                : 'bg-[#0E1116] border-white/15 text-[#F5F5F2] placeholder-neutral-400'
            }`}
          />
        </div>
      </div>

      {/* Attention Callout if user has pending received handoffs */}
      {pendingReceivedCount > 0 && activeTab !== 'Sent' && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                You have {pendingReceivedCount} handoff package awaiting your acceptance as {currentUser.name}.
              </p>
              <p className="text-[11px] text-slate-600 dark:text-neutral-400 mt-0.5">
                Review executive briefing, verify runbook commands, and attest responsibility.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('Received')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-200 border border-blue-600 dark:border-blue-500/30 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer shadow-sm"
          >
            Filter My Queue
          </button>
        </div>
      )}

      {/* Handoff List */}
      <div className="space-y-4">
        {filteredHandoffs.map((handoff) => {
          const sender = users.find((u) => u.id === handoff.senderId);
          const recipient = users.find((u) => u.id === handoff.recipientId);
          const isAssignedToMe = handoff.recipientId === currentUser.id && handoff.status === 'Pending';

          return (
            <div
              key={handoff.id}
              className={`bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border rounded-2xl p-6 transition-all shadow-sm hover:shadow-md ${
                isAssignedToMe
                  ? 'border-blue-300 dark:border-blue-500/30 ring-1 ring-blue-500/10'
                  : 'border-slate-200 dark:border-white/[0.08] hover:border-blue-400/50 dark:hover:border-white/20'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {handoff.id}
                    </span>
                    <span className="text-slate-300 dark:text-neutral-600">&bull;</span>
                    <span className="font-mono text-xs text-slate-500 dark:text-neutral-400">
                      Pinned {handoff.pinnedVersionId} ({handoff.pinnedVersionHash})
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                        handoff.status === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                          : handoff.status === 'Completed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-neutral-300 dark:border-white/10'
                      }`}
                    >
                      {handoff.status}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                      {handoff.completenessScore ?? 100}% Readiness
                    </span>
                    {isAssignedToMe && (
                      <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 px-2.5 py-0.5 rounded-full font-mono">
                        ACTION REQUIRED
                      </span>
                    )}
                  </div>

                  {/* Title & Note */}
                  <h2 className="text-base font-semibold text-slate-900 dark:text-[#F5F5F2]">{handoff.projectName}</h2>
                  <p className="text-xs text-slate-600 dark:text-[#A0A09D] leading-relaxed line-clamp-2">
                    {handoff.note}
                  </p>

                  {/* Actors: Sender -> Recipient */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-neutral-400 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-neutral-500">Sender:</span>
                      <Avatar name={sender?.name || ''} initials={sender?.initials} size="xs" />
                      <span className="text-slate-800 dark:text-neutral-300 font-medium">{sender?.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-600" />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-neutral-500">Recipient:</span>
                      <Avatar name={recipient?.name || ''} initials={recipient?.initials} size="xs" />
                      <span className="text-slate-800 dark:text-neutral-300 font-medium">{recipient?.name}</span>
                    </div>
                    <span className="text-slate-300 dark:text-neutral-600">&bull;</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-neutral-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(handoff.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Inspect Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/handoffs/${handoff.id}`}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                      isAssignedToMe
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                        : 'bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-neutral-200 border border-slate-200 dark:border-white/[0.08]'
                    }`}
                  >
                    <span>{isAssignedToMe ? 'Accept Responsibility' : 'Inspect Dossier'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filteredHandoffs.length === 0 && (
          <div className="p-16 text-center text-slate-500 dark:text-neutral-500 text-xs bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] rounded-2xl space-y-2">
            <Inbox className="w-6 h-6 mx-auto text-slate-400 dark:text-neutral-600" />
            <p>No handoff dossiers in this queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
