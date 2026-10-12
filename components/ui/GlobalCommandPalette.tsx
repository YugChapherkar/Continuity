'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, FolderGit2, ArrowRight, UserCheck, Terminal, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GlobalCommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    projects,
    handoffs,
    users,
    setIsCreateHandoffModalOpen,
  } = useApp();

  const [query, setQuery] = useState('');
  const router = useRouter();

  if (!isCommandPaletteOpen) return null;

  const handleClose = () => {
    setQuery('');
    setIsCommandPaletteOpen(false);
  };

  const q = query.toLowerCase().trim();

  const matchingProjects = projects.filter(
    (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  );

  const matchingHandoffs = handoffs.filter(
    (h) => h.id.toLowerCase().includes(q) || h.projectName.toLowerCase().includes(q) || h.note.toLowerCase().includes(q)
  );

  const matchingUsers = users.filter(
    (u) => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  );

  const allAdrs = projects.flatMap((p) =>
    p.decisions.map((d) => ({ ...d, projectName: p.name, projectId: p.id }))
  ).filter((d) => d.id.toLowerCase().includes(q) || d.title.toLowerCase().includes(q));

  const navigate = (path: string) => {
    handleClose();
    router.push(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-2 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0D0F10] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#050606]/60">
          <Search className="w-5 h-5 text-slate-400 dark:text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects, handoffs, colleagues, ADRs, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-[#F5F5F2] placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none"
          />
          <kbd className="text-[10px] bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-neutral-400 px-2 py-1 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
              Quick Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsCreateHandoffModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-left text-neutral-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Start new engineering handoff dossier</span>
                </div>
                <span className="text-[11px] text-neutral-500">CTA</span>
              </button>

              <button
                onClick={() => navigate('/assistant')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-left text-neutral-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <span>Ask AI Knowledge Query Terminal</span>
                </div>
                <span className="text-[11px] text-neutral-500">Query</span>
              </button>
            </div>
          </div>

          {/* Projects */}
          {matchingProjects.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                Workspaces ({matchingProjects.length})
              </div>
              <div className="space-y-1">
                {matchingProjects.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-left text-neutral-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderGit2 className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="truncate">{p.name}</span>
                      <span className="font-mono text-[11px] text-neutral-400 shrink-0">
                        {p.currentVersionId}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 shrink-0 capitalize">{p.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Handoff Packages */}
          {matchingHandoffs.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                Handoff Dossiers ({matchingHandoffs.length})
              </div>
              <div className="space-y-1">
                {matchingHandoffs.slice(0, 4).map((h) => (
                  <button
                    key={h.id}
                    onClick={() => navigate(`/handoffs/${h.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-left text-neutral-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-mono text-blue-400 shrink-0">{h.id}</span>
                      <span className="truncate">{h.projectName}</span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 border ${
                        h.status === 'Accepted'
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-blue-300 bg-blue-500/10 border-blue-500/20'
                      }`}
                    >
                      {h.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADRs */}
          {allAdrs.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                Architecture Decision Records ({allAdrs.length})
              </div>
              <div className="space-y-1">
                {allAdrs.slice(0, 3).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/projects/${d.projectId}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-left text-neutral-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-mono text-cyan-400 shrink-0">{d.id}</span>
                      <span className="truncate">{d.title}</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 shrink-0">{d.projectName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teammates */}
          {matchingUsers.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                Teammates ({matchingUsers.length})
              </div>
              <div className="space-y-1">
                {matchingUsers.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      navigate('/team');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 text-left text-neutral-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-neutral-400" />
                      <span>{u.name}</span>
                      <span className="text-neutral-500">({u.role})</span>
                    </div>
                    <span className="text-[11px] text-neutral-400">View</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#050606] border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Tip: Press ⌘K anywhere to summon search</span>
          <span>ENTER to select</span>
        </div>
      </div>
    </div>
  );
}
