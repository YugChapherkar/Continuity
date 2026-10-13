'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TeamRole, ProjectFile, ArchitectureDecision } from '@/lib/types';
import {
  X,
  Server,
  KeyRound,
  Database,
  ShieldCheck,
  FolderGit2,
  Terminal,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARCHITECTURE_PATTERNS = [
  {
    id: 'raft-consensus',
    title: 'Distributed Consensus (Raft)',
    description: 'Leader election, state replication, and zero-loss WAL journal buffering.',
    icon: Server,
    defaultFile: 'consensus_node.rs',
    defaultCommand: './bin/node --cluster-id 0x9F4 --raft-port 9090',
    defaultAdrTitle: 'ADR-001: Adopt Raft Consensus for Replicated State Machine',
  },
  {
    id: 'zero-trust-mesh',
    title: 'Zero-Trust Security Mesh',
    description: 'Workload identity attestation, dynamic credential injection, and strict mTLS.',
    icon: KeyRound,
    defaultFile: 'identity_mesh.go',
    defaultCommand: './bin/mesh-agent --spiffe-socket /tmp/spire-agent.sock',
    defaultAdrTitle: 'ADR-001: Enforce Strict SPIFFE/SPIRE Workload Attestation',
  },
  {
    id: 'in-memory-cache',
    title: 'Tiered In-Memory Storage',
    description: 'Sub-millisecond memory ring with NVMe flash offload and consistent hashing.',
    icon: Database,
    defaultFile: 'cache_engine.cpp',
    defaultCommand: './bin/cache-server --port 6380 --maxmemory 64gb',
    defaultAdrTitle: 'ADR-001: Consistent Hashing with NVMe Tier Offloading',
  },
  {
    id: 'cryptographic-ledger',
    title: 'Merkle Ledger Chain',
    description: 'Append-only Merkle hash chain recording state transitions and custody invariants.',
    icon: ShieldCheck,
    defaultFile: 'merkle_chain.rs',
    defaultCommand: './bin/ledger-daemon --verify-chain --strict-epoch',
    defaultAdrTitle: 'ADR-001: SHA-256 Merkle Invariant Verification on State Commits',
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

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const { currentUser, createProject, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'basics' | 'architecture'>('basics');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [domain, setDomain] = useState(ENGINEERING_DOMAINS[0]);
  const [status, setStatus] = useState<'Active' | 'Transitioning' | 'Review Needed' | 'Stable'>('Active');
  const [versionTag, setVersionTag] = useState('v1.0.0');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [selectedPattern, setSelectedPattern] = useState(ARCHITECTURE_PATTERNS[0]);
  const [runbookCommand, setRunbookCommand] = useState(ARCHITECTURE_PATTERNS[0].defaultCommand);

  if (!isOpen) return null;

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
  };

  const handleSelectPattern = (pat: typeof ARCHITECTURE_PATTERNS[0]) => {
    setSelectedPattern(pat);
    setRunbookCommand(pat.defaultCommand);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter a workspace name.', 'error');
      setActiveTab('basics');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedId =
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `ws-${Date.now()}`;

      const seedFile: ProjectFile = {
        name: selectedPattern.defaultFile,
        path: `src/${selectedPattern.defaultFile}`,
        size: '2.4 KB',
        type: 'code',
        contentSnippet: `// ${name} Architecture Seed\n// Pattern: ${selectedPattern.title}\n\nfn initialize_workspace() {\n    println!("Workspace ${name} initialized.");\n}`,
      };

      const initialAdr: ArchitectureDecision = {
        id: 'ADR-001',
        title: selectedPattern.defaultAdrTitle,
        date: new Date().toISOString().split('T')[0],
        context: `Workspace initialized for ${name} under ${selectedPattern.title} architecture specification.`,
        decision: `Adopt ${selectedPattern.title} architecture specification to guarantee lossless operations, high availability, and deterministic shift rotation.`,
        consequences: `Establishes verified governance baseline and deterministic shift handover protocol.`,
        status: 'Accepted',
      };

      const teamRoster = [
        {
          userId: currentUser.id,
          role: 'Lead' as TeamRole,
          responsibility: 'Workspace Architect & Custodian',
          joinedAt: new Date().toISOString(),
          isPrimaryOnCall: true,
        },
      ];

      const created = await createProject({
        id: generatedId,
        name: name.trim(),
        description:
          missionDescription.trim() ||
          `${name} - Governed ${domain} system under ${selectedPattern.title} architecture specification.`,
        team: domain,
        teamDescription: `Dedicated pod collaborating on ${name}, ensuring zero-loss handoffs.`,
        teamChannel: `#${generatedId}-pod`,
        status,
        currentVersionId: versionTag || 'v1.0.0',
        ownerId: currentUser.id,
        repositoryUrl: repositoryUrl || `github.com/internal-corp/${generatedId}`,
        architectureSummary: `Architecture Pattern: ${selectedPattern.title}\n\nMission Scope:\n${missionDescription || 'Initial architecture registered during workspace creation.'}`,
        quickstartGuide: runbookCommand || './bin/run --env staging',
        decisions: [initialAdr],
        teamMembers: teamRoster,
        files: [seedFile],
      });

      onClose();
      router.push(`/projects/${created.id}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error creating workspace', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0D0F11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Workspace Governance
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Create Engineering Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Establish a new governed project workspace with architectural baseline.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('basics')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'basics'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-white dark:bg-[#0D0F11]'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1. Identity &amp; Pod Scope
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'architecture'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold bg-white dark:bg-[#0D0F11]'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2. Architecture &amp; Runbook
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Workspace / Repository Name <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyperion Observability Mesh"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    Engineering Domain / Pod
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {ENGINEERING_DOMAINS.map((dom) => (
                      <option key={dom} value={dom} className="bg-white dark:bg-[#0D0F11]">
                        {dom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    Initial Lifecycle Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Active" className="bg-white dark:bg-[#0D0F11]">Active (In Execution)</option>
                    <option value="Transitioning" className="bg-white dark:bg-[#0D0F11]">Transitioning (Shift Handover Open)</option>
                    <option value="Review Needed" className="bg-white dark:bg-[#0D0F11]">Review Needed</option>
                    <option value="Stable" className="bg-white dark:bg-[#0D0F11]">Stable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    Initial Version Tag
                  </label>
                  <input
                    type="text"
                    placeholder="v1.0.0"
                    value={versionTag}
                    onChange={(e) => setVersionTag(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    Internal Repository URL
                  </label>
                  <input
                    type="text"
                    placeholder="github.com/internal-corp/workspace"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Mission Scope &amp; Deliverable Goals
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the system purpose, architectural deliverables, and success invariants..."
                  value={missionDescription}
                  onChange={(e) => setMissionDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Select Architectural Pattern Baseline
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ARCHITECTURE_PATTERNS.map((pattern) => {
                    const Icon = pattern.icon;
                    const isSelected = selectedPattern.id === pattern.id;
                    return (
                      <div
                        key={pattern.id}
                        onClick={() => handleSelectPattern(pattern)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-500 dark:border-blue-500'
                            : 'bg-slate-50 dark:bg-[#141718] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Icon
                                className={`w-4 h-4 ${
                                  isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                                }`}
                              />
                              <span className="font-semibold text-slate-900 dark:text-white text-xs">
                                {pattern.title}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                            {pattern.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Default Runbook / Test Execution Command
                </label>
                <div className="relative">
                  <Terminal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={runbookCommand}
                    onChange={(e) => setRunbookCommand(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141718] border border-slate-200 dark:border-white/10 space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white text-xs block">
                  Seed Architecture Artifacts Included:
                </span>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  &bull; <span className="font-mono text-slate-700 dark:text-slate-300">src/{selectedPattern.defaultFile}</span> (Stub implementation)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  &bull; <span className="font-mono text-slate-700 dark:text-slate-300">{selectedPattern.defaultAdrTitle}</span> (Initial ADR)
                </p>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            {activeTab === 'architecture' ? (
              <button
                type="button"
                onClick={() => setActiveTab('basics')}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <div className="flex items-center gap-2">
              {activeTab === 'basics' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) {
                      showToast('Please enter a workspace name.', 'error');
                      return;
                    }
                    setActiveTab('architecture');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Next: Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Creating...' : 'Create Workspace'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
