export type SystemRole = 'Admin' | 'Team Leader' | 'Employee';

export interface User {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  role: string; // Job title / functional description
  systemRole?: SystemRole; // Strict RBAC role
  accountStatus?: 'Active' | 'Inactive';
  teamId?: string;
  avatar: string;
  initials: string;
  department: string;
  bio?: string;
  location?: string;
  activeProjectsCount?: number;
  pendingHandoffsCount?: number;
  isAdmin?: boolean;
  createdAt?: string;
  lastActiveAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  department: string;
  status: 'Active' | 'Inactive';
  leaderId: string;
  leaderName?: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  deadline: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Overdue';
  order: number;
}

export type TaskStatus =
  | 'Backlog'
  | 'To Do'
  | 'In Progress'
  | 'Blocked'
  | 'In Review'
  | 'Changes Requested'
  | 'Completed'
  | 'Critical'
  | 'Done';

export interface TaskStatusHistoryItem {
  timestamp: string;
  actorId: string;
  actorName: string;
  fromStatus: TaskStatus | string;
  toStatus: TaskStatus | string;
  note?: string;
}

export interface TaskOwnershipRecord {
  id: string;
  previousOwnerId?: string;
  previousOwnerName?: string;
  newOwnerId: string;
  newOwnerName: string;
  transferredAt: string;
  transferredBy: string; // user id
  transferredByName: string;
  handoffId?: string;
  reason: string;
  method: 'Assignment' | 'Recipient Acceptance' | 'Manager Override';
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

export type BlockerStatus = 'Reported' | 'Acknowledged' | 'Escalated' | 'Resolved';

export interface TaskBlocker {
  id: string;
  reportedBy: string;
  reportedByName: string;
  reportedAt: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: BlockerStatus;
  acknowledgedBy?: string;
  acknowledgedByName?: string;
  acknowledgedAt?: string;
  escalatedTo?: string;
  escalatedToName?: string;
  escalatedAt?: string;
  escalationReason?: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
}

export interface Task {
  id: string;
  projectId?: string;
  projectName?: string;
  milestoneId?: string;
  milestoneTitle?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'P0' | 'P1' | 'P2';
  assignee: string; // user id or name
  assigneeId?: string;
  assigneeName?: string;
  creatorId?: string;
  creatorName?: string;
  startDate?: string;
  deadline?: string;
  dueDate?: string;
  estimatedEffortHours?: number;
  dependencies?: string[]; // IDs of tasks this depends on
  acceptanceCriteria?: string;
  evidenceUrls?: string[];
  latestUpdate?: string;
  history?: TaskStatusHistoryItem[];
  ownershipTimeline?: TaskOwnershipRecord[];
  comments?: TaskComment[];
  blockerDetails?: TaskBlocker;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectVersion {
  id: string; // e.g. "v2.4.0"
  hash: string; // e.g. "a9f82c1"
  timestamp: string;
  author: {
    name: string;
    avatar: string;
  };
  commitMessage: string;
  changedFilesCount: number;
  changedFiles: {
    path: string;
    insertions: number;
    deletions: number;
  }[];
}

export interface ArchitectureDecision {
  id: string; // e.g. "ADR-041"
  title: string;
  date: string;
  context: string;
  decision: string;
  consequences: string;
  status?: 'Accepted' | 'Proposed' | 'Deprecated';
}

export interface ProjectFile {
  name: string;
  path: string;
  size: string;
  type: 'code' | 'config' | 'doc' | 'schema';
  contentSnippet: string;
}

export type TeamRole = 'Lead' | 'Member';

export interface ProjectTeamMember {
  userId: string;
  role: TeamRole;
  responsibility: string;
  joinedAt: string;
  isPrimaryOnCall?: boolean;
}

export type ProjectLifecycleStatus =
  | 'Active'
  | 'At Risk'
  | 'Critical'
  | 'Submitted for Final Review'
  | 'In Review'
  | 'Changes Requested'
  | 'Approved for Delivery'
  | 'Delivered'
  | 'Stable'
  | 'Transitioning'
  | 'Review Needed';

export interface RevisionItem {
  id: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  deadline?: string;
  completed?: boolean;
}

export interface ReviewRound {
  roundNumber: number;
  submittedAt: string;
  submittedBy: string;
  submittedByName?: string;
  releaseVersion: string;
  completionSummary: string;
  setupInstructions: string;
  knownLimitations: string;
  testEvidence: string;
  outstandingIssues: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  decision?: 'Approved' | 'Changes Requested';
  comments?: string;
  revisionItems?: RevisionItem[];
}

export interface ProjectReviewSubmission {
  id: string;
  projectId: string;
  projectName: string;
  status:
    | 'Execution'
    | 'Submitted for Final Review'
    | 'In Review'
    | 'Changes Requested'
    | 'Approved for Delivery'
    | 'Delivered';
  currentRound: number;
  rounds: ReviewRound[];
  updatedAt: string;
}

export interface ClientDeliveryRecord {
  id: string;
  projectId: string;
  projectName: string;
  approvedVersion: string;
  deliveredAt: string;
  recipientContact: string;
  deliveryChannel: string;
  deliveryNotes: string;
  deliverablesList: string[];
  recordedBy: string;
  recordedByName: string;
  clientAcknowledged: boolean;
  clientAcknowledgmentNotes?: string;
  createdAt: string;
}

export interface EmployeeDailyUpdate {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  taskId?: string;
  taskTitle?: string;
  projectId: string;
  projectName: string;
  completedWork: string;
  inProgress: string;
  nextSteps: string;
  blockers?: string;
  dependencies?: string;
  evidenceUrls?: string[];
  status: 'Submitted' | 'Reviewed' | 'Clarification Requested';
  leaderComment?: string;
  leaderId?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface TeamLeadProgressReport {
  id: string;
  projectId: string;
  projectName: string;
  teamId: string;
  teamName: string;
  leaderId: string;
  leaderName: string;
  reportingPeriod: string;
  progressPercentage: number;
  milestonesCompleted: string[];
  workCompleted: string;
  tasksRemaining: string;
  blockedTasks: string;
  risks: string;
  deadlineConfidence: 'High' | 'Medium' | 'Low';
  helpNeededFromAdmin: string;
  nextPeriodPlan: string;
  evidenceUrls?: string[];
  status: 'Draft' | 'Submitted' | 'In Review' | 'Clarification Requested' | 'Acknowledged' | 'Approved';
  adminFeedback?: string;
  adminId?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface ProjectHealthStatus {
  health: 'Green' | 'At Risk' | 'Critical';
  reasons: string[];
  overdueTasksCount: number;
  blockedTasksCount: number;
  approachingMilestonesCount: number;
  staleUpdatesCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client?: string;
  scope?: string;
  expectedDeliverables?: string[];
  startDate?: string;
  deadline?: string;
  priority?: 'P0' | 'P1' | 'P2';
  budget?: string;
  teamId?: string;
  teamLeaderId?: string;
  stakeholders?: string[];
  acceptanceCriteria?: string;
  status: ProjectLifecycleStatus;
  health?: 'Green' | 'At Risk' | 'Critical';
  healthReasons?: string[];
  currentVersionId: string;
  ownerId: string;
  team: string;
  teamDescription?: string;
  teamChannel?: string;
  teamMembers?: ProjectTeamMember[];
  repositoryUrl: string;
  architectureSummary: string;
  quickstartGuide: string;
  milestones?: Milestone[];
  decisions: ArchitectureDecision[];
  versions: ProjectVersion[];
  tasks: Task[];
  files: ProjectFile[];
  reviewSubmission?: ProjectReviewSubmission;
  deliveryRecord?: ClientDeliveryRecord;
  updatedAt: string;
}

export interface HandoffBriefing {
  executiveSummary: string;
  completedItems: string[];
  nextSteps: string[];
  criticalBlockers: string[];
  architecturalDecisions: string[];
  keyFiles: string[];
  runbookCommands: string[];
}

export interface HandoffAuditTrailItem {
  action: string;
  actor: string;
  timestamp: string;
  detail: string;
  hash?: string;
}

export interface HandoffReadinessCriterion {
  id: string;
  label: string;
  weight: number;
  satisfied: boolean;
  suggestion: string;
}

export interface HandoffReadinessCheck {
  score: number; // 0 to 100
  passed: boolean; // >= 75
  criteria: HandoffReadinessCriterion[];
  suggestions: string[];
}

export interface HandoffPackage {
  id: string; // e.g. "HO-2026-089"
  projectId: string;
  projectName: string;
  taskId?: string;
  taskTitle?: string;
  senderId: string;
  recipientId: string;
  pinnedVersionId: string;
  pinnedVersionHash: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Clarification Requested' | 'Completed' | 'Cancelled';
  clarificationRequest?: string;
  declineReason?: string;
  setupInstructions?: string;
  pendingTasks?: string[];
  files?: string[];
  createdAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  note: string;
  completenessScore?: number;
  readinessCheck?: HandoffReadinessCheck;
  briefing: HandoffBriefing;
  auditTrail: HandoffAuditTrailItem[];
}

export type AuditAction =
  | 'HANDOFF_INITIATED'
  | 'HANDOFF_ACCEPTED'
  | 'HANDOFF_DECLINED'
  | 'HANDOFF_CLARIFICATION_REQUESTED'
  | 'HANDOFF_MANAGER_OVERRIDE'
  | 'ADR_REGISTERED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'OWNERSHIP_TRANSFERRED'
  | 'VERSION_PINNED'
  | 'EMPLOYEE_INVITED'
  | 'EMPLOYEE_STATUS_CHANGED'
  | 'ROLE_CHANGED'
  | 'TEAM_CREATED'
  | 'TEAM_UPDATED'
  | 'TEAM_DEACTIVATED'
  | 'LEADER_ASSIGNED'
  | 'MEMBER_TRANSFERRED'
  | 'PROJECT_CREATED'
  | 'PROJECT_ASSIGNED'
  | 'UPDATE_SUBMITTED'
  | 'UPDATE_REVIEWED'
  | 'REPORT_SUBMITTED'
  | 'REPORT_REVIEWED'
  | 'FINAL_REVIEW_SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'DELIVERY_APPROVED'
  | 'CLIENT_DELIVERY_RECORDED'
  | 'BLOCKER_REPORTED'
  | 'BLOCKER_ACKNOWLEDGED'
  | 'BLOCKER_ESCALATED'
  | 'BLOCKER_RESOLVED'
  | 'TASK_COMMENT_ADDED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  hash: string;
  prevHash: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  projectName?: string;
  detail: string;
  metadata?: Record<string, unknown>;
  verifiable: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'handoff' | 'task' | 'audit' | 'mention' | 'report' | 'review' | 'delivery' | 'team' | 'blocker';
  link?: string;
  recipientId?: string;
}

