'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import { Task, TaskStatus } from '@/lib/types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Shield,
  Layers,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export default function TasksPage() {
  const { projects, users, currentUser, activeRole, refreshData, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('ALL');
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Create task form state
  const [targetProjectId, setTargetProjectId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskPriority, setTaskPriority] = useState<'P0' | 'P1' | 'P2'>('P1');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEffort, setTaskEffort] = useState('');
  const [taskCriteria, setTaskCriteria] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Task update state
  const [updateStatus, setUpdateStatus] = useState<TaskStatus>('In Progress');
  const [updateNote, setUpdateNote] = useState('');
  const [evidenceInput, setEvidenceInput] = useState('');

  // Collect all tasks across all accessible projects
  const allTasks: (Task & { projectId: string; projectName: string })[] = [];
  projects.forEach((p) => {
    (p.tasks || []).forEach((t) => {
      allTasks.push({
        ...t,
        projectId: p.id,
        projectName: p.name,
      });
    });
  });

  const filteredTasks = allTasks.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      t.assignee.toLowerCase().includes(q);

    const matchesProject = selectedProjectFilter === 'ALL' || t.projectId === selectedProjectFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || t.status === selectedStatusFilter;
    const matchesPriority = selectedPriorityFilter === 'ALL' || t.priority === selectedPriorityFilter;
    const matchesAssignee =
      !onlyMyTasks ||
      t.assigneeId === currentUser.id ||
      t.assignee.toLowerCase() === currentUser.name.toLowerCase();

    return matchesSearch && matchesProject && matchesStatus && matchesPriority && matchesAssignee;
  });

  const canCreateTask = activeRole === 'Admin' || activeRole === 'Team Leader';

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectId || !taskTitle || !taskAssigneeId) {
      showToast('Project, title, and assignee are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTask({
        projectId: targetProjectId,
        title: taskTitle,
        description: taskDesc,
        assigneeId: taskAssigneeId,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        estimatedEffortHours: taskEffort ? Number(taskEffort) : undefined,
        acceptanceCriteria: taskCriteria || undefined,
      });
      await refreshData();
      showToast(`Task assigned successfully!`, 'success');
      setIsCreateModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssigneeId('');
      setTaskDueDate('');
    } catch (err: any) {
      showToast(err.message || 'Error creating task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setIsSubmitting(true);
    try {
      await api.updateTask(selectedTask.id, {
        status: updateStatus,
        latestUpdate: updateNote || undefined,
        evidenceUrls: evidenceInput ? [evidenceInput] : undefined,
      });
      await refreshData();
      showToast(`Task status updated to ${updateStatus}!`, 'success');
      setSelectedTask(null);
      setUpdateNote('');
      setEvidenceInput('');
    } catch (err: any) {
      showToast(err.message || 'Error updating task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    Backlog: 'bg-white/5 text-neutral-400 border-white/10',
    'To Do': 'bg-white/5 text-neutral-300 border-white/10',
    'In Progress': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Blocked: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    'In Review': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    'Changes Requested': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Done: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Critical: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5F2]">Task Execution Board</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/25">
              Strict RBAC
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            Track assignees, dependencies, evidence, blockers, and milestone delivery across authorized workspaces.
          </p>
        </div>

        {canCreateTask && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create & Assign Task</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search task title, ID, assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F10] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Project Filter */}
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#0D0F10] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Workspaces</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#0D0F10] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Backlog">Backlog</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="In Review">In Review</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#0D0F10] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="P0">P0 (Critical)</option>
            <option value="P1">P1 (High)</option>
            <option value="P2">P2 (Medium)</option>
          </select>

          {/* My Tasks Toggle */}
          <button
            onClick={() => setOnlyMyTasks((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
              onlyMyTasks
                ? 'bg-blue-50 dark:bg-[#2563EB]/20 text-blue-700 dark:text-white border-blue-300 dark:border-blue-500 font-bold'
                : 'bg-slate-50 dark:bg-[#0D0F10] text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Assigned to Me
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Task ID & Priority</th>
                <th className="px-6 py-4">Title & Workspace</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Latest Progress</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-neutral-500">
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue =
                    task.deadline &&
                    task.status !== 'Completed' &&
                    task.status !== 'Done' &&
                    new Date(task.deadline).getTime() < new Date().setHours(0, 0, 0, 0);

                  const isMyTask =
                    task.assigneeId === currentUser.id ||
                    task.assignee.toLowerCase() === currentUser.name.toLowerCase();

                  return (
                    <tr
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setUpdateStatus(task.status as any);
                        setUpdateNote(task.latestUpdate || '');
                      }}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      {/* ID & Priority */}
                      <td className="px-6 py-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{task.id}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              task.priority === 'P0'
                                ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                                : task.priority === 'P1'
                                ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-white/10'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </td>

                      {/* Title & Project */}
                      <td className="px-6 py-4 max-w-sm">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                          {task.projectName}
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={task.assignee} size="xs" />
                          <span className={isMyTask ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-700 dark:text-neutral-300'}>
                            {task.assignee}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${
                            statusColors[task.status] || 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 font-mono text-[11px]">
                        {task.deadline ? (
                          <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-neutral-400'}>
                            {task.deadline}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Latest Progress */}
                      <td className="px-6 py-4 max-w-xs truncate text-[11px] text-slate-500 dark:text-neutral-400">
                        {task.latestUpdate || <span className="text-slate-400 dark:text-neutral-600 italic">No notes</span>}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform inline-block">
                          View →
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View / Update Task */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1112] border border-slate-200 dark:border-white/15 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedTask.id}</span>
                  <span className="text-slate-400 dark:text-neutral-500">·</span>
                  <span className="text-slate-500 dark:text-neutral-400">{selectedTask.projectName}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">{selectedTask.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-neutral-300 space-y-1">
                <span className="text-slate-500 dark:text-neutral-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Description
                </span>
                <p className="leading-relaxed">{selectedTask.description || 'No description.'}</p>
                {selectedTask.acceptanceCriteria && (
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 dark:text-neutral-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Acceptance Criteria
                    </span>
                    <p className="text-slate-700 dark:text-neutral-300">{selectedTask.acceptanceCriteria}</p>
                  </div>
                )}
              </div>

              {/* Status Update Dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Change Execution Status *
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Backlog">Backlog</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="In Review">In Review</option>
                  <option value="Changes Requested">Changes Requested</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Progress Note */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Progress Note / Blocker Reason
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain work done, blockers encountered, or verification details..."
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Evidence Link */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Evidence / Attachment URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://monitoring.internal/... or git commit URL"
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Update Task Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Task */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1112] border border-slate-200 dark:border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Assign New Engineering Task</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Workspace / Project *
                </label>
                <select
                  required
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement monotonic read barrier verification in Raft follower"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Task Description & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Technical scope and implementation instructions..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                    Assignee *
                  </label>
                  <select
                    required
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select team member...</option>
                    {users
                      .filter((u) => u.accountStatus !== 'Inactive')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                    Priority *
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="P0">P0 (Critical / Blocker)</option>
                    <option value="P1">P1 (High Priority)</option>
                    <option value="P2">P2 (Normal / Medium)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                    Estimated Effort (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 16"
                    value={taskEffort}
                    onChange={(e) => setTaskEffort(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-neutral-300 mb-1">
                  Acceptance Criteria
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit test coverage >= 90%; zero io_uring ring overflow."
                  value={taskCriteria}
                  onChange={(e) => setTaskCriteria(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
