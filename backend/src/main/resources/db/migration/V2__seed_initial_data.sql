-- V2__seed_initial_data.sql
-- Seed users, baseline projects, versions, decisions, tasks, and initial handoffs

INSERT INTO users (id, name, email, role, avatar, initials, department, bio, location, active_projects_count, pending_handoffs_count)
VALUES
('user-jessica', 'Jessicaa Chauhab', 'chauhanjessicaa27@gmail.com', 'Staff Platform Lead & Rotation Custodian', '', 'JC', 'Platform Architecture & Core Infrastructure', 'Lead engineer overseeing distributed systems reliability, service mesh topology, and zero-loss rotations.', 'San Francisco, CA (PST)', 3, 1),
('user-yash', 'Yash Lokhande', 'yash.lokhande@continuity.internal', 'Principal Systems Architect', '', 'YL', 'Distributed Systems & Consensus Core', 'Author of Apollo Raft consensus engine and WAL persistence tier. Rotating to APAC & EMEA shift.', 'Mumbai, IN (IST)', 3, 1),
('user-shruti', 'Shruti Patil', 'shruti.patil@continuity.internal', 'Lead Site Reliability & Continuity Engineer', '', 'SP', 'Cloud & Edge Reliability Infrastructure', 'Specialist in zero-loss shift rotations, kernel observability guardrails, and automated failover orchestration.', 'Pune, IN (IST)', 2, 1),
('user-marcus', 'Marcus Vance', 'm.vance@continuity.internal', 'Staff Systems Architect', '', 'MV', 'Distributed Storage & Consensus', 'Author of Apollo Raft consensus engine and WAL persistence tier. Rotating to Europe EMEA shift.', 'Zurich, Switzerland (CET)', 2, 0),
('user-sarah', 'Sarah Lin', 's.lin@continuity.internal', 'Principal Reliability Engineer', '', 'SL', 'Cloud & Edge Observability', 'Specialist in eBPF kernel tracing, SLO guardrails, and automated failover orchestration.', 'New York, NY (EST)', 2, 1),
('user-elena', 'Elena Rostova', 'e.rostova@continuity.internal', 'Staff Security & Crypto Engineer', '', 'ER', 'Auth & Zero-Trust Cryptography', 'Oversees mTLS root certificate rotation, HSM key orchestration, and zero-knowledge identity protocols.', 'London, UK (GMT)', 1, 1),
('user-david', 'David Kim', 'd.kim@continuity.internal', 'Senior Full-Stack Systems Engineer', '', 'DK', 'Developer Experience & Tooling', 'Builds internal CLI workflows, schema codegen, and developer sandbox environments.', 'Seattle, WA (PST)', 2, 1),
('user-alex', 'Alex Chen', 'a.chen@continuity.internal', 'Senior Backend Systems Engineer', '', 'AC', 'Cache Tier & In-Memory Fabrics', 'High-concurrency caching enthusiast, kernel bypass networking, and memory-mapped IO.', 'Austin, TX (CST)', 1, 0);

INSERT INTO projects (id, name, description, status, current_version_id, owner_id, team, repository_url, architecture_summary, quickstart_guide)
VALUES
('apollo-core', 'Apollo Core Distributed Consensus', 'High-throughput Raft state machine and distributed write-ahead log (WAL) powering multi-region state synchronization.', 'Transitioning', 'v2.4.0', 'user-marcus', 'Core Platform', 'github.com/internal-corp/apollo-core', 
 'Apollo Core is a linearizable, quorum-based replicated log engine written in Rust with C-bindings for node telemetry.\n\nKey Architectural Tenets:\n1. Leader Lease Model: Enforces 150ms heartbeats with speculative read barriers to reduce leader roundtrip latency.\n2. Zero-Copy I/O: Leverages io_uring for persistent write-ahead logs, guaranteeing sync flush under 1.2ms at p99.\n3. Failover Quorum: Supports dynamically reconfigurable cluster membership with pipelined commit indices.',
 '# Step 1: Initialize local 3-node consensus ring\n./bin/apollo-cluster-init --nodes 3 --wal-dir /var/lib/apollo/wal\n\n# Step 2: Validate linearizability under partition load\n./bin/apollo-verify --cluster-id 0x9F4 --verify-linearizability\n\n# Step 3: Run Prometheus exporter health probe\ncurl -fsS http://localhost:9090/metrics | grep apollo_raft_commit_index'),

('sentinel-gateway', 'Sentinel API & Edge Routing', 'High-frequency reverse proxy and Envoy-based edge control plane handling TLS termination and tenant rate limiting.', 'Active', 'v3.1.2', 'user-sarah', 'Edge Infrastructure', 'github.com/internal-corp/sentinel-gateway',
 'Sentinel is an Envoy-based cloud gateway handling ingress edge routing, TLS 1.3 session resumption, and token validation.\n\nKey Architectural Tenets:\n1. Dynamic Filter Chains: Envoy WASM filter chains for custom authorization and rate-limiting.\n2. Sub-millisecond Routing: eBPF sockops redirection bypassing kernel network stack for local node listeners.',
 '# Step 1: Bootstrap control plane\n./bin/sentinel-ctrl --config /etc/sentinel/config.yaml\n\n# Step 2: Verify envoy dynamic clusters\ncurl -s http://127.0.0.1:9901/clusters | grep healthy'),

('chronos-ledger', 'Chronos Immutable Audit Ledger', 'Tamper-evident cryptographically signed audit trail recording every code deployment, shift transfer, and security authorization.', 'Stable', 'v1.8.0', 'user-elena', 'Security Platform', 'github.com/internal-corp/chronos-ledger',
 'Chronos utilizes a SHA-256 forward-linked Merkelized block ledger to assert indisputable audit trails for all operations.',
 '# Verify cryptographic ledger integrity\n./bin/chronos-verify --chain /var/data/chronos.ledger --range HEAD~1000..HEAD'),

('krypton-auth', 'Krypton Zero-Trust Security Fabric', 'Mutual TLS orchestrator, SPIFFE/SPIRE workload identity attestation, and dynamic ephemeral secret injection.', 'Review Needed', 'v2.0.4', 'user-elena', 'Security Engineering', 'github.com/internal-corp/krypton-auth',
 'Krypton issues short-lived X.509 SVID credentials to containers and microservices based on hardware and kernel attestations.',
 '# Check SPIFFE registration agent socket\n./bin/spire-agent healthcheck --socket-path /tmp/spire-agent/public/api.sock'),

('nexus-cache', 'Nexus In-Memory Fabric & Vector Cache', 'Ultra low-latency memory store for session state, vector embeddings, and warm consensus snapshots.', 'Active', 'v4.0.1', 'user-david', 'Data Infrastructure', 'github.com/internal-corp/nexus-cache',
 'Nexus provides memory-mapped storage with kernel bypass user-space TCP drivers, serving 1.8M QPS at sub-50us latency.',
 '# Run memory fabric benchmark\n./bin/nexus-bench --threads 16 --duration 30s --pipeline 8');

-- Seed Versions
INSERT INTO project_versions (id, project_id, hash, parent_version_id, timestamp, author_name, author_avatar, commit_message, changed_files_count, snapshot_path, indexing_status)
VALUES
('v2.4.0', 'apollo-core', 'a9f82c1', 'v2.3.9', '2026-10-10T18:42:00Z', 'Marcus Vance', '', 'perf(raft): implement speculative read barrier with monotonic lease epoch [ADR-041]', 12, 'storage/snapshots/apollo-core/v2.4.0.zip', 'READY'),
('v2.3.9', 'apollo-core', 'f301bd9', 'v2.3.8', '2026-10-06T11:15:00Z', 'Marcus Vance', '', 'fix(wal): prevent sync starvation on io_uring ring overflow [ADR-039]', 4, 'storage/snapshots/apollo-core/v2.3.9.zip', 'READY'),
('v3.1.2', 'sentinel-gateway', 'c810ea3', 'v3.1.1', '2026-10-09T14:20:00Z', 'Sarah Lin', '', 'feat(envoy): add circuit-breaker threshold telemetry for gRPC streaming', 6, 'storage/snapshots/sentinel-gateway/v3.1.2.zip', 'READY'),
('v1.8.0', 'chronos-ledger', '7d44bc2', 'v1.7.9', '2026-10-08T09:30:00Z', 'Elena Rostova', '', 'feat(audit): zero-knowledge proof attestation for cross-boundary handoffs', 8, 'storage/snapshots/chronos-ledger/v1.8.0.zip', 'READY'),
('v2.0.4', 'krypton-auth', 'b219cf1', 'v2.0.3', '2026-10-07T16:00:00Z', 'Elena Rostova', '', 'fix(spire): patch token renewal race condition during node drain', 3, 'storage/snapshots/krypton-auth/v2.0.4.zip', 'READY'),
('v4.0.1', 'nexus-cache', 'e441aa9', 'v4.0.0', '2026-10-09T12:00:00Z', 'David Kim', '', 'perf(cache): optimize vector cosine similarity SIMD AVX-512 kernel', 5, 'storage/snapshots/nexus-cache/v4.0.1.zip', 'READY');

-- Seed Architecture Decisions
INSERT INTO architecture_decisions (id, project_id, title, date, context, decision, consequences, status)
VALUES
('ADR-041', 'apollo-core', 'Speculative Read Barrier via Monotonic Lease Epochs', '2026-10-09',
 'Read requests required a roundtrip to the Raft leader to verify quorum freshness, incurring a 12ms p99 overhead across WAN nodes.',
 'Adopt local read leases bounded by monotonic Chrony NTP drift guards. Followers service read requests speculatively if lease age is under 150ms.',
 'Read throughput increased by 310%. In the worst-case partition scenario, stale reads are strictly bounded to at most 150ms before failover terminates the lease.',
 'Accepted'),

('ADR-039', 'apollo-core', 'io_uring Disk Journal Flush Pipeline', '2026-09-28',
 'POSIX synchronous fsync syscalls suffered thread contention and sporadic 45ms latency spikes under heavy concurrent write operations.',
 'Replace POSIX fsync with Linux kernel io_uring submission queues with SQPOLL kernel threads.',
 'P99 write latency dropped to 1.18ms. Requires Linux kernel 5.15+ with fixed memory buffer registration.',
 'Accepted'),

('ADR-038', 'apollo-core', 'Quorum Membership Transition Guard', '2026-09-14',
 'Single-step configuration changes risked split-brain states during node addition or decommissioning.',
 'Enforce joint consensus states (Cold,new) where decisions require overlapping majorities from both old and new configurations before committing.',
 'Safe node membership migrations with zero downtime. Requires 2-stage consensus rounds during cluster resizing.',
 'Accepted');

-- Seed Tasks
INSERT INTO tasks (id, project_id, title, status, priority, assignee, description, created_at, blockers)
VALUES
('TSK-101', 'apollo-core', 'Validate Chrony NTP drift guardrails under chaos partition', 'Critical', 'P0', 'Jessica Chauhan', 'Verify that clock skew exceeding 5ms immediately degrades speculative read leases to full quorum verification.', '2026-10-10', 'Requires Chaos Mesh access in staging-cluster-us-west'),
('TSK-102', 'apollo-core', 'Update io_uring memory-locked buffer ulimits on staging hosts', 'Blocked', 'P0', 'Marcus Vance', 'apollo-staging-04 is rejecting fixed buffer registration due to ulimit -l restrictions.', '2026-10-09', 'Awaiting Platform SecOps root capability approval'),
('TSK-103', 'apollo-core', 'Benchmark multi-region consensus replication with 50ms synthetic latency', 'In Progress', 'P1', 'Marcus Vance', 'Run WAN simulator on 5-node cluster to benchmark pipeline commit indices.', '2026-10-08', NULL),
('TSK-104', 'apollo-core', 'Publish Prometheus metrics dashboard for read-lease epoch expirations', 'Done', 'P2', 'Sarah Lin', 'Telemetry counters for speculative read cache hits and leader round-trip fallbacks.', '2026-10-07', NULL);

-- Seed Handoffs
INSERT INTO handoffs (id, project_id, project_name, sender_id, recipient_id, pinned_version_id, pinned_version_hash, status, created_at, accepted_at, note, executive_summary, completed_items_json, next_steps_json, critical_blockers_json, runbook_commands_json, architectural_decisions_json, key_files_json)
VALUES
('HO-2026-089', 'apollo-core', 'Apollo Core Distributed Consensus', 'user-marcus', 'user-jessica', 'v2.4.0', 'a9f82c1', 'Pending', '2026-10-11T05:30:00Z', NULL,
 'Transferring primary operational custodianship for the Apollo Core consensus tier ahead of EMEA shift handover.',
 'Apollo Core v2.4.0 successfully introduces speculative read barriers with monotonic lease epochs [ADR-041], increasing read throughput by 310%. Staging soak tests have run stably for 48 hours without leader lease drops. You are assuming primary operational guardianship for the upcoming production deployment window.',
 '["Completed 48-hour soak testing on staging consensus ring","Verified zero WAL corruption across 1,000 simulated process crashes","Benchmarked p99 read latency reduction from 12.4ms to 1.82ms","Merged ADR-041 and updated cluster operational runbooks"]',
 '["Execute 4-node Chaos Mesh partition test before Monday deployment","Verify kernel io_uring buffer allocation on apollo-staging-04","Monitor lease epoch drift metrics on Prometheus alert dashboard","Coordinate with Sentinel Gateway team on ingress client retry timeouts"]',
 '["Kernel compatibility: Staging host apollo-staging-04 requires ulimit -l unlimited for fixed io_uring buffers","Staging partition runbook requires SecOps approval for raw network capability"]',
 '["./bin/apollo-ctl status --endpoint http://10.0.1.10:9090","./bin/apollo-verify --cluster-id 0x9F4 --verify-linearizability","sudo bpftrace -e ''tracepoint:io_uring:io_uring_submit { @count = count(); }''"]',
 '["ADR-041: Speculative Read Barrier via Monotonic Lease Epochs","ADR-039: io_uring Disk Journal Flush Pipeline","ADR-038: Quorum Membership Transition Guard"]',
 '["src/consensus/raft_state.rs","src/consensus/lease_manager.rs","src/wal/journal_uring.rs","proto/consensus/v2/raft.proto"]');

-- Seed Handoff Audit Trail
INSERT INTO handoff_audit_trail (id, handoff_id, action, actor, timestamp, detail, hash)
VALUES
('HT-101', 'HO-2026-089', 'HANDOFF_INITIATED', 'Marcus Vance', 'Sun, 11 Oct 2026 05:30:00 GMT', 'Generated transfer dossier for Apollo Core Distributed Consensus (version v2.4.0, commit a9f82c1).', '7b4e82f1a90c4d2e8b1a56f3d9c72e01');

-- Seed Activity Log
INSERT INTO activity_log (id, timestamp, hash, prev_hash, action, actor_id, actor_name, project_id, project_name, detail, verifiable)
VALUES
('AUDIT-8910', 'Sun, 11 Oct 2026 05:30:00 GMT', '7b4e82f1a90c4d2e8b1a56f3d9c72e01', 'e23098f1c84d72a9b31f08e45d12a9bc', 'HANDOFF_INITIATED', 'user-marcus', 'Marcus Vance', 'apollo-core', 'Apollo Core Distributed Consensus', 'Initiated handoff HO-2026-089 with pinned commit hash a9f82c1.', true),
('AUDIT-8909', 'Sat, 10 Oct 2026 18:42:00 GMT', 'e23098f1c84d72a9b31f08e45d12a9bc', '1a89c20f4d76b3e9a01f5c72e48b901a', 'VERSION_PINNED', 'user-marcus', 'Marcus Vance', 'apollo-core', 'Apollo Core Distributed Consensus', 'Committed version v2.4.0 (a9f82c1): perf(raft): implement speculative read barrier with monotonic lease epoch [ADR-041].', true),
('AUDIT-8908', 'Sat, 10 Oct 2026 14:10:00 GMT', '1a89c20f4d76b3e9a01f5c72e48b901a', '9c812d4fa01e3b7c89d2f45e61a0b78c', 'ADR_REGISTERED', 'user-marcus', 'Marcus Vance', 'apollo-core', 'Apollo Core Distributed Consensus', 'Registered ADR-041: Speculative Read Barrier via Monotonic Lease Epochs.', true);
