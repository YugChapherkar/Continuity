'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Project, HandoffPackage, AuditLogEntry, AppNotification, Task, ArchitectureDecision } from '@/lib/types';
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_HANDOFFS, INITIAL_AUDIT_LOGS, INITIAL_NOTIFICATIONS } from '@/lib/mock-data';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  projects: Project[];
  handoffs: HandoffPackage[];
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];
  isPersonaModalOpen: boolean;
  setIsPersonaModalOpen: (open: boolean) => void;
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
  updateTaskStatus: (projectId: string, taskId: string, newStatus: Task['status']) => void;
  addProjectDecision: (projectId: string, decision: Omit<ArchitectureDecision, 'id'>) => void;
  markNotificationRead: (notifId: string) => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUserState] = useState<User>(INITIAL_USERS[0]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [handoffs, setHandoffs] = useState<HandoffPackage[]>(INITIAL_HANDOFFS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isCreateHandoffModalOpen, setIsCreateHandoffModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  // Safely restore persisted state after hydration without causing mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (typeof window === 'undefined') return;
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
      } catch {
        // storage disabled or unavailable in sandboxed iframe
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  };

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
  };

  const acceptHandoff = async (handoffId: string, signoffNote: string): Promise<boolean> => {
    const targetHandoff = handoffs.find((h) => h.id === handoffId);
    if (!targetHandoff) return false;

    const acceptedTimestamp = new Date().toISOString();
    const formattedDate = new Date().toUTCString();
    const pseudoHash = Math.random().toString(16).substring(2, 10) +
      Math.random().toString(16).substring(2, 10) +
      Math.random().toString(16).substring(2, 10) +
      Math.random().toString(16).substring(2, 10);

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
              timestamp: `${formattedDate}`,
              detail: `Verified losslessness, attested runbook readiness, and assumed ownership. Attestation: "${signoffNote}"`,
              hash: pseudoHash,
            },
          ],
        };
      }
      return h;
    });

    // Also transfer project owner to recipient
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

    const newAuditLog: AuditLogEntry = {
      id: `AUDIT-${Math.floor(8900 + Math.random() * 1000)}`,
      timestamp: formattedDate,
      hash: pseudoHash,
      prevHash: auditLogs[0]?.hash || '00000000000000000000000000000000',
      action: 'HANDOFF_ACCEPTED',
      actorId: currentUser.id,
      actorName: currentUser.name,
      projectName: targetHandoff.projectName,
      detail: `Accepted operational guardianship for dossier ${targetHandoff.id}. Owner transferred to ${currentUser.name}.`,
      verifiable: true,
    };

    const updatedAuditLogs = [newAuditLog, ...auditLogs];

    setHandoffs(updatedHandoffs);
    setProjects(updatedProjects);
    setAuditLogs(updatedAuditLogs);

    try {
      localStorage.setItem('continuity_handoffs', JSON.stringify(updatedHandoffs));
      localStorage.setItem('continuity_projects', JSON.stringify(updatedProjects));
      localStorage.setItem('continuity_audit_logs', JSON.stringify(updatedAuditLogs));
    } catch {
      // ignore
    }

    showToast(`Lossless handoff verified. Primary ownership of ${targetHandoff.projectName} transferred to you.`, 'success');
    return true;
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
    const project = projects.find((p) => p.id === payload.projectId) || projects[0];
    const latestVersion = project.versions[0] || { id: 'v1.0.0', hash: '1234567' };
    const newId = `HO-2026-${Math.floor(100 + Math.random() * 899)}`;
    const formattedDate = new Date().toUTCString();
    const pseudoHash = Math.random().toString(16).substring(2, 10) +
      Math.random().toString(16).substring(2, 10) +
      Math.random().toString(16).substring(2, 10) +
      Math.random().toString(16).substring(2, 10);

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
          timestamp: formattedDate,
          detail: `Generated transfer dossier for ${project.name} (version ${latestVersion.id}).`,
          hash: pseudoHash,
        },
      ],
    };

    const updatedHandoffs = [newHandoff, ...handoffs];
    setHandoffs(updatedHandoffs);

    const newAuditLog: AuditLogEntry = {
      id: `AUDIT-${Math.floor(8900 + Math.random() * 1000)}`,
      timestamp: formattedDate,
      hash: pseudoHash,
      prevHash: auditLogs[0]?.hash || '00000000000000000000000000000000',
      action: 'HANDOFF_INITIATED',
      actorId: currentUser.id,
      actorName: currentUser.name,
      projectName: project.name,
      detail: `Initiated handoff ${newId} with pinned commit hash ${latestVersion.hash}.`,
      verifiable: true,
    };

    const updatedAuditLogs = [newAuditLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    try {
      localStorage.setItem('continuity_handoffs', JSON.stringify(updatedHandoffs));
      localStorage.setItem('continuity_audit_logs', JSON.stringify(updatedAuditLogs));
    } catch {
      // ignore
    }

    showToast(`Handoff package ${newId} compiled and dispatched.`, 'success');
    return newHandoff;
  };

  const updateTaskStatus = (projectId: string, taskId: string, newStatus: Task['status']) => {
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
    try {
      localStorage.setItem('continuity_projects', JSON.stringify(updatedProjects));
    } catch {
      // ignore
    }
    showToast(`Updated task ${taskId} to ${newStatus}`, 'info');
  };

  const addProjectDecision = (projectId: string, decision: Omit<ArchitectureDecision, 'id'>) => {
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

    const newAuditLog: AuditLogEntry = {
      id: `AUDIT-${Math.floor(8900 + Math.random() * 1000)}`,
      timestamp: new Date().toUTCString(),
      hash: Math.random().toString(16).substring(2, 18),
      prevHash: auditLogs[0]?.hash || '00000000000000000000000000000000',
      action: 'ADR_REGISTERED',
      actorId: currentUser.id,
      actorName: currentUser.name,
      projectName: projects.find((p) => p.id === projectId)?.name || projectId,
      detail: `Registered ${newId}: ${decision.title}`,
      verifiable: true,
    };
    setAuditLogs([newAuditLog, ...auditLogs]);

    try {
      localStorage.setItem('continuity_projects', JSON.stringify(updatedProjects));
    } catch {
      // ignore
    }
    showToast(`Registered architectural decision ${newId}`, 'success');
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
        isPersonaModalOpen,
        setIsPersonaModalOpen,
        isCreateHandoffModalOpen,
        setIsCreateHandoffModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        searchQuery,
        setSearchQuery,
        acceptHandoff,
        createHandoff,
        updateTaskStatus,
        addProjectDecision,
        markNotificationRead,
        toast,
        showToast,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
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
