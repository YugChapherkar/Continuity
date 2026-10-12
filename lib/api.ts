import {
  Project,
  ProjectVersion,
  ArchitectureDecision,
  Task,
  HandoffPackage,
  AuditLogEntry,
  User,
  AppNotification,
  Team,
  EmployeeDailyUpdate,
  TeamLeadProgressReport,
  ProjectReviewSubmission,
  ClientDeliveryRecord,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('continuity_current_user_id');
    if (userId) {
      headers['X-User-Id'] = userId;
    }
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `API error ${res.status}: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.error) {
        errorMsg = errorJson.error;
      } else if (errorJson.message) {
        errorMsg = errorJson.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Health
  async getHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return handleResponse(res);
  },

  // Users & Auth
  async getUsers(filters?: { role?: string; teamId?: string; status?: string }): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.teamId) params.set('teamId', filters.teamId);
    if (filters?.status) params.set('status', filters.status);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/api/users${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async inviteEmployee(payload: {
    name: string;
    email: string;
    role?: string;
    systemRole?: string;
    department: string;
    teamId?: string;
    location?: string;
    bio?: string;
  }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateUserRoleOrStatus(payload: {
    userId: string;
    systemRole?: string;
    accountStatus?: 'Active' | 'Inactive';
    teamId?: string;
    role?: string;
    department?: string;
  }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    const res = await fetch(`${API_BASE_URL}/api/teams`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getTeam(id: string): Promise<Team & { stats?: Record<string, number>; members?: User[]; leader?: User }> {
    const res = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createTeam(payload: {
    name: string;
    description?: string;
    department: string;
    leaderId: string;
    memberIds?: string[];
  }): Promise<Team> {
    const res = await fetch(`${API_BASE_URL}/api/teams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateTeam(
    id: string,
    payload: {
      name?: string;
      description?: string;
      department?: string;
      status?: 'Active' | 'Inactive';
      leaderId?: string;
      memberIds?: string[];
    }
  ): Promise<Team> {
    const res = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Projects
  async getProjects(filters?: { status?: string; teamId?: string; priority?: string }): Promise<Project[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.teamId) params.set('teamId', filters.teamId);
    if (filters?.priority) params.set('priority', filters.priority);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/api/projects${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createProject(payload: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateProject(id: string, payload: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Tasks
  async getTasks(filters?: { projectId?: string; assigneeId?: string; status?: string; priority?: string }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.set('projectId', filters.projectId);
    if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/api/tasks${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createTask(payload: {
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
  }): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateTask(
    id: string,
    payload: {
      status?: Task['status'];
      latestUpdate?: string;
      evidenceUrls?: string[];
      assigneeId?: string;
      priority?: 'P0' | 'P1' | 'P2';
      dueDate?: string;
      note?: string;
    }
  ): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Employee Updates
  async getUpdates(filters?: { projectId?: string; employeeId?: string }): Promise<EmployeeDailyUpdate[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.set('projectId', filters.projectId);
    if (filters?.employeeId) params.set('employeeId', filters.employeeId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/api/updates${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitUpdate(payload: {
    projectId: string;
    taskId?: string;
    completedWork: string;
    inProgress: string;
    nextSteps: string;
    blockers?: string;
    dependencies?: string;
    evidenceUrls?: string[];
  }): Promise<EmployeeDailyUpdate> {
    const res = await fetch(`${API_BASE_URL}/api/updates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async reviewUpdate(payload: {
    updateId: string;
    status: 'Reviewed' | 'Clarification Requested';
    leaderComment?: string;
  }): Promise<EmployeeDailyUpdate> {
    const res = await fetch(`${API_BASE_URL}/api/updates`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Team Leader Progress Reports
  async getReports(filters?: { projectId?: string; teamId?: string }): Promise<TeamLeadProgressReport[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.set('projectId', filters.projectId);
    if (filters?.teamId) params.set('teamId', filters.teamId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/api/reports${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitReport(payload: {
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
  }): Promise<TeamLeadProgressReport> {
    const res = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async reviewReport(payload: {
    reportId: string;
    status: 'Approved' | 'Acknowledged' | 'Clarification Requested';
    adminFeedback?: string;
  }): Promise<TeamLeadProgressReport> {
    const res = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Final Review & Approval Workflow
  async getReviews(filters?: { projectId?: string; status?: string }): Promise<ProjectReviewSubmission[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.set('projectId', filters.projectId);
    if (filters?.status) params.set('status', filters.status);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/api/reviews${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitFinalReview(payload: {
    projectId: string;
    releaseVersion: string;
    completionSummary: string;
    setupInstructions: string;
    knownLimitations?: string;
    testEvidence: string;
    outstandingIssues?: string;
  }): Promise<ProjectReviewSubmission> {
    const res = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async reviewDeliverable(payload: {
    submissionId: string;
    decision: 'Approved' | 'Changes Requested';
    comments?: string;
    revisionItems?: { description: string; priority?: 'P0' | 'P1' | 'P2'; deadline?: string }[];
  }): Promise<ProjectReviewSubmission> {
    const res = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Client Release Deliveries
  async getDeliveries(filters?: { projectId?: string }): Promise<ClientDeliveryRecord[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.set('projectId', filters.projectId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/api/deliveries${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async recordClientDelivery(payload: {
    projectId: string;
    deliveredVersion?: string;
    deliveredAt?: string;
    recipientContact: string;
    deliveryChannel: string;
    deliveryNotes: string;
    deliverablesList?: string[];
    clientAcknowledged?: boolean;
    clientAcknowledgmentNotes?: string;
  }): Promise<ClientDeliveryRecord> {
    const res = await fetch(`${API_BASE_URL}/api/deliveries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateDeliveryAcknowledgment(payload: {
    deliveryId: string;
    clientAcknowledged: boolean;
    clientAcknowledgmentNotes?: string;
  }): Promise<ClientDeliveryRecord> {
    const res = await fetch(`${API_BASE_URL}/api/deliveries`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Audit Logs
  async getAuditLogs(action?: string, limit?: number): Promise<AuditLogEntry[]> {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (limit) params.set('limit', limit.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE_URL}/api/audit${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notificationId }),
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ markAllRead: true }),
    });
    return handleResponse(res);
  },

  // Handoffs (Continuity Core Feature)
  async getHandoffs(): Promise<HandoffPackage[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/handoffs`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return res.json();
    } catch {}
    return [];
  },

  async createHandoff(payload: any): Promise<HandoffPackage> {
    const res = await fetch(`${API_BASE_URL}/api/handoffs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async acceptHandoff(id: string, signoffNote?: string): Promise<{ success: boolean; handoff: HandoffPackage }> {
    const res = await fetch(`${API_BASE_URL}/api/handoffs/${id}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ signoffNote }),
    });
    return handleResponse(res);
  },

  async declineHandoff(id: string, reason: string): Promise<{ success: boolean; handoff: HandoffPackage }> {
    const res = await fetch(`${API_BASE_URL}/api/handoffs/${id}/decline`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  async clarifyHandoff(id: string, question: string): Promise<{ success: boolean; handoff: HandoffPackage }> {
    const res = await fetch(`${API_BASE_URL}/api/handoffs/${id}/clarify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question }),
    });
    return handleResponse(res);
  },

  async overrideHandoff(id: string, overrideReason: string): Promise<{ success: boolean; handoff: HandoffPackage }> {
    const res = await fetch(`${API_BASE_URL}/api/handoffs/${id}/override`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ overrideReason }),
    });
    return handleResponse(res);
  },

  async checkHandoffReadiness(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/handoffs/readiness`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Task Blockers & Comments
  async reportTaskBlocker(taskId: string, description: string, severity: 'Low' | 'Medium' | 'High' | 'Critical' = 'High'): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/blocker`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ description, severity }),
    });
    return handleResponse(res);
  },

  async updateTaskBlocker(
    taskId: string,
    action: 'acknowledge' | 'escalate' | 'resolve',
    payload?: { notes?: string; reason?: string }
  ): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/blocker`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, ...payload }),
    });
    return handleResponse(res);
  },

  async addTaskComment(taskId: string, text: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  async getTaskComments(taskId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // AI Assistant
  async askAiAssistant(query: string, activeProjectId?: string): Promise<{
    response: string;
    model: string;
    citations: string[];
    pinnedVersionId: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/api/assistant`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, activeProjectId }),
    });
    return handleResponse(res);
  },
};

