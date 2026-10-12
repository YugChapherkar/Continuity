'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { Project, TeamRole } from '@/lib/types';
import {
  X,
  UserPlus,
  Search,
  Shield,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Radio,
  Clock,
} from 'lucide-react';

interface AddProjectTeamMemberModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function AddProjectTeamMemberModal({
  project,
  isOpen,
  onClose,
}: AddProjectTeamMemberModalProps) {
  const { users, currentUser, addProjectTeamMember } = useApp();

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [role, setRole] = useState<TeamRole>('Member');
  const [responsibility, setResponsibility] = useState('');
  const [isPrimaryOnCall, setIsPrimaryOnCall] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const existingMemberIds = new Set((project.teamMembers || []).map((m) => m.userId));

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select an employee to add to the team.');
      return;
    }
    if (existingMemberIds.has(selectedUserId)) {
      setError('This employee is already part of the project team.');
      return;
    }

    addProjectTeamMember(project.id, {
      userId: selectedUserId,
      role,
      responsibility: responsibility.trim() || `${role} on ${project.name}`,
      isPrimaryOnCall,
    });

    onClose();
    // Reset state
    setSelectedUserId('');
    setRole('Member');
    setResponsibility('');
    setIsPrimaryOnCall(false);
    setError(null);
  };

  const RESPONSIBILITY_SUGGESTIONS = [
    'Core Architecture & Algorithms',
    'Shift Rotation & Primary Custodian',
    'Reliability & SLO Observability',
    'CI/CD Pipeline & Tooling',
    'Security & Cryptographic Guardrails',
    'Storage & Persistence Layer',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0D0F11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Teammate to Project
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {project.name} &bull; {project.team || 'Engineering Pod'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs text-rose-500 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Colleague
            </label>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search colleagues by name, role, email, or badge ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* List */}
            <div className="border border-slate-200 dark:border-white/10 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.06]">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-400">
                  No matching employees found
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isExisting = existingMemberIds.has(u.id);
                  const isSelected = selectedUserId === u.id;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={isExisting}
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setError(null);
                      }}
                      className={`w-full p-2.5 text-left flex items-center justify-between gap-3 transition-colors ${
                        isExisting
                          ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-transparent'
                          : isSelected
                          ? 'bg-blue-500/15 border-l-4 border-blue-500 text-slate-900 dark:text-white'
                          : 'hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={u.name} initials={u.initials} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate leading-tight">
                              {u.name}
                            </span>
                            {u.employeeId && (
                              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-300">
                                {u.employeeId}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {u.role} &bull; {u.department.split('&')[0]}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isExisting ? (
                          <span className="text-[10px] font-medium text-neutral-400">
                            Already on team
                          </span>
                        ) : isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        ) : (
                          <span className="text-[10px] text-neutral-400 group-hover:text-neutral-200">
                            Select
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Role Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Team Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Lead', 'Member'] as TeamRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                    role === r
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-300 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Responsibility / Area of Focus */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Responsibility &bull; Area of Focus
              </label>
              <span className="text-[10px] text-neutral-400">Optional</span>
            </div>
            <input
              type="text"
              placeholder="e.g. WAL persistent log, Raft consensus RPCs, or Ingress filters..."
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-all"
            />

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {RESPONSIBILITY_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setResponsibility(sug)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-neutral-300 transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* On-Call Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] cursor-pointer hover:border-blue-500/30 transition-colors">
              <input
                type="checkbox"
                checked={isPrimaryOnCall}
                onChange={(e) => setIsPrimaryOnCall(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Designate as Primary On-Call Custodian
                </span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 block mt-0.5">
                  This teammate will receive emergency telemetry pages and direct shift rotation handoffs.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
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
              disabled={!selectedUserId}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add to Team</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
