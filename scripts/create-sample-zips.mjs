import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const samplesDir = path.resolve('samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

function createZip(dirName, zipName, files) {
  const tmpDir = path.resolve('tmp_sample_' + dirName);
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(tmpDir, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  const zipTarget = path.join(samplesDir, zipName);
  if (fs.existsSync(zipTarget)) fs.unlinkSync(zipTarget);

  // Compress using PowerShell Compress-Archive
  execSync(`powershell -Command "Compress-Archive -Path '${tmpDir}/*' -DestinationPath '${zipTarget}' -Force"`);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log('Created sample archive:', zipName);
}

// 1. Apollo Core
createZip('apollo', 'apollo-core-v2.4.0.zip', {
  'README.md': `# Apollo Core Distributed Consensus v2.4.0\nHigh-throughput Raft state machine and WAL persistence tier.\n\n## Architectural Tenets\n- [ADR-041]: Speculative Read Barrier via Monotonic Lease Epochs.\n- [ADR-039]: Linux io_uring WAL Flush.\n\n## Runbook Commands\n./bin/apollo-ctl status --endpoint http://10.0.1.10:9090\n./bin/apollo-verify --cluster-id 0x9F4 --verify-linearizability\n`,
  'src/consensus/raft_state.rs': `pub struct RaftState {\n    pub current_term: u64,\n    pub commit_index: u64,\n    pub lease_epoch: u64,\n}\n\nimpl RaftState {\n    pub fn assert_read_barrier(&self, clock_skew_ms: u64) -> bool {\n        clock_skew_ms <= 5 && self.lease_epoch > 0\n    }\n}\n`,
  'src/wal/journal_uring.rs': `pub struct JournalUring {\n    pub ring_entries: u32,\n    pub fixed_buffers: bool,\n}\n`
});

// 2. Sentinel Gateway
createZip('sentinel', 'sentinel-gateway-v3.1.2.zip', {
  'README.md': `# Sentinel API & Edge Routing v3.1.2\nEnvoy-based edge reverse proxy and TLS termination gateway.\n\n## Runbook Commands\n./bin/sentinel-ctrl --config /etc/sentinel/config.yaml\ncurl -s http://127.0.0.1:9901/clusters | grep healthy\n`,
  'envoy/config.yaml': `static_resources:\n  listeners:\n  - name: ingress\n    address:\n      socket_address: { address: 0.0.0.0, port_value: 443 }\n`,
});

// 3. Chronos Ledger
createZip('chronos', 'chronos-ledger-v1.8.0.zip', {
  'README.md': `# Chronos Immutable Audit Ledger v1.8.0\nTamper-evident cryptographically signed audit trail recording every code deployment and handoff.\n\n## Runbook Commands\n./bin/chronos-verify --chain /var/data/chronos.ledger --range HEAD~1000..HEAD\n`,
  'src/ledger/crypto_chain.rs': `pub struct AuditBlock {\n    pub prev_hash: String,\n    pub hash: String,\n    pub action: String,\n}\n`,
});

console.log('Sample ZIP archives successfully generated in /samples');
