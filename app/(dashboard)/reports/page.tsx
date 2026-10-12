'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  X,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export default function ReportsPage() {
  const { reports, projects, teams, activeRole, currentUser, refreshData, showToast } = useApp();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // New report form state
  const [reportProjectId, setReportProjectId] = useState('');
  const [reportingPeriod, setReportingPeriod] = useState('Sprint 42 (Oct 15 - Oct 30, 2026)');
  const [progressPercentage, setProgressPercentage] = useState(80);
  const [workCompleted, setWorkCompleted] = useState('');
  const [tasksRemaining, setTasksRemaining] = useState('');
  const [blockedTasks, setBlockedTasks] = useState('');
  const [risks, setRisks] = useState('');
  const [deadlineConfidence, setDeadlineConfidence] = useState<'High' | 'Medium' | 'Low'>('High');
  const [helpNeeded, setHelpNeeded] = useState('');
  const [nextPeriodPlan, setNextPeriodPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin review form state
  const [adminFeedback, setAdminFeedback] = useState('');

  // Prefill helper when project is selected
  const handleSelectProject = (projectId: string) => {
    setReportProjectId(projectId);
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      const completedTasks = (proj.tasks || []).filter((t) => t.status === 'Completed' || t.status === 'Done');
      const blocked = (proj.tasks || []).filter((t) => t.status === 'Blocked');
      const inProgress = (proj.tasks || []).filter((t) => t.status === 'In Progress');

      setWorkCompleted(
        completedTasks.length > 0
          ? `Completed ${completedTasks.length} task(s): ${completedTasks.map((t) => t.title).slice(0, 2).join('; ')}`
          : 'Progressing on core milestone execution.'
      );
      setTasksRemaining(
        inProgress.length > 0
          ? `${inProgress.length} active in-flight task(s): ${inProgress.map((t) => t.title).slice(0, 2).join('; ')}`
          : 'Backlog sprint iteration.'
      );
      setBlockedTasks(
        blocked.length > 0
          ? `${blocked.length} blocked task(s): ${blocked.map((t) => `${t.title} (${t.latestUpdate || 'unresolved'})`).join('; ')}`
          : 'None.'
      );
      const total = (proj.tasks || []).length || 1;
      setProgressPercentage(Math.round((completedTasks.length / total) * 100) || 50);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportProjectId || !reportingPeriod || !workCompleted || !nextPeriodPlan) {
      showToast('Please fill in project, period, work completed, and next-period plan', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitReport({
        projectId: reportProjectId,
        reportingPeriod,
        progressPercentage,
        workCompleted,
        tasksRemaining,
        blockedTasks,
        risks,
        deadlineConfidence,
        helpNeededFromAdmin: helpNeeded,
        nextPeriodPlan,
      });
      await refreshData();
      showToast('Team Leader progress report submitted to Admin!', 'success');
      setIsSubmitModalOpen(false);
      setReportProjectId('');
      setWorkCompleted('');
      setNextPeriodPlan('');
    } catch (err: any) {
      showToast(err.message || 'Error submitting report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewReport = async (status: 'Approved' | 'Acknowledged' | 'Clarification Requested') => {
    if (!selectedReport) return;
    try {
      await api.reviewReport({
        reportId: selectedReport.id,
        status,
        adminFeedback: adminFeedback || undefined,
      });
      await refreshData();
      showToast(`Report status updated to ${status}.`, 'success');
      setSelectedReport(null);
      setAdminFeedback('');
    } catch (err: any) {
      showToast(err.message || 'Error reviewing report', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">
              Accountability Workflow
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
            Team Leader <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">Progress Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Team leaders submit consolidated progress reports to Admin; Admin reviews supporting tasks, blockers, and provides executive guidance.
          </p>
        </div>

        {(activeRole === 'Team Leader' || activeRole === 'Admin') && (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Progress Report</span>
          </button>
        )}
      </div>

      {/* Reports Feed */}
      <div className="space-y-6">
        {reports.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <FileText className="w-10 h-10 text-slate-400 dark:text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-300">No Reports Filed Yet</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1">
              Team Leaders can click "Submit Progress Report" to file sprint or periodic execution updates.
            </p>
          </div>
        ) : (
          reports.map((report) => {
            const statusBadgeClasses: Record<string, string> = {
              Submitted: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
              Acknowledged: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
              Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
              'Clarification Requested': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
            };

            const confidenceColors: Record<string, string> = {
              High: 'text-emerald-600 dark:text-emerald-400',
              Medium: 'text-amber-600 dark:text-amber-400',
              Low: 'text-rose-600 dark:text-rose-400',
            };

            return (
              <div
                key={report.id}
                className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] hover:border-blue-400/50 dark:hover:border-white/15 rounded-2xl p-6 shadow-sm hover:shadow-md space-y-5 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">{report.projectName}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${statusBadgeClasses[report.status] || 'bg-slate-100 text-slate-600'}`}>
                        {report.status}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-neutral-400">
                        {report.reportingPeriod}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-3">
                      <span>Team: <span className="text-blue-600 dark:text-blue-400 font-semibold">{report.teamName}</span></span>
                      <span>&bull;</span>
                      <span>Leader: <span className="text-slate-800 dark:text-neutral-300 font-medium">{report.leaderName}</span></span>
                      <span>&bull;</span>
                      <span>Submitted: <span className="font-mono text-slate-500 dark:text-neutral-500">{new Date(report.createdAt).toLocaleDateString()}</span></span>
                    </div>
                  </div>

                  {/* Progress & Confidence Indicators */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-neutral-400 font-mono">Progress</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white font-mono">{report.progressPercentage}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-neutral-400 font-mono">Confidence</div>
                      <div className={`text-base font-bold font-mono ${confidenceColors[report.deadlineConfidence] || 'text-slate-900 dark:text-white'}`}>
                        {report.deadlineConfidence}
                      </div>
                    </div>

                    {activeRole === 'Admin' && report.status === 'Submitted' && (
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                    <div>
                      <span className="text-slate-500 dark:text-neutral-500 font-semibold uppercase tracking-wider text-[10px] block">
                        Work Completed in Period
                      </span>
                      <p className="text-slate-800 dark:text-neutral-200 mt-1 leading-relaxed">{report.workCompleted}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                      <span className="text-slate-500 dark:text-neutral-500 font-semibold uppercase tracking-wider text-[10px] block">
                        Tasks Remaining & Active Work
                      </span>
                      <p className="text-slate-700 dark:text-neutral-300 mt-1 leading-relaxed">{report.tasksRemaining}</p>
                    </div>
                  </div>

                  <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                    <div>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Blockers & Risks
                      </span>
                      <p className="text-slate-700 dark:text-neutral-300 mt-1 leading-relaxed">
                        {report.blockedTasks || report.risks || 'No blockers reported.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Next-Period Plan
                      </span>
                      <p className="text-slate-800 dark:text-neutral-200 mt-1 leading-relaxed">{report.nextPeriodPlan}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Feedback Box if reviewed */}
                {report.adminFeedback && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 text-xs space-y-1">
                    <div className="text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Admin Executive Guidance:</span>
                    </div>
                    <p className="text-slate-700 dark:text-neutral-300 italic">{report.adminFeedback}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Admin Review Report */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1112] border border-slate-200 dark:border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in duration-200 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Review Progress Report</h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-600 dark:text-neutral-300">
                Reviewing report for <span className="font-semibold text-slate-900 dark:text-white">{selectedReport.projectName}</span> filed by{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{selectedReport.leaderName}</span>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Executive Feedback / Guidance Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide guidance, unblock dependencies, or approve resource requests..."
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => handleReviewReport('Approved')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-sm"
                >
                  Approve Report
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewReport('Acknowledged')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm"
                >
                  Acknowledge Report
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewReport('Clarification Requested')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 dark:text-amber-300 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:border-amber-500/30 cursor-pointer"
                >
                  Request Clarification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Submit Progress Report */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1112] border border-slate-200 dark:border-white/15 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Submit Team Progress Report</h2>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Select Project *
                </label>
                <select
                  required
                  value={reportProjectId}
                  onChange={(e) => handleSelectProject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                >
                  <option value="">Select project to report on...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.team})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Reporting Period *
                  </label>
                  <input
                    type="text"
                    required
                    value={reportingPeriod}
                    onChange={(e) => setReportingPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Overall Progress (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Work Completed in Period *
                </label>
                <textarea
                  required
                  rows={2}
                  value={workCompleted}
                  onChange={(e) => setWorkCompleted(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Blockers, Risks & Help Needed from Admin
                </label>
                <textarea
                  rows={2}
                  placeholder="Escalate cross-team blockers or hardware bottlenecks..."
                  value={blockedTasks}
                  onChange={(e) => setBlockedTasks(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Deadline Confidence *
                  </label>
                  <select
                    value={deadlineConfidence}
                    onChange={(e) => setDeadlineConfidence(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                  >
                    <option value="High">High (On Schedule)</option>
                    <option value="Medium">Medium (Manageable Drift)</option>
                    <option value="Low">Low (Intervention Needed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Next-Period Plan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Milestone targets for next sprint..."
                    value={nextPeriodPlan}
                    onChange={(e) => setNextPeriodPlan(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
