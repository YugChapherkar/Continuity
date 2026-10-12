import {
  Project,
  ProjectVersion,
  ArchitectureDecision,
  Task,
  HandoffPackage,
  AuditLogEntry,
  User,
  AppNotification,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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
      if (errorJson.message) {
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

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
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

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE_URL}/api/projects`, {
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

  // Architecture Decisions (ADR)
  async addDecision(
    projectId: string,
    decision: Omit<ArchitectureDecision, 'id'>
  ): Promise<ArchitectureDecision> {
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/decisions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(decision),
    });
    return handleResponse(res);
  },

  // Project Versions & Snapshots
  async getVersions(projectId: string): Promise<ProjectVersion[]> {
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/versions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async uploadVersion(
    projectId: string,
    formData: FormData
  ): Promise<ProjectVersion> {
    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('continuity_current_user_id');
      if (userId) headers['X-User-Id'] = userId;
    }

    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/versions`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  // Tasks
  async getTasks(projectId: string): Promise<Task[]> {
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createTask(projectId: string, payload: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateTask(taskId: string, payload: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Handoffs
  async getHandoffs(): Promise<HandoffPackage[]> {
    const res = await fetch(`${API_BASE_URL}/api/handoffs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getHandoff(handoffId: string): Promise<HandoffPackage> {
    const res = await fetch(`${API_BASE_URL}/api/handoffs/${handoffId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createHandoff(
    projectId: string,
    payload: {
      recipientId: string;
      note: string;
      executiveSummary: string;
      completedItems: string[];
      nextSteps: string[];
      criticalBlockers: string[];
      runbookCommands: string[];
    }
  ): Promise<HandoffPackage> {
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/handoffs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async acceptHandoff(
    handoffId: string,
    signoffNote: string
  ): Promise<HandoffPackage> {
    const res = await fetch(`${API_BASE_URL}/api/handoffs/${handoffId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ signoffNote }),
    });
    return handleResponse(res);
  },

  async requestClarification(
    handoffId: string,
    question: string
  ): Promise<HandoffPackage> {
    const res = await fetch(
      `${API_BASE_URL}/api/handoffs/${handoffId}/request-clarification`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ question }),
      }
    );
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(recipientId?: string): Promise<AppNotification[]> {
    const url = recipientId
      ? `${API_BASE_URL}/api/notifications?recipientId=${encodeURIComponent(recipientId)}`
      : `${API_BASE_URL}/api/notifications`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markNotificationRead(id: string): Promise<AppNotification> {
    const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead(recipientId?: string): Promise<void> {
    const url = recipientId
      ? `${API_BASE_URL}/api/notifications/read-all?recipientId=${encodeURIComponent(recipientId)}`
      : `${API_BASE_URL}/api/notifications/read-all`;
    await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // Activity & Audit Ledger
  async getActivity(projectId?: string): Promise<AuditLogEntry[]> {
    const url = projectId
      ? `${API_BASE_URL}/api/projects/${projectId}/activity`
      : `${API_BASE_URL}/api/activity`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // RAG Knowledge & Assistant Chat
  async getKnowledgeStatus(
    projectId: string,
    versionId?: string
  ): Promise<{ status: string; fileCount: number; lastIndexedAt: string }> {
    const url = `${API_BASE_URL}/api/projects/${projectId}/knowledge/status${
      versionId ? `?versionId=${versionId}` : ''
    }`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async queryChat(payload: {
    query: string;
    projectId?: string;
    versionId?: string;
    handoffId?: string;
  }): Promise<{
    response: string;
    model: string;
    citations: string[];
    pinnedVersionId?: string;
  }> {
    const targetProject = payload.projectId || 'apollo-core';
    const res = await fetch(`${API_BASE_URL}/api/projects/${targetProject}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        query: payload.query,
        versionId: payload.versionId,
        handoffId: payload.handoffId,
      }),
    });
    return handleResponse(res);
  },
};
