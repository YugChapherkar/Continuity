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
  ShieldAlert,
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
  Filter,
  ExternalLink,
  CheckSquare,
  Building,
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
    auditLogs,
    handoffs,
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
  const completedTasks = allTasks.filter((t) => t.status === 'Completed' || t.status === 'Done');

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
  const leadersList = ['ALL', ...Array.from(new Set(projects.map((p) => p.ownerId).filter(Boolean)))];

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
      color: 'purple',
    })),
    ...pendingReports.map((r) => ({
      type: 'Progress Report',
      title: `${r.projectName} Sprint Report submitted by ${r.leaderName}`,
      link: '/reports',
      color: 'amber',
    })),
    ...approvedProjects.map((p) => ({
      type: 'Client Delivery Ready',
      title: `${p.name} (${p.currentVersionId}) approved and ready for client delivery`,
      link: '/admin/deliveries',
      color: 'cyan',
    })),
  ];

  // Perspective-tailored views
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* =========================================================================
          TOP EXECUTIVE GREETING & CONTEXT HEADER
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={currentUser.name} initials={currentUser.initials} size="lg" showIndicator />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#050606] ${
                activeRole === 'Admin'
                  ? 'bg-blue-500'
                  : activeRole === 'Team Leader'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5F2]">
                Welcome, {currentUser.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                  activeRole === 'Admin'
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/25'
                    : activeRole === 'Team Leader'
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/25'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25'
                }`}
              >
                {activeRole} Perspective
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
              {activeRole === 'Admin'
                ? 'Continuity Executive Oversight, Governance & Delivery Platform'
                : activeRole === 'Team Leader'
                ? 'Engineering Execution, Pod Workload & Progress Reporting'
                : 'Task Accountability, Daily Updates & Shift Handoff Workbench'}
            </p>
          </div>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center gap-2.5">
          {activeRole === 'Admin' && (
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          )}

          {activeRole === 'Team Leader' && (
            <Link
              href="/reports"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Submit Progress Report</span>
            </Link>
          )}

          {activeRole === 'Employee' && (
            <Link
              href="/updates"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Log Daily Update</span>
            </Link>
          )}

          <button
            onClick={() => setIsCreateHandoffModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
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
        <div className="space-y-8">
          {/* Executive KPI Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Total Employees */}
            <Link
              href="/admin/employees"
              className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Employees</span>
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{users.length}</span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block mt-0.5">Active directory</span>
              </div>
            </Link>

            {/* Active Teams */}
            <Link
              href="/admin/teams"
              className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Active Teams</span>
                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{activeTeamsCount}</span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block mt-0.5">Engineering pods</span>
              </div>
            </Link>

            {/* Active Projects */}
            <Link
              href="/projects"
              className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Active Projects</span>
                <FolderGit2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-white">{activeProjects.length}</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">In execution</span>
              </div>
            </Link>

            {/* Projects At Risk */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Projects at Risk</span>
                <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-bold font-mono ${atRiskProjects.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {atRiskProjects.length}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block mt-0.5">Health flagged</span>
              </div>
            </div>

            {/* Overdue Tasks */}
            <Link
              href="/tasks"
              className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Overdue Tasks</span>
                <Clock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-bold font-mono ${overdueTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-neutral-400'}`}>
                  {overdueTasks.length}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block mt-0.5">Passed deadlines</span>
              </div>
            </Link>

            {/* Pending Leader Reports */}
            <Link
              href="/reports"
              className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Pending Reports</span>
                <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-bold font-mono ${pendingReports.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {pendingReports.length}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block mt-0.5">Awaiting Admin review</span>
              </div>
            </Link>

            {/* Pending Final Reviews */}
            <Link
              href="/admin/reviews"
              className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Final Reviews</span>
                <ClipboardCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-bold font-mono ${pendingFinalReviews.length > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'}`}>
                  {pendingFinalReviews.length}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block mt-0.5">Deliverable sign-off</span>
              </div>
            </Link>

            {/* Revision Requests */}
            <Link
              href="/admin/reviews"
              className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Revisions Active</span>
                <RotateCcw className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{revisionRequests.length}</span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block mt-0.5">Changes requested</span>
              </div>
            </Link>

            {/* Approved for Delivery */}
            <Link
              href="/admin/deliveries"
              className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Approved Releases</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-300">{approvedProjects.length}</span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block mt-0.5">Ready for client release</span>
              </div>
            </Link>

            {/* Delivered Projects */}
            <Link
              href="/admin/deliveries"
              className="p-4 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400">
                <span className="text-[11px] font-mono uppercase">Delivered Releases</span>
                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{deliveredProjects.length}</span>
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 block mt-0.5">Ratified client release</span>
              </div>
            </Link>
          </div>

          {/* Admin Immediate Action Callout if pending items exist */}
          {adminActionItems.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Items Requiring Administrator Action ({adminActionItems.length})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {adminActionItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.link}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/40 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase text-blue-600 dark:text-blue-400 block">
                        {item.type}
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium line-clamp-1">{item.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Filter Bar for Overview Matrix */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.08] shadow-sm">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by name, client, team..."
                value={searchProject}
                onChange={(e) => setSearchProject(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Team Filter */}
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-neutral-300 focus:outline-none"
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-neutral-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Submitted for Final Review">Submitted for Review</option>
                <option value="Changes Requested">Changes Requested</option>
                <option value="Approved for Delivery">Approved for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>

              {/* Client Filter */}
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-700 dark:text-neutral-300 focus:outline-none"
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

          {/* Project Oversight Matrix (Distinguishing Completed Tasks from Approved/Delivered Projects) */}
          <div className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200/90 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Platform Projects & Release Status</h3>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Clearly distinguishes task progress from final deliverable approvals and ratified client release delivery.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-neutral-400">{filteredProjects.length} Projects</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Project & Client</th>
                    <th className="px-6 py-4">Team Pod & Lead</th>
                    <th className="px-6 py-4">Health & Risk</th>
                    <th className="px-6 py-4">Task Completion</th>
                    <th className="px-6 py-4">Governance Stage</th>
                    <th className="px-6 py-4">Target Deadline</th>
                    <th className="px-6 py-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {filteredProjects.map((p) => {
                    const pTasks = p.tasks || [];
                    const pCompleted = pTasks.filter((t) => t.status === 'Completed' || t.status === 'Done').length;
                    const pTotal = pTasks.length || 1;
                    const completionPct = Math.round((pCompleted / pTotal) * 100);

                    const statusBadgeColors: Record<string, string> = {
                      Active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
                      'Submitted for Final Review': 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
                      'In Review': 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
                      'Changes Requested': 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
                      'Approved for Delivery': 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30 font-bold',
                      Delivered: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40 font-bold',
                    };

                    const healthColors: Record<string, string> = {
                      Green: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
                      'At Risk': 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
                      Critical: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
                    };

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group">
                        {/* Name & Client */}
                        <td className="px-6 py-4">
                          <Link href={`/projects/${p.id}`} className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                            {p.name}
                          </Link>
                          <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                            Client: <span className="text-slate-700 dark:text-neutral-300 font-medium">{p.client || 'Enterprise'}</span>
                          </span>
                        </td>

                        {/* Team & Lead */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800 dark:text-neutral-200">{p.team}</div>
                          <div className="text-[11px] text-slate-500 dark:text-neutral-400">Lead: {users.find(u => u.id === p.teamLeaderId)?.name || 'Team Lead'}</div>
                        </td>

                        {/* Health */}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${healthColors[p.health || 'Green']}`}>
                            {p.health || 'Green'}
                          </span>
                        </td>

                        {/* Task Completion Progress Bar */}
                        <td className="px-6 py-4">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between font-mono text-[10px]">
                              <span className="text-slate-500 dark:text-neutral-400">{pCompleted}/{pTotal}</span>
                              <span className="text-slate-900 dark:text-white font-semibold">{completionPct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                                style={{ width: `${completionPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Governance Stage */}
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${statusBadgeColors[p.status] || 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400'}`}>
                            {p.status}
                          </span>
                        </td>

                        {/* Target Deadline */}
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-600 dark:text-neutral-300">
                          {p.deadline || 'Ongoing'}
                        </td>

                        {/* Inspect */}
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/projects/${p.id}`}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 transition-colors"
                          >
                            Open →
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
          TEAM LEADER PERSPECTIVE DASHBOARD VIEW
         ========================================================================= */}
      {activeRole === 'Team Leader' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] shadow-sm">
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono uppercase">My Assigned Pod Projects</span>
              <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">
                {projects.filter(p => p.teamLeaderId === currentUser.id || p.teamId === currentUser.teamId).length}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] shadow-sm">
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono uppercase">Blocked Tasks in Pod</span>
              <div className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
                {blockedTasks.length}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] shadow-sm">
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono uppercase">Team Updates Filed</span>
              <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                {updates.length}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200/90 dark:border-white/[0.08] space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Team Leader Workflows</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/reports"
                className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/30 flex items-center gap-3 transition-colors group"
              >
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Submit Progress Report</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">Consolidated sprint update for Admin</div>
                </div>
              </Link>

              <Link
                href="/tasks"
                className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/30 flex items-center gap-3 transition-colors group"
              >
                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Assign & Manage Tasks</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">Distribute tasks to team members</div>
                </div>
              </Link>

              <Link
                href="/updates"
                className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/30 flex items-center gap-3 transition-colors group"
              >
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Review Employee Updates</div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400">Confirm progress and clear blockers</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EMPLOYEE WORKBENCH PERSPECTIVE VIEW
         ========================================================================= */}
      {activeRole === 'Employee' && (
        <EmployeeDashboard />
      )}

      {/* Structured Create Project Wizard Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
}
