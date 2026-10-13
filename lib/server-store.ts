import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  User,
  Team,
  Project,
  Task,
  TaskStatus,
  EmployeeDailyUpdate,
  TeamLeadProgressReport,
  ProjectReviewSubmission,
  ReviewRound,
  ClientDeliveryRecord,
  AuditLogEntry,
  AppNotification,
  SystemRole,
  HandoffPackage,
  TaskOwnershipRecord,
  TaskComment,
  TaskBlocker,
  BlockerStatus,
  HandoffReadinessCheck,
  HandoffReadinessCriterion,
} from './types';

export interface ServerStoreData {
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
}

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'continuity_store.json');

// In-memory cache for fast SSR / API reads
let cachedData: ServerStoreData | null = null;

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function computeHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function createAuditLog(
  actorId: string,
  actorName: string,
  action: AuditLogEntry['action'],
  detail: string,
  projectName: string = 'Continuity Core',
  metadata?: Record<string, unknown>
): AuditLogEntry {
  const store = getStore();
  const prevEntry = store.auditLogs[0];
  const prevHash = prevEntry ? prevEntry.hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const timestamp = new Date().toISOString();
  const rawPayload = `${timestamp}:${actorId}:${action}:${detail}:${prevHash}`;
  const hash = computeHash(rawPayload);

  const entry: AuditLogEntry = {
    id: `AUDIT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp,
    hash,
    prevHash,
    action,
    actorId,
    actorName,
    projectName,
    detail,
    metadata,
    verifiable: true,
  };

  store.auditLogs.unshift(entry);
  return entry;
}

export function createNotification(
  title: string,
  message: string,
  type: AppNotification['type'],
  recipientId?: string,
  link?: string
): AppNotification {
  const store = getStore();
  const notif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    message,
    timestamp: 'Just now',
    read: false,
    type,
    recipientId,
    link,
  };
  store.notifications.unshift(notif);
  return notif;
}

function getInitialStore(): ServerStoreData {
  const DEFAULT_HASH = '$2b$10$cEOW.VBVo8R07lmZ1nnm1OWH1nxREglK87WyqzcJl4qwYH4TPFaEa'; // '12345678'
  const users: User[] = [
    {
      id: 'user-admin',
      name: 'Yug Chapherkar',
      email: 'admin@phx.in',
      employeeId: 'ADM-0001',
      role: 'System Administrator & Executive Sponsor',
      systemRole: 'Admin',
      accountStatus: 'Active',
      avatar: '',
      initials: 'YC',
      department: 'Platform Administration & Executive Leadership',
      bio: 'Executive platform administrator overseeing enterprise governance, team orchestration, deliverable sign-offs, and final client release delivery.',
      location: 'San Francisco, CA (HQ)',
      activeProjectsCount: 4,
      pendingHandoffsCount: 0,
      isAdmin: true,
      passwordHash: DEFAULT_HASH,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'user-marcus',
      name: 'Marcus Vance',
      email: 'lead@phx.in',
      employeeId: 'TL-1001',
      role: 'Project Lead & Staff Systems Architect',
      systemRole: 'Team Leader',
      accountStatus: 'Active',
      teamId: 'team-storage',
      avatar: '',
      initials: 'MV',
      department: 'Distributed Storage & Consensus',
      bio: 'Author of Apollo Raft consensus engine and WAL persistence tier. Leads execution across core replication components.',
      location: 'Zurich, Switzerland (CET)',
      activeProjectsCount: 2,
      pendingHandoffsCount: 0,
      passwordHash: DEFAULT_HASH,
      createdAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'user-sarah',
      name: 'Sarah Lin',
      email: 's.lin@continuity.internal',
      employeeId: 'CNT-1005',
      role: 'Principal Reliability Engineer & Team Leader',
      systemRole: 'Team Leader',
      accountStatus: 'Active',
      teamId: 'team-observability',
      avatar: '',
      initials: 'SL',
      department: 'Cloud & Edge Observability',
      bio: 'Directs edge telemetry, zero-loss SLO guardrails, and automated failover orchestration.',
      location: 'New York, NY (EST)',
      activeProjectsCount: 2,
      pendingHandoffsCount: 1,
      passwordHash: DEFAULT_HASH,
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'user-elena',
      name: 'Elena Rostova',
      email: 'e.rostova@continuity.internal',
      employeeId: 'CNT-1006',
      role: 'Staff Security Engineer & Team Leader',
      systemRole: 'Team Leader',
      accountStatus: 'Active',
      teamId: 'team-security',
      avatar: '',
      initials: 'ER',
      department: 'Auth & Zero-Trust Cryptography',
      bio: 'Oversees root certificate rotation, HSM key orchestration, and zero-knowledge identity protocols.',
      location: 'London, UK (GMT)',
      activeProjectsCount: 1,
      pendingHandoffsCount: 1,
      passwordHash: DEFAULT_HASH,
      createdAt: '2026-02-15T00:00:00Z',
    },
    {
      id: 'user-jessica',
      name: 'Jessica Chauhan',
      email: 'employee@phx.in',
      employeeId: 'CNT-1001',
      role: 'Senior Distributed Systems Engineer',
      systemRole: 'Employee',
      accountStatus: 'Active',
      teamId: 'team-storage',
      avatar: '',
      initials: 'JC',
      department: 'Platform Architecture & Core Infrastructure',
      bio: 'Core contributor to consensus replication, zero-copy kernel I/O, and rotation resilience.',
      location: 'San Francisco, CA (PST)',
      activeProjectsCount: 2,
      pendingHandoffsCount: 1,
      passwordHash: DEFAULT_HASH,
      createdAt: '2026-03-01T00:00:00Z',
    },

    {
      id: 'user-yash',
      name: 'Yash Lokhande',
      email: 'yash.lokhande@continuity.internal',
      employeeId: 'CNT-1002',
      role: 'Principal Systems Architect',
      systemRole: 'Employee',
      accountStatus: 'Active',
      teamId: 'team-storage',
      avatar: '',
      initials: 'YL',
      department: 'Distributed Systems & Consensus Core',
      bio: 'Author of Apollo Raft consensus engine and WAL persistence tier. Rotating across APAC & EMEA timezones.',
      location: 'Mumbai, IN (IST)',
      activeProjectsCount: 2,
      pendingHandoffsCount: 1,
      createdAt: '2026-03-15T00:00:00Z',
    },
    {
      id: 'user-shruti',
      name: 'Shruti Patil',
      email: 'shruti.patil@continuity.internal',
      employeeId: 'CNT-1003',
      role: 'Lead Site Reliability Engineer',
      systemRole: 'Employee',
      accountStatus: 'Active',
      teamId: 'team-observability',
      avatar: '',
      initials: 'SP',
      department: 'Cloud & Edge Reliability Infrastructure',
      bio: 'Specialist in zero-loss shift rotations, kernel observability guardrails, and automated failover orchestration.',
      location: 'Pune, IN (IST)',
      activeProjectsCount: 2,
      pendingHandoffsCount: 1,
      createdAt: '2026-04-01T00:00:00Z',
    },
    {
      id: 'user-david',
      name: 'David Kim',
      email: 'd.kim@continuity.internal',
      employeeId: 'CNT-1007',
      role: 'Senior Security & Cryptography Engineer',
      systemRole: 'Employee',
      accountStatus: 'Active',
      teamId: 'team-security',
      avatar: '',
      initials: 'DK',
      department: 'Auth & Zero-Trust Cryptography',
      bio: 'Specialist in WebAuthn hardware token attestation and public key infrastructure hardening.',
      location: 'Seattle, WA (PST)',
      activeProjectsCount: 1,
      pendingHandoffsCount: 0,
      createdAt: '2026-04-15T00:00:00Z',
    },
    {
      id: 'user-alex',
      name: 'Alex Chen',
      email: 'a.chen@continuity.internal',
      employeeId: 'CNT-1008',
      role: 'Senior Observability Systems Engineer',
      systemRole: 'Employee',
      accountStatus: 'Active',
      teamId: 'team-observability',
      avatar: '',
      initials: 'AC',
      department: 'Cloud & Edge Observability',
      bio: 'High-performance eBPF probes, kernel telemetry exporters, and distributed trace aggregators.',
      location: 'Austin, TX (CST)',
      activeProjectsCount: 1,
      pendingHandoffsCount: 0,
      createdAt: '2026-05-01T00:00:00Z',
    },
  ];

  const teams: Team[] = [
    {
      id: 'team-storage',
      name: 'Consensus & Distributed Storage Pod',
      description: 'Distributed systems engineers responsible for Raft state machine replication, WAL disk persistence, and cross-datacenter linearizability.',
      department: 'Core Infrastructure',
      status: 'Active',
      leaderId: 'user-marcus',
      leaderName: 'Marcus Vance',
      memberIds: ['user-marcus', 'user-jessica', 'user-yash'],
      createdAt: '2026-01-15T08:00:00Z',
      updatedAt: '2026-10-10T12:00:00Z',
    },
    {
      id: 'team-observability',
      name: 'Edge Reliability & Telemetry Fleet',
      description: 'Site reliability engineers managing real-time eBPF trace mesh, kernel health probes, and automated disaster failover circuits.',
      department: 'Site Reliability',
      status: 'Active',
      leaderId: 'user-sarah',
      leaderName: 'Sarah Lin',
      memberIds: ['user-sarah', 'user-shruti', 'user-alex'],
      createdAt: '2026-02-01T09:00:00Z',
      updatedAt: '2026-10-11T14:30:00Z',
    },
    {
      id: 'team-security',
      name: 'Zero-Trust Identity & Crypto Guard',
      description: 'Security engineers building WebAuthn attestation, cryptographic audit ledgers, and automated mTLS root certificate rotations.',
      department: 'Security & Compliance',
      status: 'Active',
      leaderId: 'user-elena',
      leaderName: 'Elena Rostova',
      memberIds: ['user-elena', 'user-david'],
      createdAt: '2026-02-15T10:00:00Z',
      updatedAt: '2026-10-09T18:00:00Z',
    },
  ];

  const projects: Project[] = [
    {
      id: 'apollo-core',
      name: 'Apollo Core Distributed Consensus',
      description: 'High-throughput Raft state machine and distributed write-ahead log (WAL) powering multi-region state synchronization.',
      client: 'Apex Financial Technologies LLC',
      scope: 'Multi-datacenter zero-loss consensus engine with sub-2ms commit latency under high transaction volume.',
      expectedDeliverables: [
        'Production Raft consensus binary with io_uring WAL flush engine',
        'Failover testing report demonstrating zero data loss at 100k writes/sec',
        'Operational runbook, deployment Helm charts, and Prometheus dashboards',
      ],
      startDate: '2026-06-01',
      deadline: '2026-11-15',
      priority: 'P0',
      budget: '$240,000',
      teamId: 'team-storage',
      teamLeaderId: 'user-marcus',
      stakeholders: ['Dr. Arthur Hayes (CTO, Apex Financial)', 'Alexander Ward (Admin)'],
      acceptanceCriteria: 'Linearizable reads verified via Jepsen test suite; p99 write latency <= 2ms; automated failover under 500ms.',
      status: 'Active',
      health: 'Green',
      healthReasons: ['All 4 milestone targets on schedule', 'No unresolved critical blockers'],
      currentVersionId: 'v2.4.0',
      ownerId: 'user-marcus',
      team: 'Consensus & Distributed Storage Pod',
      teamDescription: 'Distributed systems engineers responsible for Raft state machine replication and WAL disk persistence.',
      teamChannel: '#team-apollo-consensus',
      teamMembers: [
        { userId: 'user-marcus', role: 'Lead', responsibility: 'Author of Apollo Raft consensus engine & WAL persistence layer', joinedAt: '2026-01-15' },
        { userId: 'user-jessica', role: 'Member', responsibility: 'Zero-loss rotation custodian & kernel IO verification', joinedAt: '2026-03-20', isPrimaryOnCall: true },
        { userId: 'user-yash', role: 'Member', responsibility: 'WAL memory-mapped IO and replication throughput benchmarks', joinedAt: '2026-05-10' },
      ],
      repositoryUrl: 'github.com/internal-corp/apollo-core',
      architectureSummary: 'Apollo Core is a linearizable quorum-based replicated log engine written in Rust with C-bindings for node telemetry.',
      quickstartGuide: './bin/apollo-node --cluster-id 0x9F4 --raft-port 9090',
      milestones: [
        { id: 'm-1', projectId: 'apollo-core', title: 'Phase 1: io_uring WAL Pipeline Implementation', deadline: '2026-08-30', status: 'Completed', order: 1 },
        { id: 'm-2', projectId: 'apollo-core', title: 'Phase 2: Chaos Mesh Partition & Split-Brain Validation', deadline: '2026-10-20', status: 'In Progress', order: 2 },
        { id: 'm-3', projectId: 'apollo-core', title: 'Phase 3: Production Hardening & Multi-DC Benchmarking', deadline: '2026-11-10', status: 'Planned', order: 3 },
      ],
      decisions: [
        {
          id: 'ADR-041',
          title: 'Adopt Speculative Read Barriers to Minimize Leader RTT',
          date: '2026-09-28',
          context: 'Under high geographical latency, linearizable reads required full round-trip consensus to the leader, creating an artificial p99 spike.',
          decision: 'Implemented monotonic read-lease epochs verified locally on follower nodes using synchronized monotonic clock drifts bounded by Chrony NTP.',
          consequences: 'Read throughput increased by 310%. Follower leases expire in 80ms if heartbeat is missed.',
          status: 'Accepted',
        },
        {
          id: 'ADR-039',
          title: 'Migrate WAL Disk Flush from POSIX sync to io_uring Async Ring',
          date: '2026-08-14',
          context: 'Fsync syscall locks on high NVMe contention were stalling log replication threads during bursts.',
          decision: 'Replaced synchronous thread pool with dedicated submission and completion rings in Linux io_uring kernel subsystem.',
          consequences: 'Eliminated thread context switches. Maximum throughput increased to 125k ops/sec.',
          status: 'Accepted',
        },
      ],
      versions: [
        {
          id: 'v2.4.0',
          hash: 'a9f82c1',
          timestamp: '2026-10-10 22:15 UTC',
          author: { name: 'Marcus Vance', avatar: '' },
          commitMessage: 'feat(consensus): implement epoch-based monotonic read barrier & io_uring flush',
          changedFilesCount: 14,
          changedFiles: [
            { path: 'src/consensus/raft_state.rs', insertions: 142, deletions: 38 },
            { path: 'src/wal/journal_uring.rs', insertions: 310, deletions: 12 },
          ],
        },
      ],
      tasks: [
        {
          id: 'TASK-101',
          projectId: 'apollo-core',
          projectName: 'Apollo Core Distributed Consensus',
          milestoneId: 'm-2',
          milestoneTitle: 'Phase 2: Chaos Mesh Partition & Split-Brain Validation',
          title: 'Verify io_uring kernel compatibility on staging-us-west fleet',
          description: 'Ensure kernel 6.1 LTS is active and user-space memlock limits are raised to unlimited in systemd service definitions.',
          status: 'In Progress',
          priority: 'P0',
          assignee: 'Jessica Chauhan',
          assigneeId: 'user-jessica',
          creatorId: 'user-marcus',
          creatorName: 'Marcus Vance',
          startDate: '2026-10-08',
          dueDate: '2026-10-15',
          deadline: '2026-10-15',
          estimatedEffortHours: 16,
          dependencies: [],
          acceptanceCriteria: 'Systemd memlock configured; zero io_uring registration errors observed during 48h soak test.',
          evidenceUrls: ['https://monitoring.internal/dashboards/io-uring-fleet'],
          latestUpdate: 'Tested 3 nodes in us-west-1. Registration successful. Running 48h soak test.',
          history: [
            { timestamp: '2026-10-08T10:00:00Z', actorId: 'user-marcus', actorName: 'Marcus Vance', fromStatus: 'To Do', toStatus: 'In Progress', note: 'Assigned to Jessica for validation' },
          ],
          createdAt: '2026-10-08T09:30:00Z',
          updatedAt: '2026-10-11T16:00:00Z',
        },
        {
          id: 'TASK-102',
          projectId: 'apollo-core',
          projectName: 'Apollo Core Distributed Consensus',
          milestoneId: 'm-2',
          milestoneTitle: 'Phase 2: Chaos Mesh Partition & Split-Brain Validation',
          title: 'Run Chaos Mesh partition test for 4-node split-brain simulation',
          description: 'Verify cluster drops stale leader and elects new leader in < 350ms during asymmetric packet drops.',
          status: 'In Progress',
          priority: 'P1',
          assignee: 'Jessica Chauhan',
          assigneeId: 'user-jessica',
          creatorId: 'user-marcus',
          creatorName: 'Marcus Vance',
          startDate: '2026-10-09',
          dueDate: '2026-10-18',
          deadline: '2026-10-18',
          estimatedEffortHours: 24,
          dependencies: ['TASK-101'],
          acceptanceCriteria: 'No dirty reads or phantom writes during 10 consecutive simulated partition injections.',
          latestUpdate: 'Chaos Mesh YAML test scripts drafted. Ready to execute once staging fleet soak finishes.',
          history: [],
          createdAt: '2026-10-09T11:00:00Z',
        },
        {
          id: 'TASK-103',
          projectId: 'apollo-core',
          projectName: 'Apollo Core Distributed Consensus',
          milestoneId: 'm-2',
          milestoneTitle: 'Phase 2: Chaos Mesh Partition & Split-Brain Validation',
          title: 'Benchmark follower read barrier latency under 80k rps load',
          description: 'Waiting for staging load balancer VIP provisioning in VPC-04.',
          status: 'Blocked',
          priority: 'P1',
          assignee: 'Yash Lokhande',
          assigneeId: 'user-yash',
          creatorId: 'user-marcus',
          creatorName: 'Marcus Vance',
          startDate: '2026-10-07',
          dueDate: '2026-10-16',
          deadline: '2026-10-16',
          estimatedEffortHours: 20,
          dependencies: [],
          acceptanceCriteria: 'P99 read latency under 1.5ms across 80k requests/sec.',
          latestUpdate: 'Blocked on staging load balancer DNS propagation. Escalated to networking team.',
          history: [
            { timestamp: '2026-10-10T14:00:00Z', actorId: 'user-yash', actorName: 'Yash Lokhande', fromStatus: 'In Progress', toStatus: 'Blocked', note: 'Awaiting VIP routing' },
          ],
          createdAt: '2026-10-07T08:00:00Z',
          updatedAt: '2026-10-10T14:00:00Z',
        },
        {
          id: 'TASK-104',
          projectId: 'apollo-core',
          projectName: 'Apollo Core Distributed Consensus',
          milestoneId: 'm-1',
          milestoneTitle: 'Phase 1: io_uring WAL Pipeline Implementation',
          title: 'Update Prometheus alerting rule for apollo_wal_flush_p99_micros',
          description: 'Threshold adjusted from 5000us to 2500us following io_uring upgrade.',
          status: 'Completed',
          priority: 'P2',
          assignee: 'Jessica Chauhan',
          assigneeId: 'user-jessica',
          creatorId: 'user-marcus',
          creatorName: 'Marcus Vance',
          startDate: '2026-10-05',
          dueDate: '2026-10-07',
          deadline: '2026-10-07',
          estimatedEffortHours: 4,
          dependencies: [],
          acceptanceCriteria: 'Prometheus rule deployed to production Alertmanager cluster.',
          evidenceUrls: ['https://git.internal/infra/alerts/commit/9f01bc4'],
          latestUpdate: 'Alert rule active in production and verified via blackbox test.',
          history: [
            { timestamp: '2026-10-07T16:00:00Z', actorId: 'user-jessica', actorName: 'Jessica Chauhan', fromStatus: 'In Progress', toStatus: 'Completed', note: 'Prometheus alert deployed' },
          ],
          createdAt: '2026-10-05T10:00:00Z',
          updatedAt: '2026-10-07T16:00:00Z',
        },
      ],
      files: [
        {
          name: 'raft_state.rs',
          path: 'src/consensus/raft_state.rs',
          size: '14.2 KB',
          type: 'code',
          contentSnippet: '// Apollo Raft Node Core State Machine\npub struct RaftStateMachine {\n    current_term: u64,\n    commit_index: CommitIndex,\n}',
        },
      ],
      updatedAt: '2026-10-11T05:30:00Z',
    },
    {
      id: 'chronos-ledger',
      name: 'Chronos Immutable Audit Ledger',
      description: 'Zero-knowledge verifiable append-only ledger for cryptographic proof of platform operations and rotation sign-offs.',
      client: 'Global HealthMesh Alliance',
      scope: 'Tamper-evident regulatory audit trail compliance with HIPAA and ISO 27001 requirements.',
      expectedDeliverables: [
        'Immutable cryptographic ledger cluster with Merkle root verification',
        'REST & gRPC proof verification APIs',
        'Third-party security audit certification documentation',
      ],
      startDate: '2026-05-15',
      deadline: '2026-10-25',
      priority: 'P0',
      budget: '$310,000',
      teamId: 'team-observability',
      teamLeaderId: 'user-sarah',
      stakeholders: ['Dr. Evelyn Vance (Chief Compliance Officer)', 'Alexander Ward (Admin)'],
      acceptanceCriteria: 'Merkle inclusion proofs verified under 15ms; tamper detection instantaneous; 100% test coverage on cryptographic signature verification.',
      status: 'Changes Requested',
      health: 'At Risk',
      healthReasons: [
        'Admin requested security revisions on Round 1 deliverable submission',
        'Deadline approaching in 13 days',
      ],
      currentVersionId: 'v1.2.0-rc3',
      ownerId: 'user-sarah',
      team: 'Edge Reliability & Telemetry Fleet',
      teamDescription: 'Site reliability engineers managing real-time eBPF trace mesh and automated disaster failover.',
      teamChannel: '#team-chronos-audit',
      teamMembers: [
        { userId: 'user-sarah', role: 'Lead', responsibility: 'Ledger architecture and zero-knowledge proof generation', joinedAt: '2026-02-01' },
        { userId: 'user-shruti', role: 'Member', responsibility: 'Merkle root verification & distributed storage replication', joinedAt: '2026-04-01' },
        { userId: 'user-alex', role: 'Member', responsibility: 'High-throughput append logging & telemetry exporters', joinedAt: '2026-05-01' },
      ],
      repositoryUrl: 'github.com/internal-corp/chronos-ledger',
      architectureSummary: 'Chronos utilizes SHA-256 Merkle mountain ranges backed by append-only memory-mapped journal blocks.',
      quickstartGuide: './bin/chronos-server --data-dir /var/lib/chronos --merkle-depth 32',
      milestones: [
        { id: 'm-ch-1', projectId: 'chronos-ledger', title: 'Merkle Mountain Range Core Engine', deadline: '2026-07-30', status: 'Completed', order: 1 },
        { id: 'm-ch-2', projectId: 'chronos-ledger', title: 'Cryptographic Proof Verifier Service', deadline: '2026-09-30', status: 'Completed', order: 2 },
        { id: 'm-ch-3', projectId: 'chronos-ledger', title: 'Security Hardening & Revision Remediation', deadline: '2026-10-20', status: 'In Progress', order: 3 },
      ],
      decisions: [],
      versions: [
        {
          id: 'v1.2.0-rc3',
          hash: 'c891e42',
          timestamp: '2026-10-09 18:30 UTC',
          author: { name: 'Sarah Lin', avatar: '' },
          commitMessage: 'fix(crypto): remediate Merkle leaf edge padding ambiguity',
          changedFilesCount: 6,
          changedFiles: [{ path: 'src/merkle/mmr.rs', insertions: 84, deletions: 22 }],
        },
      ],
      tasks: [
        {
          id: 'TASK-201',
          projectId: 'chronos-ledger',
          projectName: 'Chronos Immutable Audit Ledger',
          milestoneId: 'm-ch-3',
          milestoneTitle: 'Security Hardening & Revision Remediation',
          title: 'Remediate Admin Revision: Add zero-knowledge boundary proof for client tenant isolation',
          description: 'Alexander Ward requested explicit boundary verification in Round 1 final review before client delivery signoff.',
          status: 'In Progress',
          priority: 'P0',
          assignee: 'Shruti Patil',
          assigneeId: 'user-shruti',
          creatorId: 'user-sarah',
          creatorName: 'Sarah Lin',
          startDate: '2026-10-10',
          dueDate: '2026-10-17',
          deadline: '2026-10-17',
          estimatedEffortHours: 20,
          acceptanceCriteria: 'Zero-knowledge tenant isolation proof passes automated test suite with zero cross-tenant key leakage.',
          latestUpdate: 'Drafting zk-SNARK verification circuit with Shruti.',
          history: [],
          createdAt: '2026-10-10T11:00:00Z',
        },
        {
          id: 'TASK-202',
          projectId: 'chronos-ledger',
          projectName: 'Chronos Immutable Audit Ledger',
          milestoneId: 'm-ch-3',
          milestoneTitle: 'Security Hardening & Revision Remediation',
          title: 'Remediate Admin Revision: Produce automated disaster recovery drill report',
          description: 'Deliverable must include proof of cold-boot Merkle state reconstruction from raw S3 block storage.',
          status: 'To Do',
          priority: 'P1',
          assignee: 'Alex Chen',
          assigneeId: 'user-alex',
          creatorId: 'user-sarah',
          creatorName: 'Sarah Lin',
          startDate: '2026-10-12',
          dueDate: '2026-10-19',
          deadline: '2026-10-19',
          estimatedEffortHours: 12,
          acceptanceCriteria: 'Automated script reconstructs 10 million transactions in under 60 seconds with 100% hash consistency.',
          latestUpdate: 'Task created from Admin revision feedback.',
          history: [],
          createdAt: '2026-10-10T11:15:00Z',
        },
      ],
      files: [],
      reviewSubmission: {
        id: 'rev-sub-chronos',
        projectId: 'chronos-ledger',
        projectName: 'Chronos Immutable Audit Ledger',
        status: 'Changes Requested',
        currentRound: 1,
        rounds: [
          {
            roundNumber: 1,
            submittedAt: '2026-10-09T19:00:00Z',
            submittedBy: 'user-sarah',
            submittedByName: 'Sarah Lin',
            releaseVersion: 'v1.2.0-rc2',
            completionSummary: 'Complete implementation of append-only Merkle ledger with high-throughput API endpoints and telemetry exporter.',
            setupInstructions: 'Deploy via Helm chart `charts/chronos-cluster` with minimum 3 replica nodes.',
            knownLimitations: 'Cross-tenant boundary proofs require dedicated verification step during multi-tenant queries.',
            testEvidence: 'Passed 480 unit tests and 48-hour load test at 50,000 writes/sec without memory leaks.',
            outstandingIssues: 'Disaster recovery cold-boot drill needs final documented test execution run.',
            reviewerId: 'user-admin',
            reviewerName: 'Alexander Ward',
            reviewedAt: '2026-10-10T10:30:00Z',
            decision: 'Changes Requested',
            comments: 'Strong foundational release. However, before approving client delivery to Global HealthMesh, two items must be resolved: 1) explicit zero-knowledge tenant isolation boundary proof, and 2) cold-boot disaster recovery runbook validation.',
            revisionItems: [
              { id: 'rev-item-1', description: 'Add zero-knowledge boundary proof for client tenant isolation', priority: 'P0', deadline: '2026-10-17', completed: false },
              { id: 'rev-item-2', description: 'Execute and document cold-boot disaster recovery simulation from S3 backup', priority: 'P1', deadline: '2026-10-19', completed: false },
            ],
          },
        ],
        updatedAt: '2026-10-10T10:30:00Z',
      },
      updatedAt: '2026-10-10T10:30:00Z',
    },
    {
      id: 'krypton-auth',
      name: 'Krypton WebAuthn Identity Authority',
      description: 'Zero-trust cryptographic identity service featuring hardware token attestation, ephemeral session tokens, and automated rotation.',
      client: 'Nova Telecom Networks',
      scope: 'FIDO2 WebAuthn authentication backbone securing 12,000 carrier edge technicians.',
      expectedDeliverables: [
        'WebAuthn server binary with FIDO2 Level 3 attestation support',
        'Hardware token lifecycle management dashboard',
        'mTLS certificate auto-rotation agent',
      ],
      startDate: '2026-04-01',
      deadline: '2026-10-14',
      priority: 'P0',
      budget: '$195,000',
      teamId: 'team-security',
      teamLeaderId: 'user-elena',
      stakeholders: ['Marcus Thorne (VP Security, Nova Telecom)', 'Alexander Ward (Admin)'],
      acceptanceCriteria: 'Sub-50ms token generation; zero plain-text credential storage; FIDO2 compliance passed.',
      status: 'Approved for Delivery',
      health: 'Green',
      healthReasons: [
        'Admin approved final release v2.0.0 on 2026-10-11',
        'Ready for formal client delivery recording',
      ],
      currentVersionId: 'v2.0.0',
      ownerId: 'user-elena',
      team: 'Zero-Trust Identity & Crypto Guard',
      teamDescription: 'Security engineers building WebAuthn attestation and cryptographic audit ledgers.',
      teamChannel: '#team-krypton-auth',
      teamMembers: [
        { userId: 'user-elena', role: 'Lead', responsibility: 'WebAuthn protocol implementation and HSM orchestration', joinedAt: '2026-02-15' },
        { userId: 'user-david', role: 'Member', responsibility: 'Hardware token attestation and CLI integration', joinedAt: '2026-04-15' },
      ],
      repositoryUrl: 'github.com/internal-corp/krypton-auth',
      architectureSummary: 'FIDO2 Level 3 compliant server utilizing YubiKey & Apple Secure Enclave attestation with PKI backend.',
      quickstartGuide: './bin/krypton-server --fido2-keystore /etc/krypton/keys',
      milestones: [
        { id: 'm-kr-1', projectId: 'krypton-auth', title: 'FIDO2 Level 3 Attestation Engine', deadline: '2026-07-15', status: 'Completed', order: 1 },
        { id: 'm-kr-2', projectId: 'krypton-auth', title: 'Security Audit & Penetration Testing', deadline: '2026-09-15', status: 'Completed', order: 2 },
        { id: 'm-kr-3', projectId: 'krypton-auth', title: 'Final Delivery Preparation & Validation', deadline: '2026-10-10', status: 'Completed', order: 3 },
      ],
      decisions: [],
      versions: [
        {
          id: 'v2.0.0',
          hash: 'e921fa0',
          timestamp: '2026-10-10 12:00 UTC',
          author: { name: 'Elena Rostova', avatar: '' },
          commitMessage: 'release: official v2.0.0 release build for Nova Telecom deployment',
          changedFilesCount: 22,
          changedFiles: [{ path: 'src/fido2/attestation.rs', insertions: 190, deletions: 4 }],
        },
      ],
      tasks: [
        {
          id: 'TASK-301',
          projectId: 'krypton-auth',
          projectName: 'Krypton WebAuthn Identity Authority',
          title: 'Final cryptographic verification and signed release build v2.0.0',
          description: 'Package binaries, sign SHA256 checksums with internal release key, verify hardware token support.',
          status: 'Completed',
          priority: 'P0',
          assignee: 'Elena Rostova',
          assigneeId: 'user-elena',
          creatorId: 'user-elena',
          creatorName: 'Elena Rostova',
          startDate: '2026-10-08',
          dueDate: '2026-10-10',
          deadline: '2026-10-10',
          estimatedEffortHours: 12,
          acceptanceCriteria: 'Binaries signed; checksums published; audit validation passed.',
          evidenceUrls: ['https://releases.internal/krypton/v2.0.0/signatures.asc'],
          latestUpdate: 'Release signed and approved by Admin. Pending client delivery execution.',
          history: [],
          createdAt: '2026-10-08T08:00:00Z',
          updatedAt: '2026-10-10T14:00:00Z',
        },
      ],
      files: [],
      reviewSubmission: {
        id: 'rev-sub-krypton',
        projectId: 'krypton-auth',
        projectName: 'Krypton WebAuthn Identity Authority',
        status: 'Approved for Delivery',
        currentRound: 1,
        rounds: [
          {
            roundNumber: 1,
            submittedAt: '2026-10-10T15:00:00Z',
            submittedBy: 'user-elena',
            submittedByName: 'Elena Rostova',
            releaseVersion: 'v2.0.0',
            completionSummary: 'Delivering complete FIDO2 WebAuthn identity authority with 100% test passing rate and zero known security flaws.',
            setupInstructions: 'Deploy using `helm upgrade --install krypton-auth ./deploy/helm/krypton` with injected Vault secrets.',
            knownLimitations: 'Requires iOS >= 16 or Android >= 13 for biometric passkey roaming authentication.',
            testEvidence: 'Comprehensive penetration test report attached. 0 High/Critical findings. FIDO alliance test suite verified.',
            outstandingIssues: 'None. All acceptance criteria fulfilled.',
            reviewerId: 'user-admin',
            reviewerName: 'Alexander Ward',
            reviewedAt: '2026-10-11T16:00:00Z',
            decision: 'Approved',
            comments: 'Outstanding work Elena and team. All acceptance criteria and FIDO2 compliance tests verified. Approved for formal client delivery handover.',
            revisionItems: [],
          },
        ],
        updatedAt: '2026-10-11T16:00:00Z',
      },
      updatedAt: '2026-10-11T16:00:00Z',
    },
    {
      id: 'solaris-gateway',
      name: 'Solaris Edge Routing Mesh',
      description: 'Zero-downtime BGP anycast edge proxy with automated TLS termination and distributed denial-of-service mitigation.',
      client: 'Starlight Defense Aerospace',
      scope: 'Hardened edge routing layer across 18 worldwide satellite ground stations.',
      expectedDeliverables: [
        'Custom Envoy/eBPF routing proxy image',
        'Automated DDoS rate-limiting engine',
        'Certified client delivery package and cryptographic handoff dossier',
      ],
      startDate: '2026-03-01',
      deadline: '2026-09-30',
      priority: 'P0',
      budget: '$450,000',
      teamId: 'team-observability',
      teamLeaderId: 'user-sarah',
      stakeholders: ['General Frank Mercer (Starlight Aerospace)', 'Alexander Ward (Admin)'],
      acceptanceCriteria: 'Sub-millisecond packet routing; automated failover under 100ms; validated customer delivery signoff.',
      status: 'Delivered',
      health: 'Green',
      healthReasons: [
        'Project successfully delivered to client on 2026-09-30',
        'Client signed formal handover acknowledgment',
      ],
      currentVersionId: 'v1.4.2-prod',
      ownerId: 'user-sarah',
      team: 'Edge Reliability & Telemetry Fleet',
      teamDescription: 'Site reliability engineers managing edge telemetry and routing.',
      teamChannel: '#team-solaris-mesh',
      teamMembers: [
        { userId: 'user-sarah', role: 'Lead', responsibility: 'Edge proxy architecture & BGP anycast tuning', joinedAt: '2026-02-01' },
        { userId: 'user-alex', role: 'Member', responsibility: 'eBPF packet filtering & automated rate limiter', joinedAt: '2026-05-01' },
      ],
      repositoryUrl: 'github.com/internal-corp/solaris-mesh',
      architectureSummary: 'eBPF-accelerated proxy providing sub-millisecond layer 4 and layer 7 packet inspection.',
      quickstartGuide: './bin/solaris-edge --config /etc/solaris/mesh.yaml',
      milestones: [
        { id: 'm-sol-1', projectId: 'solaris-gateway', title: 'Anycast Core Engine', deadline: '2026-06-01', status: 'Completed', order: 1 },
        { id: 'm-sol-2', projectId: 'solaris-gateway', title: 'DDoS Mitigation Verification', deadline: '2026-08-15', status: 'Completed', order: 2 },
        { id: 'm-sol-3', projectId: 'solaris-gateway', title: 'Client Handover & Delivery', deadline: '2026-09-30', status: 'Completed', order: 3 },
      ],
      decisions: [],
      versions: [
        {
          id: 'v1.4.2-prod',
          hash: '710cb99',
          timestamp: '2026-09-28 14:00 UTC',
          author: { name: 'Sarah Lin', avatar: '' },
          commitMessage: 'release(client): signed release candidate for Starlight Aerospace delivery',
          changedFilesCount: 18,
          changedFiles: [{ path: 'src/ebpf/filter.c', insertions: 154, deletions: 12 }],
        },
      ],
      tasks: [
        {
          id: 'TASK-401',
          projectId: 'solaris-gateway',
          projectName: 'Solaris Edge Routing Mesh',
          title: 'Deploy edge proxy clusters to Starlight Ground Station VPCs',
          description: 'Complete production deployment across primary telemetry centers.',
          status: 'Completed',
          priority: 'P0',
          assignee: 'Sarah Lin',
          assigneeId: 'user-sarah',
          creatorId: 'user-sarah',
          creatorName: 'Sarah Lin',
          startDate: '2026-09-20',
          dueDate: '2026-09-28',
          deadline: '2026-09-28',
          estimatedEffortHours: 40,
          acceptanceCriteria: '18 satellite centers active and passing health checks.',
          evidenceUrls: ['https://delivery.internal/starlight/handover-evidence.pdf'],
          latestUpdate: 'Handover complete and ratified by client.',
          history: [],
          createdAt: '2026-09-20T08:00:00Z',
          updatedAt: '2026-09-28T16:00:00Z',
        },
      ],
      files: [],
      reviewSubmission: {
        id: 'rev-sub-solaris',
        projectId: 'solaris-gateway',
        projectName: 'Solaris Edge Routing Mesh',
        status: 'Delivered',
        currentRound: 1,
        rounds: [
          {
            roundNumber: 1,
            submittedAt: '2026-09-26T10:00:00Z',
            submittedBy: 'user-sarah',
            submittedByName: 'Sarah Lin',
            releaseVersion: 'v1.4.2-prod',
            completionSummary: 'Final production deliverable with eBPF DDOS protection and ground-station failover telemetry.',
            setupInstructions: 'Deploy via Starlight Aerospace air-gapped container runner.',
            knownLimitations: 'Requires Linux kernel >= 5.15 on ground-station terminal blades.',
            testEvidence: 'Signed air-gap soak test report and automated failover verification logs.',
            outstandingIssues: 'None.',
            reviewerId: 'user-admin',
            reviewerName: 'Alexander Ward',
            reviewedAt: '2026-09-28T15:00:00Z',
            decision: 'Approved',
            comments: 'All requirements exceeded. Approved for client delivery.',
            revisionItems: [],
          },
        ],
        updatedAt: '2026-09-30T17:00:00Z',
      },
      deliveryRecord: {
        id: 'DELIV-2026-001',
        projectId: 'solaris-gateway',
        projectName: 'Solaris Edge Routing Mesh',
        approvedVersion: 'v1.4.2-prod',
        deliveredAt: '2026-09-30T16:45:00Z',
        recipientContact: 'Col. Raymond Vance (Dir. Operations, Starlight Defense Aerospace)',
        deliveryChannel: 'Encrypted GPG Key Delivery & Secure Air-Gapped S3 Repository (Ref: STA-SEC-9921)',
        deliveryNotes: 'Production binary bundle, signed GPG checksums, deployment documentation, and 24/7 on-call escalation matrix transferred.',
        deliverablesList: [
          'solaris-edge-v1.4.2.tar.gz (SHA256: 710cb99a...)',
          'Air-gapped deployment playbook v1.4',
          'Signed Penetration Test Certification',
          'Operational handover dossier HO-2026-074',
        ],
        recordedBy: 'user-admin',
        recordedByName: 'Alexander Ward',
        clientAcknowledged: true,
        clientAcknowledgmentNotes: 'Acknowledged by Col. Raymond Vance on 2026-09-30 17:30 UTC via verified PGP digital receipt.',
        createdAt: '2026-09-30T16:45:00Z',
      },
      updatedAt: '2026-09-30T17:30:00Z',
    },
  ];

  const updates: EmployeeDailyUpdate[] = [
    {
      id: 'upd-101',
      employeeId: 'user-jessica',
      employeeName: 'Jessica Chauhan',
      employeeRole: 'Senior Distributed Systems Engineer',
      taskId: 'TASK-101',
      taskTitle: 'Verify io_uring kernel compatibility on staging-us-west fleet',
      projectId: 'apollo-core',
      projectName: 'Apollo Core Distributed Consensus',
      completedWork: 'Provisioned 3 staging nodes on kernel 6.1 LTS. Raised user-space memlock parameters to unlimited in systemd service definitions.',
      inProgress: 'Running 48-hour continuous io_uring submit/reap soak test with synthetic load.',
      nextSteps: 'Check completion queue ring overflow metrics tomorrow morning and report to Team Leader Marcus.',
      blockers: 'None currently. Fleet latency steady at 1.1ms.',
      dependencies: 'Requires staging fleet access (granted).',
      evidenceUrls: ['https://monitoring.internal/dashboards/io-uring-fleet'],
      status: 'Reviewed',
      leaderComment: 'Excellent progress Jessica. Keep an eye on p99 memory lock allocations during peak hours.',
      leaderId: 'user-marcus',
      createdAt: '2026-10-11T17:30:00Z',
      reviewedAt: '2026-10-11T18:15:00Z',
    },
    {
      id: 'upd-102',
      employeeId: 'user-yash',
      employeeName: 'Yash Lokhande',
      employeeRole: 'Principal Systems Architect',
      taskId: 'TASK-103',
      taskTitle: 'Benchmark follower read barrier latency under 80k rps load',
      projectId: 'apollo-core',
      projectName: 'Apollo Core Distributed Consensus',
      completedWork: 'Drafted k6 benchmark script to simulate 80k rps distributed read traffic.',
      inProgress: 'Waiting on staging VIP DNS resolution to execute full benchmark suite.',
      nextSteps: 'Run benchmark as soon as networking team unblocks the internal DNS record.',
      blockers: 'Blocked on staging load balancer DNS propagation in VPC-04.',
      dependencies: 'Network infrastructure team ticket NET-4091.',
      status: 'Submitted',
      createdAt: '2026-10-12T09:15:00Z',
    },
    {
      id: 'upd-103',
      employeeId: 'user-shruti',
      employeeName: 'Shruti Patil',
      employeeRole: 'Lead Site Reliability Engineer',
      taskId: 'TASK-201',
      taskTitle: 'Remediate Admin Revision: Add zero-knowledge boundary proof for client tenant isolation',
      projectId: 'chronos-ledger',
      projectName: 'Chronos Immutable Audit Ledger',
      completedWork: 'Analyzed Admin revision comments from Alexander Ward. Mapped out constraint circuit for tenant isolation.',
      inProgress: 'Coding Rust integration tests for cross-tenant boundary verification.',
      nextSteps: 'Benchmark proof generation time to ensure it remains under the 15ms acceptance limit.',
      blockers: 'None.',
      dependencies: 'Chronos core crate v1.2.0-rc3.',
      status: 'Submitted',
      createdAt: '2026-10-12T11:45:00Z',
    },
  ];

  const reports: TeamLeadProgressReport[] = [
    {
      id: 'rep-storage-oct11',
      projectId: 'apollo-core',
      projectName: 'Apollo Core Distributed Consensus',
      teamId: 'team-storage',
      teamName: 'Consensus & Distributed Storage Pod',
      leaderId: 'user-marcus',
      leaderName: 'Marcus Vance',
      reportingPeriod: 'Sprint 41 (Oct 01 - Oct 15, 2026)',
      progressPercentage: 78,
      milestonesCompleted: ['Phase 1: io_uring WAL Pipeline Implementation'],
      workCompleted: 'Successfully implemented io_uring kernel submission ring. p99 WAL commit latency lowered from 4.2ms to 1.1ms across staging clusters.',
      tasksRemaining: 'Chaos Mesh partition validation (TASK-102) and 80k rps load benchmarking (TASK-103).',
      blockedTasks: 'TASK-103 temporarily waiting on staging load balancer DNS routing in VPC-04.',
      risks: 'Minor staging network routing delay; no impact on production delivery deadline.',
      deadlineConfidence: 'High',
      helpNeededFromAdmin: 'Please help expedite Network Infrastructure ticket NET-4091 with IT SecOps if VIP routing is not resolved by tomorrow.',
      nextPeriodPlan: 'Complete 48h soak test, execute 4-node split-brain simulation, and compile final Phase 2 delivery artifact.',
      evidenceUrls: ['https://monitoring.internal/dashboards/apollo-sprint41-metrics'],
      status: 'Acknowledged',
      adminFeedback: 'Great momentum Marcus. I will follow up with IT SecOps regarding NET-4091 today. Proceed with Phase 2 validation.',
      adminId: 'user-admin',
      createdAt: '2026-10-11T18:45:00Z',
      reviewedAt: '2026-10-11T20:00:00Z',
    },
    {
      id: 'rep-obs-oct10',
      projectId: 'chronos-ledger',
      projectName: 'Chronos Immutable Audit Ledger',
      teamId: 'team-observability',
      teamName: 'Edge Reliability & Telemetry Fleet',
      leaderId: 'user-sarah',
      leaderName: 'Sarah Lin',
      reportingPeriod: 'Sprint 20 (Sep 25 - Oct 10, 2026)',
      progressPercentage: 88,
      milestonesCompleted: ['Merkle Mountain Range Core Engine', 'Cryptographic Proof Verifier Service'],
      workCompleted: 'Completed initial release candidate v1.2.0-rc2 and submitted for final review.',
      tasksRemaining: 'Remediating Admin revision requests: zero-knowledge tenant isolation proof and cold-boot disaster recovery drill.',
      blockedTasks: 'None.',
      risks: 'Deadline proximity (Oct 25, 2026); team is actively addressing revision tasks.',
      deadlineConfidence: 'Medium',
      helpNeededFromAdmin: 'Admin guidance received during Round 1 review. Team is now executing required remediation tasks.',
      nextPeriodPlan: 'Deliver updated release candidate v1.2.0-rc4 with passing tenant isolation suite and resubmit for final review.',
      evidenceUrls: [],
      status: 'Submitted',
      createdAt: '2026-10-10T11:30:00Z',
    },
  ];

  const reviews: ProjectReviewSubmission[] = [
    projects[1].reviewSubmission!,
    projects[2].reviewSubmission!,
    projects[3].reviewSubmission!,
  ];

  const deliveries: ClientDeliveryRecord[] = [
    projects[3].deliveryRecord!,
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'AUDIT-INIT-001',
      timestamp: '2026-10-12T08:00:00Z',
      hash: computeHash('init:audit:genesis:seed'),
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      action: 'TEAM_CREATED',
      actorId: 'user-admin',
      actorName: 'Alexander Ward',
      projectName: 'Continuity Enterprise Architecture',
      detail: 'Admin Alexander Ward created Core Consensus Pod and appointed Marcus Vance as Team Leader.',
      verifiable: true,
    },
    {
      id: 'AUDIT-INIT-002',
      timestamp: '2026-10-11T16:00:00Z',
      hash: computeHash('delivery:approved:krypton'),
      prevHash: computeHash('init:audit:genesis:seed'),
      action: 'DELIVERY_APPROVED',
      actorId: 'user-admin',
      actorName: 'Alexander Ward',
      projectName: 'Krypton WebAuthn Identity Authority',
      detail: 'Admin Alexander Ward reviewed and approved deliverable release v2.0.0 for Nova Telecom Networks.',
      verifiable: true,
    },
    {
      id: 'AUDIT-INIT-003',
      timestamp: '2026-09-30T16:45:00Z',
      hash: computeHash('client:delivered:solaris'),
      prevHash: computeHash('delivery:approved:krypton'),
      action: 'CLIENT_DELIVERY_RECORDED',
      actorId: 'user-admin',
      actorName: 'Alexander Ward',
      projectName: 'Solaris Edge Routing Mesh',
      detail: 'Admin Alexander Ward formally recorded final client delivery to Starlight Defense Aerospace (Recipient: Col. Raymond Vance).',
      verifiable: true,
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif-rev-1',
      title: 'Project Approved for Delivery',
      message: 'Krypton WebAuthn v2.0.0 was approved by Admin Alexander Ward. Ready for formal client delivery recording.',
      timestamp: '1 day ago',
      read: false,
      type: 'delivery',
      recipientId: 'user-admin',
      link: '/admin/deliveries',
    },
    {
      id: 'notif-rev-2',
      title: 'Revision Requested on Chronos',
      message: 'Admin Alexander Ward requested changes on Chronos Ledger v1.2.0-rc2 before client delivery approval.',
      timestamp: '2 days ago',
      read: false,
      type: 'review',
      recipientId: 'user-sarah',
      link: '/projects/chronos-ledger',
    },
    {
      id: 'notif-rep-1',
      title: 'Progress Report Submitted',
      message: 'Marcus Vance submitted Sprint 41 report for Apollo Core Distributed Consensus (78% complete).',
      timestamp: '1 day ago',
      read: true,
      type: 'report',
      recipientId: 'user-admin',
      link: '/reports',
    },
  ];

  const handoffs: HandoffPackage[] = [
    {
      id: 'HO-2026-089',
      projectId: 'apollo-core',
      projectName: 'Apollo Core Distributed Consensus',
      senderId: 'user-yash',
      recipientId: 'user-jessica',
      pinnedVersionId: 'v2.4.0',
      pinnedVersionHash: 'a9f82c1',
      status: 'Pending',
      createdAt: '2026-10-11T12:00:00Z',
      note: 'Rotation handover for Apollo Core io_uring WAL verification during APAC to US-West shift handover.',
      completenessScore: 94,
      briefing: {
        executiveSummary: 'Apollo Core Raft consensus engine v2.4.0 with monotonic read barriers. Kernel io_uring flush verification underway.',
        completedItems: [
          'Implemented epoch-based monotonic read barrier',
          'Configured io_uring submission queues in Linux kernel 6.1 LTS',
        ],
        nextSteps: [
          'Monitor memory lock allocations during 48h soak test',
          'Execute Chaos Mesh 4-node split-brain simulation',
        ],
        criticalBlockers: [
          'TASK-103: Staging VIP DNS propagation pending in VPC-04',
        ],
        architecturalDecisions: [
          'ADR-041: Speculative read barriers to eliminate leader round-trips',
          'ADR-039: POSIX sync to io_uring async ring migration',
        ],
        keyFiles: ['src/consensus/raft_state.rs', 'src/wal/journal_uring.rs'],
        runbookCommands: [
          './bin/apollo-ctl cluster status --json',
          'curl -s http://localhost:9091/metrics | grep apollo_raft_commit_index',
        ],
      },
      auditTrail: [
        {
          action: 'HANDOFF_INITIATED',
          actor: 'Yash Lokhande',
          timestamp: '2026-10-11 12:00 UTC',
          detail: 'Handoff dossier created and dispatched to Jessica Chauhan with pinned version v2.4.0.',
        },
      ],
    },
  ];

  return {
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
  };
}

function ensureCoreUsers(store: ServerStoreData) {
  const DEFAULT_HASH = '$2b$10$cEOW.VBVo8R07lmZ1nnm1OWH1nxREglK87WyqzcJl4qwYH4TPFaEa'; // '12345678'

  // 1. Admin: Yug Chapherkar
  let admin = store.users.find((u) => u.id === 'user-admin' || u.email === 'admin@phx.in' || u.systemRole === 'Admin');
  if (!admin) {
    admin = {
      id: 'user-admin',
      name: 'Yug Chapherkar',
      email: 'admin@phx.in',
      employeeId: 'ADM-0001',
      role: 'System Administrator & Executive Sponsor',
      systemRole: 'Admin',
      accountStatus: 'Active',
      avatar: '',
      initials: 'YC',
      department: 'Platform Administration & Executive Leadership',
      bio: 'Executive platform administrator overseeing enterprise governance, team orchestration, deliverable sign-offs, and final client release delivery.',
      location: 'San Francisco, CA (HQ)',
      activeProjectsCount: 4,
      pendingHandoffsCount: 0,
      isAdmin: true,
      passwordHash: DEFAULT_HASH,
      createdAt: '2026-01-01T00:00:00Z',
    };
    store.users.unshift(admin);
  } else {
    admin.name = 'Yug Chapherkar';
    admin.email = 'admin@phx.in';
    admin.initials = 'YC';
    admin.passwordHash = DEFAULT_HASH;
    admin.systemRole = 'Admin';
    admin.isAdmin = true;
  }

  // 2. Project Lead: Marcus Vance
  let lead = store.users.find((u) => u.id === 'user-marcus' || u.email === 'lead@phx.in');
  if (lead) {
    lead.name = 'Marcus Vance';
    lead.email = 'lead@phx.in';
    lead.employeeId = 'TL-1001';
    lead.role = 'Project Lead & Staff Systems Architect';
    lead.systemRole = 'Team Leader';
    lead.passwordHash = DEFAULT_HASH;
  }

  // 3. Employee: Jessica Chauhan
  let emp = store.users.find((u) => u.id === 'user-jessica' || u.email === 'employee@phx.in');
  if (emp) {
    emp.name = 'Jessica Chauhan';
    emp.email = 'employee@phx.in';
    emp.systemRole = 'Employee';
    emp.passwordHash = DEFAULT_HASH;
  }

  // Ensure all users have passwordHash
  store.users.forEach((u) => {
    if (!u.passwordHash) u.passwordHash = DEFAULT_HASH;
  });
}

export function getStore(): ServerStoreData {
  if (cachedData) {
    ensureCoreUsers(cachedData);
    return cachedData;
  }

  ensureStorageDir();

  if (fs.existsSync(STORAGE_FILE)) {
    try {
      const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
      cachedData = JSON.parse(content) as ServerStoreData;
      ensureCoreUsers(cachedData);
      return cachedData;
    } catch {
      // fallback
    }
  }

  cachedData = getInitialStore();
  ensureCoreUsers(cachedData);
  saveStore(cachedData);
  return cachedData;
}

export function saveStore(data: ServerStoreData) {
  cachedData = data;
  ensureStorageDir();
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save continuity server store:', err);
  }
}

/**
 * Verify user credentials against stored bcrypt password hashes.
 * Checks email or employee ID.
 */
export async function verifyUserCredentials(identifier: string, plainPassword: string): Promise<User | null> {
  const store = getStore();
  const clean = identifier.trim().toLowerCase();
  const user = store.users.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      u.employeeId?.toLowerCase() === clean ||
      u.id.toLowerCase() === clean
  );
  if (!user) return null;

  const hash = user.passwordHash || '$2b$10$cEOW.VBVo8R07lmZ1nnm1OWH1nxREglK87WyqzcJl4qwYH4TPFaEa';
  const isValid = await bcrypt.compare(plainPassword, hash);
  if (!isValid) return null;
  return user;
}


// Security / Role helpers
export function getUserById(userId: string): User | undefined {
  const store = getStore();
  return store.users.find((u) => u.id === userId);
}

export function getEffectiveRole(user: User): SystemRole {
  if (user.isAdmin || user.systemRole === 'Admin') return 'Admin';
  if (user.systemRole === 'Team Leader') return 'Team Leader';
  return 'Employee';
}

export function isUserAuthorizedForProject(user: User, projectId: string): boolean {
  if (getEffectiveRole(user) === 'Admin') return true;
  const store = getStore();
  const project = store.projects.find((p) => p.id === projectId);
  if (!project) return false;

  if (getEffectiveRole(user) === 'Team Leader') {
    return (
      project.teamLeaderId === user.id ||
      project.ownerId === user.id ||
      Boolean(user.teamId && project.teamId === user.teamId)
    );
  }

  // Employee: must belong to the project team or be assigned a task in this project
  if (user.teamId && project.teamId === user.teamId) return true;
  if (project.teamMembers?.some((m) => m.userId === user.id)) return true;
  if (project.tasks?.some((t) => t.assigneeId === user.id || t.assignee === user.name)) return true;
  return false;
}

// -------------------------------------------------------------
// Smart Handover Readiness Checker
// -------------------------------------------------------------
export function computeHandoverReadiness(params: {
  executiveSummary?: string;
  completedItems?: string[];
  nextSteps?: string[];
  criticalBlockers?: string[];
  runbookCommands?: string[];
  setupInstructions?: string;
  files?: string[];
  note?: string;
}): HandoffReadinessCheck {
  const summary = (params.executiveSummary || params.note || '').trim();
  const completed = params.completedItems || [];
  const nextSteps = params.nextSteps || [];
  const blockers = params.criticalBlockers || [];
  const runbooks = params.runbookCommands || [];
  const setup = (params.setupInstructions || '').trim();
  const files = params.files || [];

  const criteria: HandoffReadinessCriterion[] = [
    {
      id: 'summary',
      label: 'Executive Context & Purpose',
      weight: 20,
      satisfied: summary.length >= 30,
      suggestion:
        summary.length >= 30
          ? 'Sufficient operational context provided.'
          : 'Provide at least 30 characters explaining the handover context and objective.',
    },
    {
      id: 'completed_items',
      label: 'Completed Work Items',
      weight: 20,
      satisfied: completed.length > 0 && completed.some((c) => c.trim().length > 3),
      suggestion:
        completed.length > 0
          ? `${completed.length} completed work item(s) recorded.`
          : 'List at least one verified completed milestone or task item.',
    },
    {
      id: 'next_steps',
      label: 'Pending Tasks & Next Steps',
      weight: 20,
      satisfied: nextSteps.length > 0 && nextSteps.some((s) => s.trim().length > 3),
      suggestion:
        nextSteps.length > 0
          ? `${nextSteps.length} pending action item(s) defined.`
          : 'Specify clear next steps or pending tasks for the recipient.',
    },
    {
      id: 'runbook_commands',
      label: 'Setup Instructions & Runbook',
      weight: 15,
      satisfied: runbooks.length > 0 || setup.length >= 20,
      suggestion:
        runbooks.length > 0 || setup.length >= 20
          ? 'Executable diagnostic commands or setup instructions supplied.'
          : 'Add at least one runbook test command or setup instruction so the recipient can verify health.',
    },
    {
      id: 'blockers_clarity',
      label: 'Blocker & Risk Assessment',
      weight: 15,
      satisfied: true,
      suggestion:
        blockers.length > 0
          ? `${blockers.length} active risk/blocker(s) flagged for awareness.`
          : 'Zero active blockers flagged; clean operational transfer state.',
    },
    {
      id: 'evidence_files',
      label: 'Verification Evidence & Files',
      weight: 10,
      satisfied:
        files.length > 0 ||
        summary.includes('http') ||
        summary.includes('PR') ||
        summary.includes('commit') ||
        summary.includes('test'),
      suggestion:
        files.length > 0 || summary.includes('http') || summary.includes('PR')
          ? 'Verification artifacts or files linked.'
          : 'Attach or link relevant evidence files or documentation links.',
    },
  ];

  let score = 0;
  criteria.forEach((c) => {
    if (c.satisfied) score += c.weight;
  });

  const suggestions = criteria.filter((c) => !c.satisfied).map((c) => c.suggestion);
  if (score < 75) {
    suggestions.unshift(
      `Handover readiness score (${score}%) is below the recommended 75% completeness threshold.`
    );
  }

  return {
    score,
    passed: score >= 75,
    criteria,
    suggestions,
  };
}

// -------------------------------------------------------------
// Task Helpers: Ownership Timeline, Comments, Blockers
// -------------------------------------------------------------
export function transferTaskOwnership(
  taskId: string,
  newOwnerId: string,
  actor: User,
  reason: string,
  method: 'Assignment' | 'Recipient Acceptance' | 'Manager Override',
  handoffId?: string
): { success: boolean; task?: Task; error?: string } {
  const store = getStore();
  let foundTask: Task | null = null;
  let targetProject: Project | null = null;

  for (const project of store.projects) {
    const task = (project.tasks || []).find((t) => t.id === taskId);
    if (task) {
      foundTask = task;
      targetProject = project;
      break;
    }
  }

  if (!foundTask || !targetProject) {
    return { success: false, error: 'Task not found' };
  }

  const newOwner = store.users.find((u) => u.id === newOwnerId);
  if (!newOwner) {
    return { success: false, error: 'Target owner user not found' };
  }

  const prevOwnerId = foundTask.assigneeId;
  const prevOwnerName = foundTask.assigneeName || foundTask.assignee;

  // Atomically update task ownership
  foundTask.assigneeId = newOwner.id;
  foundTask.assignee = newOwner.name;
  foundTask.assigneeName = newOwner.name;
  foundTask.updatedAt = new Date().toISOString();

  if (!foundTask.ownershipTimeline) {
    foundTask.ownershipTimeline = [];
  }

  const record: TaskOwnershipRecord = {
    id: `own-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    previousOwnerId: prevOwnerId,
    previousOwnerName: prevOwnerName,
    newOwnerId: newOwner.id,
    newOwnerName: newOwner.name,
    transferredAt: new Date().toISOString(),
    transferredBy: actor.id,
    transferredByName: actor.name,
    handoffId,
    reason,
    method,
  };

  foundTask.ownershipTimeline.push(record);

  // Cryptographic audit log
  createAuditLog(
    actor.id,
    actor.name,
    'OWNERSHIP_TRANSFERRED',
    `Task "${foundTask.title}" (${foundTask.id}) ownership transferred from ${prevOwnerName || 'Unassigned'} to ${newOwner.name} via ${method}. Reason: ${reason}`,
    targetProject.name,
    { taskId: foundTask.id, prevOwnerId, newOwnerId: newOwner.id, method, handoffId }
  );

  // Notify parties
  if (prevOwnerId && prevOwnerId !== actor.id) {
    createNotification(
      'Task Ownership Transferred',
      `Ownership of task "${foundTask.title}" was transferred to ${newOwner.name} via ${method}.`,
      'task',
      prevOwnerId,
      `/tasks`
    );
  }
  if (newOwner.id !== actor.id) {
    createNotification(
      'New Task Ownership Assumed',
      `You are now the primary custodian of task "${foundTask.title}" (${foundTask.id}).`,
      'task',
      newOwner.id,
      `/tasks`
    );
  }

  saveStore(store);
  return { success: true, task: foundTask };
}

export function recordTaskBlocker(
  taskId: string,
  description: string,
  severity: 'Low' | 'Medium' | 'High' | 'Critical',
  actor: User
): { success: boolean; task?: Task; error?: string } {
  const store = getStore();
  let foundTask: Task | null = null;
  let targetProject: Project | null = null;

  for (const project of store.projects) {
    const task = (project.tasks || []).find((t) => t.id === taskId);
    if (task) {
      foundTask = task;
      targetProject = project;
      break;
    }
  }

  if (!foundTask || !targetProject) {
    return { success: false, error: 'Task not found' };
  }

  foundTask.status = 'Blocked';
  foundTask.blockerDetails = {
    id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    reportedBy: actor.id,
    reportedByName: actor.name,
    reportedAt: new Date().toISOString(),
    description,
    severity,
    status: 'Reported',
  };

  // Notify project Team Leader
  if (targetProject.teamLeaderId && targetProject.teamLeaderId !== actor.id) {
    createNotification(
      `Operational Blocker Reported: ${foundTask.title}`,
      `${actor.name} reported a ${severity} blocker: "${description}". Immediate triage requested.`,
      'blocker',
      targetProject.teamLeaderId,
      `/tasks`
    );
  }

  createAuditLog(
    actor.id,
    actor.name,
    'BLOCKER_REPORTED',
    `Blocker reported on task "${foundTask.title}" by ${actor.name}: ${description} (${severity})`,
    targetProject.name,
    { taskId: foundTask.id, severity, description }
  );

  saveStore(store);
  return { success: true, task: foundTask };
}

export function updateBlockerStatus(
  taskId: string,
  action: 'acknowledge' | 'escalate' | 'resolve',
  actor: User,
  payload?: { notes?: string; reason?: string }
): { success: boolean; task?: Task; error?: string } {
  const store = getStore();
  let foundTask: Task | null = null;
  let targetProject: Project | null = null;

  for (const project of store.projects) {
    const task = (project.tasks || []).find((t) => t.id === taskId);
    if (task) {
      foundTask = task;
      targetProject = project;
      break;
    }
  }

  if (!foundTask || !targetProject || !foundTask.blockerDetails) {
    return { success: false, error: 'Active blocker not found on task' };
  }

  const blocker = foundTask.blockerDetails;

  if (action === 'acknowledge') {
    blocker.status = 'Acknowledged';
    blocker.acknowledgedBy = actor.id;
    blocker.acknowledgedByName = actor.name;
    blocker.acknowledgedAt = new Date().toISOString();

    createNotification(
      `Blocker Acknowledged: ${foundTask.title}`,
      `Team Leader ${actor.name} acknowledged your reported blocker.`,
      'blocker',
      blocker.reportedBy,
      `/tasks`
    );

    createAuditLog(
      actor.id,
      actor.name,
      'BLOCKER_ACKNOWLEDGED',
      `Blocker on task "${foundTask.title}" acknowledged by ${actor.name}.`,
      targetProject.name,
      { taskId: foundTask.id }
    );
  } else if (action === 'escalate') {
    blocker.status = 'Escalated';
    blocker.escalatedAt = new Date().toISOString();
    blocker.escalationReason =
      payload?.reason || 'Escalated to Executive Administration for resolution';

    // Find Admin
    const adminUser = store.users.find((u) => u.systemRole === 'Admin' || u.isAdmin);
    if (adminUser) {
      blocker.escalatedTo = adminUser.id;
      blocker.escalatedToName = adminUser.name;
      createNotification(
        `Critical Blocker Escalated: ${foundTask.title}`,
        `${actor.name} escalated blocker: "${blocker.description}". Reason: ${blocker.escalationReason}`,
        'blocker',
        adminUser.id,
        `/tasks`
      );
    }

    createAuditLog(
      actor.id,
      actor.name,
      'BLOCKER_ESCALATED',
      `Blocker on task "${foundTask.title}" escalated by ${actor.name}: ${blocker.escalationReason}`,
      targetProject.name,
      { taskId: foundTask.id }
    );
  } else if (action === 'resolve') {
    blocker.status = 'Resolved';
    blocker.resolvedBy = actor.id;
    blocker.resolvedByName = actor.name;
    blocker.resolvedAt = new Date().toISOString();
    blocker.resolutionNotes = payload?.notes || 'Blocker resolved and cleared.';

    // Move task back to In Progress
    foundTask.status = 'In Progress';

    createNotification(
      `Blocker Resolved: ${foundTask.title}`,
      `Blocker was marked resolved by ${actor.name}: "${blocker.resolutionNotes}". Task is back In Progress.`,
      'blocker',
      blocker.reportedBy,
      `/tasks`
    );

    createAuditLog(
      actor.id,
      actor.name,
      'BLOCKER_RESOLVED',
      `Blocker on task "${foundTask.title}" resolved by ${actor.name}: ${blocker.resolutionNotes}`,
      targetProject.name,
      { taskId: foundTask.id }
    );
  }

  saveStore(store);
  return { success: true, task: foundTask };
}

export function addTaskComment(
  taskId: string,
  text: string,
  actor: User
): { success: boolean; task?: Task; comment?: TaskComment; error?: string } {
  const store = getStore();
  let foundTask: Task | null = null;
  let targetProject: Project | null = null;

  for (const project of store.projects) {
    const task = (project.tasks || []).find((t) => t.id === taskId);
    if (task) {
      foundTask = task;
      targetProject = project;
      break;
    }
  }

  if (!foundTask || !targetProject) {
    return { success: false, error: 'Task not found' };
  }

  if (!foundTask.comments) {
    foundTask.comments = [];
  }

  const comment: TaskComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    authorId: actor.id,
    authorName: actor.name,
    authorRole: getEffectiveRole(actor),
    text,
    createdAt: new Date().toISOString(),
  };

  foundTask.comments.push(comment);

  createAuditLog(
    actor.id,
    actor.name,
    'TASK_COMMENT_ADDED',
    `Comment added on task "${foundTask.title}" by ${actor.name}.`,
    targetProject.name,
    { taskId: foundTask.id, commentId: comment.id }
  );

  // Notify assignee if not the author
  if (foundTask.assigneeId && foundTask.assigneeId !== actor.id) {
    createNotification(
      `New Comment on Task: ${foundTask.title}`,
      `${actor.name}: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`,
      'task',
      foundTask.assigneeId,
      `/tasks`
    );
  }

  saveStore(store);
  return { success: true, task: foundTask, comment };
}

