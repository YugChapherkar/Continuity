'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { CreateProjectModal } from '@/components/ui/CreateProjectModal';
import { EmployeeDashboard } from '@/components/employee/EmployeeDashboard';
import { Avatar } from '@/components/ui/Avatar';
import {
  FolderGit2,
  Users,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  AlertTriangle,
  Clock,
  FileText,
  ClipboardCheck,
  PackageCheck,
  RotateCcw,
  Search,
  CheckSquare,
} from 'lucide-react';

export default function HomePage() {
  const {
    currentUser,
    activeRole,
    projects,
    teams,
    users,
    updates,
    reports,
    reviews,
    deliveries,
    setIsCreateHandoffModalOpen,
  } = useApp();

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Admin filter states
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterLeader, setFilterLeader] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterClient, setFilterClient] = useState('ALL');
  const [searchProject, setSearchProject] = useState('');

  // Collect all tasks across all projects
  const allTasks = projects.flatMap((p) => p.tasks || []);
  const overdueTasks = allTasks.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Completed' && t.status !== 'Done'
  );
  const blockedTasks = allTasks.filter((t) => t.status === 'Blocked');

  // Specific KPI computations from real records
  const activeTeamsCount = teams.filter((t) => t.status === 'Active').length || teams.length;
  const activeProjects = projects.filter((p) => p.status !== 'Delivered');
  const atRiskProjects = projects.filter((p) => p.health === 'At Risk' || p.health === 'Critical' || p.status === 'Changes Requested');
  const pendingReports = reports.filter((r) => r.status === 'Submitted');
  const pendingFinalReviews = reviews.filter((r) => r.status === 'Submitted for Final Review');
  const revisionRequests = reviews.filter((r) => r.status === 'Changes Requested');
  const approvedProjects = projects.filter((p) => p.status === 'Approved for Delivery');
  const deliveredProjects = deliveries;

  // Filter options
  const clientsList = ['ALL', ...Array.from(new Set(projects.map((p) => p.client).filter(Boolean)))];

  // Filtered projects for Admin table
  const filteredProjects = projects.filter((p) => {
    const q = searchProject.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.client && p.client.toLowerCase().includes(q)) ||
      p.team.toLowerCase().includes(q);

    const matchesTeam = filterTeam === 'ALL' || p.teamId === filterTeam || p.team === filterTeam;
    const matchesLeader = filterLeader === 'ALL' || p.teamLeaderId === filterLeader || p.ownerId === filterLeader;
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || p.priority === filterPriority;
    const matchesClient = filterClient === 'ALL' || p.client === filterClient;

    return matchesSearch && matchesTeam && matchesLeader && matchesStatus && matchesPriority && matchesClient;
  });

  // Actionable items requiring Admin review
  const adminActionItems = [
    ...pendingFinalReviews.map((r) => ({
      type: 'Final Review',
      title: `${r.projectName} deliverable submitted for final sign-off`,
      link: '/admin/reviews',
    })),
    ...pendingReports.map((r) => ({
      type: 'Progress Report',
      title: `${r.projectName} Sprint Report submitted by ${r.leaderName}`,
      link: '/reports',
    })),
    ...approvedProjects.map((p) => ({
      type: 'Client Delivery Ready',
      title: `${p.name} (${p.currentVersionId}) approved and ready for client delivery`,
      link: '/admin/deliveries',
    })),
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* =========================================================================
          TOP EXECUTIVE HEADER (Clean, Minimal, Professional)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <Avatar name={currentUser.name} initials={currentUser.initials} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {currentUser.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {activeRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeRole === 'Admin'
                ? 'Executive platform governance, 10-KPI monitoring, and delivery sign-offs.'
                : activeRole === 'Team Leader'
                ? 'Engineering execution, pod task distribution, and sprint progress.'
                : 'Task execution workbench, daily work journal, and shift handovers.'}
            </p>
          </div>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center gap-2">
          {activeRole === 'Admin' && (
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          )}

          {activeRole === 'Team Leader' && (
            <Link
              href="/reports"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submit Progress Report</span>
            </Link>
          )}

          {activeRole === 'Employee' && (
            <Link
              href="/updates"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Log Daily Update</span>
            </Link>
          )}

          <button
            onClick={() => setIsCreateHandoffModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>New Handoff</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ADMIN EXECUTIVE DASHBOARD VIEW
         ========================================================================= */}
      {activeRole === 'Admin' && (
        <div className="space-y-6">
          {/* Executive KPI Metric Grid (Clean, Flat, Minimal) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. Total Employees */}
            <Link
              href="/admin/employees"
              className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Employees</span>
                <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{users.length}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Active directory</span>
              </div>
            </Link>

            {/* 2. Active Teams */}
            <Link
              href="/admin/teams"
              className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Active Teams</span>
                <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{activeTeamsCount}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Engineering pods</span>
              </div>
            </Link>

            {/* 3. Active Projects */}
            <Link
              href="/projects"
              className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Active Projects</span>
                <FolderGit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{activeProjects.length}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">In execution</span>
              </div>
            </Link>

            {/* 4. Projects At Risk */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Projects at Risk</span>
                <AlertTriangle className={`w-3.5 h-3.5 ${atRiskProjects.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              </div>
              <div className="mt-2.5">
                <span className={`text-2xl font-bold tracking-tight font-mono ${atRiskProjects.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {atRiskProjects.length}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Health flagged</span>
              </div>
            </div>

            {/* 5. Overdue Tasks */}
            <Link
              href="/tasks"
              className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Overdue Tasks</span>
                <Clock className={`w-3.5 h-3.5 ${overdueTasks.length > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
              </div>
              <div className="mt-2.5">
                <span className={`text-2xl font-bold tracking-tight font-mono ${overdueTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  {overdueTasks.length}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Passed deadlines</span>
              </div>
            </Link>

            {/* 6. Pending Leader Reports */}
            <Link
              href="/reports"
              className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Pending Reports</span>
                <FileText className={`w-3.5 h-3.5 ${pendingReports.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              </div>
              <div className="mt-2.5">
                <span className={`text-2xl font-bold tracking-tight font-mono ${pendingReports.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {pendingReports.length}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Awaiting review</span>
              </div>
            </Link>

            {/* 7. Pending Final Reviews */}
            <Link
              href="/admin/reviews"
              className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Final Reviews</span>
                <ClipboardCheck className={`w-3.5 h-3.5 ${pendingFinalReviews.length > 0 ? 'text-purple-500' : 'text-slate-400'}`} />
              </div>
              <div className="mt-2.5">
                <span className={`text-2xl font-bold tracking-tight font-mono ${pendingFinalReviews.length > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'}`}>
                  {pendingFinalReviews.length}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Deliverable sign-off</span>
              </div>
            </Link>

            {/* 8. Active Revisions */}
            <Link
              href="/admin/reviews"
              className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Active Revisions</span>
                <RotateCcw className={`w-3.5 h-3.5 ${revisionRequests.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{revisionRequests.length}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Changes requested</span>
              </div>
            </Link>

            {/* 9. Approved Releases */}
            <Link
              href="/admin/deliveries"
              className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Approved Releases</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-mono">{approvedProjects.length}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Ready for client delivery</span>
              </div>
            </Link>

            {/* 10. Delivered Releases */}
            <Link
              href="/admin/deliveries"
              className="p-3.5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Delivered Releases</span>
                <PackageCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="mt-2.5">
                <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">{deliveredProjects.length}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Client ratified</span>
              </div>
            </Link>
          </div>

          {/* Action Required Banner (Clean, Minimal Alert Strip) */}
          {adminActionItems.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Action Required ({adminActionItems.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {adminActionItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.link}
                    className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-750 hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-mono font-semibold uppercase text-blue-600 dark:text-blue-400 block truncate">
                        {item.type}
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium truncate block">{item.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects, client, team..."
                value={searchProject}
                onChange={(e) => setSearchProject(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Submitted for Final Review">Submitted for Review</option>
                <option value="Changes Requested">Changes Requested</option>
                <option value="Approved for Delivery">Approved for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>

              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Clients</option>
                {clientsList.filter((c) => c !== 'ALL').map((c: any) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Oversight Matrix (Clean, Minimal Table) */}
          <div className="bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Platform Projects &amp; Governance
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {filteredProjects.length} Workstreams
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Project &amp; Client</th>
                    <th className="px-5 py-3">Team Pod</th>
                    <th className="px-5 py-3">Health</th>
                    <th className="px-5 py-3">Task Completion</th>
                    <th className="px-5 py-3">Governance Stage</th>
                    <th className="px-5 py-3">Deadline</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredProjects.map((p) => {
                    const pTasks = p.tasks || [];
                    const pCompleted = pTasks.filter((t) => t.status === 'Completed' || t.status === 'Done').length;
                    const pTotal = pTasks.length || 1;
                    const completionPct = Math.round((pCompleted / pTotal) * 100);

                    const statusBadgeColors: Record<string, string> = {
                      Active: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                      'Submitted for Final Review': 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
                      'In Review': 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
                      'Changes Requested': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
                      'Approved for Delivery': 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40 font-semibold',
                      Delivered: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 font-semibold',
                    };

                    const healthDot: Record<string, string> = {
                      Green: 'bg-emerald-500',
                      'At Risk': 'bg-amber-500',
                      Critical: 'bg-rose-500',
                    };

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Name & Client */}
                        <td className="px-5 py-3.5">
                          <Link href={`/projects/${p.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                            {p.name}
                          </Link>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Client: <span className="text-slate-700 dark:text-slate-300">{p.client || 'Enterprise'}</span>
                          </span>
                        </td>

                        {/* Team & Lead */}
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{p.team}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            Lead: {users.find(u => u.id === p.teamLeaderId)?.name || 'Team Lead'}
                          </div>
                        </td>

                        {/* Health */}
                        <td className="px-5 py-3.5">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            <span className={`w-1.5 h-1.5 rounded-full ${healthDot[p.health || 'Green']}`} />
                            <span>{p.health || 'Green'}</span>
                          </div>
                        </td>

                        {/* Task Completion Progress Bar */}
                        <td className="px-5 py-3.5">
                          <div className="w-24 space-y-1">
                            <div className="flex justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400">
                              <span>{pCompleted}/{pTotal}</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{completionPct}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Governance Stage */}
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${statusBadgeColors[p.status] || 'bg-slate-100 text-slate-700'}`}>
                            {p.status}
                          </span>
                        </td>

                        {/* Target Deadline */}
                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {p.deadline || 'Ongoing'}
                        </td>

                        {/* Action Link */}
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/projects/${p.id}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TEAM LEADER PERSPECTIVE VIEW
         ========================================================================= */}
      {activeRole === 'Team Leader' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assigned Pod Projects</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {projects.filter(p => p.teamLeaderId === currentUser.id || p.teamId === currentUser.teamId).length}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Blocked Tasks in Pod</span>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {blockedTasks.length}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Team Updates Filed</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {updates.length}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 space-y-3.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Workflows</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/reports"
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:border-blue-400 dark:hover:border-blue-500 flex items-center gap-3 transition-colors group"
              >
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Submit Progress Report</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Consolidated sprint update for Admin</div>
                </div>
              </Link>

              <Link
                href="/tasks"
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:border-blue-400 dark:hover:border-blue-500 flex items-center gap-3 transition-colors group"
              >
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Assign &amp; Manage Tasks</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Distribute tasks to team members</div>
                </div>
              </Link>

              <Link
                href="/updates"
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:border-blue-400 dark:hover:border-blue-500 flex items-center gap-3 transition-colors group"
              >
                <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">Review Employee Updates</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Confirm progress and clear blockers</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EMPLOYEE WORKBENCH VIEW
         ========================================================================= */}
      {activeRole === 'Employee' && (
        <EmployeeDashboard />
      )}

      {/* Structured Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
}

