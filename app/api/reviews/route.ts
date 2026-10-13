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
import {
  ProjectReviewSubmission,
  ReviewRound,
  RevisionItem,
  Task,
} from '@/lib/types';

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const store = getStore();

  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');
  const status = searchParams.get('status');

  let list = [...store.reviews];

  if (actor) {
    const role = getEffectiveRole(actor);
    if (role === 'Team Leader') {
      list = list.filter((rev) => isUserAuthorizedForProject(actor, rev.projectId));
    } else if (role === 'Employee') {
      list = list.filter((rev) => isUserAuthorizedForProject(actor, rev.projectId));
    }
  }

  if (projectId) {
    list = list.filter((rev) => rev.projectId === projectId);
  }
  if (status) {
    list = list.filter((rev) => rev.status === status);
  }

  return NextResponse.json(list);
}

// POST: Team Leader submits project for final review
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const role = getEffectiveRole(actor);
  if (role === 'Employee') {
    return NextResponse.json(
      { error: 'Forbidden: Only a Team Leader or Admin can submit projects for final review.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      projectId,
      releaseVersion,
      completionSummary,
      setupInstructions,
      knownLimitations = '',
      testEvidence,
      outstandingIssues = '',
    } = body;

    // Backend validation of required delivery submission fields
    if (!projectId || !releaseVersion || !completionSummary || !setupInstructions || !testEvidence) {
      return NextResponse.json(
        {
          error:
            'Missing required final delivery fields. Release version, completion summary, setup instructions, and test evidence are mandatory.',
        },
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
        { error: 'Forbidden: You are not authorized to submit final reviews for this project.' },
        { status: 403 }
      );
    }

    // Find or create ProjectReviewSubmission
    let submission = store.reviews.find((r) => r.projectId === projectId);
    const roundNumber = submission ? submission.rounds.length + 1 : 1;

    const newRound: ReviewRound = {
      roundNumber,
      submittedAt: new Date().toISOString(),
      submittedBy: actor.id,
      submittedByName: actor.name,
      releaseVersion,
      completionSummary,
      setupInstructions,
      knownLimitations,
      testEvidence,
      outstandingIssues,
      revisionItems: [],
    };

    if (!submission) {
      submission = {
        id: `rev-sub-${project.id}`,
        projectId: project.id,
        projectName: project.name,
        status: 'Submitted for Final Review',
        currentRound: roundNumber,
        rounds: [newRound],
        updatedAt: new Date().toISOString(),
      };
      store.reviews.unshift(submission);
    } else {
      submission.currentRound = roundNumber;
      submission.rounds.push(newRound);
      submission.status = 'Submitted for Final Review';
      submission.updatedAt = new Date().toISOString();
    }

    // Update project state
    project.status = 'Submitted for Final Review';
    project.reviewSubmission = submission;
    project.currentVersionId = releaseVersion;
    project.updatedAt = new Date().toISOString();

    // Notify Admins of incoming final review
    store.users
      .filter((u) => u.isAdmin || u.systemRole === 'Admin')
      .forEach((adminUser) => {
        createNotification(
          'Project Submitted for Final Review',
          `${actor.name} submitted ${project.name} (${releaseVersion}) for final deliverable review.`,
          'review',
          adminUser.id,
          `/admin/reviews`
        );
      });

    createAuditLog(
      actor.id,
      actor.name,
      'FINAL_REVIEW_SUBMITTED',
      `Team Leader ${actor.name} submitted project "${project.name}" (Round ${roundNumber}, Release ${releaseVersion}) for final client delivery review.`,
      project.name,
      { projectId: project.id, roundNumber, releaseVersion }
    );

    saveStore(store);
    return NextResponse.json(submission, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}

// PATCH: Admin reviews deliverable: approves or requests revisions
export async function PATCH(req: NextRequest) {
  const auth = await requireUser(req);
  if (auth.error) return auth.error;
  const actor = auth.user;

  if (!actor || getEffectiveRole(actor) !== 'Admin') {
    return NextResponse.json(
      { error: 'Forbidden: Only an authorized Admin can review, approve, or request revisions on final project deliverables.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { submissionId, decision, comments = '', revisionItems = [] } = body;

    if (!submissionId || !decision) {
      return NextResponse.json(
        { error: 'Submission ID and decision ("Approved" or "Changes Requested") are required.' },
        { status: 400 }
      );
    }

    const store = getStore();
    const submission = store.reviews.find((r) => r.id === submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Review submission record not found.' }, { status: 404 });
    }

    const project = store.projects.find((p) => p.id === submission.projectId);
    if (!project) {
      return NextResponse.json({ error: 'Associated project not found.' }, { status: 404 });
    }

    const currentRound = submission.rounds[submission.rounds.length - 1];
    if (!currentRound) {
      return NextResponse.json({ error: 'No active review round exists.' }, { status: 400 });
    }

    currentRound.reviewerId = actor.id;
    currentRound.reviewerName = actor.name;
    currentRound.reviewedAt = new Date().toISOString();
    currentRound.decision = decision;
    currentRound.comments = comments;

    if (decision === 'Approved') {
      submission.status = 'Approved for Delivery';
      project.status = 'Approved for Delivery';
      project.health = 'Green';
      project.healthReasons = [
        `Deliverable ${currentRound.releaseVersion} approved by Admin ${actor.name}`,
        'Ready for formal client delivery recording',
      ];

      // Notify Team Leader of approval
      if (project.teamLeaderId) {
        createNotification(
          'Deliverable Approved by Admin',
          `Admin ${actor.name} approved ${project.name} (${currentRound.releaseVersion}) for client delivery!`,
          'delivery',
          project.teamLeaderId,
          `/projects/${project.id}`
        );
      }

      createAuditLog(
        actor.id,
        actor.name,
        'DELIVERY_APPROVED',
        `Admin ${actor.name} approved deliverable version ${currentRound.releaseVersion} for project "${project.name}". Ready for client release delivery.`,
        project.name,
        { projectId: project.id, releaseVersion: currentRound.releaseVersion, roundNumber: currentRound.roundNumber }
      );
    } else if (decision === 'Changes Requested') {
      if (!Array.isArray(revisionItems) || revisionItems.length === 0) {
        return NextResponse.json(
          { error: 'At least one specific revision item is required when requesting changes.' },
          { status: 400 }
        );
      }

      const formattedRevisionItems: RevisionItem[] = revisionItems.map((item: any, idx: number) => ({
        id: `rev-item-${Date.now().toString(36)}-${idx}`,
        description: typeof item === 'string' ? item : item.description || '',
        priority: (item.priority || 'P0') as 'P0' | 'P1' | 'P2',
        deadline: item.deadline,
        completed: false,
      }));

      currentRound.revisionItems = formattedRevisionItems;
      submission.status = 'Changes Requested';
      project.status = 'Changes Requested';
      project.health = 'At Risk';
      project.healthReasons = [
        `Admin requested ${formattedRevisionItems.length} revision item(s) on Round ${currentRound.roundNumber}`,
      ];

      // Automatically convert revision items into actionable tasks for the team
      if (!project.tasks) project.tasks = [];
      formattedRevisionItems.forEach((revItem) => {
        const revTask: Task = {
          id: `TASK-REV-${Math.floor(100 + Math.random() * 900)}`,
          projectId: project.id,
          projectName: project.name,
          title: `[Revision Request]: ${revItem.description}`,
          description: `Deliverable revision requested by Admin ${actor.name} on Round ${currentRound.roundNumber}: ${comments}`,
          status: 'To Do',
          priority: revItem.priority,
          assignee: project.teamMembers?.[0]?.userId ? store.users.find(u => u.id === project.teamMembers?.[0]?.userId)?.name || 'Team Lead' : 'Team Lead',
          assigneeId: project.teamLeaderId,
          creatorId: actor.id,
          creatorName: actor.name,
          startDate: new Date().toISOString().split('T')[0],
          dueDate: revItem.deadline || project.deadline,
          deadline: revItem.deadline || project.deadline,
          estimatedEffortHours: 16,
          acceptanceCriteria: `Satisfy revision item: ${revItem.description}`,
          latestUpdate: 'Generated from Admin revision request.',
          history: [],
          createdAt: new Date().toISOString(),
        };
        project.tasks.unshift(revTask);
      });

      // Notify Team Leader
      if (project.teamLeaderId) {
        createNotification(
          'Revisions Requested on Deliverable',
          `Admin ${actor.name} requested ${formattedRevisionItems.length} change(s) on ${project.name} (${currentRound.releaseVersion}).`,
          'review',
          project.teamLeaderId,
          `/projects/${project.id}`
        );
      }

      createAuditLog(
        actor.id,
        actor.name,
        'CHANGES_REQUESTED',
        `Admin ${actor.name} requested changes on deliverable ${currentRound.releaseVersion} for project "${project.name}" (${formattedRevisionItems.length} revision items).`,
        project.name,
        {
          projectId: project.id,
          releaseVersion: currentRound.releaseVersion,
          revisionCount: formattedRevisionItems.length,
        }
      );
    }

    submission.updatedAt = new Date().toISOString();
    project.reviewSubmission = submission;
    project.updatedAt = new Date().toISOString();

    saveStore(store);
    return NextResponse.json(submission);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 });
  }
}
