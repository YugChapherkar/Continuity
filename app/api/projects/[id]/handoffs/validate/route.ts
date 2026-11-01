import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/server-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const body = await req.json();

    const {
      executiveSummary = '',
      completedItems = [],
      nextSteps = [],
      criticalBlockers = [],
      runbookCommands = [],
      note = '',
    } = body;

    const summary = (executiveSummary || note || '').trim();
    const completed = Array.isArray(completedItems) ? completedItems : [];
    const steps = Array.isArray(nextSteps) ? nextSteps : [];
    const runbooks = Array.isArray(runbookCommands) ? runbookCommands : [];

    let score = 0;
    const warnings: string[] = [];
    const satisfiedChecks: string[] = [];

    // 1. Executive summary present & >50 chars (+30%, >=20 chars: +15%)
    if (summary.length > 50) {
      score += 30;
      satisfiedChecks.push(`Executive briefing depth verified (${summary.length} chars > 50 chars).`);
    } else if (summary.length >= 20) {
      score += 15;
      warnings.push('Executive summary is under 50 characters; detailed operational context recommended.');
    } else {
      warnings.push('Executive summary is under 20 characters; insufficient handover context.');
    }

    // 2. At least 1 verified completion item (+25%)
    if (completed.length > 0 && completed.some((c: string) => c.trim().length > 0)) {
      score += 25;
      satisfiedChecks.push(`Completed milestones verified (${completed.length} items).`);
    } else {
      warnings.push('Completed milestones or verified tests are missing.');
    }

    // 3. Non-empty runbook commands (+25%)
    if (runbooks.length > 0 && runbooks.some((c: string) => c.trim().length > 0)) {
      score += 25;
      satisfiedChecks.push(`Runbook commands verified (${runbooks.length} commands).`);
    } else {
      warnings.push('Runbook verification commands are missing. Recipient lacks immediate diagnostic tools.');
    }

    // 4. Project-level tasks compliance & next steps (+20%)
    const store = getStore();
    const project = store.projects.find((p) => p.id === projectId);
    const projectTasks = project?.tasks || [];

    const unresolvedP0 = projectTasks.filter(
      (t) =>
        (t.priority === 'P0' || t.status === 'In Progress') &&
        t.status !== 'Done'
    ).length;

    const unassigned = projectTasks.filter(
      (t) => !t.assigneeId || t.assigneeId === 'Unassigned'
    ).length;

    if (unresolvedP0 > 0) {
      warnings.push(`${unresolvedP0} critical P0 task(s) currently unresolved in project workspace.`);
    } else {
      satisfiedChecks.push('All P0 critical tasks in project workspace resolved or verified.');
    }

    if (unassigned > 0) {
      warnings.push(`${unassigned} task(s) in workspace are currently unassigned.`);
    }

    if (steps.length > 0 && steps.some((s: string) => s.trim().length > 0)) {
      score += 20;
      satisfiedChecks.push(`Immediate next steps defined (${steps.length} steps).`);
    } else {
      warnings.push('Immediate next steps are missing. Shift continuity may stall.');
    }

    const ready = score >= 75 && unresolvedP0 === 0;

    return NextResponse.json({
      score: Math.min(100, score),
      ready,
      warnings,
      satisfiedChecks,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
