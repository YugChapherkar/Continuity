'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  Project,
  HandoffPackage,
  AuditLogEntry,
  AppNotification,
  Task,
  ArchitectureDecision,
  ProjectVersion,
  ProjectTeamMember,
  TeamRole,
  ProjectFile,
  Team,
  EmployeeDailyUpdate,
  TeamLeadProgressReport,
  ProjectReviewSubmission,
  ClientDeliveryRecord,
  SystemRole,
} from '@/lib/types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_HANDOFFS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '@/lib/mock-data';
import { api } from '@/lib/api';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeRole: SystemRole;
  users: User[];
  teams: Team[];
  projects: Project[];
  handoffs: HandoffPackage[];
  updates: EmployeeDailyUpdate[];
  reports: TeamLeadProgressReport[];
  reviews: ProjectReviewSubmission[];
  deliveries: ClientDeliveryRecord[];
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];
  isCreateHandoffModalOpen: boolean;
  setIsCreateHandoffModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  acceptHandoff: (handoffId: string, signoffNote?: string) => Promise<boolean>;
  declineHandoff: (handoffId: string, reason: string) => Promise<boolean>;
  clarifyHandoff: (handoffId: string, question: string) => Promise<boolean>;
  overrideHandoff: (handoffId: string, overrideReason: string) => Promise<boolean>;
  reportTaskBlocker: (taskId: string, description: string, severity?: 'Low' | 'Medium' | 'High' | 'Critical') => Promise<Task | null>;
  updateTaskBlocker: (taskId: string, action: 'acknowledge' | 'escalate' | 'resolve', payload?: { notes?: string; reason?: string }) => Promise<Task | null>;
  addTaskComment: (taskId: string, text: string) => Promise<any>;
  createHandoff: (payload: {
    projectId: string;
    recipientId: string;
    note: string;
    executiveSummary: string;
    completedItems: string[];
    nextSteps: string[];
    criticalBlockers: string[];
    runbookCommands: string[];
    taskId?: string;
    setupInstructions?: string;
    pendingTasks?: string[];
    files?: string[];
  }) => Promise<HandoffPackage>;
  createProject: (payload: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, payload: Partial<Project>) => Promise<Project>;
  uploadVersion: (projectId: string, formData: FormData) => Promise<ProjectVersion>;
  updateTaskStatus: (projectId: string, taskId: string, newStatus: Task['status'], note?: string) => Promise<void>;
  createTask: (payload: {
    projectId: string;
    title: string;
    description?: string;
    milestoneId?: string;
    assigneeId: string;
    priority?: 'P0' | 'P1' | 'P2';
    startDate?: string;
    dueDate?: string;
    estimatedEffortHours?: number;
    dependencies?: string[];
    acceptanceCriteria?: string;
  }) => Promise<Task>;
  submitDailyUpdate: (payload: {
    projectId: string;
    taskId?: string;
    completedWork: string;
    inProgress: string;
    nextSteps: string;
    blockers?: string;
    dependencies?: string;
    evidenceUrls?: string[];
  }) => Promise<EmployeeDailyUpdate>;
  reviewDailyUpdate: (updateId: string, status: 'Reviewed' | 'Clarification Requested', comment?: string) => Promise<void>;
  submitLeaderReport: (payload: {
    projectId: string;
    reportingPeriod: string;
    progressPercentage: number;
    milestonesCompleted?: string[];
    workCompleted: string;
    tasksRemaining?: string;
    blockedTasks?: string;
    risks?: string;
    deadlineConfidence?: 'High' | 'Medium' | 'Low';
    helpNeededFromAdmin?: string;
    nextPeriodPlan: string;
    evidenceUrls?: string[];
  }) => Promise<TeamLeadProgressReport>;
  reviewLeaderReport: (reportId: string, status: 'Approved' | 'Acknowledged' | 'Clarification Requested', feedback?: string) => Promise<void>;
  submitFinalReview: (payload: {
    projectId: string;
    releaseVersion: string;
    completionSummary: string;
    setupInstructions: string;
    knownLimitations?: string;
    testEvidence: string;
    outstandingIssues?: string;
  }) => Promise<ProjectReviewSubmission>;
  reviewDeliverableSubmission: (
    submissionId: string,
    decision: 'Approved' | 'Changes Requested',
    comments?: string,
    revisionItems?: { description: string; priority?: 'P0' | 'P1' | 'P2'; deadline?: string }[]
  ) => Promise<ProjectReviewSubmission>;
  recordClientDelivery: (payload: {
    projectId: string;
    deliveredVersion?: string;
    deliveredAt?: string;
    recipientContact: string;
    deliveryChannel: string;
    deliveryNotes: string;
    deliverablesList?: string[];
    clientAcknowledged?: boolean;
    clientAcknowledgmentNotes?: string;
  }) => Promise<ClientDeliveryRecord>;
  addProjectDecision: (projectId: string, decision: Omit<ArchitectureDecision, 'id'>) => Promise<void>;
  addProjectTeamMember: (
    projectId: string,
    member: { userId: string; role: TeamRole; responsibility?: string; isPrimaryOnCall?: boolean }
  ) => void;
  removeProjectTeamMember: (projectId: string, userId: string) => void;
  updateProjectTeamMemberRole: (
    projectId: string,
    userId: string,
    role: TeamRole,
    responsibility?: string,
    isPrimaryOnCall?: boolean
  ) => void;
  updateProjectTeamInfo: (
    projectId: string,
    teamName: string,
    teamDescription?: string,
    teamChannel?: string
  ) => void;
  addProjectFile: (projectId: string, file: ProjectFile) => void;
  handoffTarget: { projectId: string; recipientId?: string } | null;
  setHandoffTarget: (target: { projectId: string; recipientId?: string } | null) => void;
  openHandoffWithTarget: (projectId: string, recipientId?: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  isBackendConnected: boolean;
  refreshData: () => Promise<void>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUserState] = useState<User>(INITIAL_USERS[0]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [handoffs, setHandoffs] = useState<HandoffPackage[]>(INITIAL_HANDOFFS);
  const [updates, setUpdates] = useState<EmployeeDailyUpdate[]>([]);
  const [reports, setReports] = useState<TeamLeadProgressReport[]>([]);
  const [reviews, setReviews] = useState<ProjectReviewSubmission[]>([]);
  const [deliveries, setDeliveries] = useState<ClientDeliveryRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [isCreateHandoffModalOpen, setIsCreateHandoffModalOpen] = useState(false);
  const [handoffTarget, setHandoffTarget] = useState<{ projectId: string; recipientId?: string } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setThemeState] = useState<'dark' | 'light'>('light');
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(true);

  // Derive current RBAC role cleanly
  const activeRole: SystemRole = currentUser.systemRole || (currentUser.isAdmin ? 'Admin' : 'Employee');

  const setIsAuthenticated = (auth: boolean) => {
    setIsAuthenticatedState(auth);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('continuity_authenticated', auth ? 'true' : 'false');
      } catch {}
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Signed out of continuity session', 'info');
  };

  const applyTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('continuity_theme', newTheme);
      } catch {}
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  // Sync theme and responsive sidebar state on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('continuity_theme') as 'dark' | 'light' | null;
        if (saved === 'light' || saved === 'dark') {
          applyTheme(saved);
        } else {
          applyTheme('light');
        }
      } catch {
        applyTheme('light');
      }

      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  }, []);

  // Fetch live state from backend API routes
  const refreshData = useCallback(async () => {
    try {
      const [
        backendProjects,
        backendTeams,
        backendUsers,
        backendUpdates,
        backendReports,
        backendReviews,
        backendDeliveries,
        backendAudit,
        backendNotifs,
        backendHandoffs,
      ] = await Promise.allSettled([
        api.getProjects(),
        api.getTeams(),
        api.getUsers(),
        api.getUpdates(),
        api.getReports(),
        api.getReviews(),
        api.getDeliveries(),
        api.getAuditLogs(),
        api.getNotifications(),
        api.getHandoffs(),
      ]);

      if (backendProjects.status === 'fulfilled' && backendProjects.value.length > 0) {
        setProjects(backendProjects.value);
      }
      if (backendTeams.status === 'fulfilled' && backendTeams.value.length > 0) {
        setTeams(backendTeams.value);
      }
      if (backendUsers.status === 'fulfilled' && backendUsers.value.length > 0) {
        setUsers(backendUsers.value);
      }
      if (backendUpdates.status === 'fulfilled') {
        setUpdates(backendUpdates.value);
      }
      if (backendReports.status === 'fulfilled') {
        setReports(backendReports.value);
      }
      if (backendReviews.status === 'fulfilled') {
        setReviews(backendReviews.value);
      }
      if (backendDeliveries.status === 'fulfilled') {
        setDeliveries(backendDeliveries.value);
      }
      if (backendAudit.status === 'fulfilled' && backendAudit.value.length > 0) {
        setAuditLogs(backendAudit.value);
      }
      if (backendNotifs.status === 'fulfilled') {
        setNotifications(backendNotifs.value);
      }
      if (backendHandoffs.status === 'fulfilled' && backendHandoffs.value.length > 0) {
        setHandoffs(backendHandoffs.value);
      }

      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend refresh warning:', err);
    }
  }, []);

  // Initial load: restore saved user and fetch backend
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedUserId = localStorage.getItem('continuity_current_user_id');
        if (savedUserId) {
          const found = INITIAL_USERS.find((u) => u.id === savedUserId);
          if (found) setCurrentUserState(found);
        }
        const savedAuth = localStorage.getItem('continuity_authenticated');
        if (savedAuth === 'false') {
          setIsAuthenticatedState(false);
        } else if (savedAuth === 'true') {
          setIsAuthenticatedState(true);
        }
      }
    } catch {
      // ignore
    }

    refreshData();
  }, [refreshData]);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('continuity_current_user_id', user.id);
      } catch {}
    }
    showToast(`Switched active perspective to ${user.name} (${user.systemRole || user.role})`, 'info');
    // Refresh data with new user credentials/scope
    setTimeout(() => {
      refreshData();
    }, 100);
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    api.markNotificationRead(notifId).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    api.markAllNotificationsRead().catch(() => {});
    showToast('All notifications marked as read', 'info');
  };

  const acceptHandoff = async (handoffId: string, signoffNote?: string): Promise<boolean> => {
    try {
      await api.acceptHandoff(handoffId, signoffNote);
      await refreshData();
      showToast('Handoff verified and accepted. Ownership transferred.', 'success');
      return true;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error accepting handoff', 'error');
      return false;
    }
  };

  const declineHandoff = async (handoffId: string, reason: string): Promise<boolean> => {
    try {
      await api.declineHandoff(handoffId, reason);
      await refreshData();
      showToast('Handoff declined. Ownership remains with sender.', 'info');
      return true;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error declining handoff', 'error');
      return false;
    }
  };

  const clarifyHandoff = async (handoffId: string, question: string): Promise<boolean> => {
    try {
      await api.clarifyHandoff(handoffId, question);
      await refreshData();
      showToast('Clarification requested. Sender has been notified.', 'info');
      return true;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error requesting clarification', 'error');
      return false;
    }
  };

  const overrideHandoff = async (handoffId: string, overrideReason: string): Promise<boolean> => {
    try {
      await api.overrideHandoff(handoffId, overrideReason);
      await refreshData();
      showToast('Manager override executed. Ownership transferred.', 'success');
      return true;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error executing override', 'error');
      return false;
    }
  };

  const reportTaskBlocker = async (
    taskId: string,
    description: string,
    severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'High'
  ): Promise<Task | null> => {
    try {
      const task = await api.reportTaskBlocker(taskId, description, severity);
      await refreshData();
      showToast('Operational blocker reported. Team Leader has been notified.', 'info');
      return task;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error reporting blocker', 'error');
      return null;
    }
  };

  const updateTaskBlocker = async (
    taskId: string,
    action: 'acknowledge' | 'escalate' | 'resolve',
    payload?: { notes?: string; reason?: string }
  ): Promise<Task | null> => {
    try {
      const task = await api.updateTaskBlocker(taskId, action, payload);
      await refreshData();
      showToast(`Blocker marked as ${action}d.`, 'success');
      return task;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating blocker', 'error');
      return null;
    }
  };

  const addTaskComment = async (taskId: string, text: string): Promise<any> => {
    try {
      const comment = await api.addTaskComment(taskId, text);
      await refreshData();
      showToast('Comment posted.', 'success');
      return comment;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error adding comment', 'error');
      return null;
    }
  };

  const createHandoff = async (payload: {
    projectId: string;
    recipientId: string;
    note: string;
    executiveSummary: string;
    completedItems: string[];
    nextSteps: string[];
    criticalBlockers: string[];
    runbookCommands: string[];
  }): Promise<HandoffPackage> => {
    try {
      const created = await api.createHandoff(payload);
      await refreshData();
      showToast(`Handoff package ${created.id} compiled and dispatched.`, 'success');
      return created;
    } catch {
      const project = projects.find((p) => p.id === payload.projectId) || projects[0];
      const newId = `HO-2026-${Math.floor(100 + Math.random() * 899)}`;
      const newHandoff: HandoffPackage = {
        id: newId,
        projectId: project.id,
        projectName: project.name,
        senderId: currentUser.id,
        recipientId: payload.recipientId,
        pinnedVersionId: project.currentVersionId,
        pinnedVersionHash: 'a9f82c1',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        note: payload.note,
        completenessScore: 94,
        briefing: {
          executiveSummary: payload.executiveSummary,
          completedItems: payload.completedItems,
          nextSteps: payload.nextSteps,
          criticalBlockers: payload.criticalBlockers,
          architecturalDecisions: project.decisions.map((d) => `${d.id}: ${d.title}`),
          keyFiles: project.files.map((f) => f.path),
          runbookCommands: payload.runbookCommands,
        },
        auditTrail: [
          {
            action: 'HANDOFF_INITIATED',
            actor: currentUser.name,
            timestamp: new Date().toISOString(),
            detail: `Created handoff dossier for ${project.name}.`,
          },
        ],
      };
      setHandoffs([newHandoff, ...handoffs]);
      showToast(`Handoff package ${newId} dispatched.`, 'success');
      return newHandoff;
    }
  };

  const createProject = async (payload: Partial<Project>): Promise<Project> => {
    try {
      const created = await api.createProject(payload);
      await refreshData();
      showToast(`Created project ${created.name}`, 'success');
      return created;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error creating project', 'error');
      throw err;
    }
  };

  const updateProject = async (id: string, payload: Partial<Project>): Promise<Project> => {
    try {
      const updated = await api.updateProject(id, payload);
      await refreshData();
      showToast(`Updated project ${updated.name}`, 'success');
      return updated;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating project', 'error');
      throw err;
    }
  };

  const uploadVersion = async (projectId: string, _formData: FormData): Promise<ProjectVersion> => {
    const newVersion: ProjectVersion = {
      id: `v2.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      hash: Math.random().toString(16).substring(2, 9),
      timestamp: new Date().toISOString(),
      author: { name: currentUser.name, avatar: currentUser.avatar },
      commitMessage: 'Snapshot version increment registered',
      changedFilesCount: 5,
      changedFiles: [{ path: 'src/core.rs', insertions: 42, deletions: 12 }],
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              currentVersionId: newVersion.id,
              versions: [newVersion, ...p.versions],
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    showToast(`Pinned new project version ${newVersion.id}`, 'success');
    return newVersion;
  };

  const updateTaskStatus = async (
    projectId: string,
    taskId: string,
    newStatus: Task['status'],
    note?: string
  ): Promise<void> => {
    try {
      await api.updateTask(taskId, { status: newStatus, note });
      await refreshData();
      showToast(`Updated task status to ${newStatus}`, 'success');
    } catch {
      // Local fallback
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      status: newStatus,
                      updatedAt: new Date().toISOString(),
                      history: [
                        {
                          timestamp: new Date().toISOString(),
                          actorId: currentUser.id,
                          actorName: currentUser.name,
                          fromStatus: t.status,
                          toStatus: newStatus,
                          note: note || `Updated by ${currentUser.name}`,
                        },
                        ...(t.history || []),
                      ],
                    }
                  : t
              ),
            };
          }
          return p;
        })
      );
      showToast(`Updated task status to ${newStatus}`, 'success');
    }
  };

  const createTask = async (payload: {
    projectId: string;
    title: string;
    description?: string;
    milestoneId?: string;
    assigneeId: string;
    priority?: 'P0' | 'P1' | 'P2';
    startDate?: string;
    dueDate?: string;
    estimatedEffortHours?: number;
    dependencies?: string[];
    acceptanceCriteria?: string;
  }): Promise<Task> => {
    try {
      const created = await api.createTask(payload);
      await refreshData();
      showToast(`Assigned task "${created.title}" to ${created.assignee}`, 'success');
      return created;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error creating task', 'error');
      throw err;
    }
  };

  const submitDailyUpdate = async (payload: {
    projectId: string;
    taskId?: string;
    completedWork: string;
    inProgress: string;
    nextSteps: string;
    blockers?: string;
    dependencies?: string;
    evidenceUrls?: string[];
  }): Promise<EmployeeDailyUpdate> => {
    try {
      const created = await api.submitUpdate(payload);
      await refreshData();
      showToast('Work update recorded and submitted to Team Leader.', 'success');
      return created;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error submitting update', 'error');
      throw err;
    }
  };

  const reviewDailyUpdate = async (
    updateId: string,
    status: 'Reviewed' | 'Clarification Requested',
    comment?: string
  ): Promise<void> => {
    try {
      await api.reviewUpdate({ updateId, status, leaderComment: comment });
      await refreshData();
      showToast(`Update marked as ${status}.`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error reviewing update', 'error');
      throw err;
    }
  };

  const submitLeaderReport = async (payload: {
    projectId: string;
    reportingPeriod: string;
    progressPercentage: number;
    milestonesCompleted?: string[];
    workCompleted: string;
    tasksRemaining?: string;
    blockedTasks?: string;
    risks?: string;
    deadlineConfidence?: 'High' | 'Medium' | 'Low';
    helpNeededFromAdmin?: string;
    nextPeriodPlan: string;
    evidenceUrls?: string[];
  }): Promise<TeamLeadProgressReport> => {
    try {
      const created = await api.submitReport(payload);
      await refreshData();
      showToast('Progress report submitted to Admin for governance review.', 'success');
      return created;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error submitting report', 'error');
      throw err;
    }
  };

  const reviewLeaderReport = async (
    reportId: string,
    status: 'Approved' | 'Acknowledged' | 'Clarification Requested',
    feedback?: string
  ): Promise<void> => {
    try {
      await api.reviewReport({ reportId, status, adminFeedback: feedback });
      await refreshData();
      showToast(`Progress report marked as ${status}.`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error reviewing report', 'error');
      throw err;
    }
  };

  const submitFinalReview = async (payload: {
    projectId: string;
    releaseVersion: string;
    completionSummary: string;
    setupInstructions: string;
    knownLimitations?: string;
    testEvidence: string;
    outstandingIssues?: string;
  }): Promise<ProjectReviewSubmission> => {
    try {
      const created = await api.submitFinalReview(payload);
      await refreshData();
      showToast('Project deliverable submitted for final Admin review.', 'success');
      return created;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error submitting for review', 'error');
      throw err;
    }
  };

  const reviewDeliverableSubmission = async (
    submissionId: string,
    decision: 'Approved' | 'Changes Requested',
    comments?: string,
    revisionItems?: { description: string; priority?: 'P0' | 'P1' | 'P2'; deadline?: string }[]
  ): Promise<ProjectReviewSubmission> => {
    try {
      const reviewed = await api.reviewDeliverable({
        submissionId,
        decision,
        comments,
        revisionItems,
      });
      await refreshData();
      showToast(
        decision === 'Approved'
          ? 'Project release approved for client delivery!'
          : 'Revisions requested. Linked revision tasks assigned to the team.',
        decision === 'Approved' ? 'success' : 'info'
      );
      return reviewed;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error reviewing submission', 'error');
      throw err;
    }
  };

  const recordClientDelivery = async (payload: {
    projectId: string;
    deliveredVersion?: string;
    deliveredAt?: string;
    recipientContact: string;
    deliveryChannel: string;
    deliveryNotes: string;
    deliverablesList?: string[];
    clientAcknowledged?: boolean;
    clientAcknowledgmentNotes?: string;
  }): Promise<ClientDeliveryRecord> => {
    try {
      const record = await api.recordClientDelivery(payload);
      await refreshData();
      showToast('Official client release delivery logged and recorded.', 'success');
      return record;
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error recording delivery', 'error');
      throw err;
    }
  };

  const addProjectDecision = async (
    projectId: string,
    decision: Omit<ArchitectureDecision, 'id'>
  ): Promise<void> => {
    const newDecision: ArchitectureDecision = {
      ...decision,
      id: `ADR-${Math.floor(100 + Math.random() * 899)}`,
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, decisions: [newDecision, ...p.decisions], updatedAt: new Date().toISOString() }
          : p
      )
    );
    showToast(`Registered decision ${newDecision.id}: ${newDecision.title}`, 'success');
  };

  const addProjectTeamMember = (
    projectId: string,
    member: { userId: string; role: TeamRole; responsibility?: string; isPrimaryOnCall?: boolean }
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const currentMembers = p.teamMembers || [];
          if (currentMembers.some((m) => m.userId === member.userId)) return p;
          const newMember: ProjectTeamMember = {
            userId: member.userId,
            role: member.role,
            responsibility: member.responsibility || 'Assigned Pod Member',
            joinedAt: new Date().toISOString().split('T')[0],
            isPrimaryOnCall: member.isPrimaryOnCall || false,
          };
          return { ...p, teamMembers: [...currentMembers, newMember] };
        }
        return p;
      })
    );
    showToast('Added member to project team', 'success');
  };

  const removeProjectTeamMember = (projectId: string, userId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, teamMembers: (p.teamMembers || []).filter((m) => m.userId !== userId) }
          : p
      )
    );
    showToast('Removed member from project team', 'info');
  };

  const updateProjectTeamMemberRole = (
    projectId: string,
    userId: string,
    role: TeamRole,
    responsibility?: string,
    isPrimaryOnCall?: boolean
  ) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              teamMembers: (p.teamMembers || []).map((m) =>
                m.userId === userId
                  ? {
                      ...m,
                      role,
                      responsibility: responsibility !== undefined ? responsibility : m.responsibility,
                      isPrimaryOnCall: isPrimaryOnCall !== undefined ? isPrimaryOnCall : m.isPrimaryOnCall,
                    }
                  : m
              ),
            }
          : p
      )
    );
    showToast('Updated team member role', 'success');
  };

  const updateProjectTeamInfo = (
    projectId: string,
    teamName: string,
    teamDescription?: string,
    teamChannel?: string
  ) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              team: teamName,
              teamDescription: teamDescription !== undefined ? teamDescription : p.teamDescription,
              teamChannel: teamChannel !== undefined ? teamChannel : p.teamChannel,
            }
          : p
      )
    );
    showToast(`Updated project team to "${teamName}"`, 'success');
  };

  const addProjectFile = (projectId: string, file: ProjectFile) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, files: [...p.files, file] } : p
      )
    );
    showToast(`Added ${file.name} to workspace source tree`, 'success');
  };

  const openHandoffWithTarget = (projectId: string, recipientId?: string) => {
    setHandoffTarget({ projectId, recipientId });
    setIsCreateHandoffModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeRole,
        users,
        teams,
        projects,
        handoffs,
        updates,
        reports,
        reviews,
        deliveries,
        auditLogs,
        notifications,
        isCreateHandoffModalOpen,
        setIsCreateHandoffModalOpen,
        handoffTarget,
        setHandoffTarget,
        openHandoffWithTarget,
        addProjectTeamMember,
        removeProjectTeamMember,
        updateProjectTeamMemberRole,
        updateProjectTeamInfo,
        addProjectFile,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        searchQuery,
        setSearchQuery,
        acceptHandoff,
        declineHandoff,
        clarifyHandoff,
        overrideHandoff,
        reportTaskBlocker,
        updateTaskBlocker,
        addTaskComment,
        createHandoff,
        createProject,
        updateProject,
        uploadVersion,
        updateTaskStatus,
        createTask,
        submitDailyUpdate,
        reviewDailyUpdate,
        submitLeaderReport,
        reviewLeaderReport,
        submitFinalReview,
        reviewDeliverableSubmission,
        recordClientDelivery,
        addProjectDecision,
        markNotificationRead,
        markAllNotificationsRead,
        toast,
        showToast,
        isBackendConnected,
        refreshData,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        theme,
        setTheme: applyTheme,
        toggleTheme,
        isAuthenticated,
        setIsAuthenticated,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
