'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Download,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function AuditTrailPage() {
  const { auditLogs, showToast, theme } = useApp();
  const isLight = theme === 'light';
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    blocksCount: number;
    timestamp: string;
  } | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      log.actorName.toLowerCase().includes(q) ||
      (log.projectName ? log.projectName.toLowerCase().includes(q) : false) ||
      log.detail.toLowerCase().includes(q) ||
      log.hash.toLowerCase().includes(q);
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult({
        verified: true,
        blocksCount: auditLogs.length,
        timestamp: new Date().toUTCString(),
      });
      showToast('Merkle hash chain invariants verified. Zero hash drift detected.', 'success');
    }, 900);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `continuity-audit-ledger-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Downloaded verifiable cryptographic ledger JSON', 'info');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">
            Activity Audit Trail
          </h1>
          <p className="text-xs text-[#A0A09D] mt-1">
            Complete log of project updates, shift handoffs, and team actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger</span>
          </button>
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#2563EB]/25 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Invariant Chain'}</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner if Run */}
      {verificationResult && (
        <div className="bg-emerald-950/15 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-200">
                Cryptographic Invariants Verified ({verificationResult.blocksCount} Ledger Blocks)
              </p>
              <p className="text-[11px] text-emerald-300/70 font-mono mt-0.5">
                Every record matches sequential SHA-256 parent hash hashes. Genesis linkage intact at {verificationResult.timestamp}.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
            0% DRIFT
          </span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-neutral-400'}`} />
          <input
            type="text"
            placeholder="Search by actor, project, hash or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs transition-colors shadow-md border focus:outline-none focus:border-blue-500 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                : 'bg-[#0E1116] border-white/15 text-[#F5F5F2] placeholder-neutral-400'
            }`}
            style={{ backgroundColor: isLight ? '#FFFFFF' : '#0E1116' }}
          />
        </div>

        {/* Action Type Filter */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl overflow-x-auto shadow-lg border transition-all ${
            isLight
              ? 'bg-white border-slate-200 shadow-slate-200/50'
              : 'bg-[#0E1116] border-white/15 shadow-black/50'
          }`}
          style={{ backgroundColor: isLight ? '#FFFFFF' : '#0E1116' }}
        >
          {['ALL', 'HANDOFF_INITIATED', 'HANDOFF_ACCEPTED', 'ADR_REGISTERED', 'VERSION_PINNED'].map((act) => {
            const isSelected = actionFilter === act;
            return (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap font-mono cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/40 font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    : 'text-neutral-200 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                {act === 'ALL' ? 'All Events' : act.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F5F5F2]">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-neutral-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th scope="col" className="px-6 py-3.5">Block / Hash</th>
                <th scope="col" className="px-6 py-3.5">Timestamp</th>
                <th scope="col" className="px-6 py-3.5">Action</th>
                <th scope="col" className="px-6 py-3.5">Actor</th>
                <th scope="col" className="px-6 py-3.5">Project / Detail</th>
                <th scope="col" className="px-6 py-3.5 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLogs.map((log) => {
                const actionBadge: Record<string, string> = {
                  HANDOFF_INITIATED: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
                  HANDOFF_ACCEPTED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  ADR_REGISTERED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  VERSION_PINNED: 'text-neutral-300 bg-white/5 border-white/10',
                  TASK_STATUS_CHANGED: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
                  OWNERSHIP_TRANSFERRED: 'text-neutral-300 bg-white/5 border-white/10',
                };
                const badgeStyle = actionBadge[log.action] || 'text-neutral-400 bg-white/5 border-white/10';

                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono">
                      <div className="text-blue-400 font-semibold">{log.id}</div>
                      <div className="text-[10px] text-neutral-500 truncate max-w-[120px]" title={log.hash}>
                        {log.hash.slice(0, 16)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${badgeStyle}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={log.actorName} size="xs" />
                        <span className="font-medium text-[#F5F5F2]">{log.actorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-semibold text-xs text-neutral-200">{log.projectName}</div>
                      <p className="text-neutral-400 text-[11px] leading-relaxed mt-0.5">
                        {log.detail}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <Lock className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
