import { NextRequest, NextResponse } from 'next/server';
import { getStore, saveStore, getEffectiveRole, isUserAuthorizedForProject, createAuditLog } from '@/lib/server-store';
import { requireUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const { id } = await params;
  const store = getStore();

  const project = store.projects.find((p) => p.id === id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (actor && !isUserAuthorizedForProject(actor, id)) {
    return NextResponse.json(
      { error: 'Forbidden: You are not authorized to access this project.' },
      { status: 403 }
    );
  }

  // Find linked reports, reviews, updates
  const projectReports = store.reports.filter((r) => r.projectId === id);
  const projectUpdates = store.updates.filter((u) => u.projectId === id);

  return NextResponse.json({
    ...project,
    reports: projectReports,
    updates: projectUpdates,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const { id } = await params;

  if (!isUserAuthorizedForProject(actor, id)) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to modify this project.' },
      { status: 403 }
    );
  }

  const role = getEffectiveRole(actor);

  try {
    const body = await req.json();
    const store = getStore();
    const project = store.projects.find((p) => p.id === id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Role-specific allowed updates
    if (role === 'Admin') {
      if (body.client) project.client = body.client;
      if (body.deadline) project.deadline = body.deadline;
      if (body.priority) project.priority = body.priority;
      if (body.budget) project.budget = body.budget;
      if (body.status) project.status = body.status;
      if (body.teamId && body.teamId !== project.teamId) {
        const newTeam = store.teams.find((t) => t.id === body.teamId);
        if (newTeam) {
          project.teamId = newTeam.id;
          project.team = newTeam.name;
          project.teamDescription = newTeam.description;
          createAuditLog(
            actor.id,
            actor.name,
            'PROJECT_ASSIGNED',
            `Admin ${actor.name} reassigned project "${project.name}" to team "${newTeam.name}".`,
            project.name,
            { projectId: project.id, teamId: newTeam.id }
          );
        }
      }
    }

    // Both Admin and Team Leader can update technical metadata, architecture summary, milestones
    if (role === 'Admin' || role === 'Team Leader') {
      if (body.architectureSummary) project.architectureSummary = body.architectureSummary;
      if (body.quickstartGuide) project.quickstartGuide = body.quickstartGuide;
      if (body.description) project.description = body.description;
      if (body.milestones && Array.isArray(body.milestones)) {
        project.milestones = body.milestones;
      }
      if (body.decisions && Array.isArray(body.decisions)) {
        project.decisions = body.decisions;
      }
    }

    project.updatedAt = new Date().toISOString();
    saveStore(store);

    return NextResponse.json(project);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
