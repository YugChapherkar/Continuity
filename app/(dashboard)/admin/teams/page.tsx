'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import {
  Users,
  Plus,
  Shield,
  UserPlus,
  AlertTriangle,
  FolderGit2,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Filter,
  X,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminTeamsPage() {
  const { teams, users, projects, activeRole, refreshData, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Form states for team creation
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [teamDept, setTeamDept] = useState('Core Infrastructure');
  const [teamLeaderId, setTeamLeaderId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transfer modal state
  const [transferUserId, setTransferUserId] = useState('');
  const [targetTeamId, setTargetTeamId] = useState('');

  if (activeRole !== 'Admin') {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Access Restricted</h1>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Team organization and governance controls are restricted to authorized Administrators. Please switch to an Administrator perspective using the switcher in the sidebar.
        </p>
      </div>
    );
  }

  const departments = ['ALL', ...Array.from(new Set(teams.map((t) => t.department)))];

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()) ||
      (t.leaderName && t.leaderName.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const activeUsers = users.filter((u) => u.accountStatus !== 'Inactive');

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamDept || !teamLeaderId) {
      showToast('Please fill in team name, department, and team leader', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTeam({
        name: teamName,
        description: teamDesc,
        department: teamDept,
        leaderId: teamLeaderId,
        memberIds: selectedMemberIds,
      });
      await refreshData();
      showToast(`Team "${teamName}" created successfully!`, 'success');
      setIsCreateModalOpen(false);
      setTeamName('');
      setTeamDesc('');
      setTeamLeaderId('');
      setSelectedMemberIds([]);
    } catch (err: any) {
      showToast(err.message || 'Error creating team', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTeamStatus = async (team: any) => {
    const newStatus = team.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.updateTeam(team.id, { status: newStatus });
      await refreshData();
      showToast(`Team "${team.name}" status changed to ${newStatus}. Historical projects preserved.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Error updating team status', 'error');
    }
  };

  const handleTransferMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferUserId || !targetTeamId) {
      showToast('Please select an employee and target team', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.updateUserRoleOrStatus({
        userId: transferUserId,
        teamId: targetTeamId,
      });
      await refreshData();
      showToast('Employee transferred successfully. Historical ownership preserved.', 'success');
      setIsTransferModalOpen(false);
      setTransferUserId('');
      setTargetTeamId('');
    } catch (err: any) {
      showToast(err.message || 'Error transferring employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">Team Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Organize engineering pods, appoint team leaders, manage roster transfers, and monitor pod workloads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Transfer Member</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-600 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Team</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams, leaders, or departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0D0F10] border border-white/10 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedDept === dept
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeams.map((team) => {
          const leader = users.find((u) => u.id === team.leaderId);
          const members = users.filter((u) => team.memberIds.includes(u.id));
          const teamProjects = projects.filter((p) => p.teamId === team.id || p.team === team.name);
          const activeProjects = teamProjects.filter((p) => p.status !== 'Delivered');
          const allTasks = teamProjects.flatMap((p) => p.tasks || []);
          const overdueTasks = allTasks.filter(
            (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Completed'
          );
          const blockedTasks = allTasks.filter((t) => t.status === 'Blocked');

          return (
            <div
              key={team.id}
              className={`bg-[#0B0D0E]/60 backdrop-blur-md border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all group ${
                team.status === 'Inactive'
                  ? 'border-white/5 opacity-70'
                  : 'border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-base text-[#F5F5F2]">{team.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${
                          team.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : 'bg-neutral-500/10 text-neutral-400 border-white/10'
                        }`}
                      >
                        {team.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-400 font-mono tracking-wide">
                      {team.department}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleTeamStatus(team)}
                    className="text-[11px] font-mono text-neutral-400 hover:text-amber-400 px-2.5 py-1 rounded-lg border border-white/10 hover:border-amber-500/30 transition-colors cursor-pointer"
                  >
                    {team.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>

                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  {team.description || 'No description provided.'}
                </p>

                {/* Team Leader Spotlight */}
                <div className="mt-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={leader?.name || team.leaderName || 'Leader'} size="sm" showIndicator />
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{leader?.name || team.leaderName || 'Unassigned'}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          LEAD
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-400">{leader?.email || 'Leader'}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">Appointed Leader</span>
                </div>

                {/* Pod Metrics */}
                <div className="grid grid-cols-4 gap-2 mt-4 py-3 border-y border-white/5 text-center font-mono">
                  <div>
                    <div className="text-sm font-bold text-white">{members.length}</div>
                    <div className="text-[10px] text-neutral-500">Members</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-400">{activeProjects.length}</div>
                    <div className="text-[10px] text-neutral-500">Active Proj.</div>
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${blockedTasks.length > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
                      {blockedTasks.length}
                    </div>
                    <div className="text-[10px] text-neutral-500">Blocked</div>
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${overdueTasks.length > 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
                      {overdueTasks.length}
                    </div>
                    <div className="text-[10px] text-neutral-500">Overdue</div>
                  </div>
                </div>

                {/* Members Roster Avatars */}
                <div className="mt-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                    Active Roster ({members.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-neutral-300"
                      >
                        <Avatar name={m.name} size="xs" />
                        <span>{m.name}</span>
                        {m.id === team.leaderId && (
                          <span className="text-[9px] text-amber-400 font-bold">★</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Team */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1112] border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Create Engineering Team</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Pod"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Department / Category *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Infrastructure, Security, Site Reliability"
                  value={teamDept}
                  onChange={(e) => setTeamDept(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Description & Charter
                </label>
                <textarea
                  rows={2}
                  placeholder="Scope of responsibility and technical mandates..."
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Appoint Team Leader *
                </label>
                <select
                  required
                  value={teamLeaderId}
                  onChange={(e) => setTeamLeaderId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Select an active employee as Team Leader...</option>
                  {activeUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role} ({u.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Add Initial Team Members
                </label>
                <div className="max-h-36 overflow-y-auto border border-white/10 rounded-xl p-2 space-y-1 bg-[#050606]">
                  {activeUsers
                    .filter((u) => u.id !== teamLeaderId)
                    .map((u) => {
                      const isChecked = selectedMemberIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className="flex items-center gap-2.5 p-1.5 hover:bg-white/5 rounded-lg text-xs text-neutral-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMemberIds([...selectedMemberIds, u.id]);
                              } else {
                                setSelectedMemberIds(selectedMemberIds.filter((id) => id !== u.id));
                              }
                            }}
                            className="rounded border-white/20 bg-transparent text-blue-500 focus:ring-0"
                          />
                          <span>{u.name}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">({u.role})</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Team...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transfer Member */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1112] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Transfer Team Member</h2>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Select Employee *
                </label>
                <select
                  required
                  value={transferUserId}
                  onChange={(e) => setTransferUserId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select an employee to transfer...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (Current: {teams.find((t) => t.id === u.teamId)?.name || 'None'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Destination Team *
                </label>
                <select
                  required
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select target engineering team...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-neutral-400">
                Transferring an employee updates their pod membership while preserving all historical task assignments, project handoffs, and audit logs intact.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
