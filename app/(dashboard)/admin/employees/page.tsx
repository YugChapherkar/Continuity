'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Mail,
  Building,
  MapPin,
  FileText,
  Activity,
  CheckSquare,
} from 'lucide-react';

export default function AdminEmployeesPage() {
  const { users, teams, projects, updates, activeRole, refreshData, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Systems Engineer');
  const [inviteSystemRole, setInviteSystemRole] = useState<'Admin' | 'Team Leader' | 'Employee'>('Employee');
  const [inviteDept, setInviteDept] = useState('Platform Infrastructure');
  const [inviteTeamId, setInviteTeamId] = useState('');
  const [inviteLocation, setInviteLocation] = useState('Remote (UTC)');
  const [invitePassword, setInvitePassword] = useState('12345678');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeRole !== 'Admin') {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Access Restricted</h1>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Employee directory administration, role assignments, and account governance are restricted to authorized Administrators.
        </p>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
      u.department.toLowerCase().includes(q);

    const matchesRole =
      roleFilter === 'ALL' ||
      u.systemRole === roleFilter ||
      (roleFilter === 'Admin' && u.isAdmin);

    const matchesTeam = teamFilter === 'ALL' || u.teamId === teamFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'Active' && u.accountStatus !== 'Inactive') ||
      (statusFilter === 'Inactive' && u.accountStatus === 'Inactive');

    return matchesSearch && matchesRole && matchesTeam && matchesStatus;
  });

  const handleInviteEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !inviteDept) {
      showToast('Name, email, and department are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.inviteEmployee({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        systemRole: inviteSystemRole,
        department: inviteDept,
        teamId: inviteTeamId || undefined,
        location: inviteLocation,
        password: invitePassword || '12345678',
      });
      await refreshData();
      showToast(`Employee ${inviteName} onboarded and access provisioned.`, 'success');
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteTeamId('');
    } catch (err: any) {
      showToast(err.message || 'Error onboarding employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRoleOrStatus({
        userId,
        systemRole: newRole,
      });
      await refreshData();
      showToast('Employee authorization role updated.', 'success');
      if (selectedUser?.id === userId) {
        setSelectedUser((prev: any) => ({ ...prev, systemRole: newRole, isAdmin: newRole === 'Admin' }));
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating role', 'error');
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.accountStatus === 'Inactive' ? 'Active' : 'Inactive';
    try {
      await api.updateUserRoleOrStatus({
        userId: user.id,
        accountStatus: newStatus,
      });
      await refreshData();
      showToast(`Account for ${user.name} set to ${newStatus}. Historical audit trail intact.`, 'info');
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev: any) => ({ ...prev, accountStatus: newStatus }));
      }
    } catch (err: any) {
      showToast(err.message || 'Error toggling account status', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">Employee Directory & Workload</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25">
              Admin Governance
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Manage employee access, assign enterprise roles, oversee pod assignments, and inspect workload indicators.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-600 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite / Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0D0F10] border border-white/10 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#0D0F10] border border-white/10 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Team Leader">Team Leader</option>
            <option value="Employee">Employee</option>
          </select>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#0D0F10] border border-white/10 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#0D0F10] border border-white/10 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] border-b border-white/[0.06] text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Authorized Role</th>
                <th className="px-6 py-4">Assigned Team</th>
                <th className="px-6 py-4 text-center">Assigned Tasks</th>
                <th className="px-6 py-4 text-center">Completed</th>
                <th className="px-6 py-4 text-center">Blockers</th>
                <th className="px-6 py-4">Latest Update</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.map((user) => {
                const userTeam = teams.find((t) => t.id === user.teamId);
                const allTasks = projects.flatMap((p) => p.tasks || []);
                const assignedTasks = allTasks.filter(
                  (t) => t.assigneeId === user.id || t.assignee.toLowerCase() === user.name.toLowerCase()
                );
                const completedTasks = assignedTasks.filter((t) => t.status === 'Completed' || t.status === 'Done');
                const blockedTasks = assignedTasks.filter((t) => t.status === 'Blocked');
                const latestUpdate = updates.find((u) => u.employeeId === user.id);

                const roleBadgeClass =
                  user.systemRole === 'Admin' || user.isAdmin
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-bold'
                    : user.systemRole === 'Team Leader'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-semibold'
                    : 'bg-white/5 text-neutral-300 border-white/10';

                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} initials={user.initials} size="sm" showIndicator />
                        <div>
                          <div className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.employeeId && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-neutral-400">
                                {user.employeeId}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${roleBadgeClass}`}>
                        {user.systemRole || (user.isAdmin ? 'Admin' : 'Employee')}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="px-6 py-4 font-mono text-neutral-300">
                      {userTeam ? (
                        <span className="text-blue-400">{userTeam.name}</span>
                      ) : (
                        <span className="text-neutral-500">Unassigned</span>
                      )}
                    </td>

                    {/* Assigned Tasks */}
                    <td className="px-6 py-4 text-center font-mono font-medium text-white">
                      {assignedTasks.length}
                    </td>

                    {/* Completed Tasks */}
                    <td className="px-6 py-4 text-center font-mono text-emerald-400 font-semibold">
                      {completedTasks.length}
                    </td>

                    {/* Blockers */}
                    <td className="px-6 py-4 text-center font-mono">
                      {blockedTasks.length > 0 ? (
                        <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {blockedTasks.length}
                        </span>
                      ) : (
                        <span className="text-neutral-500">0</span>
                      )}
                    </td>

                    {/* Latest Update */}
                    <td className="px-6 py-4 max-w-xs truncate text-[11px] text-neutral-400">
                      {latestUpdate ? (
                        <span title={latestUpdate.completedWork}>{latestUpdate.completedWork}</span>
                      ) : (
                        <span className="text-neutral-600">No recent update</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
                          user.accountStatus === 'Inactive'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-white/5 text-neutral-400 border-white/10 hover:text-amber-400 hover:border-amber-500/30'
                        }`}
                      >
                        {user.accountStatus === 'Inactive' ? 'Activate' : 'Deactivate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Employee Details Slide-over Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1112] border border-white/15 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedUser.name} initials={selectedUser.initials} size="md" showIndicator />
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedUser.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        selectedUser.accountStatus === 'Inactive'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      }`}
                    >
                      {selectedUser.accountStatus || 'Active'}
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Role Change Control */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">
                  Authorized Enterprise Role (RBAC)
                </label>
                <div className="flex gap-2">
                  {(['Employee', 'Team Leader', 'Admin'] as const).map((r) => {
                    const isSelected =
                      (selectedUser.systemRole === r) || (r === 'Admin' && selectedUser.isAdmin);
                    return (
                      <button
                        key={r}
                        onClick={() => handleUpdateRole(selectedUser.id, r)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2563EB] text-white border-blue-500 shadow-sm'
                            : 'bg-white/5 text-neutral-400 hover:text-white border-white/10'
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workload Disclosure */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Workload & Accountability Summary</span>
                  <span className="text-[10px] text-neutral-500 font-mono">Real-time metrics</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono py-2 bg-[#050606] rounded-lg">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {projects.flatMap((p) => p.tasks || []).filter(
                        (t) => t.assigneeId === selectedUser.id || t.assignee.toLowerCase() === selectedUser.name.toLowerCase()
                      ).length}
                    </div>
                    <div className="text-[10px] text-neutral-500">Active Tasks</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400">
                      {projects.flatMap((p) => p.tasks || []).filter(
                        (t) =>
                          (t.assigneeId === selectedUser.id || t.assignee.toLowerCase() === selectedUser.name.toLowerCase()) &&
                          (t.status === 'Completed' || t.status === 'Done')
                      ).length}
                    </div>
                    <div className="text-[10px] text-neutral-500">Completed</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-400">
                      {updates.filter((u) => u.employeeId === selectedUser.id).length}
                    </div>
                    <div className="text-[10px] text-neutral-500">Updates Filed</div>
                  </div>
                </div>
              </div>

              {/* Bio & Location */}
              <div className="text-xs text-neutral-400 space-y-1">
                <div>
                  <span className="font-semibold text-neutral-300">Department:</span> {selectedUser.department}
                </div>
                <div>
                  <span className="font-semibold text-neutral-300">Location:</span> {selectedUser.location || 'Remote'}
                </div>
                <div>
                  <span className="font-semibold text-neutral-300">Bio:</span> {selectedUser.bio || 'None provided'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedUser)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-500/10 border border-amber-500/30"
              >
                {selectedUser.accountStatus === 'Inactive' ? 'Activate Account' : 'Deactivate Account'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Invite / Add Employee */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1112] border border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Onboard & Invite Employee</h2>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Foster"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Company Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="rachel.foster@continuity.internal"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Storage Engineer"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    RBAC Role Authorization *
                  </label>
                  <select
                    value={inviteSystemRole}
                    onChange={(e) => setInviteSystemRole(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Core Systems"
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Initial Team Pod
                  </label>
                  <select
                    value={inviteTeamId}
                    onChange={(e) => setInviteTeamId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">No team assignment yet</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Initial Login Password *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12345678"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  The employee can log in immediately using their email and this password.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Onboarding...' : 'Onboard Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
