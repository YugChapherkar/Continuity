'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Project, HandoffPackage, AuditLogEntry, AppNotification, Task, ArchitectureDecision, ProjectVersion } from '@/lib/types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_HANDOFFS, INITIAL_AUDIT_LOGS, INITIAL_NOTIFICATIONS } from '@/lib/mock-data';
import { api } from '@/lib/api';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  projects: Project[];
  handoffs: HandoffPackage[];
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];
  isCreateHandoffModalOpen: boolean;
  setIsCreateHandoffModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  acceptHandoff: (handoffId: string, signoffNote: string) => Promise<boolean>;
  createHandoff: (payload: {
    projectId: string;
    recipientId: string;
    note: string;
    executiveSummary: string;
    completedItems: string[];
    nextSteps: string[];
    criticalBlockers: string[];
    runbookCommands: string[];
  }) => Promise<HandoffPackage>;
  createProject: (payload: Partial<Project>) => Promise<Project>;
  uploadVersion: (projectId: string, formData: FormData) => Promise<ProjectVersion>;
  updateTaskStatus: (projectId: string, taskId: string, newStatus: Task['status']) => Promise<void>;
  addProjectDecision: (projectId: string, decision: Omit<ArchitectureDecision, 'id'>) => Promise<void>;
  markNotificationRead: (notifId: string) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUserState] = useState<User>(INITIAL_USERS[0]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [handoffs, setHandoffs] = useState<HandoffPackage[]>(INITIAL_HANDOFFS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [isCreateHandoffModalOpen, setIsCreateHandoffModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

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

  // Sync theme from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('continuity_theme') as 'dark' | 'light' | null;
        if (saved === 'light' || saved === 'dark') {
          applyTheme(saved);
        } else {
          applyTheme('dark');
        }
      } catch {
        applyTheme('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  }, []);

  // Fetch live state from Spring Boot backend with graceful local fallback
  const refreshData = useCallback(async () => {
    try {
      const [backendProjects, backendHandoffs, backendActivity, backendUsers, backendNotifs] = await Promise.allSettled([
        api.getProjects(),
        api.getHandoffs(),
        api.getActivity(),
        api.getUsers(),
        api.getNotifications(),
      ]);

      let connected = false;

      if (backendProjects.status === 'fulfilled' && backendProjects.value.length > 0) {
        setProjects(backendProjects.value);
        connected = true;
      }
      if (backendHandoffs.status === 'fulfilled' && backendHandoffs.value.length > 0) {
        setHandoffs(backendHandoffs.value);
        connected = true;
      }
      if (backendActivity.status === 'fulfilled' && backendActivity.value.length > 0) {
        setAuditLogs(backendActivity.value);
        connected = true;
      }
      if (backendUsers.status === 'fulfilled' && backendUsers.value.length > 0) {
        setUsers(backendUsers.value);
        connected = true;
      }
      if (backendNotifs.status === 'fulfilled' && backendNotifs.value.length > 0) {
        setNotifications(backendNotifs.value);
        connected = true;
      }

      setIsBackendConnected(connected);
    } catch {
      // Backend not running, remain on offline state
      setIsBackendConnected(false);
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
        const savedHandoffs = localStorage.getItem('continuity_handoffs');
        if (savedHandoffs) setHandoffs(JSON.parse(savedHandoffs));
        const savedProjects = localStorage.getItem('continuity_projects');
        if (savedProjects) setProjects(JSON.parse(savedProjects));
        const savedAuditLogs = localStorage.getItem('continuity_audit_logs');
        if (savedAuditLogs) setAuditLogs(JSON.parse(savedAuditLogs));
        const savedTheme = localStorage.getItem('continuity_theme') as 'dark' | 'light' | null;
        if (savedTheme === 'light' || savedTheme === 'dark') {
          applyTheme(savedTheme);
        } else {
          applyTheme('dark');
        }
      }
    } catch {
      // ignore
    }

    refreshData();
  }, [refreshData]);

  // Global keyboard shortcuts (Cmd+K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem('continuity_current_user_id', user.id);
    } catch {
      // ignore
    }
    showToast(`Switched active perspective to ${user.name} (${user.role})`, 'info');
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    api.markNotificationRead(notifId).catch(() => {
      // ignore network errors
    });
  };

  const acceptHandoff = async (handoffId: string, signoffNote: string): Promise<boolean> => {
    try {
      // Real backend acceptance call
      await api.acceptHandoff(handoffId, signoffNote);
      await refreshData();
      showToast(`Lossless handoff verified on Spring Boot ledger. Primary ownership transferred to you.`, 'success');
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      // If backend throws an authorization or business error
      if (error?.message && !error.message.includes('Failed to fetch')) {
        showToast(error.message, 'error');
        return false;
      }

      // Offline optimistic fallback
      const targetHandoff = handoffs.find((h) => h.id === handoffId);
      if (!targetHandoff) return false;

      const acceptedTimestamp = new Date().toISOString();
      const updatedHandoffs = handoffs.map((h) => {
        if (h.id === handoffId) {
          return {
            ...h,
            status: 'Accepted' as const,
            acceptedAt: acceptedTimestamp,
            auditTrail: [
              ...h.auditTrail,
              {
                action: 'HANDOFF_ACCEPTED',
                actor: currentUser.name,
                timestamp: new Date().toUTCString(),
                detail: `Verified losslessness, attested runbook readiness, and assumed ownership. Attestation: "${signoffNote}"`,
                hash: Math.random().toString(16).substring(2, 18),
              },
            ],
          };
        }
        return h;
      });

      const updatedProjects = projects.map((p) => {
        if (p.id === targetHandoff.projectId) {
          return {
            ...p,
            ownerId: targetHandoff.recipientId,
            status: 'Active' as const,
            updatedAt: acceptedTimestamp,
          };
        }
        return p;
      });

      setHandoffs(updatedHandoffs);
      setProjects(updatedProjects);
      showToast(`Lossless handoff verified. Primary ownership of ${targetHandoff.projectName} transferred to you.`, 'success');
      return true;
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
      const created = await api.createHandoff(payload.projectId, payload);
      await refreshData();
      showToast(`Handoff package ${created.id} compiled and dispatched.`, 'success');
      return created;
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.message && !error.message.includes('Failed to fetch')) {
        showToast(error.message, 'error');
      }

      // Offline optimistic fallback
      const project = projects.find((p) => p.id === payload.projectId) || projects[0];
      const latestVersion = project.versions[0] || { id: 'v1.0.0', hash: '1234567' };
      const newId = `HO-2026-${Math.floor(100 + Math.random() * 899)}`;

      const newHandoff: HandoffPackage = {
        id: newId,
        projectId: project.id,
        projectName: project.name,
        senderId: currentUser.id,
        recipientId: payload.recipientId,
        pinnedVersionId: latestVersion.id,
        pinnedVersionHash: latestVersion.hash,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        note: payload.note,
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
            timestamp: new Date().toUTCString(),
            detail: `Generated transfer dossier for ${project.name} (version ${latestVersion.id}).`,
            hash: Math.random().toString(16).substring(2, 18),
          },
        ],
      };

      setHandoffs([newHandoff, ...handoffs]);
      showToast(`Handoff package ${newId} compiled and dispatched.`, 'success');
      return newHandoff;
    }
  };

  const createProject = async (payload: Partial<Project>): Promise<Project> => {
    try {
      const created = await api.createProject(payload);
      await refreshData();
      showToast(`Initialized workspace ${created.name}`, 'success');
      return created;
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error?.message || 'Failed to create project', 'error');
      throw err;
    }
  };

  const uploadVersion = async (projectId: string, formData: FormData): Promise<ProjectVersion> => {
    try {
      const created = await api.uploadVersion(projectId, formData);
      await refreshData();
      showToast(`Snapshot ${created.id} committed and indexed successfully.`, 'success');
      return created;
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error?.message || 'Version upload failed', 'error');
      throw err;
    }
  };

  const updateTaskStatus = async (projectId: string, taskId: string, newStatus: Task['status']) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      await refreshData();
      showToast(`Updated task ${taskId} to ${newStatus}`, 'info');
    } catch {
      // Local fallback
      const updatedProjects = projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
          };
        }
        return p;
      });
      setProjects(updatedProjects);
      showToast(`Updated task ${taskId} to ${newStatus}`, 'info');
    }
  };

  const addProjectDecision = async (projectId: string, decision: Omit<ArchitectureDecision, 'id'>) => {
    try {
      await api.addDecision(projectId, decision);
      await refreshData();
      showToast(`Registered architectural decision`, 'success');
    } catch {
      const newId = `ADR-0${Math.floor(45 + Math.random() * 20)}`;
      const fullDecision: ArchitectureDecision = {
        ...decision,
        id: newId,
        status: 'Accepted',
      };
      const updatedProjects = projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            decisions: [fullDecision, ...p.decisions],
          };
        }
        return p;
      });
      setProjects(updatedProjects);
      showToast(`Registered architectural decision ${newId}`, 'success');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        projects,
        handoffs,
        auditLogs,
        notifications,
        isCreateHandoffModalOpen,
        setIsCreateHandoffModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        searchQuery,
        setSearchQuery,
        acceptHandoff,
        createHandoff,
        createProject,
        uploadVersion,
        updateTaskStatus,
        addProjectDecision,
        markNotificationRead,
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
