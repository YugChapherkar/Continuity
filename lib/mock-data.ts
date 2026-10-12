import { User, Project, HandoffPackage, AuditLogEntry, AppNotification } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-jessica',
    name: 'Jessicaa Chauhab',
    email: 'chauhanjessicaa27@gmail.com',
    role: 'Staff Platform Lead & Rotation Custodian',
    avatar: '',
    initials: 'JC',
    department: 'Platform Architecture & Core Infrastructure',
    bio: 'Lead engineer overseeing distributed systems reliability, service mesh topology, and zero-loss rotations.',
    location: 'San Francisco, CA (PST)',
    activeProjectsCount: 3,
    pendingHandoffsCount: 1,
  },
  {
    id: 'user-yash',
    name: 'Yash Lokhande',
    email: 'yash.lokhande@continuity.internal',
    role: 'Principal Systems Architect',
    avatar: '',
    initials: 'YL',
    department: 'Distributed Systems & Consensus Core',
    bio: 'Author of Apollo Raft consensus engine and WAL persistence tier. Rotating to APAC & EMEA shift.',
    location: 'Mumbai, IN (IST)',
    activeProjectsCount: 3,
    pendingHandoffsCount: 1,
  },
  {
    id: 'user-shruti',
    name: 'Shruti Patil',
    email: 'shruti.patil@continuity.internal',
    role: 'Lead Site Reliability & Continuity Engineer',
    avatar: '',
    initials: 'SP',
    department: 'Cloud & Edge Reliability Infrastructure',
    bio: 'Specialist in zero-loss shift rotations, kernel observability guardrails, and automated failover orchestration.',
    location: 'Pune, IN (IST)',
    activeProjectsCount: 2,
    pendingHandoffsCount: 1,
  },
  {
    id: 'user-marcus',
    name: 'Marcus Vance',
    email: 'm.vance@continuity.internal',
    role: 'Staff Systems Architect',
    avatar: '',
    initials: 'MV',
    department: 'Distributed Storage & Consensus',
    bio: 'Author of Apollo Raft consensus engine and WAL persistence tier. Rotating to Europe EMEA shift.',
    location: 'Zurich, Switzerland (CET)',
    activeProjectsCount: 2,
    pendingHandoffsCount: 0,
  },
  {
    id: 'user-sarah',
    name: 'Sarah Lin',
    email: 's.lin@continuity.internal',
    role: 'Principal Reliability Engineer',
    avatar: '',
    initials: 'SL',
    department: 'Cloud & Edge Observability',
    bio: 'Specialist in eBPF kernel tracing, SLO guardrails, and automated failover orchestration.',
    location: 'New York, NY (EST)',
    activeProjectsCount: 2,
    pendingHandoffsCount: 1,
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    email: 'e.rostova@continuity.internal',
    role: 'Staff Security & Crypto Engineer',
    avatar: '',
    initials: 'ER',
    department: 'Auth & Zero-Trust Cryptography',
    bio: 'Oversees mTLS root certificate rotation, HSM key orchestration, and zero-knowledge identity protocols.',
    location: 'London, UK (GMT)',
    activeProjectsCount: 1,
    pendingHandoffsCount: 1,
  },
  {
    id: 'user-david',
    name: 'David Kim',
    email: 'd.kim@continuity.internal',
    role: 'Senior Full-Stack Systems Engineer',
    avatar: '',
    initials: 'DK',
    department: 'Developer Experience & Tooling',
    bio: 'Builds internal CLI workflows, schema codegen, and developer sandbox environments.',
    location: 'Seattle, WA (PST)',
    activeProjectsCount: 2,
    pendingHandoffsCount: 1,
  },
  {
    id: 'user-alex',
    name: 'Alex Chen',
    email: 'a.chen@continuity.internal',
    role: 'Senior Backend Systems Engineer',
    avatar: '',
    initials: 'AC',
    department: 'Cache Tier & In-Memory Fabrics',
    bio: 'High-concurrency caching enthusiast, kernel bypass networking, and memory-mapped IO.',
    location: 'Austin, TX (CST)',
    activeProjectsCount: 1,
    pendingHandoffsCount: 0,
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'apollo-core',
    name: 'Apollo Core Distributed Consensus',
    description: 'High-throughput Raft state machine and distributed write-ahead log (WAL) powering multi-region state synchronization.',
    status: 'Transitioning',
    currentVersionId: 'v2.4.0',
    ownerId: 'user-marcus',
    team: 'Core Platform',
    repositoryUrl: 'github.com/internal-corp/apollo-core',
    updatedAt: '2026-10-11T05:30:00Z',
    architectureSummary: `Apollo Core is a linearizable, quorum-based replicated log engine written in Rust with C-bindings for node telemetry.

Key Architectural Tenets:
1. Leader Lease Model: Enforces 150ms heartbeats with speculative read barriers to reduce leader roundtrip latency.
2. Zero-Copy I/O: Leverages io_uring for persistent write-ahead logs, guaranteeing sync flush under 1.2ms at p99.
3. Failover Quorum: Supports dynamically reconfigurable cluster membership with pipelined commit indices.`,
    quickstartGuide: `# Apollo Core Node Bootstrap Guide
# 1. Start cluster seed daemon
./bin/apollo-node --cluster-id 0x9F4 --peers 10.0.1.10:9090,10.0.1.11:9090 --raft-port 9090

# 2. Verify quorum consensus & epoch
./bin/apollo-ctl cluster status --json

# 3. Healthcheck metrics probe
curl -s http://localhost:9091/metrics | grep apollo_raft_commit_index`,
    decisions: [
      {
        id: 'ADR-041',
        title: 'Adopt Speculative Read Barriers to Minimize Leader RTT',
        date: '2026-09-28',
        context: 'Under high geographical latency, linearizable reads required full round-trip consensus to the leader, creating an artificial p99 spike of 84ms in cross-region clusters.',
        decision: 'Implemented monotonic read-lease epochs verified locally on follower nodes using synchronized monotonic clock drifts bounded by Chrony NTP.',
        consequences: 'Read throughput increased by 310%. Follower leases expire in 80ms if heartbeat is missed, safely falling back to standard Raft RPC round-trips.',
        status: 'Accepted',
      },
      {
        id: 'ADR-039',
        title: 'Migrate WAL Disk Flush from POSIX sync to io_uring Async Ring',
        date: '2026-08-14',
        context: 'Fsync syscall locks on high NVMe contention were stalling log replication threads during batch bursts above 45k ops/sec.',
        decision: 'Replaced synchronous thread pool with dedicated submission and completion rings in Linux io_uring kernel subsystem.',
        consequences: 'Eliminated thread context switches. Maximum throughput increased to 125k ops/sec. Requires kernel >= 5.15 on host machines.',
        status: 'Accepted',
      },
      {
        id: 'ADR-032',
        title: 'Strict Compact Snapshotting Intervals on 2GB Log Threshold',
        date: '2026-06-19',
        context: 'Log replay during cold reboot of degraded nodes took up to 14 minutes when WAL files grew past 20GB.',
        decision: 'Trigger memory-mapped RocksDB snapshot creation every 2GB of uncompressed WAL delta or 1,000,000 log entries.',
        consequences: 'Cold node recovery time dropped from 14m to 38s at the cost of 4% transient disk write overhead during snapshot generation.',
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
          { path: 'config/apollo-cluster.toml', insertions: 8, deletions: 4 },
        ],
      },
      {
        id: 'v2.3.4',
        hash: '4c8b10f',
        timestamp: '2026-10-04 14:02 UTC',
        author: { name: 'Jessica Chauhan', avatar: '' },
        commitMessage: 'fix(network): tune TCP keepalive probes and connection pooling timeouts',
        changedFilesCount: 3,
        changedFiles: [
          { path: 'src/net/transport.rs', insertions: 45, deletions: 19 },
          { path: 'tests/integration/failover_test.rs', insertions: 82, deletions: 5 },
        ],
      },
      {
        id: 'v2.3.0',
        hash: '77e3d12',
        timestamp: '2026-09-18 09:44 UTC',
        author: { name: 'Marcus Vance', avatar: '' },
        commitMessage: 'feat(snapshot): automated RocksDB log compaction at 2GB threshold',
        changedFilesCount: 9,
        changedFiles: [
          { path: 'src/storage/compaction.rs', insertions: 218, deletions: 51 },
          { path: 'docs/architecture/ADR-032.md', insertions: 64, deletions: 0 },
        ],
      },
    ],
    tasks: [
      {
        id: 'TASK-101',
        title: 'Verify io_uring kernel compatibility on staging-us-west fleet',
        status: 'Critical',
        priority: 'P0',
        assignee: 'Jessica Chauhan',
        description: 'Ensure kernel 6.1 LTS is active and user-space memlock limits are raised to unlimited in systemd service definitions.',
        createdAt: '2026-10-10',
      },
      {
        id: 'TASK-102',
        title: 'Run Chaos Mesh partition test for 4-node split-brain simulation',
        status: 'In Progress',
        priority: 'P1',
        assignee: 'Sarah Lin',
        description: 'Verify cluster drops stale leader and elects new leader in < 350ms during asymmetric packet drops.',
        createdAt: '2026-10-09',
      },
      {
        id: 'TASK-103',
        title: 'Benchmark follower read barrier latency under 80k rps load',
        status: 'Blocked',
        priority: 'P1',
        assignee: 'David Kim',
        description: 'Waiting for load balancer VIP provisioning in staging VPC.',
        createdAt: '2026-10-08',
      },
      {
        id: 'TASK-104',
        title: 'Update Prometheus alerting rule for apollo_wal_flush_p99_micros',
        status: 'Done',
        priority: 'P2',
        assignee: 'Jessica Chauhan',
        description: 'Threshold adjusted from 5000us to 2500us following io_uring upgrade.',
        createdAt: '2026-10-07',
      },
    ],
    files: [
      {
        name: 'raft_state.rs',
        path: 'src/consensus/raft_state.rs',
        size: '14.2 KB',
        type: 'code',
        contentSnippet: `// Apollo Raft Node Core State Machine
pub struct RaftStateMachine {
    current_term: u64,
    voted_for: Option<NodeId>,
    log: LogStore,
    commit_index: CommitIndex,
    last_applied: LogIndex,
    read_lease: MonotonicLease,
}

impl RaftStateMachine {
    pub async fn apply_read_barrier(&self) -> Result<LogIndex, QuorumError> {
        if self.read_lease.is_valid() {
            Ok(self.commit_index)
        } else {
            self.renew_lease_with_quorum().await
        }
    }
}`,
      },
      {
        name: 'journal_uring.rs',
        path: 'src/wal/journal_uring.rs',
        size: '22.8 KB',
        type: 'code',
        contentSnippet: `// Linux io_uring asynchronous WAL persistent journal
pub struct UringJournal {
    ring: IoUring,
    fd: RawFd,
    pending_submissions: VecDeque<WriteOperation>,
}

impl UringJournal {
    pub fn submit_flush(&mut self, payload: &[u8]) -> IoResult<Token> {
        let entry = opcode::Write::new(Fd(self.fd), payload.as_ptr(), payload.len() as _)
            .offset(self.next_offset())
            .build();
        unsafe { self.ring.submission().push(&entry)? };
        Ok(self.ring.submit()?)
    }
}`,
      },
      {
        name: 'apollo-cluster.toml',
        path: 'config/apollo-cluster.toml',
        size: '2.4 KB',
        type: 'config',
        contentSnippet: `[cluster]
id = "apollo-prod-useast1"
heartbeat_interval_ms = 150
election_timeout_min_ms = 450
election_timeout_max_ms = 900

[storage]
wal_path = "/mnt/nvme0n1/apollo/wal"
use_io_uring = true
compaction_threshold_bytes = 2147483648

[telemetry]
prometheus_listen = "0.0.0.0:9091"
log_level = "info"`,
      },
      {
        name: 'ADR-041.md',
        path: 'docs/architecture/ADR-041.md',
        size: '4.1 KB',
        type: 'doc',
        contentSnippet: `# ADR-041: Speculative Read Barriers to Minimize Leader RTT
Date: 2026-09-28
Status: Accepted

## Context
Under multi-region deployment topology, client reads routing to the leader incurred a full round-trip consensus penalty, causing p99 latencies up to 84ms.

## Decision
We implement monotonic read-lease epochs verified locally on follower nodes using synchronized NTP drift bounds.`,
      },
    ],
  },
  {
    id: 'sentinel-gateway',
    name: 'Sentinel Zero-Trust API Mesh',
    description: 'Envoy-based mTLS ingress proxy and edge authentication firewall with fine-grained RBAC and rate-limiting enforcement.',
    status: 'Transitioning',
    currentVersionId: 'v1.9.4',
    ownerId: 'user-elena',
    team: 'Security & Mesh',
    repositoryUrl: 'github.com/internal-corp/sentinel-gateway',
    updatedAt: '2026-10-11T03:10:00Z',
    architectureSummary: `Sentinel Gateway handles L7 perimeter routing, SPIFFE/SPIRE cryptographic workload identities, and token verification at edge POPs.

Key Features:
1. Dynamic Envoy filter extensions written in WebAssembly (Wasm).
2. Auto-revoking short-lived JWT tokens (5 minute TTL).
3. Zero-downtime certificate rotation using cert-manager and Vault secrets engine.`,
    quickstartGuide: `# Sentinel Gateway Local Runbook
docker run -p 8443:8443 -v ./config/sentinel.yaml:/etc/envoy/envoy.yaml sentinel:v1.9.4
curl -k https://localhost:8443/healthz`,
    decisions: [
      {
        id: 'ADR-038',
        title: 'Migrate Edge Rate Limiter from Redis Cluster to Local Cuckoo Filter',
        date: '2026-09-12',
        context: 'Redis latency under DDOS attacks added 8ms overhead to edge request latency.',
        decision: 'Implemented high-concurrency Wasm Cuckoo filter running directly in Envoy worker threads.',
        consequences: 'Per-request rate evaluation dropped to < 40 microseconds.',
        status: 'Accepted',
      },
      {
        id: 'ADR-035',
        title: 'Enforce SPIRE Workload Attestation for All Internal Microservices',
        date: '2026-08-01',
        context: 'Static service account keys presented lateral movement vulnerability.',
        decision: 'Require SPIFFE IDs validated through kernel cgroup and Docker container IDs.',
        consequences: 'All services now rotate ephemeral certificates every 60 minutes automatically.',
        status: 'Accepted',
      },
    ],
    versions: [
      {
        id: 'v1.9.4',
        hash: 'e4c2b9a',
        timestamp: '2026-10-09 18:20 UTC',
        author: { name: 'Elena Rostova', avatar: '' },
        commitMessage: 'feat(spire): auto-sync X.509 bundle renewal with Vault intermediate CA',
        changedFilesCount: 7,
        changedFiles: [
          { path: 'src/pki/spire_agent.go', insertions: 89, deletions: 14 },
          { path: 'deploy/helm/values.yaml', insertions: 12, deletions: 2 },
        ],
      },
    ],
    tasks: [
      {
        id: 'TASK-201',
        title: 'Rotate staging cluster root intermediate certificates before expiry',
        status: 'In Progress',
        priority: 'P0',
        assignee: 'David Kim',
        description: 'Verify all Envoy sidecars receive updated SVIDs without dropping active TCP connections.',
        createdAt: '2026-10-08',
      },
      {
        id: 'TASK-202',
        title: 'Deploy Wasm rate limit filter to EU-central edge proxies',
        status: 'Critical',
        priority: 'P1',
        assignee: 'Elena Rostova',
        description: 'Monitor error rate closely during canary shift.',
        createdAt: '2026-10-07',
      },
    ],
    files: [
      {
        name: 'envoy.yaml',
        path: 'config/envoy.yaml',
        size: '8.1 KB',
        type: 'config',
        contentSnippet: `static_resources:
  listeners:
  - name: ingress_mtls
    address:
      socket_address:
        address: 0.0.0.0
        port_value: 8443
    filter_chains:
    - transport_socket:
        name: envoy.transport_sockets.tls
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.DownstreamTlsContext
          common_tls_context:
            tls_certificate_sds_secret_configs:
            - name: spiffe_workload_cert`,
      },
    ],
  },
  {
    id: 'chronos-ledger',
    name: 'Chronos Immutable Audit Ledger',
    description: 'Cryptographically verifiable, tamper-evident event sourcing ledger for financial transactions and system transitions.',
    status: 'Stable',
    currentVersionId: 'v3.1.2',
    ownerId: 'user-sarah',
    team: 'Core Platform',
    repositoryUrl: 'github.com/internal-corp/chronos-ledger',
    updatedAt: '2026-10-08T11:45:00Z',
    architectureSummary: `Chronos maintains an append-only Merkle-tree event stream with continuous SHA-256 cryptographic verification chaining.`,
    quickstartGuide: `./bin/chronos-verify-chain --start-epoch 2026-09-01 --end-epoch 2026-10-11`,
    decisions: [
      {
        id: 'ADR-029',
        title: 'Adopt BLAKE3 Hashes for High-Speed Merkle Leaf Generation',
        date: '2026-07-15',
        context: 'SHA-256 leaf batching was creating CPU bottlenecks at > 200k events/sec.',
        decision: 'Swapped internal Merkle tree hashing to BLAKE3 SIMD implementation.',
        consequences: 'Tree construction sped up by 4.2x with zero degradation in collision resistance.',
        status: 'Accepted',
      },
    ],
    versions: [
      {
        id: 'v3.1.2',
        hash: 'f710cd3',
        timestamp: '2026-10-02 11:15 UTC',
        author: { name: 'Sarah Lin', avatar: '' },
        commitMessage: 'perf(merkle): vectorize BLAKE3 batch hashing for AVX-512 processors',
        changedFilesCount: 4,
        changedFiles: [
          { path: 'src/merkle/blake3_simd.c', insertions: 112, deletions: 20 },
        ],
      },
    ],
    tasks: [
      {
        id: 'TASK-301',
        title: 'Audit cold storage glacier archive signature verification',
        status: 'Done',
        priority: 'P2',
        assignee: 'Sarah Lin',
        description: 'Verify periodic S3 bucket hash manifests against root key.',
        createdAt: '2026-09-30',
      },
    ],
    files: [
      {
        name: 'ledger.go',
        path: 'src/ledger/ledger.go',
        size: '12.4 KB',
        type: 'code',
        contentSnippet: `package ledger

type EventRecord struct {
    SequenceNumber uint64 \`json:"seq"\`
    Timestamp      int64  \`json:"ts"\`
    PayloadHash    []byte \`json:"hash"\`
    PrevBlockHash  []byte \`json:"prev_hash"\`
    Signature      []byte \`json:"sig"\`
}`,
      },
    ],
  },
  {
    id: 'krypton-auth',
    name: 'Krypton WebAuthn Identity Authority',
    description: 'Hardware token FIDO2/Passkey authentication service with ephemeral session ticket orchestration.',
    status: 'Review Needed',
    currentVersionId: 'v2.0.1',
    ownerId: 'user-elena',
    team: 'Security & Mesh',
    repositoryUrl: 'github.com/internal-corp/krypton-auth',
    updatedAt: '2026-10-10T19:12:00Z',
    architectureSummary: `Krypton implements passwordless enterprise authentication with biometric token verification and biometric hardware key binding.`,
    quickstartGuide: `npm run dev -- --port 4001`,
    decisions: [
      {
        id: 'ADR-044',
        title: 'Deprecate SMS and TOTP 2FA in Favor of Strict WebAuthn / FIDO2',
        date: '2026-09-20',
        context: 'Phishing attacks on internal contractors demonstrated vulnerabilities in code-based 2FA.',
        decision: 'Enforce hardware-bound passkeys as the sole allowed 2nd factor.',
        consequences: 'SIM swap and prompt-bombing attacks eliminated completely.',
        status: 'Accepted',
      },
    ],
    versions: [
      {
        id: 'v2.0.1',
        hash: 'b18d402',
        timestamp: '2026-10-09 14:00 UTC',
        author: { name: 'Elena Rostova', avatar: '' },
        commitMessage: 'feat(fido2): support passkey auto-fill credential discovery',
        changedFilesCount: 5,
        changedFiles: [
          { path: 'src/auth/webauthn.ts', insertions: 74, deletions: 18 },
        ],
      },
    ],
    tasks: [
      {
        id: 'TASK-401',
        title: 'Review WebAuthn reliance on Apple iCloud Keychain synchronization',
        status: 'In Progress',
        priority: 'P1',
        assignee: 'Elena Rostova',
        description: 'Ensure cross-device passkey recovery adheres to ISO compliance guidelines.',
        createdAt: '2026-10-09',
      },
    ],
    files: [
      {
        name: 'webauthn.ts',
        path: 'src/auth/webauthn.ts',
        size: '9.2 KB',
        type: 'code',
        contentSnippet: `export async function verifyPasskeyAssertion(response: CredentialAssertionResponse) {
  // Validate authenticator data and client data JSON hash
  const clientDataHash = crypto.subtle.digest('SHA-256', response.clientDataJSON);
  return verifySignature(response.authenticatorData, clientDataHash, response.signature);
}`,
      },
    ],
  },
  {
    id: 'nexus-cache',
    name: 'Nexus L1/L2 Low-Latency Cache Tier',
    description: 'In-memory distributed key-value store with tiered flash storage offloading and sub-100 microsecond read latencies.',
    status: 'Active',
    currentVersionId: 'v1.5.0',
    ownerId: 'user-alex',
    team: 'Cache Tier',
    repositoryUrl: 'github.com/internal-corp/nexus-cache',
    updatedAt: '2026-10-10T08:20:00Z',
    architectureSummary: `Nexus uses consistent hashing rings with virtual nodes across 64 cluster instances, caching session states and graph queries.`,
    quickstartGuide: `./bin/nexus-server --port 6380 --maxmemory 128gb`,
    decisions: [
      {
        id: 'ADR-022',
        title: 'Implement Two-Tier Memory + NVMe Offload Engine',
        date: '2026-05-10',
        context: 'DRAM memory costs were scaling quadratically with user graph size.',
        decision: 'Tier cold keys older than 4 hours to direct NVMe flash storage.',
        consequences: 'DRAM footprint decreased by 58% while maintaining 99.4% hit rate in L1 memory.',
        status: 'Accepted',
      },
    ],
    versions: [
      {
        id: 'v1.5.0',
        hash: '89e3a44',
        timestamp: '2026-10-08 16:30 UTC',
        author: { name: 'Alex Chen', avatar: '' },
        commitMessage: 'feat(sharding): jump consistent hashing ring migration with zero-downtime vnodes',
        changedFilesCount: 8,
        changedFiles: [
          { path: 'src/cluster/ring.cpp', insertions: 154, deletions: 32 },
        ],
      },
    ],
    tasks: [
      {
        id: 'TASK-501',
        title: 'Validate NVMe block endurance under 24h continuous compaction load',
        status: 'Done',
        priority: 'P2',
        assignee: 'Alex Chen',
        description: 'Drive wear rate projected at < 1.2% per year.',
        createdAt: '2026-10-01',
      },
    ],
    files: [
      {
        name: 'ring.cpp',
        path: 'src/cluster/ring.cpp',
        size: '18.1 KB',
        type: 'code',
        contentSnippet: `// Jump Consistent Hashing Implementation
int32_t JumpConsistentHash(uint64_t key, int32_t num_buckets) {
    int64_t b = -1, j = 0;
    while (j < num_buckets) {
        b = j;
        key = key * 2862933555777941757ULL + 1;
        j = (b + 1) * (double(1LL << 31) / double((key >> 33) + 1));
    }
    return b;
}`,
      },
    ],
  },
];

export const INITIAL_HANDOFFS: HandoffPackage[] = [
  {
    id: 'HO-2026-089',
    projectId: 'apollo-core',
    projectName: 'Apollo Core Distributed Consensus',
    senderId: 'user-yash',
    recipientId: 'user-jessica', // IMPORTANT: Current user Jessicaa has this pending!
    pinnedVersionId: 'v2.4.0',
    pinnedVersionHash: 'a9f82c1',
    status: 'Pending',
    createdAt: '2026-10-10T22:30:00Z',
    note: 'Rotating shift off-call to Jessicaa Chauhab. Apollo Core v2.4.0 was deployed to staging-us-west clusters. The io_uring WAL migration is running stably with p99 flush < 1.2ms. Please verify the 4-node split brain chaos test tomorrow morning and review ADR-041 before promoting to prod-us-east1.',
    briefing: {
      executiveSummary: 'Apollo Core v2.4.0 introduces the epoch-based monotonic read barrier (ADR-041) and Linux io_uring asynchronous WAL journaling (ADR-039). The consensus cluster has been operating with zero dropped heartbeats on 5 staging nodes for 28 continuous hours. Current responsibility transfer passes primary on-call, cluster topology oversight, and the P0 kernel compatibility verification task.',
      completedItems: [
        'Merged and pinned commit a9f82c1 (v2.4.0) with full CI verification green across all architectures.',
        'Deployed staging cluster 0x9F4 on 5 AWS c6i.4xlarge instances with kernel 6.1 LTS.',
        'Verified io_uring completion queue processing under 65k ops/sec synthetic workload.',
        'Calibrated Chrony NTP synchronization drift down to < 18 microseconds between nodes.',
      ],
      nextSteps: [
        'Inspect TASK-101: Validate systemd user-space memlock limits on staging-us-west.',
        'Execute the Chaos Mesh partition test (runbook command provided below) to assert sub-350ms election.',
        'Review staging Prometheus metrics at 10:00 UTC for memory leaks in ring buffer allocator.',
        'Sign off on production release gate scheduled for 2026-10-12.',
      ],
      criticalBlockers: [
        'Node apollo-staging-04 is reporting kernel log warnings if ulimit -l is below 64MB.',
        'VPC peering for staging load balancer VIP has an open ticket with the Network Infrastructure team (SEC-8821).',
      ],
      architecturalDecisions: [
        'ADR-041: Speculative Read Barriers to Minimize Leader RTT (Read throughput up 310%).',
        'ADR-039: Migrate WAL Disk Flush from POSIX sync to io_uring Async Ring (Latency p99 down to 1.18ms).',
        'ADR-032: Strict Compact Snapshotting Intervals on 2GB Log Threshold.',
      ],
      keyFiles: [
        'src/consensus/raft_state.rs (monotonic read lease checks)',
        'src/wal/journal_uring.rs (io_uring submission and completion queue handlers)',
        'config/apollo-cluster.toml (staging cluster definition)',
        'docs/architecture/ADR-041.md (formal rationale for monotonic read lease)',
      ],
      runbookCommands: [
        '# 1. Check current leader identity and lease epoch\n./bin/apollo-ctl status --endpoint http://10.0.1.10:9090',
        '# 2. Inspect kernel io_uring submission queues\nsudo bpftrace -e \'tracepoint:io_uring:io_uring_submit { @count = count(); }\'',
        '# 3. Trigger controlled leader stepdown to verify failover\n./bin/apollo-ctl node stepdown --node-id 1 --timeout 15s',
        '# 4. Run automated invariant verification probe\n./bin/apollo-verify --cluster-id 0x9F4 --verify-linearizability',
      ],
    },
    auditTrail: [
      {
        action: 'HANDOFF_INITIATED',
        actor: 'Yash Lokhande',
        timestamp: '2026-10-10 22:30:14 UTC',
        detail: 'Generated transfer briefing dossier for Apollo Core v2.4.0 (commit a9f82c1). Assigned primary recipient: Jessicaa Chauhab.',
        hash: '7b91d2c448f8101a1c8f1e6a9f82c1e403d8b2e104f7a6b2c9e102f4a8b71d99',
      },
      {
        action: 'VERSION_PINNED',
        actor: 'Yash Lokhande',
        timestamp: '2026-10-10 22:31:02 UTC',
        detail: 'Pinned immutable release tag v2.4.0 against git tree sha256 a9f82c1.',
        hash: '8f02a3d76e41b9c2d109f3e4b7a1c8f203d9e2a104f8b7c3d0e213f5b9c82e01',
      },
      {
        action: 'NOTIFICATION_DISPATCHED',
        actor: 'Continuity Daemon',
        timestamp: '2026-10-10 22:31:05 UTC',
        detail: 'Dispatched high-priority transition alert to Jessicaa Chauhab (chauhanjessicaa27@gmail.com).',
        hash: '9a13b4e87f52c0d3e210a4f5c8b2d9a304e0f3b205a9c8d4e1f324a6c0d93f12',
      },
    ],
  },
  {
    id: 'HO-2026-088',
    projectId: 'sentinel-gateway',
    projectName: 'Sentinel Zero-Trust API Mesh',
    senderId: 'user-shruti',
    recipientId: 'user-yash',
    pinnedVersionId: 'v1.9.4',
    pinnedVersionHash: 'e4c2b9a',
    status: 'Pending',
    createdAt: '2026-10-09T18:40:00Z',
    note: 'Handing over edge mesh certificate rotation sprint to Yash Lokhande. SPIRE workload attestation is fully integrated in staging. Please execute the intermediate CA renewal test before Friday.',
    briefing: {
      executiveSummary: 'Sentinel Gateway v1.9.4 auto-syncs X.509 bundles with Vault. Edge proxies in EU-central are prepared for Wasm rate-limiter canary rollout.',
      completedItems: [
        'Wasm rate limit filter tested in sandbox.',
        'SPIFFE/SPIRE agent configuration updated in Helm values.',
      ],
      nextSteps: [
        'Verify certificate renewal during simulated Vault network partition.',
        'Monitor edge proxy p99 latency in EU-central.',
      ],
      criticalBlockers: [
        'Vault agent token requires manual unseal on dev cluster 3.',
      ],
      architecturalDecisions: [
        'ADR-038: Migrate Edge Rate Limiter from Redis Cluster to Local Cuckoo Filter.',
        'ADR-035: Enforce SPIRE Workload Attestation for All Internal Microservices.',
      ],
      keyFiles: [
        'config/envoy.yaml',
        'src/pki/spire_agent.go',
      ],
      runbookCommands: [
        'kubectl get spiffeids -n sentinel',
        'envoy-ctl certs dump --socket /var/run/envoy/admin.sock',
      ],
    },
    auditTrail: [
      {
        action: 'HANDOFF_INITIATED',
        actor: 'Elena Rostova',
        timestamp: '2026-10-09 18:40:12 UTC',
        detail: 'Handed over Sentinel Gateway sprint dossier to David Kim.',
        hash: '4d8a1e2f3b4c5a6d7e8f90123456789abcdef0123456789abcdef0123456789a',
      },
    ],
  },
  {
    id: 'HO-2026-085',
    projectId: 'chronos-ledger',
    projectName: 'Chronos Immutable Audit Ledger',
    senderId: 'user-jessica',
    recipientId: 'user-sarah',
    pinnedVersionId: 'v3.1.2',
    pinnedVersionHash: 'f710cd3',
    status: 'Accepted',
    createdAt: '2026-10-02T10:00:00Z',
    acceptedAt: '2026-10-02T11:45:00Z',
    note: 'Transferred Chronos Merkle root verification ownership to Sarah Lin for Q3 architecture verification cycle. All verification pipelines verified green.',
    briefing: {
      executiveSummary: 'Chronos v3.1.2 vectorized BLAKE3 Merkle tree generation for high-throughput batch writes. Sarah Lin accepted full operational guardianship.',
      completedItems: [
        'Benchmark validated 210k events/sec sustained throughput.',
        'AVX-512 vectorization kernel deployed.',
      ],
      nextSteps: [
        'Maintain monthly cold storage glacier audit schedule.',
      ],
      criticalBlockers: [],
      architecturalDecisions: [
        'ADR-029: Adopt BLAKE3 Hashes for High-Speed Merkle Leaf Generation.',
      ],
      keyFiles: [
        'src/merkle/blake3_simd.c',
        'src/ledger/ledger.go',
      ],
      runbookCommands: [
        './bin/chronos-verify-chain --start-epoch 2026-09-01',
      ],
    },
    auditTrail: [
      {
        action: 'HANDOFF_INITIATED',
        actor: 'Jessica Chauhan',
        timestamp: '2026-10-02 10:00:15 UTC',
        detail: 'Initiated transfer to Sarah Lin.',
        hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      },
      {
        action: 'HANDOFF_ACCEPTED',
        actor: 'Sarah Lin',
        timestamp: '2026-10-02 11:45:00 UTC',
        detail: 'Digitally verified and accepted primary ownership of Chronos Ledger.',
        hash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
      },
    ],
  },
  {
    id: 'HO-2026-082',
    projectId: 'krypton-auth',
    projectName: 'Krypton WebAuthn Identity Authority',
    senderId: 'user-elena',
    recipientId: 'user-jessica',
    pinnedVersionId: 'v2.0.1',
    pinnedVersionHash: 'b18d402',
    status: 'Accepted',
    createdAt: '2026-10-08T14:00:00Z',
    acceptedAt: '2026-10-08T16:20:00Z',
    note: 'Handed off WebAuthn Passkey rollout review to Jessica Chauhan. Hardware FIDO2 validation tested across YubiKey 5 and TouchID biometric sensors.',
    briefing: {
      executiveSummary: 'Passkey autofill discovery is complete. Jessica Chauhan reviewed and signed off on security compliance checks.',
      completedItems: [
        'FIDO2 assertion verification pipeline validated.',
        'Deprecation of legacy SMS auth endpoints.',
      ],
      nextSteps: [
        'Publish contractor onboarding handbook for Passkeys.',
      ],
      criticalBlockers: [],
      architecturalDecisions: [
        'ADR-044: Deprecate SMS and TOTP 2FA in Favor of Strict WebAuthn.',
      ],
      keyFiles: [
        'src/auth/webauthn.ts',
      ],
      runbookCommands: [
        'npm run test:e2e:webauthn',
      ],
    },
    auditTrail: [
      {
        action: 'HANDOFF_ACCEPTED',
        actor: 'Jessica Chauhan',
        timestamp: '2026-10-08 16:20:00 UTC',
        detail: 'Signed off on security architecture review and accepted handover.',
        hash: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
      },
    ],
  },
  {
    id: 'HO-2026-079',
    projectId: 'nexus-cache',
    projectName: 'Nexus L1/L2 Low-Latency Cache Tier',
    senderId: 'user-alex',
    recipientId: 'user-marcus',
    pinnedVersionId: 'v1.5.0',
    pinnedVersionHash: '89e3a44',
    status: 'Completed',
    createdAt: '2026-10-01T09:00:00Z',
    acceptedAt: '2026-10-01T10:15:00Z',
    note: 'Consistent hashing ring migration completed with 0 downtime across 64 vnodes.',
    briefing: {
      executiveSummary: 'Nexus Cache sharding successfully operationalized. Operational guardianship verified.',
      completedItems: ['Consistent hashing ring deployed', 'Zero cache thrashing observed'],
      nextSteps: ['Monitor NVMe wear metrics weekly'],
      criticalBlockers: [],
      architecturalDecisions: ['ADR-022: Implement Two-Tier Memory + NVMe Offload Engine'],
      keyFiles: ['src/cluster/ring.cpp'],
      runbookCommands: ['./bin/nexus-ctl cluster status'],
    },
    auditTrail: [
      {
        action: 'HANDOFF_ACCEPTED',
        actor: 'Marcus Vance',
        timestamp: '2026-10-01 10:15:00 UTC',
        detail: 'Accepted and verified cache partition migration.',
        hash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      },
    ],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUDIT-8910',
    timestamp: '2026-10-10 22:31:02 UTC',
    hash: '8f02a3d76e41b9c2d109f3e4b7a1c8f203d9e2a104f8b7c3d0e213f5b9c82e01',
    prevHash: '7b91d2c448f8101a1c8f1e6a9f82c1e403d8b2e104f7a6b2c9e102f4a8b71d99',
    action: 'VERSION_PINNED',
    actorId: 'user-marcus',
    actorName: 'Marcus Vance',
    projectName: 'Apollo Core Distributed Consensus',
    detail: 'Pinned release tag v2.4.0 (commit a9f82c1) into handoff dossier HO-2026-089.',
    verifiable: true,
  },
  {
    id: 'AUDIT-8909',
    timestamp: '2026-10-10 22:30:14 UTC',
    hash: '7b91d2c448f8101a1c8f1e6a9f82c1e403d8b2e104f7a6b2c9e102f4a8b71d99',
    prevHash: '6a80c1b337e70f090b7e0d5f8e71b0d392c7a1d093e6f5a1b8d091e397a60c88',
    action: 'HANDOFF_INITIATED',
    actorId: 'user-yash',
    actorName: 'Yash Lokhande',
    projectName: 'Apollo Core Distributed Consensus',
    detail: 'Created transfer dossier HO-2026-089 designating Jessicaa Chauhab as primary recipient.',
    verifiable: true,
  },
  {
    id: 'AUDIT-8908',
    timestamp: '2026-10-09 18:40:12 UTC',
    hash: '6a80c1b337e70f090b7e0d5f8e71b0d392c7a1d093e6f5a1b8d091e397a60c88',
    prevHash: '597fb0a226d60e080a6d0c4e7d60a0c281b690cf82d5e490a7c980d286959b77',
    action: 'HANDOFF_INITIATED',
    actorId: 'user-shruti',
    actorName: 'Shruti Patil',
    projectName: 'Sentinel Zero-Trust API Mesh',
    detail: 'Created transfer dossier HO-2026-088 for Yash Lokhande with SPIRE renewal checklist.',
    verifiable: true,
  },
  {
    id: 'AUDIT-8907',
    timestamp: '2026-10-08 16:20:00 UTC',
    hash: '597fb0a226d60e080a6d0c4e7d60a0c281b690cf82d5e490a7c980d286959b77',
    prevHash: '486ea09115c50d07095c0b3d6c5090b170a580be71c4d38096b870c175848a66',
    action: 'HANDOFF_ACCEPTED',
    actorId: 'user-jessica',
    actorName: 'Jessicaa Chauhab',
    projectName: 'Krypton WebAuthn Identity Authority',
    detail: 'Accepted and verified operational responsibility for Krypton Auth v2.0.1 (HO-2026-082).',
    verifiable: true,
  },
  {
    id: 'AUDIT-8906',
    timestamp: '2026-10-07 14:15:30 UTC',
    hash: '486ea09115c50d07095c0b3d6c5090b170a580be71c4d38096b870c175848a66',
    prevHash: '375d9f8004b40c06084b0a2c5b4080a0609470ad60b3c27085a760b064737955',
    action: 'ADR_REGISTERED',
    actorId: 'user-yash',
    actorName: 'Yash Lokhande',
    projectName: 'Apollo Core Distributed Consensus',
    detail: 'Registered and ratified ADR-041: Speculative Read Barriers to Minimize Leader RTT.',
    verifiable: true,
  },
  {
    id: 'AUDIT-8905',
    timestamp: '2026-10-02 11:45:00 UTC',
    hash: '375d9f8004b40c06084b0a2c5b4080a0609470ad60b3c27085a760b064737955',
    prevHash: '264c8e7ff3a30b05073a091b4a30709f5083609c50a2b1607496509f53626844',
    action: 'HANDOFF_ACCEPTED',
    actorId: 'user-shruti',
    actorName: 'Shruti Patil',
    projectName: 'Chronos Immutable Audit Ledger',
    detail: 'Accepted handover dossier HO-2026-085 from Jessicaa Chauhab. Merkle root verification ratified.',
    verifiable: true,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Handoff Assigned to You',
    message: 'Yash Lokhande assigned Apollo Core v2.4.0 (HO-2026-089) for shift handover.',
    timestamp: '12 hours ago',
    read: false,
    type: 'handoff',
    link: '/handoffs/HO-2026-089',
  },
  {
    id: 'notif-2',
    title: 'Blocker Updated',
    message: 'TASK-101 (io_uring kernel compatibility) set to Critical priority.',
    timestamp: '14 hours ago',
    read: false,
    type: 'task',
    link: '/projects/apollo-core',
  },
  {
    id: 'notif-3',
    title: 'Audit Verification Logged',
    message: 'Cryptographic block #8910 verified with valid zero-drift signature.',
    timestamp: '1 day ago',
    read: true,
    type: 'audit',
    link: '/audit',
  },
];
