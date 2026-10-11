import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PROJECTS, INITIAL_HANDOFFS } from '@/lib/mock-data';

export async function POST(req: NextRequest) {
  try {
    const { query, activeProjectId } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Build grounding knowledge context from projects and handoffs
    const projectsContext = INITIAL_PROJECTS.map((p) => {
      const adrs = p.decisions.map((d) => `  * ${d.id}: ${d.title} (Context: ${d.context} -> Decision: ${d.decision} -> Consequences: ${d.consequences})`).join('\n');
      const files = p.files.map((f) => `  * ${f.path} (${f.type})`).join('\n');
      return `PROJECT: ${p.name} (ID: ${p.id}, Version: ${p.currentVersionId}, Status: ${p.status})\nArchitecture Summary: ${p.architectureSummary}\nQuickstart Runbook: ${p.quickstartGuide}\nDecisions:\n${adrs}\nFiles:\n${files}\n`;
    }).join('\n---\n');

    const handoffsContext = INITIAL_HANDOFFS.map((h) => {
      return `HANDOFF ${h.id}: Project ${h.projectName} (Status: ${h.status})\nExecutive Summary: ${h.briefing.executiveSummary}\nCritical Blockers: ${h.briefing.criticalBlockers.join('; ')}\nRunbook Commands: ${h.briefing.runbookCommands.join('; ')}\nNext Steps: ${h.briefing.nextSteps.join('; ')}\n`;
    }).join('\n---\n');

    const systemPrompt = `You are CONTINUITY Terminal AI, an enterprise systems intelligence agent.
Your mission is to help engineers navigating shifts, developer rotations, and project transitions understand system invariants, trade-offs, runbook commands, and architectural decisions.

Available Engineering Context:
=== PROJECTS ===
${projectsContext}

=== HANDOFF DOSSIERS ===
${handoffsContext}

Guidelines:
1. Always ground your explanations in the explicit decisions, ADRs, and runbooks provided.
2. When mentioning architectural choices, cite the exact ADR ID (e.g. [ADR-041: Speculative Read Barriers], [ADR-039: io_uring WAL Disk Flush]).
3. Provide exact, copy-pasteable runbook commands where applicable.
4. Highlight critical blockers, failure modes, or recovery protocols if relevant.
5. Use clean markdown formatting with concise engineering tone (no filler or marketing speak).`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return smart grounded fallback when API key is not present in local dev
      return NextResponse.json({
        response: generateFallbackResponse(query, activeProjectId),
        model: 'local-knowledge-engine',
        citations: ['ADR-041', 'HO-2026-089', 'src/consensus/raft_state.rs'],
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `User Query: ${query}\nActive Project Focus: ${activeProjectId || 'All projects'}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });

    const text = response.text || 'No response generated from analysis.';

    // Extract citations
    const citations: string[] = [];
    if (text.includes('ADR-041')) citations.push('ADR-041');
    if (text.includes('ADR-039')) citations.push('ADR-039');
    if (text.includes('ADR-038')) citations.push('ADR-038');
    if (text.includes('HO-2026-089')) citations.push('HO-2026-089');
    if (text.includes('apollo-core')) citations.push('apollo-core');
    if (text.includes('sentinel-gateway')) citations.push('sentinel-gateway');

    return NextResponse.json({
      response: text,
      model: 'gemini-3.8-flash',
      citations,
    });
  } catch (error) {
    console.error('AI assistant error:', error);
    return NextResponse.json({
      response: generateFallbackResponse('general_fallback'),
      model: 'fallback-cache',
      citations: ['ADR-041', 'HO-2026-089'],
    });
  }
}

function generateFallbackResponse(query: string, activeProjectId?: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('apollo') || lower.includes('adr-041') || lower.includes('read barrier') || activeProjectId === 'apollo-core') {
    return `### Apollo Core Analysis & Verification Status

**Target Component**: Apollo Core Distributed Consensus (Version \`v2.4.0\`, Commit \`a9f82c1\`)
**Current Transfer Status**: [HO-2026-089] Pending review by Jessica Chauhan

#### 1. Architectural Foundations
* **[ADR-041: Speculative Read Barriers]**: Introduced monotonic read-lease epochs (150ms heartbeats) verified locally on followers using Chrony NTP drift bounds. Eliminates the leader round-trip latency, boosting read throughput by **310%**.
* **[ADR-039: io_uring WAL Flush]**: Replaced POSIX synchronous \`fsync\` threads with Linux \`io_uring\` kernel rings (\`src/wal/journal_uring.rs\`). P99 flush latency is now **1.18ms**.

#### 2. Critical Blockers & Action Items
* **Kernel Compatibility**: Staging node \`apollo-staging-04\` requires \`ulimit -l unlimited\` for kernel 6.1 memory locked buffers.
* **Chaos Mesh Validation**: Run a 4-node partition test before promoting to production.

#### 3. Runbook Execution
\`\`\`bash
# Check leader lease epoch status
./bin/apollo-ctl status --endpoint http://10.0.1.10:9090

# Assert linearizable read barriers under load
./bin/apollo-verify --cluster-id 0x9F4 --verify-linearizability
\`\`\``;
  }

  if (lower.includes('rollback') || lower.includes('runbook') || lower.includes('command')) {
    return `### Standard Emergency Shift Runbook & Rollback Protocol

#### Step 1: Health State Verification
\`\`\`bash
# Probe consensus index and uncommitted WAL entries
./bin/apollo-ctl cluster status --json | jq '.nodes[] | {id, state, commit_index}'
\`\`\`

#### Step 2: Graceful Leader Stepdown
\`\`\`bash
# Trigger stepdown with 15s election guardrail
./bin/apollo-ctl node stepdown --node-id 1 --timeout 15s
\`\`\`

#### Step 3: Kernel io_uring Diagnostics
\`\`\`bash
# Monitor queue dropouts and completion events
sudo bpftrace -e 'tracepoint:io_uring:io_uring_submit { @count = count(); }'
\`\`\`

All actions are logged to the tamper-evident audit ledger (\`Chronos [AUDIT-8910]\`).`;
  }

  return `### CONTINUITY Knowledge Synthesizer

**Context Analyzed**: 5 Repositories, 8 Architectural Decision Records (ADRs), 5 Handoff Packages.

* **Pending Attentions**: Handoff **[HO-2026-089]** (Apollo Core v2.4.0) is awaiting acceptance by Jessica Chauhan. Key changes include **[ADR-041]** (Speculative Read Barriers) and **[ADR-039]** (io_uring Async Journal).
* **Security Guardrails**: Sentinel Zero-Trust Mesh (**[ADR-035]**) enforces automated SPIRE certificate rotation every 60 minutes across internal ingress proxies.
* **Audit Integrity**: Cryptographic chain verified back to genesis epoch with zero hash drift.`;
}
