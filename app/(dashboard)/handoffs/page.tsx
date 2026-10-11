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
  const { handoffs, users, currentUser, setIsCreateHandoffModalOpen } = useApp();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">Handoff Inbox &amp; Dossiers</h1>
          <p className="text-xs text-[#A0A09D] mt-1">
            Lossless engineering transfer packages, pinned release trees, and operational attestations.
          </p>
        </div>
        <button
          onClick={() => setIsCreateHandoffModalOpen(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Start a handoff</span>
        </button>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141718] border border-white/10 rounded-xl overflow-x-auto">
          {(['All', 'Received', 'Sent', 'Pending', 'Accepted'] as const).map((tab) => {
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
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>{tab}</span>
                <span className="font-mono text-[10px] opacity-75">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dossier ID, project, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141718] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F2] placeholder-neutral-500 focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Attention Callout if user has pending received handoffs */}
      {pendingReceivedCount > 0 && activeTab !== 'Sent' && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-200">
                You have {pendingReceivedCount} handoff package awaiting your verified acceptance as {currentUser.name}.
              </p>
              <p className="text-[11px] text-amber-300/70 mt-0.5">
                Review executive briefing, verify runbook commands, and digitally attest responsibility.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('Received')}
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30 rounded-lg text-xs font-medium shrink-0 transition-colors"
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
              className={`bg-[#0D0F10] border rounded-2xl p-6 shadow-xl transition-all ${
                isAssignedToMe
                  ? 'border-amber-500/40 hover:border-amber-500/60'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {handoff.id}
                    </span>
                    <span className="text-neutral-500">·</span>
                    <span className="font-mono text-xs text-neutral-400">
                      Pinned {handoff.pinnedVersionId} ({handoff.pinnedVersionHash})
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                        handoff.status === 'Accepted'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : handoff.status === 'Completed'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {handoff.status}
                    </span>
                    {isAssignedToMe && (
                      <span className="text-[11px] font-semibold bg-amber-500 text-black px-2 py-0.5 rounded-full font-mono">
                        ACTION REQUIRED
                      </span>
                    )}
                  </div>

                  {/* Title & Note */}
                  <h2 className="text-lg font-bold text-[#F5F5F2]">{handoff.projectName}</h2>
                  <p className="text-xs text-[#A0A09D] leading-relaxed line-clamp-2">
                    {handoff.note}
                  </p>

                  {/* Actors: Sender -> Recipient */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">Sender:</span>
                      <Avatar name={sender?.name || ''} initials={sender?.initials} size="xs" />
                      <span className="text-neutral-300">{sender?.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">Recipient:</span>
                      <Avatar name={recipient?.name || ''} initials={recipient?.initials} size="xs" />
                      <span className="text-neutral-300">{recipient?.name}</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{new Date(handoff.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Inspect Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/handoffs/${handoff.id}`}
                    className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                      isAssignedToMe
                        ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[#2563EB]/25'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-200'
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
          <div className="p-16 text-center text-neutral-500 text-xs bg-[#0D0F10] border border-white/5 rounded-2xl space-y-2">
            <Inbox className="w-6 h-6 mx-auto text-neutral-600" />
            <p>No handoff dossiers in this queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
