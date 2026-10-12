'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import {
  Activity,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  X,
  ExternalLink,
  Shield,
  Layers,
  FileText,
} from 'lucide-react';

export default function UpdatesPage() {
  const { updates, projects, activeRole, currentUser, refreshData, showToast } = useApp();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);

  // Submit form state
  const [updateProjectId, setUpdateProjectId] = useState('');
  const [updateTaskId, setUpdateTaskId] = useState('');
  const [completedWork, setCompletedWork] = useState('');
  const [inProgress, setInProgress] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [blockers, setBlockers] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review state
  const [leaderComment, setLeaderComment] = useState('');

  const selectedProject = projects.find((p) => p.id === updateProjectId);
  const availableTasks = (selectedProject?.tasks || []).filter(
    (t) =>
      activeRole !== 'Employee' ||
      t.assigneeId === currentUser.id ||
      t.assignee.toLowerCase() === currentUser.name.toLowerCase()
  );

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateProjectId || !completedWork || !inProgress || !nextSteps) {
      showToast('Project, completed work, work in progress, and next steps are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitUpdate({
        projectId: updateProjectId,
        taskId: updateTaskId || undefined,
        completedWork,
        inProgress,
        nextSteps,
        blockers: blockers || undefined,
        dependencies: dependencies || undefined,
        evidenceUrls: evidenceUrl ? [evidenceUrl] : undefined,
      });
      await refreshData();
      showToast('Daily progress update submitted to Team Leader!', 'success');
      setIsSubmitModalOpen(false);
      setCompletedWork('');
      setInProgress('');
      setNextSteps('');
      setBlockers('');
      setDependencies('');
      setEvidenceUrl('');
    } catch (err: any) {
      showToast(err.message || 'Error submitting update', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewUpdate = async (status: 'Reviewed' | 'Clarification Requested') => {
    if (!selectedUpdate) return;
    try {
      await api.reviewUpdate({
        updateId: selectedUpdate.id,
        status,
        leaderComment: leaderComment || undefined,
      });
      await refreshData();
      showToast(`Update marked as ${status}.`, 'success');
      setSelectedUpdate(null);
      setLeaderComment('');
    } catch (err: any) {
      showToast(err.message || 'Error reviewing update', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">
              Daily Accountability
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
            Employee <span className="font-serif italic text-blue-600 dark:text-blue-400 font-normal">Work Updates</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Employees log completed work, in-flight execution, and blockers; Team Leaders review and confirm deliverables.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Daily Update</span>
        </button>
      </div>

      {/* Updates Stream */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0B0D0E]/60 border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <Activity className="w-10 h-10 text-slate-400 dark:text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-300">No Recorded Updates</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-500 mt-1">
              Click "Post Daily Update" to record your completed tasks, blockers, and next steps.
            </p>
          </div>
        ) : (
          updates.map((update) => {
            const isStale =
              new Date().getTime() - new Date(update.createdAt).getTime() > 24 * 3600 * 1000;

            const isLeaderOrAdmin = activeRole === 'Team Leader' || activeRole === 'Admin';

            return (
              <div
                key={update.id}
                className="bg-white dark:bg-[#0B0D0E]/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.08] hover:border-blue-400/50 dark:hover:border-white/15 rounded-2xl p-6 shadow-sm hover:shadow-md space-y-4 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={update.employeeName} size="sm" showIndicator />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{update.employeeName}</span>
                        {update.taskTitle && (
                          <span className="text-slate-500 dark:text-neutral-400 font-normal">
                            on <span className="text-blue-600 dark:text-blue-400 font-mono font-medium">{update.taskTitle}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                        <span>{update.projectName}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-slate-500 dark:text-neutral-500">{new Date(update.createdAt).toLocaleString()}</span>
                        {isStale && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-500/10 text-slate-600 dark:text-neutral-400 text-[10px] font-mono">
                            Logged &gt;24h ago
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${
                        update.status === 'Reviewed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                          : update.status === 'Clarification Requested'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                          : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30'
                      }`}
                    >
                      {update.status}
                    </span>

                    {isLeaderOrAdmin && update.status === 'Submitted' && (
                      <button
                        onClick={() => setSelectedUpdate(update)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider text-[10px] block">
                      Completed Work
                    </span>
                    <p className="text-slate-800 dark:text-neutral-200 leading-relaxed">{update.completedWork}</p>
                  </div>

                  <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                    <span className="text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wider text-[10px] block">
                      In Progress & Next Steps
                    </span>
                    <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
                      <span className="font-semibold text-slate-900 dark:text-white">{update.inProgress}</span>
                      <br />
                      <span className="text-slate-500 dark:text-neutral-400 mt-1 block">Next: {update.nextSteps}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                    <span className="text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider text-[10px] block">
                      Blockers & Dependencies
                    </span>
                    <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
                      {update.blockers || update.dependencies ? (
                        <>
                          {update.blockers && <span className="text-rose-600 dark:text-rose-400 font-medium">{update.blockers}</span>}
                          {update.dependencies && (
                            <span className="text-slate-500 dark:text-neutral-400 block mt-1">Dep: {update.dependencies}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 dark:text-neutral-500 italic">No blockers identified</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Leader Feedback Box if reviewed */}
                {update.leaderComment && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 text-xs space-y-1">
                    <div className="text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Team Leader Review Note:</span>
                    </div>
                    <p className="text-slate-700 dark:text-neutral-300 italic">{update.leaderComment}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Post Daily Update */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1112] border border-slate-200 dark:border-white/15 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in duration-200 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Log Work & Progress Update</h2>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Select Project *
                </label>
                <select
                  required
                  value={updateProjectId}
                  onChange={(e) => setUpdateProjectId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Associated Task (Optional)
                  </label>
                  <select
                    value={updateTaskId}
                    onChange={(e) => setUpdateTaskId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                  >
                    <option value="">General Project Contribution</option>
                    {availableTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}: {t.title} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Completed Work Today *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="What code, tests, or docs did you finish today?"
                  value={completedWork}
                  onChange={(e) => setCompletedWork(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Work in Progress *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Current active execution..."
                    value={inProgress}
                    onChange={(e) => setInProgress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Next Planned Steps *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tomorrow's milestones..."
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Blockers or Help Needed
                </label>
                <input
                  type="text"
                  placeholder="Any technical or infrastructure roadblocks?"
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
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
                  {isSubmitting ? 'Submitting...' : 'Submit Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review Update */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0E1112] border border-slate-200 dark:border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in duration-200 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Review Employee Update</h2>
              <button onClick={() => setSelectedUpdate(null)} className="text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-neutral-300 space-y-2">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedUpdate.employeeName}</span> on{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{selectedUpdate.projectName}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-neutral-300">
                {selectedUpdate.completedWork}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Team Leader Feedback Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Feedback, confirmation, or clarification question..."
                  value={leaderComment}
                  onChange={(e) => setLeaderComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#050606] border border-slate-200 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => handleReviewUpdate('Clarification Requested')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 dark:text-amber-300 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:border-amber-500/30 cursor-pointer"
                >
                  Request Clarification
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewUpdate('Reviewed')}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-sm"
                >
                  Confirm & Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
