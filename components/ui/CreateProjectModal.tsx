'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { TeamRole, ProjectFile, ArchitectureDecision } from '@/lib/types';
import {
  X,
  Layers,
  ShieldCheck,
  Users,
  Terminal,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Server,
  KeyRound,
  Database,
  Radio,
  FileCode,
  BadgeCheck,
  Plus,
  Search,
} from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARCHITECTURE_PATTERNS = [
  {
    id: 'raft-consensus',
    title: 'Distributed Consensus (Raft / Paxos)',
    description: 'High-availability leader elections, monotonic state replication, and zero-loss WAL journal write buffers.',
    icon: Server,
    defaultFile: 'consensus_node.rs',
    defaultCommand: './bin/node --cluster-id 0x9F4 --raft-port 9090',
    defaultAdrTitle: 'ADR-001: Adopt Monotonic Raft Consensus for Replicated State Machine',
  },
  {
    id: 'zero-trust-mesh',
    title: 'Zero-Trust Security & Identity Mesh',
    description: 'SPIFFE/SPIRE workload attestation, dynamic ephemeral credential injection, and strict mTLS.',
    icon: KeyRound,
    defaultFile: 'identity_mesh.go',
    defaultCommand: './bin/mesh-agent --spiffe-socket /tmp/spire-agent.sock',
    defaultAdrTitle: 'ADR-001: Enforce Strict SPIFFE/SPIRE Workload Identity Attestation',
  },
  {
    id: 'in-memory-cache',
    title: 'Low-Latency Tiered In-Memory Storage',
    description: 'Sub-100 microsecond memory ring with NVMe flash offloading and virtual-node consistent hashing.',
    icon: Database,
    defaultFile: 'cache_engine.cpp',
    defaultCommand: './bin/cache-server --port 6380 --maxmemory 64gb',
    defaultAdrTitle: 'ADR-001: Implement Jump Consistent Hashing with NVMe Tier Offloading',
  },
  {
    id: 'cryptographic-ledger',
    title: 'Cryptographic Merkle Ledger Chain',
    description: 'Tamper-evident append-only Merkle hash chain recording state transitions and custody invariants.',
    icon: ShieldCheck,
    defaultFile: 'merkle_chain.rs',
    defaultCommand: './bin/ledger-daemon --verify-chain --strict-epoch',
    defaultAdrTitle: 'ADR-001: SHA-256 Merkle Invariant Verification on Every State Commit',
  },
];

const ENGINEERING_DOMAINS = [
  'Core Distributed Systems',
  'Cloud Infrastructure & SRE',
  'Platform Security & Identity',
  'Data Storage & Cache Tier',
  'Edge Networking & Gateways',
  'Developer Experience & Tooling',
];

const STANDARD_INVARIANTS = [
  'p99 latency < 5ms under peak cluster load',
  'Zero data loss on node partition or unexpected crash',
  'Strict mutual TLS verification on all peer connections',
  '100% cryptographic SHA-256 hash validation on state mutations',
  'Automated rollback on leader heartbeat timeout (>350ms)',
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const { users, currentUser, createProject, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1: Identity & Governance
  const [name, setName] = useState('');
  const [domain, setDomain] = useState(ENGINEERING_DOMAINS[0]);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [status, setStatus] = useState<'Active' | 'Transitioning' | 'Review Needed' | 'Stable'>('Active');
  const [versionTag, setVersionTag] = useState('v1.0.0');

  // STEP 2: Architecture & Invariants
  const [selectedPattern, setSelectedPattern] = useState(ARCHITECTURE_PATTERNS[0]);
  const [missionDescription, setMissionDescription] = useState('');
  const [selectedInvariants, setSelectedInvariants] = useState<string[]>([
    STANDARD_INVARIANTS[0],
    STANDARD_INVARIANTS[1],
  ]);
  const [customInvariant, setCustomInvariant] = useState('');
  const [adrTitle, setAdrTitle] = useState(ARCHITECTURE_PATTERNS[0].defaultAdrTitle);
  const [adrDecision, setAdrDecision] = useState(
    'Adopt this architecture specification to guarantee lossless operations, high availability, and deterministic failover.'
  );

  // STEP 3: Team Pod & Custody
  const [selectedTeammates, setSelectedTeammates] = useState<
    { userId: string; role: TeamRole; responsibility: string }[]
  >([]);
  const [primaryOnCallUserId, setPrimaryOnCallUserId] = useState<string>(currentUser.id);
  const [teamChannel, setTeamChannel] = useState('');
  const [colleagueSearch, setColleagueSearch] = useState('');

  // STEP 4: Runbook & Initial File
  const [runbookCommand, setRunbookCommand] = useState(ARCHITECTURE_PATTERNS[0].defaultCommand);
  const [seedFileName, setSeedFileName] = useState(ARCHITECTURE_PATTERNS[0].defaultFile);
  const [seedFileContent, setSeedFileContent] = useState(`// ${ARCHITECTURE_PATTERNS[0].defaultFile}
// Initial architecture specification & system invariants

pub struct WorkspaceEngine {
    pub node_id: String,
    pub is_active: bool,
}

impl WorkspaceEngine {
    pub fn new(node_id: String) -> Self {
        println!("Initialized workspace engine for node {}", node_id);
        Self { node_id, is_active: true }
    }
}
`);

  if (!isOpen) return null;

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!repositoryUrl || repositoryUrl.includes('github.com/internal-corp/')) {
      setRepositoryUrl(`github.com/internal-corp/${slug || 'workspace'}`);
    }
    if (!teamChannel || teamChannel.startsWith('#')) {
      setTeamChannel(`#${slug || 'pod'}-dev`);
    }
  };

  const handlePatternChange = (pat: typeof ARCHITECTURE_PATTERNS[0]) => {
    setSelectedPattern(pat);
    setRunbookCommand(pat.defaultCommand);
    setSeedFileName(pat.defaultFile);
    setAdrTitle(pat.defaultAdrTitle);
  };

  const toggleInvariant = (inv: string) => {
    setSelectedInvariants((prev) =>
      prev.includes(inv) ? prev.filter((i) => i !== inv) : [...prev, inv]
    );
  };

  const addCustomInvariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInvariant.trim()) return;
    if (!selectedInvariants.includes(customInvariant.trim())) {
      setSelectedInvariants((prev) => [...prev, customInvariant.trim()]);
    }
    setCustomInvariant('');
  };

  const toggleTeammate = (user: typeof users[0]) => {
    const exists = selectedTeammates.some((t) => t.userId === user.id);
    if (exists) {
      setSelectedTeammates((prev) => prev.filter((t) => t.userId !== user.id));
      if (primaryOnCallUserId === user.id) {
        setPrimaryOnCallUserId(currentUser.id);
      }
    } else {
      setSelectedTeammates((prev) => [
        ...prev,
        {
          userId: user.id,
          role: 'Member',
          responsibility: `Contributor in ${name || 'project'} team`,
        },
      ]);
    }
  };

  const updateTeammateRole = (userId: string, role: TeamRole) => {
    setSelectedTeammates((prev) =>
      prev.map((t) => (t.userId === userId ? { ...t, role } : t))
    );
  };

  const handleFinalSubmit = async () => {
    if (!name.trim()) {
      showToast('Please enter a workspace name', 'error');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedId = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `ws-${Date.now()}`;

      // 1. Initial Seed File
      const seedFile: ProjectFile = {
        name: seedFileName || 'main.rs',
        path: `src/${seedFileName || 'main.rs'}`,
        size: '2.4 KB',
        type: 'code',
        contentSnippet: seedFileContent,
      };

      // 2. Initial ADR
      const initialAdr: ArchitectureDecision = {
        id: 'ADR-001',
        title: adrTitle || `ADR-001: Architecture Baseline for ${name}`,
        date: new Date().toISOString().split('T')[0],
        context: `Workspace initialized for ${name}. Invariants guaranteed: ${selectedInvariants.join('; ')}.`,
        decision: adrDecision,
        consequences: `Establishes verified governance baseline and deterministic shift rotation protocol.`,
        status: 'Accepted',
      };

      // 3. Team Roster (Creator as Lead + Teammates)
      const teamRoster = [
        {
          userId: currentUser.id,
          role: 'Lead' as TeamRole,
          responsibility: 'Workspace Architect & Custodian',
          joinedAt: new Date().toISOString(),
          isPrimaryOnCall: primaryOnCallUserId === currentUser.id,
        },
        ...selectedTeammates.map((tm) => ({
          userId: tm.userId,
          role: tm.role,
          responsibility: tm.responsibility,
          joinedAt: new Date().toISOString(),
          isPrimaryOnCall: primaryOnCallUserId === tm.userId,
        })),
      ];

      // 4. Create Workspace
      const created = await createProject({
        id: generatedId,
        name: name.trim(),
        description:
          missionDescription.trim() ||
          `${name} - Governed ${domain} system under ${selectedPattern.title} architecture specification.`,
        team: domain,
        teamDescription: `Dedicated pod collaborating on ${name}, ensuring zero-loss handoffs and verified invariants.`,
        teamChannel: teamChannel || `#${generatedId}-pod`,
        status,
        currentVersionId: versionTag || 'v1.0.0',
        ownerId: currentUser.id,
        repositoryUrl: repositoryUrl || `github.com/internal-corp/${generatedId}`,
        architectureSummary: `Architecture Pattern: ${selectedPattern.title}\n\nKey Reliability Invariants:\n${selectedInvariants.map((inv) => `- ${inv}`).join('\n')}\n\nMission Scope:\n${missionDescription || 'Initial architecture registered during workspace onboarding.'}`,
        quickstartGuide: runbookCommand || './bin/run --env staging',
        decisions: [initialAdr],
        teamMembers: teamRoster,
        files: [seedFile],
      });

      onClose();
      router.push(`/projects/${created.id}`);
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0D0F11] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Step Progress */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Workspace Governance Onboarding &bull; Step {step} of 4
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {step === 1 && '1. Workspace Identity & Domain Scope'}
              {step === 2 && '2. Architecture Pattern & SLO Invariants'}
              {step === 3 && '3. Form Team Pod & Assign Custodians'}
              {step === 4 && '4. Runbook & Initial Source Spec'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="grid grid-cols-4 border-b border-white/10 text-center font-mono text-[11px] bg-white/[0.01]">
          {[
            { s: 1, label: 'Identity' },
            { s: 2, label: 'Architecture' },
            { s: 3, label: 'Team Pod' },
            { s: 4, label: 'Runbook' },
          ].map(({ s, label }) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                if (s < step || (s === 2 && name.trim())) setStep(s as 1 | 2 | 3 | 4);
              }}
              className={`py-2.5 transition-colors cursor-pointer border-b-2 ${
                step === s
                  ? 'border-blue-500 text-blue-400 font-semibold bg-blue-500/5'
                  : step > s
                  ? 'border-emerald-500 text-emerald-400 font-medium'
                  : 'border-transparent text-neutral-500'
              }`}
            >
              {s}. {label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-neutral-300">
          {/* =========================================================================
              STEP 1: IDENTITY & DOMAIN
             ========================================================================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Workspace / Repository Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyperion Observability Mesh"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Engineering Domain / Pod
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {ENGINEERING_DOMAINS.map((dom) => (
                      <option key={dom} value={dom} className="bg-[#0D0F11]">
                        {dom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Initial Lifecycle Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Active" className="bg-[#0D0F11]">Active (Production Shift)</option>
                    <option value="Transitioning" className="bg-[#0D0F11]">Transitioning (Shift Handover Open)</option>
                    <option value="Review Needed" className="bg-[#0D0F11]">Review Needed (Audit Pending)</option>
                    <option value="Stable" className="bg-[#0D0F11]">Stable (Maintenance)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Internal Repository URL / Slug
                  </label>
                  <input
                    type="text"
                    placeholder="github.com/internal-corp/repository-slug"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Baseline Release Version Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. v1.0.0"
                    value={versionTag}
                    onChange={(e) => setVersionTag(e.target.value)}
                    className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: ARCHITECTURE & INVARIANTS
             ========================================================================= */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-white mb-2">
                  Select System Architecture Pattern
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ARCHITECTURE_PATTERNS.map((pat) => {
                    const isSelected = selectedPattern.id === pat.id;
                    const IconComponent = pat.icon;
                    return (
                      <div
                        key={pat.id}
                        onClick={() => handlePatternChange(pat)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                            : 'bg-[#141718] border-white/10 hover:border-white/20 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-neutral-400'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-white">{pat.title}</h4>
                            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                              {pat.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Mission Problem Statement &amp; Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the mission objective and architectural scope of this system..."
                  value={missionDescription}
                  onChange={(e) => setMissionDescription(e.target.value)}
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Critical System Invariants &amp; SLO Guarantees
                </label>
                <div className="space-y-1.5 mb-2">
                  {STANDARD_INVARIANTS.map((inv) => {
                    const checked = selectedInvariants.includes(inv);
                    return (
                      <label
                        key={inv}
                        onClick={() => toggleInvariant(inv)}
                        className={`p-2 rounded-xl border flex items-center gap-2.5 transition-colors cursor-pointer ${
                          checked
                            ? 'bg-blue-600/10 border-blue-500/40 text-blue-200'
                            : 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded border-white/20 text-blue-600 focus:ring-0"
                        />
                        <span className="text-[11px] font-mono">{inv}</span>
                      </label>
                    );
                  })}
                </div>

                <form onSubmit={addCustomInvariant} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom invariant requirement..."
                    value={customInvariant}
                    onChange={(e) => setCustomInvariant(e.target.value)}
                    className="flex-1 bg-[#141718] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium border border-white/10"
                  >
                    + Add
                  </button>
                </form>
              </div>

              {/* Initial ADR Preview */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
                  Seed Architecture Decision Record (ADR-001)
                </span>
                <input
                  type="text"
                  value={adrTitle}
                  onChange={(e) => setAdrTitle(e.target.value)}
                  className="w-full bg-[#141718] border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: TEAM POD & CUSTODY
             ========================================================================= */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Lead & On-Call Custody */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={currentUser.name} initials={currentUser.initials} size="sm" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Lead Custodian: {currentUser.name}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {currentUser.employeeId || 'Lead'} &bull; {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    Lead Owner
                  </span>
                </div>
              </div>

              {/* Select Primary On-Call */}
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Primary Shift On-Call Responder
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryOnCallUserId(currentUser.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      primaryOnCallUserId === currentUser.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-white/5 border-white/10 text-neutral-400'
                    }`}
                  >
                    ⚡ Myself ({currentUser.name.split(' ')[0]})
                  </button>

                  {selectedTeammates.map((tm) => {
                    const u = users.find((x) => x.id === tm.userId);
                    if (!u) return null;
                    const isSelected = primaryOnCallUserId === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setPrimaryOnCallUserId(u.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                            : 'bg-white/5 border-white/10 text-neutral-400'
                        }`}
                      >
                        ⚡ {u.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colleague Multi-Select Directory */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-white">
                    Add Colleague Teammates to Pod ({selectedTeammates.length} selected)
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Company Directory
                  </span>
                </div>

                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search colleagues by name, role, or ID..."
                    value={colleagueSearch}
                    onChange={(e) => setColleagueSearch(e.target.value)}
                    className="w-full bg-[#141718] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {users
                    .filter((u) => u.id !== currentUser.id)
                    .filter((u) => {
                      const q = colleagueSearch.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        u.name.toLowerCase().includes(q) ||
                        u.role.toLowerCase().includes(q) ||
                        (u.employeeId && u.employeeId.toLowerCase().includes(q))
                      );
                    })
                    .map((user) => {
                      const isSelected = selectedTeammates.some((t) => t.userId === user.id);
                      const teammateRecord = selectedTeammates.find((t) => t.userId === user.id);

                      return (
                        <div
                          key={user.id}
                          className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-blue-600/15 border-blue-500 text-white'
                              : 'bg-[#141718] border-white/10 text-neutral-300 hover:border-white/20'
                          }`}
                        >
                          <div
                            onClick={() => toggleTeammate(user)}
                            className="flex items-center gap-2.5 cursor-pointer"
                          >
                            <Avatar name={user.name} initials={user.initials} size="xs" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold truncate">{user.name}</p>
                              <p className="text-[10px] text-neutral-400 font-mono truncate">
                                {user.employeeId || 'CNT'} &bull; {user.role}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-white/5 text-neutral-400'
                              }`}
                            >
                              {isSelected ? '✓ Added' : '+ Add'}
                            </span>
                          </div>

                          {/* Role selector if added */}
                          {isSelected && teammateRecord && (
                            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                              <span className="text-[10px] text-neutral-400 font-mono">Pod Role:</span>
                              <select
                                value={teammateRecord.role}
                                onChange={(e) =>
                                  updateTeammateRole(user.id, e.target.value as TeamRole)
                                }
                                className="bg-[#0D0F11] border border-white/10 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none cursor-pointer"
                              >
                                <option value="Member">Member</option>
                                <option value="Lead">Lead</option>
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Pod Communication Channel (Slack / Discord)
                </label>
                <input
                  type="text"
                  placeholder="#channel-name"
                  value={teamChannel}
                  onChange={(e) => setTeamChannel(e.target.value)}
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 4: RUNBOOK & SEED SOURCE SPEC
             ========================================================================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Quickstart Runbook Execution Command
                </label>
                <input
                  type="text"
                  value={runbookCommand}
                  onChange={(e) => setRunbookCommand(e.target.value)}
                  placeholder="./bin/server --config config.toml"
                  className="w-full bg-[#141718] border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                  Command executable by on-call engineers to bootstrap staging/production.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Initial Specification File Name
                  </label>
                  <input
                    type="text"
                    value={seedFileName}
                    onChange={(e) => setSeedFileName(e.target.value)}
                    placeholder="e.g. cluster_mesh.rs"
                    className="w-full bg-[#141718] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Storage Relative Path
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`src/${seedFileName}`}
                    className="w-full bg-[#141718] border border-white/10 rounded-xl p-2.5 text-xs text-neutral-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Initial Boilerplate Code / Spec
                </label>
                <textarea
                  rows={6}
                  value={seedFileContent}
                  onChange={(e) => setSeedFileContent(e.target.value)}
                  className="w-full bg-[#050608] border border-white/10 rounded-xl p-3 text-xs text-neutral-200 font-mono leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Review Snapshot Card */}
              <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/30 space-y-1.5">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">
                  Ready to Initialize
                </span>
                <p className="text-xs text-white font-medium">
                  Workspace &ldquo;{name}&rdquo; will be created with {selectedTeammates.length + 1} team members,
                  ADR-001 ratified, and seed file registered in the source tree.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-between bg-white/[0.01]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  showToast('Please enter a workspace name', 'error');
                  return;
                }
                setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating Project...' : 'Create Project'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
