'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Project } from '@/lib/types';
import { X, Users, MessageSquare, FileText, Check } from 'lucide-react';

interface EditProjectTeamModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProjectTeamModal({
  project,
  isOpen,
  onClose,
}: EditProjectTeamModalProps) {
  const { updateProjectTeamInfo } = useApp();

  const [teamName, setTeamName] = useState(project.team || '');
  const [teamDescription, setTeamDescription] = useState(project.teamDescription || '');
  const [teamChannel, setTeamChannel] = useState(project.teamChannel || '');

  useEffect(() => {
    setTeamName(project.team || '');
    setTeamDescription(project.teamDescription || '');
    setTeamChannel(project.teamChannel || '');
  }, [project]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    updateProjectTeamInfo(
      project.id,
      teamName.trim(),
      teamDescription.trim(),
      teamChannel.trim()
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#0D0F11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Configure Project Team Pod
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Team Pod Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Consensus Core Pod, Storage Engine Pod, Mesh Team..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mission &bull; Pod Charter
            </label>
            <textarea
              rows={3}
              placeholder="Briefly describe the team's engineering scope, rotation cadence, and operational coverage..."
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Team Slack Channel
            </label>
            <div className="relative">
              <MessageSquare className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. #team-apollo-consensus"
                value={teamChannel}
                onChange={(e) => setTeamChannel(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Team Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
