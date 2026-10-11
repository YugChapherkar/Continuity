export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  initials: string;
  department: string;
  bio?: string;
  location?: string;
  activeProjectsCount?: number;
  pendingHandoffsCount?: number;
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

export interface Task {
  id: string;
  title: string;
  status: 'Critical' | 'Blocked' | 'In Progress' | 'Done';
  priority: 'P0' | 'P1' | 'P2';
  assignee: string;
  description?: string;
  createdAt: string;
}

export interface ProjectFile {
  name: string;
  path: string;
  size: string;
  type: 'code' | 'config' | 'doc' | 'schema';
  contentSnippet: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Transitioning' | 'Review Needed' | 'Stable';
  currentVersionId: string;
  ownerId: string;
  team: string;
  repositoryUrl: string;
  architectureSummary: string;
  quickstartGuide: string;
  decisions: ArchitectureDecision[];
  versions: ProjectVersion[];
  tasks: Task[];
  files: ProjectFile[];
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

export interface HandoffPackage {
  id: string; // e.g. "HO-2026-089"
  projectId: string;
  projectName: string;
  senderId: string;
  recipientId: string;
  pinnedVersionId: string;
  pinnedVersionHash: string;
  status: 'Pending' | 'Accepted' | 'Completed';
  createdAt: string;
  acceptedAt?: string;
  note: string;
  briefing: HandoffBriefing;
  auditTrail: HandoffAuditTrailItem[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  hash: string;
  prevHash: string;
  action: 'HANDOFF_INITIATED' | 'HANDOFF_ACCEPTED' | 'ADR_REGISTERED' | 'TASK_STATUS_CHANGED' | 'OWNERSHIP_TRANSFERRED' | 'VERSION_PINNED';
  actorId: string;
  actorName: string;
  projectName: string;
  detail: string;
  verifiable: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'handoff' | 'task' | 'audit' | 'mention';
  link?: string;
}
