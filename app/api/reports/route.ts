import { NextRequest, NextResponse } from 'next/server';
import {
  getStore,
  saveStore,
  getEffectiveRole,
  isUserAuthorizedForProject,
  createAuditLog,
  createNotification,
} from '@/lib/server-store';
import { requireUser } from '@/lib/auth';
import { TeamLeadProgressReport } from '@/lib/types';

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const store = getStore();

  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  const teamId = searchParams.get('teamId');

  let list = [...store.reports];

  if (actor) {
    const role = getEffectiveRole(actor);
    if (role === 'Team Leader') {
      list = list.filter((r) => r.leaderId === actor.id || r.teamId === actor.teamId);
    } else if (role === 'Employee') {
      // Employees see reports for their team only
      const team = store.teams.find((t) => t.id === actor.teamId);
      if (team) {
        list = list.filter((r) => r.teamId === team.id);
      } else {
        list = [];
      }
    }
  }

  if (projectId) {
    list = list.filter((r) => r.projectId === projectId);
  }
  if (teamId) {
    list = list.filter((r) => r.teamId === teamId);
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const role = getEffectiveRole(actor);
  if (role === 'Employee') {
    return NextResponse.json(
      { error: 'Forbidden: Only a Team Leader or Admin can submit progress reports.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      projectId,
      reportingPeriod,
      progressPercentage,
      milestonesCompleted = [],
      workCompleted,
      tasksRemaining,
      blockedTasks = '',
      risks = '',
      deadlineConfidence = 'High',
      helpNeededFromAdmin = '',
      nextPeriodPlan,
      evidenceUrls = [],
    } = body;

    if (!projectId || !reportingPeriod || !workCompleted || !nextPeriodPlan) {
      return NextResponse.json(
        { error: 'Project ID, reporting period, completed work, and next-period plan are required.' },
        { status: 400 }
      );
    }

    const store = getStore();
    const project = store.projects.find((p) => p.id === projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    if (!isUserAuthorizedForProject(actor, projectId)) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to submit reports for this project.' },
        { status: 403 }
      );
    }

    const team = store.teams.find((t) => t.id === project.teamId) || {
      id: 'team-general',
      name: project.team,
    };

    const id = `rep-${project.id}-${Date.now().toString(36)}`;

    const newReport: TeamLeadProgressReport = {
      id,
      projectId: project.id,
      projectName: project.name,
      teamId: team.id,
      teamName: team.name,
      leaderId: actor.id,
      leaderName: actor.name,
      reportingPeriod,
      progressPercentage: Number(progressPercentage) || 0,
      milestonesCompleted: Array.isArray(milestonesCompleted) ? milestonesCompleted : [milestonesCompleted],
      workCompleted,
      tasksRemaining: tasksRemaining || 'Standard backlog iteration',
      blockedTasks,
      risks,
      deadlineConfidence: deadlineConfidence as 'High' | 'Medium' | 'Low',
      helpNeededFromAdmin,
      nextPeriodPlan,
      evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
      status: 'Submitted',
      createdAt: new Date().toISOString(),
    };

    store.reports.unshift(newReport);

    // Notify all Admins
    store.users
      .filter((u) => u.isAdmin || u.systemRole === 'Admin')
      .forEach((adminUser) => {
        createNotification(
          'New Team Leader Progress Report',
          `${actor.name} submitted progress report for ${project.name} (${reportingPeriod}).`,
          'report',
          adminUser.id,
          `/reports`
        );
      });

    createAuditLog(
      actor.id,
      actor.name,
      'REPORT_SUBMITTED',
      `Team Leader ${actor.name} submitted progress report for ${project.name} (${reportingPeriod}, ${progressPercentage}% complete).`,
      project.name,
      { reportId: id, projectId: project.id, progressPercentage }
    );

    saveStore(store);
    return NextResponse.json(newReport, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  if (!actor || getEffectiveRole(actor) !== 'Admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin can review and ratify team leader reports.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { reportId, status, adminFeedback } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Report ID and review status are required.' }, { status: 400 });
    }

    const store = getStore();
    const report = store.reports.find((r) => r.id === reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    report.status = status;
    if (adminFeedback !== undefined) {
      report.adminFeedback = adminFeedback;
    }
    report.adminId = actor.id;
    report.reviewedAt = new Date().toISOString();

    // Notify the Team Leader
    createNotification(
      'Progress Report Reviewed by Admin',
      `Admin ${actor.name} marked your ${report.projectName} report as ${status}.`,
      'report',
      report.leaderId,
      `/reports`
    );

    createAuditLog(
      actor.id,
      actor.name,
      'REPORT_REVIEWED',
      `Admin ${actor.name} reviewed progress report for ${report.projectName} (${status}).`,
      report.projectName,
      { reportId: report.id, status }
    );

    saveStore(store);
    return NextResponse.json(report);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
