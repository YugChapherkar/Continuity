'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import {
  ClipboardCheck,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  Clock,
  Layers,
  ExternalLink,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AdminReviewsPage() {
  const { reviews, projects, activeRole, refreshData, showToast } = useApp();

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  // Revision Form State
  const [revisionComments, setRevisionComments] = useState('');
  const [revisionItems, setRevisionItems] = useState<
    { description: string; priority: 'P0' | 'P1' | 'P2'; deadline: string }[]
  >([{ description: '', priority: 'P0', deadline: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Approval Form State
  const [approvalComments, setApprovalComments] = useState('');

  if (activeRole !== 'Admin') {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Access Restricted</h1>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Final deliverable reviews and client delivery approval gates require Administrator authority. Please switch perspective to Admin Alexander Ward to review deliverables.
        </p>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!selectedSubmission) return;
    setIsSubmitting(true);
    try {
      await api.reviewDeliverable({
        submissionId: selectedSubmission.id,
        decision: 'Approved',
        comments: approvalComments || 'Deliverable approved for formal client release delivery.',
      });
      await refreshData();
      showToast('Project deliverable approved for client delivery!', 'success');
      setIsApproveModalOpen(false);
      setSelectedSubmission(null);
    } catch (err: any) {
      showToast(err.message || 'Error approving deliverable', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const validItems = revisionItems.filter((i) => i.description.trim().length > 0);
    if (validItems.length === 0) {
      showToast('Please specify at least one revision item', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.reviewDeliverable({
        submissionId: selectedSubmission.id,
        decision: 'Changes Requested',
        comments: revisionComments,
        revisionItems: validItems,
      });
      await refreshData();
      showToast('Revisions requested. Linked revision tasks assigned to team.', 'info');
      setIsRevisionModalOpen(false);
      setRevisionComments('');
      setRevisionItems([{ description: '', priority: 'P0', deadline: '' }]);
      setSelectedSubmission(null);
    } catch (err: any) {
      showToast(err.message || 'Error requesting revisions', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRevisionItem = () => {
    setRevisionItems([...revisionItems, { description: '', priority: 'P1', deadline: '' }]);
  };

  const removeRevisionItem = (index: number) => {
    setRevisionItems(revisionItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F2]">Final Reviews & Approvals</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/25">
              Admin Gate
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Review final project release submissions, inspect test evidence, request specific remediation tasks, or approve for client delivery.
          </p>
        </div>
      </div>

      {/* Review Submissions List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0B0D0E]/60 border border-white/[0.08]">
            <ClipboardCheck className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-300">No Review Submissions Active</h3>
            <p className="text-xs text-neutral-500 mt-1">
              When Team Leaders submit finished project deliverables, they will appear here for governance review.
            </p>
          </div>
        ) : (
          reviews.map((submission) => {
            const project = projects.find((p) => p.id === submission.projectId);
            const currentRound = submission.rounds[submission.rounds.length - 1];

            const statusColors: Record<string, string> = {
              'Submitted for Final Review': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
              'In Review': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
              'Changes Requested': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
              'Approved for Delivery': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
              Delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
            };

            const isPendingAdminAction =
              submission.status === 'Submitted for Final Review' || submission.status === 'In Review';

            return (
              <div
                key={submission.id}
                className="bg-[#0B0D0E]/60 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-6 hover:border-white/15 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-white">{submission.projectName}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${statusColors[submission.status] || 'bg-white/5 text-neutral-400'}`}>
                        {submission.status}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-white/5">
                        Round {submission.currentRound}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-1 flex items-center gap-3">
                      <span>Client: <span className="text-white font-medium">{project?.client || 'Enterprise Partner'}</span></span>
                      <span>·</span>
                      <span>Target Version: <span className="font-mono text-blue-400 font-semibold">{currentRound?.releaseVersion}</span></span>
                      <span>·</span>
                      <span>Submitted by: <span className="text-neutral-300">{currentRound?.submittedByName}</span></span>
                    </div>
                  </div>

                  {/* Admin Review Action Buttons */}
                  {isPendingAdminAction && (
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setIsRevisionModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Changes</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setIsApproveModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Deliverable</span>
                      </button>
                    </div>
                  )}

                  {submission.status === 'Approved for Delivery' && (
                    <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Ready for Client Delivery</span>
                    </div>
                  )}
                </div>

                {/* Latest Submission Dossier Details */}
                {currentRound && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Completion Summary</span>
                      </div>
                      <p className="text-neutral-300 leading-relaxed">{currentRound.completionSummary}</p>

                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <span className="text-neutral-400 font-semibold">Deployment & Setup Instructions:</span>
                        <div className="p-2.5 bg-[#050606] rounded-lg font-mono text-[11px] text-neutral-300">
                          {currentRound.setupInstructions}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Validation & Test Evidence</span>
                      </div>
                      <p className="text-neutral-300 leading-relaxed">{currentRound.testEvidence}</p>

                      <div className="pt-2 border-t border-white/5 space-y-2">
                        {currentRound.knownLimitations && (
                          <div>
                            <span className="text-amber-400 font-semibold">Known Limitations:</span>
                            <p className="text-neutral-400 mt-0.5">{currentRound.knownLimitations}</p>
                          </div>
                        )}
                        {currentRound.outstandingIssues && (
                          <div>
                            <span className="text-rose-400 font-semibold">Outstanding Issues:</span>
                            <p className="text-neutral-400 mt-0.5">{currentRound.outstandingIssues}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Rounds History Accordion / Timeline */}
                <div className="pt-4 border-t border-white/[0.06] space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Review Round History ({submission.rounds.length} Round{submission.rounds.length > 1 ? 's' : ''})
                  </div>

                  <div className="space-y-2.5">
                    {submission.rounds.map((round) => (
                      <div
                        key={round.roundNumber}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-bold text-white">Round {round.roundNumber}</span>
                            <span className="text-blue-400">({round.releaseVersion})</span>
                            <span className="text-neutral-500">·</span>
                            <span className="text-neutral-400">{new Date(round.submittedAt).toLocaleString()}</span>
                          </div>
                          {round.comments && (
                            <p className="text-neutral-400 italic">
                              Reviewer Note: "{round.comments}"
                            </p>
                          )}
                          {round.revisionItems && round.revisionItems.length > 0 && (
                            <div className="pt-1 space-y-1">
                              <span className="text-amber-400 font-semibold">Requested Revisions:</span>
                              <ul className="list-disc list-inside text-neutral-300 space-y-0.5">
                                {round.revisionItems.map((item) => (
                                  <li key={item.id}>
                                    <span className="font-mono text-amber-300 font-bold">[{item.priority}]</span> {item.description}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 font-mono text-[11px]">
                          {round.decision === 'Approved' ? (
                            <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              Approved by {round.reviewerName}
                            </span>
                          ) : round.decision === 'Changes Requested' ? (
                            <span className="text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                              Changes Requested
                            </span>
                          ) : (
                            <span className="text-purple-300 font-semibold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                              Awaiting Admin Review
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Request Revisions */}
      {isRevisionModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1112] border border-white/15 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Request Deliverable Changes</h2>
              </div>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestChanges} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Overall Reviewer Guidance & Comments *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why changes are needed and high-level architectural requirements..."
                  value={revisionComments}
                  onChange={(e) => setRevisionComments(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-300">
                    Trackable Revision Items (Converted into Tasks for Team) *
                  </label>
                  <button
                    type="button"
                    onClick={addRevisionItem}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {revisionItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        required
                        placeholder={`Revision item #${index + 1}...`}
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...revisionItems];
                          updated[index].description = e.target.value;
                          setRevisionItems(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-[#050606] border border-white/10 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                      />

                      <select
                        value={item.priority}
                        onChange={(e) => {
                          const updated = [...revisionItems];
                          updated[index].priority = e.target.value as any;
                          setRevisionItems(updated);
                        }}
                        className="px-2 py-1.5 bg-[#050606] border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                      >
                        <option value="P0">P0 (Blocker)</option>
                        <option value="P1">P1 (High)</option>
                        <option value="P2">P2 (Med)</option>
                      </select>

                      {revisionItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRevisionItem(index)}
                          className="text-neutral-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300">
                Submitting this form changes the project state to "Changes Requested", notifies the Team Leader, and automatically creates linked revision tasks for the engineering pod.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Return for Revisions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Approve Deliverable */}
      {isApproveModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1112] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Approve Deliverable Release</h2>
              </div>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-neutral-300">
                Are you sure you want to approve deliverable version{' '}
                <span className="font-mono font-bold text-white">
                  {selectedSubmission.rounds[selectedSubmission.rounds.length - 1]?.releaseVersion}
                </span>{' '}
                for <span className="font-semibold text-white">{selectedSubmission.projectName}</span>?
              </p>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Optional Approval Signoff Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Official approval verification ratified..."
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050606] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300">
                Approval ratifies the release and unblocks the separate "Record Client Delivery" action.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Approving...' : 'Confirm Deliverable Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
