-- V5__seed_version_files_and_knowledge.sql
-- Seed source files, architecture documents, runbooks, and knowledge indices for RAG grounding

-- 1. Version File Metadata
INSERT INTO version_file_metadata (id, version_id, project_id, name, path, size_bytes, file_type, content_snippet, file_hash)
VALUES
('file-apollo-01', 'v2.4.0', 'apollo-core', 'raft_state.rs', 'src/consensus/raft_state.rs', 14280, 'rust', 
'pub struct RaftStateMachine {
    pub commit_index: AtomicU64,
    pub last_applied: AtomicU64,
    pub lease_manager: Arc<LeaderLeaseManager>,
    pub term: AtomicU64,
}

impl RaftStateMachine {
    /// Evaluates speculative read barrier without leader round-trip if local lease is fresh.
    /// Implements invariant defined in ADR-041.
    pub fn speculative_read(&self, key: &[u8]) -> Result<Option<Vec<u8>>, ConsensusError> {
        if self.lease_manager.is_lease_valid(Duration::from_millis(150)) {
            // Clock skew is monitored via Chrony NTP monotonic offset guard
            return Ok(self.storage.read_linearizable(key));
        }
        // Fallback to full quorum barrier if lease epoch has expired
        self.quorum_read_barrier(key)
    }
}', '8f3a1b4c9e2d0a1b'),

('file-apollo-02', 'v2.4.0', 'apollo-core', 'journal_uring.rs', 'src/wal/journal_uring.rs', 18940, 'rust',
'pub struct JournalUringWriter {
    ring: io_uring::IoUring,
    sqpoll_enabled: bool,
    fixed_buffer_pool: RegisteredBuffers,
}

impl JournalUringWriter {
    /// High-throughput zero-copy WAL disk sync utilizing Linux io_uring SQPOLL threads.
    /// Guaranteed p99 flush latency < 1.18ms as ratified in ADR-039.
    pub fn flush_sync(&mut self, entry_bytes: &[u8]) -> Result<u64, WalError> {
        let sqe = io_uring::opcode::WriteFixed::new(
            self.wal_fd,
            entry_bytes.as_ptr(),
            entry_bytes.len() as u32,
            self.buf_idx
        ).build();
        unsafe { self.ring.submission().push(&sqe).map_err(|_| WalError::RingFull)?; }
        self.ring.submit_and_wait(1)?;
        Ok(self.current_offset.fetch_add(entry_bytes.len() as u64, Ordering::SeqCst))
    }
}', '3d7b8a1c5e9f02a4'),

('file-apollo-03', 'v2.4.0', 'apollo-core', 'lease_manager.rs', 'src/consensus/lease_manager.rs', 9840, 'rust',
'pub struct LeaderLeaseManager {
    last_heartbeat_timestamp: AtomicI64,
    lease_duration_ms: u64,
    max_ntp_drift_tolerance_us: u64,
}

impl LeaderLeaseManager {
    pub fn is_lease_valid(&self, threshold: Duration) -> bool {
        let now_mono = monotonic_time_us();
        let drift = get_chrony_ntp_drift_us();
        if drift > self.max_ntp_drift_tolerance_us {
            log::warn!("NTP drift {} exceeds threshold! Invalidating speculative read lease.", drift);
            return false;
        }
        (now_mono - self.last_heartbeat_timestamp.load(Ordering::Relaxed)) < (threshold.as_millis() as i64 * 1000)
    }
}', '2e9c4a8f1b7d03e5'),

('file-apollo-04', 'v2.4.0', 'apollo-core', 'raft.proto', 'proto/consensus/v2/raft.proto', 4510, 'protobuf',
'syntax = "proto3";
package apollo.consensus.v2;

message AppendEntriesRequest {
  uint64 term = 1;
  string leader_id = 2;
  uint64 prev_log_index = 3;
  uint64 prev_log_term = 4;
  repeated LogEntry entries = 5;
  uint64 leader_commit = 6;
  uint64 lease_epoch = 7;
}

message ReadBarrierLease {
  uint64 leader_lease_id = 1;
  int64 valid_until_monotonic_us = 2;
  bool is_speculative_granted = 3;
}', '7f4b1e0d2c8a9f3e'),

('file-apollo-05', 'v2.4.0', 'apollo-core', 'ADR-041-speculative-read-barriers.md', 'docs/adr/ADR-041-speculative-read-barriers.md', 6820, 'markdown',
'# ADR-041: Speculative Read Barrier via Monotonic Lease Epochs
**Status**: Accepted | **Date**: 2026-10-09 | **Author**: Marcus Vance

## Context
Read requests previously required a roundtrip to the Raft leader to verify quorum freshness, incurring a 12ms p99 overhead across WAN nodes.

## Decision
Adopt local read leases bounded by monotonic Chrony NTP drift guards (150ms). Followers service read requests speculatively if lease age is within threshold.

## Consequences
- Read throughput increased by 310%.
- In partition scenarios, stale reads are strictly bounded to at most 150ms before failover terminates the lease.', '5b9a8c1e4d7f02a3'),

('file-apollo-06', 'v2.4.0', 'apollo-core', 'emergency_failover.md', 'docs/runbooks/emergency_failover.md', 5120, 'markdown',
'# Emergency Failover & Cluster Verification Runbook

## 1. Probe Consensus Status
```bash
./bin/apollo-ctl cluster status --json | jq ''.nodes[] | {id, state, commit_index}''
```

## 2. Assert Linearizability Guarantees
```bash
./bin/apollo-verify --cluster-id 0x9F4 --verify-linearizability
```

## 3. Kernel io_uring Diagnostics
```bash
sudo bpftrace -e ''tracepoint:io_uring:io_uring_submit { @count = count(); }''
```', '9c2a8f4e1b7d03a1'),

-- Sentinel Gateway files
('file-sentinel-01', 'v3.1.2', 'sentinel-gateway', 'wasm_auth.cc', 'envoy/filters/wasm_auth.cc', 11200, 'cpp',
'// Envoy WASM Dynamic Token Authorization Filter
// Intercepts inbound gRPC and HTTP/2 ingress streams to enforce zero-trust identity.
FilterHeadersStatus OnRequestHeaders(uint32_t headers, bool end_of_stream) {
    auto token = getRequestHeader("authorization");
    if (!ValidateSpiffeIdentity(token)) {
        sendLocalResponse(401, "Unauthorized SPIFFE Workload", "", {});
        return FilterHeadersStatus::StopIteration;
    }
    return FilterHeadersStatus::Continue;
}', '4a1b9e2c8d7f03e2'),

('file-sentinel-02', 'v3.1.2', 'sentinel-gateway', 'sockops_redirect.c', 'ebpf/sockops_redirect.c', 7840, 'c',
'// eBPF sockops program redirecting TCP traffic between local microservices bypassing host TCP/IP stack
SEC("sockops")
int bpf_sockmap(struct bpf_sock_ops *skops) {
    if (skops->op == BPF_SOCK_OPS_PASSIVE_ESTABLISHED_CB || skops->op == BPF_SOCK_OPS_ACTIVE_ESTABLISHED_CB) {
        bpf_sock_hash_update(skops, &sock_map, &skops->remote_port, BPF_NOEXIST);
    }
    return 0;
}', '1b8e4a9c2d7f05a6'),

('file-sentinel-03', 'v3.1.2', 'sentinel-gateway', 'gateway_drain.md', 'docs/runbooks/gateway_drain.md', 4210, 'markdown',
'# Sentinel Gateway Drain & Cluster Rotation
```bash
# Verify active Envoy dynamic clusters
curl -s http://127.0.0.1:9901/clusters | grep healthy

# Gracefully drain ingress listeners (30s grace period)
curl -X POST http://127.0.0.1:9901/drain_listeners?graceful
```', '6f2e8a1c4d9b07a5'),

-- Chronos Ledger files
('file-chronos-01', 'v1.8.0', 'chronos-ledger', 'block_chain.rs', 'crates/merkle/block_chain.rs', 12400, 'rust',
'pub struct ChronosLedgerBlock {
    pub block_height: u64,
    pub previous_block_hash: [u8; 32],
    pub merkle_root: [u8; 32],
    pub state_transitions: Vec<HandoffStateTransition>,
    pub signature: Secp256k1Signature,
}

impl ChronosLedgerBlock {
    pub fn verify_integrity(&self, prev_hash: &[u8; 32]) -> bool {
        self.previous_block_hash == *prev_hash && self.verify_merkle_root()
    }
}', '8c1e4d7a9b2f05a3'),

('file-chronos-02', 'v1.8.0', 'chronos-ledger', 'attestation.rs', 'crates/zkp/attestation.rs', 9400, 'rust',
'pub struct ZeroKnowledgeAttestation {
    pub proof: Vec<u8>,
    pub public_inputs: Vec<[u8; 32]>,
}

impl ZeroKnowledgeAttestation {
    pub fn assert_handoff_validity(&self, handoff_id: &str) -> bool {
        zk_snark_verify(&self.proof, &self.public_inputs)
    }
}', '5a9d2c1e8b7f04a6'),

-- Krypton Auth files
('file-krypton-01', 'v2.0.4', 'krypton-auth', 'svid_rotator.go', 'spire/agent/svid_rotator.go', 8900, 'go',
'package agent

import "context"

type SvidRotator struct {
    workloadSocket string
    x509ExpiryGracePeriod int
}

func (r *SvidRotator) RotateWorkloadCredentials(ctx context.Context) error {
    // Patched race condition during node drain [commit b219cf1]
    return nil
}', '3b8f1c4e9d2a07e1'),

-- Nexus Cache files
('file-nexus-01', 'v4.0.1', 'nexus-cache', 'vector_avx512.c', 'src/simd/vector_avx512.c', 10120, 'c',
'// AVX-512 SIMD vector dot product kernel for cosine similarity search
#include <immintrin.h>

float avx512_cosine_similarity(const float* a, const float* b, int n) {
    __m512 dot = _mm512_setzero_ps();
    for (int i = 0; i < n; i += 16) {
        __m512 va = _mm512_loadu_ps(a + i);
        __m512 vb = _mm512_loadu_ps(b + i);
        dot = _mm512_fmadd_ps(va, vb, dot);
    }
    return _mm512_reduce_add_ps(dot);
}', '7d2e8b1a4c9f05a2');

-- 2. Knowledge Index Records
INSERT INTO knowledge_index (id, project_id, version_id, file_search_store_id, status, file_count, last_indexed_at, error_message)
VALUES
('idx-apollo-v2.4.0', 'apollo-core', 'v2.4.0', 'store-apollo-core-v240', 'READY', 6, '2026-10-12T13:30:00Z', NULL),
('idx-sentinel-v3.1.2', 'sentinel-gateway', 'v3.1.2', 'store-sentinel-gateway-v312', 'READY', 3, '2026-10-12T13:30:00Z', NULL),
('idx-chronos-v1.8.0', 'chronos-ledger', 'v1.8.0', 'store-chronos-ledger-v180', 'READY', 2, '2026-10-12T13:30:00Z', NULL),
('idx-krypton-v2.0.4', 'krypton-auth', 'v2.0.4', 'store-krypton-auth-v204', 'READY', 1, '2026-10-12T13:30:00Z', NULL),
('idx-nexus-v4.0.1', 'nexus-cache', 'v4.0.1', 'store-nexus-cache-v401', 'READY', 1, '2026-10-12T13:30:00Z', NULL);
