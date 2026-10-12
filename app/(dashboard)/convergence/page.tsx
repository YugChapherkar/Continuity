'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Network,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Play,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  UserCheck,
} from 'lucide-react';

interface Actor {
  did: string;
  userId: string;
  name: string;
  role: string;
}

interface ConvergenceStatus {
  trustFabricBaseUrl: string;
  besuUrl: string;
  trustFabricOnline: boolean;
  integrationMode: string;
  crossLedgerSync: string;
}

interface RecallTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  description: string;
  createdAt: string;
  blockers: string | null;
  deadline: string;
}

interface IncidentResponse {
  incidentId: string;
  handoffId: string;
  serial: string;
  verdict: string;
  riskScore: number;
  anchorTx: string;
  anchorId: string;
  besuBlockNumber: string;
  status: string;
  completenessGateStatus: string;
  affectedCustodians: string[];
  recallTasks: RecallTask[];
  handoff: any;
}

export default function ConvergencePage() {
  const { currentUser, setHandoffs } = useApp();

  const [statusData, setStatusData] = useState<ConvergenceStatus | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [incident, setIncident] = useState<IncidentResponse | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);
  const [gateTestMessage, setGateTestMessage] = useState<string | null>(null);
  const [gateTestStatus, setGateTestStatus] = useState<'idle' | 'blocked' | 'accepted'>('idle');
  const [activeTab, setActiveTab] = useState<'demo' | 'actors' | 'spec'>('demo');

  // Dynamic API base URL: respects domain/environment
  const getApiBase = () => {
    if (typeof window !== 'undefined') {
      if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
      const host = window.location.hostname;
      const proto = window.location.protocol;
      // If deployed or accessed via domain/IP, target port 8080 on the same host
      return `${proto}//${host}:8080`;
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  };

  const apiBase = getApiBase();

  // Load Status and Actor Map
  const fetchConvergenceData = async () => {
    setLoadingStatus(true);
    try {
      const [resStatus, resActors] = await Promise.all([
        fetch(`${apiBase}/api/convergence/status`).then((r) => r.json()).catch(() => null),
        fetch(`${apiBase}/api/convergence/actor-map`).then((r) => r.json()).catch(() => null),
      ]);

      if (resStatus) setStatusData(resStatus);
      if (resActors && resActors.actors) setActors(resActors.actors);
    } catch (e) {
      console.error('Failed to load convergence info:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchConvergenceData();
  }, []);

  // Run Flow 1 Simulation (Clone QR Attack)
  const handleSimulateClone = async () => {
    setSimulating(true);
    setGateTestMessage(null);
    setGateTestStatus('idle');
    try {
      const res = await fetch(`${apiBase}/api/convergence/simulate-clone`, {
        method: 'POST',
      });
      if (res.ok) {
        const data: IncidentResponse = await res.json();
        setIncident(data);
        if (data.handoff) {
          // Prepend to active handoffs in context
          setHandoffs((prev) => [data.handoff, ...prev.filter((h) => h.id !== data.handoff.id)]);
        }
      } else {
        alert('Simulation failed: ' + res.statusText);
      }
    } catch (err: any) {
      alert('Error triggering simulation: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  // Test Completeness Gate Rejection
  const handleTestNormalSignoff = async () => {
    if (!incident) return;
    try {
      const res = await fetch(`${apiBase}/api/handoffs/${incident.handoffId}/accept?recipientId=user-jessica`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setGateTestStatus('blocked');
        setGateTestMessage(data.message || 'Completeness gate blocked acceptance!');
      } else {
        setGateTestStatus('accepted');
        setGateTestMessage('Handoff signed off successfully.');
      }
    } catch (err: any) {
      setGateTestStatus('blocked');
      setGateTestMessage(err.message);
    }
  };

  // Test Completeness Gate Override
  const handleTestForceSignoff = async () => {
    if (!incident) return;
    try {
      const res = await fetch(`${apiBase}/api/handoffs/${incident.handoffId}/accept?recipientId=user-jessica`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forceAccept: true,
          signoffNote: 'Physical verification inspected by retail manager; quarantine sealed at shelf.'
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGateTestStatus('accepted');
        setGateTestMessage('Attestation Accepted! Physical inspection override verified and logged to audit trail.');
        // Update incident status
        setIncident((prev) => prev ? { ...prev, completenessGateStatus: 'VERIFIED_AND_ACCEPTED' } : null);
      } else {
        setGateTestStatus('blocked');
        setGateTestMessage(data.message);
      }
    } catch (err: any) {
      setGateTestStatus('blocked');
      setGateTestMessage(err.message);
    }
  };

  const copyToClipboard = (text: string, key?: string) => {
    navigator.clipboard.writeText(text);
    if (key) {
      setCopiedCurl(key);
      setTimeout(() => setCopiedCurl(null), 2000);
    } else {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-mono tracking-widest uppercase text-blue-400 mb-1">
            <Network className="w-4 h-4 text-blue-400" />
            <span>CROSS-ECOSYSTEM CONVERGENCE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F5F5F2]">
            Trust Fabric (Cyber) × CONTINUITY (Lossless Handoffs)
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Bi-directional anti-counterfeit breach telemetry, Ethereum Besu on-chain Merkle anchoring, and completeness-gated custodian recall.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchConvergenceData}
            disabled={loadingStatus}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            Refresh Bridge
          </button>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Convergence Live
          </div>
        </div>
      </div>

      {/* Architecture Bridge Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Node 1: Trust Fabric */}
        <div className="p-5 rounded-xl bg-[#0D0F10] border border-white/10 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Trust Fabric Engine</h3>
                <span className="text-xs text-neutral-400 font-mono truncate max-w-[160px] block" title="https://continuity.404piyush.me">
                  continuity.404piyush.me
                </span>
              </div>
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              statusData?.trustFabricOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              {statusData?.trustFabricOnline ? 'Connected' : 'QBFT Cloud'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            FastAPI anti-counterfeit detection core & Cloudflare tunnel. Verifies physical tamper marks, scan intervals & spatiotemporal bounds.
          </p>
        </div>

        {/* Node 2: Besu EVM Chain */}
        <div className="p-5 rounded-xl bg-[#0D0F10] border border-white/10 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Besu QBFT Chain</h3>
                <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[150px] block" title="0xEf89440626EC6FCA59dfb164f42D027BfeC7c881">
                  0xEf8944...881
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
              Chain Id: 1338
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            Private QBFT Ethereum PoA ledger on port 9545. Seals continuously; dossier Merkle roots anchored via smart contract.
          </p>
        </div>

        {/* Node 3: CONTINUITY Platform */}
        <div className="p-5 rounded-xl bg-[#0D0F10] border border-white/10 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">CONTINUITY Core</h3>
                <span className="text-xs text-neutral-400 font-mono truncate max-w-[160px] block" title={apiBase}>
                  {apiBase}
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              Active
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            Lossless engineering governance, per-custodian recall task dispatch, and physical inspection completeness-gate validation.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('demo')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'demo'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          1-Click Live Simulation (Flow 1)
        </button>
        <button
          onClick={() => setActiveTab('actors')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'actors'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Actor DID Mapping ({actors.length})
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'spec'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          Partner Integration Spec & cURL
        </button>
      </div>

      {/* TAB 1: 1-Click Interactive Demo */}
      {activeTab === 'demo' && (
        <div className="space-y-6">
          {/* Action Trigger Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#0D0F10] to-[#0D0F10] border border-red-500/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Interactive Proof Flow 1 — Clone QR Attack Mitigation</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Simulate Trust Fabric Clone Incident $\to$ Fan-out CONTINUITY Recall Tasks
                </h2>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Triggers Trust Fabric Clone Detection (<code className="text-red-300 font-mono">LOT-A-000123</code>), anchors the breach hash to the Besu EVM chain, converts the incident into a CONTINUITY Handoff Dossier, fans out 3 per-custodian recall tasks with deadlines, and enforces the physical inspection Completeness Gate.
                </p>
              </div>

              <button
                onClick={handleSimulateClone}
                disabled={simulating}
                className="shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-red-900/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Anchoring & Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Simulate Clone QR Attack</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Incident Result Panel */}
          {incident && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              {/* Breach Header & On-Chain Anchor */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Breach Summary */}
                <div className="p-5 rounded-xl bg-[#0D0F10] border border-red-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-red-400">Security Breach</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                      RISK SCORE: {incident.riskScore}/100
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      {incident.verdict}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Serial: <code className="text-white font-mono">{incident.serial}</code> (Lot LOT-A)
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-red-950/30 border border-red-500/20 text-[11px] text-red-200">
                    Failed Check R04: Seen in Mumbai at 10:00 and Delhi at 10:20 (~3450 km/h). Implies clone QR duplication.
                  </div>
                </div>

                {/* Besu EVM On-Chain Anchor */}
                <div className="p-5 rounded-xl bg-[#0D0F10] border border-cyan-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-cyan-400">Besu EVM Anchor</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                      BLOCK: {incident.besuBlockNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400">Ethereum Tx Hash:</span>
                    <div className="mt-1 flex items-center gap-2 p-2 rounded bg-black/40 border border-white/10 font-mono text-xs text-cyan-300 break-all">
                      <span className="truncate">{incident.anchorTx}</span>
                      <button
                        onClick={() => copyToClipboard(incident.anchorTx)}
                        className="shrink-0 p-1 hover:text-white text-neutral-400"
                        title="Copy Tx Hash"
                      >
                        {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Anchor ID: <code className="text-neutral-200">{incident.anchorId}</code>
                  </div>
                </div>

                {/* Handoff Dossier Link */}
                <div className="p-5 rounded-xl bg-[#0D0F10] border border-blue-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-blue-400">CONTINUITY Dossier</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                      {incident.handoffId}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Lossless Recall Package</h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Assigned from <span className="text-white">Yash Lokhande</span> to <span className="text-white">Jessicaa Chauhab</span> with runbook readiness.
                    </p>
                  </div>
                  <Link
                    href={`/handoffs/${incident.handoffId}`}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    <span>Inspect Full Handoff Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Fanned-out Recall Tasks with Deadlines */}
              <div className="p-6 rounded-2xl bg-[#0D0F10] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Fanned-Out Custodian Recall Tasks ({incident.recallTasks.length})
                    </h3>
                  </div>
                  <span className="text-xs text-neutral-400">
                    Cross-custodian parallel response triggered automatically
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {incident.recallTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-neutral-500">{t.id}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              t.priority === 'P0' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white">{t.title}</h4>
                        <p className="text-[11px] text-neutral-400">{t.description}</p>
                      </div>

                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500">Assignee:</span>
                          <span className="font-medium text-neutral-200">{t.assignee}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Deadline:
                          </span>
                          <span className="font-mono text-amber-300">{t.deadline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completeness Gate Enforcement Demo */}
              <div className="p-6 rounded-2xl bg-[#0D0F10] border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Completeness Gate Verification Engine
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold">
                    {incident.completenessGateStatus.startsWith('BLOCKED') ? 'GATE: BLOCKED' : 'GATE: PASSED'}
                  </span>
                </div>

                <p className="text-xs text-neutral-300">
                  By default, CONTINUITY strictly prohibits sign-off/acceptance of this custody dossier if the physical package inspection task (<code className="text-amber-300 font-mono">TSK-RECALL-01</code>) has not been confirmed. Test both flows below:
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleTestNormalSignoff}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Attempt Normal Sign-off (Verify Gate Blocks)</span>
                  </button>

                  <button
                    onClick={handleTestForceSignoff}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Verify Inspection & Accept Custody</span>
                  </button>
                </div>

                {gateTestMessage && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      gateTestStatus === 'blocked'
                        ? 'bg-red-950/40 border-red-500/30 text-red-200'
                        : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    }`}
                  >
                    {gateTestStatus === 'blocked' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold uppercase tracking-wider block mb-0.5">
                        {gateTestStatus === 'blocked' ? 'Completeness Gate Enforced' : 'Sign-Off Complete'}
                      </span>
                      <span>{gateTestMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Confirmed Actor Mapping */}
      {activeTab === 'actors' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0D0F10] border border-white/10 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                Confirmed Actor DID Mapping Roster
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Trust Fabric decentralized identifiers (DIDs) resolved automatically to CONTINUITY authenticated users.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400">
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Trust Fabric DID</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">CONTINUITY User ID</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Team Member</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Supply Chain Role</th>
                    <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {actors.map((actor) => (
                    <tr key={actor.did} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">{actor.did}</td>
                      <td className="py-3 px-4 font-mono text-blue-400">{actor.userId}</td>
                      <td className="py-3 px-4 font-medium text-white">{actor.name}</td>
                      <td className="py-3 px-4 text-neutral-300">{actor.role}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          SYNCED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Integration Spec & cURL Guide */}
      {activeTab === 'spec' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0D0F10] border border-white/10 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-400" />
                Cross-System REST API Contracts
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Zero-friction endpoints available for Team Trust Fabric to consume directly during integration and jury demos.
              </p>
            </div>

            <div className="space-y-4">
              {/* Endpoint 1: Ingest Incident */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">POST</span>
                    <span className="font-mono text-xs text-white">/api/convergence/incidents</span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `curl -X POST ${apiBase}/api/convergence/incidents -H "Content-Type: application/json" -d '{"caseId":"TC-1042","serial":"LOT-DEMO-A-000001","lotId":"LOT-DEMO-A","verdict":"CLONE_DETECTED","riskScore":65,"failedChecks":["Check R04: Impossible velocity","Check R07: Non-custodian offer"],"evidenceBundleUrl":"https://continuity.404piyush.me/products/LOT-DEMO-A-000001/bundle"}'`,
                        'incidents'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    {copiedCurl === 'incidents' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy cURL</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-400">
                  Trust Fabric calls this when a clone is detected. CONTINUITY automatically fans out recall tasks to the 3 custodians and anchors the dossier on Besu.
                </p>
              </div>

              {/* Endpoint 2: Direct Handoff Creation */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">POST</span>
                    <span className="font-mono text-xs text-white">/api/handoffs</span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `curl -X POST ${apiBase}/api/handoffs -H "Content-Type: application/json" -d '{"projectId":"apollo-core","senderId":"did:maker1","recipientId":"did:retailer1","note":"Direct transfer from Trust Fabric"}'`,
                        'handoffs'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    {copiedCurl === 'handoffs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy cURL</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-400">
                  Accepts handoff payloads directly using Trust Fabric DIDs (<code className="text-cyan-400">did:maker1</code>, <code className="text-cyan-400">did:retailer1</code>).
                </p>
              </div>

              {/* Endpoint 3: Actor Mapping */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">GET</span>
                    <span className="font-mono text-xs text-white">/api/convergence/actor-map</span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(`curl ${apiBase}/api/convergence/actor-map`, 'actormap')
                    }
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    {copiedCurl === 'actormap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy cURL</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-400">
                  Returns confirmed roster of DIDs mapped to CONTINUITY users.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
