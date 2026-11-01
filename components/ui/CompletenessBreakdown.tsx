'use client';

import React, { useState } from 'react';
import {
  FileText,
  ListTodo,
  CheckCircle2,
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export interface CompletenessData {
  executiveSummary?: string;
  completedItems?: string[];
  nextSteps?: string[];
  runbookCommands?: string[];
  criticalBlockers?: string[];
  scoreOverride?: number;
}

export interface DimensionItem {
  id: string;
  title: string;
  weight: number;
  score: number;
  icon: React.ElementType;
  description: string;
  satisfiedText: string;
  missingText: string;
  isSatisfied: boolean;
  status: 'full' | 'partial' | 'missing';
}

export function calculateDimensions(data: CompletenessData): {
  score: number;
  dimensions: DimensionItem[];
} {
  const summary = (data.executiveSummary || '').trim();
  const completed = (data.completedItems || []).filter((i) => i.trim().length > 0);
  const nextSteps = (data.nextSteps || []).filter((i) => i.trim().length > 0);
  const runbooks = (data.runbookCommands || []).filter((i) => i.trim().length > 0);

  // 1. Documentation Depth (30%): >50 chars = 30%, >=20 chars = 15%
  let docScore = 0;
  let docStatus: 'full' | 'partial' | 'missing' = 'missing';
  if (summary.length > 50) {
    docScore = 30;
    docStatus = 'full';
  } else if (summary.length >= 20) {
    docScore = 15;
    docStatus = 'partial';
  }

  // 2. Task Linkages & Next Steps (20%): >=1 next step = 20%
  let taskScore = 0;
  let taskStatus: 'full' | 'partial' | 'missing' = 'missing';
  if (nextSteps.length > 0) {
    taskScore = 20;
    taskStatus = 'full';
  }

  // 3. Verified Deliverables & Blockers Flagged (25%): >=1 verified milestone item = 25%
  let deliverableScore = 0;
  let deliverableStatus: 'full' | 'partial' | 'missing' = 'missing';
  if (completed.length > 0) {
    deliverableScore = 25;
    deliverableStatus = 'full';
  }

  // 4. Runbook Operational Commands (25%): non-empty = 25%
  let runbookScore = 0;
  let runbookStatus: 'full' | 'partial' | 'missing' = 'missing';
  if (runbooks.length > 0) {
    runbookScore = 25;
    runbookStatus = 'full';
  }

  const computedTotal = docScore + taskScore + deliverableScore + runbookScore;
  const score = data.scoreOverride !== undefined ? data.scoreOverride : Math.min(100, computedTotal);

  const dimensions: DimensionItem[] = [
    {
      id: 'documentation',
      title: 'Documentation Depth',
      weight: 30,
      score: docScore,
      icon: FileText,
      description: 'Executive briefing depth and context clarity (>50 characters required for full score).',
      satisfiedText: `Verified (${summary.length} characters provided).`,
      missingText:
        summary.length === 0
          ? 'Add executive summary (>50 chars) for +30%'
          : `Current: ${summary.length}/50 chars (need ${51 - summary.length} more chars for full +30%)`,
      isSatisfied: docStatus === 'full',
      status: docStatus,
    },
    {
      id: 'task_linkages',
      title: 'Task Linkages & Next Steps',
      weight: 20,
      score: taskScore,
      icon: ListTodo,
      description: 'Actionable next steps and milestone commitments for incoming custodian.',
      satisfiedText: `${nextSteps.length} next priority item(s) bound to shift continuity.`,
      missingText: 'Specify at least 1 immediate priority step (+20%)',
      isSatisfied: taskStatus === 'full',
      status: taskStatus,
    },
    {
      id: 'deliverables',
      title: 'Verified Deliverables & Blockers',
      weight: 25,
      score: deliverableScore,
      icon: CheckCircle2,
      description: 'Completed milestones, verified staging builds, and audited blocker logs.',
      satisfiedText: `${completed.length} milestone(s) audited and verified losslessly.`,
      missingText: 'Record at least 1 completed milestone or verified deliverable (+25%)',
      isSatisfied: deliverableStatus === 'full',
      status: deliverableStatus,
    },
    {
      id: 'runbook_steps',
      title: 'Runbook Operational Commands',
      weight: 25,
      score: runbookScore,
      icon: Terminal,
      description: 'Executable CLI commands to verify cluster health and active invariants.',
      satisfiedText: `${runbooks.length} terminal diagnostic command(s) provided.`,
      missingText: 'Add executable verification command (e.g. ./bin/ctl status) (+25%)',
      isSatisfied: runbookStatus === 'full',
      status: runbookStatus,
    },
  ];

  return { score, dimensions };
}

interface CompletenessBreakdownProps {
  data: CompletenessData;
  interactive?: boolean;
  compact?: boolean;
  title?: string;
}

export function CompletenessBreakdown({
  data,
  interactive = true,
  compact = false,
  title = 'Completeness & Losslessness Score',
}: CompletenessBreakdownProps) {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const { score, dimensions } = calculateDimensions(data);

  const toggleDim = (id: string) => {
    if (!interactive) return;
    setExpandedDim((prev) => (prev === id ? null : id));
  };

  const getScoreBadgeClass = (s: number) => {
    if (s >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (s >= 70) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const getBarColorClass = (s: number) => {
    if (s >= 90) return 'bg-emerald-600';
    if (s >= 70) return 'bg-blue-600';
    return 'bg-amber-500';
  };

  if (compact) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Completeness Score</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-mono text-xs font-bold border ${getScoreBadgeClass(score)}`}>
            {score}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getBarColorClass(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
          {dimensions.map((dim) => (
            <div key={dim.id} className="flex items-center justify-between text-slate-600">
              <span className="truncate">{dim.title}:</span>
              <span className={`font-mono font-medium ${dim.isSatisfied ? 'text-emerald-600' : 'text-amber-600'}`}>
                {dim.score}/{dim.weight}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header with overall score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated across the 4 weighted operational continuity dimensions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-mono text-xl font-extrabold text-slate-900">{score}%</div>
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              {score >= 90 ? 'Lossless Verified' : score >= 70 ? 'Readiness Attested' : 'Action Required'}
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getScoreBadgeClass(score)}`}>
            {score >= 75 ? 'Pass' : 'Review'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getBarColorClass(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>0% Incomplete</span>
          <span>75% Readiness Threshold</span>
          <span>100% Lossless</span>
        </div>
      </div>

      {/* 4 Dimension Interactive Cards */}
      <div className="space-y-2 pt-1">
        {dimensions.map((dim) => {
          const Icon = dim.icon;
          const isExpanded = expandedDim === dim.id;

          return (
            <div
              key={dim.id}
              onClick={() => toggleDim(dim.id)}
              className={`border rounded-xl transition-all ${
                interactive ? 'cursor-pointer hover:border-slate-300' : ''
              } ${
                dim.isSatisfied
                  ? 'bg-slate-50/70 border-slate-200'
                  : 'bg-amber-50/30 border-amber-200/80'
              }`}
            >
              <div className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      dim.isSatisfied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {dim.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({dim.weight}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {dim.isSatisfied ? dim.satisfiedText : dim.missingText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${
                      dim.isSatisfied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {dim.score}/{dim.weight}%
                  </span>
                  {interactive && (
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-200/60 text-xs space-y-1.5 text-slate-600">
                  <p className="leading-relaxed">{dim.description}</p>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    <span className="font-semibold text-slate-700">Status:</span>
                    <span
                      className={dim.isSatisfied ? 'text-emerald-700' : 'text-amber-700'}
                    >
                      {dim.isSatisfied ? '✓ Satisfied' : '⚠️ Action Recommended'}
                    </span>
                    <span>&bull;</span>
                    <span>{dim.isSatisfied ? dim.satisfiedText : dim.missingText}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

